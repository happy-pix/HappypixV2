// ============================================================
// Booth (Electron / kiosk) API — v2 contract.
//
// Fixes covered here:
//   #2/#74/#75  suspended or banned organizations cannot keep operating;
//               the booth hears about it on every heartbeat
//   #57         deleted devices are rejected (410) so cached config dies
//   #69–#73     full booth configuration: org name + logo, event logos,
//               tagline, real booth timeout, layout prices (event → org →
//               platform), UPI id, payout mode, payment display name,
//               print limits — refreshed only when `revision` changes
//   #76–#81     heartbeat sends/accepts only changed hardware fields and
//               distinguishes network failure from banned/suspended/
//               deleted/blocked/unpaired states
//   #103–#107   payment config comes from CRM settings, free checkout
//               passes the complete quote object
//   #60/#61     gallery consent captured at session completion
// ============================================================

import express from 'express';
import crypto from 'crypto';

import Device from '../models/Device.js';
import Organization from '../models/Organization.js';
import OrganizationDefaults from '../models/OrganizationDefaults.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Template from '../models/Template.js';
import Payment from '../models/Payment.js';
import Photo from '../models/Photo.js';
import Coupon from '../models/Coupon.js';

import { softDeviceAuth, authenticateDevice } from '../middleware/deviceAuth.js';
import { asyncRoute, badRequest, conflict, forbidden, notFound } from '../utils/httpError.js';
import { writeAudit } from '../utils/auditLogger.js';
import {
  buildBoothSnapshot, mergeHardware, boothStateFor, computeRevision, BOOTH_STATES,
} from '../services/boothSnapshotService.js';
import { getGallerySettings, photoVisibleInGallery } from '../services/gallerySettingsService.js';
import { applyCoupon } from '../services/couponService.js';
import { resolveLayoutPrices, layoutMeta } from '../config/layouts.js';
import { orgLimits, assertDeviceLimit, computePlanStatus } from '../services/planService.js';
import { computeEventStatus } from '../services/eventService.js';

const router = express.Router();

const PLATFORM_FALLBACK_UPI = process.env.HAPPYPIX_UPI_ID || 'happypix@upi';

// ─── helpers ───────────────────────────────────────────────────

async function defaultsFor(organizationId) {
  return OrganizationDefaults.findOne({ organizationId }).lean();
}

/** Every booth response carries a machine-readable state (issue #80/#81). */
function stateEnvelope(state, extra = {}) {
  return { state, serverTime: new Date().toISOString(), ...extra };
}

function failureStatus(state) {
  switch (state) {
    case BOOTH_STATES.DEVICE_DELETED: return 410;
    case BOOTH_STATES.DEVICE_BLOCKED: return 403;
    case BOOTH_STATES.BANNED: return 403;
    case BOOTH_STATES.UNPAIRED: return 401;
    default: return 403;
  }
}

/** Device must be active and the org must not be suspended/banned. */
async function requireOperationalBooth(req) {
  const { device, organization } = req;
  const state = boothStateFor({ device, organization });
  if (state !== BOOTH_STATES.ACTIVE) {
    const error = new Error(
      state === BOOTH_STATES.SUSPENDED
        ? 'This organization is suspended. The booth is locked until it is restored.'
        : state === BOOTH_STATES.BANNED
          ? 'This organization has been banned. Contact HappyPix support.'
          : 'This booth can no longer operate. Re-pair it from the booth app.',
    );
    error.status = failureStatus(state);
    error.code = state;
    throw error;
  }
  const subscription = await mongooseSubscription(organization._id);
  const planStatus = computePlanStatus(organization, subscription);
  if (planStatus === 'expired') {
    const error = new Error('The organization subscription has expired. The booth is locked until it is renewed.');
    error.status = 402;
    error.code = 'PLAN_EXPIRED';
    throw error;
  }
  return { device, organization };
}

async function mongooseSubscription(organizationId) {
  const { default: Subscription } = await import('../models/Subscription.js');
  return Subscription.findOne({ organizationId }).sort({ createdAt: -1 }).lean();
}

async function loadAssignedEvent(device) {
  if (!device.assignedEventId) return null;
  return Event.findById(device.assignedEventId).populate('templateIds');
}

/** Build a fresh snapshot for a device (used by bootstrap + revision changes). */
async function snapshotFor(device, organization) {
  const event = await loadAssignedEvent(device);
  return buildBoothSnapshot({ device, organization, event });
}

// ================================================================
// PAIRING
// ================================================================

router.post('/login', asyncRoute(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const deviceUuid = String(req.body.deviceUuid || '').trim();
  if (!email || !password || !deviceUuid) {
    throw badRequest('Email, password and deviceUuid are required.', 'BAD_PAIRING');
  }

  const user = await User.findOne({ email, role: { $in: ['ORG_ADMIN', 'ORG_MANAGER'] } });
  if (!user || !(await user.comparePassword(password))) {
    throw forbidden('Invalid organization credentials.', 'INVALID_CREDENTIALS');
  }
  if (user.status !== 'active') throw forbidden('This account is deactivated.', 'ACCOUNT_DEACTIVATED');

  const organization = await Organization.findById(user.organizationId);
  if (!organization) throw forbidden('Organization not found. Contact support.', 'ORG_MISSING');

  const state = boothStateFor({ device: { status: 'active' }, organization });
  if (state === BOOTH_STATES.BANNED) {
    throw forbidden('This organization has been banned. Contact HappyPix support.', BOOTH_STATES.BANNED);
  }
  if (state === BOOTH_STATES.SUSPENDED) {
    throw forbidden('This organization is suspended — booths are locked until it is restored.', BOOTH_STATES.SUSPENDED);
  }

  let device = await Device.findOne({ deviceUuid, organizationId: organization._id });
  if (device && (device.status === 'blocked' || device.status === 'inactive')) {
    throw forbidden('This booth has been blocked by an administrator.', BOOTH_STATES.DEVICE_BLOCKED);
  }
  if (!device) {
    // Issue #55: pairing a new booth counts against the plan's device limit.
    const used = await Device.countDocuments({ organizationId: organization._id });
    await assertDeviceLimit(organization, used);
    device = await Device.create({
      organizationId: organization._id,
      deviceUuid,
      deviceName: String(req.body.deviceName || 'HappyPix Booth').slice(0, 60),
      location: (req.body.location && (req.body.location.label || req.body.location)) || '',
      deviceToken: Device.generateToken(),
      platform: req.body.platform || null,
      appVersion: req.body.appVersion || null,
      status: 'active',
      lastSeenAt: new Date(),
    });
    await writeAudit({
      actorId: user._id, actorName: user.name, actorRole: user.role,
      organizationId: organization._id,
      action: 'device.paired', entity: 'device',
      ip: req.ip,
      summary: `Booth “${device.deviceName}” paired (${device.deviceUuid.slice(0, 8)}…)`,
    });
  } else {
    // Re-pairing rotates the token — old cached credentials stop working.
    device.deviceToken = Device.generateToken();
    device.platform = req.body.platform || device.platform;
    device.appVersion = req.body.appVersion || device.appVersion;
    device.lastSeenAt = new Date();
    await device.save();
  }

  const snapshot = await snapshotFor(device, organization);
  res.json({
    installation: {
      deviceUuid: device.deviceUuid,
      deviceToken: device.deviceToken,
      deviceId: String(device._id),
      organizationId: String(organization._id),
      pairedAt: new Date().toISOString(),
      locationLabel: device.location || '',
    },
    snapshot,
    state: BOOTH_STATES.ACTIVE,
  });
}));

// ================================================================
// CONFIG / BOOTSTRAP  (#69–#73)
// ================================================================

/**
 * Soft auth so a blocked/suspended booth still learns *why* it is blocked
 * (issue #81) instead of silently running from stale cache (issue #75).
 */
router.get('/bootstrap', softDeviceAuth, asyncRoute(async (req, res) => {
  const auth = req.deviceAuth;
  if (!req.device || auth.state !== BOOTH_STATES.ACTIVE) {
    if (auth.state === BOOTH_STATES.SUSPENDED && req.device && req.organization) {
      const snapshot = await snapshotFor(req.device, req.organization);
      return res.json(stateEnvelope(BOOTH_STATES.SUSPENDED, {
        message: 'This organization is suspended. The booth is locked until HappyPix restores it.',
        snapshot: { ...snapshot, event: null, suspendReason: req.organization.suspendReason || null },
      }));
    }
    return res.status(failureStatus(auth.state)).json(stateEnvelope(auth.state, { error: auth.message }));
  }

  const snapshot = await snapshotFor(req.device, req.organization);
  res.json(stateEnvelope(BOOTH_STATES.ACTIVE, snapshot));
}));

/** Same payload as /bootstrap — used for end-to-end config tests (issue #60). */
router.get('/config', softDeviceAuth, asyncRoute(async (req, res) => {
  if (!req.device || req.deviceAuth.state !== BOOTH_STATES.ACTIVE) {
    return res.status(failureStatus(req.deviceAuth.state)).json(stateEnvelope(req.deviceAuth.state, { error: req.deviceAuth.message }));
  }
  res.json(await snapshotFor(req.device, req.organization));
}));

/** Revision-only probe — lets a client check cheaply whether it must refresh. */
router.get('/revision', authenticateDevice, asyncRoute(async (req, res) => {
  const snapshot = await snapshotFor(req.device, req.organization);
  res.json({ revision: snapshot.revision, serverTime: snapshot.serverTime });
}));

// ================================================================
// HEARTBEAT  (#76–#81)
// ================================================================

router.post('/heartbeat', softDeviceAuth, asyncRoute(async (req, res) => {
  const auth = req.deviceAuth;

  // The booth reports "I could not reach the server" itself — never here.
  if (!req.device || auth.state !== BOOTH_STATES.ACTIVE) {
    if (auth.state === BOOTH_STATES.SUSPENDED && req.device && req.organization) {
      return res.json(stateEnvelope(BOOTH_STATES.SUSPENDED, {
        changed: false,
        message: 'This organization is suspended. The booth is locked.',
        // Issue #74/#75: the booth must drop its cached operating snapshot.
        invalidateCache: true,
        snapshot: null,
      }));
    }
    return res.status(failureStatus(auth.state)).json(stateEnvelope(auth.state, {
      changed: false,
      invalidateCache: true,
      error: auth.message,
    }));
  }

  const device = req.device;
  const organization = req.organization;

  // Issues #76/#77: only the fields the booth actually marked as changed.
  const hardwarePatch = req.body && req.body.hardwarePatch ? req.body.hardwarePatch : (req.body && req.body.hardware) || {};
  const { telemetry, connections, changed: hardwareChanged } = mergeHardware(device, hardwarePatch);
  if (hardwareChanged.telemetry || hardwareChanged.connections) {
    device.telemetry = telemetry;
    device.connections = connections;
  }
  device.lastSeenAt = new Date();
  device.ipAddress = req.ip || null;
  device.userAgent = req.headers['user-agent'] || null;
  if (req.body && req.body.appVersion) device.appVersion = String(req.body.appVersion).slice(0, 40);
  if (req.body && req.body.platform) device.platform = String(req.body.platform).slice(0, 40);
  await device.save();

  // Issues #79/#72: compare revisions, return a snapshot only when it differs.
  const knownRevision = req.body && req.body.knownRevision ? String(req.body.knownRevision) : null;
  const snapshot = await snapshotFor(device, organization);
  const changed = snapshot.revision !== knownRevision;

  await writeAudit({
    organizationId: organization._id, actorId: null, actorName: 'Booth',
    action: 'booth.heartbeat', entity: 'device',
    summary: `${device.deviceName} heartbeat${changed ? ' (configuration changed)' : ''}`,
  });

  res.json(stateEnvelope(BOOTH_STATES.ACTIVE, {
    changed,
    snapshot: changed ? snapshot : null,
    revision: snapshot.revision,
    hardware: { telemetry, connections, accepted: hardwareChanged },
    // The booth stops normal operation when this ever becomes false.
    canOperate: true,
  }));
}));

// ================================================================
// CHECKOUT  (#103–#107, #44)
// ================================================================

router.post('/checkout/quote', authenticateDevice, asyncRoute(async (req, res) => {
  const { device, organization } = await requireOperationalBooth(req);
  const prints = Math.max(1, Math.min(50, parseInt(req.body.prints, 10) || 1));
  const eventId = req.body.eventId || (device.assignedEventId ? String(device.assignedEventId) : null);
  if (!eventId) throw conflict('No event is assigned to this booth.', 'NO_EVENT');

  const event = await Event.findOne({ _id: eventId, organizationId: organization._id }).populate('templateIds');
  if (!event) throw notFound('Event not found.', 'EVENT_NOT_FOUND');
  const status = computeEventStatus(event);
  if (status !== 'active') throw conflict('This event is not running right now.', 'EVENT_NOT_LIVE');

  const templateId = req.body.templateId ? String(req.body.templateId) : null;
  const allowed = (event.templateIds || []).filter((template) => template && template.active !== false);
  const template = templateId
    ? allowed.find((row) => String(row._id) === templateId)
    : req.body.layoutId
      ? allowed.find((row) => row.layoutId === req.body.layoutId)
      : null;
  if (!template) throw badRequest('This template is no longer available for the event.', 'TEMPLATE_UNAVAILABLE');
  if (req.body.layoutId && template.layoutId !== req.body.layoutId) {
    throw badRequest('Template and layout do not match.', 'LAYOUT_MISMATCH');
  }

  const defaults = await defaultsFor(organization._id);
  // Issue #50: event → organization defaults → platform suggested prices.
  const prices = resolveLayoutPrices({ eventPrices: event.layoutPrices, orgPrices: defaults && defaults.layoutPrices });
  const meta = layoutMeta(template.layoutId);
  const unitPrice = Number(prices[meta.priceKey] ?? 0);

  const gross = unitPrice * prints;
  let discount = 0;
  let couponMessage = null;
  let validCoupon = null;

  if (req.body.couponCode) {
    const coupon = await Coupon.findOne({
      organizationId: organization._id,
      code: String(req.body.couponCode).trim().toUpperCase(),
    });
    const result = applyCoupon(coupon, { gross, eventId });
    if (!result.ok) throw badRequest(result.message, 'COUPON_INVALID');
    discount = result.discount;
    couponMessage = result.message;
    validCoupon = result.coupon.code;
  }

  const payoutMode = defaults && defaults.payoutMode === 'upi' ? 'upi' : 'wallet';
  const finalAmount = Math.max(0, gross - discount);

  res.json({
    quoteId: `quote-${crypto.randomUUID()}`,
    unitPrice,
    prints,
    gross,
    discount,
    finalAmount,
    couponCode: validCoupon,
    couponMessage,
    settlement: payoutMode,
    currency: 'INR',
    layoutId: meta.id,
    priceKey: meta.priceKey,
    templateId: String(template._id),
    eventId: String(event._id),
    deviceId: String(device._id),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
}));

<<<<<<< HEAD
    const payment = new Payment({
      organizationId: req.organization._id,
      eventId: req.device.assignedEventId,
      razorpayOrderId: paymentId,
      amount: quote.finalAmount,
      currency: 'INR',
      printCount: quote.prints,
      digitalCopy: true,
      couponCode: quote.couponCode,
      discountApplied: quote.discount,
      status: 'created' // changed to match Payment schema enum
    });
    await payment.save();

    res.json({
      paymentId: payment._id.toString(),
      amount: quote.finalAmount,
      qrPayload,
      status: 'created'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment' });
  }
});
=======
/**
 * Issues #105/#106: the QR is built from the real organization settings —
 * UPI id, display name, payout mode. Demo values are only ever used when the
 * organization has configured nothing at all.
 */
router.post('/payments', authenticateDevice, asyncRoute(async (req, res) => {
  const { device, organization } = await requireOperationalBooth(req);
  const quote = req.body && req.body.quote;
  if (!quote || quote.finalAmount === undefined) throw badRequest('A complete quote is required.', 'QUOTE_REQUIRED');
  const amount = Math.round(Number(quote.finalAmount) || 0);
  if (amount <= 0) throw conflict('Free checkouts must use the free completion endpoint.', 'FREE_CHECKOUT');

  const defaults = await defaultsFor(organization._id);
  const payoutMode = defaults && defaults.payoutMode === 'upi' ? 'upi' : 'wallet';
  const payeeUpi = payoutMode === 'upi' && defaults && defaults.upiId ? defaults.upiId : PLATFORM_FALLBACK_UPI;
  const payeeName = (defaults && defaults.paymentDisplayName) || `${organization.name} · HappyPix`;
>>>>>>> da8778693eefab0dae2f5c9c8390bb1c42c5c51a

  const payment = await Payment.create({
    organizationId: organization._id,
    eventId: quote.eventId || device.assignedEventId || null,
    deviceId: device._id,
    sessionId: quote.sessionId || null,
    razorpayOrderId: `booth_${crypto.randomUUID()}`,
    amount,
    currency: 'INR',
    printCount: Math.max(1, Number(quote.prints) || 1),
    digitalCopy: quote.digitalCopy !== false,
    couponCode: quote.couponCode || null,
    discountApplied: Number(quote.discount) || 0,
    settlement: payoutMode,
    status: 'pending',
  });

  const qrPayload = `upi://pay?pa=${encodeURIComponent(payeeUpi)}&pn=${encodeURIComponent(payeeName)}`
    + `&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(String(payment._id))}`;

  res.status(201).json({
    paymentId: String(payment._id),
    amount,
    qrPayload,
    upiId: payeeUpi,
    payeeName,
    settlement: payoutMode,
    status: 'pending',
  });
}));

router.get('/payments/:id', authenticateDevice, asyncRoute(async (req, res) => {
  const { organization } = await requireOperationalBooth(req);
  const payment = await Payment.findOne({ _id: req.params.id, organizationId: organization._id });
  if (!payment) throw notFound('Payment not found.', 'PAYMENT_NOT_FOUND');

  // Sandbox/demo builds may auto-confirm; production waits for the webhook.
  const autoConfirm = String(process.env.BOOTH_AUTO_CONFIRM_PAYMENTS || '').toLowerCase() === 'true';
  if (autoConfirm && payment.status !== 'paid' && payment.status !== 'failed') {
    const ageMs = Date.now() - new Date(payment.createdAt).getTime();
    if (ageMs > 6500) {
      payment.status = 'paid';
      payment.paidAt = new Date();
      await payment.save();
    }
  }
  res.json({ status: payment.status === 'created' ? 'pending' : payment.status, settlement: payment.settlement });
}));

/** Webhook/callback helper for a real gateway (bank UTR or Razorpay id). */
router.post('/payments/:id/confirm', authenticateDevice, asyncRoute(async (req, res) => {
  const { organization } = await requireOperationalBooth(req);
  const payment = await Payment.findOne({ _id: req.params.id, organizationId: organization._id });
  if (!payment) throw notFound('Payment not found.', 'PAYMENT_NOT_FOUND');
  payment.status = 'paid';
  payment.paidAt = new Date();
  if (req.body && req.body.utr) payment.utr = String(req.body.utr).slice(0, 64);
  await payment.save();
  res.json({ ok: true, status: payment.status });
}));

/** Issue #107: the booth passes the complete quote object. */
router.post('/checkout/free-complete', authenticateDevice, asyncRoute(async (req, res) => {
  const { device, organization } = await requireOperationalBooth(req);
  const quote = req.body && req.body.quote;
  if (!quote || typeof quote !== 'object') {
    throw badRequest('The complete quote object is required to complete a free checkout.', 'QUOTE_REQUIRED');
  }
  const amount = Math.round(Number(quote.finalAmount) || 0);

  const payment = await Payment.create({
    organizationId: organization._id,
    eventId: quote.eventId || device.assignedEventId || null,
    deviceId: device._id,
    sessionId: quote.sessionId || null,
    razorpayOrderId: `free_${crypto.randomUUID()}`,
    amount,
    currency: 'INR',
    printCount: Math.max(1, Number(quote.prints) || 1),
    digitalCopy: quote.digitalCopy !== false,
    couponCode: quote.couponCode || null,
    discountApplied: Number(quote.discount) || 0,
    settlement: 'wallet',
    status: 'paid',
    paidAt: new Date(),
  });

  res.json({ success: true, paymentId: String(payment._id), amount: payment.amount, printCount: payment.printCount });
}));

// ================================================================
// SESSION COMPLETION + GALLERY CONSENT  (#60, #61, #18)
// ================================================================

router.post('/sessions/complete', authenticateDevice, asyncRoute(async (req, res) => {
  const { device, organization } = await requireOperationalBooth(req);
  const sessionId = String(req.body.sessionId || '').trim();
  if (!sessionId) throw badRequest('sessionId is required.', 'BAD_SESSION');
  const digitalCopy = req.body.digitalCopy !== false;

  device.telemetry = device.telemetry || {};
  device.telemetry.prints = (Number(device.telemetry.prints) || 0) + 1;
  device.telemetry.updatedAt = new Date();
  await device.save();

  const settings = await getGallerySettings();
  const consent = req.body.guestConsent === true || (req.body.consent && req.body.consent.publish === true);
  const eventId = req.body.eventId || device.assignedEventId || null;
  const submitted = Array.isArray(req.body.photos) ? req.body.photos.slice(0, 40) : [];

  const stored = [];
  for (const photo of submitted) {
    const url = typeof photo === 'string' ? photo : photo && (photo.url || photo.dataUrl);
    if (!url) continue;
    const record = await Photo.create({
      organizationId: organization._id,
      eventId,
      deviceId: device._id,
      url: String(url).slice(0, 500000),
      sessionId,
      guestConsent: consent,
      generatedAt: new Date(),
      finalised: true,
    });
    if (photoVisibleInGallery(record, settings)) stored.push(String(record._id));
  }

  await writeAudit({
    organizationId: organization._id, actorId: null, actorName: 'Booth',
    action: 'booth.session.completed', entity: 'session',
    summary: `Session ${sessionId} completed on ${device.deviceName}${settings.requireGuestConsent ? ` — guest consent ${consent ? 'given' : 'not given'}` : ''}`,
  });

  res.json({
    shareUrl: digitalCopy ? `${process.env.PUBLIC_SHARE_BASE || 'https://happypix.in/share'}/${encodeURIComponent(sessionId)}` : null,
    galleryEnabled: settings.galleryEnabled,
    requireGuestConsent: settings.requireGuestConsent,
    guestConsent: consent,
    galleryPhotoIds: stored,
  });
}));

/** Explicit consent endpoint for booths that ask before finishing. */
router.post('/sessions/consent', authenticateDevice, asyncRoute(async (req, res) => {
  const { device, organization } = await requireOperationalBooth(req);
  const sessionId = String(req.body.sessionId || '').trim();
  if (!sessionId) throw badRequest('sessionId is required.', 'BAD_SESSION');
  const consent = req.body.allow === true;
  const result = await Photo.updateMany({ organizationId: organization._id, sessionId }, { $set: { guestConsent: consent } });
  const settings = await getGallerySettings();
  res.json({
    ok: true,
    updated: result.modifiedCount || 0,
    guestConsent: consent,
    galleryEnabled: settings.galleryEnabled,
    requireGuestConsent: settings.requireGuestConsent,
    visibleInGallery: settings.galleryEnabled && (!settings.requireGuestConsent || consent),
    device: String(device._id),
  });
}));

export default router;

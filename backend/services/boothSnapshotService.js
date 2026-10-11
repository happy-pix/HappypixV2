// ============================================================
// Booth snapshot builder (Electron issues #62–#75, CRM #45–#50).
//
// ONE place decides what a booth knows:
//   • organization name + logo            • event logos (deduplicated)
//   • tagline                             • booth timeout (real, not 90s)
//   • layout prices (event → org → platform fallback chain)
//   • UPI id / payout mode / payment display name / print limits
//   • platform gallery policy + guest consent requirement
//   • a content `revision` so the booth only refreshes when something
//     actually changed (issue #72/#79)
// ============================================================

import crypto from 'crypto';
import { layoutMeta, resolveLayoutPrices, suggestedPriceMap, parseLayoutId } from '../config/layouts.js';
import { getGallerySettings, photoVisibleInGallery } from './gallerySettingsService.js';
import Photo from '../models/Photo.js';
import OrganizationDefaults from '../models/OrganizationDefaults.js';

export const BOOTH_TIMEOUT_DEFAULT = 60;
export const MAX_PRINTS_DEFAULT = 10;

/**
 * Issue #58/#59/#67: logos are compared case/whitespace-insensitively and
 * de-duplicated before rendering or storing, so an event logo can never be
 * added twice.
 */
export function dedupeLogos(list = []) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const url = typeof item === 'string' ? item.trim() : String(item && item.url ? item.url : '').trim();
    if (!url) continue;
    const fingerprint = url.toLowerCase();
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);
    out.push(url);
  }
  return out;
}

/** Organization/event branding layers, never duplicated, always orderable. */
export function buildBranding(organization = {}, event = null) {
  const happyPix = { kind: 'happypix', url: '/brand/happypix-logo.svg', alwaysVisible: true };
  const orgLogos = dedupeLogos([organization.logoUrl, organization.brandLogoUrl]);
  const eventLogos = dedupeLogos([
    ...(event && event.branding ? event.branding.logos || [] : []),
    event && event.branding ? event.branding.logoUrl : null,
  ]);
  // An event logo that is really the organization logo appears once.
  const orgFingerprints = new Set(orgLogos.map((url) => url.toLowerCase()));
  const uniqueEventLogos = eventLogos.filter((url) => !orgFingerprints.has(url.toLowerCase()));
  return {
    // Issue #62/#63/#64: both layers available at the same time.
    platform: happyPix,
    organization: {
      name: organization.name || 'HappyPix Organization',
      logo: orgLogos[0] || null,
      logos: orgLogos,
      tagline: (organization.brandTagline || '').trim() || null,
    },
    event: {
      logos: uniqueEventLogos,
      logo: uniqueEventLogos[0] || null,
      tagline: (event && event.branding ? String(event.branding.tagline || '').trim() : '') || null,
    },
    // Issue #66: the booth falls back to HappyPix branding cleanly.
    fallback: happyPix.url,
  };
}

/** Templates the event allows, in booth shape, with true print geometry. */
export function mapTemplates(templates = []) {
  return templates
    .filter((template) => template && template.active !== false)
    .map((template) => {
      const layoutId = template.layoutId || '46-v1';
      const meta = layoutMeta(layoutId);
      return {
        id: String(template._id || template.id),
        name: template.name,
        category: template.category || 'Custom',
        description: template.description || '',
        source: template.source || 'playground',
        componentId: template.componentId || null,
        active: template.active !== false,
        layout: {
          id: meta.id,
          familyId: meta.familyId,
          label: `${meta.printSize} · ${meta.slots} photo${meta.slots === 1 ? '' : 's'}`,
          printSize: meta.printSize,
          sheetSize: meta.printSize,
          orientation: meta.orientation,
          slots: meta.slots,
          canvas: meta.canvas,
          photoSlots: template.photoSlots && template.photoSlots.length
            ? template.photoSlots
            : autoSlots(meta, template),
        },
        design: normalizeDesign(template.design, template),
      };
    });
}

function normalizeDesign(design, template) {
  const fallback = {
    background: { type: 'solid', colors: ['#ffffff'] },
    accent: '#ff4f9a',
    textColor: '#251530',
    ornament: 'none',
    slotShape: 'square',
    title: template.name || '',
    subtitle: '',
  };
  if (!design || typeof design !== 'object') return fallback;
  let background = design.background || design.bg || fallback.background;
  if (typeof background === 'string') {
    background = background.startsWith('http') || background.startsWith('data:')
      ? { type: 'image', colors: [], url: background }
      : { type: 'solid', colors: [background] };
  } else if (background && !background.type) {
    background = { type: 'solid', colors: background.colors || ['#ffffff'] };
  }
  return {
    ...fallback,
    ...design,
    background,
    accent: design.accent || fallback.accent,
    textColor: design.textColor || fallback.textColor,
    ornament: design.ornament || 'none',
    slotShape: design.slotShape || 'square',
    title: design.title || template.name || '',
    subtitle: design.subtitle || '',
  };
}

/** Bottom-15% branding footer, grid slots inside the photo area (CRM parity). */
function autoSlots(meta, template) {
  const { canvas, slots } = meta;
  const footer = Math.round(canvas.height * 0.15);
  const width = canvas.width;
  const height = canvas.height - footer;
  const gap = Math.max(10, Math.round(width * 0.022));
  const columns = slots <= 1 ? 1 : slots <= 4 ? 2 : 3;
  const rows = Math.ceil(slots / columns);
  const cellW = (width - gap * (columns - 1)) / columns;
  const cellH = (height - gap * (rows - 1)) / rows;
  const out = [];
  for (let index = 0; index < slots; index += 1) {
    out.push({
      id: `slot-${index + 1}`,
      x: Math.round((index % columns) * (cellW + gap)),
      y: Math.round(Math.floor(index / columns) * (cellH + gap)),
      width: Math.round(cellW),
      height: Math.round(cellH),
    });
  }
  return out;
}

/**
 * Booth settings: every value the booth needs, sourced from the org's
 * defaults — never from hard-coded platform fallbacks when the org has
 * configured something (issues #69–#71, #105, #106).
 */
export function buildSettings({ organization = {}, defaults = null, event = null }) {
  const orgName = organization.name || 'HappyPix';
  const payoutMode = defaults && defaults.payoutMode === 'upi' ? 'upi' : 'wallet';
  const upiId = (defaults && defaults.upiId) || organization.upiId || null;
  const timeoutRaw = defaults && defaults.boothTimeoutSec;
  const timeout = Number.isFinite(Number(timeoutRaw)) && Number(timeoutRaw) >= 10
    ? Number(timeoutRaw)
    : BOOTH_TIMEOUT_DEFAULT;
  const paymentDisplayName = (defaults && defaults.paymentDisplayName)
    || organization.paymentDisplayName
    || `${orgName} · HappyPix`;
  const maximumPrints = Number(defaults && defaults.maximumPrints) > 0
    ? Number(defaults.maximumPrints)
    : MAX_PRINTS_DEFAULT;
  return {
    organizationName: orgName,
    organizationLogo: organization.logoUrl || null,
    tagline: (defaults && defaults.tagline) || organization.brandTagline || null,
    boothTimeoutSec: timeout,
    idleWarningSec: 10,
    payoutMode,
    upiId,
    paymentDisplayName,
    currency: 'INR',
    maximumPrints,
    printOptions: Array.isArray(defaults && defaults.printOptions) && defaults.printOptions.length
      ? defaults.printOptions
      : [1, 2, 4, 6, 8, 10].filter((value) => value <= maximumPrints),
    layoutPrices: resolveLayoutPrices({
      eventPrices: event ? event.layoutPrices : {},
      orgPrices: defaults ? defaults.layoutPrices : {},
    }),
    suggestedPrices: suggestedPriceMap(),
  };
}

/** Stable content hash — the booth refreshes only when this changes. */
export function computeRevision(payload) {
  const stable = JSON.stringify(payload, (key, value) => {
    if (value instanceof Map) return Object.fromEntries(value);
    return value;
  });
  return crypto.createHash('sha1').update(stable).digest('hex').slice(0, 20);
}

async function loadDefaults(organizationId) {
  try {
    return await OrganizationDefaults.findOne({ organizationId }).lean();
  } catch {
    return null;
  }
}

/**
 * Build the complete booth snapshot.
 *
 * @param {object} args
 * @param {object} args.device        Device document/lean object
 * @param {object} args.organization  Organization document/lean object
 * @param {object|null} args.event    Assigned event with populated templateIds
 */
/**
 * Up to three recent photos for the event's Start screen. Only https URLs are
 * sent (stored S3 files). Inline data URLs are never pushed to the booth, and
 * gallery consent rules still apply.
 */
async function recentSamplePhotos(event, organization, gallery) {
  const photos = await Photo.find({
    organizationId: organization._id || organization.id,
    eventId: event._id || event.id,
    url: { $regex: '^https://' },
  }).sort({ generatedAt: -1, createdAt: -1 }).limit(12).lean();
  return photos
    .filter((photo) => photoVisibleInGallery(photo, gallery))
    .slice(0, 3)
    .map((photo) => photo.url);
}

export async function buildBoothSnapshot({ device, organization, event = null }) {
  const defaults = await loadDefaults(organization._id || organization.id);
  const gallery = await getGallerySettings();
  const samplePhotos = event ? await recentSamplePhotos(event, organization, gallery) : [];

  const branding = buildBranding(organization, event);
  const settings = buildSettings({ organization, defaults, event });

  const templates = mapTemplates((event && event.templateIds) || []);
  const eventPayload = event
    ? {
        id: String(event._id || event.id),
        organizationId: String(event.organizationId || organization._id || organization.id),
        name: event.name,
        clientName: event.clientName || '',
        location: event.location || '',
        startDate: toISO(event.startDate),
        endDate: toISO(event.endDate),
        status: storedEventStatus(event),
        digitalCopy: event.digitalCopy !== false,
        filters: (event.filters && event.filters.length ? event.filters : ['original', 'warm', 'cool', 'bw', 'vintage', 'soft', 'party']),
        branding: {
          logos: branding.event.logos,
          tagline: branding.event.tagline || branding.organization.tagline || '',
        },
        layoutPrices: settings.layoutPrices,
        templates,
        samplePhotos,
        revision: '',
        templateContractVersion: 1,
      }
    : null;

  const revision = computeRevision({
    device: { id: String(device._id || device.id), name: device.deviceName, status: device.status },
    organization: { id: String(organization._id || organization.id), name: organization.name, status: organization.status },
    branding,
    settings,
    gallery,
    event: eventPayload && { ...eventPayload, revision: undefined },
  });

  if (eventPayload) eventPayload.revision = revision;

  return {
    device: {
      id: String(device._id || device.id),
      name: device.deviceName || 'Booth',
      uuid: device.deviceUuid,
      assignedEventId: device.assignedEventId ? String(device.assignedEventId) : null,
    },
    organization: {
      id: String(organization._id || organization.id),
      name: organization.name,
      status: organization.status || 'active',
      logoUrl: organization.logoUrl || null,
    },
    event: eventPayload,
    branding,
    settings,
    gallery,
    revision,
    serverTime: new Date().toISOString(),
  };
}

function storedEventStatus(event) {
  if (event.paused) return 'paused';
  const now = Date.now();
  const start = event.startDate ? new Date(event.startDate).getTime() : 0;
  const end = event.endDate ? new Date(event.endDate).getTime() : 0;
  if (start && now < start) return 'upcoming';
  if (end && now > end) return 'finished';
  return 'live';
}

function toISO(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Heartbeat helpers (issues #76–#81). */

// The booth sends only *changed* hardware fields; the server merges them.
export function mergeHardware(device, patch = {}) {
  const previousTelemetry = device.telemetry || {};
  const previousConnections = device.connections || {};
  const telemetry = {
    prints: pickNumber(patch.printsTotal, previousTelemetry.prints, 0, 10_000_000),
    shutters: pickNumber(patch.shutterCount, previousTelemetry.shutters, 0, 10_000_000),
    batteryPct: pickNumber(patch.batteryPct, previousTelemetry.batteryPct, 0, 100),
    updatedAt: new Date(),
  };
  const camera = pickBool(patch.cameraConnected, previousConnections.camera, false);
  const printer = pickBool(patch.printerConnected, previousConnections.printer, false);
  const kioskScreen = pickBool(patch.kioskScreenConnected, previousConnections.kioskScreen, false);
  return {
    telemetry,
    connections: { camera, printer, kioskScreen, updatedAt: new Date() },
    changed: {
      telemetry: JSON.stringify({ ...telemetry, updatedAt: undefined }) !== JSON.stringify({ ...previousTelemetry, updatedAt: undefined }),
      connections: camera !== previousConnections.camera
        || printer !== previousConnections.printer
        || kioskScreen !== previousConnections.kioskScreen,
    },
  };
}

function pickNumber(value, fallback, min, max) {
  if (value === undefined || value === null || value === '') return Number(fallback) || 0;
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return Number(fallback) || 0;
  return Math.max(min, Math.min(max, number));
}

function pickBool(value, fallback, defaultValue) {
  if (value === undefined || value === null) return typeof fallback === 'boolean' ? fallback : defaultValue;
  return value === true || value === 'true';
}

/** Issues #80/#81: what the booth must do with a heartbeat response. */
export const BOOTH_STATES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  DEVICE_DELETED: 'device_deleted',
  DEVICE_BLOCKED: 'device_blocked',
  UNPAIRED: 'unpaired',
};

export function boothStateFor({ device, organization }) {
  if (!device) return BOOTH_STATES.DEVICE_DELETED;
  if (device.status === 'blocked') return BOOTH_STATES.DEVICE_BLOCKED;
  if (device.status === 'inactive') return BOOTH_STATES.DEVICE_BLOCKED;
  if (!organization) return BOOTH_STATES.UNPAIRED;
  if (organization.status === 'banned') return BOOTH_STATES.BANNED;
  if (organization.status === 'suspended') return BOOTH_STATES.SUSPENDED;
  return BOOTH_STATES.ACTIVE;
}

/** A booth may run guest sessions only when the server says active. */
export function boothCanOperate(state) {
  return state === BOOTH_STATES.ACTIVE;
}

export { parseLayoutId };

export default {
  buildBoothSnapshot, buildBranding, buildSettings, dedupeLogos, mapTemplates,
  computeRevision, mergeHardware, boothStateFor, boothCanOperate, BOOTH_STATES,
  BOOTH_TIMEOUT_DEFAULT, MAX_PRINTS_DEFAULT,
};

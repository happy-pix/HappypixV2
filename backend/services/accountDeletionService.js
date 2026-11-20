import mongoose from 'mongoose';

import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Event from '../models/Event.js';
import Device from '../models/Device.js';
import Photo from '../models/Photo.js';
import GuestDownload from '../models/GuestDownload.js';
import PhotoShare from '../models/PhotoShare.js';
import DeliveryRecord from '../models/DeliveryRecord.js';
import Ticket from '../models/Ticket.js';
import SupportTicket from '../models/SupportTicket.js';
import Coupon from '../models/Coupon.js';
import Subscription from '../models/Subscription.js';
import Withdrawal from '../models/Withdrawal.js';
import Setting from '../models/Setting.js';
import OrgAiTemplate from '../models/OrgAiTemplate.js';
import OrganizationDefaults from '../models/OrganizationDefaults.js';
import PlatformSupportRequest from '../models/PlatformSupportRequest.js';
import DeletedRecord from '../models/DeletedRecord.js';
import { badRequest, conflict, notFound, unauthorized } from '../utils/httpError.js';

/**
 * Self-service account deletion.
 *
 * The shape of the promise we make to the operator:
 *
 *   1. They confirm with their password on a public page.
 *   2. Nothing is deleted for seven days. The account is frozen — the
 *      CRM refuses to sign them in — but every record still exists.
 *   3. If they sign in to the CRM during those seven days, the deletion
 *      is cancelled automatically. That is the "stop deletion" path, and
 *      it needs no extra button.
 *   4. On day seven the purge runs: the whole tenant is archived into one
 *      DeletedRecord document, then removed.
 *
 * Payments and audit logs are financial and compliance records and are
 * never deleted. Everything else goes.
 */

export const GRACE_DAYS = 7;

/** Collections that belong to a tenant and must disappear with it. */
const TENANT_MODELS = [
  { name: 'Event', model: Event },
  { name: 'Device', model: Device },
  { name: 'Photo', model: Photo },
  { name: 'GuestDownload', model: GuestDownload },
  { name: 'PhotoShare', model: PhotoShare },
  { name: 'DeliveryRecord', model: DeliveryRecord },
  { name: 'Ticket', model: Ticket },
  { name: 'SupportTicket', model: SupportTicket },
  { name: 'Coupon', model: Coupon },
  { name: 'Subscription', model: Subscription },
  { name: 'Withdrawal', model: Withdrawal },
  { name: 'Setting', model: Setting },
  { name: 'OrgAiTemplate', model: OrgAiTemplate },
  { name: 'OrganizationDefaults', model: OrganizationDefaults },
  { name: 'PlatformSupportRequest', model: PlatformSupportRequest },
];

/**
 * Models deliberately LEFT IN PLACE, and why. Recorded in the archive so
 * a future reader does not mistake this for an oversight.
 */
export const RETAINED_COLLECTIONS = [
  { name: 'Payment', reason: 'Financial record — retained for accounting and tax.' },
  { name: 'AuditLog', reason: 'Compliance record of who did what, including this deletion.' },
];

export function scheduledPurgeFrom(when = new Date()) {
  return new Date(when.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000);
}

/** True while the account is inside its deletion window. */
export function isPendingDeletion(org) {
  return Boolean(org && org.deletionRequestedAt && !org.deletionCancelledAt && !org.deletedAt);
}

/**
 * Request deletion for the organization the user belongs to.
 * Idempotent: asking twice returns the original schedule rather than
 * pushing the date out, so a reload cannot extend the window.
 */
export async function requestDeletion({ email, password, ip = null, userAgent = null }) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !password) {
    throw badRequest('Email and password are required.', 'MISSING_CREDENTIALS');
  }

  const user = await User.findOne({ email: normalized });
  // One generic message for both branches: this page is public, and
  // "no such account" would turn it into an account-enumeration oracle.
  const invalid = unauthorized('Those details do not match an account.', 'INVALID_CREDENTIALS');
  if (!user) throw invalid;
  if (!(await user.comparePassword(password))) throw invalid;

  if (!user.organizationId) {
    throw badRequest(
      'This is a platform account. Platform accounts cannot be deleted from the website — contact support.',
      'PLATFORM_ACCOUNT',
    );
  }
  if (user.role !== 'ORG_ADMIN') {
    throw badRequest(
      'Only the organization owner can delete the organization. Ask your Organization Admin to do this.',
      'NOT_ORG_ADMIN',
    );
  }

  const org = await Organization.findById(user.organizationId);
  if (!org) throw notFound('That organization no longer exists.', 'ORG_MISSING');

  if (org.deletionRequestedAt && !org.deletionCancelledAt) {
    return {
      alreadyPending: true,
      scheduledFor: org.deletionScheduledFor,
      organizationName: org.name,
    };
  }

  const now = new Date();
  org.deletionRequestedAt = now;
  org.deletionScheduledFor = scheduledPurgeFrom(now);
  org.deletionRequestedByUserId = user._id;
  org.deletionRequestedByEmail = user.email;
  org.deletionRequestIp = ip;
  org.deletionRequestUserAgent = String(userAgent || '').slice(0, 300);
  org.deletionCancelledAt = null;
  org.deletionCancelledByUserId = null;
  // Freeze the tenant. `paused` keeps the account intact (with its plan
  // and billing history) while denying every sign-in path.
  org.status = 'paused';
  // Revoke every live CRM and booth session immediately.
  org.sessionVersion = (Number(org.sessionVersion) || 0) + 1;
  await org.save();

  user.sessionVersion = (Number(user.sessionVersion) || 0) + 1;
  await user.save();

  return {
    alreadyPending: false,
    scheduledFor: org.deletionScheduledFor,
    organizationName: org.name,
  };
}

/** Public status lookup, used by the confirmation page and the CRM. */
export async function deletionStatus({ email }) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) throw badRequest('Email is required.', 'MISSING_EMAIL');

  // Resolve through the USER first, because that is the address they sign
  // in with — and the same address `requestDeletion` checks. Falling back
  // to the organization's billing email means an operator who typed the
  // business address still finds their own pending deletion.
  const user = await User.findOne({ email: normalized }).select('organizationId');
  const org = user?.organizationId
    ? await Organization.findById(user.organizationId)
    : await Organization.findOne({ email: normalized });
  if (!org) throw notFound('No account is registered with that email.', 'ORG_MISSING');
  return {
    organizationName: org.name,
    pending: isPendingDeletion(org),
    scheduledFor: isPendingDeletion(org) ? org.deletionScheduledFor : null,
    requestedAt: org.deletionRequestedAt || null,
  };
}

/**
 * The "log in to the CRM to stop it" path. Called from sign-in, so the
 * operator never has to find a separate cancel control.
 */
export async function cancelDeletionViaSignIn(org, userId) {
  if (!isPendingDeletion(org)) return false;
  org.deletionCancelledAt = new Date();
  org.deletionCancelledByUserId = userId || null;
  org.deletionScheduledFor = null;
  // A paused tenant that signs back in is restored to active service.
  if (org.status === 'paused') org.status = 'active';
  org.sessionVersion = (Number(org.sessionVersion) || 0) + 1;
  await org.save();
  return true;
}

/**
 * Everything this tenant owns, as one JSON object. Read-only — this is
 * what the archive stores, so it must be complete before anything is
 * removed.
 */
async function captureTenant(org, users) {
  const orgId = org._id;
  const collections = {};

  for (const { name, model } of TENANT_MODELS) {
    // Tickets and platform support requests carry organizationId but are
    // written by the platform team; they still go with the tenant.
    const docs = await model.find({ organizationId: orgId }).lean();
    collections[name] = docs;
  }

  return {
    capturedAt: new Date().toISOString(),
    // Nested plain objects: the whole point is that this is readable in
    // ten years without the code that wrote it.
    organization: { ...org.toObject() },
    users: users.map((u) => ({ ...u.toObject() })),
    collections,
    counts: Object.fromEntries(Object.entries(collections).map(([k, v]) => [k, v.length])),
    retained: RETAINED_COLLECTIONS,
  };
}

/**
 * Purge one organization: archive, then delete. Safe to re-run — if the
 * archive already exists for this tenant the deletion continues from
 * where it stopped rather than writing a second copy.
 */
export async function purgeOrganization(orgId, { reason = 'inactivity' } = {}) {
  const org = await Organization.findById(orgId);
  if (!org) return { skipped: 'missing' };

  const users = await User.find({ organizationId: org._id });

  const payload = await captureTenant(org, users);

  // Write the archive BEFORE deleting anything. If the archive fails,
  // nothing is destroyed and the cron will retry on its next pass.
  let archive = await DeletedRecord.findOne({ organizationId: org._id, kind: 'organization' });
  if (!archive) {
    archive = await DeletedRecord.create({
      kind: 'organization',
      organizationId: org._id,
      organizationName: org.name,
      organizationEmail: org.email,
      reason,
      requestedAt: org.deletionRequestedAt || new Date(),
      scheduledPurgeAt: org.deletionScheduledFor || null,
      deletedAt: new Date(),
      removed: payload.counts,
      externalMedia: payload.collections.Photo
        ? payload.collections.Photo.map((p) => p.cloudinaryUrl || p.url).filter(Boolean)
        : [],
      payload,
    });
  }

  // Now remove. Order matters only for foreign keys nobody enforces, so
  // leaf collections go first for readability in the archive counts.
  const removed = {};
  for (const { name, model } of TENANT_MODELS) {
    const result = await model.deleteMany({ organizationId: org._id });
    removed[name] = result.deletedCount || 0;
  }

  // Users last: they are the login path into everything above.
  const userResult = await User.deleteMany({ organizationId: org._id });
  removed.User = userResult.deletedCount || 0;

  archive.payload.deletion = {
    deletedAt: new Date().toISOString(),
    removed,
    retained: RETAINED_COLLECTIONS,
  };
  archive.markModified('payload');
  archive.removed = removed;
  await archive.save();

  const orgResult = await Organization.deleteOne({ _id: org._id });

  return { removed, organizationDeleted: orgResult.deletedCount === 1, archiveId: String(archive._id) };
}

/**
 * The hourly sweep: anything past its scheduled purge date goes now.
 * Returns a summary the cron logs, so a silent failure is visible.
 */
export async function purgeDueOrganizations() {
  const now = new Date();
  const due = await Organization.find({
    deletionRequestedAt: { $ne: null },
    deletionScheduledFor: { $lte: now },
    deletionCancelledAt: null,
    deletedAt: null,
  }).select('_id name deletionScheduledFor');

  const results = [];
  for (const org of due) {
    try {
      results.push({ id: String(org._id), name: org.name, ...(await purgeOrganization(org._id)) });
    } catch (error) {
      console.error(`❌ Account deletion failed for ${org.name} (${org._id}):`, error.message);
      results.push({ id: String(org._id), name: org.name, error: error.message });
    }
  }
  return results;
}

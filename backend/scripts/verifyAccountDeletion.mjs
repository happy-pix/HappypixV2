/**
 * End-to-end check for self-service account deletion.
 *
 * This is the one part of the feature that cannot be unit-tested: the
 * purge touches sixteen collections and must archive before it deletes.
 * Run it against a STAGING database — it creates a throwaway organization
 * with one of everything, deletes it, and asserts what survived.
 *
 *   node scripts/verifyAccountDeletion.mjs
 *
 * It refuses to run when NODE_ENV=production. Every document it creates
 * carries the marker `deletion-verify` so a failed run can be cleaned up
 * with:
 *
 *   db.events.deleteMany({ name: 'deletion-verify event' })
 *   … etc, or just drop the staging database.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

import Organization from '../models/Organization.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Device from '../models/Device.js';
import Photo from '../models/Photo.js';
import Coupon from '../models/Coupon.js';
import Setting from '../models/Setting.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import DeletedRecord from '../models/DeletedRecord.js';
import { purgeOrganization, scheduledPurgeFrom, GRACE_DAYS } from '../services/accountDeletionService.js';

const MARK = 'deletion-verify';

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Refusing to run against production (NODE_ENV=production).');
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Point it at a staging database.');
  process.exit(1);
}

const checks = [];
const check = (name, passed, detail = '') => {
  checks.push({ name, passed, detail });
  console.log(`  ${passed ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`\nVerifying account deletion on ${mongoose.connection.name}\n`);

  // ── Build a tenant with one of everything ──────────────────
  const org = await Organization.create({
    name: `${MARK} org`,
    ownerName: 'Verify Owner',
    email: `${MARK}@example.test`,
    status: 'active',
  });
  const owner = await User.create({
    name: 'Verify Owner',
    email: `${MARK}@example.test`,
    password: 'verify-password-123',
    role: 'ORG_ADMIN',
    organizationId: org._id,
  });
  const event = await Event.create({ organizationId: org._id, name: `${MARK} event` });
  await Device.create({ organizationId: org._id, name: `${MARK} device` });
  await Photo.create({ organizationId: org._id, eventId: event._id, url: 'https://example.test/p.jpg' });
  await Coupon.create({ organizationId: org._id, code: 'VERIFY10', type: 'percentage', value: 10 });
  await Setting.create({ organizationId: org._id, key: MARK, value: 'kept-in-archive' });
  // These two must SURVIVE.
  await Payment.create({ organizationId: org._id, amount: 100, currency: 'INR', status: 'captured' });
  await AuditLog.create({
    organizationId: org._id,
    action: 'verify.seed',
    entity: 'organization',
    summary: 'seed record for the deletion verification',
  });

  // ── Schedule and fast-forward ──────────────────────────────
  const requested = new Date();
  org.deletionRequestedAt = requested;
  org.deletionScheduledFor = scheduledPurgeFrom(requested);
  org.status = 'paused';
  await org.save();

  const daysOut = (org.deletionScheduledFor - requested) / (24 * 60 * 60 * 1000);
  check(`the window is ${GRACE_DAYS} days`, Math.round(daysOut) === GRACE_DAYS, `${daysOut} days`);

  // ── Purge ──────────────────────────────────────────────────
  const result = await purgeOrganization(org._id, { reason: 'self_service' });
  console.log('\n  removed:', JSON.stringify(result.removed));

  // ── What should be gone ────────────────────────────────────
  check('the organization is gone', (await Organization.findById(org._id)) === null);
  check('its users are gone', (await User.countDocuments({ organizationId: org._id })) === 0);
  check('its events are gone', (await Event.countDocuments({ organizationId: org._id })) === 0);
  check('its devices are gone', (await Device.countDocuments({ organizationId: org._id })) === 0);
  check('its photos are gone', (await Photo.countDocuments({ organizationId: org._id })) === 0);

  // ── What must remain ──────────────────────────────────────
  check(
    'payments are retained',
    (await Payment.countDocuments({ organizationId: org._id })) > 0,
    'financial record',
  );
  check(
    'audit logs are retained',
    (await AuditLog.countDocuments({ organizationId: org._id })) > 0,
    'compliance record',
  );

  // ── The archive ───────────────────────────────────────────
  const archive = await DeletedRecord.findOne({ organizationId: org._id });
  check('an archive was written', Boolean(archive));
  if (archive) {
    check(
      'the archive holds the organization itself',
      archive.payload?.organization?.name === `${MARK} org`,
      archive.payload?.organization?.name,
    );
    check(
      'the archive holds its events',
      archive.payload?.collections?.Event?.length === 1,
      `${archive.payload?.collections?.Event?.length ?? 0} event(s)`,
    );
    check(
      'the archive holds its settings, which are deleted everywhere else',
      (archive.payload?.collections?.Setting || []).some((s) => s.key === MARK),
    );
    check('the archive records what was removed', Object.keys(archive.removed || {}).length > 5);
    check('the archive names the retained collections', (archive.payload?.retained || []).length === 2);
    check(
      'the archive holds the owner account that was deleted',
      (archive.payload?.users || []).some((u) => u.email === `${MARK}@example.test`),
    );
  }

  // ── Re-running must not double-archive ────────────────────
  const again = await purgeOrganization(org._id);
  check('a second purge is a no-op', again.skipped === 'missing');

  // ── Clean up the archive this run created ─────────────────
  if (archive) await DeletedRecord.deleteOne({ _id: archive._id });
  await Payment.deleteMany({ organizationId: org._id });
  await AuditLog.deleteMany({ organizationId: org._id });

  const failed = checks.filter((c) => !c.passed);
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
  await mongoose.disconnect();
  process.exit(failed.length ? 1 : 0);
}

main().catch(async (error) => {
  console.error('\n❌ Verification failed:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});

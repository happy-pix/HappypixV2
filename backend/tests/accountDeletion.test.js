// Account deletion is destructive and irreversible, so the parts that can
// fail silently are pinned here: the seven-day window, the state machine
// that decides whether a tenant is still inside it, and — most importantly
// — the guarantee that every tenant-owned collection is either deleted or
// deliberately retained with a written reason.
//
// These run without a database connection. The purge itself is exercised
// against a real Mongo in staging, not here.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  GRACE_DAYS,
  RETAINED_COLLECTIONS,
  isPendingDeletion,
  scheduledPurgeFrom,
} from '../services/accountDeletionService.js';
import Organization from '../models/Organization.js';
import DeletedRecord from '../models/DeletedRecord.js';

const BACKEND = dirname(dirname(fileURLToPath(import.meta.url)));
const DAY = 24 * 60 * 60 * 1000;

test('the notice says seven days, and the promise is seven days', () => {
  assert.equal(GRACE_DAYS, 7);
  const requested = new Date('2026-03-01T09:30:00.000Z');
  const purge = scheduledPurgeFrom(requested);
  assert.equal(purge.getTime() - requested.getTime(), 7 * DAY);
  assert.equal(purge.toISOString(), '2026-03-08T09:30:00.000Z');
});

test('a tenant is inside its deletion window only until it is cancelled', () => {
  const requested = new Date('2026-03-01T00:00:00.000Z');
  const base = { deletionRequestedAt: requested, deletionScheduledFor: scheduledPurgeFrom(requested) };

  // Nothing requested — normal account.
  assert.equal(isPendingDeletion(null), false);
  assert.equal(isPendingDeletion({}), false);

  // Requested and not cancelled: pending.
  assert.equal(isPendingDeletion(base), true);

  // Cancelled by signing in: not pending, even though the dates remain.
  assert.equal(isPendingDeletion({ ...base, deletionCancelledAt: new Date() }), false);

  // Already purged: not pending.
  assert.equal(isPendingDeletion({ ...base, deletedAt: new Date() }), false);
});

test('the organization schema carries the whole state machine', () => {
  const org = new Organization({
    name: 'Nightowl Events',
    ownerName: 'A Person',
    email: 'owner@nightowl.test',
    deletionRequestedAt: new Date(),
    deletionScheduledFor: scheduledPurgeFrom(new Date()),
  });
  assert.equal(org.validateSync(), undefined);
  assert.equal(org.status, 'active');
  assert.equal(org.deletionCancelledAt, null);

  // `paused` is the frozen state a pending deletion puts the tenant in.
  const paused = new Organization({
    name: 'Nightowl Events',
    ownerName: 'A Person',
    email: 'owner@nightowl.test',
    status: 'paused',
  });
  assert.equal(paused.validateSync(), undefined);

  // Anything else is still rejected — this enum is what every auth guard
  // switches on, so it must not silently accept a new word.
  const bad = new Organization({
    name: 'Nightowl Events',
    ownerName: 'A Person',
    email: 'bad@nightowl.test',
    status: 'deleting',
  });
  assert.ok(bad.validateSync());
});

test('an archive cannot be written without the JSON it exists to hold', () => {
  const empty = new DeletedRecord({ kind: 'organization' });
  const error = empty.validateSync();
  assert.ok(error, 'payload must be required');

  const good = new DeletedRecord({
    kind: 'organization',
    organizationName: 'Nightowl Events',
    payload: { organization: { name: 'Nightowl Events' }, collections: { Event: [] } },
  });
  assert.equal(good.validateSync(), undefined);
});

test('every collection holding organizationId is deleted or retained on purpose', () => {
  // This is the test that stops a future model from quietly outliving its
  // tenant: add a schema with organizationId and this fails until you say
  // which side of the line it is on.
  const modelsDir = join(BACKEND, 'models');
  const withOrgId = readdirSync(modelsDir)
    .filter((name) => name.endsWith('.js'))
    .filter((name) => /\borganizationId\b/.test(readFileSync(join(modelsDir, name), 'utf8')))
    .map((name) => name.replace(/\.js$/, ''));

  const source = readFileSync(join(BACKEND, 'services', 'accountDeletionService.js'), 'utf8');
  const deleted = new Set(
    [...source.matchAll(/\{\s*name:\s*'(\w+)',\s*model:\s*(\w+)\s*\}/g)].map((m) => m[2]),
  );
  const retained = new Set(RETAINED_COLLECTIONS.map((entry) => entry.name));

  // User is deleted by name at the end of the purge (see the assertion
  // below), and DeletedRecord is the archive itself — deleting it would
  // destroy the record this whole service exists to keep.
  const handledSeparately = new Set(['User', 'DeletedRecord']);
  const unaccounted = withOrgId.filter(
    (name) => !deleted.has(name) && !retained.has(name) && !handledSeparately.has(name),
  );
  assert.deepEqual(
    unaccounted,
    [],
    `these models carry organizationId but are neither deleted nor retained: ${unaccounted.join(', ')}`,
  );

  // User is handled explicitly (deleted last, after everything it can log
  // in to has gone) rather than through the generic list.
  assert.ok(deleted.has('Event'));
  assert.ok(deleted.has('Device'));
  assert.ok(deleted.has('Photo'));
  assert.equal(deleted.has('User'), false, 'users are deleted separately, not via the generic sweep');
});

test('payments and audit logs are retained, with a stated reason', () => {
  const names = RETAINED_COLLECTIONS.map((entry) => entry.name);
  assert.ok(names.includes('Payment'), 'payments are financial records and must survive');
  assert.ok(names.includes('AuditLog'), 'the audit trail is the evidence of the deletion itself');
  for (const entry of RETAINED_COLLECTIONS) {
    assert.ok(entry.reason.length > 20, `${entry.name} needs a real reason, not a placeholder`);
  }
});

test('the archive model keeps the payload schema-free', () => {
  const payloadPath = DeletedRecord.schema.path('payload');
  // Mixed, not a subdocument: an archive written today must still read
  // back if Event or Photo gain and lose fields next year.
  assert.equal(payloadPath.instance, 'Mixed');
  assert.ok(DeletedRecord.schema.path('organizationId'));
  assert.ok(DeletedRecord.schema.path('removed'));
});

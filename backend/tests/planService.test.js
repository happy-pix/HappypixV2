// Issues #3, #4, #5, #55, #56: plan limits are real, come from the assigned
// plan, and are enforced before devices/events are created.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_PLAN_CATALOG, planSync, resolvePlan, computePlanStatus, planSummary,
  assertDeviceLimit, assertEventLimit, PlanLimitError, trialEndDate,
} from '../services/planService.js';

test('the six CRM plans exist with real device + event limits (#4)', () => {
  const keys = DEFAULT_PLAN_CATALOG.map((plan) => plan.key);
  assert.deepEqual(keys, ['trial', 'starter', 'basic', 'professional', 'business', 'custom']);
  for (const plan of DEFAULT_PLAN_CATALOG) {
    assert.ok(Number.isInteger(plan.devices) && plan.devices >= 1, `${plan.key} devices`);
    assert.ok(Number.isInteger(plan.events) && plan.events >= 1, `${plan.key} events`);
  }
  assert.equal(planSync('basic').devices, 3);
  assert.equal(planSync('basic').events, 2);
  assert.equal(planSync('business').devices, 10);
});

test('unknown plans fall back to trial instead of throwing', () => {
  assert.equal(planSync('does-not-exist').key, 'trial');
});

test('plan status derives from lifecycle + subscription (#3)', () => {
  const active = { status: 'active', plan: 'basic' };
  const future = new Date(Date.now() + 60 * 24 * 3600 * 1000);
  const soon = new Date(Date.now() + 5 * 24 * 3600 * 1000);
  const past = new Date(Date.now() - 24 * 3600 * 1000);

  assert.equal(computePlanStatus({ ...active, status: 'suspended' }, null), 'suspended');
  assert.equal(computePlanStatus({ ...active, status: 'banned' }, null), 'banned');
  assert.equal(computePlanStatus(active, null), 'not_subscribed');
  assert.equal(
    computePlanStatus(active, { plan: 'basic', amount: 2999, startDate: past, endDate: future }),
    'active',
  );
  assert.equal(
    computePlanStatus(active, { plan: 'basic', amount: 2999, startDate: past, endDate: soon }),
    'expiring_soon',
  );
  assert.equal(
    computePlanStatus(active, { plan: 'basic', amount: 2999, startDate: past, endDate: past }),
    'expired',
  );
  assert.equal(
    computePlanStatus(active, { plan: 'trial', amount: 0, startDate: past, endDate: future }),
    'trial',
  );
});

test('plan summary exposes the limits the CRM displays (#3, #56)', async () => {
  const org = { status: 'active', plan: 'professional', createdAt: new Date('2026-01-01') };
  const subscription = {
    plan: 'professional', amount: 5999,
    startDate: new Date('2026-01-01'),
    endDate: new Date(Date.now() + 90 * 24 * 3600 * 1000),
    invoiceNo: 'HAP-INV-1',
  };
  const summary = await planSummary(org, subscription);
  assert.equal(summary.planName, 'Professional');
  assert.equal(summary.deviceLimit, 5);
  assert.equal(summary.eventLimit, 5);
  assert.equal(summary.status, 'active');
  assert.ok(summary.daysLeft >= 80);
  assert.equal(summary.invoice, 'HAP-INV-1');
});

test('device limit blocks the next device with an actionable message (#55)', async () => {
  const org = { status: 'active', plan: 'starter' }; // 1 device
  await assert.rejects(() => assertDeviceLimit(org, 1), (error) => {
    assert.ok(error instanceof PlanLimitError);
    assert.equal(error.status, 409);
    assert.equal(error.code, 'PLAN_LIMIT_REACHED');
    assert.match(error.message, /Starter plan allows 1 connected device/);
    return true;
  });
  // Under the limit is fine.
  const limits = await assertDeviceLimit(org, 0);
  assert.equal(limits.devices, 1);
});

test('event limit blocks parallel active events (#55)', async () => {
  const org = { status: 'active', plan: 'basic' }; // 2 events
  await assert.rejects(() => assertEventLimit(org, 2), /allows 2 active events/);
  const limits = await assertEventLimit(org, 1);
  assert.equal(limits.events, 2);
});

test('resolvePlan prefers database rows over the built-in catalogue', async () => {
  const plan = await resolvePlan('basic');
  assert.equal(plan.key, 'basic');
  assert.ok(plan.devices >= 1);
});

test('trial end date is 14 days out', () => {
  const start = new Date('2026-01-01T00:00:00Z');
  const end = trialEndDate(start);
  assert.equal(end.toISOString(), '2026-01-15T00:00:00.000Z');
});

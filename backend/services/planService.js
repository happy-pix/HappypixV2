// ============================================================
// Plan & subscription limits — the ONLY place device/event limits
// are decided (issue #5: no hard-coded limits anywhere else).
//
// Limits come from the organization's assigned subscription plan:
//   * the `SubscriptionPlan` collection when the plan exists in CRM
//   * otherwise the built-in catalogue below (Trial → Enterprise/custom)
// ============================================================

import SubscriptionPlan from '../models/SubscriptionPlan.js';
import { conflict, sendError } from '../utils/httpError.js';

// Issues #3, #4: the six plans that must exist in CRM.
// `devices`/`events` are the plan limits used for enforcement + display.
export const DEFAULT_PLAN_CATALOG = [
  {
    key: 'trial',
    name: 'Trial',
    description: '14-day evaluation — full product, single booth.',
    price: 0,
    durationMonths: 0,
    durationLabel: '14 days',
    devices: 1,
    events: 1,
    active: true,
  },
  {
    key: 'starter',
    name: 'Starter',
    description: 'One booth for one small event at a time.',
    price: 1999,
    durationMonths: 3,
    durationLabel: '3 months',
    devices: 1,
    events: 1,
    active: true,
  },
  {
    key: 'basic',
    name: 'Basic',
    description: 'Three booths for growing photographers and planners.',
    price: 2999,
    durationMonths: 3,
    durationLabel: '3 months',
    devices: 3,
    events: 2,
    active: true,
  },
  {
    key: 'professional',
    name: 'Professional',
    description: 'Five booths and five parallel events.',
    price: 5999,
    durationMonths: 6,
    durationLabel: '6 months',
    devices: 5,
    events: 5,
    active: true,
  },
  {
    key: 'business',
    name: 'Business',
    description: 'Ten booths for multi-city operations.',
    price: 9999,
    durationMonths: 6,
    durationLabel: '6 months',
    devices: 10,
    events: 10,
    active: true,
  },
  {
    key: 'custom',
    name: 'Enterprise / Custom',
    description: 'Contact sales — volume booths, custom term, dedicated support.',
    price: null,
    durationMonths: 0,
    durationLabel: 'Custom term',
    devices: 25,
    events: 20,
    active: true,
  },
];

const DEFAULT_BY_KEY = Object.fromEntries(DEFAULT_PLAN_CATALOG.map((plan) => [plan.key, plan]));

const TRIAL_DAYS = 14;
const EXPIRING_SOON_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

let cache = { at: 0, plans: null };
const CACHE_MS = 30 * 1000;

/** All plan definitions: DB rows (if any) overlaid on the built-in catalogue. */
export async function listPlans({ fresh = false } = {}) {
  if (!fresh && cache.plans && Date.now() - cache.at < CACHE_MS) return cache.plans;
  let rows = [];
  try {
    rows = await SubscriptionPlan.find().lean();
  } catch (error) {
    rows = []; // DB unavailable → built-in catalogue still works
  }
  const byKey = new Map(DEFAULT_PLAN_CATALOG.map((plan) => [plan.key, { ...plan }]));
  for (const row of rows) {
    const key = String(row.key || row.name || '').toLowerCase();
    if (!key) continue;
    byKey.set(key, {
      ...(byKey.get(key) || {}),
      ...row,
      key,
      devices: toLimit(row.devices, byKey.get(key)?.devices),
      events: toLimit(row.events, byKey.get(key)?.events),
    });
  }
  const plans = [...byKey.values()];
  cache = { at: Date.now(), plans };
  return plans;
}

function toLimit(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 1) return fallback ?? 1;
  return Math.floor(number);
}

/** Resolve the definition for one plan key (DB first, then catalogue). */
export async function resolvePlan(key) {
  const wanted = String(key || 'trial').toLowerCase();
  const plans = await listPlans();
  return plans.find((plan) => plan.key === wanted) || DEFAULT_BY_KEY[wanted] || DEFAULT_BY_KEY.trial;
}

/** Synchronous fallback (booth snapshot hot path, seeds, tests). */
export function planSync(key) {
  const wanted = String(key || 'trial').toLowerCase();
  return (cache.plans && cache.plans.find((plan) => plan.key === wanted)) || DEFAULT_BY_KEY[wanted] || DEFAULT_BY_KEY.trial;
}

/** Issues #3, #5, #56: the org's real limits. */
export async function orgLimits(org) {
  const plan = await resolvePlan(org && org.plan);
  return {
    plan: plan.key,
    planName: plan.name,
    devices: plan.devices,
    events: plan.events,
    durationLabel: plan.durationLabel,
    price: plan.price,
  };
}

/** Issue #3: derive plan status the same way the CRM mock does. */
export function computePlanStatus(org, subscription) {
  if (!org) return 'not_subscribed';
  if (org.status === 'suspended') return 'suspended';
  if (org.status === 'banned') return 'banned';
  if (!subscription) {
    if (org.trialEndsAt && new Date() < new Date(org.trialEndsAt)) return 'trial';
    return 'not_subscribed';
  }
  const now = Date.now();
  const start = subscription.startDate ? new Date(subscription.startDate).getTime() : 0;
  const end = new Date(subscription.extendedTo || subscription.endDate || 0).getTime();
  const isTrial = subscription.plan === 'trial' || Number(subscription.amount) === 0;
  if (isTrial) return now > end ? 'expired' : 'trial';
  if (start && now < start) return 'not_subscribed';
  if (now > end) return 'expired';
  if (end - now < EXPIRING_SOON_DAYS * DAY_MS) return 'expiring_soon';
  return 'active';
}

/** The `plan` block every CRM screen reads (#3, #56). */
export async function planSummary(org, subscription) {
  const limits = await orgLimits(org);
  const status = computePlanStatus(org, subscription);
  const end = subscription
    ? new Date(subscription.extendedTo || subscription.endDate || 0)
    : org && org.trialEndsAt
      ? new Date(org.trialEndsAt)
      : null;
  const start = subscription && subscription.startDate
    ? new Date(subscription.startDate)
    : org && org.createdAt
      ? new Date(org.createdAt)
      : null;
  const daysLeft = end && !Number.isNaN(end.getTime())
    ? Math.max(0, Math.ceil((end.getTime() - Date.now()) / DAY_MS))
    : null;
  return {
    plan: limits.plan,
    planName: limits.planName,
    status,
    startDate: start && !Number.isNaN(start.getTime()) ? start.toISOString() : null,
    endDate: end && !Number.isNaN(end.getTime()) ? end.toISOString() : null,
    daysLeft,
    amount: subscription ? Number(subscription.amount) || 0 : 0,
    invoice: subscription ? subscription.invoiceNo || null : null,
    deviceLimit: limits.devices,
    eventLimit: limits.events,
  };
}

export function trialEndDate(from = new Date()) {
  return new Date(from.getTime() + TRIAL_DAYS * DAY_MS);
}

// ─── Limit enforcement ─────────────────────────────────────────

export class PlanLimitError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'PlanLimitError';
    this.status = 409;
    this.code = 'PLAN_LIMIT_REACHED';
    this.details = details;
  }
  send(res) {
    return sendError(res, this);
  }
}

/**
 * Issue #5/#55: enforce the device limit before creating, registering or
 * assigning a device. `used` counts devices that already exist for the org.
 */
export async function assertDeviceLimit(org, used, { extra = 0 } = {}) {
  const limits = await orgLimits(org);
  if (used + extra >= limits.devices) {
    throw new PlanLimitError(
      `Your ${limits.planName} plan allows ${limits.devices} connected device${limits.devices === 1 ? '' : 's'} (${used} in use). Upgrade the plan to add more booths.`,
      { limit: limits.devices, used, resource: 'devices', plan: limits.plan },
    );
  }
  return limits;
}

/** Issue #5/#55: enforce the parallel active-event limit before creating one. */
export async function assertEventLimit(org, usedActiveEvents, { extra = 0 } = {}) {
  const limits = await orgLimits(org);
  if (usedActiveEvents + extra >= limits.events) {
    throw new PlanLimitError(
      `Your ${limits.planName} plan allows ${limits.events} active event${limits.events === 1 ? '' : 's'} at a time (${usedActiveEvents} running). Pause or finish an event, or upgrade the plan.`,
      { limit: limits.events, used: usedActiveEvents, resource: 'events', plan: limits.plan },
    );
  }
  return limits;
}

/** Guard used by write routes when the plan itself is no longer valid. */
export function assertPlanUsable(org, planStatus) {
  if (org && org.status === 'banned') {
    throw conflict('This organization is banned. Contact HappyPix support.', 'ORG_BANNED');
  }
  if (org && org.status === 'suspended') {
    throw conflict('This organization is suspended — changes are disabled until it is restored.', 'ORG_SUSPENDED');
  }
  if (planStatus === 'expired') {
    throw conflict('The subscription has expired. Renew the plan to enable this action.', 'PLAN_EXPIRED');
  }
  return true;
}

export default {
  DEFAULT_PLAN_CATALOG, listPlans, resolvePlan, planSync, orgLimits, planSummary,
  computePlanStatus, assertDeviceLimit, assertEventLimit, assertPlanUsable, trialEndDate,
  PlanLimitError,
};

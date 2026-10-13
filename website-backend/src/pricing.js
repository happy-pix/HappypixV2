// ============================================================
// Plan pricing for the public website.
//
// This mirrors backend/services/planService.js (the source of truth
// used by the CRM) so a discount campaign created in the platform
// CRM — percent or flat, inside its start/end window — shows the
// same price on happypix.in and charges the same amount at checkout.
// Keep the two implementations in sync.
// ============================================================

export const TRIAL_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const toDateOrNull = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function normalizeDiscount(plan = {}) {
  const type = ['percent', 'flat'].includes(plan.discountType) ? plan.discountType : 'none';
  const value = Number(plan.discountValue);
  return {
    discountType: type,
    discountValue: type === 'none' || !Number.isFinite(value) || value < 0 ? 0 : value,
    discountLabel: String(plan.discountLabel || '').trim(),
    discountStartsAt: toDateOrNull(plan.discountStartsAt),
    discountEndsAt: toDateOrNull(plan.discountEndsAt),
  };
}

export function isDiscountActive(plan = {}, now = new Date()) {
  const discount = normalizeDiscount(plan);
  if (discount.discountType === 'none' || discount.discountValue <= 0) return false;
  if (plan.price == null || Number(plan.price) <= 0) return false;
  const at = now instanceof Date ? now : new Date(now);
  if (discount.discountStartsAt && at < discount.discountStartsAt) return false;
  if (discount.discountEndsAt && at > discount.discountEndsAt) return false;
  return true;
}

export function planPricing(plan = {}, now = new Date()) {
  const discount = normalizeDiscount(plan);
  const active = isDiscountActive(plan, now);
  const listPrice = plan.price == null ? null : Number(plan.price);
  let discountAmount = 0;
  if (active && listPrice != null && listPrice > 0) {
    discountAmount = discount.discountType === 'percent'
      ? Math.round((listPrice * Math.min(100, discount.discountValue)) / 100)
      : Math.min(listPrice, Math.round(discount.discountValue));
  }
  return {
    price: listPrice,
    originalPrice: listPrice,
    effectivePrice: listPrice == null ? null : Math.max(0, listPrice - discountAmount),
    discountAmount,
    discountPercent: listPrice && discountAmount > 0 ? Math.round((discountAmount / listPrice) * 100) : 0,
    discount: {
      ...discount,
      discountStartsAt: discount.discountStartsAt ? discount.discountStartsAt.toISOString() : null,
      discountEndsAt: discount.discountEndsAt ? discount.discountEndsAt.toISOString() : null,
      active,
    },
  };
}

/** Public shape for one plan on the pricing page (no internal fields). */
export function publicPlanView(plan, now = new Date()) {
  return {
    key: plan.key,
    name: plan.name,
    description: plan.description || '',
    devices: plan.devices,
    events: plan.events,
    durationMonths: plan.durationMonths ?? 0,
    durationLabel: plan.durationLabel || '',
    ...planPricing(plan, now),
  };
}

/**
 * End date for a subscription starting at `start` on this plan.
 * Trial (durationMonths 0, key 'trial') runs 14 days; plans with a
 * 0-month custom term fall back to 30 days and are normally not sold
 * online (price null = contact sales).
 */
export function subscriptionPeriod(plan, start = new Date()) {
  const months = Number(plan.durationMonths) || 0;
  const end = new Date(start);
  if (plan.key === 'trial' || (months === 0 && plan.key === 'trial')) {
    end.setTime(end.getTime() + TRIAL_DAYS * DAY_MS);
  } else if (months > 0) {
    end.setMonth(end.getMonth() + months);
  } else {
    end.setTime(end.getTime() + 30 * DAY_MS);
  }
  return { startDate: new Date(start), endDate: end };
}

export function invoiceNumber(now = new Date()) {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HAP-INV-${yy}${mm}-${rand}`;
}

export default { normalizeDiscount, isDiscountActive, planPricing, publicPlanView, subscriptionPeriod, invoiceNumber, TRIAL_DAYS };

// ============================================================
// Activates a paid (or free) website checkout against the SHARED
// database:
//
//   • email is NEW      → create Organization + ORG_ADMIN User
//                         (password was hashed at order time)
//   • email EXISTS      → the password was already verified at order
//                         time; renew/upgrade that user's organization
//                         (term extends from the current expiry when
//                         it is still in the future — no paid days lost)
//
// Writes exactly the records the CRM reads (organizations, users,
// subscriptions), including the discount snapshot, so platform
// revenue + organisation pages light up with no extra wiring.
// ============================================================

import { Organization, User, Subscription } from './models.js';
import { subscriptionPeriod, invoiceNumber } from './pricing.js';

export async function activateCheckout(checkout, plan, { razorpayPaymentId = null, razorpaySignature = null } = {}) {
  // Idempotency: a double verify / Razorpay retry must not double-extend.
  if (checkout.status === 'paid' && checkout.subscriptionId) {
    const existing = await Subscription.findById(checkout.subscriptionId).lean();
    const organization = checkout.organizationId
      ? await Organization.findById(checkout.organizationId).lean()
      : null;
    return { checkout, subscription: existing, organization, alreadyActivated: true };
  }

  const now = new Date();
  let user = checkout.existingUserId ? await User.findById(checkout.existingUserId) : null;
  let organization = checkout.existingOrganizationId
    ? await Organization.findById(checkout.existingOrganizationId)
    : null;

  if (!organization) {
    if (user && user.organizationId) organization = await Organization.findById(user.organizationId);
  }

  if (!organization) {
    organization = await Organization.create({
      name: checkout.organizationName,
      ownerName: checkout.ownerName,
      email: checkout.email,
      phone: checkout.phone || '',
      country: 'IN',
      currency: 'INR',
      paymentGateway: 'razorpay',
      status: 'active',
      plan: plan.key,
      allowedDevices: plan.devices,
      allowedEvents: plan.events,
      planStartedAt: now,
    });
  }

  if (!user) {
    user = await User.create({
      name: checkout.ownerName,
      email: checkout.email,
      password: checkout.passwordHash, // already bcrypt-hashed at order time
      phoneNumber: checkout.phone || null,
      role: 'ORG_ADMIN',
      status: 'active',
      organizationId: organization._id,
    });
  } else if (!user.organizationId) {
    user.organizationId = organization._id;
    await user.save();
  }

  // Renewal: never steal paid days — extend from the later of now / expiry.
  const previous = await Subscription.findOne({ organizationId: organization._id, status: 'paid' })
    .sort({ endDate: -1 })
    .lean();
  const previousEnd = previous && previous.endDate && new Date(previous.endDate) > now
    ? new Date(previous.endDate)
    : null;
  const { startDate, endDate } = subscriptionPeriod(plan, previousEnd || now);

  const subscription = await Subscription.create({
    organizationId: organization._id,
    plan: plan.key,
    amount: checkout.amount,
    originalAmount: checkout.originalAmount,
    discountAmount: checkout.discountAmount,
    discountType: checkout.discountType,
    discountValue: checkout.discountValue,
    discountLabel: checkout.discountLabel,
    razorpayOrderId: checkout.razorpayOrderId || null,
    razorpayPaymentId,
    razorpaySignature,
    invoiceNo: invoiceNumber(now),
    startDate,
    endDate,
    status: 'paid',
    createdBy: user._id,
  });

  organization.plan = plan.key;
  organization.allowedDevices = plan.devices;
  organization.allowedEvents = plan.events;
  if (!organization.planStartedAt || !previousEnd) organization.planStartedAt = startDate;
  organization.planExpiresAt = endDate;
  organization.nextBillingDate = endDate;
  if (plan.key === 'trial') organization.trialEndsAt = endDate;
  if (organization.status === 'suspended') {
    // A paid renewal does not silently un-suspend; platform keeps control.
  }
  await organization.save();

  checkout.status = 'paid';
  checkout.razorpayPaymentId = razorpayPaymentId || checkout.razorpayPaymentId;
  checkout.organizationId = organization._id;
  checkout.userId = user._id;
  checkout.subscriptionId = subscription._id;
  checkout.invoiceNo = subscription.invoiceNo;
  checkout.passwordHash = null; // never keep credentials around after use
  await checkout.save();

  return { checkout, subscription, organization, user, alreadyActivated: false };
}

export default { activateCheckout };

import mongoose from 'mongoose';

// Plan limits map — enforced at device creation
export const PLAN_DEVICE_LIMITS = {
  starter:      1,
  professional: 3,
  business:     10,
  enterprise:   -1, // -1 = unlimited
};

// Monthly pricing (stored for reference; billing is automated via payment gateway)
export const PLAN_PRICING = {
  starter:      { AUD: 49,   INR: 2499  },
  professional: { AUD: 99,   INR: 4999  },
  business:     { AUD: 199,  INR: 9999  },
  enterprise:   { AUD: null, INR: null  }, // custom
};

const organizationSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────
    name:      { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone:     { type: String, trim: true, default: '' },
    country:   { type: String, default: 'IN' }, // ISO country code: IN, AU, etc.

    // ─── Plan & Billing ───────────────────────────────────────
    // Issue #4: the six plans that exist in CRM. `trial` is the default for
    // brand-new organizations; `custom` is the Enterprise/contact-sales tier.
    plan: {
      type: String,
      default: 'trial',
      lowercase: true,
      trim: true,
    },
    currency: {
      type: String,
      enum: ['AUD', 'INR'],
      default: 'INR',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'semiannual', 'annual'],
      default: 'monthly',
    },
    planStartedAt:  { type: Date, default: null },
    planExpiresAt:  { type: Date, default: null },
    nextBillingDate:{ type: Date, default: null },

    // ─── Payment Gateway ─────────────────────────────────────
    // Auto-selected based on currency: INR → razorpay, AUD → stripe
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe'],
      default: 'razorpay',
    },

    // ─── Status ───────────────────────────────────────────────
    // `paused` is reserved for self-service deletion: the account still
    // exists (so it can be restored by signing in) but every sign-in path
    // refuses it until the seven-day window closes.
    status: {
      type: String,
      enum: ['active', 'suspended', 'banned', 'expired', 'paused'],
      default: 'active',
    },
    suspendReason: { type: String, default: null },
    suspendedAt:   { type: Date, default: null },
    suspendedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    trialEndsAt: { type: Date, default: null },
    trialExtensionCount: { type: Number, default: 0 },
    trialExtendedUntil: { type: Date, default: null },

    // ─── Plan Limits (mirrored from SubscriptionPlan for offline reads) ───
    // `services/planService.js` is still the authority — these are a cache
    // refreshed whenever the plan changes (issue #5: no hard-coded limits).
    allowedDevices: { type: Number, default: 1 },
    // Purchased add-ons (website catalogue kind: 'addon') + AI credits.
    addons: {
      type: [{
        key: { type: String, required: true },
        name: { type: String, default: '' },
        activatedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, default: null },
        _id: false,
      }],
      default: [],
    },
    aiCredits: { type: Number, default: 0 },
    allowedEvents: { type: Number, default: 1 },

    // ─── Cloud Storage Tracking (Issue #10: bytes used against plan quota) ──
    storageBytesUsed: { type: Number, default: 0 },

    // Bumped whenever access must be revoked instantly (ban, hard delete,
    // organization-level sign-out). JWTs carry the value they were issued
    // with, so every cached CRM/booth session is invalidated (issues #2,
    // #29, #30, #74).
    sessionVersion: { type: Number, default: 0 },

    // Cached snapshot of the platform gallery policy at the time the org
    // last synced — the booth snapshot service prefers the live setting.
    gallerySettings: {
      galleryEnabled: { type: Boolean, default: null },
      requireGuestConsent: { type: Boolean, default: null },
    },



    // ─── Super Admin Notes ────────────────────────────────────
    internalNotes: { type: String, default: '' },

    // ─── Self-service deletion ────────────────────────────────
    // Two dates and a cancellation flag are the whole state machine:
    // nothing is deleted until `deletionScheduledFor` passes with no
    // `deletionCancelledAt`, so the grace period cannot be skipped by a
    // failed write part-way through.
    deletionRequestedAt: { type: Date, default: null },
    deletionScheduledFor: { type: Date, default: null },
    deletionCancelledAt: { type: Date, default: null },
    deletionCancelledByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deletionRequestedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deletionRequestedByEmail: { type: String, default: null, trim: true, lowercase: true },
    deletionRequestIp: { type: String, default: null },
    deletionRequestUserAgent: { type: String, default: null },
    // Set by the purge itself, immediately before the document is removed;
    // it exists so a partially completed purge is distinguishable.
    deletedAt: { type: Date, default: null },

    // ─── Metadata ─────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────────
organizationSchema.index({ status: 1 });
organizationSchema.index({ plan: 1 });

// ─── Virtual: is plan active? ─────────────────────────────────
organizationSchema.virtual('isPlanActive').get(function () {
  if (this.status === 'suspended' || this.status === 'expired') return false;
  if (this.status === 'trial') {
    return this.trialEndsAt ? new Date() < this.trialEndsAt : true;
  }
  if (this.planExpiresAt) return new Date() < this.planExpiresAt;
  return this.status === 'active';
});

// ─── Pre-save: auto-set paymentGateway based on currency ─────
organizationSchema.pre('save', async function() {
  if (this.isModified('currency')) {
    this.paymentGateway = this.currency === 'AUD' ? 'stripe' : 'razorpay';
  }
});

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;

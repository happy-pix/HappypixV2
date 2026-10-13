import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, default: null },
    // ─── Discount campaign (platform CRM → Subscription Plans) ───
    // `discountType`: 'none' | 'percent' (value = % off) | 'flat' (value = ₹ off,
    // the "static" amount). The discount is only live inside the optional
    // [discountStartsAt, discountEndsAt] window — that window is the discount
    // duration. Effective price is always computed in services/planService.js
    // (`planPricing`) — never re-derive it in a route or a client.
    discountType: {
      type: String,
      enum: ['none', 'percent', 'flat'],
      default: 'none',
    },
    discountValue: { type: Number, default: 0 },
    discountLabel: { type: String, default: '', trim: true },
    discountStartsAt: { type: Date, default: null },
    discountEndsAt: { type: Date, default: null },
    durationMonths: { type: Number, required: true },
    durationLabel: { type: String, required: true },
    devices: { type: Number, required: true },
    events: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export default SubscriptionPlan;

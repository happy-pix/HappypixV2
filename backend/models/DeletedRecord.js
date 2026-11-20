import mongoose from 'mongoose';

/**
 * DeletedRecord — the permanent archive of everything a self-service
 * account deletion destroyed.
 *
 * Two things are deliberately NOT deleted when an organization is
 * deleted: payments and audit logs, because both are financial and
 * compliance records. Everything else that belongs to the tenant is
 * gone from its own collection, and what it contained is preserved
 * here as one complete JSON document under a single field.
 *
 * The point of the single `payload` field rather than a loose schema is
 * that the archive must survive changes to the live models: if Event
 * gains or loses a field next year, an archive written today still
 * reads back exactly as it was captured.
 */
const deletedRecordSchema = new mongoose.Schema(
  {
    // ─── What was deleted ──────────────────────────────────────
    kind: {
      type: String,
      enum: ['organization', 'user'],
      required: true,
      index: true,
    },

    // Kept outside the payload so support can find a deleted tenant
    // without parsing the JSON.
    organizationId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    organizationName: { type: String, default: null, trim: true },
    organizationEmail: { type: String, default: null, trim: true, lowercase: true },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    userEmail: { type: String, default: null, trim: true, lowercase: true },

    // ─── Why and how ───────────────────────────────────────────
    reason: { type: String, enum: ['self_service', 'inactivity', 'admin'], default: 'self_service' },
    // The address the confirmation was sent from, and the audit trail of
    // the request itself.
    requestedAt: { type: Date, default: Date.now },
    scheduledPurgeAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledByUserId: { type: mongoose.Schema.Types.ObjectId, default: null },

    // What was removed, collection by collection. Counts only — the
    // documents themselves are inside `payload`.
    removed: {
      type: Map,
      of: Number,
      default: {},
    },
    // Third-party media that cannot be deleted by dropping a Mongo
    // document is recorded here so an operator can clear it later.
    externalMedia: {
      type: [String],
      default: [],
    },

    // ─── The archive ───────────────────────────────────────────
    // The complete, self-contained JSON snapshot. No schema on purpose.
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

deletedRecordSchema.index({ deletedAt: -1 });
deletedRecordSchema.index({ organizationEmail: 1 });

export default mongoose.model('DeletedRecord', deletedRecordSchema);

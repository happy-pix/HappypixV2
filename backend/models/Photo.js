import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  // ─── Multi-tenant ─────────────────────────────────
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null,
    index: true,
  },
  s3Key:   { type: String, required: true },
  url:     { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  // Gallery flow (issues #18, #61): which booth produced it, when it was
  // finalised, and whether the guest allowed social-media publishing.
  deviceId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Device', default: null, index: true },
  sessionId:     { type: String, default: null },
  guestConsent:  { type: Boolean, default: false },
  generatedAt:   { type: Date, default: Date.now },
  finalised:     { type: Boolean, default: false },
  printStatus:   { type: String, default: 'printed' },
  digitalStatus: { type: String, default: 'delivered' },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete record after 24H
});

const Photo = mongoose.model('Photo', photoSchema);
export default Photo;

const mongoose = require('mongoose');

// A time the leader offers for a one-on-one. bookedBy stays empty until a member books it.
const oneOnOneSlotSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingGroup', required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startsAtUtc: { type: Date, required: true },
    durationMinutes: { type: Number, default: 20, min: 5, max: 120 },
    meetingLink: { type: String, default: '' },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: ['open', 'booked', 'completed', 'cancelled'], default: 'open' },
  },
  { timestamps: true }
);

oneOnOneSlotSchema.index({ group: 1, startsAtUtc: 1 });

module.exports = mongoose.model('OneOnOneSlot', oneOnOneSlotSchema);

const mongoose = require('mongoose');

// One weekly session for one time option of a group. Times are always stored in UTC.
const meetingSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingGroup', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, required: true },
    weekNumber: { type: Number, required: true, min: 1 },
    startsAtUtc: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    meetingLink: { type: String, default: '' },
    chapters: { type: String, default: '' },
    status: { type: String, enum: ['scheduled', 'held', 'cancelled'], default: 'scheduled' },
  },
  { timestamps: true }
);

meetingSchema.index({ group: 1, slotId: 1, weekNumber: 1 }, { unique: true });
meetingSchema.index({ startsAtUtc: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);

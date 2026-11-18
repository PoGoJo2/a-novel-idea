const mongoose = require('mongoose');

// One of the two weekly meeting times a group offers. Each gets its own _id,
// which a membership stores as "slotId" to record which time the member chose.
const timeSlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: [true, 'Day of week is required'], min: 0, max: 6 }, // 0 = Sunday
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must look like 19:00 (24-hour)'],
  },
  timezone: { type: String, default: 'America/New_York' }, // IANA name, keeps daylight saving correct
  capacity: { type: Number, default: 12, min: 1, max: 100 },
  meetingLink: { type: String, default: '', trim: true },
});

const readingGroupSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionMinutes: { type: Number, default: 60, min: 15, max: 240 }, // the "service duration"
    timeSlots: {
      type: [timeSlotSchema],
      validate: [
        { validator: (slots) => slots.length >= 1 && slots.length <= 4, message: 'A reading group offers between one and four meeting times each week' },
        {
          validator: (slots) => new Set(slots.map((s) => `${s.dayOfWeek}-${s.startTime}`)).size === slots.length,
          message: 'The meeting times must all be different',
        },
      ],
    },
    startDate: { type: Date, required: [true, 'Start date is required'] }, // a calendar date (UTC midnight)
    totalWeeks: { type: Number, default: 8, min: 1, max: 52 },
    currentWeek: { type: Number, default: 0, min: 0 }, // 0 = not started; limits AI spoilers
    oneOnOneAllowance: { type: Number, default: 2, min: 0 },
    status: { type: String, enum: ['open', 'in-progress', 'finished'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReadingGroup', readingGroupSchema);

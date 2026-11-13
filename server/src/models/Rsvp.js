const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema(
  {
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    response: { type: String, enum: ['attending', 'cannot_attend'], required: true },
  },
  { timestamps: true }
);

// One answer per person per meeting; changing your mind updates the same record
rsvpSchema.index({ meeting: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rsvp', rsvpSchema);

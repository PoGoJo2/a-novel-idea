const mongoose = require('mongoose');

// What was discussed in a meeting, written by the leader so absent members can catch up.
const meetingNoteSchema = new mongoose.Schema(
  {
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true, unique: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: [true, 'Notes cannot be empty'], trim: true, maxlength: 5000 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MeetingNote', meetingNoteSchema);

const mongoose = require('mongoose');

// A leader volunteering to lead a reading group that has not started yet.
// The administrator approves (the group moves to that leader) or declines.
const leaderRequestSchema = new mongoose.Schema(
  {
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingGroup', required: true, index: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, default: '', trim: true, maxlength: 300 }, // for example "Free Tuesdays after 5"
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending', index: true },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

// One request per leader per group (asking again just updates it)
leaderRequestSchema.index({ group: 1, leader: 1 }, { unique: true });

module.exports = mongoose.model('LeaderRequest', leaderRequestSchema);

const mongoose = require('mongoose');

// A membership is the "booking": this user joined this group at this time option.
const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingGroup', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, required: true }, // _id of one entry in group.timeSlots
    status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
    joinedAt: { type: Date, default: Date.now },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// A user may have only ONE active membership per group (cancelled ones are ignored)
membershipSchema.index({ user: 1, group: 1 }, { unique: true, partialFilterExpression: { status: 'active' } });
// Speeds up "how many seats are taken in this time option?"
membershipSchema.index({ group: 1, slotId: 1, status: 1 });

module.exports = mongoose.model('Membership', membershipSchema);

const mongoose = require('mongoose');

// A complaint or review sent in by a member. Administrators read these on the Administrator page.
const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, // optional: what the feedback is about
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingGroup' },
    kind: { type: String, enum: ['complaint', 'review', 'other'], default: 'review' },
    rating: { type: Number, min: 1, max: 5 }, // optional star rating (reviews)
    message: { type: String, required: [true, 'Please write a message'], trim: true, maxlength: 2000 },
    status: { type: String, enum: ['new', 'resolved'], default: 'new', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);

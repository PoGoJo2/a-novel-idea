const mongoose = require('mongoose');

// Saved AI output, so the same request does not call the AI service (and cost money) twice.
const aiNoteSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    type: { type: String, enum: ['study-notes', 'insights', 'review-summary'], required: true },
    upToWeek: { type: Number, default: 0, min: 0 }, // content never goes past this week
    content: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

aiNoteSchema.index({ book: 1, type: 1, upToWeek: 1 }, { unique: true });

module.exports = mongoose.model('AiNote', aiNoteSchema);

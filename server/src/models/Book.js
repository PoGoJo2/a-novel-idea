const mongoose = require('mongoose');

// One list of genres keeps filtering consistent across the whole app
const GENRES = ['Mystery', 'Fantasy', 'Classics', 'Science Fiction', 'Romance', 'Historical', 'Non-fiction', 'Thriller'];

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    author: { type: String, required: [true, 'Author is required'], trim: true, maxlength: 100 },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: { values: GENRES, message: `Genre must be one of: ${GENRES.join(', ')}` },
      index: true,
    },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 2000 },
    coverUrl: { type: String, default: '' },
    // Colors taken from the cover; the frontend uses them to tint the book's tile
    accentColors: {
      tint: { type: String, default: '#E6EBF5' },
      accent: { type: String, default: '#22365C' },
      ribbon: { type: String, default: '#D8B25A' },
    },
    pageCount: { type: Number, min: 1 },
  },
  { timestamps: true }
);

// Lets us search by title, author, or description with one query
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

module.exports = mongoose.model('Book', bookSchema);
module.exports.GENRES = GENRES;

// Gives every book in a genre one of that genre's painted cover pictures.
// The pictures live in client/public/covers, named like mystery-1.jpg ... mystery-8.jpg.
// Run it from the server folder:   node src/seed/setCovers.js
// Safe to run again: add a genre to COVER_SETS when its pictures arrive, then run it again.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');

// genre name on the site -> [file name start, how many pictures]
const COVER_SETS = {
  Mystery: ['mystery', 8],
  Classics: ['classics', 8],
  Fantasy: ['fantasy', 8],
  'Science Fiction': ['science-fiction', 8],
  Horror: ['horror', 8],
  Romance: ['romance', 8],
  'Thriller / Action': ['thriller', 8],
  'True Crime': ['true-crime', 8],
  Autobiography: ['autobiography', 8],
  'Self Help / Personal Development': ['self-help', 8],
};

const run = async () => {
  await connectDB();
  for (const [genre, [slug, count]] of Object.entries(COVER_SETS)) {
    const books = await Book.find({ genre }).sort({ title: 1 });
    for (let i = 0; i < books.length; i += 1) {
      books[i].coverUrl = `/covers/${slug}-${(i % count) + 1}.jpg`;
      await books[i].save({ validateBeforeSave: false });
    }
    console.log(`${genre}: ${books.length} books got covers.`);
  }
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});

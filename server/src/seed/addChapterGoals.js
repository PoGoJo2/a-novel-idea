// Fills in sample weekly reading goals (chapters) for every reading group that has none yet.
// Run it once from the server folder with:  node src/seed/addChapterGoals.js
// It only fills EMPTY goals (or old placeholders like "Week 1"), so goals your leaders have typed are never overwritten.
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Meeting = require('../models/Meeting');

// Week 1 is chapters 1-5, week 2 is 6-11, and so on (weeks past the list repeat the pattern)
const PLAN = ['Chapters 1-5', 'Chapters 6-11', 'Chapters 12-17', 'Chapters 18-23', 'Chapters 24-29', 'Chapters 30-35', 'Chapters 36-41', 'Chapters 42-47'];

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run in production.');
    process.exit(1);
  }
  await connectDB();

  let changed = 0;
  for (let week = 1; week <= 12; week += 1) {
    const goal = PLAN[(week - 1) % PLAN.length];
    const result = await Meeting.updateMany({ weekNumber: week, $or: [{ chapters: '' }, { chapters: { $exists: false } }, { chapters: { $regex: /^week\s*\d+$/i } }] }, { $set: { chapters: goal } });
    changed += result.modifiedCount;
  }
  console.log(`Done. Added goals to ${changed} weekly meetings.`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});

// Gives the three test leaders a photo and a starter profile for the "Meet the Leaders" page.
// The photos are in client/public/leaders. Run from the server folder:   node src/seed/addLeaderProfiles.js
// It only fills in parts that are still empty, so anything a leader wrote themselves is kept.
// These bios are sample text for testing; each leader can change theirs under Leader tools > Edit my profile.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const PROFILES = {
  'lovie@example.com': {
    photo: '/leaders/lovie.jpg',
    bio: 'A retired English teacher who still can’t walk past a used bookstore. I love a lively discussion and making sure every voice in the room gets heard.',
    history: 'Ran a library book club for twelve years before joining A Novel Idea. Has led groups on everything from Austen to Agatha Christie.',
    interests: ['Classics', 'Mystery', 'Romance'],
    favoriteReads: 'Pride and Prejudice, And Then There Were None, Their Eyes Were Watching God',
  },
  'jaxon@example.com': {
    photo: '/leaders/jaxon.jpg',
    bio: 'Software developer by day, sci-fi and thriller reader by night. I like groups that dig into big ideas and plot twists.',
    history: 'Started a reading circle with coworkers in 2021 and has been leading online discussions ever since.',
    interests: ['Science Fiction', 'Thriller / Action', 'Fantasy'],
    favoriteReads: 'Dune, The Martian, Jurassic Park',
  },
  'nicole.leader@example.com': {
    photo: '/leaders/nicole.jpg',
    bio: 'Graduate student and lifelong fantasy fan. I keep discussions friendly, curious and spoiler-safe.',
    history: 'New to leading with A Novel Idea, after two years co-hosting a campus book club.',
    interests: ['Fantasy', 'Self Help / Personal Development', 'Autobiography'],
    favoriteReads: 'A Wizard of Earthsea, Educated, Atomic Habits',
  },
};

const run = async () => {
  await connectDB();
  for (const [email, data] of Object.entries(PROFILES)) {
    const user = await User.findOne({ email });
    if (!user) { console.log(`Skipped ${email} (not found — run node src/seed/addLeaders.js first)`); continue; }
    const p = user.profile || {};
    for (const [key, value] of Object.entries(data)) {
      const empty = Array.isArray(p[key]) ? p[key].length === 0 : !p[key];
      if (empty) p[key] = value;
    }
    user.profile = p;
    await user.save({ validateBeforeSave: false });
    console.log(`${user.name}: profile ready.`);
  }
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});

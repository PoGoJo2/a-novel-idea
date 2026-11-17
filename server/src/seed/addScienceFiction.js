// Adds more Science Fiction books (each with a reading group and weekly meetings) WITHOUT clearing anything.
// Run it once from the server folder with:  node src/seed/addScienceFiction.js
// It is safe to run again: books that already exist are skipped.
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const ReadingGroup = require('../models/ReadingGroup');
const Meeting = require('../models/Meeting');
const { generateMeetings } = require('../services/meetingService');

const DAY = 24 * 60 * 60 * 1000;
const LINK = 'https://teams.microsoft.com/placeholder-meeting-link'; // replace with real links later

const palettes = [
  { tint: '#E1EEF2', accent: '#1F5F78', ribbon: '#E8C46A' },
  { tint: '#E6EBF5', accent: '#22365C', ribbon: '#D8B25A' },
  { tint: '#EAE5F6', accent: '#4B3590', ribbon: '#D8B25A' },
  { tint: '#E4EEEA', accent: '#2D5A52', ribbon: '#E8C46A' },
];

// Short original descriptions (not copied from publishers)
const books = [
  { title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction', description: 'A young heir is sent to a desert planet where water is precious, empires scheme, and the most valuable substance in the universe is found.' },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', genre: 'Science Fiction', description: 'In a future where books are outlawed, a fireman begins to question the job of burning them and what has been lost.' },
  { title: "Ender's Game", author: 'Orson Scott Card', genre: 'Science Fiction', description: 'A gifted child is trained in a military school in orbit to lead humanity against an alien threat, and pays a heavy price.' },
  { title: "The Hitchhiker's Guide to the Galaxy", author: 'Douglas Adams', genre: 'Science Fiction', description: 'An ordinary man is whisked off Earth moments before it is demolished, and begins a hilariously confusing tour of the galaxy.' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', genre: 'Science Fiction', description: 'An envoy visits a frozen world whose people have no fixed gender, and learns about trust, loyalty, and friendship.' },
  { title: 'Neuromancer', author: 'William Gibson', genre: 'Science Fiction', description: 'A washed-up hacker is hired for one last job that pulls him through neon cities and the digital world of cyberspace.' },
  { title: 'The War of the Worlds', author: 'H.G. Wells', genre: 'Science Fiction', description: 'Towering machines from Mars land in England, and ordinary people must survive as the old world falls apart.' },
];

const schedules = [
  [[3, '19:00'], [6, '11:00']],
  [[5, '18:00'], [0, '15:00']],
  [[2, '19:30'], [6, '14:00']],
];

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run in production.');
    process.exit(1);
  }
  await connectDB();

  const leader = (await User.findOne({ email: 'leader@example.com' })) || (await User.findOne({ role: 'leader' }));
  if (!leader) {
    console.error('No leader user found. Run "npm run seed" first.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let added = 0;

  for (let i = 0; i < books.length; i += 1) {
    if (await Book.findOne({ title: books[i].title })) {
      console.log(`Skipped (already there): ${books[i].title}`);
      continue;
    }
    const book = await Book.create({ ...books[i], accentColors: palettes[i % palettes.length] });
    const sched = schedules[i % schedules.length];
    const group = await ReadingGroup.create({
      book: book._id,
      leader: leader._id,
      sessionMinutes: 60,
      timeSlots: sched.map(([dayOfWeek, startTime]) => ({
        dayOfWeek, startTime, timezone: 'America/New_York', capacity: i % 2 === 0 ? 12 : 8, meetingLink: LINK,
      })),
      startDate: new Date(today + (7 + i) * DAY),
      totalWeeks: 6,
      currentWeek: 0,
      oneOnOneAllowance: 2,
      status: 'open',
    });
    await Meeting.insertMany(generateMeetings(group));
    added += 1;
    console.log(`Added: ${book.title}`);
  }

  console.log(`Done. ${added} new Science Fiction book(s) added.`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});

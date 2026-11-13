// Fills the database with sample data so the app has something to show.
// Run with:  npm run seed
// It clears and rebuilds books, groups, memberships, meetings, notes, and one-on-ones.
// It never deletes users; it only creates the three sample users if they are missing.
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const ReadingGroup = require('../models/ReadingGroup');
const Membership = require('../models/Membership');
const Meeting = require('../models/Meeting');
const MeetingNote = require('../models/MeetingNote');
const Rsvp = require('../models/Rsvp');
const OneOnOneSlot = require('../models/OneOnOneSlot');
const AiNote = require('../models/AiNote');
const { generateMeetings } = require('../services/meetingService');

const SEED_PASSWORD = 'password123'; // development only
const DAY = 24 * 60 * 60 * 1000;
const LINK = 'https://teams.microsoft.com/placeholder-meeting-link'; // replace with real links later

// Tile colors matched to each cover (same palettes as the wireframes)
const palettes = [
  { tint: '#E6EBF5', accent: '#22365C', ribbon: '#D8B25A' },
  { tint: '#F6E4E5', accent: '#7A1F2E', ribbon: '#D8B25A' },
  { tint: '#E4EEEA', accent: '#2D5A52', ribbon: '#E8C46A' },
  { tint: '#EAE5F6', accent: '#4B3590', ribbon: '#D8B25A' },
  { tint: '#E1F0E7', accent: '#1F6B4A', ribbon: '#E8C46A' },
  { tint: '#F8E7E0', accent: '#8E3A4D', ribbon: '#F6D78B' },
];

// Short original descriptions (not copied from publishers)
const books = [
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', genre: 'Mystery', description: 'Holmes and Watson investigate a family curse and a spectral hound on the moors of Devon. A classic puzzle of fear, fog, and clever deduction.' },
  { title: 'And Then There Were None', author: 'Agatha Christie', genre: 'Mystery', description: 'Ten strangers are invited to an island and begin to disappear one by one. A tightly plotted study in suspicion and guilt.' },
  { title: 'Rebecca', author: 'Daphne du Maurier', genre: 'Mystery', description: 'A shy newlywed arrives at a grand country house and finds it haunted by the memory of her husband\'s first wife.' },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', description: 'A comfort-loving homebody is swept into a quest with thirteen dwarves to win back a mountain from a dragon.' },
  { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', genre: 'Fantasy', description: 'A gifted boy learns the cost of power when pride leads him to release something he cannot control.' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', genre: 'Fantasy', description: 'An innkeeper with a hidden past tells the true story of his rise from street performer to famous and feared figure.' },
  { title: 'Pride and Prejudice', author: 'Jane Austen', genre: 'Classics', description: 'Sharp wit and first impressions collide when a spirited young woman meets a proud, reserved gentleman.' },
  { title: 'Jane Eyre', author: 'Charlotte Brontë', genre: 'Classics', description: 'An orphaned governess finds love and a dark secret at Thornfield Hall while fighting to keep her independence.' },
  { title: 'Frankenstein', author: 'Mary Shelley', genre: 'Classics', description: 'A young scientist brings a creature to life and must face what it means to create something and then abandon it.' },
  { title: 'The Time Machine', author: 'H.G. Wells', genre: 'Science Fiction', description: 'An inventor travels hundreds of thousands of years ahead and discovers what has become of humanity.' },
];

// Two time options per book: [dayOfWeek (0 = Sunday), startTime]
const schedules = [
  [[4, '19:00'], [0, '16:00']],
  [[1, '19:00'], [6, '10:00']],
  [[2, '18:30'], [0, '14:00']],
];

const ensureUser = async (name, email, role) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({ name, email, password: SEED_PASSWORD, role });
};

const run = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed in production.');
    process.exit(1);
  }

  await connectDB();

  // Make sure indexes exist before inserting (unique rules matter)
  await Promise.all([Book, ReadingGroup, Membership, Meeting, MeetingNote, Rsvp, OneOnOneSlot, AiNote].map((m) => m.init()));

  // Start clean (users are kept)
  await Promise.all([Book, ReadingGroup, Membership, Meeting, MeetingNote, Rsvp, OneOnOneSlot, AiNote].map((m) => m.deleteMany({})));

  // Leaders and admins cannot be created through the public register route, so the seed does it
  const leader = await ensureUser('Lena Leader', 'leader@example.com', 'leader');
  const member = await ensureUser('Max Member', 'member@example.com', 'member');
  await ensureUser('Ada Admin', 'admin@example.com', 'admin');

  const createdBooks = await Book.insertMany(
    books.map((b, i) => ({ ...b, accentColors: palettes[i % palettes.length] }))
  );

  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const groups = [];

  for (let i = 0; i < createdBooks.length; i += 1) {
    const inProgress = i === 0 || i === 3; // two groups already underway so notes and AI limits can be shown
    const sched = schedules[i % schedules.length];
    const group = await ReadingGroup.create({
      book: createdBooks[i]._id,
      leader: leader._id,
      sessionMinutes: 60,
      timeSlots: sched.map(([dayOfWeek, startTime]) => ({
        dayOfWeek, startTime, timezone: 'America/New_York', capacity: i % 2 === 0 ? 12 : 8, meetingLink: LINK,
      })),
      startDate: new Date(inProgress ? today - 14 * DAY : today + 7 * DAY),
      totalWeeks: 6,
      currentWeek: inProgress ? 3 : 0,
      oneOnOneAllowance: 2,
      status: inProgress ? 'in-progress' : 'open',
    });
    groups.push(group);
  }

  // Weekly meetings for every group
  const meetingDocs = groups.flatMap((g) => generateMeetings(g));
  const meetings = await Meeting.insertMany(meetingDocs);

  // Notes for weeks 1 and 2 of the groups already underway
  const notes = [];
  groups.filter((g) => g.status === 'in-progress').forEach((g) => {
    meetings.filter((m) => String(m.group) === String(g._id) && m.weekNumber <= 2).forEach((m) => {
      notes.push({
        meeting: m._id,
        author: leader._id,
        content: `Week ${m.weekNumber} notes: the group discussed first impressions, how the setting and characters were introduced, and questions to carry into next week's reading.`,
      });
    });
  });
  await MeetingNote.insertMany(notes);

  // Sample bookings for the member so the dashboard has data
  await Membership.insertMany([
    { user: member._id, group: groups[0]._id, slotId: groups[0].timeSlots[0]._id },
    { user: member._id, group: groups[3]._id, slotId: groups[3].timeSlots[1]._id },
    { user: member._id, group: groups[1]._id, slotId: groups[1].timeSlots[1]._id },
  ]);

  // Three future one-on-one slots for the first group (one already booked by the member)
  await OneOnOneSlot.insertMany([2, 3, 4].map((days, idx) => ({
    group: groups[0]._id,
    leader: leader._id,
    startsAtUtc: new Date(today + days * DAY + 20 * 60 * 60 * 1000),
    durationMinutes: 20,
    meetingLink: LINK,
    bookedBy: idx === 0 ? member._id : null,
    status: idx === 0 ? 'booked' : 'open',
  })));

  console.log('Seed complete:');
  console.log(`  ${createdBooks.length} books, ${groups.length} reading groups, ${meetings.length} meetings, ${notes.length} notes`);
  console.log('  Sample logins (development only), password for all: ' + SEED_PASSWORD);
  console.log('    leader@example.com  (leader)');
  console.log('    member@example.com  (member)');
  console.log('    admin@example.com   (admin)');

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});

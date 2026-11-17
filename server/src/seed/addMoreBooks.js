// Tops up every genre row on the home page so each one has the same number of books.
// Change TARGET below if you want more or fewer per row.
// Run it from the server folder with:  node src/seed/addMoreBooks.js
// It never deletes anything and skips books that already exist, so it is safe to run again.
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const ReadingGroup = require('../models/ReadingGroup');
const Meeting = require('../models/Meeting');
const { generateMeetings } = require('../services/meetingService');

const TARGET = 8; // books in every genre row
const DAY = 24 * 60 * 60 * 1000;
const LINK = 'https://teams.microsoft.com/placeholder-meeting-link'; // replace with real links later

const palettes = [
  { tint: '#E6EBF5', accent: '#22365C', ribbon: '#D8B25A' },
  { tint: '#F6E4E5', accent: '#7A1F2E', ribbon: '#D8B25A' },
  { tint: '#E4EEEA', accent: '#2D5A52', ribbon: '#E8C46A' },
  { tint: '#EAE5F6', accent: '#4B3590', ribbon: '#D8B25A' },
  { tint: '#E1F0E7', accent: '#1F6B4A', ribbon: '#E8C46A' },
  { tint: '#E1EEF2', accent: '#1F5F78', ribbon: '#E8C46A' },
];

// Short original descriptions (not copied from publishers). More are listed than needed, so there is always enough.
const candidates = {
  Mystery: [
    ['The Maltese Falcon', 'Dashiell Hammett', 'A tough San Francisco detective is pulled into a hunt for a priceless statuette and a circle of liars.'],
    ['The Murder of Roger Ackroyd', 'Agatha Christie', 'A quiet village doctor helps Hercule Poirot untangle a killing where everyone has something to hide.'],
    ['The Moonstone', 'Wilkie Collins', 'A cursed diamond vanishes from a country house, and many narrators tell their own version of what happened.'],
    ['The Woman in White', 'Wilkie Collins', 'A drawing teacher meets a mysterious woman in white and is drawn into a plot of stolen identities.'],
    ['A Study in Scarlet', 'Arthur Conan Doyle', 'The first meeting of Holmes and Watson, and a strange case of a message written in blood.'],
    ['The Name of the Rose', 'Umberto Eco', 'A monk and his student investigate a string of deaths in a medieval abbey full of secret books.'],
    ['In the Woods', 'Tana French', 'A detective returns to the woods where he was once found as a child, to solve a new case with echoes of the old one.'],
    ['The Secret History', 'Donna Tartt', 'A group of classics students at a small college share a terrible secret that slowly pulls them apart.'],
    ['The Big Sleep', 'Raymond Chandler', 'A private eye is hired by a wealthy family and finds blackmail, loyalty, and danger behind the polite faces.'],
    ['Murder on the Orient Express', 'Agatha Christie', 'A snowbound train, a locked-door killing, and twelve suspects for Poirot to question.'],
  ],
  Fantasy: [
    ['The Fellowship of the Ring', 'J.R.R. Tolkien', 'A small hobbit inherits a dangerous ring and sets out with eight companions to destroy it.'],
    ['The Lion, the Witch and the Wardrobe', 'C.S. Lewis', 'Four children step through a wardrobe into a snowy land that has been under a witch\'s spell for a hundred years.'],
    ["Alice's Adventures in Wonderland", 'Lewis Carroll', 'A girl follows a white rabbit down a hole into a world where nothing makes ordinary sense.'],
    ['The Princess Bride', 'William Goldman', 'A farm boy, a stolen princess, a masked pirate, and a duel, told as a funny adventure within an adventure.'],
    ['Mistborn: The Final Empire', 'Brandon Sanderson', 'A street thief discovers she can burn metals for power and joins a crew plotting to topple an immortal ruler.'],
    ['American Gods', 'Neil Gaiman', 'A quiet ex-convict becomes the bodyguard of a strange old man on the eve of a war between old gods and new.'],
    ['The Golem and the Jinni', 'Helene Wecker', 'Two magical beings arrive in 1899 New York and find an unlikely friendship in the immigrant neighborhoods.'],
    ['Good Omens', 'Terry Pratchett and Neil Gaiman', 'An angel and a demon who have grown fond of Earth try to stop the end of the world.'],
    ['A Wizard of Earthsea', 'Ursula K. Le Guin', 'A gifted boy learns the cost of power when pride leads him to release something he cannot control.'],
    ['The Name of the Wind', 'Patrick Rothfuss', 'An innkeeper with a hidden past tells the true story of his rise from street performer to famous and feared figure.'],
  ],
  Classics: [
    ['Great Expectations', 'Charles Dickens', 'An orphan named Pip is given a mysterious fortune and learns what it costs to rise in the world.'],
    ['Wuthering Heights', 'Emily Brontë', 'A stormy love and a long revenge unfold between two families on the Yorkshire moors.'],
    ['Moby-Dick', 'Herman Melville', 'A captain\'s obsession with a great white whale drives his crew across the sea toward disaster.'],
    ['The Picture of Dorian Gray', 'Oscar Wilde', 'A beautiful young man stays unchanged while a hidden portrait takes on the marks of his choices.'],
    ['Dracula', 'Bram Stoker', 'Told through letters and diaries, a group of friends hunts a charming and ancient count from Transylvania.'],
    ['Little Women', 'Louisa May Alcott', 'Four sisters grow up in New England during the Civil War, each chasing her own dream.'],
    ['Emma', 'Jane Austen', 'A confident young matchmaker meddles in her friends\' lives and learns a few lessons about her own heart.'],
    ['The Great Gatsby', 'F. Scott Fitzgerald', 'A mysterious millionaire throws lavish parties on Long Island in the hope of winning back one lost love.'],
    ['To Kill a Mockingbird', 'Harper Lee', 'A young girl in a small Southern town watches her father defend a man everyone has already judged.'],
    ['Crime and Punishment', 'Fyodor Dostoevsky', 'A struggling student commits a crime and is slowly undone by guilt and a persistent investigator.'],
    ['Pride and Prejudice', 'Jane Austen', 'Sharp wit and first impressions collide when a spirited young woman meets a proud, reserved gentleman.'],
    ['Jane Eyre', 'Charlotte Brontë', 'An orphaned governess finds love and a dark secret at Thornfield Hall while fighting to keep her independence.'],
    ['Frankenstein', 'Mary Shelley', 'A young scientist brings a creature to life and must face what it means to create something and then abandon it.'],
  ],
  'Science Fiction': [
    ['Dune', 'Frank Herbert', 'A young heir is sent to a desert planet where water is precious, empires scheme, and the most valuable substance in the universe is found.'],
    ['Fahrenheit 451', 'Ray Bradbury', 'In a future where books are outlawed, a fireman begins to question the job of burning them and what has been lost.'],
    ["Ender's Game", 'Orson Scott Card', 'A gifted child is trained in a military school in orbit to lead humanity against an alien threat, and pays a heavy price.'],
    ["The Hitchhiker's Guide to the Galaxy", 'Douglas Adams', 'An ordinary man is whisked off Earth moments before it is demolished, and begins a hilariously confusing tour of the galaxy.'],
    ['The Left Hand of Darkness', 'Ursula K. Le Guin', 'An envoy visits a frozen world whose people have no fixed gender, and learns about trust, loyalty, and friendship.'],
    ['Neuromancer', 'William Gibson', 'A washed-up hacker is hired for one last job that pulls him through neon cities and the digital world of cyberspace.'],
    ['The War of the Worlds', 'H.G. Wells', 'Towering machines from Mars land in England, and ordinary people must survive as the old world falls apart.'],
    ['Foundation', 'Isaac Asimov', 'A mathematician predicts the fall of a galactic empire and sets up a plan to shorten the dark age that follows.'],
    ['The Martian', 'Andy Weir', 'An astronaut is stranded alone on Mars and has to solve one problem after another to stay alive.'],
    ['The Time Machine', 'H.G. Wells', 'An inventor travels hundreds of thousands of years ahead and discovers what has become of humanity.'],
  ],
};

const schedules = [
  [[4, '19:00'], [0, '16:00']],
  [[1, '19:00'], [6, '10:00']],
  [[2, '18:30'], [0, '14:00']],
  [[3, '19:00'], [6, '11:00']],
  [[5, '18:00'], [0, '15:00']],
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

  for (const [genre, list] of Object.entries(candidates)) {
    let count = await Book.countDocuments({ genre });
    console.log(`${genre}: ${count} book(s) now, aiming for ${TARGET}`);
    for (const [title, author, description] of list) {
      if (count >= TARGET) break;
      if (await Book.findOne({ title })) continue;

      const book = await Book.create({ title, author, genre, description, accentColors: palettes[added % palettes.length] });
      const sched = schedules[added % schedules.length];
      const group = await ReadingGroup.create({
        book: book._id,
        leader: leader._id,
        sessionMinutes: 60,
        timeSlots: sched.map(([dayOfWeek, startTime]) => ({
          dayOfWeek, startTime, timezone: 'America/New_York', capacity: added % 2 === 0 ? 12 : 8, meetingLink: LINK,
        })),
        startDate: new Date(today + (7 + (added % 6)) * DAY),
        totalWeeks: 6,
        currentWeek: 0,
        oneOnOneAllowance: 2,
        status: 'open',
      });
      await Meeting.insertMany(generateMeetings(group));
      count += 1;
      added += 1;
      console.log(`  Added: ${title}`);
    }
  }

  console.log(`Done. ${added} book(s) added.`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});

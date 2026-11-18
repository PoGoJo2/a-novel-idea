// Adds the six newer genre rows to the home page: Horror, Romance, Thriller / Action, True Crime,
// Autobiography, and Self Help / Personal Development. Each gets 8 books (change TARGET to change that).
// Run it from the server folder with:  node src/seed/addNewGenres.js
// It never deletes anything and skips books that already exist, so it is safe to run again.
// New groups start with empty weekly goals, so they show "Coming soon" until a leader fills them in
// (or run  node src/seed/addChapterGoals.js  to fill sample goals).
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const ReadingGroup = require('../models/ReadingGroup');
const Meeting = require('../models/Meeting');
const { generateMeetings } = require('../services/meetingService');

const TARGET = 8;
const DAY = 24 * 60 * 60 * 1000;
const LINK = 'https://teams.microsoft.com/placeholder-meeting-link'; // replace with real links later

// Cover colors for each genre
const palettes = {
  Horror: [{ tint: '#F1E3E6', accent: '#4A1626', ribbon: '#C9B99A' }, { tint: '#E9E4F0', accent: '#2E1F4A', ribbon: '#C9B99A' }, { tint: '#E6E9E8', accent: '#1F2F2B', ribbon: '#B9C9A0' }],
  Romance: [{ tint: '#F8E5EC', accent: '#8A3454', ribbon: '#F0B6C8' }, { tint: '#F6E4E5', accent: '#A63D4A', ribbon: '#F4C9A8' }, { tint: '#EEE5F5', accent: '#6B3A7A', ribbon: '#F0B6C8' }],
  'Thriller / Action': [{ tint: '#F6E4DD', accent: '#7A2410', ribbon: '#F4B24A' }, { tint: '#E6EBF5', accent: '#22365C', ribbon: '#F4B24A' }, { tint: '#E7E7E7', accent: '#2C2F36', ribbon: '#E8C52A' }],
  'True Crime': [{ tint: '#E8EAEE', accent: '#3C4350', ribbon: '#E8C52A' }, { tint: '#EFE6E1', accent: '#5A3A2A', ribbon: '#E8C52A' }, { tint: '#E6EBF5', accent: '#26354F', ribbon: '#E8C52A' }],
  Autobiography: [{ tint: '#F3E8D8', accent: '#7A5330', ribbon: '#E0C08A' }, { tint: '#E4EEEA', accent: '#2D5A52', ribbon: '#E0C08A' }, { tint: '#EDE4D6', accent: '#5C3D22', ribbon: '#E8C46A' }],
  'Self Help / Personal Development': [{ tint: '#E1F0E7', accent: '#1F7A6E', ribbon: '#F4D58A' }, { tint: '#E1EEF2', accent: '#1F5F78', ribbon: '#F4D58A' }, { tint: '#F6EBD3', accent: '#9A6A1F', ribbon: '#F4D58A' }],
};

// Short original descriptions (not copied from publishers). More are listed than needed so there is always enough.
const candidates = {
  Horror: [
    ['The Haunting of Hill House', 'Shirley Jackson', 'Four people spend a summer in a house with a bad reputation, and the house seems to take a special interest in one of them.'],
    ['The Shining', 'Stephen King', 'A struggling writer takes a winter caretaker job at a remote hotel, and the building slowly turns on his family.'],
    ['Interview with the Vampire', 'Anne Rice', 'A vampire tells a reporter the story of his long, lonely life across centuries and continents.'],
    ['The Turn of the Screw', 'Henry James', 'A governess becomes convinced that the two children in her care are being haunted by figures she alone can see.'],
    ['Something Wicked This Way Comes', 'Ray Bradbury', 'Two boys find that a traveling carnival arriving in the night grants wishes in exchange for something precious.'],
    ['Mexican Gothic', 'Silvia Moreno-Garcia', 'A young socialite visits her cousin at a crumbling mountain mansion and uncovers the family secrets beneath it.'],
    ['Bird Box', 'Josh Malerman', 'A mother must guide her children down a river blindfolded, in a world where one glimpse of the outside can be fatal.'],
    ['Carrie', 'Stephen King', 'A shy teenager with a strange gift is pushed too far by cruel classmates and a controlling mother.'],
    ['The Exorcist', 'William Peter Blatty', 'When a girl\'s behavior turns frightening, her mother turns to two priests for help no doctor can give.'],
    ['Pet Sematary', 'Stephen King', 'A family moves next to an old burial ground and learns that some things should stay buried.'],
  ],
  Romance: [
    ['Outlander', 'Diana Gabaldon', 'A nurse is swept back in time to eighteenth-century Scotland and must choose between two very different lives.'],
    ['The Notebook', 'Nicholas Sparks', 'An old man reads from a worn notebook the story of a summer romance that shaped two lives.'],
    ['Me Before You', 'Jojo Moyes', 'A cheerful, out-of-work young woman takes a job caring for a proud man who has lost his old life.'],
    ['The Hating Game', 'Sally Thorne', 'Two rival assistants at a publishing company trade barbs and glances until the competition gets complicated.'],
    ['Beach Read', 'Emily Henry', 'Two writers with opposite styles swap genres for a summer and find the words come easier than the feelings.'],
    ['The Kiss Quotient', 'Helen Hoang', 'A brilliant woman hires an escort to teach her about relationships, and the lessons begin to feel real.'],
    ['Red, White & Royal Blue', 'Casey McQuiston', 'The president\'s son and a British prince start as rivals, and a staged friendship becomes something more.'],
    ['Persuasion', 'Jane Austen', 'Eight years after turning down a naval officer, Anne Elliot meets him again, richer and still unforgiving.'],
    ['The Rosie Project', 'Graeme Simsion', 'A genetics professor designs a questionnaire to find the perfect wife, and a very imperfect woman upends it.'],
    ['One Day', 'David Nicholls', 'Two friends are followed on the same day of the year over twenty years, as they drift together and apart.'],
  ],
  'Thriller / Action': [
    ['The Da Vinci Code', 'Dan Brown', 'A symbologist and a cryptologist race across Europe to decode a trail of clues hidden in famous art.'],
    ['The Hunt for Red October', 'Tom Clancy', 'A Soviet submarine captain heads for the American coast, and a lone analyst must work out what he intends.'],
    ['Jurassic Park', 'Michael Crichton', 'A theme park of cloned dinosaurs goes wrong when the security system fails over one stormy weekend.'],
    ['The Bourne Identity', 'Robert Ludlum', 'A man pulled from the sea with no memory discovers that he has deadly skills and powerful enemies.'],
    ['The Day of the Jackal', 'Frederick Forsyth', 'A professional assassin plans to kill a head of state while a quiet detective races to stop him.'],
    ['The Silence of the Lambs', 'Thomas Harris', 'A young FBI trainee seeks help from an imprisoned genius to catch a killer who is still at large.'],
    ['Angels & Demons', 'Dan Brown', 'A professor has one night to find a hidden threat to the Vatican from an ancient secret society.'],
    ['Casino Royale', 'Ian Fleming', 'A British agent is sent to bankrupt an enemy banker at a high-stakes card table in France.'],
    ['The Girl on the Train', 'Paula Hawkins', 'A commuter who watches a stranger\'s house each day sees something shocking and gets drawn into the aftermath.'],
    ['Gone Girl', 'Gillian Flynn', 'On their anniversary a woman vanishes, and her husband becomes the main suspect in the story that follows.'],
  ],
  'True Crime': [
    ['In Cold Blood', 'Truman Capote', 'A close look at the murder of a Kansas family and the two men who committed it.'],
    ['The Stranger Beside Me', 'Ann Rule', 'A crime writer realizes that her friend and coworker is the killer the police are searching for.'],
    ['Helter Skelter', 'Vincent Bugliosi', 'The prosecutor of a notorious cult trial explains how the case was built and won.'],
    ["I'll Be Gone in the Dark", 'Michelle McNamara', 'A writer\'s obsessive search for a serial offender who terrorized California for years.'],
    ['Midnight in the Garden of Good and Evil', 'John Berendt', 'A visitor to Savannah is drawn into a society of eccentric locals and a sensational murder trial.'],
    ['The Devil in the White City', 'Erik Larson', 'The story of the 1893 World\'s Fair in Chicago and a killer who worked in its shadow.'],
    ['Killers of the Flower Moon', 'David Grann', 'A string of deaths among oil-rich Osage families leads to one of the earliest big cases of the FBI.'],
    ['Bad Blood', 'John Carreyrou', 'A reporter uncovers how a blood-testing start-up built on bold promises came undone.'],
    ['Catch Me If You Can', 'Frank Abagnale', 'A young man tells how he passed himself off as a pilot, a doctor, and a lawyer before he was thirty.'],
    ['Mindhunter', 'John Douglas', 'An FBI profiler explains how he began studying criminals to understand and catch them.'],
  ],
  Autobiography: [
    ['The Diary of a Young Girl', 'Anne Frank', 'A teenager records two years in hiding in Amsterdam, with her hopes, fears, and growing up.'],
    ['I Know Why the Caged Bird Sings', 'Maya Angelou', 'A poet recalls a childhood in the American South and how books and words helped her find her voice.'],
    ['Long Walk to Freedom', 'Nelson Mandela', 'The life story of a village boy who became a prisoner, then a president, and a symbol of hope.'],
    ['Educated', 'Tara Westover', 'A woman raised off the grid teaches herself enough to reach college and then must decide what it costs.'],
    ['Becoming', 'Michelle Obama', 'A memoir that follows a Chicago childhood through a career in law and years in the White House.'],
    ['The Glass Castle', 'Jeannette Walls', 'A journalist looks back on a wandering, unconventional childhood with brilliant and unreliable parents.'],
    ['Born a Crime', 'Trevor Noah', 'Stories of growing up mixed-race in South Africa under apartheid, told with humor and heart.'],
    ['Wild', 'Cheryl Strayed', 'After a hard season of life, a woman sets out alone to hike more than a thousand miles of wilderness trail.'],
    ['Just Kids', 'Patti Smith', 'A singer and poet remembers her early years in New York and her friendship with a young artist.'],
    ['The Autobiography of Benjamin Franklin', 'Benjamin Franklin', 'A founding father tells how he rose from a printer\'s apprentice to a leading thinker and statesman.'],
  ],
  'Self Help / Personal Development': [
    ['Atomic Habits', 'James Clear', 'A practical guide to building small habits that add up, and breaking the ones that hold you back.'],
    ['The 7 Habits of Highly Effective People', 'Stephen R. Covey', 'A classic set of principles for managing time, relationships, and goals with purpose.'],
    ['How to Win Friends and Influence People', 'Dale Carnegie', 'Timeless advice on understanding others, listening well, and building lasting goodwill.'],
    ["Man's Search for Meaning", 'Viktor E. Frankl', 'A psychiatrist reflects on his time in the camps and how people find purpose in the hardest conditions.'],
    ['The Power of Now', 'Eckhart Tolle', 'A guide to quieting a busy mind and living more fully in the present moment.'],
    ['Mindset', 'Carol S. Dweck', 'Research on why believing that abilities can grow changes how people learn, work, and handle setbacks.'],
    ['Deep Work', 'Cal Newport', 'Why focused, distraction-free work is rare and valuable, and how to protect time for it.'],
    ['Daring Greatly', 'Brené Brown', 'An exploration of vulnerability, courage, and why showing up honestly matters.'],
    ['Think and Grow Rich', 'Napoleon Hill', 'A classic on goal-setting and persistence drawn from the habits of successful people.'],
    ['Grit', 'Angela Duckworth', 'Why passion and perseverance often matter more than talent, and how to build them.'],
    ['Essentialism', 'Greg McKeown', 'A case for doing fewer things better by learning to say no to what is not truly important.'],
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

      const book = await Book.create({ title, author, genre, description, accentColors: palettes[genre][added % 3] });
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

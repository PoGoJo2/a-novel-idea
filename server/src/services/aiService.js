const Book = require('../models/Book');
const ReadingGroup = require('../models/ReadingGroup');
const Membership = require('../models/Membership');
const AiNote = require('../models/AiNote');
const { formatBook } = require('./groupService');
const { buyLinks, reviewLinks } = require('./aiLinkService');
const { askModel, isEnabled } = require('./aiModelService');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const GENRE_WORDS = {
  mystery: 'Mystery', detective: 'Mystery', fantasy: 'Fantasy', magic: 'Fantasy', classic: 'Classics', classics: 'Classics',
  'science fiction': 'Science Fiction', 'sci-fi': 'Science Fiction', scifi: 'Science Fiction', space: 'Science Fiction',
  romance: 'Romance', historical: 'Historical', history: 'Historical', 'non-fiction': 'Non-fiction', nonfiction: 'Non-fiction',
  thriller: 'Thriller', suspense: 'Thriller',
};
const STOP = new Set('a an the and or of to in on for with about me my i is are what which who where can could would should please some any book books read reading want like find looking suggest recommend something good next new'.split(' '));

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---- 1. Work out what the reader is asking for ----
const detectIntent = (text) => {
  const t = text.toLowerCase();
  if (/\b(buy|purchase|bookstore|store|shop|price|cheap|library|borrow|where can i (get|find))\b/.test(t)) return 'buy';
  if (/\b(review|reviews|rating|ratings|reception|what do (people|critics) think|worth reading)\b/.test(t)) return 'reviews';
  if (/\b(insight|insights|theme|themes|meaning|symbolism|discuss|discussion)\b/.test(t)) return 'insights';
  if (/\b(notes|study|summary|summarize|summarise|recap|explain|characters?)\b/.test(t)) return 'notes';
  if (/\b(recommend|suggest|find|looking for|what should i read|next book|similar|something)\b/.test(t) || Object.keys(GENRE_WORDS).some((g) => t.includes(g))) return 'recommend';
  return 'help';
};

// ---- 2. Look up real data ----
const findBookInText = async (text, bookId) => {
  if (bookId) return Book.findById(bookId);
  const t = text.toLowerCase();
  const books = await Book.find({}).select('title author genre description pageCount accentColors coverUrl');
  return books.find((b) => t.includes(b.title.toLowerCase())) || null;
};

// How far into the book this reader is allowed to hear about. Members: their group's current week.
// Everyone else (or a group that has not started): week 0 = a spoiler-free overview only.
const spoilerLimitFor = async (userId, book) => {
  const groups = await ReadingGroup.find({ book: book._id, status: { $ne: 'finished' } });
  const fallback = { week: 0, totalWeeks: groups[0]?.totalWeeks || 8, member: false };
  if (!userId || groups.length === 0) return fallback;
  const membership = await Membership.findOne({ user: userId, group: { $in: groups.map((g) => g._id) }, status: 'active' });
  if (!membership) return fallback;
  const group = groups.find((g) => String(g._id) === String(membership.group));
  return { week: group.currentWeek, totalWeeks: group.totalWeeks, member: true };
};

const describeGroups = (groups) =>
  groups.map((g) => g.timeSlots.map((s) => `${DAY_NAMES[s.dayOfWeek]} ${s.startTime} (${s.timezone})`).join(' or ')).join('; ');

const searchBooks = async (text) => {
  const t = text.toLowerCase();
  const genres = [...new Set(Object.entries(GENRE_WORDS).filter(([word]) => t.includes(word)).map(([, genre]) => genre))];
  const days = DAY_NAMES.map((name, i) => (t.includes(name.toLowerCase()) ? i : -1)).filter((i) => i >= 0);
  const words = t.replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w) && !GENRE_WORDS[w]);
  const wantsShort = /\b(short|quick|fast|easy)\b/.test(t);

  const filter = genres.length ? { genre: { $in: genres } } : {};
  let books = await Book.find(filter);

  // Only books that have a reading group you can still join
  const groups = await ReadingGroup.find({ book: { $in: books.map((b) => b._id) }, status: { $ne: 'finished' } });
  const groupsByBook = new Map();
  groups.forEach((g) => groupsByBook.set(String(g.book), [...(groupsByBook.get(String(g.book)) || []), g]));
  books = books.filter((b) => groupsByBook.has(String(b._id)));
  if (days.length) books = books.filter((b) => groupsByBook.get(String(b._id)).some((g) => g.timeSlots.some((s) => days.includes(s.dayOfWeek))));

  const score = (b) => {
    const hay = `${b.title} ${b.author} ${b.description}`.toLowerCase();
    let s = words.filter((w) => new RegExp(`\\b${escapeRegex(w)}`).test(hay)).length * 2;
    if (wantsShort && b.pageCount && b.pageCount <= 250) s += 2;
    return s;
  };
  books.sort((a, b) => score(b) - score(a));
  return { books: books.slice(0, 3), groupsByBook, genres, days, matchedWords: words };
};

// ---- 3. Study notes and insights (never past the allowed week) ----
const genreQuestions = {
  Mystery: ['Which clues seem important so far, and which might be red herrings?', 'Who do you trust least, and why?'],
  Fantasy: ['How does the world’s magic or rules shape what characters can do?', 'What does the journey cost the main character?'],
  'Science Fiction': ['What real-world idea is the story exploring through its technology?', 'Would you want to live in this world?'],
  Classics: ['How does the author’s era shape the characters’ choices?', 'Which line or passage stayed with you?'],
  Romance: ['What is keeping the characters apart?', 'How do their values change as they spend time together?'],
  Historical: ['Which details feel most true to the period?', 'How do ordinary people experience the big events?'],
  'Non-fiction': ['What is the author’s main argument so far?', 'What evidence convinced you, and what did not?'],
  Thriller: ['Where did the tension rise the most?', 'What do you predict will happen next, and why?'],
};

const localNotes = (book, limit, kind) => {
  const { week, totalWeeks } = limit;
  const questions = genreQuestions[book.genre] || ['What stood out to you?', 'What do you want to discuss with the group?'];
  const lines = [];
  if (week === 0) {
    lines.push(`Spoiler-free overview of ${book.title} by ${book.author}:`, book.description);
    lines.push(`It is a ${book.genre.toLowerCase()} title${book.pageCount ? ` of about ${book.pageCount} pages` : ''}. Join its group to unlock notes for each week.`);
  } else {
    const pages = book.pageCount ? Math.ceil((book.pageCount * week) / totalWeeks) : null;
    lines.push(`${kind === 'insights' ? 'Things to think about' : 'Study notes'} for ${book.title}, through week ${week} of ${totalWeeks}${pages ? ` (roughly pages 1–${pages})` : ''}:`);
    lines.push(`Premise: ${book.description}`);
    lines.push('Questions for your group:');
    questions.forEach((question) => lines.push(`• ${question}`));
  }
  lines.push(`I will not describe anything past ${week === 0 ? 'the book’s description' : `week ${week}`}, so nothing gets spoiled.`);
  return lines.join('\n');
};

const makeNotes = async (book, limit, kind) => {
  const type = kind === 'insights' ? 'insights' : 'study-notes';
  const cached = await AiNote.findOne({ book: book._id, type, upToWeek: limit.week });
  if (cached) return { text: cached.content, source: 'ai' };

  const system =
    `You write ${type === 'insights' ? 'thoughtful insights and themes' : 'study notes'} for a book club. ` +
    `The group has read only up to week ${limit.week} of ${limit.totalWeeks} (about ${Math.round((limit.week / limit.totalWeeks) * 100)}% of the book). ` +
    (limit.week === 0
      ? 'Give a spoiler-free overview only: no plot events at all.'
      : 'Never mention any event, character fate, or twist from later in the book. If unsure whether something is later, leave it out.') +
    ' Under 220 words, plain text, with 2-3 discussion questions at the end.';
  const text = await askModel({
    system,
    messages: [{ role: 'user', content: `Book: "${book.title}" by ${book.author} (${book.genre}). Description: ${book.description}` }],
    maxTokens: 600,
  });
  if (!text) return { text: localNotes(book, limit, kind), source: 'local' };

  await AiNote.updateOne({ book: book._id, type, upToWeek: limit.week }, { $set: { content: text, generatedAt: new Date() } }, { upsert: true });
  return { text, source: 'ai' };
};

// ---- 4. The main entry point ----
const chat = async ({ message, bookId, history = [], userId }) => {
  const intent = detectIntent(message);
  const book = await findBookInText(message, bookId);
  const result = { reply: '', books: [], links: [], source: 'local', spoilerLimit: null };

  if (['buy', 'reviews', 'notes', 'insights'].includes(intent) && !book) {
    result.reply = 'Which book do you mean? Tell me its title (or open the book’s page and ask me there), and I can help.';
    return result;
  }

  if (intent === 'buy') {
    result.reply = `Here is where to find “${book.title}”. Libraries are a free option, and Bookshop.org supports independent stores.`;
    result.links = buyLinks(book);
    result.books = [formatBook(book)];
    return result;
  }

  if (intent === 'reviews') {
    result.reply = `Reviews of “${book.title}” live on these sites. Review pages can include spoilers, so skim carefully if you are still reading.`;
    result.links = reviewLinks(book);
    result.books = [formatBook(book)];
    return result;
  }

  if (intent === 'notes' || intent === 'insights') {
    const limit = await spoilerLimitFor(userId, book);
    const notes = await makeNotes(book, limit, intent);
    result.reply = notes.text;
    result.source = notes.source;
    result.spoilerLimit = limit;
    result.books = [formatBook(book)];
    return result;
  }

  if (intent === 'recommend') {
    const found = await searchBooks(message);
    result.books = found.books.map((b) => ({ ...formatBook(b), meets: describeGroups(found.groupsByBook.get(String(b._id))) }));
    if (found.books.length === 0) {
      result.reply = 'I could not find an open reading group that matches that. Try another genre, or browse all the books on the home page.';
      return result;
    }
    const facts = result.books.map((b) => `- ${b.title} by ${b.author} (${b.genre}, ${b.pageCount || '?'} pages): ${b.description} Meets: ${b.meets}`).join('\n');
    const text = await askModel({
      system:
        'You are the friendly reading assistant for A Novel Idea, an online book club. Recommend ONLY from the books listed in the context, ' +
        'in 2-4 short sentences that explain why each fits the reader. Never invent books, plots, or links. No spoilers.',
      messages: [
        ...history.slice(-4).map((m) => ({ role: m.role, content: String(m.content).slice(0, 500) })),
        { role: 'user', content: `${message}\n\nCONTEXT (the only books you may recommend):\n${facts}` },
      ],
      maxTokens: 350,
    });
    result.source = text ? 'ai' : 'local';
    result.reply = text || `Here ${found.books.length === 1 ? 'is a good match' : 'are good matches'} with open reading groups:`;
    return result;
  }

  result.reply = isEnabled()
    ? 'Hi! I can recommend a book from our open groups, find review links, show where to buy a book, or write spoiler-safe study notes for the week your group is on.'
    : 'Hi! I can recommend a book from our open groups, find review links, show where to buy a book, or write spoiler-safe study notes. Try: “Recommend a mystery” or “Where can I buy The Hobbit?”';
  return result;
};

module.exports = { chat, detectIntent };

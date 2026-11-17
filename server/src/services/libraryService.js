const User = require('../models/User');
const Book = require('../models/Book');
const AppError = require('../utils/AppError');

// The lists a reader keeps (hearted, saved for next time, and "notify me when a new group starts"). The key is the field name on the User document.
const LISTS = { favorites: 'favoriteBooks', saved: 'savedBooks', notify: 'notifyBooks' };

const formatBook = (book) => ({
  id: book._id,
  title: book.title,
  author: book.author,
  genre: book.genre,
  description: book.description,
  coverUrl: book.coverUrl,
  accentColors: book.accentColors,
  pageCount: book.pageCount,
});

// Just the ids: the browse page uses these to fill in the hearts and bookmarks
const getIds = async (userId) => {
  const user = await User.findById(userId).select('favoriteBooks savedBooks notifyBooks').lean();
  return {
    favorites: (user?.favoriteBooks || []).map(String),
    saved: (user?.savedBooks || []).map(String),
    notify: (user?.notifyBooks || []).map(String),
  };
};

// Full books for the My Library page, newest first
const getLibrary = async (userId) => {
  const user = await User.findById(userId)
    .select('favoriteBooks savedBooks')
    .populate('favoriteBooks')
    .populate('savedBooks')
    .lean();
  const clean = (list) => (list || []).filter(Boolean).reverse().map(formatBook);
  return { favorites: clean(user?.favoriteBooks), saved: clean(user?.savedBooks) };
};

// Adds or removes one book from one list. $addToSet never creates a duplicate.
const setInList = async (userId, listKey, bookId, on) => {
  const field = LISTS[listKey];
  if (!field) throw new AppError('Unknown list', 400);

  if (on) {
    const exists = await Book.exists({ _id: bookId });
    if (!exists) throw new AppError('That book was not found', 404);
    await User.updateOne({ _id: userId }, { $addToSet: { [field]: bookId } });
  } else {
    await User.updateOne({ _id: userId }, { $pull: { [field]: bookId } });
  }
  return getIds(userId);
};

module.exports = { getIds, getLibrary, setInList };

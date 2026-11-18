const Book = require('../models/Book');
const AppError = require('../utils/AppError');
const groupService = require('./groupService');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Browse the book catalog: filter by genre, search by title or author, paginated
const listBooks = async (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);

  const filter = { retired: { $ne: true } };
  if (query.genre) filter.genre = query.genre;
  if (query.q && query.q.trim()) {
    const rx = new RegExp(escapeRegex(query.q.trim()), 'i');
    filter.$or = [{ title: rx }, { author: rx }];
  }

  const [total, books] = await Promise.all([
    Book.countDocuments(filter),
    Book.find(filter).sort({ title: 1 }).skip((page - 1) * limit).limit(limit),
  ]);

  return {
    books: books.map(groupService.formatBook),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

// One book, plus its reading groups with seats left for each of the two meeting times
const getBookById = async (id) => {
  const book = await Book.findById(id);
  if (!book) throw new AppError('Book not found', 404);

  const { groups } = await groupService.listGroups({ book: book._id, limit: 50 });
  return { ...groupService.formatBook(book), groups };
};

const getBookRecord = async (id) => {
  const book = await Book.findById(id);
  if (!book) throw new AppError('Book not found', 404);
  return book;
};

module.exports = { listBooks, getBookById, getBookRecord };

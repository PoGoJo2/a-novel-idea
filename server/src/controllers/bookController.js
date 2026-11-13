const asyncHandler = require('../utils/asyncHandler');
const bookService = require('../services/bookService');
const { buildBookLinks } = require('../services/linkService');
const { GENRES } = require('../models/Book');

// GET /api/books?genre=&q=&page=&limit=
const listBooks = asyncHandler(async (req, res) => {
  const result = await bookService.listBooks(req.query);
  res.json({ success: true, ...result });
});

// GET /api/books/genres
const getGenres = asyncHandler(async (req, res) => {
  res.json({ success: true, genres: GENRES });
});

// GET /api/books/:id
const getBook = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  res.json({ success: true, book });
});

// GET /api/books/:id/links
const getBookLinks = asyncHandler(async (req, res) => {
  const book = await bookService.getBookRecord(req.params.id);
  res.json({ success: true, links: buildBookLinks(book) });
});

module.exports = { listBooks, getGenres, getBook, getBookLinks };

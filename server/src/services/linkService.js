// Builds review, purchase, and library links in code (never invented by AI).
// These are search pages, so they keep working even when a specific book page moves.
const buildBookLinks = (book) => {
  const q = encodeURIComponent(`${book.title} ${book.author}`);
  return {
    reviews: [
      { name: 'Goodreads', url: `https://www.goodreads.com/search?q=${q}` },
    ],
    buy: [
      { name: 'Bookshop.org', url: `https://bookshop.org/search?keywords=${q}` },
      { name: 'Barnes & Noble', url: `https://www.barnesandnoble.com/s/${q}` },
      { name: 'Amazon', url: `https://www.amazon.com/s?k=${q}&i=stripbooks` },
    ],
    borrow: [
      { name: 'WorldCat (find a library near you)', url: `https://search.worldcat.org/search?q=${q}` },
      { name: 'Open Library', url: `https://openlibrary.org/search?q=${q}` },
    ],
  };
};

module.exports = { buildBookLinks };

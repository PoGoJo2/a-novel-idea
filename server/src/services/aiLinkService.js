// Builds search links for buying and reviewing a book. These are search pages, so they always work,
// and nothing here is made up by an AI.
const q = (book) => encodeURIComponent(`${book.title} ${book.author}`);

const buyLinks = (book) => [
  { label: 'Bookshop.org (supports local stores)', url: `https://bookshop.org/search?keywords=${q(book)}` },
  { label: 'Barnes & Noble', url: `https://www.barnesandnoble.com/s/${q(book)}` },
  { label: 'Amazon', url: `https://www.amazon.com/s?k=${q(book)}` },
  { label: 'Find it at a library (WorldCat)', url: `https://search.worldcat.org/search?q=${q(book)}` },
];

const reviewLinks = (book) => [
  { label: 'Goodreads reviews', url: `https://www.goodreads.com/search?q=${q(book)}` },
  { label: 'The StoryGraph', url: `https://app.thestorygraph.com/browse?search_term=${q(book)}` },
];

module.exports = { buyLinks, reviewLinks };

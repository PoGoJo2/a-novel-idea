import { api } from './api.js';

// The reader's own lists. Everything here needs a logged-in reader.
export const getIds = () => api.get('/library/ids'); // { favorites: [bookId], saved: [bookId] }
export const getLibrary = () => api.get('/library'); // { favorites: [book], saved: [book] }

export const addFavorite = (bookId) => api.put(`/library/favorites/${bookId}`, {});
export const removeFavorite = (bookId) => api.del(`/library/favorites/${bookId}`);
export const addSaved = (bookId) => api.put(`/library/saved/${bookId}`, {});
export const removeSaved = (bookId) => api.del(`/library/saved/${bookId}`);

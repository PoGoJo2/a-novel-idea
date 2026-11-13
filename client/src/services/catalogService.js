import { api } from './api.js';

// Builds ?genre=Fantasy&q=hobbit from an object, skipping empty values
const toQuery = (params = {}) => {
  const clean = Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null);
  const text = new URLSearchParams(clean).toString();
  return text ? `?${text}` : '';
};

export const getGroups = (params) => api.get(`/groups${toQuery(params)}`);
export const getGenres = () => api.get('/books/genres');
export const getBook = (id) => api.get(`/books/${id}`);

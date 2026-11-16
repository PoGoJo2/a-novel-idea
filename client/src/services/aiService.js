import { api } from './api.js';

// Sends a question to the assistant. bookId (optional) tells it which book page the reader is on.
export const askAssistant = ({ message, bookId, history }) => api.post('/ai/chat', { message, bookId, history });

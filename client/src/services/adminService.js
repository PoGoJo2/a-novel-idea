import { api } from './api.js';

// Administrator numbers: { users, books, groups, activeMemberships }
export const getStats = () => api.get('/admin/stats');

// Reading groups
export const getGroups = () => api.get('/admin/groups');
export const createGroup = (body) => api.post('/admin/groups', body);
export const updateGroup = (id, body) => api.put(`/admin/groups/${id}`, body);

// Books
export const getBooks = () => api.get('/admin/books');
export const createBook = (body) => api.post('/admin/books', body);
export const retireBook = (id, retired) => api.put(`/admin/books/${id}/retire`, { retired });

// People
export const getUsers = (params = '') => api.get(`/admin/users${params}`);
export const setRole = (id, role) => api.put(`/admin/users/${id}/role`, { role });
export const suspendUser = (id, suspended, reason = '') => api.put(`/admin/users/${id}/suspend`, { suspended, reason });

// Complaints and reviews
export const getFeedback = (params = '') => api.get(`/admin/feedback${params}`);
export const setFeedbackStatus = (id, status) => api.put(`/admin/feedback/${id}`, { status });

// Any signed-in member can send a complaint or review
export const sendFeedback = (body) => api.post('/feedback', body);

// Leaders volunteering to lead classes
export const getLeaderRequests = () => api.get('/admin/leader-requests');
export const decideLeaderRequest = (id, decision) => api.put(`/admin/leader-requests/${id}`, { decision });
export const getLeaders = () => api.get('/admin/leaders');

import { api } from './api.js';

// Classes I lead, classes I can volunteer for, and my record of finished classes
export const getClasses = () => api.get('/leader/classes');
export const getOpenClasses = () => api.get('/leader/open');
export const getRecord = () => api.get('/leader/record');

export const requestToLead = (groupId, note) => api.post(`/leader/classes/${groupId}/request`, { note });
export const withdrawRequest = (groupId) => api.del(`/leader/classes/${groupId}/request`);
export const finishClass = (groupId) => api.put(`/leader/classes/${groupId}/finish`, {});

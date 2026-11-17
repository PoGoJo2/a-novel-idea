import { api } from './api.js';

// Weekly notes
export const getNotes = (groupId) => api.get(`/groups/${groupId}/notes`);
export const saveNotes = (groupId, weekNumber, content) => api.post(`/groups/${groupId}/notes`, { weekNumber, content });

// One-on-ones
export const getOneOnOnes = (groupId) => api.get(`/groups/${groupId}/one-on-ones`);
export const bookOneOnOne = (slotId) => api.post(`/one-on-ones/${slotId}/book`, {});
export const cancelMyOneOnOne = (slotId) => api.del(`/one-on-ones/${slotId}/book`);

// Leader tools
export const getLedGroups = () => api.get('/me/led-groups');
export const createOneOnOne = (groupId, body) => api.post(`/groups/${groupId}/one-on-ones`, body);
export const withdrawOneOnOne = (slotId) => api.del(`/one-on-ones/${slotId}`);

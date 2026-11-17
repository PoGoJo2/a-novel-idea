import { api } from './api.js';

// Weekly reading goals, such as "Chapters 1-5"
export const getGoals = (groupId) => api.get(`/groups/${groupId}/goals`); // { goals: [{ weekNumber, chapters }] }
export const getCurrentGoals = () => api.get('/goals/current'); // { goals: { groupId: { weekNumber, chapters } } }
export const saveGoal = (groupId, weekNumber, chapters) => api.put(`/groups/${groupId}/goals`, { weekNumber, chapters });

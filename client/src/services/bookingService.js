import { api } from './api.js';

// Everything a logged-in member can do with a reading group
export const joinGroup = (groupId, slotId) => api.post(`/groups/${groupId}/join`, { slotId });
export const switchSlot = (membershipId, slotId) => api.put(`/memberships/${membershipId}`, { slotId });
export const leaveGroup = (membershipId) => api.del(`/memberships/${membershipId}`);
export const getMyMemberships = () => api.get('/me/memberships');

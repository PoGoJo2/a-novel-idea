import { api } from './api.js';

// Public: every leader's profile for the "Meet the Leaders" page
export const getLeaders = () => api.get('/leaders');
// One leader's page with every class they lead
export const getLeader = (id) => api.get(`/leaders/${id}`);
// The signed-in leader's own profile
export const getMyProfile = () => api.get('/leaders/me');
export const saveMyProfile = (profile) => api.put('/leaders/me', profile);

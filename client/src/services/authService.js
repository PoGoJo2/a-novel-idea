import { api } from './api.js';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
export const changePassword = (data) => api.put('/auth/password', data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });

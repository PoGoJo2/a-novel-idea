import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService.js';
import { getToken, setToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken())); // true while we check a saved login

  // On page load, if a token is saved, ask the server who it belongs to
  useEffect(() => {
    if (!getToken()) return;
    authService
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => setToken(null)) // expired or invalid token: forget it
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (details) => {
    const data = await authService.register(details);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // even if the server cannot be reached, log out on this device
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

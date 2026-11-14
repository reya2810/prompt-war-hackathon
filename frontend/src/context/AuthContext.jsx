import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillpath_token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', title = 'System Update') => {
    setToast({ message, type, title, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  const loadUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      console.error("Auth check failed:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem('skillpath_token', data.access_token);
    setToken(data.access_token);
    setUser({
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    showToast(`Welcome back, ${data.name}!`, 'success', 'Authenticated');
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    localStorage.setItem('skillpath_token', data.access_token);
    setToken(data.access_token);
    setUser({
      id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    showToast('Account initialized! Autonomous agent team deployed.', 'success', 'Profile Created');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('skillpath_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, toast, showToast }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


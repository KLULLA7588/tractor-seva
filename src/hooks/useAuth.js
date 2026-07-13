import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { api } from '../lib/api-client';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!storage.getToken());

  const login = (token) => {
    storage.setToken(token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    storage.removeToken();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}

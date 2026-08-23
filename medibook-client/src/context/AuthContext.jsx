import React, { createContext, useState, useEffect } from 'react';
import api, { setApiAccessToken } from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("No active session found on initialization.");
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();

    const handleLogoutEvent = () => {
      setAccessToken(null);
      setApiAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    };

    const handleTokenRefreshed = (e) => {
      setAccessToken(e.detail);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    window.addEventListener('auth:token_refreshed', handleTokenRefreshed);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
      window.removeEventListener('auth:token_refreshed', handleTokenRefreshed);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken: token, role, fullName, userId } = response.data;
      
      setAccessToken(token);
      setApiAccessToken(token);
      setUser({ id: userId, role, fullName });
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setAccessToken(null);
      setApiAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken: token, role, fullName, userId } = response.data;
      
      setAccessToken(token);
      setApiAccessToken(token);
      setUser({ id: userId, role, fullName });
      setIsAuthenticated(true);
      return token;
    } catch (error) {
      setAccessToken(null);
      setApiAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, setAccessToken, isAuthenticated, isLoading, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

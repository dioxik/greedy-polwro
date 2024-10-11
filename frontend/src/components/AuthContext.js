// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      if (token) {
        try {
          await axios.get('/api/validate_token', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error('Invalid token:', error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, [token]);

  const handleLogin = (authToken) => {
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('authToken');
    alert('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ token, handleLogin, handleLogout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
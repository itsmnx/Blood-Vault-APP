import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Load from localStorage once
  useEffect(() => {
    const savedToken = localStorage.getItem('blood_vault_token');
    const savedUser = localStorage.getItem('blood_vault_user');
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  // Save to localStorage when token/user changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('blood_vault_token', token);
    } else {
      localStorage.removeItem('blood_vault_token');
    }

    if (user) {
      localStorage.setItem('blood_vault_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('blood_vault_user');
    }
  }, [token, user]);

  const login = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
  };

  return { token, user, login, logout, updateUser };
}

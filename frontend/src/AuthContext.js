import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [telegramId, setTelegramId] = useState(null);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [user, setUser] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedTelegramId = localStorage.getItem('telegram_id');
    if (storedTelegramId) {
      setTelegramId(storedTelegramId);
    }
  }, []);

  // Save telegram_id to localStorage when it changes
  useEffect(() => {
    if (telegramId) {
      localStorage.setItem('telegram_id', telegramId);
    }
  }, [telegramId]);

  const logout = () => {
    setTelegramId(null);
    setUser(null);
    setPhotoFiles([]);
    localStorage.removeItem('telegram_id');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAge');
    localStorage.removeItem('userGender');
    localStorage.removeItem('userOrientation');
    localStorage.removeItem('userInterests');
    localStorage.removeItem('selectedSpokies');
    localStorage.removeItem('relationshipType');
  };

  const value = {
    telegramId,
    setTelegramId,
    photoFiles,
    setPhotoFiles,
    user,
    setUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
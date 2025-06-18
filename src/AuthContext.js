// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [telegramId, setTelegramId] = useState(null);
    // Додаємо стан для збереження файлів
    const [photoFiles, setPhotoFiles] = useState([]);

    useEffect(() => {
        const storedId = localStorage.getItem("telegram_id");
        if (storedId) {
            setTelegramId(storedId);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ telegramId, setTelegramId, photoFiles, setPhotoFiles }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

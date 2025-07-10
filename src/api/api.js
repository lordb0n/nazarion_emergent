import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';
export const API_URL = `${API_BASE}/auth`;

const PROFILE_URL = 'http://localhost:5000/profile';

// 🔹 Функція реєстрації користувача
export const registerUser = async (userData, photoFiles) => {
    try {
        console.log("📩 Дані перед реєстрацією:", userData);

        // ✅ Перевірка `telegram_id`
        if (!userData.telegram_id || typeof userData.telegram_id !== "string") {
            console.warn("⚠️ 'telegram_id' некоректний, перетворюю в рядок!");
            userData.telegram_id = String(userData.telegram_id);
        }

        // ✅ Створення FormData для відправки
        const formData = new FormData();
        Object.keys(userData).forEach((key) => {
            formData.append(key, userData[key]);
        });

        // Додаємо фото у FormData
        if (Array.isArray(photoFiles) && photoFiles.length > 0) {
            photoFiles.forEach((photo) => {
                console.log(`🖼️ Додаємо фото: ${photo.name}`);
                formData.append('photos', photo);
            });
        } else {
            console.warn("⚠️ Немає фото для завантаження.");
        }

        console.log("📤 Вміст FormData перед відправкою:", Object.fromEntries(formData.entries()));

        // ✅ Відправка даних на сервер
        const response = await axios.post(`${API_URL}/register`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log("✅ Реєстрація успішна!", response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Помилка реєстрації:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// 🔹 Функція отримання профілю користувача
export const getUserProfile = async (telegramId) => {
    try {
        console.log(`🔹 Запит профілю для telegram_id: ${telegramId}`);

        const response = await axios.get(`${PROFILE_URL}/${telegramId}`);
        console.log("🔹 Профіль успішно отримано:", response.data);

        return response.data;
    } catch (error) {
        console.error("❌ Помилка отримання профілю:", error.response ? error.response.data : error.message);
        throw error;
    }
};

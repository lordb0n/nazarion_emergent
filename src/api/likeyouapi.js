// src/api/likeyouapi.js
// HTTP-клієнт для роботи з лайками та чатами через ваш бекенд

import axios from 'axios';

// Базова адреса API (без кінцевого "/api")
const BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

/**
 * Отримати список користувачів, які поставили вам супер-лайк
 * GET /like/likeyou/:telegramId
 * @param {string|number} telegramId - Telegram ID поточного користувача
 * @returns {Promise<Array>} масив профілів
 */
export async function getLikeYou(telegramId) {
  const response = await axios.get(
    `${BASE_URL}/like/likeyou/${telegramId}`
  );
  return response.data;
}

/**
 * Отримати детальний профіль одного користувача
 * GET /like/likeyou/profile/:userId
 * @param {string|number} userId - Telegram ID іншого користувача
 * @returns {Promise<Object>} об'єкт профілю
 */
export async function getUserProfile(userId) {
  const response = await axios.get(
    `${BASE_URL}/like/likeyou/profile/${userId}`
  );
  return response.data;
}

/**
 * Створити новий чат або отримати існуючий між двома користувачами
 * POST /api/chats
 * @param {number} user1_id - Telegram ID першого користувача (поточний)
 * @param {number} user2_id - Telegram ID другого користувача
 * @returns {Promise<Object>} { chat_id: string }
 */
export async function createChat(user1_id, user2_id) {
  const response = await axios.post(
    `${BASE_URL}/api/chats`,
    { user1_id, user2_id }
  );
  return response.data;
}

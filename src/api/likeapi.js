

// src/api/likeapi.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE || '';


export async function getRecommendations(telegramId) {
  const response = await axios.get(`${BASE_URL}/like/recommendations/${telegramId}`);  return response.data;
}

export async function sendSwipe(fromTelegramId, toTelegramId, action) {
  const response = await axios.post(`${BASE_URL}/like/swipe`, {
    userId: fromTelegramId,
    targetUserId: toTelegramId,
    action
  });
  return response.data;
}


export const getChats = (userId) =>
  axios.get(`${process.env.REACT_APP_API_BASE}/chats`, {
    params: { userId }
  });

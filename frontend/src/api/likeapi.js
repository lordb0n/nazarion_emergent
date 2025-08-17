// src/api/likeapi.js - Compatibility layer for old search component
import { searchUsers, sendLike } from './api';

// Legacy API functions for backward compatibility
export async function getRecommendations(telegramId) {
  try {
    const response = await searchUsers(telegramId, 0, 10);
    return response.users || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

export async function sendSwipe(fromTelegramId, toTelegramId, action) {
  try {
    const response = await sendLike(fromTelegramId, toTelegramId, action);
    return response;
  } catch (error) {
    console.error('Error sending swipe:', error);
    throw error;
  }
}
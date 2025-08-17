// src/api/likeyouapi.js - API functions for individual profile views
import { getUserProfile } from './api';

// Get user profile for like you page
export { getUserProfile };

// Create chat functionality - placeholder for now
export async function createChat(currentUserId, targetUserId) {
  // TODO: Implement chat creation when chat system is fully ready
  console.log(`Creating chat between ${currentUserId} and ${targetUserId}`);
  return {
    data: {
      chat_id: `chat_${Date.now()}_${currentUserId}_${targetUserId}`
    }
  };
}
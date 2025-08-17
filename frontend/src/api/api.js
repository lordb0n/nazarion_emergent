import axios from 'axios';

// Get backend URL from environment variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API
export const registerUser = async (userData, photoFiles) => {
  try {
    console.log("📩 Data before registration:", userData);

    // Validate telegram_id
    if (!userData.telegram_id || typeof userData.telegram_id !== "string") {
      console.warn("⚠️ 'telegram_id' incorrect, converting to string!");
      userData.telegram_id = String(userData.telegram_id);
    }

    // Create FormData for sending
    const formData = new FormData();
    Object.keys(userData).forEach((key) => {
      if (key === 'interested_in' || key === 'relationship_type' || key === 'selectedSpokies') {
        // Convert arrays to JSON strings
        formData.append(key, JSON.stringify(userData[key]));
      } else {
        formData.append(key, userData[key]);
      }
    });

    // Add photos to FormData
    if (Array.isArray(photoFiles) && photoFiles.length > 0) {
      photoFiles.forEach((photo) => {
        console.log(`🖼️ Adding photo: ${photo.name}`);
        formData.append('photos', photo);
      });
    } else {
      console.warn("⚠️ No photos to upload.");
    }

    console.log("📤 FormData content before sending:", Object.fromEntries(formData.entries()));

    // Send data to server
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("✅ Registration successful!", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Registration error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Profile API
export const getUserProfile = async (telegramId) => {
  try {
    console.log(`🔹 Requesting profile for telegram_id: ${telegramId}`);

    const response = await api.get(`/api/profile/${telegramId}`);
    console.log("🔹 Profile successfully retrieved:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ Profile retrieval error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const updateUserProfile = async (telegramId, profileData) => {
  try {
    const response = await api.put(`/api/profile/${telegramId}`, profileData);
    return response.data;
  } catch (error) {
    console.error("❌ Profile update error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Search API
export const searchUsers = async (telegramId, skip = 0, limit = 10) => {
  try {
    const response = await api.get(`/api/search/users?telegram_id=${telegramId}&skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("❌ Search users error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Like API
export const sendLike = async (telegramId, targetUserId, action) => {
  try {
    const response = await api.post(`/api/like?telegram_id=${telegramId}`, {
      target_user_id: targetUserId,
      action: action
    });
    return response.data;
  } catch (error) {
    console.error("❌ Send like error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getReceivedLikes = async (telegramId) => {
  try {
    const response = await api.get(`/api/likes/received/${telegramId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Get received likes error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Chat API
export const getUserChats = async (telegramId) => {
  try {
    const response = await api.get(`/api/chats/${telegramId}`);
    return response.data;
  } catch (error) {
    console.error("❌ Get chats error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getChatMessages = async (chatId, skip = 0, limit = 50) => {
  try {
    const response = await api.get(`/api/chats/${chatId}/messages?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("❌ Get chat messages error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const sendMessage = async (chatId, message, telegramId) => {
  try {
    const response = await api.post(`/api/chats/${chatId}/messages?telegram_id=${telegramId}`, {
      chat_id: chatId,
      message: message
    });
    return response.data;
  } catch (error) {
    console.error("❌ Send message error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/health');
    return response.data;
  } catch (error) {
    console.error("❌ Health check error:", error.response ? error.response.data : error.message);
    throw error;
  }
};
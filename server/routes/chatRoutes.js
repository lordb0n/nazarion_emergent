// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Створити новий чат або повернути існуючий
router.post('/', chatController.createChat);
// Отримати список чатів для користувача
router.get('/', chatController.getChats);
// Отримати історію повідомлень конкретного чату
router.get('/:chatId/messages', chatController.getMessages);
// Надіслати повідомлення в чат
router.post('/:chatId/messages', chatController.sendMessage);
// PATCH /api/chats/:chatId/read?userId=...
router.patch('/:chatId/read', chatController.markChatAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');

// Роут отримання рекомендацій для свайпу
router.get('/recommendations/:telegramId', likeController.getRecommendations);

// Роут обробки свайпу (like, dislike, superlike)
router.post('/swipe', likeController.handleSwipe);

module.exports = router;

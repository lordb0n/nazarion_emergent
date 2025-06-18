// server/routes/likeyouRoutes.js
const express = require('express');
const router = express.Router();
const likeyouController = require('../controllers/likeyouController');

// ----- Виправлення -----
// 1) Перенесемо “отримати профіль користувача” на власний шлях
//    Наприклад, GET /api/likeyou/profile/:id 
router.get('/profile/:id', likeyouController.getUserProfile);

// 2) Залишаємо ТІЛЬКИ цей маршрут для “хто мені поставив superlike”
router.get('/:telegramId', likeyouController.getLikeYou);

// 3) Залишаємо оновлення (PUT /profile того, хто лайкнув) якщо потрібно
router.put('/profile/:id', likeyouController.updateLikeYouProfile);

module.exports = router;

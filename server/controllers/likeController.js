const db = require('../db/db');

// Отримати рекомендації (список користувачів для свайпу)
exports.getRecommendations = async (req, res) => {
  const telegram_id = req.params.telegramId;
  try {
    // Припустимо, що є логіка вибору користувачів для рекомендацій
    const { rows } = await db.query(
      `SELECT u.telegram_id, u.name, u.age, u.orientation, u.bio, u.profile_photo
       FROM users u
       WHERE u.telegram_id <> $1
       ORDER BY RANDOM()
       LIMIT 10`,
      [telegram_id]
    );
    // Якщо profile_photo зберігається як JSON-рядок, розпарсимо його:
    const candidates = rows.map(user => {
      if (typeof user.profile_photo === 'string') {
        try {
          user.profile_photo = JSON.parse(user.profile_photo);
        } catch {
          user.profile_photo = [];
        }
      }
      return user;
    });
    res.status(200).json(candidates);
  } catch (error) {
    console.error('❌ Помилка отримання recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

// Обробити свайп (like, dislike, superlike)
exports.handleSwipe = async (req, res) => {
  const { userId, targetUserId, action } = req.body;

  // Додаткові валідації (якщо потрібно):
  if (!userId || !targetUserId || !['like','dislike','superlike'].includes(action)) {
    return res.status(400).json({ error: 'Невірні дані для свайпу' });
  }

  try {
    await db.query(
      `INSERT INTO likes (user_id, liked_user_id, status, liked_at)
       VALUES ($1, $2, $3, NOW())`,
      [userId, targetUserId, action]
    );

    return res.status(200).json({ message: 'Swipe saved' });
  } catch (error) {
    console.error('❌ Помилка збереження свайпу:', error);
    return res.status(500).json({ error: 'Failed to save swipe' });
  }
};
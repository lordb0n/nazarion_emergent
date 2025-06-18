// server/controllers/likeyouController.js

const db = require('../db/db');

// -------------------------------------------------------------
// 1) getLikeYouProfile – тепер працює ТІЛЬКИ за шляхом /profile/:id
// -------------------------------------------------------------
exports.getUserProfile = async (req, res) => {
  const userId = req.params.id;                     // <-- звертаємося до `:id`
  try {
    // Дістаємо тільки з таблиці users
    const { rows } = await db.query(
      `SELECT
         telegram_id   AS userId,
         name,
         age,
         gender,
         orientation,
         interested_in,
         relationship_type,
         profile_photo,
         bio,
         selected_spokies
       FROM users
       WHERE telegram_id = $1`,
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = rows[0];

    // Розпарсимо JSON-рядок profile_photo
    if (typeof profile.profile_photo === 'string') {
      try { profile.profile_photo = JSON.parse(profile.profile_photo) }
      catch { profile.profile_photo = [] }
    }

    // Розпарсимо JSON-рядок selected_spokies
    if (typeof profile.selected_spokies === 'string') {
      try { profile.selected_spokies = JSON.parse(profile.selected_spokies) }
      catch { profile.selected_spokies = [] }
    }

    return res.json(profile);
  } catch (err) {
    console.error('❌ getUserProfile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};



// -------------------------------------------------------------
// 2) getLikeYou – вибирає тих, хто поставив вам superlike
// -------------------------------------------------------------
exports.getLikeYou = async (req, res) => {
  try {
    const { telegramId } = req.params;

    // Перевіряємо, чи такий користувач у системі існує
    const userCheck = await db.query(
      'SELECT 1 FROM users WHERE telegram_id = $1',
      [telegramId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Основний запит: вибірка з таблиці likes
    const query = `
      SELECT
        l.like_id,
        u.telegram_id AS userId,
        u.name,
        u.age,
        u.gender,
        u.orientation,
        u.interested_in,
        u.relationship_type,
        u.profile_photo,
        u.bio
      FROM likes l
      JOIN users u ON u.telegram_id = l.user_id
      WHERE l.liked_user_id = $1
        AND l.status = 'superlike'
      ORDER BY l.liked_at DESC
    `;
    const { rows } = await db.query(query, [telegramId]);

    // Розпарсимо JSON‐рядки profile_photo, якщо потрібно
    rows.forEach(r => {
      if (typeof r.profile_photo === 'string') {
        try {
          r.profile_photo = JSON.parse(r.profile_photo);
        } catch {
          r.profile_photo = [];
        }
      }
    });

    return res.status(200).json(rows);
  } catch (err) {
    console.error('❌ Помилка getLikeYou:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

// -------------------------------------------------------------
// 3) updateLikeYouProfile – оновлює профіль (необов’язково)
// -------------------------------------------------------------
exports.updateLikeYouProfile = async (req, res) => {
  const telegram_id = req.params.id;
  let {
    name,
    bio,
    relationship_type,
    selected_spokies,
    gender,
    orientation,
    interested_in,
    location_lat,
    location_long,
    tokens
  } = req.body;

  // Якщо selected_spokies прийшла не рядком, перетворимо в JSON
  if (selected_spokies && typeof selected_spokies !== 'string') {
    selected_spokies = JSON.stringify(selected_spokies);
  }

  try {
    await db.query(
      `UPDATE users SET
         name = $1,
         bio = $2,
         relationship_type = $3,
         selected_spokies = $4,
         gender = $5,
         orientation = $6,
         interested_in = $7,
         location_lat = $8,
         location_long = $9,
         tokens = $10
       WHERE telegram_id = $11`,
      [
        name,
        bio,
        relationship_type,
        selected_spokies,
        gender,
        orientation,
        interested_in,
        location_lat,
        location_long,
        tokens,
        telegram_id
      ]
    );
    return res.status(200).json({ message: 'Profile updated' });
  } catch (error) {
    console.error('❌ Помилка оновлення профілю:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
};

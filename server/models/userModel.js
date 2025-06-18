// server/models/userModel.js
const pool = require('../db/db');

// Функція для створення користувача
const createUser = async (data) => {
  const {
    telegram_id,
    name,
    age,
    gender,
    orientation,
    interested_in,
    relationship_type,      // вид стосунків (рядок)
    selected_spokies,       // спокуси (JSON-рядок)
    profile_photo,
    bio,
    tokens
  } = data;

  await pool.query(
    `INSERT INTO users (
       telegram_id,
       name,
       age,
       gender,
       orientation,
       interested_in,
       relationship_type,
       selected_spokies,
       profile_photo,
       bio,
       tokens,
       created_at
     )
     VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9, $10,
       $11,NOW()
     )`,
    [
      telegram_id,
      name,
      age,
      gender,
      orientation,
      interested_in,       // JSON-рядок або null
      relationship_type,    // рядок, наприклад, "Без зобов’язань"
      selected_spokies,     // JSON-рядок, наприклад "[1,2,5]"
      profile_photo,        // JSON-рядок з масивом фото
      bio,
      tokens
    ]
  );
};

// Оновлення користувача (profile)
const updateUserFields = async (telegram_id, { name, bio, relationship_type, selected_spokies }) => {
  const query = `
    UPDATE users
       SET name = $1,
           bio = $2,
           relationship_type = $3,
           selected_spokies = $4
     WHERE telegram_id = $5
  `;
  await pool.query(query, [name, bio, relationship_type, selected_spokies, telegram_id]);
};


// Отримання користувача
const getUserById = async (telegram_id) => {
  const query = 'SELECT * FROM users WHERE telegram_id = $1';
  const result = await pool.query(query, [telegram_id]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};

module.exports = {
  createUser,
  getUserById,
  updateUserFields,
  
};

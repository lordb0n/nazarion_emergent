// server/db/db.js
// server/db.js
const { Pool } = require('pg');

const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  // завантажуємо локальний .env тільки в девелопменті
  require('dotenv').config({ path: './server/db.env' });
}

// Додатковий лог — що є в process.env
console.log('🌍 ENV VARIABLES:', {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  // додай сюди ще ключі, які очікуєш побачити
});

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL is not defined! Перевір змінні оточення.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => console.log('✅ Connected to Postgres'));
pool.on('error', err => console.error('⚠️ Postgres pool error:', err));

module.exports = pool;

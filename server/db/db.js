// server/db/db.js
// Не підвантажуємо локальний .env у продакшні – змінну DATABASE_URL задаємо в Railway Variables
// Для локальної розробки можна розкоментувати наступний рядок:
// require('dotenv').config({ path: './server/db.env' });

const { Pool } = require('pg');

// Отримуємо URL підключення з оточення
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL is not defined! Перевір змінні оточення.');
  process.exit(1);
}

// Налаштовуємо Pool з SSL, щоб працювало на Railway
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Лог при успішному підключенні
pool.on('connect', () => {
  console.log('✅ Connected to Postgres');
});

// Лог при помилці в пулі
pool.on('error', (err) => {
  console.error('⚠️ Postgres pool error:', err);
});

// За потреби: чистий вихід при завершенні процесу
process.on('SIGINT', async () => {
  await pool.end();
  console.log('🛑 Postgres pool has ended');
  process.exit(0);
});

module.exports = pool;

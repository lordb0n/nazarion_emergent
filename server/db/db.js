// server/db/db.js
const path = require('path');
const { Pool } = require('pg');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: path.join(__dirname, 'db.env')
  });
}

console.log('🌍 ENV VARIABLES:', {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV:     process.env.NODE_ENV
});

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL is not defined!');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Примусове підключення одразу при старті
pool.connect()
  .then(client => {
    console.log('✅ Connected to Postgres');
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to Postgres:', err);
    process.exit(1);
  });

// Обробка помилок у пулі
pool.on('error', err => {
  console.error('⚠️ Postgres pool error:', err);
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log('🛑 Postgres pool has ended');
  process.exit(0);
});

module.exports = pool;

// server/db/db.js
require('dotenv').config();            // якщо хочете локально читати .env
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('✅ Database connection established');
});
pool.on('error', err => {
  console.error('❌ Unexpected error on idle client:', err.message);
});

(async () => {
  const dbInfo = await pool.query(`SELECT current_database() AS db`);
  console.log('🗄  Connected to database:', dbInfo.rows[0].db);
  const tables = await pool.query(`
    SELECT tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public';
  `);
  console.log('📋 Visible tables:', tables.rows.map(r => r.tablename));
  console.log('🔌 Connecting to Postgres with:', process.env.DATABASE_URL);
})();

module.exports = pool;

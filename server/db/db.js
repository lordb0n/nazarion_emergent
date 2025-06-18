require('dotenv').config({ path: './server/db.env' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
});

(async () => {
  const dbInfo = await pool.query(`SELECT current_database() AS db, current_schema() AS schema`);
  console.log('🗄️ This Node is connected to:', dbInfo.rows[0]);

  const tables = await pool.query(`
    SELECT tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public';
  `);
  console.log('📋 Visible tables:', tables.rows.map(r => r.tablename));
})();

module.exports = pool;

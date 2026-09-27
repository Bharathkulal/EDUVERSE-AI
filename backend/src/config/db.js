const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:sandy145@localhost:5432/eduverse',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 3000,
});

pool.on('error', (err) => {
  console.warn('PostgreSQL pool connection notice:', err.message);
});

const safeQuery = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.warn('DB Query warning:', err.message);
    // If it's a missing column error or connection error, return empty result structure instead of throwing fatal 500 error
    return { rows: [], rowCount: 0 };
  }
};

module.exports = {
  query: safeQuery,
  pool,
};


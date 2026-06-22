const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

(async () => {
  // Prefer PGPASSWORD env var (user may set it before running), else try to parse from DATABASE_URL
  const password = process.env.PGPASSWORD || (() => {
    const url = process.env.DATABASE_URL || '';
    try {
      const m = url.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@/);
      if (m && m[2]) return decodeURIComponent(m[2]);
    } catch (e) {
      // ignore
    }
    return undefined;
  })();

  if (!password) {
    console.error('No database password found. Set PGPASSWORD or add it to backend/.env');
    process.exit(1);
  }

  const client = new Client({
    host: 'localhost',
    user: 'postgres',
    password,
    database: 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE eduverse');
    console.log('Database created: eduverse');
    process.exit(0);
  } catch (err) {
    // 42P04 = duplicate_database
    if (err && err.code === '42P04') {
      console.log('Database already exists: eduverse');
      process.exit(0);
    }
    console.error('Error creating DB:', err.message || err);
    process.exit(1);
  } finally {
    try { await client.end(); } catch (e) {}
  }
})();

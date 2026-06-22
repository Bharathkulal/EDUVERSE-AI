const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

const sqlPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
if (!fs.existsSync(sqlPath)) {
  console.error('Schema file not found at', sqlPath);
  process.exit(1);
}
const sql = fs.readFileSync(sqlPath, 'utf8');

const password = process.env.PGPASSWORD || (() => {
  const url = process.env.DATABASE_URL || '';
  const m = url.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@/);
  if (m && m[2]) return decodeURIComponent(m[2]);
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
  database: 'eduverse',
  port: 5432,
});

(async () => {
  try {
    await client.connect();
    console.log('Applying schema...');
    await client.query(sql);
    console.log('Schema applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error applying schema:', err.message || err);
    process.exit(1);
  } finally {
    try { await client.end(); } catch (e) {}
  }
})();

require('dotenv').config();
const db = require('../config/db');

async function test() {
  try {
    const tableCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'reviews';
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Success: reviews table exists in the database!');
      
      const columnCheck = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'reviews';
      `);
      console.log('Columns:');
      columnCheck.rows.forEach(col => {
        console.log(` - ${col.column_name}: ${col.data_type}`);
      });

      const userColumnCheck = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'review_submitted';
      `);
      if (userColumnCheck.rows.length > 0) {
        console.log('✅ Success: users.review_submitted column exists!');
      } else {
        console.log('❌ Failure: users.review_submitted column does not exist.');
      }
    } else {
      console.log('❌ Failure: reviews table does not exist in the database.');
    }
  } catch (err) {
    console.error('❌ Error executing database check:', err.message);
  } finally {
    process.exit(0);
  }
}

test();

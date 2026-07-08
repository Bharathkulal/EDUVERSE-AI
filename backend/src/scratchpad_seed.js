require('dotenv').config();
const db = require('./config/db');

async function seed() {
  try {
    console.log('Seeding telemetry data...');

    // 1. Insert mock students if none exist
    const studentsCount = await db.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    if (parseInt(studentsCount.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO users (name, email, password, role, api_limit, api_used_today) VALUES 
        ('Alice Johnson', 'alice@eduverse.ai', 'password123', 'student', 150, 45),
        ('Bob Smith', 'bob@eduverse.ai', 'password123', 'student', 100, 22),
        ('Charlie Brown', 'charlie@eduverse.ai', 'password123', 'student', 100, 80),
        ('Diana Prince', 'diana@eduverse.ai', 'password123', 'student', 200, 110)
      `);
      console.log('Mock students inserted.');
    }

    // 2. Insert mock activity logs to populate graphs
    const logsCount = await db.query("SELECT COUNT(*) FROM user_activity_logs");
    if (parseInt(logsCount.rows[0].count) === 0) {
      const studentRes = await db.query("SELECT id FROM users WHERE role = 'student' LIMIT 2");
      if (studentRes.rows.length > 0) {
        const s1 = studentRes.rows[0].id;
        const s2 = studentRes.rows[1].id;

        // Insert logs for past 7 days
        for (let i = 0; i < 7; i++) {
          const dateStr = `NOW() - INTERVAL '${i} days'`;
          await db.query(`
            INSERT INTO user_activity_logs (user_id, action, module, value, api_used, created_at) VALUES 
            (${s1}, 'login', 'Auth', '192.168.1.1', false, ${dateStr}),
            (${s1}, 'run_code', 'Coding', 'passed tests', true, ${dateStr} - INTERVAL '2 hours'),
            (${s2}, 'submit_quiz', 'Quizzes', 'score: 85', false, ${dateStr} - INTERVAL '4 hours'),
            (${s2}, 'ai_prompt', 'AI Tutor', 'Recursion help', true, ${dateStr} - INTERVAL '6 hours')
          `);
        }
        console.log('Mock activity logs inserted.');
      }
    }

    // 3. Insert mock training jobs
    const jobsCount = await db.query("SELECT COUNT(*) FROM ml_training_jobs");
    if (parseInt(jobsCount.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO ml_training_jobs (model_version, status, dataset_size, accuracy, loss, epochs) VALUES 
        ('edu-core-v24', 'Completed', 1500, 0.9420, 0.0540, 100),
        ('edu-placement-v12', 'Completed', 820, 0.9120, 0.0820, 100),
        ('edu-interview-v3', 'Completed', 640, 0.8950, 0.1040, 80)
      `);
      console.log('Mock ML jobs inserted.');
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();

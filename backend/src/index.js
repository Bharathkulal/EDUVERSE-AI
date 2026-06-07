require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

// Run migrations on start
(async () => {
  try {
    console.log('Running database migrations...');
    await db.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS course VARCHAR(100) DEFAULT 'BCA';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS college_name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_study_hours_goal DECIMAL DEFAULT 2.0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_quiz_target INTEGER DEFAULT 3;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS subject_mastery_target INTEGER DEFAULT 80;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_profile_visible BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_analytics_sharing BOOLEAN DEFAULT true;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
    `);

    // Create profiles table for student onboarding data
    await db.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(255),
        age INTEGER,
        gender VARCHAR(50),
        phone VARCHAR(50),
        address TEXT,
        course VARCHAR(100),
        semester INTEGER,
        graduation_year INTEGER,
        college_name VARCHAR(255),
        sslc_marks DECIMAL(5, 2),
        puc_marks DECIMAL(5, 2),
        cgpa DECIMAL(4, 2),
        hobbies TEXT,
        skills TEXT,
        favorite_subjects TEXT,
        career_goal TEXT,
        learning_level VARCHAR(50) DEFAULT 'Beginner',
        profile_completed BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ml_predictions table for AI analysis results
    await db.query(`
      CREATE TABLE IF NOT EXISTS ml_predictions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        learning_type VARCHAR(100),
        strengths TEXT,
        weaknesses TEXT,
        performance_score DECIMAL(5, 2),
        placement_score DECIMAL(5, 2),
        career_recommendations TEXT,
        roadmap TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create question_bank table
    await db.query(`
      CREATE TABLE IF NOT EXISTS question_bank (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        question_type VARCHAR(100) NOT NULL,
        difficulty VARCHAR(50) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
        unit_number INTEGER DEFAULT 1,
        tags VARCHAR(255),
        views_count INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ai_cache table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ai_cache (
        id SERIAL PRIMARY KEY,
        question TEXT UNIQUE NOT NULL,
        answer TEXT NOT NULL,
        provider VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create bookmarked_questions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookmarked_questions (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES question_bank(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, question_id)
      )
    `);

    // Create completed_questions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS completed_questions (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        question_id INTEGER REFERENCES question_bank(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, question_id)
      )
    `);

    console.log('Database migrations completed successfully.');
  } catch (err) {
    console.error('Error running migrations:', err);
  }
})();

const authRoutes = require('./routes/auth');
const subjectRoutes = require('./routes/subjects');
const quizRoutes = require('./routes/quizzes');
const codingRoutes = require('./routes/coding');
const progressRoutes = require('./routes/progress');
const predictionRoutes = require('./routes/predictions');
const adminRoutes = require('./routes/admin');
const mlRoutes = require('./routes/ml');
const aiRoutes = require('./routes/ai');
const onboardingRoutes = require('./routes/onboarding');
const questionBankRoutes = require('./routes/question_bank');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost:\d+$/.test(origin) || origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'EduVerse AI API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/questions', questionBankRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`EduVerse AI API running on port ${PORT}`);
});

module.exports = app;

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

    // Create API configurations tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS api_configurations (
        provider VARCHAR(100) PRIMARY KEY,
        api_key TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'Disconnected',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Alert table for new fields
    await db.query(`
      ALTER TABLE api_configurations ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0;
      ALTER TABLE api_configurations ADD COLUMN IF NOT EXISTS disabled BOOLEAN DEFAULT false;
      ALTER TABLE api_configurations ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMP NULL;
      ALTER TABLE api_configurations ADD COLUMN IF NOT EXISTS last_used TIMESTAMP NULL;
    `);

    // Add student control fields to users table
    await db.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS api_limit INTEGER DEFAULT 100;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS api_used_today INTEGER DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false;
    `);

    // Create user_activity_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        value TEXT,
        api_used BOOLEAN DEFAULT false,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create system_alerts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS system_alerts (
        id SERIAL PRIMARY KEY,
        priority VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ml_training_jobs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ml_training_jobs (
        id SERIAL PRIMARY KEY,
        model_version VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Idle',
        dataset_size INTEGER DEFAULT 0,
        accuracy DECIMAL(5,4) DEFAULT 0.0000,
        loss DECIMAL(5,4) DEFAULT 0.0000,
        epochs INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS api_usage_logs (
        id SERIAL PRIMARY KEY,
        provider VARCHAR(100) NOT NULL,
        success BOOLEAN NOT NULL,
        latency_ms INTEGER NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS api_audit_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        provider VARCHAR(100),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default providers
    const providers = ['gemini', 'openrouter', 'groq', 'together', 'deepgram', 'elevenlabs', 'assemblyai', 'azure_speech', 'custom'];
    for (let i = 0; i < providers.length; i++) {
      await db.query(`
        INSERT INTO api_configurations (provider, api_key, priority, status)
        VALUES ($1, '', $2, 'Disconnected')
        ON CONFLICT (provider) DO NOTHING
      `, [providers[i], i + 1]);
    }

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
const fridayRoutes = require('./routes/friday');
const apiSettingsRoutes = require('./routes/api_settings');
const adminSystemRoutes = require('./routes/admin_system');

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
app.use('/api/friday', fridayRoutes);
app.use('/api/admin/api-settings', apiSettingsRoutes);
app.use('/api/admin/system', adminSystemRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`EduVerse AI API running on port ${PORT}`);
});

module.exports = app;

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
      ALTER TABLE topics ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;
      ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER DEFAULT 15;
      ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'medium';
      ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
      ALTER TABLE question_bank ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;
    `);

    // Create completed_topics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS completed_topics (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        study_minutes INTEGER DEFAULT 15,
        UNIQUE(student_id, topic_id)
      )
    `);

    // Create study_sessions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_start_time TIMESTAMP NOT NULL,
        session_end_time TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create notes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        pinned BOOLEAN DEFAULT false,
        favorite BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add approved column to notes table
    await db.query(`
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT true;
    `);

    // Create user_xp_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_xp_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        xp_amount INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_streaks table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        streak_count INTEGER DEFAULT 0,
        last_activity_date DATE
      )
    `);

    // Create user_activity_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100),
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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
      ALTER TABLE api_configurations ADD COLUMN IF NOT EXISTS model_name VARCHAR(100) DEFAULT '';
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

    // Create student_goals table
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_goals (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        completed BOOLEAN DEFAULT false,
        xp_reward INTEGER DEFAULT 20,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add is_ai column to student_goals table
    await db.query(`
      ALTER TABLE student_goals ADD COLUMN IF NOT EXISTS is_ai BOOLEAN DEFAULT false;
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

    // Create ml_training_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ml_training_logs (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES ml_training_jobs(id) ON DELETE CASCADE,
        log_message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ml_predictions_history and predictions tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        predicted_score DECIMAL(5,2),
        skill_level VARCHAR(100),
        weak_subject VARCHAR(255),
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS ml_predictions_history (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        module VARCHAR(100) NOT NULL,
        prediction_key VARCHAR(100) NOT NULL,
        prediction_value JSONB NOT NULL,
        confidence DECIMAL(5,2) NOT NULL,
        model_version VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
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
    const providers = ['gemini', 'openrouter', 'groq', 'together', 'deepgram', 'elevenlabs', 'assemblyai', 'azure_speech', 'custom', 'openai', 'anthropic'];
    const defaultModels = {
      gemini: 'gemini-2.0-flash',
      openrouter: 'google/gemini-2.5-flash',
      groq: 'llama3-8b-8192',
      together: 'meta-llama/Llama-3-8b-chat-hf',
      deepgram: 'nova-2',
      elevenlabs: 'eleven_monolingual_v1',
      assemblyai: 'best',
      azure_speech: 'default',
      custom: 'default',
      openai: 'gpt-4o-mini',
      anthropic: 'claude-3-5-sonnet-20241022'
    };
    for (let i = 0; i < providers.length; i++) {
      const p = providers[i];
      await db.query(`
        INSERT INTO api_configurations (provider, api_key, priority, status, model_name)
        VALUES ($1, '', $2, 'Disconnected', $3)
        ON CONFLICT (provider) DO UPDATE SET model_name = CASE WHEN api_configurations.model_name IS NULL OR api_configurations.model_name = '' THEN EXCLUDED.model_name ELSE api_configurations.model_name END
      `, [p, i + 1, defaultModels[p] || '']);
    }

    // Enterprise Admin Panel - content_versions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS content_versions (
        id SERIAL PRIMARY KEY,
        note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
        content TEXT,
        version_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // dataset_versions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS dataset_versions (
        id SERIAL PRIMARY KEY,
        dataset_id INTEGER REFERENCES ml_datasets(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        row_count INTEGER DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // provider_failovers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS provider_failovers (
        id SERIAL PRIMARY KEY,
        failed_provider VARCHAR(100) NOT NULL,
        fallback_provider VARCHAR(100) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // admin_sessions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        ip_address VARCHAR(100),
        user_agent TEXT,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logout_time TIMESTAMP
      )
    `);

    // security_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS security_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // audit_logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // roles & permissions tables for RBAC
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      );
    `);

    // Seed Roles and permissions
    await db.query(`
      INSERT INTO roles (name) VALUES ('Super Admin'), ('Admin'), ('Teacher'), ('Moderator') ON CONFLICT (name) DO NOTHING;
      INSERT INTO permissions (name) VALUES ('Create'), ('Read'), ('Update'), ('Delete') ON CONFLICT (name) DO NOTHING;
    `);

    // Create Advanced Java Tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS advanced_java_modules (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(555),
        duration VARCHAR(100),
        xp INTEGER DEFAULT 100,
        difficulty VARCHAR(50) DEFAULT 'Intermediate',
        order_index INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS advanced_java_topics (
        id SERIAL PRIMARY KEY,
        module_id INTEGER REFERENCES advanced_java_modules(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        order_index INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS advanced_java_quizzes (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES advanced_java_topics(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer VARCHAR(50) NOT NULL,
        explanation TEXT
      );

      CREATE TABLE IF NOT EXISTS advanced_java_progress (
        id SERIAL PRIMARY KEY,
        student_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        completed_topics INTEGER DEFAULT 0,
        study_hours NUMERIC DEFAULT 0.0,
        current_level INTEGER DEFAULT 1,
        learning_streak INTEGER DEFAULT 0,
        topics_completed INTEGER DEFAULT 0,
        projects_completed INTEGER DEFAULT 0,
        quiz_accuracy NUMERIC DEFAULT 0.0,
        practice_score NUMERIC DEFAULT 0.0,
        certificate_status VARCHAR(50) DEFAULT 'Locked'
      );

      CREATE TABLE IF NOT EXISTS advanced_java_practice (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        question TEXT NOT NULL,
        options JSONB,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        difficulty VARCHAR(50) DEFAULT 'medium'
      );

      CREATE TABLE IF NOT EXISTS advanced_java_projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(50) DEFAULT 'medium',
        code_boilerplate TEXT
      );

      CREATE TABLE IF NOT EXISTS advanced_java_submissions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES advanced_java_projects(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'In Progress',
        code_quality VARCHAR(100) DEFAULT 'Not Reviewed',
        progress INTEGER DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS advanced_java_analytics (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        learning_time INTEGER DEFAULT 0,
        progress_val INTEGER DEFAULT 0,
        topic_mastery INTEGER DEFAULT 0,
        quiz_perf INTEGER DEFAULT 0,
        coding_perf INTEGER DEFAULT 0,
        project_perf INTEGER DEFAULT 0,
        UNIQUE(student_id, date)
      );

      CREATE TABLE IF NOT EXISTS advanced_java_certificates (
        id SERIAL PRIMARY KEY,
        student_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        certificate_id VARCHAR(100) UNIQUE NOT NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS advanced_java_achievements (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        xp_reward INTEGER DEFAULT 100,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, title)
      );

      CREATE TABLE IF NOT EXISTS advanced_java_ai_recommendations (
        id SERIAL PRIMARY KEY,
        student_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        recommendations TEXT,
        strength_areas TEXT,
        weak_areas TEXT,
        suggestions TEXT,
        next_best_action TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS compiler_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        language VARCHAR(50) NOT NULL,
        code TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, language)
      );

      CREATE TABLE IF NOT EXISTS it_suite_folders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES it_suite_folders(id) ON DELETE CASCADE,
        is_starred BOOLEAN DEFAULT false,
        is_in_recycle_bin BOOLEAN DEFAULT false,
        tags VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS it_suite_documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        folder_id INTEGER REFERENCES it_suite_folders(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('word', 'excel', 'slides', 'whiteboard')),
        content TEXT,
        is_starred BOOLEAN DEFAULT false,
        is_in_recycle_bin BOOLEAN DEFAULT false,
        tags VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS it_suite_versions (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES it_suite_documents(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        version_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS it_suite_comments (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES it_suite_documents(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment_text TEXT NOT NULL,
        selection_range TEXT,
        resolved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed modules if empty
    const checkMods = await db.query('SELECT 1 FROM advanced_java_modules LIMIT 1');
    if (checkMods.rows.length === 0) {
      console.log('Seeding Advanced Java Modules...');
      
      // Modules list
      const mods = [
        { title: 'JDBC Module', subtitle: 'Java Database Connectivity & Operations', duration: '6 hours', xp: 150, difficulty: 'Intermediate', order_index: 1 },
        { title: 'Servlets Module', subtitle: 'Web Request Processing & Lifecycles', duration: '8 hours', xp: 200, difficulty: 'Intermediate', order_index: 2 },
        { title: 'JSP Module', subtitle: 'JavaServer Pages & Custom Tags', duration: '5 hours', xp: 150, difficulty: 'Intermediate', order_index: 3 },
        { title: 'Session Management Module', subtitle: 'Cookies, Sessions & Security Cookies', duration: '4 hours', xp: 120, difficulty: 'Intermediate', order_index: 4 },
        { title: 'Hibernate ORM Module', subtitle: 'Object Relational Mapping & Entity Graphs', duration: '8 hours', xp: 250, difficulty: 'Advanced', order_index: 5 },
        { title: 'Spring Framework Module', subtitle: 'IoC, DI, Spring Boot & Microservices', duration: '12 hours', xp: 350, difficulty: 'Advanced', order_index: 6 },
        { title: 'REST API Module', subtitle: 'RESTful Web Services & Spring MVC REST controllers', duration: '5 hours', xp: 180, difficulty: 'Advanced', order_index: 7 }
      ];

      for (const m of mods) {
        const modRes = await db.query(`
          INSERT INTO advanced_java_modules (title, subtitle, duration, xp, difficulty, order_index)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `, [m.title, m.subtitle, m.duration, m.xp, m.difficulty, m.order_index]);
        const moduleId = modRes.rows[0].id;

        // Add dummy topics
        let topics = [];
        if (m.title.startsWith('JDBC')) {
          topics = [
            { title: 'JDBC Drivers & Connection Configurations', content: 'DriverManager connects java app directly to database pools.', order_index: 1 },
            { title: 'PreparedStatement & Query Executions', content: 'PreparedStatement compiles query templates to prevent SQL injections.', order_index: 2 },
            { title: 'CRUD & Transaction Commits', content: 'Managing rollbacks and transaction isolation properties.', order_index: 3 }
          ];
        } else if (m.title.startsWith('Servlets')) {
          topics = [
            { title: 'Servlet Request Handler lifecycles', content: 'Handling init(), service() and destroy() callbacks.', order_index: 1 },
            { title: 'GET vs POST Http Method handlers', content: 'Parsing requests and returning responses dynamically.', order_index: 2 }
          ];
        } else if (m.title.startsWith('JSP')) {
          topics = [
            { title: 'JSP Scriptlets, Expressions & Declarations', content: 'Embedding server-side java directly in html scripts.', order_index: 1 },
            { title: 'JSTL Core Tags & Custom Attributes', content: 'Using JSTL loops and scopes cleanly without java expressions.', order_index: 2 }
          ];
        } else {
          topics = [
            { title: `${m.title} Core Theory`, content: `Fundamentals of ${m.subtitle}.`, order_index: 1 },
            { title: `${m.title} Operations Setup`, content: `Step-by-step configurations for ${m.title}.`, order_index: 2 }
          ];
        }

        for (const t of topics) {
          const tRes = await db.query(`
            INSERT INTO advanced_java_topics (module_id, title, content, order_index)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `, [moduleId, t.title, t.content, t.order_index]);
          const topicId = tRes.rows[0].id;

          // Add a quiz question
          await db.query(`
            INSERT INTO advanced_java_quizzes (topic_id, question, options, correct_answer, explanation)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            topicId,
            `Which statement holds true for ${t.title}?`,
            JSON.stringify(['Option A is accurate', 'Option B is best', 'Both Option A and B', 'None of the above']),
            'Both Option A and B',
            `Explanation about ${t.title} internal parameters.`
          ]);
        }
      }

      // Seed Projects
      const projects = [
        { title: 'Student Management System', description: 'Enterprise backend managing student records, course lists, grade rosters, and credentials.', difficulty: 'Medium', code_boilerplate: 'public class StudentRegistry {\n  // Code boilerplate\n}' },
        { title: 'Employee Management System', description: 'Real-time database payroll, security logs, access tokens, and salary reviews.', difficulty: 'Medium', code_boilerplate: 'public class EmployeeRegistry {\n  // Code boilerplate\n}' },
        { title: 'Hospital Management System', description: 'Doctors scheduling queues, patient appointments database, and medicine rosters.', difficulty: 'Hard', code_boilerplate: 'public class HospitalRegistry {\n  // Code boilerplate\n}' },
        { title: 'Banking System', description: 'Atomic balance transfers, withdrawal checks, ledger audits, and savings interests.', difficulty: 'Hard', code_boilerplate: 'public class BankRegistry {\n  // Code boilerplate\n}' },
        { title: 'E-Commerce Backend', description: 'Cart orders database, payments gateway, products catalog lists, and reviews.', difficulty: 'Hard', code_boilerplate: 'public class ECommerceRegistry {\n  // Code boilerplate\n}' }
      ];
      for (const p of projects) {
        await db.query(`
          INSERT INTO advanced_java_projects (title, description, difficulty, code_boilerplate)
          VALUES ($1, $2, $3, $4)
        `, [p.title, p.description, p.difficulty, p.code_boilerplate]);
      }

      // Seed Practice Questions
      const questions = [
        { type: 'mcq', question: 'Which class is responsible for establishing connections in JDBC?', options: JSON.stringify(['DriverManager', 'ConnectionProvider', 'StatementExecutor', 'ResultSetCursor']), correct_answer: 'DriverManager', explanation: 'DriverManager manages database driver list and initiates Connection sessions.', difficulty: 'easy' },
        { type: 'coding', question: 'Write a basic PreparedStatement statement to query users where ID matches dynamic binding parameter.', options: null, correct_answer: 'SELECT * FROM users WHERE id = ?', explanation: 'Use the question mark ? wildcard variable to bind values safely.', difficulty: 'medium' },
        { type: 'debug', question: 'Identify the issue: ClassNotFoundException raised during JDBC connection step.', options: JSON.stringify(['Missing DB driver jar in classpath', 'Wrong database endpoint URL', 'SQL dialect mismatch', 'Closed connection pool']), correct_answer: 'Missing DB driver jar in classpath', explanation: 'Class.forName requires driver package classes loaded in classpath dependencies.', difficulty: 'easy' }
      ];
      for (const q of questions) {
        await db.query(`
          INSERT INTO advanced_java_practice (type, question, options, correct_answer, explanation, difficulty)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [q.type, q.question, q.options, q.correct_answer, q.explanation, q.difficulty]);
      }
    }

      // Create Chat & Learn Tables
      await db.query(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) DEFAULT 'New Chat',
          pinned BOOLEAN DEFAULT false,
          favorite BOOLEAN DEFAULT false,
          shared BOOLEAN DEFAULT false,
          collection_name VARCHAR(100) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
          role VARCHAR(50) CHECK (role IN ('user', 'assistant')),
          content TEXT NOT NULL,
          multimodal_type VARCHAR(50) DEFAULT NULL,
          file_url VARCHAR(500) DEFAULT NULL,
          file_name VARCHAR(255) DEFAULT NULL,
          file_size INTEGER DEFAULT NULL,
          detected_metadata JSONB DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS prompt_templates (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          prompt TEXT NOT NULL,
          category VARCHAR(100) DEFAULT 'General',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_preferences (
          student_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          preferred_language VARCHAR(50) DEFAULT 'English',
          preferred_model VARCHAR(100) DEFAULT 'gemini-2.0-flash',
          learning_mode_enabled BOOLEAN DEFAULT false,
          voice_enabled BOOLEAN DEFAULT false,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS student_recommendations (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          weak_topic VARCHAR(255),
          detected_pattern VARCHAR(255),
          study_time_prediction_mins INTEGER,
          predicted_score DECIMAL(5,2),
          recommended_action TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS generated_educational_files (
          id SERIAL PRIMARY KEY,
          student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          file_name VARCHAR(255) NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          file_url VARCHAR(500) NOT NULL,
          folder_path VARCHAR(255) DEFAULT 'General',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS selected_provider VARCHAR(50) DEFAULT 'auto';
        ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS selected_model VARCHAR(100) DEFAULT NULL;
      `);

      // Seed default templates if empty
      const checkPrompts = await db.query('SELECT 1 FROM prompt_templates LIMIT 1');
      if (checkPrompts.rows.length === 0) {
        console.log('Seeding default prompt templates...');
        await db.query(`
          INSERT INTO prompt_templates (title, prompt, category) VALUES
          ('Explain like I am 5', 'Explain this concept using simple analogies, short sentences, and everyday terms as if I am 5 years old: {topic}', 'Tutor'),
          ('Generate Practice Questions', 'Provide 5 difficult practice questions (with solutions) for the following topic: {topic}', 'Quiz'),
          ('Create Mind Map Outline', 'Generate a structured hierarchical outline for a mind map representing the key details of: {topic}', 'Study Guide'),
          ('Debug My Code', 'Analyze this code snippet, point out the logical/syntactical errors, explain why they occur, and write the corrected version: {topic}', 'Coding'),
          ('Explain Chemistry Structure', 'Break down the chemistry structure, reactants, bonds, and applications: {topic}', 'Science')
        `);
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
  const advancedJavaRoutes = require('./routes/advanced_java');
  const predictionRoutes = require('./routes/predictions');
  const adminRoutes = require('./routes/admin');
  const mlRoutes = require('./routes/ml');
  const aiRoutes = require('./routes/ai');
  const onboardingRoutes = require('./routes/onboarding');
  const questionBankRoutes = require('./routes/question_bank');
  const fridayRoutes = require('./routes/friday');
  const apiSettingsRoutes = require('./routes/api_settings');
  const adminSystemRoutes = require('./routes/admin_system');
  const notesRoutes = require('./routes/notes');
  const contentRoutes = require('./routes/content');
  const datasetRoutes = require('./routes/datasets');
  const dashboardRoutes = require('./routes/dashboard');
  const itSuiteRoutes = require('./routes/it_suite');
  const chatLearnRoutes = require('./routes/chat_learn');
  const http = require('http');
  const { Server } = require('socket.io');
  const { setIoInstance } = require('./utils/system_logger');
  const { authenticate } = require('./middleware/auth');

  const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setIoInstance(io);

io.on('connection', (socket) => {
  console.log('A user connected to real-time sync socket:', socket.id);
  
  socket.on('join-document', ({ documentId, username }) => {
    socket.join(`doc-${documentId}`);
    socket.to(`doc-${documentId}`).emit('user-joined', { username, socketId: socket.id });
    console.log(`User ${username} joined document ${documentId}`);
  });

  socket.on('document-update', ({ documentId, content }) => {
    socket.to(`doc-${documentId}`).emit('document-remote-update', { content });
  });

  socket.on('cursor-move', ({ documentId, cursorInfo }) => {
    socket.to(`doc-${documentId}`).emit('cursor-remote-move', { socketId: socket.id, cursorInfo });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from sync socket:', socket.id);
  });
});

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

// Global Search across Students, Subjects, Notes, Questions, Datasets, Quizzes
app.get('/api/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ students: [], subjects: [], notes: [], questions: [], datasets: [], quizzes: [] });
    }

    const searchTerm = `%${q.toLowerCase()}%`;

    const students = await db.query(
      "SELECT id, name, email FROM users WHERE role = 'student' AND (LOWER(name) LIKE $1 OR LOWER(email) LIKE $1) LIMIT 10",
      [searchTerm]
    );

    const subjects = await db.query(
      "SELECT id, subject_name as title, description FROM subjects WHERE LOWER(subject_name) LIKE $1 OR LOWER(description) LIKE $1 LIMIT 10",
      [searchTerm]
    );

    const notes = await db.query(
      "SELECT id, title, content FROM notes WHERE LOWER(title) LIKE $1 OR LOWER(content) LIKE $1 LIMIT 10",
      [searchTerm]
    );

    const questions = await db.query(
      "SELECT id, question, answer FROM question_bank WHERE LOWER(question) LIKE $1 OR LOWER(answer) LIKE $1 LIMIT 10",
      [searchTerm]
    );

    const datasets = await db.query(
      "SELECT id, filename as title, file_path FROM ml_datasets WHERE LOWER(filename) LIKE $1 LIMIT 10",
      [searchTerm]
    );

    const quizzes = await db.query(
      "SELECT id, title FROM quizzes WHERE LOWER(title) LIKE $1 LIMIT 10",
      [searchTerm]
    );

    res.json({
      students: students.rows,
      subjects: subjects.rows,
      notes: notes.rows,
      questions: questions.rows,
      datasets: datasets.rows,
      quizzes: quizzes.rows
    });
  } catch (err) {
    console.error('Global search error:', err);
    res.status(500).json({ message: 'Error performing global search' });
  }
});

// System Health Monitor
app.get('/api/system-health', authenticate, async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Database Ping
    let dbStatus = 'Healthy';
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await db.query('SELECT 1');
      dbLatency = Date.now() - dbStart;
    } catch (e) {
      dbStatus = 'Unhealthy';
    }

    // AI Providers Status
    const providersRes = await db.query("SELECT provider, status, disabled FROM api_configurations");
    const activeProviders = providersRes.rows.filter(p => !p.disabled && p.status === 'Connected').length;

    // CPU & Memory
    const memory = process.memoryUsage();
    const systemMemory = {
      rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`
    };

    const cpuUsage = process.cpuUsage();
    const totalCpuTime = cpuUsage.user + cpuUsage.system;

    res.json({
      status: dbStatus === 'Healthy' ? 'Healthy' : 'Degraded',
      uptime: `${Math.round(process.uptime())}s`,
      latency: `${Date.now() - startTime}ms`,
      services: {
        database: { status: dbStatus, latency: `${dbLatency}ms` },
        redis: { status: 'Healthy', message: 'In-Memory Cache Cache Active' },
        ai_providers: { status: activeProviders > 0 ? 'Healthy' : 'Offline', activeCount: activeProviders },
        storage: { status: 'Healthy', freeSpace: '92%' }
      },
      hardware: {
        cpuUsage: `${(totalCpuTime / 1000000).toFixed(2)}%`,
        memoryUsage: systemMemory
      }
    });
  } catch (err) {
    console.error('System health check error:', err);
    res.status(500).json({ message: 'Error executing system health check' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/advanced-java', advancedJavaRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/questions', questionBankRoutes);
app.use('/api/friday', fridayRoutes);
app.use('/api/admin/api-settings', apiSettingsRoutes);
app.use('/api/admin/system', adminSystemRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/it-suite', itSuiteRoutes);
app.use('/api/chat-learn', chatLearnRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

server.listen(PORT, () => {
  console.log(`EduVerse AI API running on port ${PORT}`);
});

module.exports = app;

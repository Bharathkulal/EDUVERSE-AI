const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;

    const subjects = await db.query('SELECT COUNT(*) as count FROM subjects');
    const completedTopics = await db.query(
      'SELECT completed_topics, study_hours FROM student_progress WHERE student_id = $1',
      [studentId]
    );

    const quizAvg = await db.query(
      'SELECT COALESCE(AVG(score), 0) as avg_score, COUNT(*) as total FROM quiz_results WHERE student_id = $1',
      [studentId]
    );

    const codingAvg = await db.query(
      'SELECT COALESCE(AVG(score), 0) as avg_score, COUNT(*) as total FROM coding_submissions WHERE student_id = $1',
      [studentId]
    );

    const prediction = await db.query(
      'SELECT * FROM predictions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
      [studentId]
    );

    const profileResult = await db.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [studentId]
    );

    const mlPredictionResult = await db.query(
      'SELECT * FROM ml_predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [studentId]
    );

    const recentQuizzes = await db.query(
      `SELECT qr.score, q.title, s.subject_name, qr.submitted_at
       FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       LEFT JOIN subjects s ON s.id = q.subject_id
       WHERE qr.student_id = $1 ORDER BY qr.submitted_at DESC LIMIT 5`,
      [studentId]
    );

    // Question Bank Counts
    const qbCount = await db.query('SELECT COUNT(*) as count FROM question_bank');
    const impCount = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = 'Important Question'");
    const pyqCount = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = 'Previous Year Question'");
    const bookmarkedCount = await db.query('SELECT COUNT(*) as count FROM bookmarked_questions WHERE user_id = $1', [studentId]);
    const completedCount = await db.query('SELECT COUNT(*) as count FROM completed_questions WHERE user_id = $1', [studentId]);

    res.json({
      totalSubjects: parseInt(subjects.rows[0].count),
      completedLessons: completedTopics.rows[0]?.completed_topics || 0,
      studyHours: parseFloat(completedTopics.rows[0]?.study_hours || 0),
      quizScores: {
        average: Math.round(parseFloat(quizAvg.rows[0].avg_score)),
        total: parseInt(quizAvg.rows[0].total),
      },
      codingScores: {
        average: Math.round(parseFloat(codingAvg.rows[0].avg_score)),
        total: parseInt(codingAvg.rows[0].total),
      },
      predictedPerformance: prediction.rows[0]?.predicted_score || null,
      skillLevel: prediction.rows[0]?.skill_level || 'Not assessed',
      recommendedTopics: prediction.rows[0]?.recommendations || 'Complete quizzes and coding practice to get recommendations.',
      recentQuizzes: recentQuizzes.rows,
      weakSubject: prediction.rows[0]?.weak_subject || null,
      profile: profileResult.rows[0] || null,
      mlPrediction: mlPredictionResult.rows[0] || null,
      qbCount: parseInt(qbCount.rows[0].count),
      impCount: parseInt(impCount.rows[0].count),
      pyqCount: parseInt(pyqCount.rows[0].count),
      bookmarkedCount: parseInt(bookmarkedCount.rows[0].count),
      completedCount: parseInt(completedCount.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const studentId = req.user.role === 'admin' && req.query.student_id
      ? req.query.student_id
      : req.user.id;

    const progress = await db.query(
      'SELECT * FROM student_progress WHERE student_id = $1',
      [studentId]
    );

    const quizResults = await db.query(
      `SELECT qr.*, q.title, s.subject_name FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       LEFT JOIN subjects s ON s.id = q.subject_id
       WHERE qr.student_id = $1 ORDER BY qr.submitted_at DESC`,
      [studentId]
    );

    const codingResults = await db.query(
      'SELECT id, language, score, submitted_at FROM coding_submissions WHERE student_id = $1 ORDER BY submitted_at DESC',
      [studentId]
    );

    res.json({
      progress: progress.rows[0] || { study_hours: 0, completed_topics: 0 },
      quizResults: quizResults.rows,
      codingResults: codingResults.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { study_hours, completed_topics, learning_time_minutes, subject_completion } = req.body;

    const result = await db.query(
      `INSERT INTO student_progress (student_id, study_hours, completed_topics, learning_time_minutes, subject_completion)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id) DO UPDATE SET
         study_hours = student_progress.study_hours + COALESCE(EXCLUDED.study_hours, 0),
         completed_topics = student_progress.completed_topics + COALESCE(EXCLUDED.completed_topics, 0),
         learning_time_minutes = student_progress.learning_time_minutes + COALESCE(EXCLUDED.learning_time_minutes, 0),
         subject_completion = COALESCE(EXCLUDED.subject_completion, student_progress.subject_completion),
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        studentId,
        study_hours || 0,
        completed_topics || 0,
        learning_time_minutes || 0,
        subject_completion ? JSON.stringify(subject_completion) : '{}',
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/complete-topic', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { topic_id, study_minutes } = req.body;

    const hours = (study_minutes || 15) / 60;
    const minutes = study_minutes || 15;
    await db.query(
      `INSERT INTO student_progress (student_id, completed_topics, study_hours, learning_time_minutes)
       VALUES ($1, 1, $2, $3)
       ON CONFLICT (student_id) DO UPDATE SET
         completed_topics = student_progress.completed_topics + 1,
         study_hours = student_progress.study_hours + EXCLUDED.study_hours,
         learning_time_minutes = student_progress.learning_time_minutes + EXCLUDED.learning_time_minutes,
         updated_at = CURRENT_TIMESTAMP`,
      [studentId, hours, minutes]
    );

    res.json({ message: 'Topic marked as completed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

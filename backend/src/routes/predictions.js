const express = require('express');
const axios = require('axios');
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/student', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await db.query(
      'SELECT * FROM predictions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
      [studentId]
    );
    res.json(result.rows[0] || { message: 'No predictions yet. Complete activities to generate predictions.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/generate/:studentId?', authenticate, async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user.id;

    if (req.user.role !== 'admin' && parseInt(studentId) !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const quizAvg = await db.query(
      'SELECT COALESCE(AVG(score), 0) as avg FROM quiz_results WHERE student_id = $1',
      [studentId]
    );
    const codingAvg = await db.query(
      'SELECT COALESCE(AVG(score), 0) as avg FROM coding_submissions WHERE student_id = $1',
      [studentId]
    );
    const progress = await db.query(
      'SELECT study_hours, completed_topics FROM student_progress WHERE student_id = $1',
      [studentId]
    );

    const studentData = {
      quiz_score: parseFloat(quizAvg.rows[0].avg) || 0,
      coding_score: parseFloat(codingAvg.rows[0].avg) || 0,
      study_hours: parseFloat(progress.rows[0]?.study_hours || 0),
      attendance: Math.min(100, (progress.rows[0]?.completed_topics || 0) * 5),
    };

    let mlResult = null;
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL}/predict/student`,
        studentData,
        { timeout: 10000 }
      );
      mlResult = mlResponse.data;
    } catch {
      const combined = (studentData.quiz_score + studentData.coding_score) / 2;
      const predicted = Math.min(100, combined * 0.7 + studentData.study_hours * 2 + studentData.attendance * 0.1);
      let skill = 'Beginner';
      if (predicted >= 75) skill = 'Advanced';
      else if (predicted >= 50) skill = 'Intermediate';

      mlResult = {
        predicted_score: Math.round(predicted * 10) / 10,
        skill_level: skill,
        weak_subject: studentData.quiz_score < studentData.coding_score ? 'Theory Subjects' : 'Coding Practice',
        recommendations: 'Focus on weak areas and complete more practice exercises.',
      };
    }

    const result = await db.query(
      `INSERT INTO predictions (student_id, predicted_score, skill_level, weak_subject, recommendations)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        studentId,
        mlResult.predicted_score,
        mlResult.skill_level,
        mlResult.weak_subject,
        mlResult.recommendations,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating prediction' });
  }
});

router.get('/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.name, u.email FROM predictions p
       JOIN users u ON u.id = p.student_id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const mlEngine = require('../services/ml_engine');

// 4. GET /api/predictions/modules/:type - Get module prediction from ML Engine
router.get('/modules/:type', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { type } = req.params;
    const { language } = req.query;
    
    const result = await mlEngine.predict(studentId, type, { language });
    res.json(result);
  } catch (err) {
    console.error('Error fetching module prediction:', err);
    res.status(500).json({ message: 'Error generating module prediction' });
  }
});

// 5. GET /api/predictions/history - Get prediction history logs
router.get('/history', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT h.*, u.name, u.email 
       FROM ml_predictions_history h
       JOIN users u ON u.id = h.student_id
       ORDER BY h.created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching prediction history:', err);
    res.status(500).json({ message: 'Error retrieving prediction history' });
  }
});

module.exports = router;

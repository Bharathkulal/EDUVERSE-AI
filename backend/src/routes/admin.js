const express = require('express');
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get('/dashboard', async (req, res) => {
  try {
    const students = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const subjects = await db.query('SELECT COUNT(*) as count FROM subjects');
    const quizzes = await db.query('SELECT COUNT(*) as count FROM quizzes');
    const avgPerformance = await db.query(
      'SELECT COALESCE(AVG(score), 0) as avg FROM quiz_results'
    );
    const recentStudents = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC LIMIT 10"
    );

    res.json({
      totalStudents: parseInt(students.rows[0].count),
      totalSubjects: parseInt(subjects.rows[0].count),
      totalQuizzes: parseInt(quizzes.rows[0].count),
      averagePerformance: Math.round(parseFloat(avgPerformance.rows[0].avg)),
      recentStudents: recentStudents.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.created_at,
        sp.study_hours, sp.completed_topics,
        (SELECT COALESCE(AVG(score), 0) FROM quiz_results WHERE student_id = u.id) as avg_quiz_score,
        (SELECT COALESCE(AVG(score), 0) FROM coding_submissions WHERE student_id = u.id) as avg_coding_score
      FROM users u
      LEFT JOIN student_progress sp ON sp.student_id = u.id
      WHERE u.role = 'student'`;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }
    query += ' ORDER BY u.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = $1 AND role = 'student'", [req.params.id]);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

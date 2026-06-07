const express = require('express');
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { subject_id, topic_id } = req.query;
    let query = `
      SELECT q.*, s.subject_name,
        (SELECT COUNT(*) FROM questions qu WHERE qu.quiz_id = q.id) as question_count
      FROM quizzes q
      LEFT JOIN subjects s ON s.id = q.subject_id
      WHERE 1=1`;
    const params = [];
    if (subject_id) {
      params.push(subject_id);
      query += ` AND q.subject_id = $${params.length}`;
    }
    if (topic_id) {
      params.push(topic_id);
      query += ` AND q.topic_id = $${params.length}`;
    }
    query += ' ORDER BY q.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const quiz = await db.query(
      `SELECT q.*, s.subject_name FROM quizzes q
       LEFT JOIN subjects s ON s.id = q.subject_id WHERE q.id = $1`,
      [req.params.id]
    );
    if (quiz.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });

    const questions = await db.query(
      'SELECT id, quiz_id, question, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = $1',
      [req.params.id]
    );

    res.json({ ...quiz.rows[0], questions: questions.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { subject_id, topic_id, title, questions } = req.body;
    const quizResult = await db.query(
      'INSERT INTO quizzes (subject_id, topic_id, title) VALUES ($1, $2, $3) RETURNING *',
      [subject_id, topic_id || null, title]
    );
    const quiz = quizResult.rows[0];

    if (questions?.length) {
      for (const q of questions) {
        await db.query(
          `INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [quiz.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer]
        );
      }
    }

    res.status(201).json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, subject_id, topic_id } = req.body;
    const result = await db.query(
      'UPDATE quizzes SET title = COALESCE($1, title), subject_id = COALESCE($2, subject_id), topic_id = COALESCE($3, topic_id) WHERE id = $4 RETURNING *',
      [title, subject_id, topic_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM quizzes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/:id/submit',
  authenticate,
  [body('answers').isArray()],
  validate,
  async (req, res) => {
    try {
      const quizId = req.params.id;
      const { answers } = req.body;
      const studentId = req.user.id;

      const questions = await db.query(
        'SELECT id, correct_answer FROM questions WHERE quiz_id = $1',
        [quizId]
      );

      let score = 0;
      const total = questions.rows.length;

      for (const q of questions.rows) {
        const studentAnswer = answers.find((a) => a.question_id === q.id);
        if (studentAnswer && studentAnswer.answer?.toLowerCase() === q.correct_answer) {
          score++;
        }
      }

      const percentScore = total > 0 ? Math.round((score / total) * 100) : 0;

      await db.query(
        'INSERT INTO quiz_results (student_id, quiz_id, score, total_questions) VALUES ($1, $2, $3, $4)',
        [studentId, quizId, percentScore, total]
      );

      res.json({ score: percentScore, correct: score, total, message: 'Quiz submitted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/results/all', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT qr.*, u.name as student_name, q.title as quiz_title, s.subject_name
       FROM quiz_results qr
       JOIN users u ON u.id = qr.student_id
       JOIN quizzes q ON q.id = qr.quiz_id
       LEFT JOIN subjects s ON s.id = q.subject_id
       ORDER BY qr.submitted_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/results/student', authenticate, async (req, res) => {
  try {
    const studentId = req.user.role === 'admin' && req.query.student_id
      ? req.query.student_id
      : req.user.id;

    const result = await db.query(
      `SELECT qr.*, q.title as quiz_title, s.subject_name
       FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       LEFT JOIN subjects s ON s.id = q.subject_id
       WHERE qr.student_id = $1
       ORDER BY qr.submitted_at DESC`,
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

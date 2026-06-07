const express = require('express');
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/problems', authenticate, async (req, res) => {
  try {
    const { language } = req.query;
    let query = 'SELECT id, title, description, language, difficulty FROM coding_problems WHERE 1=1';
    const params = [];
    if (language) {
      params.push(language);
      query += ` AND language = $${params.length}`;
    }
    query += ' ORDER BY id';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/problems/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM coding_problems WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Problem not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/problems', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, language, difficulty, test_cases } = req.body;
    const result = await db.query(
      `INSERT INTO coding_problems (title, description, language, difficulty, test_cases)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, language, difficulty || 'medium', JSON.stringify(test_cases || [])]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/submit',
  authenticate,
  [
    body('language').notEmpty(),
    body('code').notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const { language, code, problem_id } = req.body;
      const studentId = req.user.id;

      let score = 70;
      if (problem_id) {
        const problem = await db.query('SELECT * FROM coding_problems WHERE id = $1', [problem_id]);
        if (problem.rows.length > 0) {
          const codeLength = code.trim().length;
          const hasFunction = /function|def |class |public static|void main/i.test(code);
          score = hasFunction && codeLength > 50 ? 85 + Math.min(15, Math.floor(codeLength / 100)) : 60;
        }
      } else {
        score = code.trim().length > 30 ? 75 : 50;
      }

      const result = await db.query(
        `INSERT INTO coding_submissions (student_id, problem_id, language, code, score)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [studentId, problem_id || null, language, code, score]
      );

      res.status(201).json({ submission: result.rows[0], score, message: 'Code submitted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/submissions', authenticate, async (req, res) => {
  try {
    const studentId = req.user.role === 'admin' && req.query.student_id
      ? req.query.student_id
      : req.user.id;

    const result = await db.query(
      `SELECT cs.*, cp.title as problem_title
       FROM coding_submissions cs
       LEFT JOIN coding_problems cp ON cp.id = cs.problem_id
       WHERE cs.student_id = $1
       ORDER BY cs.submitted_at DESC`,
      [studentId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

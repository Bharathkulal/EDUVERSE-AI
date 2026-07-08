const express = require('express');
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, 
        (SELECT COUNT(*) FROM topics t WHERE t.subject_id = s.id) as topic_count,
        (SELECT COUNT(*) FROM units u WHERE u.subject_id = s.id) as unit_count
       FROM subjects s ORDER BY s.subject_name`
    );
    
    // Deduplicate subjects by name, keeping the one with most topics
    const uniqueSubjectsMap = {};
    result.rows.forEach(s => {
      const existing = uniqueSubjectsMap[s.subject_name];
      const count = parseInt(s.topic_count) || 0;
      const existingCount = existing ? (parseInt(existing.topic_count) || 0) : -1;
      if (count > existingCount) {
        uniqueSubjectsMap[s.subject_name] = s;
      }
    });
    res.json(Object.values(uniqueSubjectsMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const subject = await db.query('SELECT * FROM subjects WHERE id = $1', [req.params.id]);
    if (subject.rows.length === 0) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const units = await db.query(
      'SELECT * FROM units WHERE subject_id = $1 ORDER BY order_index',
      [req.params.id]
    );
    const topics = await db.query(
      'SELECT * FROM topics WHERE subject_id = $1 ORDER BY order_index',
      [req.params.id]
    );

    res.json({ ...subject.rows[0], units: units.rows, topics: topics.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/',
  authenticate,
  authorizeAdmin,
  [body('subject_name').trim().notEmpty(), body('description').optional()],
  validate,
  async (req, res) => {
    try {
      const { subject_name, description } = req.body;
      const result = await db.query(
        'INSERT INTO subjects (subject_name, description) VALUES ($1, $2) RETURNING *',
        [subject_name, description || '']
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { subject_name, description } = req.body;
    const result = await db.query(
      'UPDATE subjects SET subject_name = COALESCE($1, subject_name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [subject_name, description, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Subject not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM subjects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Topics
router.post(
  '/:subjectId/topics',
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const { title, content, notes, pdf_url, video_url, unit_id, order_index } = req.body;
      const result = await db.query(
        `INSERT INTO topics (subject_id, unit_id, title, content, notes, pdf_url, video_url, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [req.params.subjectId, unit_id || null, title, content, notes, pdf_url, video_url, order_index || 0]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.put('/topics/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, content, notes, pdf_url, video_url } = req.body;
    const result = await db.query(
      `UPDATE topics SET title = COALESCE($1, title), content = COALESCE($2, content),
       notes = COALESCE($3, notes), pdf_url = COALESCE($4, pdf_url), video_url = COALESCE($5, video_url)
       WHERE id = $6 RETURNING *`,
      [title, content, notes, pdf_url, video_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Topic not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/topics/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM topics WHERE id = $1', [req.params.id]);
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Units
router.post('/:subjectId/units', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, order_index } = req.body;
    const result = await db.query(
      'INSERT INTO units (subject_id, title, order_index) VALUES ($1, $2, $3) RETURNING *',
      [req.params.subjectId, title, order_index || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

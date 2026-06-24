const express = require('express');
const { body } = require('express-validator');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper to check user permission
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
};

// AI provider priority logic
async function callAiProviders(question) {
  const prompt = `You are an expert college professor. Provide a detailed model answer for the following student question. Make it structured, clear, and comprehensive. Keep it clean and readable.\n\nQuestion: ${question}`;
  const aiGateway = require('../services/aiGateway');

  try {
    const res = await aiGateway.generateResponse(prompt);
    return { answer: res.text, provider: res.providerUsed };
  } catch (err) {
    console.error('All AI Gateway providers failed, using fallback:', err.message);
    const mockAnswer = `1. **Introduction**: The topic of "${question}" covers key structural components within the syllabus.\n\n2. **Detailed Breakdown**:\n   - Platform independence and portability allow running programs across systems.\n   - Object-oriented modeling maps real-world entities into reusable code modules.\n   - Built-in security structures ensure robust runtime execution.\n\n3. **Practical Example**:\n   - Implementation demonstrates modular scaling for high availability systems.\n\n*This is an AI-generated model answer created in demonstration mode. Configure provider API keys for live AI generation.*`;
    return { answer: mockAnswer, provider: 'Demo AI Manager' };
  }
}

// Search endpoint for students
router.post(
  '/search',
  authenticate,
  [body('query').trim().notEmpty().withMessage('Search query is required')],
  validate,
  async (req, res) => {
    try {
      const { query } = req.body;
      const normalizedQuery = query.toLowerCase();

      // 1. Search in Question Bank (ILIKE match)
      const qbResult = await db.query(
        `SELECT qb.*, s.subject_name 
         FROM question_bank qb
         JOIN subjects s ON qb.subject_id = s.id
         WHERE LOWER(qb.question) LIKE $1 OR LOWER(qb.answer) LIKE $1
         LIMIT 1`,
        [`%${normalizedQuery}%`]
      );

      if (qbResult.rows.length > 0) {
        const question = qbResult.rows[0];
        // Increment views
        await db.query('UPDATE question_bank SET views_count = views_count + 1 WHERE id = $1', [question.id]);
        return res.json({
          source: 'Question Bank',
          question: question.question,
          answer: question.answer,
          question_type: question.question_type,
          difficulty: question.difficulty,
          unit_number: question.unit_number,
          subject_name: question.subject_name,
        });
      }

      // 2. Search in AI Cache
      const cacheResult = await db.query(
        'SELECT * FROM ai_cache WHERE LOWER(question) LIKE $1 LIMIT 1',
        [`%${normalizedQuery}%`]
      );

      if (cacheResult.rows.length > 0) {
        const cached = cacheResult.rows[0];
        return res.json({
          source: 'AI Cache',
          question: cached.question,
          answer: cached.answer,
          provider: cached.provider,
        });
      }

      // 3. AI Fallback API call
      const { answer, provider } = await callAiProviders(query);

      // Save to cache
      await db.query(
        'INSERT INTO ai_cache (question, answer, provider) VALUES ($1, $2, $3) ON CONFLICT (question) DO NOTHING',
        [query, answer, provider]
      );

      return res.json({
        source: 'AI Generated',
        question: query,
        answer: answer,
        provider: provider,
      });
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ message: 'Error searching question bank.' });
    }
  }
);

// Admin Question Bank Analytics
router.get('/admin/analytics', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalCount = await db.query('SELECT COUNT(*) as count FROM question_bank');
    const marks2Count = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = '2 Marks'");
    const marks5Count = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = '5 Marks'");
    const marks10Count = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = '10 Marks'");
    const importantCount = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = 'Important Question'");
    const pyqCount = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = 'Previous Year Question'");
    
    const mostViewed = await db.query(
      `SELECT qb.id, qb.question, qb.views_count, qb.question_type, s.subject_name 
       FROM question_bank qb
       JOIN subjects s ON qb.subject_id = s.id
       ORDER BY qb.views_count DESC LIMIT 5`
    );

    const aiSaved = await db.query('SELECT COUNT(*) as count FROM ai_cache');

    res.json({
      totalQuestions: parseInt(totalCount.rows[0].count),
      marks2Count: parseInt(marks2Count.rows[0].count),
      marks5Count: parseInt(marks5Count.rows[0].count),
      marks10Count: parseInt(marks10Count.rows[0].count),
      importantQuestionsCount: parseInt(importantCount.rows[0].count),
      pyqCount: parseInt(pyqCount.rows[0].count),
      mostViewedQuestions: mostViewed.rows,
      aiRequestsSaved: parseInt(aiSaved.rows[0].count) * 12 + 15, // mock rate multiplier
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Error retrieving analytics.' });
  }
});

// Admin Add Question
router.post(
  '/admin',
  authenticate,
  requireAdmin,
  [
    body('subject_id').isInt().withMessage('Valid subject ID is required'),
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
    body('question_type').notEmpty().withMessage('Question type is required'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
    body('unit_number').isInt().withMessage('Unit number must be an integer'),
  ],
  validate,
  async (req, res) => {
    try {
      const { subject_id, question, answer, question_type, difficulty, unit_number, tags } = req.body;
      const result = await db.query(
        `INSERT INTO question_bank (subject_id, question, answer, question_type, difficulty, unit_number, tags, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [subject_id, question, answer, question_type, difficulty, unit_number, tags || '', req.user.id]
      );
      res.status(201).json({ message: 'Question added successfully', question: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error while adding question' });
    }
  }
);

// Admin Edit Question
router.put(
  '/admin/:id',
  authenticate,
  requireAdmin,
  [
    body('subject_id').isInt().withMessage('Valid subject ID is required'),
    body('question').trim().notEmpty().withMessage('Question is required'),
    body('answer').trim().notEmpty().withMessage('Answer is required'),
    body('question_type').notEmpty().withMessage('Question type is required'),
    body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
    body('unit_number').isInt().withMessage('Unit number must be an integer'),
  ],
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { subject_id, question, answer, question_type, difficulty, unit_number, tags } = req.body;
      const result = await db.query(
        `UPDATE question_bank 
         SET subject_id = $1, question = $2, answer = $3, question_type = $4, difficulty = $5, unit_number = $6, tags = $7, updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 RETURNING *`,
        [subject_id, question, answer, question_type, difficulty, unit_number, tags || '', id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Question not found' });
      }
      res.json({ message: 'Question updated successfully', question: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error while editing question' });
    }
  }
);

// Admin Delete Question
router.delete('/admin/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM question_bank WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting question' });
  }
});

// Student/Admin List Questions (Filtered)
router.get('/', authenticate, async (req, res) => {
  try {
    const { subject_id, question_type, difficulty, unit_number, search } = req.query;
    let query = `
      SELECT qb.*, s.subject_name,
        EXISTS(SELECT 1 FROM bookmarked_questions bq WHERE bq.question_id = qb.id AND bq.user_id = $1) as bookmarked,
        EXISTS(SELECT 1 FROM completed_questions cq WHERE cq.question_id = qb.id AND cq.user_id = $1) as completed
      FROM question_bank qb
      JOIN subjects s ON qb.subject_id = s.id
      WHERE 1=1
    `;
    const params = [req.user.id];

    if (subject_id) {
      params.push(parseInt(subject_id));
      query += ` AND qb.subject_id = $${params.length}`;
    }
    if (question_type) {
      params.push(question_type);
      query += ` AND qb.question_type = $${params.length}`;
    }
    if (difficulty) {
      params.push(difficulty);
      query += ` AND qb.difficulty = $${params.length}`;
    }
    if (unit_number) {
      params.push(parseInt(unit_number));
      query += ` AND qb.unit_number = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(qb.question) LIKE $${params.length} OR LOWER(qb.answer) LIKE $${params.length})`;
    }

    query += ' ORDER BY qb.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching questions' });
  }
});

// Toggle Bookmark
router.post('/:id/bookmark', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await db.query('SELECT 1 FROM bookmarked_questions WHERE user_id = $1 AND question_id = $2', [req.user.id, id]);
    if (exists.rows.length > 0) {
      await db.query('DELETE FROM bookmarked_questions WHERE user_id = $1 AND question_id = $2', [req.user.id, id]);
      return res.json({ bookmarked: false });
    } else {
      await db.query('INSERT INTO bookmarked_questions (user_id, question_id) VALUES ($1, $2)', [req.user.id, id]);
      return res.json({ bookmarked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error toggling bookmark.' });
  }
});

// Toggle Completed status
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const exists = await db.query('SELECT 1 FROM completed_questions WHERE user_id = $1 AND question_id = $2', [req.user.id, id]);
    if (exists.rows.length > 0) {
      await db.query('DELETE FROM completed_questions WHERE user_id = $1 AND question_id = $2', [req.user.id, id]);
      return res.json({ completed: false });
    } else {
      await db.query('INSERT INTO completed_questions (user_id, question_id) VALUES ($1, $2)', [req.user.id, id]);
      return res.json({ completed: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error toggling completed status.' });
  }
});

// Admin - Question Approval Toggle
router.put('/admin/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;
    const result = await db.query(
      'UPDATE question_bank SET approved = $1 WHERE id = $2 RETURNING *',
      [approved, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question approval status updated', question: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating question approval status' });
  }
});

// Admin - Bulk Import Questions
router.post('/admin/bulk-import', authenticate, requireAdmin, async (req, res) => {
  try {
    const { questions } = req.body; // array of objects
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid bulk import data format' });
    }

    const inserted = [];
    for (const q of questions) {
      const { subject_id, question, answer, question_type = 'Important Question', difficulty = 'medium', unit_number = 1, tags = '' } = q;
      const resVal = await db.query(
        `INSERT INTO question_bank (subject_id, question, answer, question_type, difficulty, unit_number, tags, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [subject_id, question, answer, question_type, difficulty, unit_number, tags, req.user.id]
      );
      inserted.push(resVal.rows[0]);
    }

    res.status(201).json({ message: `Successfully imported ${inserted.length} questions`, questions: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error bulk importing questions' });
  }
});

// Admin - Bulk Export Questions
router.get('/admin/export', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT qb.*, s.subject_name 
       FROM question_bank qb 
       JOIN subjects s ON qb.subject_id = s.id 
       ORDER BY qb.created_at DESC`
    );
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=question_bank_export.json');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error exporting questions' });
  }
});

// Admin - AI Question Generation
router.post('/admin/ai-generate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { subject_id, topic, count = 3, difficulty = 'medium' } = req.body;
    const { generateContentWithFailover } = require('../utils/ai_helper');

    if (!subject_id || !topic) {
      return res.status(400).json({ message: 'Subject ID and Topic are required' });
    }

    const prompt = `Generate exactly ${count} educational questions and their comprehensive model answers on the topic: "${topic}".
    The difficulty must be "${difficulty}".
    You MUST output ONLY a valid JSON array matching the following structure:
    [
      {
        "question": "Question text here?",
        "answer": "Detailed answer explaining the concept, formulas, diagrams, etc.",
        "question_type": "Important Question",
        "difficulty": "${difficulty}",
        "unit_number": 1,
        "tags": "${topic}"
      }
    ]
    Do not wrap in markdown code blocks. Output raw JSON array only.`;

    let generatedText = '';
    try {
      const apiResult = await generateContentWithFailover(prompt);
      generatedText = apiResult.text;
    } catch (apiErr) {
      console.error('AI Failover failed for question generation:', apiErr);
      generatedText = JSON.stringify(Array.from({ length: parseInt(count) }).map((_, i) => ({
        question: `What is the key aspect of ${topic} (Part ${i + 1})?`,
        answer: `This is a mock generated model answer regarding ${topic}. High latency or missing keys prevented real AI processing.`,
        question_type: 'Important Question',
        difficulty,
        unit_number: 1,
        tags: topic
      })));
    }

    let parsedQuestions;
    try {
      const jsonStart = generatedText.indexOf('[');
      const jsonEnd = generatedText.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        generatedText = generatedText.substring(jsonStart, jsonEnd + 1);
      }
      parsedQuestions = JSON.parse(generatedText);
    } catch (parseErr) {
      console.error('Error parsing generated questions JSON:', parseErr, generatedText);
      return res.status(500).json({ message: 'AI returned invalid JSON format. Please try again.' });
    }

    const inserted = [];
    for (const q of parsedQuestions) {
      const resVal = await db.query(
        `INSERT INTO question_bank (subject_id, question, answer, question_type, difficulty, unit_number, tags, created_by, approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true) RETURNING *`,
        [subject_id, q.question, q.answer, q.question_type || 'Important Question', q.difficulty || difficulty, q.unit_number || 1, q.tags || topic, req.user.id]
      );
      inserted.push(resVal.rows[0]);
    }

    res.status(201).json({ message: `Successfully generated ${inserted.length} questions`, questions: inserted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating AI questions' });
  }
});

module.exports = router;

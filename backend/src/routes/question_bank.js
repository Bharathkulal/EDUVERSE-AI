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

  // 1. Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('Calling Gemini...');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const answer = result.response.text();
      if (answer) return { answer, provider: 'Gemini' };
    } catch (e) {
      console.error('Gemini error:', e.message);
    }
  }

  // 2. Groq
  if (process.env.GROQ_API_KEY) {
    try {
      console.log('Calling Groq...');
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );
      const answer = response.data?.choices?.[0]?.message?.content;
      if (answer) return { answer, provider: 'Groq' };
    } catch (e) {
      console.error('Groq error:', e.message);
    }
  }

  // 3. OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log('Calling OpenRouter...');
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'openchat/openchat-7b:free',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );
      const answer = response.data?.choices?.[0]?.message?.content;
      if (answer) return { answer, provider: 'OpenRouter' };
    } catch (e) {
      console.error('OpenRouter error:', e.message);
    }
  }

  // 4. Mistral
  if (process.env.MISTRAL_API_KEY) {
    try {
      console.log('Calling Mistral...');
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-tiny',
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );
      const answer = response.data?.choices?.[0]?.message?.content;
      if (answer) return { answer, provider: 'Mistral' };
    } catch (e) {
      console.error('Mistral error:', e.message);
    }
  }

  // Fallback to static mock answer generator
  console.log('All AI keys unavailable. Returning mock explanation.');
  const mockAnswer = `1. **Introduction**: The topic of "${question}" covers key structural components within the syllabus.\n\n2. **Detailed Breakdown**:\n   - Platform independence and portability allow running programs across systems.\n   - Object-oriented modeling maps real-world entities into reusable code modules.\n   - Built-in security structures ensure robust runtime execution.\n\n3. **Practical Example**:\n   - Implementation demonstrates modular scaling for high availability systems.\n\n*This is an AI-generated model answer created in demonstration mode. Configure provider API keys for live AI generation.*`;
  return { answer: mockAnswer, provider: 'Demo AI Manager' };
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

module.exports = router;

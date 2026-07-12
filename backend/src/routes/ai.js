const express = require('express');
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const aiGateway = require('../services/aiGateway');
const { generateSmartFallback } = require('../utils/smartFallback');

const router = express.Router();

router.post(
  '/chat',
  authenticate,
  [body('message').trim().notEmpty(), body('mode').optional()],
  validate,
  async (req, res) => {
    try {
      const { message, mode, subject } = req.body;
      const studentId = req.user.id;

      const prompts = {
        doubt: `You are an expert college tutor. A student has a doubt. Answer clearly with examples.\n\nStudent question: ${message}`,
        explain: `Explain this concept in simple terms for a college student with examples:\n\n${message}`,
        example: `Generate practical code examples and explanations for:\n\n${message}`,
        practice: `Generate 5 practice MCQ questions with answers for:\n\n${message}`,
      };

      const systemPrompt = subject
        ? `${prompts[mode] || prompts.doubt}\n\nSubject context: ${subject}`
        : prompts[mode] || prompts.doubt;

      let responseText = '';

      let apiCallResult = null;
      try {
        apiCallResult = await aiGateway.generateResponse(systemPrompt);
      } catch (apiErr) {
        console.error('All failovers exhausted for AI Tutor:', apiErr);
      }

      if (apiCallResult) {
        responseText = apiCallResult.text;
      }

      if (!responseText) {
        responseText = generateSmartFallback(message);
      }

      await db.query(
        'INSERT INTO ai_chats (student_id, message, response) VALUES ($1, $2, $3)',
        [studentId, message, responseText]
      );

      res.json({ response: responseText, mode: mode || 'doubt' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'AI tutor error. Please try again.' });
    }
  }
);

router.get('/history', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, message, response, created_at FROM ai_chats WHERE student_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

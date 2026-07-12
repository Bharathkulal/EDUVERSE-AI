const express = require('express');
const { body } = require('express-validator');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const aiGateway = require('../services/aiGateway');

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
        // 1. Math Evaluator Fallback
        const sanitizedMath = message.replace(/solve/i, '').trim();
        const mathPattern = /^[0-9\+\-\*\/\%\.\(\)\s]+$/;
        if (mathPattern.test(sanitizedMath) && /[0-9]/.test(sanitizedMath)) {
          try {
            const evalResult = new Function(`return (${sanitizedMath});`)();
            if (evalResult !== undefined && !isNaN(evalResult)) {
              responseText = `The answer is **${evalResult}**.`;
            }
          } catch (e) {
            // fallback
          }
        }
      }

      if (!responseText) {
        // 2. Common QA Fallbacks
        const lowerQuery = message.toLowerCase().trim();
        if (lowerQuery === 'hi' || lowerQuery === 'hello' || lowerQuery === 'hey') {
          responseText = "Hello! I am EduVerse AI, your smart learning assistant. How can I help you today?";
        } else if (lowerQuery.includes('your name')) {
          responseText = "I am EduVerse AI, your personal study coach and programming assistant.";
        } else if (lowerQuery.includes('what can you do')) {
          responseText = "I can solve mathematical equations, explain academic concepts, debug or run programming code, design study roadmaps, and generate custom practice quizzes.";
        } else if (lowerQuery.includes('formula of quadratic') || lowerQuery.includes('quadratic formula')) {
          responseText = "The quadratic formula is:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nIt is used to find the roots of a quadratic equation of the form $ax^2 + bx + c = 0$.";
        }
      }

      if (!responseText) {
        responseText = `[Demo Mode - Add GEMINI_API_KEY for live AI]\n\nRegarding "${message}":\n\nThis is a fundamental concept in ${subject || 'computer science'}. Let me explain:\n\n1. Start with the core definition\n2. Understand the key components\n3. Practice with examples\n4. Apply through exercises\n\nFor "${mode || 'doubt'}" mode: Review your course materials and try breaking the problem into smaller steps. Would you like me to generate practice questions?`;
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

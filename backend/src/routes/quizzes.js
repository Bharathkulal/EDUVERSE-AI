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
    const { subject_id, topic_id, title, time_limit_minutes = 15, difficulty = 'medium', category = 'General', questions } = req.body;
    const quizResult = await db.query(
      `INSERT INTO quizzes (subject_id, topic_id, title, time_limit_minutes, difficulty, category) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [subject_id, topic_id || null, title, time_limit_minutes, difficulty, category]
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
    const { title, subject_id, topic_id, time_limit_minutes, difficulty, category } = req.body;
    const result = await db.query(
      `UPDATE quizzes 
       SET title = COALESCE($1, title), subject_id = COALESCE($2, subject_id), topic_id = COALESCE($3, topic_id),
           time_limit_minutes = COALESCE($4, time_limit_minutes), difficulty = COALESCE($5, difficulty), category = COALESCE($6, category)
       WHERE id = $7 RETURNING *`,
      [title, subject_id, topic_id, time_limit_minutes, difficulty, category, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Quiz not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
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

// AI Quiz Generator Endpoint
router.post('/ai-generate', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { subject_id, topic_name, difficulty = 'medium', question_count = 5 } = req.body;
    const { generateContentWithFailover } = require('../utils/ai_helper');

    if (!subject_id || !topic_name) {
      return res.status(400).json({ message: 'Subject ID and Topic name are required' });
    }

    const prompt = `Generate a quiz on the topic "${topic_name}" with difficulty "${difficulty}".
    Provide exactly ${question_count} multiple choice questions.
    You MUST output ONLY a valid JSON object matching the following structure:
    {
      "title": "Quiz Title",
      "questions": [
        {
          "question": "Question text here?",
          "option_a": "Option A text",
          "option_b": "Option B text",
          "option_c": "Option C text",
          "option_d": "Option D text",
          "correct_answer": "a"
        }
      ]
    }
    Make sure correct_answer is lowercase ('a', 'b', 'c', or 'd'). Do not wrap in markdown tags or write conversational text. Output raw JSON.`;

    let generatedText = '';
    try {
      const apiResult = await generateContentWithFailover(prompt);
      generatedText = apiResult.text;
    } catch (apiErr) {
      console.error('AI Failover failed for quiz generation:', apiErr);
      // Fallback fallback mock questions
      generatedText = JSON.stringify({
        title: `AI Generated Quiz: ${topic_name}`,
        questions: Array.from({ length: parseInt(question_count) }).map((_, i) => ({
          question: `Sample Question ${i + 1} about ${topic_name}?`,
          option_a: 'Option A (Correct)',
          option_b: 'Option B',
          option_c: 'Option C',
          option_d: 'Option D',
          correct_answer: 'a'
        }))
      });
    }

    // Clean JSON
    let parsedData;
    try {
      const jsonStart = generatedText.indexOf('{');
      const jsonEnd = generatedText.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        generatedText = generatedText.substring(jsonStart, jsonEnd + 1);
      }
      parsedData = JSON.parse(generatedText);
    } catch (parseErr) {
      console.error('Error parsing generated quiz JSON:', parseErr, generatedText);
      return res.status(500).json({ message: 'AI returned invalid JSON format. Please try again.' });
    }

    const quizResult = await db.query(
      `INSERT INTO quizzes (subject_id, title, difficulty, category, time_limit_minutes) 
       VALUES ($1, $2, $3, 'AI Generated', 15) RETURNING *`,
      [subject_id, parsedData.title || `AI Quiz - ${topic_name}`, difficulty]
    );
    const quiz = quizResult.rows[0];

    const insertedQuestions = [];
    if (parsedData.questions?.length) {
      for (const q of parsedData.questions) {
        const qRes = await db.query(
          `INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [quiz.id, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer]
        );
        insertedQuestions.push(qRes.rows[0]);
      }
    }

    res.status(201).json({ ...quiz, questions: insertedQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating AI quiz' });
  }
});

module.exports = router;

const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { generateContentWithFailover } = require('../utils/ai_helper');

const router = express.Router();

// 1. Get all notes for user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT id, title, content, pinned, favorite, created_at FROM notes WHERE user_id = $1 ORDER BY pinned DESC, created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Create a new note
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Award +10 XP for note creation (once per note)
    await db.query(
      `INSERT INTO user_xp_history (user_id, xp_amount, action)
       VALUES ($1, 10, 'Created note')`,
      [userId]
    );

    await db.query(
      `INSERT INTO student_progress (student_id, study_hours, completed_topics)
       VALUES ($1, 0, 0)
       ON CONFLICT (student_id) DO UPDATE SET
         study_hours = student_progress.study_hours + 0.01`,
      [userId]
    );

    const result = await db.query(
      'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, content || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Update an existing note (title, content, pinned, favorite)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, pinned, favorite } = req.body;

    // Check ownership
    const noteCheck = await db.query('SELECT 1 FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId]);
    if (noteCheck.rows.length === 0) {
      return res.status(443).json({ message: 'Note not found or unauthorized' });
    }

    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (title !== undefined) {
      fields.push(`title = $${queryIndex++}`);
      values.push(title);
    }
    if (content !== undefined) {
      fields.push(`content = $${queryIndex++}`);
      values.push(content);
    }
    if (pinned !== undefined) {
      fields.push(`pinned = $${queryIndex++}`);
      values.push(pinned);
    }
    if (favorite !== undefined) {
      fields.push(`favorite = $${queryIndex++}`);
      values.push(favorite);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(noteId, userId);
    const updateQuery = `
      UPDATE notes 
      SET ${fields.join(', ')} 
      WHERE id = $${queryIndex++} AND user_id = $${queryIndex++} 
      RETURNING *`;

    const result = await db.query(updateQuery, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Delete a note
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const result = await db.query(
      'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *',
      [noteId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    res.json({ message: 'Note deleted successfully', deletedNote: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 5. Generate AI Summary of a note
router.post('/:id/summary', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    // Fetch note
    const noteRes = await db.query('SELECT title, content FROM notes WHERE id = $1 AND user_id = $2', [noteId, userId]);
    if (noteRes.rows.length === 0) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    const { title, content } = noteRes.rows[0];
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Cannot summarize empty note' });
    }

    const prompt = `You are an expert academic tutor. Summarize the following lecture study note concisely. 
Include key points, formulas, or definitions in a neat bulleted list.

Note Title: ${title}
Note Content:
${content}
`;

    let summaryText = '';
    try {
      const apiResult = await generateContentWithFailover(prompt);
      summaryText = apiResult.text;
    } catch (apiErr) {
      console.error('AI Failover failed for note summary:', apiErr);
      summaryText = `[Demo Summary Fallback] regarding note "${title}":\n- Highlights the fundamental core concepts.\n- Recommends revising this chapter before upcoming quizzes.\n- Suggests practicing related coding exercises in Coding Labs.`;
    }

    res.json({ summary: summaryText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating summary' });
  }
});

module.exports = router;

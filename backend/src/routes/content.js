const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { generateContentWithFailover } = require('../utils/ai_helper');

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper: Add version history
async function createContentVersion(noteId, content) {
  try {
    const lastVersionRes = await db.query(
      'SELECT COALESCE(MAX(version_number), 0) as last_v FROM content_versions WHERE note_id = $1',
      [noteId]
    );
    const nextVersion = lastVersionRes.rows[0].last_v + 1;
    await db.query(
      'INSERT INTO content_versions (note_id, content, version_number) VALUES ($1, $2, $3)',
      [noteId, content, nextVersion]
    );
  } catch (err) {
    console.error('Error creating content version:', err);
  }
}

// 1. GET /api/content - Retrieve all subjects, notes, and topics
router.get('/', authenticate, async (req, res) => {
  try {
    const subjects = await db.query('SELECT * FROM subjects ORDER BY subject_name');
    const notes = await db.query(
      `SELECT n.*, u.name as author_name 
       FROM notes n 
       LEFT JOIN users u ON n.user_id = u.id 
       ORDER BY n.created_at DESC`
    );
    const topics = await db.query(
      `SELECT t.*, s.subject_name 
       FROM topics t 
       LEFT JOIN subjects s ON t.subject_id = s.id 
       ORDER BY t.order_index`
    );

    res.json({
      subjects: subjects.rows,
      notes: notes.rows,
      topics: topics.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving system content' });
  }
});

// 2. POST /api/content/upload - Handle file upload
router.post('/upload', authenticate, authorizeAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      message: 'File uploaded successfully', 
      url: fileUrl, 
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// 3. POST /api/content - Create a new topic, note, or subject
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { type, title, content, notes, subject_id, unit_id, pdf_url, video_url } = req.body;

    if (type === 'subject') {
      const result = await db.query(
        'INSERT INTO subjects (subject_name, description) VALUES ($1, $2) RETURNING *',
        [title, content || '']
      );
      return res.status(201).json(result.rows[0]);
    }

    if (type === 'topic') {
      const result = await db.query(
        `INSERT INTO topics (subject_id, unit_id, title, content, notes, pdf_url, video_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [subject_id, unit_id || null, title, content || '', notes || '', pdf_url || '', video_url || '']
      );
      return res.status(201).json(result.rows[0]);
    }

    if (type === 'note') {
      const result = await db.query(
        'INSERT INTO notes (user_id, title, content, approved) VALUES ($1, $2, $3, true) RETURNING *',
        [req.user.id, title, content || '']
      );
      await createContentVersion(result.rows[0].id, content || '');
      return res.status(201).json(result.rows[0]);
    }

    res.status(400).json({ message: 'Invalid content type' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating content item' });
  }
});

// 4. PUT /api/content/:id - Edit content details / approved state
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, content, notes, pdf_url, video_url, approved } = req.body;

    if (type === 'topic') {
      const result = await db.query(
        `UPDATE topics 
         SET title = COALESCE($1, title), content = COALESCE($2, content), notes = COALESCE($3, notes), 
             pdf_url = COALESCE($4, pdf_url), video_url = COALESCE($5, video_url), approved = COALESCE($6, approved)
         WHERE id = $7 RETURNING *`,
        [title, content, notes, pdf_url, video_url, approved, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: 'Topic not found' });
      return res.json(result.rows[0]);
    }

    if (type === 'note') {
      const result = await db.query(
        `UPDATE notes 
         SET title = COALESCE($1, title), content = COALESCE($2, content), approved = COALESCE($3, approved)
         WHERE id = $4 RETURNING *`,
        [title, content, approved, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: 'Note not found' });
      if (content !== undefined) {
        await createContentVersion(id, content);
      }
      return res.json(result.rows[0]);
    }

    res.status(400).json({ message: 'Invalid content type' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating content item' });
  }
});

// 5. DELETE /api/content/:id - Delete subject, topic, or note
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (type === 'subject') {
      await db.query('DELETE FROM subjects WHERE id = $1', [id]);
      return res.json({ message: 'Subject deleted successfully' });
    }
    if (type === 'topic') {
      await db.query('DELETE FROM topics WHERE id = $1', [id]);
      return res.json({ message: 'Topic deleted successfully' });
    }
    if (type === 'note') {
      await db.query('DELETE FROM notes WHERE id = $1', [id]);
      return res.json({ message: 'Note deleted successfully' });
    }

    res.status(400).json({ message: 'Invalid content type' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting content item' });
  }
});

// 6. POST /api/content/ai-generate - Generate AI study notes
router.post('/ai-generate', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    const prompt = `Write comprehensive, professional, university-level study notes on the topic: "${topic}". 
    Structure it with headings, clear explanations, bullet points, key takeaways, and a brief code snippet or practical example if applicable. 
    Use clean Markdown formatting.`;

    let notesText = '';
    try {
      const apiResult = await generateContentWithFailover(prompt);
      notesText = apiResult.text;
    } catch (apiErr) {
      console.error('AI Failover failed for notes generation:', apiErr);
      notesText = `### ${topic}\n\nThis is a fallback generated note on ${topic}. High latency or missing keys prevented real AI processing. Please check connection configurations.`;
    }

    res.json({ content: notesText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating AI notes' });
  }
});

module.exports = router;

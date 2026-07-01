const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const aiGateway = require('../services/aiGateway');

const router = express.Router();

// ==========================================
// FILE & FOLDER SYSTEM
// ==========================================

// 1. Get all files and folders (with filters: folder_id, starred, recycle_bin, search)
router.get('/files', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { folder_id, starred, recycle_bin, q } = req.query;

    let folderQuery = 'SELECT * FROM it_suite_folders WHERE user_id = $1';
    let fileQuery = 'SELECT * FROM it_suite_documents WHERE user_id = $1';
    const folderParams = [userId];
    const fileParams = [userId];
    let paramIndex = 2;

    // Filter Recycle Bin
    if (recycle_bin === 'true') {
      folderQuery += ` AND is_in_recycle_bin = true`;
      fileQuery += ` AND is_in_recycle_bin = true`;
    } else {
      folderQuery += ` AND is_in_recycle_bin = false`;
      fileQuery += ` AND is_in_recycle_bin = false`;

      // Starred
      if (starred === 'true') {
        folderQuery += ` AND is_starred = true`;
        fileQuery += ` AND is_starred = true`;
      }

      // Folder navigation
      if (folder_id) {
        if (folder_id === 'null' || folder_id === 'root') {
          folderQuery += ` AND parent_id IS NULL`;
          fileQuery += ` AND folder_id IS NULL`;
        } else {
          folderQuery += ` AND parent_id = $${paramIndex}`;
          fileQuery += ` AND folder_id = $${paramIndex}`;
          folderParams.push(parseInt(folder_id));
          fileParams.push(parseInt(folder_id));
          paramIndex++;
        }
      }
    }

    // Search query
    if (q) {
      folderQuery += ` AND LOWER(name) LIKE $${paramIndex}`;
      fileQuery += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(tags) LIKE $${paramIndex})`;
      folderParams.push(`%${q.toLowerCase()}%`);
      fileParams.push(`%${q.toLowerCase()}%`);
      paramIndex++;
    }

    folderQuery += ' ORDER BY is_starred DESC, name ASC';
    fileQuery += ' ORDER BY is_starred DESC, updated_at DESC';

    const foldersRes = await db.query(folderQuery, folderParams);
    const filesRes = await db.query(fileQuery, fileParams);

    res.json({
      folders: foldersRes.rows,
      documents: filesRes.rows,
    });
  } catch (err) {
    console.error('Error fetching IT Suite files:', err);
    res.status(500).json({ message: 'Server error fetching files' });
  }
});

// 2. Create a folder
router.post('/folders', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, parent_id, tags } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const parentVal = parent_id && parent_id !== 'root' ? parseInt(parent_id) : null;

    const result = await db.query(
      `INSERT INTO it_suite_folders (user_id, name, parent_id, tags)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, name, parentVal, tags || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating folder:', err);
    res.status(500).json({ message: 'Server error creating folder' });
  }
});

// 3. Create a document (Word, Excel, Slides)
router.post('/documents', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, type, folder_id, content, tags } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const folderVal = folder_id && folder_id !== 'root' ? parseInt(folder_id) : null;

    // Default templates / structural setups
    let defaultContent = '';
    if (type === 'excel') {
      defaultContent = JSON.stringify({
        activeSheet: 'Sheet1',
        sheets: {
          'Sheet1': {
            data: {},
            cols: {},
            rows: {},
            frozenRows: 0,
            frozenCols: 0
          }
        }
      });
    } else if (type === 'slides') {
      defaultContent = JSON.stringify([
        { id: 'slide-1', title: 'Welcome Title', elements: [{ id: 'el-1', type: 'text', value: 'Double-click to edit title', x: 100, y: 150, width: 600, height: 100, fontSize: 32, bold: true, color: '#333333' }] }
      ]);
    } else {
      // Word document
      defaultContent = '<h1>Welcome to EduVerse Word</h1><p>Start typing your document here...</p>';
    }

    const contentVal = content || defaultContent;

    const result = await db.query(
      `INSERT INTO it_suite_documents (user_id, folder_id, name, type, content, tags)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, folderVal, name, type, contentVal, tags || '']
    );

    // Initial Version save
    await db.query(
      `INSERT INTO it_suite_versions (document_id, user_id, content, version_number)
       VALUES ($1, $2, $3, 1)`,
      [result.rows[0].id, userId, contentVal]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating document:', err);
    res.status(500).json({ message: 'Server error creating document' });
  }
});

// 4. Update a document
router.put('/documents/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;
    const { name, content, folder_id, is_starred, is_in_recycle_bin, tags } = req.body;

    const check = await db.query('SELECT user_id, type FROM it_suite_documents WHERE id = $1', [docId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (check.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const fields = ['updated_at = NOW()'];
    const values = [docId];
    let pIndex = 2;

    if (name !== undefined) {
      fields.push(`name = $${pIndex++}`);
      values.push(name);
    }
    if (content !== undefined) {
      fields.push(`content = $${pIndex++}`);
      values.push(content);
    }
    if (folder_id !== undefined) {
      fields.push(`folder_id = $${pIndex++}`);
      values.push(folder_id === 'root' || folder_id === null ? null : parseInt(folder_id));
    }
    if (is_starred !== undefined) {
      fields.push(`is_starred = $${pIndex++}`);
      values.push(is_starred);
    }
    if (is_in_recycle_bin !== undefined) {
      fields.push(`is_in_recycle_bin = $${pIndex++}`);
      values.push(is_in_recycle_bin);
    }
    if (tags !== undefined) {
      fields.push(`tags = $${pIndex++}`);
      values.push(tags);
    }

    const query = `UPDATE it_suite_documents SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await db.query(query, values);

    // Save automatic version checkpoints when content is changed
    if (content !== undefined) {
      const versionsCount = await db.query('SELECT COUNT(*) FROM it_suite_versions WHERE document_id = $1', [docId]);
      const nextVer = parseInt(versionsCount.rows[0].count) + 1;
      // Cap frequency or version history length if needed, or save every time
      await db.query(
        `INSERT INTO it_suite_versions (document_id, user_id, content, version_number)
         VALUES ($1, $2, $3, $4)`,
        [docId, userId, content, nextVer]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ message: 'Server error updating document' });
  }
});

// 5. Update a folder
router.put('/folders/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.params.id;
    const { name, is_starred, is_in_recycle_bin, tags } = req.body;

    const check = await db.query('SELECT user_id FROM it_suite_folders WHERE id = $1', [folderId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Folder not found' });
    }
    if (check.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const fields = ['updated_at = NOW()'];
    const values = [folderId];
    let pIndex = 2;

    if (name !== undefined) {
      fields.push(`name = $${pIndex++}`);
      values.push(name);
    }
    if (is_starred !== undefined) {
      fields.push(`is_starred = $${pIndex++}`);
      values.push(is_starred);
    }
    if (is_in_recycle_bin !== undefined) {
      fields.push(`is_in_recycle_bin = $${pIndex++}`);
      values.push(is_in_recycle_bin);
    }
    if (tags !== undefined) {
      fields.push(`tags = $${pIndex++}`);
      values.push(tags);
    }

    const query = `UPDATE it_suite_folders SET ${fields.join(', ')} WHERE id = $1 RETURNING *`;
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating folder:', err);
    res.status(500).json({ message: 'Server error updating folder' });
  }
});

// 6. Delete a folder permanently
router.delete('/folders/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const folderId = req.params.id;

    const result = await db.query(
      'DELETE FROM it_suite_folders WHERE id = $1 AND user_id = $2 RETURNING *',
      [folderId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Folder not found or unauthorized' });
    }

    res.json({ message: 'Folder deleted permanently' });
  } catch (err) {
    console.error('Error hard-deleting folder:', err);
    res.status(500).json({ message: 'Server error deleting folder' });
  }
});

// 7. Delete a document permanently
router.delete('/documents/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;

    const result = await db.query(
      'DELETE FROM it_suite_documents WHERE id = $1 AND user_id = $2 RETURNING *',
      [docId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    res.json({ message: 'Document deleted permanently' });
  } catch (err) {
    console.error('Error hard-deleting document:', err);
    res.status(500).json({ message: 'Server error deleting document' });
  }
});

// 8. Restore folder from recycle bin
router.post('/folders/:id/restore', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'UPDATE it_suite_folders SET is_in_recycle_bin = false WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error restoring folder' });
  }
});

// 9. Restore document from recycle bin
router.post('/documents/:id/restore', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'UPDATE it_suite_documents SET is_in_recycle_bin = false WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error restoring document' });
  }
});

// ==========================================
// VERSION CONTROL
// ==========================================

// Get version checkpoints
router.get('/documents/:id/versions', authenticate, async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = req.user.id;

    // Check auth
    const check = await db.query('SELECT user_id FROM it_suite_documents WHERE id = $1', [docId]);
    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const versions = await db.query(
      `SELECT v.id, v.version_number, v.created_at, v.content, u.name as author_name 
       FROM it_suite_versions v 
       LEFT JOIN users u ON v.user_id = u.id 
       WHERE v.document_id = $1 
       ORDER BY v.version_number DESC`,
      [docId]
    );

    res.json(versions.rows);
  } catch (err) {
    console.error('Error loading versions:', err);
    res.status(500).json({ message: 'Server error fetching versions' });
  }
});

// Save a manual checkpoint version
router.post('/documents/:id/versions', authenticate, async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    const check = await db.query('SELECT user_id FROM it_suite_documents WHERE id = $1', [docId]);
    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const countRes = await db.query('SELECT COUNT(*) FROM it_suite_versions WHERE document_id = $1', [docId]);
    const nextVer = parseInt(countRes.rows[0].count) + 1;

    const result = await db.query(
      `INSERT INTO it_suite_versions (document_id, user_id, content, version_number)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [docId, userId, content, nextVer]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error saving checkpoint version' });
  }
});

// ==========================================
// COMMENTS SECTION
// ==========================================

// Get comments list
router.get('/documents/:id/comments', authenticate, async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = req.user.id;

    const check = await db.query('SELECT user_id FROM it_suite_documents WHERE id = $1', [docId]);
    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const comments = await db.query(
      `SELECT c.id, c.comment_text, c.selection_range, c.resolved, c.created_at, u.name as author_name 
       FROM it_suite_comments c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.document_id = $1 
       ORDER BY c.created_at ASC`,
      [docId]
    );

    res.json(comments.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error loading comments' });
  }
});

// Post a comment
router.post('/documents/:id/comments', authenticate, async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = req.user.id;
    const { comment_text, selection_range } = req.body;

    if (!comment_text) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const check = await db.query('SELECT user_id FROM it_suite_documents WHERE id = $1', [docId]);
    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await db.query(
      `INSERT INTO it_suite_comments (document_id, user_id, comment_text, selection_range)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [docId, userId, comment_text, selection_range || null]
    );

    const fullResult = await db.query(
      `SELECT c.id, c.comment_text, c.selection_range, c.resolved, c.created_at, u.name as author_name 
       FROM it_suite_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(fullResult.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error saving comment' });
  }
});

// Resolve a comment
router.put('/comments/:id/resolve', authenticate, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    // Check authorization via comment -> document -> user
    const check = await db.query(
      `SELECT d.user_id FROM it_suite_comments c 
       JOIN it_suite_documents d ON c.document_id = d.id 
       WHERE c.id = $1`, 
      [commentId]
    );

    if (check.rows.length === 0 || check.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.query('UPDATE it_suite_comments SET resolved = true WHERE id = $1', [commentId]);
    res.json({ message: 'Comment resolved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error resolving comment' });
  }
});

// ==========================================
// DYNAMIC AI ASSISTANT FOR IT SUITE
// ==========================================

// Post to LLM via aiGateway
router.post('/ai', authenticate, async (req, res) => {
  try {
    const { action, prompt, contextText } = req.body;
    let systemInstruction = "You are an expert AI productivity assistant integrated inside EduVerse IT Office Suite.";

    let generatedPrompt = '';
    if (action === 'rewrite') {
      generatedPrompt = `Rewrite the following text to make it more professional, clear, and well-structured. Preserve key facts.\n\nText:\n${contextText}`;
    } else if (action === 'summarize') {
      generatedPrompt = `Summarize this text in bullet points with high informational density. Keep it crisp.\n\nText:\n${contextText}`;
    } else if (action === 'translate') {
      const { targetLang } = req.body;
      generatedPrompt = `Translate the following text to ${targetLang || 'Spanish'} accurately while keeping technical terminology correctly intact.\n\nText:\n${contextText}`;
    } else if (action === 'grammar') {
      generatedPrompt = `Fix all spelling, punctuation, and grammatical mistakes in the following text. Respond with only the corrected text, no conversations.\n\nText:\n${contextText}`;
    } else if (action === 'excel_formula') {
      generatedPrompt = `Write an Excel/Google Sheets compatible formula based on this natural language request: "${prompt}". Explain briefly how it works and output the raw formula starting with = first.`;
    } else if (action === 'excel_analysis') {
      generatedPrompt = `Analyze this dataset snippet:\n${contextText}\n\nQuestion/Task: ${prompt}\n\nProvide clean analytical insights.`;
    } else if (action === 'generate_presentation') {
      systemInstruction = "You are a professional presentation generator. Return ONLY a valid JSON array of slide objects. Do not include markdown code block formats or speech.";
      generatedPrompt = `Generate a slide presentation layout for the topic: "${prompt}". 
      Return exactly a JSON array containing objects matching this format:
      [
        {
          "title": "Slide Title Here",
          "bullets": ["Point 1", "Point 2", "Point 3"]
        }
      ]
      Make sure to return at least 4 slides. Output raw JSON ONLY.`;
    } else {
      // General writing helper
      generatedPrompt = `Help writing/completing this section:\n${contextText}\n\nInstructions: ${prompt}`;
    }

    let aiResult;
    try {
      aiResult = await aiGateway.generateResponse(generatedPrompt, { systemInstruction });
    } catch (e) {
      console.warn('AI gateway lookup failed, using custom demo response fallback.');
      aiResult = { text: `[EduVerse AI Suggestion Fallback]\n\nBased on details: "${prompt || action}", here is the suggested content. Please review and insert.` };
    }

    res.json({ text: aiResult.text });
  } catch (err) {
    console.error('Error in IT Suite AI Assistant:', err);
    res.status(500).json({ message: 'Error processing AI assistant request' });
  }
});

// Fetch Single Document details
router.get('/documents/:id', authenticate, async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = req.user.id;

    const result = await db.query(
      'SELECT * FROM it_suite_documents WHERE id = $1 AND user_id = $2',
      [docId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error loading document detail:', err);
    res.status(500).json({ message: 'Server error loading document' });
  }
});

module.exports = router;

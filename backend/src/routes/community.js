const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const aiGateway = require('../services/aiGateway');
const { generateSmartFallback } = require('../utils/smartFallback');

const router = express.Router();

// Setup community upload directory
const uploadDir = path.join(__dirname, '../../uploads/community');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configurations
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Helper for AI responses with automatic failover
const callAI = async (prompt, systemInstruction = '') => {
  try {
    const result = await aiGateway.generateResponse(prompt, { systemInstruction });
    return result.text;
  } catch (err) {
    console.error('AI gateway error in community route, calling smart fallback:', err.message);
    return generateSmartFallback(prompt);
  }
};

/* ====================================================
   1. ROOMS & CHANNELS
   ==================================================== */

// Get all rooms grouped by category or list
router.get('/rooms', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT r.*, (SELECT COUNT(DISTINCT user_id) FROM call_participants cp JOIN community_calls c ON cp.call_id = c.id WHERE c.room_id = r.id AND c.status = \'active\') as active_call_members FROM community_rooms r ORDER BY r.category, r.name'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching rooms.' });
  }
});

// Create new room
router.post('/rooms', authenticate, async (req, res) => {
  try {
    const { name, category, description, icon, type, password } = req.body;
    const ownerId = req.user.id;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required.' });
    }

    const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-');

    const result = await db.query(
      `INSERT INTO community_rooms (name, category, description, icon, type, owner_id, password)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [cleanName, category, description || '', icon || '💬', type || 'chat', ownerId, password || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating community room.' });
  }
});

/* ====================================================
   2. MESSAGES STREAM
   ==================================================== */

// Get messages for room (paginated / infinite scroll)
router.get('/rooms/:id/messages', authenticate, async (req, res) => {
  try {
    const roomId = req.params.id;
    const limit = parseInt(req.query.limit) || 40;
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
       FROM community_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [roomId, limit, offset]
    );

    // Reverse to chronological order for chat view
    res.json(result.rows.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
});

// Send new message (text, uploads, code snippets)
router.post('/rooms/:id/messages', authenticate, upload.single('file'), async (req, res) => {
  try {
    const roomId = req.params.id;
    const senderId = req.user.id;
    const { text, type, codeLanguage, parentId } = req.body;

    let fileUrl = null;
    let fileName = null;
    let finalType = type || 'text';

    if (req.file) {
      fileUrl = `/uploads/community/${req.file.filename}`;
      fileName = req.file.originalname;
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
        finalType = 'image';
      } else if (['.mp4', '.mov', '.avi'].includes(ext)) {
        finalType = 'video';
      } else if (ext === '.pdf') {
        finalType = 'pdf';
      } else {
        finalType = 'document';
      }
    }

    // Run Toxicity / Spam Check automatically if sending text
    let isSpam = false;
    let toxicityScore = 0.0;
    let finalPayloadText = text || '';

    if (finalPayloadText && finalType === 'text') {
      // Very simple regex filters for spam/toxicity local fallback
      const profanities = ['fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick'];
      const textLower = finalPayloadText.toLowerCase();
      const hasProfanity = profanities.some(word => textLower.includes(word));
      if (hasProfanity) {
        toxicityScore = 0.85;
      }
      
      const spamKeywords = ['earn free cash', 'click here for free', 'win iphone', 'double your money'];
      const hasSpam = spamKeywords.some(phrase => textLower.includes(phrase));
      if (hasSpam) {
        isSpam = true;
      }
    }

    const result = await db.query(
      `INSERT INTO community_messages (room_id, sender_id, text, type, file_url, file_name, code_language, parent_id, is_spam, toxicity_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [roomId, senderId, finalPayloadText, finalType, fileUrl, fileName, codeLanguage || null, parentId || null, isSpam, toxicityScore]
    );

    const savedMessage = result.rows[0];

    // Fetch user info to append
    const userRes = await db.query('SELECT name, avatar_url FROM users WHERE id = $1', [senderId]);
    savedMessage.sender_name = userRes.rows[0].name;
    savedMessage.sender_avatar = userRes.rows[0].avatar_url;

    // Log Activity for XP addition
    await db.query(
      'INSERT INTO user_xp_history (user_id, xp_amount, action) VALUES ($1, 2, \'COMMUNITY_MESSAGE\')',
      [senderId]
    );

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending message.' });
  }
});

// Edit message
router.put('/messages/:id', authenticate, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    const { text } = req.body;

    const checkMsg = await db.query('SELECT sender_id FROM community_messages WHERE id = $1', [messageId]);
    if (checkMsg.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    if (checkMsg.rows[0].sender_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to edit this message.' });
    }

    const result = await db.query(
      'UPDATE community_messages SET text = $1 WHERE id = $2 RETURNING *',
      [text, messageId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating message.' });
  }
});

// Delete message
router.delete('/messages/:id', authenticate, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;

    const checkMsg = await db.query('SELECT sender_id FROM community_messages WHERE id = $1', [messageId]);
    if (checkMsg.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found.' });
    }
    if (checkMsg.rows[0].sender_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this message.' });
    }

    await db.query('DELETE FROM community_messages WHERE id = $1', [messageId]);
    res.json({ success: true, id: messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting message.' });
  }
});

// Message reactions (toggle emoji)
router.post('/messages/:id/react', authenticate, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user.id;
    const { emoji } = req.body;

    if (!emoji) return res.status(400).json({ message: 'Emoji is required.' });

    const msgRes = await db.query('SELECT reactions FROM community_messages WHERE id = $1', [messageId]);
    if (msgRes.rows.length === 0) return res.status(404).json({ message: 'Message not found.' });

    let reactions = msgRes.rows[0].reactions || {};
    let users = reactions[emoji] || [];

    if (users.includes(userId)) {
      // Remove reaction
      users = users.filter(id => id !== userId);
    } else {
      // Add reaction
      users.push(userId);
    }

    if (users.length === 0) {
      delete reactions[emoji];
    } else {
      reactions[emoji] = users;
    }

    const updateRes = await db.query(
      'UPDATE community_messages SET reactions = $1 WHERE id = $2 RETURNING reactions',
      [reactions, messageId]
    );

    res.json({ messageId, reactions: updateRes.rows[0].reactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error setting reaction.' });
  }
});

// Pinned messages toggle
router.post('/messages/:id/pin', authenticate, async (req, res) => {
  try {
    const messageId = req.params.id;
    const result = await db.query(
      'UPDATE community_messages SET is_pinned = NOT is_pinned WHERE id = $1 RETURNING id, is_pinned, room_id',
      [messageId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error toggling pin.' });
  }
});

/* ====================================================
   3. AI SERVICES INSIDE CHAT
   ==================================================== */

// AI Summarize Chat: summarizes the room discussion
router.post('/ai/summarize-chat', authenticate, async (req, res) => {
  try {
    const { roomId } = req.body;
    const msgs = await db.query(
      `SELECT m.text, u.name 
       FROM community_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1 AND m.type = 'text' AND m.is_spam = false AND m.toxicity_score < 0.5
       ORDER BY m.created_at DESC LIMIT 50`,
      [roomId]
    );

    if (msgs.rows.length === 0) {
      return res.json({ summary: 'No recent chat messages available to summarize.' });
    }

    const conversation = msgs.rows.reverse().map(m => `${m.name}: ${m.text}`).join('\n');
    const prompt = `You are a helpful study assistant. Summarize the following community chat discussion between students into a concise 3-bullet-point summary highlighting key topics, concepts taught, or doubts discussed:\n\n${conversation}`;

    const summary = await callAI(prompt, 'You generate clear educational meeting summaries.');
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI summary failed.' });
  }
});

// AI Explain Code: explains a code snippet
router.post('/ai/explain-code', authenticate, async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ message: 'Code is required.' });

    const prompt = `Explain the following ${language || 'programming'} code snippet line-by-line. Detail its algorithm complexity (Time/Space) and check for potential bugs or optimizations:\n\n\`\`\`${language || ''}\n${code}\n\`\`\``;

    const explanation = await callAI(prompt, 'You are an elite coding tutor. Provide clear code reviews.');
    res.json({ explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI code review failed.' });
  }
});

// AI Notes Generator: compiles study notes from chat
router.post('/ai/notes', authenticate, async (req, res) => {
  try {
    const { roomId } = req.body;
    const msgs = await db.query(
      `SELECT m.text, u.name 
       FROM community_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1 AND m.type = 'text' AND m.is_spam = false
       ORDER BY m.created_at DESC LIMIT 60`,
      [roomId]
    );

    if (msgs.rows.length === 0) {
      return res.json({ notes: '# Study Session Notes\nNo recent discussions recorded to create notes.' });
    }

    const conversation = msgs.rows.reverse().map(m => `${m.name}: ${m.text}`).join('\n');
    const prompt = `Generate a structured study notes document in Markdown format based on the topics and coding questions discussed in this chat logs transcript. Add headings, code blocks, definitions, and formulas where applicable:\n\n${conversation}`;

    const notes = await callAI(prompt, 'You compile professional, clear, and beautiful educational markdown notes.');
    res.json({ notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI notes creation failed.' });
  }
});

// AI Reply Generator
router.post('/ai/reply-gen', authenticate, async (req, res) => {
  try {
    const { messageText } = req.body;
    if (!messageText) return res.status(400).json({ message: 'Message text is required.' });

    const prompt = `Suggest 3 short, friendly, and helpful reply suggestions to the following message. Separate each option with a new line:\n\n"${messageText}"`;
    const repliesStr = await callAI(prompt, 'You generate friendly peer chat suggestions.');
    const replies = repliesStr.split('\n').map(r => r.replace(/^\d+[\.\)-]\s*/, '').trim()).filter(Boolean).slice(0, 3);

    res.json({ replies: replies.length > 0 ? replies : ['Interesting idea!', 'Thanks for sharing!', 'I can check that.'] });
  } catch (err) {
    console.error(err);
    res.json({ replies: ['Understood!', 'Let me review this.', 'Thanks for the update!'] });
  }
});

// AI Translate
router.post('/ai/translate', authenticate, async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required.' });

    const prompt = `Translate the following text exactly into ${targetLanguage || 'English'}. Return only the translation:\n\n"${text}"`;
    const translation = await callAI(prompt, 'You are a professional language translator. Output only translated text.');
    res.json({ translation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Translation failed.' });
  }
});

// AI Grammar Correction
router.post('/ai/grammar', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text is required.' });

    const prompt = `Review the following sentence for grammar and spelling. Return the corrected version immediately without annotations:\n\n"${text}"`;
    const corrected = await callAI(prompt, 'You correct grammar and return only the clean, polished sentence.');
    res.json({ corrected });
  } catch (err) {
    console.error(err);
    res.json({ corrected: text });
  }
});

// AI Homework Helper / Study Assistant
router.post('/ai/homework-helper', authenticate, async (req, res) => {
  try {
    const { question, subject } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required.' });

    const prompt = `Solve this academic problem step-by-step. Explain the logical deduction, provide the code or equations, and specify recommendations. Keep descriptions suitable for a college student:\n\nSubject: ${subject || 'General'}\nQuestion: ${question}`;

    const answer = await callAI(prompt, 'You are an elite university professor helping students solve homework questions.');
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'AI Homework solver failed.' });
  }
});

/* ====================================================
   4. VOICE & VIDEO CALLS LOGGING
   ==================================================== */

// Create or Join Call
router.post('/calls', authenticate, async (req, res) => {
  try {
    const { roomId, type, password } = req.body;
    const hostId = req.user.id;

    if (!roomId || !type) {
      return res.status(400).json({ message: 'RoomId and type (voice/video) are required.' });
    }

    // Check if there is an active call in this room
    const checkCall = await db.query(
      'SELECT * FROM community_calls WHERE room_id = $1 AND status = \'active\'',
      [roomId]
    );

    let call = null;
    if (checkCall.rows.length > 0) {
      call = checkCall.rows[0];
    } else {
      // Create new call
      const insertCall = await db.query(
        `INSERT INTO community_calls (room_id, type, host_id, status)
         VALUES ($1, $2, $3, 'active') RETURNING *`,
        [roomId, type, hostId]
      );
      call = insertCall.rows[0];
    }

    // Register active participant connection
    await db.query(
      `INSERT INTO call_participants (call_id, user_id, joined_at)
       VALUES ($1, $2, NOW())`,
      [call.id, hostId]
    );

    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error initializing call.' });
  }
});

// Leave call
router.post('/calls/:id/leave', authenticate, async (req, res) => {
  try {
    const callId = req.params.id;
    const userId = req.user.id;

    // Set participant leave time
    await db.query(
      `UPDATE call_participants 
       SET left_at = NOW() 
       WHERE call_id = $1 AND user_id = $2 AND left_at IS NULL`,
      [callId, userId]
    );

    // If no active participants remain in this call, set status = 'ended'
    const participants = await db.query(
      'SELECT COUNT(*) as count FROM call_participants WHERE call_id = $1 AND left_at IS NULL',
      [callId]
    );

    if (parseInt(participants.rows[0].count) === 0) {
      await db.query(
        'UPDATE community_calls SET status = \'ended\', ended_at = NOW() WHERE id = $1',
        [callId]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error leaving call.' });
  }
});

// Update Call AI Transcription, Smart Notes, Summary
router.post('/calls/:id/notes', authenticate, async (req, res) => {
  try {
    const callId = req.params.id;
    const { transcription } = req.body;

    if (!transcription) {
      return res.status(400).json({ message: 'Transcription text is required.' });
    }

    // Call AI to summarize transcription
    const summaryPrompt = `Provide a structured summary of the following meeting transcript. Outline:
1. Meeting minutes and overall topic
2. Key questions raised & answers
3. Specific actionable items (who does what)
4. List of 5 important keywords discussed.

Transcript:\n${transcription}`;

    const summaryText = await callAI(summaryPrompt, 'You draft professional meeting minutes, action items, and keywords.');

    // Save notes to database
    await db.query(
      `UPDATE community_calls 
       SET transcription = $1, summary = $2, notes = $2, updated_at = NOW() 
       WHERE id = $3`,
      [transcription, summaryText, callId]
    );

    res.json({ callId, summary: summaryText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error generating call notes.' });
  }
});

/* ====================================================
   5. WHITEBOARD & NOTES SYNC
   ==================================================== */

// Fetch whiteboard data for room
router.get('/rooms/:id/whiteboard', authenticate, async (req, res) => {
  try {
    const roomId = req.params.id;
    const result = await db.query('SELECT elements FROM whiteboard_sessions WHERE room_id = $1', [roomId]);
    if (result.rows.length === 0) {
      return res.json([]);
    }
    res.json(result.rows[0].elements || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching whiteboard.' });
  }
});

// Save whiteboard elements
router.post('/rooms/:id/whiteboard', authenticate, async (req, res) => {
  try {
    const roomId = req.params.id;
    const { elements } = req.body;

    await db.query(
      `INSERT INTO whiteboard_sessions (room_id, elements, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (room_id) DO UPDATE SET elements = EXCLUDED.elements, updated_at = NOW()`,
      [roomId, JSON.stringify(elements || [])]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving whiteboard.' });
  }
});

// Fetch collaborative notes for room
router.get('/rooms/:id/notes', authenticate, async (req, res) => {
  try {
    const roomId = req.params.id;
    const result = await db.query('SELECT content FROM collaborative_notes WHERE room_id = $1', [roomId]);
    if (result.rows.length === 0) {
      return res.json({ content: '' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ content: '' });
  }
});

// Save collaborative notes
router.post('/rooms/:id/notes', authenticate, async (req, res) => {
  try {
    const roomId = req.params.id;
    const { content } = req.body;

    await db.query(
      `INSERT INTO collaborative_notes (room_id, content, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (room_id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
      [roomId, content || '']
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving notes.' });
  }
});

// Fetch collaborative code boilerplate
router.get('/rooms/:id/code', authenticate, async (req, res) => {
  try {
    const roomId = req.params.id;
    const result = await db.query('SELECT code, language FROM collaborative_code WHERE room_id = $1', [roomId]);
    if (result.rows.length === 0) {
      return res.json({ code: '// Live programming room\nconsole.log("Welcome!");', language: 'javascript' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.json({ code: '', language: 'javascript' });
  }
});

// Save collaborative code
router.post('/rooms/:id/code', authenticate, async (req, res) => {
  try {
    const roomId = req.params.id;
    const { code, language } = req.body;

    await db.query(
      `INSERT INTO collaborative_code (room_id, code, language, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (room_id) DO UPDATE SET code = EXCLUDED.code, language = EXCLUDED.language, updated_at = NOW()`,
      [roomId, code || '', language || 'javascript']
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving code.' });
  }
});

/* ====================================================
   6. EVENT SCHEDULER (CALENDAR)
   ==================================================== */

// Fetch scheduled events
router.get('/events', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT e.*, r.name as room_name, u.name as creator_name
       FROM community_events e
       LEFT JOIN community_rooms r ON e.room_id = r.id
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.start_time ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching events.' });
  }
});

// Schedule new event
router.post('/events', authenticate, async (req, res) => {
  try {
    const { roomId, title, description, eventType, startTime, endTime } = req.body;
    const creatorId = req.user.id;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, startTime and endTime are required.' });
    }

    const result = await db.query(
      `INSERT INTO community_events (room_id, title, description, event_type, start_time, end_time, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [roomId || null, title, description || '', eventType || 'study_session', startTime, endTime, creatorId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating event.' });
  }
});

/* ====================================================
   7. GAMIFICATION & LEADERBOARD
   ==================================================== */

// Get community leaderboard (by user XP accumulated in user_xp_history)
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, COALESCE(SUM(x.xp_amount), 0) as total_xp,
              COUNT(m.id) as message_count
       FROM users u
       LEFT JOIN user_xp_history x ON u.id = x.user_id
       LEFT JOIN community_messages m ON u.id = m.sender_id
       GROUP BY u.id
       ORDER BY total_xp DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching leaderboard.' });
  }
});

/* ====================================================
   8. FRIEND SYSTEM & DIRECT MESSAGES
   ==================================================== */

// Fetch friends list (accepted and pending)
router.get('/friends', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT f.status, f.created_at, 
              u.id as friend_id, u.name as friend_name, u.email as friend_email, u.avatar_url as friend_avatar,
              CASE WHEN f.user_id = $1 THEN true ELSE false END as is_requester
       FROM user_friends f
       JOIN users u ON (f.user_id = u.id AND f.friend_id = $1) OR (f.friend_id = u.id AND f.user_id = $1)
       WHERE u.id != $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching friends.' });
  }
});

// Send friend request
router.post('/friends', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendEmail } = req.body;

    if (!friendEmail) return res.status(400).json({ message: 'Friend email is required.' });

    const targetUser = await db.query('SELECT id, name FROM users WHERE email = $1', [friendEmail.trim()]);
    if (targetUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    const friendId = targetUser.rows[0].id;
    if (friendId === userId) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend.' });
    }

    // Check if friendship already exists
    const checkFriend = await db.query(
      'SELECT * FROM user_friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friendId]
    );

    if (checkFriend.rows.length > 0) {
      return res.status(400).json({ message: 'Friend request already exists or you are already friends.' });
    }

    await db.query(
      'INSERT INTO user_friends (user_id, friend_id, status) VALUES ($1, $2, \'pending\')',
      [userId, friendId]
    );

    res.json({ success: true, message: `Friend request sent to ${targetUser.rows[0].name}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding friend.' });
  }
});

// Accept friend request
router.put('/friends/accept', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { friendId } = req.body;

    await db.query(
      'UPDATE user_friends SET status = \'accepted\' WHERE user_id = $1 AND friend_id = $2',
      [friendId, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error accepting friend request.' });
  }
});

/* ====================================================
   9. MODERATION & REPORTS
   ==================================================== */

// Create Report on user
router.post('/report', authenticate, async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { reportedId, messageId, reason } = req.body;

    if (!reportedId || !reason) {
      return res.status(400).json({ message: 'Reported user ID and reason are required.' });
    }

    await db.query(
      `INSERT INTO community_reports (reporter_id, reported_id, message_id, reason)
       VALUES ($1, $2, $3, $4)`,
      [reporterId, reportedId, messageId || null, reason]
    );

    res.status(201).json({ success: true, message: 'User report submitted successfully to moderators.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error filing user report.' });
  }
});

// Moderator Dashboard: fetch reports
router.get('/moderation/reports', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const result = await db.query(
      `SELECT cr.*, 
              u1.name as reporter_name, u1.email as reporter_email,
              u2.name as reported_name, u2.email as reported_email,
              m.text as message_text
       FROM community_reports cr
       JOIN users u1 ON cr.reporter_id = u1.id
       JOIN users u2 ON cr.reported_id = u2.id
       LEFT JOIN community_messages m ON cr.message_id = m.id
       ORDER BY cr.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving moderation reports.' });
  }
});

// Moderator Action: resolve report, mute/kick/ban user
router.post('/moderation/action', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
    }

    const { reportId, targetUserId, action } = req.body; // action = 'resolve', 'block', 'warn'

    if (action === 'block') {
      await db.query('UPDATE users SET blocked = true WHERE id = $1', [targetUserId]);
    }

    if (reportId) {
      await db.query('UPDATE community_reports SET status = \'resolved\' WHERE id = $1', [reportId]);
    }

    res.json({ success: true, message: `Moderation action "${action}" completed.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing moderator action.' });
  }
});

module.exports = router;

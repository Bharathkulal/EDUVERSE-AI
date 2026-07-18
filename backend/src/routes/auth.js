const express = require('express');
const axios = require('axios');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userRole = role === 'admin' ? 'admin' : 'student';

      const result = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, profile_completed, review_submitted',
        [name, email.toLowerCase(), hashedPassword, userRole]
      );

      const user = result.rows[0];

      if (userRole === 'student') {
        await db.query(
          'INSERT INTO student_progress (student_id) VALUES ($1) ON CONFLICT (student_id) DO NOTHING',
          [user.id]
        );
      }

      const token = generateToken(user);
      res.status(201).json({ message: 'Registration successful', token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await db.query(
        'SELECT id, name, email, password, role, profile_completed, review_submitted FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = result.rows[0];
      
      // Check if student user is blocked
      const blockedCheck = await db.query('SELECT blocked FROM users WHERE id = $1', [user.id]);
      if (blockedCheck.rows.length > 0 && blockedCheck.rows[0].blocked) {
        return res.status(403).json({ message: 'This account has been temporarily blocked by administration.' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      delete user.password;
      const token = generateToken(user);

      // Log Login activity
      const { logActivity } = require('../utils/system_logger');
      logActivity(user.id, 'login', 'Auth', 'User logged in successfully', false).catch(e => console.error(e));

      res.json({ message: 'Login successful', token, user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
);

router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({ message: 'Google Access Token is required' });
    }

    // Verify token with Google's userinfo API
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const payload = googleRes.data;
    const email = payload.email.toLowerCase();
    const name = payload.name;

    // Find or create user
    let userResult = await db.query(
      'SELECT id, name, email, role, profile_completed, review_submitted FROM users WHERE email = $1',
      [email]
    );

    let user;
    if (userResult.rows.length === 0) {
      // Create user
      const result = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, profile_completed, review_submitted',
        [name, email, '', 'student'] // Empty password for OAuth users
      );
      user = result.rows[0];

      // Insert student progress
      await db.query(
        'INSERT INTO student_progress (student_id) VALUES ($1) ON CONFLICT (student_id) DO NOTHING',
        [user.id]
      );
    } else {
      user = userResult.rows[0];
      
      // Check if blocked
      const blockedCheck = await db.query('SELECT blocked FROM users WHERE id = $1', [user.id]);
      if (blockedCheck.rows.length > 0 && blockedCheck.rows[0].blocked) {
        return res.status(403).json({ message: 'This account has been temporarily blocked by administration.' });
      }
    }

    // Log Login activity
    const { logActivity } = require('../utils/system_logger');
    logActivity(user.id, 'login', 'Auth', 'User logged in successfully via Google OAuth', false).catch(e => console.error(e));

    const token = generateToken(user);
    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(401).json({ message: 'Google verification failed or token is invalid' });
  }
});

router.post(
  '/forgot-password',
  [body('email').isEmail()],
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;
      const result = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);

      if (result.rows.length === 0) {
        return res.json({ message: 'If that email exists, a reset link has been sent.' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000);

      await db.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
        [resetToken, expires, email.toLowerCase()]
      );

      res.json({
        message: 'If that email exists, a reset link has been sent.',
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { token, password } = req.body;
      const result = await db.query(
        'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await db.query(
        'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
        [hashedPassword, result.rows[0].id]
      );

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role, created_at, profile_completed, review_submitted FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, created_at, avatar_url, phone_number, course, semester, college_name,
              daily_study_hours_goal, weekly_quiz_target, subject_mastery_target,
              privacy_profile_visible, privacy_analytics_sharing, review_submitted
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile
router.put(
  '/profile',
  authenticate,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone_number').optional({ checkFalsy: true }).trim(),
    body('college_name').optional({ checkFalsy: true }).trim(),
    body('course').optional({ checkFalsy: true }).trim(),
    body('semester').optional({ checkFalsy: true }).isInt({ min: 1, max: 12 }),
    body('avatar_url').optional({ checkFalsy: true }).trim(),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, phone_number, college_name, course, semester, avatar_url } = req.body;
      const result = await db.query(
        `UPDATE users 
         SET name = $1, phone_number = $2, college_name = $3, course = $4, semester = $5, avatar_url = $6
         WHERE id = $7 RETURNING id, name, email, role, avatar_url, phone_number, course, semester, college_name`,
        [name, phone_number || null, college_name || null, course || 'BCA', semester || 1, avatar_url || null, req.user.id]
      );
      res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update Password
router.put(
  '/profile/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await db.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
      
      const valid = await bcrypt.compare(currentPassword, user.rows[0].password);
      if (!valid) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update Goals & Privacy
router.put(
  '/profile/goals',
  authenticate,
  async (req, res) => {
    try {
      const { 
        daily_study_hours_goal, 
        weekly_quiz_target, 
        subject_mastery_target,
        privacy_profile_visible,
        privacy_analytics_sharing
      } = req.body;

      await db.query(
        `UPDATE users 
         SET daily_study_hours_goal = COALESCE($1, daily_study_hours_goal), 
             weekly_quiz_target = COALESCE($2, weekly_quiz_target), 
             subject_mastery_target = COALESCE($3, subject_mastery_target),
             privacy_profile_visible = COALESCE($4, privacy_profile_visible),
             privacy_analytics_sharing = COALESCE($5, privacy_analytics_sharing)
         WHERE id = $6`,
        [daily_study_hours_goal, weekly_quiz_target, subject_mastery_target, privacy_profile_visible, privacy_analytics_sharing, req.user.id]
      );
      res.json({ message: 'Goals and settings updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete Profile
router.delete('/profile', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Activity logs
router.get('/profile/activity', authenticate, async (req, res) => {
  try {
    // Attempted quizzes
    const quizzes = await db.query(
      `SELECT qr.score, qr.total_questions, qr.submitted_at, q.title as quiz_title, s.subject_name
       FROM quiz_results qr
       JOIN quizzes q ON qr.quiz_id = q.id
       JOIN subjects s ON q.subject_id = s.id
       WHERE qr.student_id = $1
       ORDER BY qr.submitted_at DESC LIMIT 10`,
      [req.user.id]
    );

    // Coding submissions
    const coding = await db.query(
      `SELECT cs.language, cs.score, cs.submitted_at, cp.title as problem_title
       FROM coding_submissions cs
       JOIN coding_problems cp ON cs.problem_id = cp.id
       WHERE cs.student_id = $1
       ORDER BY cs.submitted_at DESC LIMIT 10`,
      [req.user.id]
    );

    res.json({ quizzes: quizzes.rows, coding: coding.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

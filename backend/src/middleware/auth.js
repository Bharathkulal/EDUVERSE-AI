const jwt = require('jsonwebtoken');

const db = require('../config/db');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if blocked in DB
    const userRes = await db.query('SELECT blocked FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length > 0 && userRes.rows[0].blocked) {
      return res.status(403).json({ message: 'This account has been temporarily blocked by administration.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
};

const authorizeStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ message: 'Student access required.' });
  }
  next();
};

module.exports = { authenticate, authorizeAdmin, authorizeStudent };

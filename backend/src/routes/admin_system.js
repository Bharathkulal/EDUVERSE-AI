const express = require('express');
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const router = express.Router();

// 1. GET Vercel-style system dashboard overview
router.get('/dashboard', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const totalStudents = await db.query("SELECT COUNT(*)::int FROM users WHERE role = 'student'");
    const activeNow = await db.query("SELECT COUNT(DISTINCT user_id)::int FROM user_activity_logs WHERE created_at > NOW() - INTERVAL '5 minutes'");
    const totalRequests = await db.query("SELECT COUNT(*)::int FROM user_activity_logs WHERE api_used = true");
    const totalUsage = await db.query("SELECT COALESCE(SUM(api_used_today)::int, 0) as total_used, COALESCE(SUM(api_limit)::int, 0) as total_limit FROM users");
    const tutorsUsed = await db.query("SELECT COUNT(*)::int FROM user_activity_logs WHERE module = 'AI Tutor'");

    // Check system stability
    const errors = await db.query("SELECT COUNT(*)::int FROM api_usage_logs WHERE success = false AND created_at > NOW() - INTERVAL '30 minutes'");
    let health = 'Green';
    if (errors.rows[0].count > 5) health = 'Red';
    else if (errors.rows[0].count > 1) health = 'Yellow';

    // Graph trends
    const apiTrend = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:00') as time, COUNT(*)::int as count 
      FROM user_activity_logs 
      WHERE api_used = true AND created_at > NOW() - INTERVAL '24 hours'
      GROUP BY time ORDER BY time ASC
    `);

    const loginTrend = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*)::int as count 
      FROM user_activity_logs 
      WHERE action = 'login' AND created_at > NOW() - INTERVAL '7 days'
      GROUP BY date ORDER BY date ASC
    `);

    // Stream logs payload (last 10 events)
    const logs = await db.query(`
      SELECT a.id, a.action, a.module, a.value, a.created_at, u.name as user_name 
      FROM user_activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC LIMIT 10
    `);

    res.json({
      totalStudents: totalStudents.rows[0].count,
      activeNow: activeNow.rows[0].count || Math.floor(Math.random() * 3) + 1, // simulated base fallback
      totalRequests: totalRequests.rows[0].count,
      remainingQuota: totalUsage.rows[0].total_limit - totalUsage.rows[0].total_used,
      totalLimit: totalUsage.rows[0].total_limit,
      tutorsUsed: tutorsUsed.rows[0].count,
      health,
      apiTrend: apiTrend.rows,
      loginTrend: loginTrend.rows,
      logs: logs.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving system overview data' });
  }
});

// 2. GET Student Management List
router.get('/students', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const studentsRes = await db.query(`
      SELECT id, name, email, api_limit, api_used_today, blocked, created_at
      FROM users 
      WHERE role = 'student' 
      ORDER BY id DESC
    `);

    // Add dynamic AI engagement ratings
    const enriched = await Promise.all(studentsRes.rows.map(async (student) => {
      const logs = await db.query("SELECT COUNT(*)::int FROM user_activity_logs WHERE user_id = $1", [student.id]);
      const actionsCount = logs.rows[0].count;
      
      // Engagement scoring logic
      let score = 50; // base
      if (actionsCount > 50) score = 95;
      else if (actionsCount > 20) score = 80;
      else if (actionsCount > 5) score = 65;

      return {
        ...student,
        engagementScore: score,
        activityCount: actionsCount
      };
    }));

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving students list' });
  }
});

// Update Student quota limit / block state
router.post('/students/control', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id, api_limit, blocked } = req.body;

    if (api_limit !== undefined) {
      await db.query("UPDATE users SET api_limit = $1 WHERE id = $2", [api_limit, id]);
    }
    if (blocked !== undefined) {
      await db.query("UPDATE users SET blocked = $1 WHERE id = $2", [blocked, id]);
    }

    res.json({ message: 'Student limits and block parameters updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating student quota metrics' });
  }
});

// 3. System Logs endpoint
router.get('/logs', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { action, module, limit = 50 } = req.query;
    let query = `
      SELECT a.id, a.user_id, a.action, a.module, a.value, a.api_used, a.metadata, a.created_at, u.name as user_name 
      FROM user_activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (action) {
      query += ` AND a.action = $${paramIndex++}`;
      params.push(action);
    }
    if (module) {
      query += ` AND a.module = $${paramIndex++}`;
      params.push(module);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const logs = await db.query(query, params);
    res.json(logs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving log rows' });
  }
});

// 4. GET Analytics Panel insights
router.get('/analytics', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const hotTopics = await db.query(`
      SELECT value as query, COUNT(*)::int as count 
      FROM user_activity_logs 
      WHERE action = 'search' OR action = 'ai_prompt'
      GROUP BY value 
      ORDER BY count DESC LIMIT 5
    `);

    const peakHours = await db.query(`
      SELECT TO_CHAR(created_at, 'HH24:00') as hour, COUNT(*)::int as count 
      FROM user_activity_logs 
      GROUP BY hour 
      ORDER BY hour ASC
    `);

    const features = await db.query(`
      SELECT module, COUNT(*)::int as count 
      FROM user_activity_logs 
      GROUP BY module 
      ORDER BY count DESC
    `);

    res.json({
      hotTopics: hotTopics.rows,
      peakHours: peakHours.rows,
      features: features.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving analytics parameters' });
  }
});

// 5. Emergency Emergency Controls & API Dashboard configs
router.post('/emergency-override', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'SAFE_MODE' or 'NORMAL'
    
    if (action === 'SAFE_MODE') {
      await db.query("UPDATE api_configurations SET disabled = true");
      await db.query("INSERT INTO system_alerts (priority, title, message) VALUES ('Critical', 'Emergency Override Triggered', 'SAFE MODE active. All API connections are suspended.')");
      return res.json({ message: 'SAFE MODE initiated. API access suspended.' });
    } else {
      await db.query("UPDATE api_configurations SET disabled = false");
      await db.query("INSERT INTO system_alerts (priority, title, message) VALUES ('High', 'Emergency Override Terminated', 'SAFE MODE cleared. API access restored.')");
      return res.json({ message: 'Normal operations restored.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Emergency control trigger failed' });
  }
});

// 6. GET/POST alerts system endpoints
router.get('/alerts', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const alerts = await db.query("SELECT * FROM system_alerts ORDER BY created_at DESC LIMIT 30");
    res.json(alerts.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading alerts tracker' });
  }
});

router.post('/alerts/resolve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    await db.query("UPDATE system_alerts SET status = 'Resolved' WHERE id = $1", [id]);
    res.json({ message: 'Alert state updated to Resolved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating alert status' });
  }
});

// 7. ML Training Controls
router.get('/ml', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const jobs = await db.query("SELECT * FROM ml_training_jobs ORDER BY created_at DESC LIMIT 10");
    res.json(jobs.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading ML jobs' });
  }
});

router.post('/ml/train', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'START' or 'STOP'
    
    if (action === 'START') {
      const version = `edu-v2.${Math.floor(Math.random() * 90) + 10}`;
      const size = Math.floor(Math.random() * 5000) + 1000;
      
      const newJob = await db.query(
        `INSERT INTO ml_training_jobs (model_version, status, dataset_size) 
         VALUES ($1, 'Running', $2) RETURNING *`,
        [version, size]
      );

      // Simulate live training update loops in the background
      let epoch = 0;
      const interval = setInterval(async () => {
        epoch += 10;
        const accuracy = Math.min(0.99, 0.70 + (epoch / 100) * 0.28 + Math.random() * 0.01);
        const loss = Math.max(0.01, 0.40 - (epoch / 100) * 0.38 + Math.random() * 0.01);
        
        if (epoch >= 100) {
          clearInterval(interval);
          await db.query(
            `UPDATE ml_training_jobs SET status = 'Completed', accuracy = $1, loss = $2, epochs = 100 WHERE id = $3`,
            [accuracy.toFixed(4), loss.toFixed(4), newJob.rows[0].id]
          );
        } else {
          await db.query(
            `UPDATE ml_training_jobs SET accuracy = $1, loss = $2, epochs = $3 WHERE id = $4`,
            [accuracy.toFixed(4), loss.toFixed(4), epoch, newJob.rows[0].id]
          );
        }
      }, 5000);

      res.json({ message: 'ML Training started successfully.', job: newJob.rows[0] });
    } else {
      await db.query("UPDATE ml_training_jobs SET status = 'Failed' WHERE status = 'Running'");
      res.json({ message: 'Active ML training runs aborted.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error initiating ML training' });
  }
});

module.exports = router;

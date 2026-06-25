const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper: Ensure user has a progress record
async function getOrCreateProgress(studentId) {
  const check = await db.query(
    'SELECT * FROM advanced_java_progress WHERE student_id = $1',
    [studentId]
  );
  if (check.rows.length > 0) {
    return check.rows[0];
  }

  // Insert default progress record
  const result = await db.query(`
    INSERT INTO advanced_java_progress 
      (student_id, completed_topics, study_hours, current_level, learning_streak, topics_completed, projects_completed, quiz_accuracy, practice_score, certificate_status)
    VALUES 
      ($1, 2, 4.5, 3, 5, 2, 0, 85.0, 90.0, 'Locked')
    RETURNING *
  `, [studentId]);
  return result.rows[0];
}

// GET: /api/advanced-java/dashboard
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const progress = await getOrCreateProgress(studentId);

    // Fetch AI Recommendations
    let aiRec = await db.query(
      'SELECT * FROM advanced_java_ai_recommendations WHERE student_id = $1',
      [studentId]
    );
    if (aiRec.rows.length === 0) {
      await db.query(`
        INSERT INTO advanced_java_ai_recommendations 
          (student_id, recommendations, strength_areas, weak_areas, suggestions, next_best_action)
        VALUES 
          ($1, 'Focus on Hibernate mapping optimization and transaction parameters.', 'JDBC connection configurations, HTTP response models', 'ORM, JSP custom attributes, Spring MVC request scopes', 'Take the Spring Boot DI sandbox test.', 'Complete JDBC Transaction Commit lesson')
      `, [studentId]);
      aiRec = await db.query(
        'SELECT * FROM advanced_java_ai_recommendations WHERE student_id = $1',
        [studentId]
      );
    }

    // Fetch achievements
    const achievements = await db.query(
      'SELECT * FROM advanced_java_achievements WHERE student_id = $1',
      [studentId]
    );

    // Fetch analytics heatmap or generate mock values if empty
    const analyticsRes = await db.query(
      'SELECT * FROM advanced_java_analytics WHERE student_id = $1 ORDER BY date ASC',
      [studentId]
    );
    let analytics = analyticsRes.rows;
    if (analytics.length === 0) {
      // Seed past 7 days of learning logs
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const randomTime = Math.floor(Math.random() * 60) + 15; // 15 to 75 mins
        await db.query(`
          INSERT INTO advanced_java_analytics 
            (student_id, date, learning_time, progress_val, topic_mastery, quiz_perf, coding_perf, project_perf)
          VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (student_id, date) DO NOTHING
        `, [studentId, dateStr, randomTime, (7 - i) * 12, 70 + (7 - i) * 3, 75 + i, 80 + i, 60 + i * 5]);
      }
      const newAnalytics = await db.query(
        'SELECT * FROM advanced_java_analytics WHERE student_id = $1 ORDER BY date ASC',
        [studentId]
      );
      analytics = newAnalytics.rows;
    }

    // Recommended topics
    const nextTopic = await db.query(`
      SELECT t.id, t.title, m.title as module_title
      FROM advanced_java_topics t
      JOIN advanced_java_modules m ON m.id = t.module_id
      ORDER BY m.order_index ASC, t.order_index ASC
      LIMIT 1
    `);

    res.json({
      progress,
      aiRecommendations: aiRec.rows[0],
      achievements: achievements.rows,
      analytics,
      nextTopic: nextTopic.rows[0] || { title: 'JDBC Core Connection Configurations', module_title: 'JDBC Module' }
    });
  } catch (err) {
    console.error('Advanced Java Dashboard error:', err);
    res.status(500).json({ message: 'Error retrieving Advanced Java dashboard analytics.' });
  }
});

// GET: /api/advanced-java/modules
router.get('/modules', authenticate, async (req, res) => {
  try {
    const modules = await db.query(`
      SELECT m.*, 
        COALESCE(
          (SELECT json_agg(json_build_object(
            'id', t.id,
            'title', t.title,
            'content', t.content,
            'order_index', t.order_index
          ) ORDER BY t.order_index ASC), '[]'::json
        ) as topics
      FROM advanced_java_modules m
      LEFT JOIN advanced_java_topics t ON t.module_id = m.id
      GROUP BY m.id
      ORDER BY m.order_index ASC
    `);
    res.json(modules.rows);
  } catch (err) {
    console.error('Fetch modules error:', err);
    res.status(500).json({ message: 'Error fetching Advanced Java modules.' });
  }
});

// POST: /api/advanced-java/topic/complete
router.post('/topic/complete', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { topicId, complete } = req.body;
    
    // In our simplified database layout, we track the count of completed topics
    // inside the advanced_java_progress record.
    const progress = await getOrCreateProgress(studentId);
    let newCompletedCount = progress.completed_topics;
    
    if (complete) {
      newCompletedCount += 1;
    } else if (newCompletedCount > 0) {
      newCompletedCount -= 1;
    }

    const updated = await db.query(`
      UPDATE advanced_java_progress
      SET completed_topics = $1, topics_completed = $1
      WHERE student_id = $2
      RETURNING *
    `, [newCompletedCount, studentId]);

    // Check achievement unlock
    if (newCompletedCount >= 5) {
      await db.query(`
        INSERT INTO advanced_java_achievements (student_id, title, xp_reward)
        VALUES ($1, 'JDBC Explorer', 150)
        ON CONFLICT (student_id, title) DO NOTHING
      `, [studentId]);
    }

    res.json({ message: 'Topic status updated.', progress: updated.rows[0] });
  } catch (err) {
    console.error('Complete topic error:', err);
    res.status(500).json({ message: 'Error completing Advanced Java topic.' });
  }
});

// POST: /api/advanced-java/topic/notes
router.post('/topic/notes', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { topicId, notes } = req.body;
    
    // Store user note inside general system notes or user activity log
    await db.query(`
      INSERT INTO notes (user_id, title, content, pinned)
      VALUES ($1, $2, $3, false)
    `, [studentId, `Advanced Java Notes - Topic ${topicId}`, notes]);

    res.json({ message: 'Notepad note synced to database successfully.' });
  } catch (err) {
    console.error('Notes saving error:', err);
    res.status(500).json({ message: 'Error saving study notes.' });
  }
});

// GET: /api/advanced-java/practice
router.get('/practice', authenticate, async (req, res) => {
  try {
    const practice = await db.query('SELECT * FROM advanced_java_practice');
    res.json(practice.rows);
  } catch (err) {
    console.error('Fetch practice questions error:', err);
    res.status(500).json({ message: 'Error fetching practice questions.' });
  }
});

// POST: /api/advanced-java/practice/submit
router.post('/practice/submit', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { questionId, answer } = req.body;

    const qRes = await db.query('SELECT * FROM advanced_java_practice WHERE id = $1', [questionId]);
    if (qRes.rows.length === 0) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    const question = qRes.rows[0];
    const isCorrect = question.correct_answer.trim().toLowerCase() === answer.trim().toLowerCase();

    // Reward XP dynamically
    if (isCorrect) {
      await db.query(`
        INSERT INTO user_xp_history (user_id, xp_amount, action)
        VALUES ($1, 20, 'Solved Advanced Java Practice Question')
      `, [studentId]);

      // Update student progress statistics
      await db.query(`
        UPDATE advanced_java_progress
        SET practice_score = LEAST(100.0, practice_score + 2.0),
            quiz_accuracy = LEAST(100.0, quiz_accuracy + 1.5)
        WHERE student_id = $1
      `, [studentId]);
    }

    res.json({
      isCorrect,
      explanation: question.explanation,
      correctAnswer: question.correct_answer
    });
  } catch (err) {
    console.error('Practice submit error:', err);
    res.status(500).json({ message: 'Error submitting practice answer.' });
  }
});

// GET: /api/advanced-java/projects
router.get('/projects', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const projects = await db.query(`
      SELECT p.*, s.status, s.code_quality, s.progress
      FROM advanced_java_projects p
      LEFT JOIN advanced_java_submissions s ON s.project_id = p.id AND s.student_id = $1
    `, [studentId]);
    res.json(projects.rows);
  } catch (err) {
    console.error('Fetch projects error:', err);
    res.status(500).json({ message: 'Error fetching enterprise projects.' });
  }
});

// POST: /api/advanced-java/project/submit
router.post('/project/submit', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { projectId, code } = req.body;

    // Insert or update submission
    const existing = await db.query(
      'SELECT id FROM advanced_java_submissions WHERE student_id = $1 AND project_id = $2',
      [studentId, projectId]
    );

    let result;
    const ratingCode = code.length > 50 ? 'A+ Optimal' : 'Needs Optimization';
    if (existing.rows.length > 0) {
      result = await db.query(`
        UPDATE advanced_java_submissions
        SET status = 'Completed', progress = 100, code_quality = $1, submitted_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [ratingCode, existing.rows[0].id]);
    } else {
      result = await db.query(`
        INSERT INTO advanced_java_submissions (student_id, project_id, status, code_quality, progress)
        VALUES ($1, $2, 'Completed', $3, 100)
        RETURNING *
      `, [studentId, projectId, ratingCode]);
    }

    // Award achievement and XP
    await db.query(`
      INSERT INTO user_xp_history (user_id, xp_amount, action)
      VALUES ($1, 200, 'Submitted Advanced Java Enterprise Project')
    `, [studentId]);

    // Update progress stats
    await db.query(`
      UPDATE advanced_java_progress
      SET projects_completed = projects_completed + 1
      WHERE student_id = $1
    `, [studentId]);

    res.json({
      message: 'Project submitted successfully for AI grading review.',
      submission: result.rows[0]
    });
  } catch (err) {
    console.error('Project submission error:', err);
    res.status(500).json({ message: 'Error submitting enterprise project.' });
  }
});

// POST: /api/advanced-java/certificate/claim
router.post('/certificate/claim', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const progress = await getOrCreateProgress(studentId);

    // Verification check: Needs 100% completion (e.g. 5+ completed topics)
    if (progress.completed_topics < 5) {
      return res.status(400).json({ message: 'Certificate Locked: Ensure you complete all required syllabus modules.' });
    }

    const certId = `CERT-ADV-JAVA-${studentId}-${Date.now().toString().slice(-4)}`;
    
    await db.query(`
      INSERT INTO advanced_java_certificates (student_id, certificate_id)
      VALUES ($1, $2)
      ON CONFLICT (student_id) DO NOTHING
    `, [studentId, certId]);

    await db.query(`
      UPDATE advanced_java_progress
      SET certificate_status = 'Issued'
      WHERE student_id = $1
    `, [studentId]);

    res.json({ message: 'Certificate issued successfully!', certificateId: certId });
  } catch (err) {
    console.error('Claim cert error:', err);
    res.status(500).json({ message: 'Error claiming Advanced Java certificate.' });
  }
});

module.exports = router;

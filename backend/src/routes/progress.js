const express = require('express');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;

    const subjects = await db.query('SELECT COUNT(*) as count FROM subjects');
    const completedTopics = await db.query(
      'SELECT completed_topics, study_hours FROM student_progress WHERE student_id = $1',
      [studentId]
    );

    const quizAvg = await db.query(
      'SELECT COALESCE(AVG(score), 0) as avg_score, COUNT(*) as total FROM quiz_results WHERE student_id = $1',
      [studentId]
    );

    const codingAvg = await db.query(
      'SELECT COALESCE(AVG(score), 0) as avg_score, COUNT(*) as total FROM coding_submissions WHERE student_id = $1',
      [studentId]
    );

    const prediction = await db.query(
      'SELECT * FROM predictions WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
      [studentId]
    );

    const profileResult = await db.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [studentId]
    );

    const mlPredictionResult = await db.query(
      'SELECT * FROM ml_predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [studentId]
    );

    const recentQuizzes = await db.query(
      `SELECT qr.score, q.title, s.subject_name, qr.submitted_at
       FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       LEFT JOIN subjects s ON s.id = q.subject_id
       WHERE qr.student_id = $1 ORDER BY qr.submitted_at DESC LIMIT 5`,
      [studentId]
    );

    // Question Bank Counts
    const qbCount = await db.query('SELECT COUNT(*) as count FROM question_bank');
    const impCount = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = 'Important Question'");
    const pyqCount = await db.query("SELECT COUNT(*) as count FROM question_bank WHERE question_type = 'Previous Year Question'");
    const bookmarkedCount = await db.query('SELECT COUNT(*) as count FROM bookmarked_questions WHERE user_id = $1', [studentId]);
    const completedCount = await db.query('SELECT COUNT(*) as count FROM completed_questions WHERE user_id = $1', [studentId]);

    res.json({
      totalSubjects: parseInt(subjects.rows[0].count),
      completedLessons: completedTopics.rows[0]?.completed_topics || 0,
      studyHours: parseFloat(completedTopics.rows[0]?.study_hours || 0),
      quizScores: {
        average: Math.round(parseFloat(quizAvg.rows[0].avg_score)),
        total: parseInt(quizAvg.rows[0].total),
      },
      codingScores: {
        average: Math.round(parseFloat(codingAvg.rows[0].avg_score)),
        total: parseInt(codingAvg.rows[0].total),
      },
      predictedPerformance: prediction.rows[0]?.predicted_score || null,
      skillLevel: prediction.rows[0]?.skill_level || 'Not assessed',
      recommendedTopics: prediction.rows[0]?.recommendations || 'Complete quizzes and coding practice to get recommendations.',
      recentQuizzes: recentQuizzes.rows,
      weakSubject: prediction.rows[0]?.weak_subject || null,
      profile: profileResult.rows[0] || null,
      mlPrediction: mlPredictionResult.rows[0] || null,
      qbCount: parseInt(qbCount.rows[0].count),
      impCount: parseInt(impCount.rows[0].count),
      pyqCount: parseInt(pyqCount.rows[0].count),
      bookmarkedCount: parseInt(bookmarkedCount.rows[0].count),
      completedCount: parseInt(completedCount.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const studentId = req.user.role === 'admin' && req.query.student_id
      ? req.query.student_id
      : req.user.id;

    const progress = await db.query(
      'SELECT * FROM student_progress WHERE student_id = $1',
      [studentId]
    );

    const quizResults = await db.query(
      `SELECT qr.*, q.title, s.subject_name FROM quiz_results qr
       JOIN quizzes q ON q.id = qr.quiz_id
       LEFT JOIN subjects s ON s.id = q.subject_id
       WHERE qr.student_id = $1 ORDER BY qr.submitted_at DESC`,
      [studentId]
    );

    const codingResults = await db.query(
      'SELECT id, language, score, submitted_at FROM coding_submissions WHERE student_id = $1 ORDER BY submitted_at DESC',
      [studentId]
    );

    res.json({
      progress: progress.rows[0] || { study_hours: 0, completed_topics: 0 },
      quizResults: quizResults.rows,
      codingResults: codingResults.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { study_hours, completed_topics, learning_time_minutes, subject_completion } = req.body;

    const result = await db.query(
      `INSERT INTO student_progress (student_id, study_hours, completed_topics, learning_time_minutes, subject_completion)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id) DO UPDATE SET
         study_hours = student_progress.study_hours + COALESCE(EXCLUDED.study_hours, 0),
         completed_topics = student_progress.completed_topics + COALESCE(EXCLUDED.completed_topics, 0),
         learning_time_minutes = student_progress.learning_time_minutes + COALESCE(EXCLUDED.learning_time_minutes, 0),
         subject_completion = COALESCE(EXCLUDED.subject_completion, student_progress.subject_completion),
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        studentId,
        study_hours || 0,
        completed_topics || 0,
        learning_time_minutes || 0,
        subject_completion ? JSON.stringify(subject_completion) : '{}',
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/complete-topic', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { topic_id, study_minutes } = req.body;

    const hours = (study_minutes || 15) / 60;
    const minutes = study_minutes || 15;

    // Update aggregate student progress
    await db.query(
      `INSERT INTO student_progress (student_id, completed_topics, study_hours, learning_time_minutes)
       VALUES ($1, 1, $2, $3)
       ON CONFLICT (student_id) DO UPDATE SET
         completed_topics = student_progress.completed_topics + 1,
         study_hours = student_progress.study_hours + EXCLUDED.study_hours,
         learning_time_minutes = student_progress.learning_time_minutes + EXCLUDED.learning_time_minutes,
         updated_at = CURRENT_TIMESTAMP`,
      [studentId, hours, minutes]
    );

    // Insert detailed topic completion record
    await db.query(
      `INSERT INTO completed_topics (student_id, topic_id, study_minutes)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, topic_id) DO NOTHING`,
      [studentId, topic_id, minutes]
    );

    res.json({ message: 'Topic marked as completed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/session/log', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { sessionStartTime, sessionEndTime } = req.body;
    if (!sessionStartTime || !sessionEndTime) {
      return res.status(400).json({ message: 'Missing session timing parameters' });
    }
    const start = new Date(sessionStartTime);
    const end = new Date(sessionEndTime);
    const diffMinutes = Math.max(1, Math.round((end - start) / 60000));
    const hours = diffMinutes / 60;

    await db.query(
      `INSERT INTO study_sessions (student_id, session_start_time, session_end_time)
       VALUES ($1, $2, $3)`,
      [studentId, start, end]
    );

    await db.query(
      `INSERT INTO student_progress (student_id, study_hours, completed_topics)
       VALUES ($1, $2, 0)
       ON CONFLICT (student_id) DO UPDATE SET
         study_hours = student_progress.study_hours + EXCLUDED.study_hours,
         updated_at = CURRENT_TIMESTAMP`,
      [studentId, hours]
    );

    res.json({ message: 'Session logged successfully', durationMinutes: diffMinutes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/analytics', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get user details
    const userResult = await db.query('SELECT name FROM users WHERE id = $1', [studentId]);
    const userName = userResult.rows[0]?.name || 'Student';

    // Get total topics and completed topics
    const totalTopicsRes = await db.query('SELECT COUNT(*) as count FROM topics');
    const totalTopicsCount = parseInt(totalTopicsRes.rows[0].count) || 0;

    const completedTopicsRes = await db.query('SELECT topic_id, completed_at, study_minutes FROM completed_topics WHERE student_id = $1', [studentId]);
    const completedTopicsList = completedTopicsRes.rows;
    const completedTopicsCount = completedTopicsList.length;

    // Get total problems and solved problems
    const totalProblemsRes = await db.query('SELECT COUNT(*) as count FROM coding_problems');
    const totalProblemsCount = parseInt(totalProblemsRes.rows[0].count) || 0;

    // Solved problems (defined as score >= 90)
    const solvedProblemsRes = await db.query(
      `SELECT COUNT(DISTINCT problem_id) as count 
       FROM coding_submissions 
       WHERE student_id = $1 AND score >= 90`, 
      [studentId]
    );
    const solvedProblemsCount = parseInt(solvedProblemsRes.rows[0].count) || 0;

    // Total study hours
    const progressRes = await db.query('SELECT study_hours FROM student_progress WHERE student_id = $1', [studentId]);
    const totalStudyHours = parseFloat(progressRes.rows[0]?.study_hours || 0);

    // Get all subjects and topics to build roadmaps and subject percentages
    const subjectsRes = await db.query('SELECT id, subject_name, description FROM subjects ORDER BY id');
    const subjects = subjectsRes.rows;

    const topicsRes = await db.query('SELECT id, subject_id, title, order_index FROM topics ORDER BY subject_id, order_index');
    const topics = topicsRes.rows;

    // Calculate subject-wise completion
    const subjectProgress = subjects.map(sub => {
      const subTopics = topics.filter(t => t.subject_id === sub.id);
      const subTopicsCount = subTopics.length;
      const subCompletedCount = subTopics.filter(t => completedTopicsList.some(ct => ct.topic_id === t.id)).length;
      return {
        id: sub.id,
        name: sub.subject_name,
        completedTopics: subCompletedCount,
        totalTopics: subTopicsCount,
        percentage: subTopicsCount > 0 ? Math.round((subCompletedCount / subTopicsCount) * 100) : 0
      };
    });

    // Determine current subject, current topic, and next recommended topic
    let currentSubject = 'None';
    let currentTopicName = 'None';
    let nextRecommendedTopicName = 'None';

    if (completedTopicsList.length > 0) {
      // Latest completed topic
      const latestCompleted = completedTopicsList.reduce((latest, current) => {
        return new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest;
      });
      const latestTopicObj = topics.find(t => t.id === latestCompleted.topic_id);
      if (latestTopicObj) {
        const sub = subjects.find(s => s.id === latestTopicObj.subject_id);
        currentSubject = sub ? sub.subject_name : 'None';
        currentTopicName = latestTopicObj.title;

        // Next recommended topic in the same subject or next subject
        const subTopicsSorted = topics.filter(t => t.subject_id === latestTopicObj.subject_id).sort((a,b) => a.order_index - b.order_index);
        const nextInSub = subTopicsSorted.find(t => t.order_index > latestTopicObj.order_index && !completedTopicsList.some(ct => ct.topic_id === t.id));
        if (nextInSub) {
          nextRecommendedTopicName = `${currentSubject} - ${nextInSub.title}`;
        } else {
          // Find first uncompleted topic in any subject
          const firstUncompleted = topics.find(t => !completedTopicsList.some(ct => ct.topic_id === t.id));
          if (firstUncompleted) {
            const nextSub = subjects.find(s => s.id === firstUncompleted.subject_id);
            nextRecommendedTopicName = nextSub ? `${nextSub.subject_name} - ${firstUncompleted.title}` : firstUncompleted.title;
          } else {
            nextRecommendedTopicName = 'All Completed! Keep Practicing.';
          }
        }
      }
    } else {
      // Fallback if no completed topics
      if (topics.length > 0) {
        const firstTopic = topics[0];
        const firstSub = subjects.find(s => s.id === firstTopic.subject_id);
        currentSubject = firstSub ? firstSub.subject_name : 'None';
        currentTopicName = 'Not Started';
        nextRecommendedTopicName = firstSub ? `${firstSub.subject_name} - ${firstTopic.title}` : firstTopic.title;
      }
    }

    // Build Roadmap of topics
    const roadmap = topics.map((t, idx) => {
      const isCompleted = completedTopicsList.some(ct => ct.topic_id === t.id);
      const sub = subjects.find(s => s.id === t.subject_id);
      // Let's mark the first uncompleted topic as 'In Progress'
      let status = 'Not Started';
      if (isCompleted) {
        status = 'Completed';
      } else {
        const isFirstUncompleted = !topics.slice(0, idx).some(prevTopic => !completedTopicsList.some(ct => ct.topic_id === prevTopic.id));
        if (isFirstUncompleted) {
          status = 'In Progress';
        }
      }
      return {
        id: t.id,
        title: t.title,
        subject: sub ? sub.subject_name : 'Unknown',
        status
      };
    });

    // Quiz analytics
    const quizResultRes = await db.query(
      `SELECT score, total_questions FROM quiz_results WHERE student_id = $1`, [studentId]
    );
    const quizAttempts = quizResultRes.rows.length;
    let quizAvgScore = 0;
    let quizMaxScore = 0;
    let quizMinScore = 0;
    if (quizAttempts > 0) {
      const scores = quizResultRes.rows.map(r => r.score);
      quizAvgScore = Math.round(scores.reduce((a,b) => a+b, 0) / quizAttempts);
      quizMaxScore = Math.max(...scores);
      quizMinScore = Math.min(...scores);
    }

    // Coding submissions details
    const codingSubmissionsRes = await db.query(
      `SELECT cs.score, cp.difficulty 
       FROM coding_submissions cs
       JOIN coding_problems cp ON cs.problem_id = cp.id
       WHERE cs.student_id = $1`,
      [studentId]
    );
    const codingSubmissions = codingSubmissionsRes.rows;
    const codingTotal = codingSubmissions.length;
    const codingSuccess = codingSubmissions.filter(s => s.score >= 90).length;
    const codingSuccessRate = codingTotal > 0 ? Math.round((codingSuccess / codingTotal) * 100) : 0;

    const easySolved = codingSubmissions.filter(s => s.difficulty === 'easy' && s.score >= 90).length;
    const mediumSolved = codingSubmissions.filter(s => s.difficulty === 'medium' && s.score >= 90).length;
    const hardSolved = codingSubmissions.filter(s => s.difficulty === 'hard' && s.score >= 90).length;

    // Study sessions and weekly chart
    const sessionsRes = await db.query(
      `SELECT session_start_time, session_end_time 
       FROM study_sessions 
       WHERE student_id = $1 
       ORDER BY session_start_time ASC`,
      [studentId]
    );
    const studySessions = sessionsRes.rows;

    // Map study sessions by day of week for the last 7 days
    const weeklyStudyTime = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat or past 7 days
    const daysLabel = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      daysLabel.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      
      const startOfDay = new Date(d);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23,59,59,999);

      // Find sessions on this day
      let dayMinutes = 0;
      studySessions.forEach(s => {
        const sStart = new Date(s.session_start_time);
        const sEnd = new Date(s.session_end_time);
        if (sStart >= startOfDay && sStart <= endOfDay) {
          dayMinutes += Math.max(0, (sEnd - sStart) / 60000);
        }
      });
      weeklyStudyTime[6 - i] = Math.round((dayMinutes / 60) * 10) / 10; // in hours
    }

    // Determine Weak / Strong areas
    let weakArea = 'Quizzes';
    let strengthArea = 'Coding';
    if (quizAvgScore > codingSuccessRate) {
      strengthArea = 'Quizzes';
      weakArea = 'Coding Practice';
    }
    if (quizAttempts === 0 && codingTotal === 0) {
      weakArea = 'None yet';
      strengthArea = 'None yet';
    }

    // Generate AI learning report summary text based on actual numbers
    let aiSummary = '';
    if (completedTopicsCount === 0) {
      aiSummary = `Welcome to EduVerse AI, ${userName}! You haven't completed any topics yet. Start by exploring your first subject: ${currentSubject} and completing a quiz to generate your first AI learning report.`;
    } else {
      aiSummary = `Good job, ${userName}! You have completed ${completedTopicsCount} topics across your curriculum, focusing on ${currentSubject} recently. Your quiz performance is solid with an average score of ${quizAvgScore}%, but you can improve your coding practice success rate (currently at ${codingSuccessRate}%). We recommend diving into "${nextRecommendedTopicName}" next to stay on track.`;
    }

    res.json({
      userName,
      currentSubject,
      currentTopicName,
      completedTopicsCount,
      totalTopicsCount,
      solvedProblemsCount,
      totalProblemsCount,
      totalStudyHours,
      nextRecommendedTopicName,
      aiSummary,
      subjectProgress,
      roadmap,
      quizStats: {
        attempts: quizAttempts,
        averageScore: quizAvgScore,
        maxScore: quizMaxScore,
        minScore: quizMinScore
      },
      codingStats: {
        total: codingTotal,
        solved: solvedProblemsCount,
        successRate: codingSuccessRate,
        easySolved,
        mediumSolved,
        hardSolved
      },
      studyTimeStats: {
        labels: daysLabel,
        data: weeklyStudyTime
      },
      strengths: strengthArea,
      weaknesses: weakArea
    });

  } catch (err) {
    console.error('Error generating analytics:', err);
    res.status(500).json({ message: 'Server error generating analytics' });
  }
});

module.exports = router;

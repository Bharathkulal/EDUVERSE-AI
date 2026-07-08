const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:BHARATH74@localhost:5432/eduverse',
});
async function test() {
  const studentId = 2;
  console.log('Testing queries for studentId:', studentId);

  try {
    console.log('\n--- Testing Dashboard query ---');
    
    // getOrCreateProgress
    const check = await pool.query(
      'SELECT * FROM advanced_java_progress WHERE student_id = $1',
      [studentId]
    );
    console.log('Progress check count:', check.rows.length);
    let progress;
    if (check.rows.length > 0) {
      progress = check.rows[0];
    } else {
      console.log('Inserting progress...');
      const result = await pool.query(`
        INSERT INTO advanced_java_progress 
          (student_id, completed_topics, study_hours, current_level, learning_streak, topics_completed, projects_completed, quiz_accuracy, practice_score, certificate_status)
        VALUES 
          ($1, 2, 4.5, 3, 5, 2, 0, 85.0, 90.0, 'Locked')
        RETURNING *
      `, [studentId]);
      progress = result.rows[0];
    }
    console.log('Progress:', progress);

    // Fetch AI Recommendations
    let aiRec = await pool.query(
      'SELECT * FROM advanced_java_ai_recommendations WHERE student_id = $1',
      [studentId]
    );
    console.log('AI Rec check count:', aiRec.rows.length);
    if (aiRec.rows.length === 0) {
      console.log('Inserting AI recommendations...');
      await pool.query(`
        INSERT INTO advanced_java_ai_recommendations 
          (student_id, recommendations, strength_areas, weak_areas, suggestions, next_best_action)
        VALUES 
          ($1, 'Focus on Hibernate mapping optimization and transaction parameters.', 'JDBC connection configurations, HTTP response models', 'ORM, JSP custom attributes, Spring MVC request scopes', 'Take the Spring Boot DI sandbox test.', 'Complete JDBC Transaction Commit lesson')
      `, [studentId]);
      aiRec = await pool.query(
        'SELECT * FROM advanced_java_ai_recommendations WHERE student_id = $1',
        [studentId]
      );
    }
    console.log('AI Recs:', aiRec.rows[0]);

    // Fetch achievements
    const achievements = await pool.query(
      'SELECT * FROM advanced_java_achievements WHERE student_id = $1',
      [studentId]
    );
    console.log('Achievements count:', achievements.rows.length);

    // Fetch analytics heatmap
    const analyticsRes = await pool.query(
      'SELECT * FROM advanced_java_analytics WHERE student_id = $1 ORDER BY date ASC',
      [studentId]
    );
    console.log('Analytics count:', analyticsRes.rows.length);
    let analytics = analyticsRes.rows;
    if (analytics.length === 0) {
      console.log('Inserting analytics...');
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const randomTime = Math.floor(Math.random() * 60) + 15;
        await pool.query(`
          INSERT INTO advanced_java_analytics 
            (student_id, date, learning_time, progress_val, topic_mastery, quiz_perf, coding_perf, project_perf)
          VALUES 
            ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (student_id, date) DO NOTHING
        `, [studentId, dateStr, randomTime, (7 - i) * 12, 70 + (7 - i) * 3, 75 + i, 80 + i, 60 + i * 5]);
      }
      const newAnalytics = await pool.query(
        'SELECT * FROM advanced_java_analytics WHERE student_id = $1 ORDER BY date ASC',
        [studentId]
      );
      analytics = newAnalytics.rows;
    }
    console.log('Analytics:', analytics.length);

    // Recommended topics
    const nextTopic = await pool.query(`
      SELECT t.id, t.title, m.title as module_title
      FROM advanced_java_topics t
      JOIN advanced_java_modules m ON m.id = t.module_id
      ORDER BY m.order_index ASC, t.order_index ASC
      LIMIT 1
    `);
    console.log('NextTopic:', nextTopic.rows[0]);

  } catch (err) {
    console.error('Dashboard query failed:', err);
  }

  try {
    console.log('\n--- Testing Modules query ---');
    const modules = await pool.query(`
      SELECT m.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'title', t.title,
              'content', t.content,
              'order_index', t.order_index
            ) ORDER BY t.order_index ASC
          ) FILTER (WHERE t.id IS NOT NULL), '[]'::json
        ) as topics
      FROM advanced_java_modules m
      LEFT JOIN advanced_java_topics t ON t.module_id = m.id
      GROUP BY m.id
      ORDER BY m.order_index ASC
    `);
    console.log('Modules count:', modules.rows.length);
  } catch (err) {
    console.error('Modules query failed:', err);
  }

  try {
    console.log('\n--- Testing Projects query ---');
    const projects = await pool.query(`
      SELECT p.*, s.status, s.code_quality, s.progress
      FROM advanced_java_projects p
      LEFT JOIN advanced_java_submissions s ON s.project_id = p.id AND s.student_id = $1
    `, [studentId]);
    console.log('Projects count:', projects.rows.length);
  } catch (err) {
    console.error('Projects query failed:', err);
  }

  try {
    console.log('\n--- Testing Practice query ---');
    const practice = await pool.query('SELECT * FROM advanced_java_practice');
    console.log('Practice count:', practice.rows.length);
  } catch (err) {
    console.error('Practice query failed:', err);
  }

  await pool.end();
}
test();

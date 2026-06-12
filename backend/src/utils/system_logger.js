const db = require('../config/db');

/**
 * Logs a user activity event in the system and monitors API quotas.
 */
const logActivity = async (userId, action, module, value = '', apiUsed = false, metadata = {}) => {
  try {
    // 1. Insert activity log
    await db.query(
      `INSERT INTO user_activity_logs (user_id, action, module, value, api_used, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId || null, action, module, value, apiUsed, JSON.stringify(metadata)]
    );

    // 2. If API was used, increment student's daily usage count
    if (apiUsed && userId) {
      await db.query(
        `UPDATE users 
         SET api_used_today = api_used_today + 1 
         WHERE id = $1`,
        [userId]
      );

      // 3. Quota check & alert triggers
      const userRes = await db.query(
        `SELECT name, api_limit, api_used_today FROM users WHERE id = $1`,
        [userId]
      );
      
      if (userRes.rows.length > 0) {
        const { name, api_limit, api_used_today } = userRes.rows[0];
        
        // Trigger alerts at threshold milestones
        if (api_used_today === Math.floor(api_limit * 0.8)) {
          await db.query(
            `INSERT INTO system_alerts (priority, title, message)
             VALUES ('Medium', 'Quota threshold warning', 'User ${name} has consumed 80% of their daily API allocation (${api_used_today}/${api_limit}).')`
          );
        } else if (api_used_today === Math.floor(api_limit * 0.95)) {
          await db.query(
            `INSERT INTO system_alerts (priority, title, message)
             VALUES ('High', 'Quota threshold critical', 'User ${name} has consumed 95% of their daily API allocation (${api_used_today}/${api_limit}).')`
          );
        } else if (api_used_today >= api_limit) {
          await db.query(
            `INSERT INTO system_alerts (priority, title, message)
             VALUES ('Critical', 'Quota exceeded alert', 'User ${name} has fully exhausted their daily API allocation (${api_used_today}/${api_limit}).')`
          );
        }
      }
    }
  } catch (err) {
    console.error('Error writing system activity log:', err);
  }
};

module.exports = {
  logActivity
};

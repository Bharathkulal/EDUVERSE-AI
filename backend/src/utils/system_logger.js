const db = require('../config/db');

let ioInstance = null;

const setIoInstance = (io) => {
  ioInstance = io;
};

/**
 * Logs a user activity event in the system and monitors API quotas.
 */
const logActivity = async (userId, action, module, value = '', apiUsed = false, metadata = {}) => {
  try {
    const timestamp = new Date();
    // 1. Insert activity log
    await db.query(
      `INSERT INTO user_activity_logs (user_id, action, module, value, api_used, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId || null, action, module, value, apiUsed, JSON.stringify(metadata)]
    );

    // Emit real-time log event via Socket.IO
    if (ioInstance) {
      ioInstance.emit('new_log', {
        user_id: userId,
        action,
        module,
        value,
        api_used: apiUsed,
        created_at: timestamp
      });
    }

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
        let alertPriority = '';
        let alertTitle = '';
        let alertMessage = '';

        if (api_used_today === Math.floor(api_limit * 0.8)) {
          alertPriority = 'Medium';
          alertTitle = 'Quota threshold warning';
          alertMessage = `User ${name} has consumed 80% of their daily API allocation (${api_used_today}/${api_limit}).`;
        } else if (api_used_today === Math.floor(api_limit * 0.95)) {
          alertPriority = 'High';
          alertTitle = 'Quota threshold critical';
          alertMessage = `User ${name} has consumed 95% of their daily API allocation (${api_used_today}/${api_limit}).`;
        } else if (api_used_today >= api_limit) {
          alertPriority = 'Critical';
          alertTitle = 'Quota exceeded alert';
          alertMessage = `User ${name} has fully exhausted their daily API allocation (${api_used_today}/${api_limit}).`;
        }

        if (alertPriority) {
          await db.query(
            `INSERT INTO system_alerts (priority, title, message)
             VALUES ($1, $2, $3)`,
            [alertPriority, alertTitle, alertMessage]
          );

          if (ioInstance) {
            ioInstance.emit('new_alert', {
              priority: alertPriority,
              title: alertTitle,
              message: alertMessage,
              created_at: timestamp
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Error writing system activity log:', err);
  }
};

module.exports = {
  logActivity,
  setIoInstance
};

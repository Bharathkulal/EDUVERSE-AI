const db = require('../../config/db');

class FridayMemoryService {
  /**
   * Fetch context for personalizing Friday's brain response
   * @param {number} userId - Logged in student ID
   */
  async getMemoryContext(userId) {
    try {
      const profileRes = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
      const progressRes = await db.query('SELECT * FROM student_progress WHERE student_id = $1', [userId]);
      const chatRes = await db.query(
        'SELECT message, response FROM ai_chats WHERE student_id = $1 ORDER BY created_at DESC LIMIT 3',
        [userId]
      );

      const profile = profileRes.rows[0] || {};
      const progress = progressRes.rows[0] || {};
      const recentChats = chatRes.rows || [];

      return {
        course: profile.course || 'BCA',
        semester: profile.semester || 1,
        careerGoal: profile.career_goal || 'Software Engineer',
        skills: profile.skills || 'None listed',
        completedTopics: progress.completed_topics || 0,
        studyHours: progress.study_hours || 0,
        chatHistory: recentChats.map(c => `User: ${c.message} | Friday: ${c.response}`).join('\n')
      };
    } catch (err) {
      console.warn('[FridayMemoryService] Database query failed, returning standard memory format:', err.message);
      return {
        course: 'BCA',
        semester: 1,
        careerGoal: 'Software Engineer',
        skills: 'None listed',
        completedTopics: 0,
        studyHours: 0,
        chatHistory: ''
      };
    }
  }

  /**
   * Save a voice command execution trace to student history log
   */
  async logCommand(userId, command, success, details = {}) {
    try {
      await db.query(
        `INSERT INTO ai_chats (student_id, message, response) 
         VALUES ($1, $2, $3)`,
        [userId, `[Voice Command] ${command}`, `Success: ${success}. Details: ${JSON.stringify(details)}`]
      );
    } catch (err) {
      console.warn('[FridayMemoryService] Failed to log command execution:', err.message);
    }
  }
}

module.exports = new FridayMemoryService();

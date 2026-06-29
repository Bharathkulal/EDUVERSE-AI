const db = require('../config/db');

/**
 * Automatically detects and completes AI-generated goals based on student activity.
 * Ensures students cannot cheat by manually checking them off.
 * 
 * @param {number} studentId - The ID of the student.
 * @param {'quiz'|'coding'|'practice'} type - The type of activity completed.
 * @param {object} metadata - Extra details (e.g. score for quiz, duration for coding).
 */
const checkAndCompleteAiGoal = async (studentId, type, metadata = {}) => {
  try {
    let queryLike = '';
    if (type === 'quiz') {
      // Only complete if score is 80% or higher
      if (metadata.score < 80) return;
      queryLike = '%quiz%';
    } else if (type === 'coding') {
      queryLike = '%playground%code%';
    } else if (type === 'practice') {
      queryLike = '%practice%';
    }

    if (!queryLike) return;

    // Check if there is an active (uncompleted) AI goal matching the type
    const activeGoals = await db.query(
      `SELECT * FROM student_goals 
       WHERE student_id = $1 AND completed = false AND is_ai = true AND LOWER(title) LIKE $2
       LIMIT 1`,
      [studentId, queryLike]
    );

    if (activeGoals.rows.length > 0) {
      const goal = activeGoals.rows[0];

      // Update goal to completed
      await db.query(
        'UPDATE student_goals SET completed = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [goal.id]
      );

      // Award XP
      await db.query(
        'INSERT INTO user_xp_history (user_id, xp_amount, action) VALUES ($1, $2, $3)',
        [studentId, goal.xp_reward, `AI Automated: ${goal.title}`]
      );

      console.log(`[AI Goal Tracker] Completed goal "${goal.title}" for student ID ${studentId} (+${goal.xp_reward} XP)`);
    }
  } catch (err) {
    console.error('[AI Goal Tracker] Error:', err);
  }
};

module.exports = { checkAndCompleteAiGoal };

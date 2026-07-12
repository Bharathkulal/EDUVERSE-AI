require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const subjects = [
  { name: 'FOC', desc: 'Fundamentals of Computing - Introduction to computer science concepts' },
  { name: 'Java', desc: 'Core Java programming - OOP, collections, and fundamentals' },
  { name: 'Advanced Java', desc: 'JSP, Servlets, JDBC, and enterprise Java development' },
  { name: 'DSA', desc: 'Data Structures and Algorithms for problem solving' },
  { name: 'C#', desc: 'C# programming with .NET framework fundamentals' },
  { name: 'DBMS', desc: 'Database Management Systems - SQL, normalization, and design' },
  { name: 'Python', desc: 'Python programming for beginners to advanced' },
  { name: 'Web Development', desc: 'HTML, CSS, JavaScript, React and full-stack development' },
  { name: 'Machine Learning', desc: 'Introduction to Machine Learning - Regression, classification, neural networks, and model evaluation' },
];

const sampleTopics = [
  { title: 'Introduction', content: 'Overview of the subject and learning objectives.' },
  { title: 'Core Concepts', content: 'Fundamental concepts and theory.' },
  { title: 'Practical Applications', content: 'Hands-on examples and use cases.' },
];

const codingProblems = [
  { title: 'Hello World', lang: 'java', desc: 'Write a Java program to print "Hello, EduVerse!"' },
  { title: 'Sum of Array', lang: 'python', desc: 'Write a Python function to return the sum of an array.' },
  { title: 'Factorial', lang: 'c', desc: 'Write a C program to calculate factorial of a number.' },
  { title: 'Prime Check', lang: 'csharp', desc: 'Write a C# method to check if a number is prime.' },
  { title: 'Reverse String', lang: 'java', desc: 'Write a Java method to reverse a string.' },
  { title: 'Fibonacci', lang: 'python', desc: 'Generate Fibonacci series up to n terms in Python.' },
];

async function seed() {
  console.log('Seeding EduVerse AI database...');

  const adminPass = await bcrypt.hash('admin123', 12);
  const studentPass = await bcrypt.hash('student123', 12);

  // --- Users (idempotent via ON CONFLICT) ---
  await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('Admin User', 'admin@eduverse.ai', $1::text, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [adminPass]
  );
  await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ('John Student', 'student@eduverse.ai', $1::text, 'student')
     ON CONFLICT (email) DO NOTHING`,
    [studentPass]
  );

  // --- Student progress ---
  const student = await db.query(
    "SELECT id FROM users WHERE email = 'student@eduverse.ai'"
  );
  if (student.rows[0]) {
    await db.query(
      `INSERT INTO student_progress (student_id, study_hours, completed_topics)
       VALUES ($1::int, 5, 2)
       ON CONFLICT (student_id) DO NOTHING`,
      [student.rows[0].id]
    );
  }

  // --- Subjects, Units, Topics, Quizzes, Questions ---
  for (const sub of subjects) {
    // Insert subject or skip if it already exists
    await db.query(
      `INSERT INTO subjects (subject_name, description)
       VALUES ($1::text, $2::text)
       ON CONFLICT DO NOTHING`,
      [sub.name, sub.desc]
    );

    // Always fetch the subject id (handles both fresh insert and existing row)
    const subRow = await db.query(
      'SELECT id FROM subjects WHERE subject_name = $1::text',
      [sub.name]
    );
    const subjectId = subRow.rows[0]?.id;
    if (!subjectId) continue;

    // --- Unit (idempotent: check before inserting) ---
    let unitId;
    const existingUnit = await db.query(
      `SELECT id FROM units WHERE subject_id = $1::int AND title = $2::text`,
      [subjectId, 'Unit 1 - Fundamentals']
    );
    if (existingUnit.rows[0]) {
      unitId = existingUnit.rows[0].id;
    } else {
      const unitResult = await db.query(
        `INSERT INTO units (subject_id, title, order_index)
         VALUES ($1::int, $2::text, 0)
         RETURNING id`,
        [subjectId, 'Unit 1 - Fundamentals']
      );
      unitId = unitResult.rows[0].id;
    }

    // --- Topics (idempotent: unique on subject_id + title) ---
    for (let i = 0; i < sampleTopics.length; i++) {
      const existingTopic = await db.query(
        `SELECT id FROM topics WHERE subject_id = $1::int AND title = $2::text`,
        [subjectId, sampleTopics[i].title]
      );
      if (!existingTopic.rows[0]) {
        await db.query(
          `INSERT INTO topics (subject_id, unit_id, title, content, notes, order_index)
           VALUES ($1::int, $2::int, $3::text, $4::text, $5::text, $6::int)`,
          [subjectId, unitId, sampleTopics[i].title, sampleTopics[i].content, `Study notes for ${sampleTopics[i].title}`, i]
        );
      }
    }

    // --- Quiz (idempotent: check before inserting) ---
    const quizTitle = `${sub.name} - Basics Quiz`;
    let quizId;
    const existingQuiz = await db.query(
      `SELECT id FROM quizzes WHERE subject_id = $1::int AND title = $2::text`,
      [subjectId, quizTitle]
    );
    if (existingQuiz.rows[0]) {
      quizId = existingQuiz.rows[0].id;
    } else {
      const quizResult = await db.query(
        `INSERT INTO quizzes (subject_id, title)
         VALUES ($1::int, $2::text)
         RETURNING id`,
        [subjectId, quizTitle]
      );
      quizId = quizResult.rows[0].id;
    }

    // --- Questions (idempotent: check before inserting) ---
    const questions = [
      { q: `What is the primary focus of ${sub.name}?`, a: 'Theory only', b: 'Practice only', c: 'Theory and Practice', d: 'None', ans: 'c' },
      { q: `Which skill improves with ${sub.name}?`, a: 'Problem solving', b: 'Memorization only', c: 'None', d: 'Only writing', ans: 'a' },
      { q: 'Best way to learn this subject?', a: 'Skip practice', b: 'Regular practice', c: 'Avoid quizzes', d: 'No notes', ans: 'b' },
    ];
    for (const qu of questions) {
      const existingQ = await db.query(
        `SELECT id FROM questions WHERE quiz_id = $1::int AND question = $2::text`,
        [quizId, qu.q]
      );
      if (!existingQ.rows[0]) {
        await db.query(
          `INSERT INTO questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)
           VALUES ($1::int, $2::text, $3::text, $4::text, $5::text, $6::text, $7::text)`,
          [quizId, qu.q, qu.a, qu.b, qu.c, qu.d, qu.ans]
        );
      }
    }
  }

  // --- Coding Problems (idempotent: check before inserting) ---
  for (const prob of codingProblems) {
    const existingProb = await db.query(
      `SELECT id FROM coding_problems WHERE title = $1::text`,
      [prob.title]
    );
    if (!existingProb.rows[0]) {
      await db.query(
        `INSERT INTO coding_problems (title, description, language, difficulty)
         VALUES ($1::text, $2::text, $3::text, 'easy'::text)`,
        [prob.title, prob.desc, prob.lang]
      );
    }
  }

  // --- Seed Student Progress Activities ---
  if (student.rows[0]) {
    const studentId = student.rows[0].id;

    // Check if progress exists
    const hasProgress = await db.query('SELECT 1 FROM student_progress WHERE student_id = $1', [studentId]);
    if (hasProgress.rows.length === 0) {
      await db.query(
        `INSERT INTO student_progress (student_id, study_hours, completed_topics)
         VALUES ($1::int, 15, 8)`,
        [studentId]
      );
    } else {
      // Let's update it to ensure it reflects our seeded counts
      await db.query(
        `UPDATE student_progress SET study_hours = 15, completed_topics = 8 WHERE student_id = $1`,
        [studentId]
      );
    }

    // Seed completed_topics
    const allTopics = await db.query('SELECT t.id, t.title, s.subject_name FROM topics t JOIN subjects s ON t.subject_id = s.id');
    const existingCompleted = await db.query('SELECT 1 FROM completed_topics WHERE student_id = $1', [studentId]);
    if (existingCompleted.rows.length === 0 && allTopics.rows.length > 0) {
      const completedList = [
        { subject: 'FOC', title: 'Introduction', minutes: 20, daysAgo: 6 },
        { subject: 'FOC', title: 'Core Concepts', minutes: 35, daysAgo: 6 },
        { subject: 'Java', title: 'Introduction', minutes: 30, daysAgo: 5 },
        { subject: 'Java', title: 'Core Concepts', minutes: 45, daysAgo: 4 },
        { subject: 'Java', title: 'Practical Applications', minutes: 60, daysAgo: 3 },
        { subject: 'DSA', title: 'Introduction', minutes: 40, daysAgo: 2 },
        { subject: 'Web Development', title: 'Introduction', minutes: 25, daysAgo: 1 },
        { subject: 'Web Development', title: 'Core Concepts', minutes: 50, daysAgo: 0 }
      ];

      for (const item of completedList) {
        const targetTopic = allTopics.rows.find(t => t.subject_name === item.subject && t.title === item.title);
        if (targetTopic) {
          const completedDate = new Date();
          completedDate.setDate(completedDate.getDate() - item.daysAgo);
          await db.query(
            `INSERT INTO completed_topics (student_id, topic_id, completed_at, study_minutes)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (student_id, topic_id) DO NOTHING`,
            [studentId, targetTopic.id, completedDate, item.minutes]
          );
        }
      }
    }

    // Seed study_sessions
    const existingSessions = await db.query('SELECT 1 FROM study_sessions WHERE student_id = $1', [studentId]);
    if (existingSessions.rows.length === 0) {
      const sessions = [
        { daysAgo: 6, startHour: 9, durationMins: 45 },
        { daysAgo: 6, startHour: 15, durationMins: 30 },
        { daysAgo: 5, startHour: 10, durationMins: 60 },
        { daysAgo: 4, startHour: 11, durationMins: 40 },
        { daysAgo: 3, startHour: 14, durationMins: 90 },
        { daysAgo: 2, startHour: 16, durationMins: 30 },
        { daysAgo: 2, startHour: 19, durationMins: 30 },
        { daysAgo: 1, startHour: 10, durationMins: 75 },
        { daysAgo: 0, startHour: 11, durationMins: 50 }
      ];

      for (const s of sessions) {
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - s.daysAgo);
        startTime.setHours(s.startHour, 0, 0, 0);

        const endTime = new Date(startTime.getTime() + s.durationMins * 60000);

        await db.query(
          `INSERT INTO study_sessions (student_id, session_start_time, session_end_time, created_at)
           VALUES ($1, $2, $3, $4)`,
          [studentId, startTime, endTime, startTime]
        );
      }
    }

    // Check if quiz result exists
    const hasQuizResult = await db.query('SELECT 1 FROM quiz_results WHERE student_id = $1', [studentId]);
    if (hasQuizResult.rows.length === 0) {
      const quiz = await db.query('SELECT id FROM quizzes LIMIT 1');
      if (quiz.rows[0]) {
        await db.query(
          `INSERT INTO quiz_results (student_id, quiz_id, score, total_questions)
           VALUES ($1::int, $2::int, 80, 100)`,
          [studentId, quiz.rows[0].id]
        );
      }
    }

    // Check if coding submission exists
    const hasCodingResult = await db.query('SELECT 1 FROM coding_submissions WHERE student_id = $1', [studentId]);
    if (hasCodingResult.rows.length === 0) {
      const problem = await db.query('SELECT id FROM coding_problems LIMIT 1');
      if (problem.rows[0]) {
        await db.query(
          `INSERT INTO coding_submissions (student_id, problem_id, language, code, score)
           VALUES ($1::int, $2::int, 'python', 'def hello(): pass', 90)`,
          [studentId, problem.rows[0].id]
        );
      }
    }

    // Seed user_xp_history (totaling 3104 XP)
    const hasXpHistory = await db.query('SELECT 1 FROM user_xp_history WHERE user_id = $1', [studentId]);
    if (hasXpHistory.rows.length === 0) {
      const xpMilestones = [
        { xp: 1000, action: 'Initialized profile & onboarding', daysAgo: 28 },
        { xp: 500, action: 'Completed Unit 1 Roadmap', daysAgo: 25 },
        { xp: 400, action: 'Passed Stack implementation challenge', daysAgo: 21 },
        { xp: 300, action: 'Solved Two Sum Problem', daysAgo: 18 },
        { xp: 300, action: 'Solved Binary Search Mastery', daysAgo: 14 },
        { xp: 200, action: 'Completed Java Array operations quiz', daysAgo: 10 },
        { xp: 200, action: 'Completed FOC basics quiz', daysAgo: 7 },
        { xp: 100, action: 'Created first revision note', daysAgo: 3 },
        { xp: 104, action: 'Weekly login streak bonus', daysAgo: 1 }
      ];
      for (const item of xpMilestones) {
        const d = new Date();
        d.setDate(d.getDate() - item.daysAgo);
        await db.query(
          'INSERT INTO user_xp_history (user_id, xp_amount, action, created_at) VALUES ($1, $2, $3, $4)',
          [studentId, item.xp, item.action, d.toISOString()]
        );
      }
    }

    // Seed user_streaks (streak count 7)
    const hasStreak = await db.query('SELECT 1 FROM user_streaks WHERE user_id = $1', [studentId]);
    if (hasStreak.rows.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      await db.query(
        'INSERT INTO user_streaks (user_id, streak_count, last_activity_date) VALUES ($1, 7, $2)',
        [studentId, todayStr]
      );
    }

    // Seed notes
    const hasNotes = await db.query('SELECT 1 FROM notes WHERE user_id = $1', [studentId]);
    if (hasNotes.rows.length === 0) {
      const sampleNotes = [
        { title: 'Complexity of Binary Search', content: 'Binary Search has O(log n) average and worst-case time complexity.\nIt requires the array to be sorted beforehand.\n- Best Case: O(1)\n- Average Case: O(log n)\n- Space Complexity: O(1) iterative, O(log n) recursive.', pinned: true, favorite: true },
        { title: 'Linear Regression Basics', content: 'Linear Regression is a supervised learning algorithm.\nEquation: y = mx + c\nUsed to predict numerical continuous values.', pinned: false, favorite: true }
      ];
      for (const note of sampleNotes) {
        await db.query(
          'INSERT INTO notes (user_id, title, content, pinned, favorite) VALUES ($1, $2, $3, $4, $5)',
          [studentId, note.title, note.content, note.pinned, note.favorite]
        );
      }
    }
  }

  console.log('Seed completed!');
  console.log('Admin: admin@eduverse.ai / admin123');
  console.log('Student: student@eduverse.ai / student123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const aiGateway = require('../services/aiGateway');

const router = express.Router();

// Memory storage for PDFs uploaded by users
const pdfContexts = {};

// Configure Multer for PDF upload in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported.'));
    }
  }
});

// F.R.I.D.A.Y. Chat Endpoint
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, category, subject } = req.body;
    const studentId = req.user.id;

    let responseText = '';
    
    // Construct System Instruction based on category
    let systemInstruction = `You are F.R.I.D.A.Y., a highly advanced, supportive, and futuristic AI assistant inspired by Tony Stark's assistant in Iron Man, but built specifically for students and education within the EduVerse AI platform.
Keep your personality professional yet friendly, futuristic, and encouraging. Address the user with terms like "Student" or "Sir/Ma'am" when appropriate.
Present your answers using rich formatting, bullet points, and clear code blocks where needed.`;

    if (category === 'tutor') {
      systemInstruction += `\nFocus on explaining educational topics clearly. If the student asks for exam marks (e.g. "for 5 marks" or "for 10 marks"), structure the answer in a professional university exam format:
- Clear definition/introduction
- Key features/points with headers
- Detailed explanations
- Diagrams or examples where applicable.`;
    } else if (category === 'pgcet') {
      systemInstruction += `\nFocus on PGCET (Post Graduate Common Entrance Test) preparations. Generate MCQs, important questions, previous year syllabus analysis, mock tests, and subject revisions. Ensure explanations are precise and exam-focused.`;
    } else if (category === 'question-bank') {
      systemInstruction += `\nFocus on generating university-standard solutions. Structure the answers specifically based on marks requested:
- 2 Marks: Precise 2-3 sentence definition or core formula.
- 5 Marks: Definition, block diagram/list of 5 key points, and brief explanations.
- 10 Marks: Exhaustive explanation, architectural design or detailed steps, examples, and comprehensive comparisons.`;
    } else if (category === 'coding') {
      systemInstruction += `\nFocus on software engineering, algorithms, and coding. Support Java, Python, C, C++, and Data Structures. Detect errors in code, generate clean, commented solutions, and provide interview-oriented explanations.`;
    } else if (category === 'search') {
      systemInstruction += `\nUse real-time web search capabilities to answer placement details, scholarship updates, latest tech news, or educational notifications. Citing sources is highly encouraged.`;
    }

    if (subject) {
      systemInstruction += `\nSubject Context: ${subject}`;
    }

    const finalPrompt = `${systemInstruction}\n\nUser Question: ${message}`;

    let apiCallResult = null;
    try {
      apiCallResult = await aiGateway.generateResponse(finalPrompt, { enableSearch: category === 'search' });
    } catch (apiErr) {
      console.error('All failovers exhausted:', apiErr);
    }

    if (apiCallResult) {
      responseText = apiCallResult.text;
    } else {
      // Demo fallback mode
      responseText = `[F.R.I.D.A.Y. Demo Mode - Please configure GEMINI_API_KEY]

Regarding your request: "${message}"

Here is my simulated response:
1. Core explanation: This topic forms an essential part of the curriculum.
2. Structure & details: To master this, you should focus on the key components.
3. F.R.I.D.A.Y. Tip: Keep practicing! I will be ready to give you live answers once the API key is active.`;
    }

    // Save to AI chat history
    await db.query(
      'INSERT INTO ai_chats (student_id, message, response) VALUES ($1, $2, $3)',
      [studentId, message, responseText]
    );

    // CENTRAL LOGS INTERCEPT
    const { logActivity } = require('../utils/system_logger');
    logActivity(studentId, 'ai_prompt', 'AI Tutor', message, !!apiCallResult, {
      category,
      subject,
      provider: apiCallResult ? apiCallResult.providerUsed : 'demo_fallback'
    }).catch(e => console.error(e));

    res.json({ response: responseText });
  } catch (err) {
    console.error('FRIDAY Chat Error:', err);
    res.status(500).json({ message: 'FRIDAY assistant encountered an error. Please try again.' });
  }
});

// PDF Upload and Parse Endpoint
router.post('/upload-pdf', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded.' });
    }

    const data = await pdfParse(req.file.buffer);
    const textContent = data.text.trim();

    if (!textContent) {
      return res.status(400).json({ message: 'Unable to extract text from the PDF file. It might be empty or scanned.' });
    }

    // Store in memory context for this user
    pdfContexts[req.user.id] = {
      filename: req.file.originalname,
      text: textContent,
      uploadedAt: new Date()
    };

    res.json({
      message: 'PDF uploaded and parsed successfully!',
      filename: req.file.originalname,
      characterCount: textContent.length
    });
  } catch (err) {
    console.error('PDF Parse Error:', err);
    res.status(500).json({ message: 'Failed to process PDF file. Ensure it is a valid, unencrypted PDF.' });
  }
});

// PDF Chat/Summary/Quiz Endpoint
router.post('/pdf-action', authenticate, async (req, res) => {
  try {
    const { action, question } = req.body;
    const context = pdfContexts[req.user.id];

    if (!context) {
      return res.status(400).json({ message: 'No active PDF context. Please upload a PDF first.' });
    }

    let prompt = '';

    if (action === 'summary') {
      prompt = `You are F.R.I.D.A.Y., a highly advanced educational assistant.
Generate a concise, professional summary of the following document. Highlight key topics, formulas, or concepts:
\n\nDocument Title: ${context.filename}
Document Content:
${context.text.slice(0, 15000)}`; // limit context size to prevent token overflow
    } else if (action === 'notes') {
      prompt = `You are F.R.I.D.A.Y., a highly advanced educational assistant.
Generate structured, clean, study-friendly notes from the following document. Use bullet points and subheadings:
\n\nDocument Title: ${context.filename}
Document Content:
${context.text.slice(0, 15000)}`;
    } else if (action === 'quiz') {
      prompt = `You are F.R.I.D.A.Y., a highly advanced educational assistant.
Generate 5 Multiple Choice Questions based on the following document. For each question, provide 4 options and the correct answer. Format nicely with markdown:
\n\nDocument Title: ${context.filename}
Document Content:
${context.text.slice(0, 15000)}`;
    } else if (action === 'question') {
      if (!question) {
        return res.status(400).json({ message: 'Please provide a question to query the PDF.' });
      }
      prompt = `You are F.R.I.D.A.Y., a highly advanced educational assistant.
Answer the student's question based strictly on the content of the uploaded document. If the document doesn't contain the answer, state that it's not present in the document.
\n\nStudent's Question: ${question}
Document Title: ${context.filename}
Document Content:
${context.text.slice(0, 15000)}`;
    } else {
      return res.status(400).json({ message: 'Invalid action requested.' });
    }

    let apiCallResult = null;
    try {
      apiCallResult = await aiGateway.generateResponse(prompt);
    } catch (apiErr) {
      console.error('All failovers exhausted for PDF action:', apiErr);
    }

    if (apiCallResult) {
      responseText = apiCallResult.text;
    } else {
      responseText = `[F.R.I.D.A.Y. PDF Demo Mode] 
This is a simulated ${action} for PDF "${context.filename}". Please configure your GEMINI_API_KEY for live answers.`;
    }

    res.json({ response: responseText });
  } catch (err) {
    console.error('PDF Action Error:', err);
    res.status(500).json({ message: 'Error processing PDF action.' });
  }
});

// AI Mentor personalized recommendations
router.get('/mentor', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Fetch profile and progress details from database
    const profileRes = await db.query('SELECT * FROM profiles WHERE user_id = $1', [studentId]);
    const progressRes = await db.query('SELECT * FROM student_progress WHERE student_id = $1', [studentId]);
    const quizRes = await db.query(
      'SELECT qr.*, q.title as quiz_title FROM quiz_results qr JOIN quizzes q ON qr.quiz_id = q.id WHERE qr.student_id = $1 ORDER BY qr.submitted_at DESC LIMIT 5',
      [studentId]
    );

    const profile = profileRes.rows[0] || {};
    const progress = progressRes.rows[0] || {};
    const recentQuizzes = quizRes.rows || [];

    const studentContext = `
Student Information:
- Course: ${profile.course || 'BCA'}
- Semester: ${profile.semester || 1}
- Skills: ${profile.skills || 'None listed'}
- Favorite Subjects: ${profile.favorite_subjects || 'None listed'}
- Career Goal: ${profile.career_goal || 'Software Professional'}
- Completed Topics: ${progress.completed_topics || 0}
- Study Hours: ${progress.study_hours || 0}
- Recent Quiz Scores: ${recentQuizzes.map(q => `${q.quiz_title}: ${q.score}/${q.total_questions}`).join(', ') || 'No quizzes taken yet'}
    `;

    const systemPrompt = `You are F.R.I.D.A.Y., Tony Stark's futuristic assistant, serving as an AI Mentor for a college student.
Analyze the following student profile and progress. Provide exactly 3 highly personalized, specific, and futuristic recommendations to improve their learning, keep up their streak, and master weak subjects.
Format each recommendation clearly as a bullet point. Make it sound like F.R.I.D.A.Y. (e.g. "Initializing study protocols for...", "Analysis of your recent scores indicates...").`;

    let recommendations = [];
    let apiCallResult = null;
    try {
      apiCallResult = await aiGateway.generateResponse(`${systemPrompt}\n\n${studentContext}`);
    } catch (apiErr) {
      console.error('All failovers exhausted for mentor recommendation:', apiErr);
    }

    if (apiCallResult) {
      recommendations = apiCallResult.text.split('\n').filter(line => line.trim().length > 0);
    } else {
      recommendations = [
        `🤖 System status normal. I recommend dedicating 30 more minutes to coding labs today to boost your learning score.`,
        `📈 Analysis of database modules shows you have pending quizzes. Protocol 'DBMS Mastery' suggests reviewing Chapter 3.`,
        `⚡ Stay focused on your BCA goals! Start a 10-minute mock test to assess your logic skills.`
      ];
    }

    res.json({
      recommendations,
      streak: 5, // Mock learning streak
      dailyGoal: '2.5 Hours',
      reminders: [
        'Complete DBMS practice quiz by tonight',
        'Review Java Multithreading coding lab'
      ]
    });
  } catch (err) {
    console.error('Mentor Error:', err);
    res.status(500).json({ message: 'Failed to retrieve mentor guidance.' });
  }
});

// Stats dashboard data
router.get('/stats', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch quiz scores
    const quizScoresRes = await db.query(
      'SELECT score, total_questions, submitted_at FROM quiz_results WHERE student_id = $1 ORDER BY submitted_at ASC LIMIT 10',
      [studentId]
    );

    const progressRes = await db.query(
      'SELECT completed_topics, study_hours FROM student_progress WHERE student_id = $1',
      [studentId]
    );

    const progress = progressRes.rows[0] || { completed_topics: 0, study_hours: 0 };
    const quizResults = quizScoresRes.rows || [];

    // Calculate a simulated PGCET readiness percentage
    const studyHoursVal = parseFloat(progress.study_hours) || 0;
    const completedVal = parseInt(progress.completed_topics) || 0;
    
    let baseReadiness = 35; // base readiness
    baseReadiness += Math.min(25, completedVal * 3); // completed topics boost
    baseReadiness += Math.min(20, studyHoursVal * 2); // hours boost
    
    if (quizResults.length > 0) {
      const avgQuiz = quizResults.reduce((acc, curr) => acc + (curr.score / curr.total_questions), 0) / quizResults.length;
      baseReadiness += Math.min(20, avgQuiz * 20);
    }

    const readinessPercentage = Math.min(98, Math.round(baseReadiness));

    res.json({
      readinessPercentage,
      learningStreak: 4, // days
      completedTopics: completedVal,
      studyHours: studyHoursVal,
      quizHistory: quizResults.map(q => Math.round((q.score / q.total_questions) * 100))
    });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ message: 'Failed to retrieve stats.' });
  }
});

module.exports = router;

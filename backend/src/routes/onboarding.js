const express = require('express');
const { body } = require('express-validator');
const axios = require('axios');
const db = require('../config/db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Check onboarding status
router.get('/status', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT profile_completed FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ profile_completed: result.rows[0].profile_completed || false });
  } catch (err) {
    console.error('Error checking onboarding status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit onboarding profile
router.post(
  '/submit',
  authenticate,
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('age').isInt({ min: 15, max: 60 }).withMessage('Valid age required'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('course').notEmpty().withMessage('Course is required'),
    body('semester').isInt({ min: 1, max: 12 }).withMessage('Valid semester required'),
    body('graduation_year').isInt({ min: 2020, max: 2035 }).withMessage('Valid graduation year required'),
    body('college_name').trim().notEmpty().withMessage('College name is required'),
    body('sslc_marks').isFloat({ min: 0, max: 100 }).withMessage('Valid SSLC marks required'),
    body('puc_marks').isFloat({ min: 0, max: 100 }).withMessage('Valid PUC marks required'),
    body('learning_level').isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Valid learning level required'),
  ],
  validate,
  async (req, res) => {
    try {
      const {
        full_name, age, gender, phone, address,
        course, semester, graduation_year, college_name,
        sslc_marks, puc_marks, cgpa,
        hobbies, skills, favorite_subjects, career_goal,
        learning_level
      } = req.body;

      // Upsert profile
      await db.query(
        `INSERT INTO profiles (
          user_id, full_name, age, gender, phone, address,
          course, semester, graduation_year, college_name,
          sslc_marks, puc_marks, cgpa,
          hobbies, skills, favorite_subjects, career_goal,
          learning_level
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT (user_id) DO UPDATE SET
          full_name=$2, age=$3, gender=$4, phone=$5, address=$6,
          course=$7, semester=$8, graduation_year=$9, college_name=$10,
          sslc_marks=$11, puc_marks=$12, cgpa=$13,
          hobbies=$14, skills=$15, favorite_subjects=$16, career_goal=$17,
          learning_level=$18`,
        [
          req.user.id, full_name, age, gender, phone, address || '',
          course, semester, graduation_year, college_name,
          sslc_marks, puc_marks, cgpa || null,
          hobbies || '', skills || '', favorite_subjects || '', career_goal || '',
          learning_level
        ]
      );

      // Call ML service for profile analysis
      let mlResult = null;
      try {
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze/profile`, {
          full_name, age, gender, course, semester,
          graduation_year, college_name,
          sslc_marks: parseFloat(sslc_marks),
          puc_marks: parseFloat(puc_marks),
          cgpa: cgpa ? parseFloat(cgpa) : null,
          hobbies, skills, favorite_subjects, career_goal,
          learning_level
        }, { timeout: 10000 });

        mlResult = mlResponse.data;
      } catch (mlErr) {
        console.error('ML service error (non-blocking):', mlErr.message);
        // Generate fallback predictions if ML service is unavailable
        mlResult = generateFallbackPredictions({
          course, sslc_marks, puc_marks, cgpa, skills,
          learning_level, career_goal, favorite_subjects
        });
      }

      // Store ML predictions
      if (mlResult) {
        await db.query(
          `INSERT INTO ml_predictions (
            user_id, learning_type, strengths, weaknesses,
            performance_score, placement_score,
            career_recommendations, roadmap
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          ON CONFLICT (user_id) DO UPDATE SET
            learning_type=$2, strengths=$3, weaknesses=$4,
            performance_score=$5, placement_score=$6,
            career_recommendations=$7, roadmap=$8`,
          [
            req.user.id,
            mlResult.learning_type,
            JSON.stringify(mlResult.strengths),
            JSON.stringify(mlResult.weaknesses),
            mlResult.performance_score,
            mlResult.placement_score,
            JSON.stringify(mlResult.career_recommendations),
            JSON.stringify(mlResult.roadmap)
          ]
        );
      }

      // Mark profile as completed
      await db.query(
        'UPDATE users SET profile_completed = true WHERE id = $1',
        [req.user.id]
      );

      res.json({
        message: 'Onboarding completed successfully',
        profile_completed: true,
        predictions: mlResult
      });
    } catch (err) {
      console.error('Error submitting onboarding:', err);
      res.status(500).json({ message: 'Server error during onboarding submission' });
    }
  }
);

// Get saved profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ML predictions
router.get('/predictions', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM ml_predictions WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No predictions found' });
    }

    const row = result.rows[0];
    // Parse JSON fields
    const predictions = {
      ...row,
      strengths: safeJsonParse(row.strengths, []),
      weaknesses: safeJsonParse(row.weaknesses, []),
      career_recommendations: safeJsonParse(row.career_recommendations, []),
      roadmap: safeJsonParse(row.roadmap, [])
    };
    res.json(predictions);
  } catch (err) {
    console.error('Error fetching predictions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

function safeJsonParse(str, fallback) {
  if (!str) return fallback;
  if (Array.isArray(str)) return str;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

// Fallback prediction generator when ML service is unavailable
function generateFallbackPredictions({ course, sslc_marks, puc_marks, cgpa, skills, learning_level, career_goal, favorite_subjects }) {
  const sslc = parseFloat(sslc_marks) || 60;
  const puc = parseFloat(puc_marks) || 60;
  const gpa = cgpa ? parseFloat(cgpa) : ((sslc + puc) / 20);
  const skillsList = (skills || '').split(',').map(s => s.trim()).filter(Boolean);
  const subjectsList = (favorite_subjects || '').split(',').map(s => s.trim()).filter(Boolean);

  // Learning type based on interests
  const analyticalKeywords = ['math', 'logic', 'algorithm', 'data', 'analytics', 'statistics'];
  const practicalKeywords = ['coding', 'programming', 'project', 'development', 'building', 'hands-on'];
  const visualKeywords = ['design', 'ui', 'ux', 'graphics', 'art', 'video', 'animation'];

  const allText = (skills + ' ' + favorite_subjects + ' ' + (career_goal || '')).toLowerCase();
  let learning_type = 'Analytical Learner';
  if (practicalKeywords.some(k => allText.includes(k))) learning_type = 'Practical Learner';
  if (visualKeywords.some(k => allText.includes(k))) learning_type = 'Visual Learner';

  // Performance score
  const levelBonus = learning_level === 'Advanced' ? 10 : learning_level === 'Intermediate' ? 5 : 0;
  const performance_score = Math.min(100, Math.round(sslc * 0.2 + puc * 0.3 + (gpa * 10) * 0.3 + skillsList.length * 2 + levelBonus));

  // Placement score
  const placement_score = Math.min(100, Math.round(performance_score * 0.6 + skillsList.length * 3 + levelBonus + (career_goal ? 5 : 0)));

  // Strengths and weaknesses
  const strengths = [];
  const weaknesses = [];

  if (sslc >= 80) strengths.push('Strong Academic Foundation');
  if (puc >= 80) strengths.push('Consistent Academic Performance');
  if (skillsList.length >= 3) strengths.push('Diverse Skill Set');
  if (allText.includes('programming') || allText.includes('coding')) strengths.push('Programming');
  if (allText.includes('database') || allText.includes('sql')) strengths.push('Database Concepts');
  if (allText.includes('problem') || allText.includes('logic')) strengths.push('Problem Solving');
  if (strengths.length === 0) strengths.push('Eagerness to Learn', 'Growth Mindset');

  if (sslc < 60) weaknesses.push('Mathematics');
  if (puc < 60) weaknesses.push('Core Academics');
  if (skillsList.length < 2) weaknesses.push('Technical Skills Breadth');
  if (!allText.includes('communication')) weaknesses.push('Communication Skills');
  if (weaknesses.length === 0) weaknesses.push('Time Management', 'Advanced Specialization');

  // Career recommendations
  const careerMap = {
    BCA: ['Software Developer', 'Data Analyst', 'AI Engineer', 'Full Stack Developer', 'Cloud Architect', 'DevOps Engineer'],
    BBA: ['Marketing Manager', 'HR Executive', 'Business Analyst', 'Operations Manager', 'Entrepreneur', 'Brand Strategist'],
    BCom: ['Accountant', 'Auditor', 'Tax Consultant', 'Financial Analyst', 'Banking Professional', 'Investment Analyst'],
  };
  const career_recommendations = careerMap[course] || careerMap.BCA;

  // Learning roadmap
  const roadmapMap = {
    BCA: [
      { phase: 'Foundation', subjects: ['Programming Fundamentals', 'Mathematics', 'Computer Organization'], duration: '1-2 Months' },
      { phase: 'Core Development', subjects: ['Data Structures', 'Database Management', 'Web Development'], duration: '2-3 Months' },
      { phase: 'Advanced Topics', subjects: ['Software Engineering', 'Machine Learning Basics', 'Cloud Computing'], duration: '2-3 Months' },
      { phase: 'Specialization', subjects: ['AI/ML Projects', 'Full Stack Development', 'Industry Internship'], duration: '3-4 Months' },
    ],
    BBA: [
      { phase: 'Foundation', subjects: ['Business Communication', 'Principles of Management', 'Economics'], duration: '1-2 Months' },
      { phase: 'Core Business', subjects: ['Marketing Management', 'Financial Accounting', 'HR Management'], duration: '2-3 Months' },
      { phase: 'Advanced Topics', subjects: ['Strategic Management', 'Business Analytics', 'International Business'], duration: '2-3 Months' },
      { phase: 'Specialization', subjects: ['Digital Marketing', 'Leadership Development', 'Industry Project'], duration: '3-4 Months' },
    ],
    BCom: [
      { phase: 'Foundation', subjects: ['Financial Accounting', 'Business Mathematics', 'Business Law'], duration: '1-2 Months' },
      { phase: 'Core Commerce', subjects: ['Cost Accounting', 'Taxation', 'Auditing'], duration: '2-3 Months' },
      { phase: 'Advanced Topics', subjects: ['Corporate Finance', 'Investment Analysis', 'E-Commerce'], duration: '2-3 Months' },
      { phase: 'Specialization', subjects: ['GST & Tax Planning', 'Financial Portfolio', 'Industry Internship'], duration: '3-4 Months' },
    ],
  };
  const roadmap = roadmapMap[course] || roadmapMap.BCA;

  return {
    learning_type,
    strengths,
    weaknesses,
    performance_score,
    placement_score,
    career_recommendations,
    roadmap
  };
}

module.exports = router;

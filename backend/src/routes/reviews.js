const express = require('express');
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const aiGateway = require('../services/aiGateway');

const router = express.Router();

// Run AI analysis helper
async function analyzeReviewAI(feedback, suggestion, rating) {
  try {
    const prompt = `Analyze the following user review for EDUVERSE AI:
Feedback: "${feedback}"
Suggestions: "${suggestion || 'None'}"
Rating: ${rating}/5 stars

You must return a raw JSON object containing exactly these keys:
{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "category": "Bug Report" | "Feature Request" | "UI Issue" | "Performance Issue" | "Learning Request" | "New Feature Idea" | "General Feedback",
  "summary": "a short 1-sentence summary of the user's feedback",
  "tags": ["keyword1", "keyword2"]
}

Output ONLY the JSON object. Do not include markdown code block syntax (like \`\`\`json) or any conversational text.`;

    const result = await aiGateway.generateResponse(prompt);
    let text = result.text.trim();
    
    // Clean up markdown wrapper if returned
    if (text.startsWith('```')) {
      text = text.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
    }
    
    const parsed = JSON.parse(text);
    return {
      sentiment: parsed.sentiment || (rating >= 4 ? 'Positive' : rating <= 2 ? 'Negative' : 'Neutral'),
      category: parsed.category || 'General Feedback',
      summary: parsed.summary || feedback.substring(0, 100),
      tags: Array.isArray(parsed.tags) ? parsed.tags : []
    };
  } catch (err) {
    console.error('AI Review analysis failed, falling back to rule-based analysis:', err.message);
    // Rule-based fallback
    const sentiment = rating >= 4 ? 'Positive' : rating <= 2 ? 'Negative' : 'Neutral';
    let category = 'General Feedback';
    
    const textLower = (feedback + ' ' + (suggestion || '')).toLowerCase();
    if (textLower.includes('bug') || textLower.includes('crash') || textLower.includes('error') || textLower.includes('broken')) {
      category = 'Bug Report';
    } else if (textLower.includes('slow') || textLower.includes('lag') || textLower.includes('loading') || textLower.includes('performance')) {
      category = 'Performance Issue';
    } else if (textLower.includes('ui') || textLower.includes('design') || textLower.includes('color') || textLower.includes('look') || textLower.includes('font')) {
      category = 'UI Issue';
    } else if (textLower.includes('feature') || textLower.includes('add') || textLower.includes('want') || textLower.includes('suggest')) {
      category = 'Feature Request';
    } else if (textLower.includes('course') || textLower.includes('learn') || textLower.includes('study') || textLower.includes('explain')) {
      category = 'Learning Request';
    }
    
    return {
      sentiment,
      category,
      summary: feedback.substring(0, 100) + (feedback.length > 100 ? '...' : ''),
      tags: [sentiment.toLowerCase(), category.toLowerCase().replace(' ', '-')]
    };
  }
}

// 1. Submit Review (Compulsory, runs only once in a lifetime per user)
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      rating,
      feedback,
      suggestion,
      timezone,
      browser,
      operatingSystem,
      deviceType,
      screenResolution,
      language,
      country,
      activeUsageTime,
      appVersion,
      reviewVersion
    } = req.body;

    if (!rating || !feedback) {
      return res.status(400).json({ message: 'Rating and Feedback are required.' });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name;

    // Check if user already submitted a review
    const checkUser = await db.query('SELECT id FROM reviews WHERE user_id = $1', [userId]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: 'You have already submitted a review.' });
    }

    // Fetch user details for profile image
    const userDetails = await db.query('SELECT avatar_url FROM users WHERE id = $1', [userId]);
    const profileImage = userDetails.rows[0]?.avatar_url || null;

    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Run AI analysis
    const aiResult = await analyzeReviewAI(feedback, suggestion, rating);

    // Save review
    const insertQuery = `
      INSERT INTO reviews (
        user_id, user_name, email, profile_image, rating, feedback, suggestion,
        timezone, browser, operating_system, device_type, screen_resolution,
        language, country, ip_address, app_version, review_version, active_usage_time,
        ai_sentiment, ai_category, ai_summary, ai_tags, ai_processed
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const values = [
      userId,
      userName,
      userEmail,
      profileImage,
      rating,
      feedback,
      suggestion || null,
      timezone || 'UTC',
      browser || 'Unknown',
      operatingSystem || 'Unknown',
      deviceType || 'Desktop',
      screenResolution || 'Unknown',
      language || 'en',
      country || 'Unknown',
      ipAddress,
      appVersion || '1.0.0',
      reviewVersion || '1.0.0',
      activeUsageTime || 600, // default 10 mins
      aiResult.sentiment,
      aiResult.category,
      aiResult.summary,
      JSON.stringify(aiResult.tags),
      true
    ];

    const newReview = await db.query(insertQuery, values);

    // Mark as submitted in users table
    await db.query('UPDATE users SET review_submitted = true WHERE id = $1', [userId]);

    res.status(201).json({
      message: 'Review submitted successfully',
      review: newReview.rows[0]
    });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

// 2. Export Reviews as CSV/JSON (Admin)
router.get('/admin/export', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { format } = req.query; // 'csv' or 'json'
    const result = await db.query('SELECT * FROM reviews ORDER BY created_at DESC');
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=reviews_export_${Date.now()}.json`);
      return res.send(JSON.stringify(result.rows, null, 2));
    }

    // Default CSV export
    let csv = 'Review ID,User Name,Email,Rating,Feedback,Suggestion,Date,Time,Browser,OS,Device,Country,Sentiment,Category,Tags\n';
    result.rows.forEach(r => {
      const cleanFeedback = (r.feedback || '').replace(/"/g, '""').replace(/\n/g, ' ');
      const cleanSuggestion = (r.suggestion || '').replace(/"/g, '""').replace(/\n/g, ' ');
      const cleanTags = (r.ai_tags ? (typeof r.ai_tags === 'string' ? r.ai_tags : JSON.stringify(r.ai_tags)) : '[]').replace(/"/g, '""');
      
      csv += `${r.id},"${r.user_name}","${r.email}",${r.rating},"${cleanFeedback}","${cleanSuggestion}",${r.review_date},${r.review_time},"${r.browser}","${r.operating_system}","${r.device_type}","${r.country}","${r.ai_sentiment}","${r.ai_category}","${cleanTags}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=reviews_export_${Date.now()}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Export reviews failed:', err);
    res.status(500).json({ message: 'Failed to export reviews' });
  }
});

// 3. Admin Reviews Dashboard Stats
router.get('/admin/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) as total_reviews,
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as star_5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as star_4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as star_3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as star_2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as star_1,
        ROUND(AVG(LENGTH(feedback)), 0) as avg_feedback_length,
        COUNT(CASE WHEN review_date = CURRENT_DATE THEN 1 END) as today_reviews,
        COUNT(CASE WHEN review_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as weekly_reviews,
        COUNT(CASE WHEN review_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as monthly_reviews
      FROM reviews
    `;
    const statsRes = await db.query(statsQuery);
    const stats = statsRes.rows[0];

    // Growth charts daily for last 30 days
    const growthQuery = `
      SELECT review_date::text as date, COUNT(*) as count, ROUND(AVG(rating), 2) as avg_rating
      FROM reviews
      WHERE review_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY review_date
      ORDER BY review_date ASC
    `;
    const growthRes = await db.query(growthQuery);

    // AI Categorization / Sentiment distribution
    const aiCategoryQuery = `
      SELECT ai_category as category, COUNT(*) as count
      FROM reviews
      GROUP BY ai_category
    `;
    const aiCategoryRes = await db.query(aiCategoryQuery);

    const aiSentimentQuery = `
      SELECT ai_sentiment as sentiment, COUNT(*) as count
      FROM reviews
      GROUP BY ai_sentiment
    `;
    const aiSentimentRes = await db.query(aiSentimentQuery);

    // Recurring ideas / suggestions summary via DB analysis or mock list (or AI compile)
    const suggestionsRes = await db.query(`
      SELECT feedback, suggestion, ai_category, ai_sentiment, rating
      FROM reviews
      WHERE status = 'active'
      LIMIT 100
    `);

    res.json({
      summary: {
        totalReviews: parseInt(stats.total_reviews) || 0,
        averageRating: parseFloat(stats.average_rating) || 0,
        avgFeedbackLength: parseInt(stats.avg_feedback_length) || 0,
        todayReviews: parseInt(stats.today_reviews) || 0,
        weeklyReviews: parseInt(stats.weekly_reviews) || 0,
        monthlyReviews: parseInt(stats.monthly_reviews) || 0,
        stars: {
          5: parseInt(stats.star_5) || 0,
          4: parseInt(stats.star_4) || 0,
          3: parseInt(stats.star_3) || 0,
          2: parseInt(stats.star_2) || 0,
          1: parseInt(stats.star_1) || 0
        }
      },
      growth: growthRes.rows,
      categories: aiCategoryRes.rows,
      sentiments: aiSentimentRes.rows,
      rawReviewsForAI: suggestionsRes.rows
    });
  } catch (err) {
    console.error('Failed to get admin stats:', err);
    res.status(500).json({ message: 'Failed to retrieve stats' });
  }
});

// 4. Admin List Reviews (Paginated, filtered, searched, sorted)
router.get('/admin', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      rating,
      country,
      browser,
      os,
      deviceType,
      status,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const params = [];
    let countQuery = 'SELECT COUNT(*) FROM reviews WHERE 1=1';
    let dataQuery = 'SELECT * FROM reviews WHERE 1=1';

    // Filters
    let paramIndex = 1;
    if (rating) {
      countQuery += ` AND rating = $${paramIndex}`;
      dataQuery += ` AND rating = $${paramIndex}`;
      params.push(parseInt(rating));
      paramIndex++;
    }
    if (country) {
      countQuery += ` AND country = $${paramIndex}`;
      dataQuery += ` AND country = $${paramIndex}`;
      params.push(country);
      paramIndex++;
    }
    if (browser) {
      countQuery += ` AND browser = $${paramIndex}`;
      dataQuery += ` AND browser = $${paramIndex}`;
      params.push(browser);
      paramIndex++;
    }
    if (os) {
      countQuery += ` AND operating_system = $${paramIndex}`;
      dataQuery += ` AND operating_system = $${paramIndex}`;
      params.push(os);
      paramIndex++;
    }
    if (deviceType) {
      countQuery += ` AND device_type = $${paramIndex}`;
      dataQuery += ` AND device_type = $${paramIndex}`;
      params.push(deviceType);
      paramIndex++;
    }
    if (status) {
      countQuery += ` AND status = $${paramIndex}`;
      dataQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Search
    if (search) {
      const searchPattern = `%${search.toLowerCase()}%`;
      countQuery += ` AND (LOWER(user_name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex} OR LOWER(feedback) LIKE $${paramIndex} OR LOWER(suggestion) LIKE $${paramIndex} OR LOWER(country) LIKE $${paramIndex})`;
      dataQuery += ` AND (LOWER(user_name) LIKE $${paramIndex} OR LOWER(email) LIKE $${paramIndex} OR LOWER(feedback) LIKE $${paramIndex} OR LOWER(suggestion) LIKE $${paramIndex} OR LOWER(country) LIKE $${paramIndex})`;
      params.push(searchPattern);
      paramIndex++;
    }

    // Sorting
    const allowedSortFields = ['created_at', 'rating', 'user_name', 'email', 'active_usage_time'];
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    dataQuery += ` ORDER BY ${finalSortBy} ${finalSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    const countRes = await db.query(countQuery, params);
    const totalCount = parseInt(countRes.rows[0].count);

    // Add limit and offset params for the data query
    params.push(parseInt(limit));
    params.push(parseInt(offset));

    const dataRes = await db.query(dataQuery, params);

    res.json({
      reviews: dataRes.rows,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Failed to query reviews:', err);
    res.status(500).json({ message: 'Failed to retrieve reviews' });
  }
});

// 5. Admin Single Review Detail
router.get('/admin/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM reviews WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching review detail:', err);
    res.status(500).json({ message: 'Failed to retrieve review detail' });
  }
});

// 6. Admin Reanalyze AI
router.post('/admin/:id/reanalyze', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT feedback, suggestion, rating FROM reviews WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { feedback, suggestion, rating } = result.rows[0];
    const aiResult = await analyzeReviewAI(feedback, suggestion, rating);

    const updateQuery = `
      UPDATE reviews
      SET ai_sentiment = $1, ai_category = $2, ai_summary = $3, ai_tags = $4, ai_processed = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const updated = await db.query(updateQuery, [
      aiResult.sentiment,
      aiResult.category,
      aiResult.summary,
      JSON.stringify(aiResult.tags),
      id
    ]);

    res.json({
      message: 'AI Review reanalyzed successfully',
      review: updated.rows[0]
    });
  } catch (err) {
    console.error('Error reanalyzing review:', err);
    res.status(500).json({ message: 'Failed to reanalyze review' });
  }
});

// 7. Admin Delete Review (cleanup/moderate)
router.delete('/admin/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING user_id');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

module.exports = router;

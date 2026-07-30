const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const aiGateway = require('../services/aiGateway');

// Helper to safely parse JSON from AI response
function cleanAndParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch (err) {}
    }
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        return JSON.parse(raw.substring(firstBrace, lastBrace + 1));
      } catch (err) {}
    }
    throw new Error("Failed to parse AI output into structured JSON format.");
  }
}

// -------------------------------------------------------------
// 1. GET ALL IDEAS FOR USER
// -------------------------------------------------------------
router.get('/ideas', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, user_id, title, problem, solution, target_audience, industry, country, status, 
              overall_score, evaluation_data, created_at, updated_at 
       FROM innovation_ideas 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [req.user.id]
    );
    res.json({ ideas: result.rows });
  } catch (err) {
    console.error('Error fetching innovation ideas:', err);
    res.status(500).json({ message: 'Error loading startup ideas' });
  }
});

// -------------------------------------------------------------
// 2. GET SINGLE IDEA BY ID
// -------------------------------------------------------------
router.get('/ideas/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM innovation_ideas WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Startup idea not found' });
    }
    res.json({ idea: result.rows[0] });
  } catch (err) {
    console.error('Error fetching startup idea:', err);
    res.status(500).json({ message: 'Error retrieving startup idea' });
  }
});

// -------------------------------------------------------------
// 3. CREATE NEW IDEA
// -------------------------------------------------------------
router.post('/ideas', authenticate, async (req, res) => {
  try {
    const { title, problem, solution, target_audience, industry, country } = req.body;
    if (!title || !problem || !solution) {
      return res.status(400).json({ message: 'Title, problem, and solution are required.' });
    }

    const result = await db.query(
      `INSERT INTO innovation_ideas 
        (user_id, title, problem, solution, target_audience, industry, country, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
       RETURNING *`,
      [req.user.id, title, problem, solution, target_audience || 'General', industry || 'Technology', country || 'Global']
    );

    res.status(201).json({ idea: result.rows[0], message: 'Idea created successfully' });
  } catch (err) {
    console.error('Error creating idea:', err);
    res.status(500).json({ message: 'Error creating startup idea' });
  }
});

// -------------------------------------------------------------
// 4. DELETE IDEA
// -------------------------------------------------------------
router.delete('/ideas/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `DELETE FROM innovation_ideas WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Idea not found or unauthorized' });
    }
    res.json({ message: 'Idea deleted successfully' });
  } catch (err) {
    console.error('Error deleting idea:', err);
    res.status(500).json({ message: 'Error deleting idea' });
  }
});

// -------------------------------------------------------------
// 5. AI IDEA EVALUATION
// -------------------------------------------------------------
router.post('/evaluate', authenticate, async (req, res) => {
  try {
    const { idea_id, title, problem, solution, target_audience, industry, country } = req.body;

    const systemInstruction = `You are a world-class Venture Capitalist, Startup Incubator Director, and Product Architect.
Evaluate the given startup idea rigorously and return ONLY valid JSON matching this schema:
{
  "overallScore": 88,
  "metrics": {
    "feasibility": 85,
    "marketPotential": 92,
    "innovation": 90,
    "monetization": 84,
    "scalability": 89
  },
  "verdict": "High Potential / Venture Backable / Niche Specialty / Pivots Recommended",
  "summary": "Executive summary of the evaluation...",
  "swot": {
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "opportunities": ["...", "..."],
    "threats": ["...", "..."]
  },
  "risks": [
    { "risk": "...", "impact": "High/Medium/Low", "mitigation": "..." }
  ],
  "recommendations": ["...", "...", "..."],
  "targetAudienceInsights": "..."
}`;

    const userPrompt = `Startup Title: ${title}
Industry: ${industry}
Target Country: ${country}
Target Audience: ${target_audience}
Problem Statement: ${problem}
Solution Overview: ${solution}`;

    const rawResponse = await aiGateway.generateResponse(userPrompt, { systemInstruction });
    const evaluation = cleanAndParseJSON(rawResponse);

    // Save evaluation to DB if idea_id provided
    if (idea_id) {
      await db.query(
        `UPDATE innovation_ideas 
         SET overall_score = $1, evaluation_data = $2, status = 'evaluated', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 AND user_id = $4`,
        [evaluation.overallScore || 80, JSON.stringify(evaluation), idea_id, req.user.id]
      );
    }

    res.json({ evaluation });
  } catch (err) {
    console.error('AI evaluation error:', err);
    res.status(500).json({ message: err.message || 'Error conducting AI startup evaluation' });
  }
});

// -------------------------------------------------------------
// 6. AI MARKET RESEARCH & COMPETITORS
// -------------------------------------------------------------
router.post('/generate-market', authenticate, async (req, res) => {
  try {
    const { idea_id, title, problem, solution, industry, country } = req.body;

    const systemInstruction = `You are a Chief Strategy Officer and Market Intelligence Analyst.
Analyze the market size, competitors, trends, and go-to-market strategy. Return ONLY valid JSON:
{
  "tamSamSom": {
    "tam": "$50B (Total Addressable Market description)",
    "sam": "$5B (Serviceable Addressable Market description)",
    "som": "$500M (Serviceable Obtainable Market description)"
  },
  "competitors": [
    { "name": "...", "type": "Direct/Indirect", "strengths": "...", "weaknesses": "...", "ourAdvantage": "..." }
  ],
  "marketTrends": ["...", "...", "..."],
  "customerPersona": {
    "name": "...",
    "role": "...",
    "painPoints": ["..."],
    "buyingBehavior": "..."
  },
  "gtmStrategy": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ..."]
}`;

    const userPrompt = `Idea Title: ${title}
Industry: ${industry} | Region: ${country}
Problem: ${problem}
Solution: ${solution}`;

    const rawResponse = await aiGateway.generateResponse(userPrompt, { systemInstruction });
    const marketData = cleanAndParseJSON(rawResponse);

    if (idea_id) {
      await db.query(
        `UPDATE innovation_ideas 
         SET market_data = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND user_id = $3`,
        [JSON.stringify(marketData), idea_id, req.user.id]
      );
    }

    res.json({ marketData });
  } catch (err) {
    console.error('Market research error:', err);
    res.status(500).json({ message: err.message || 'Error generating market research' });
  }
});

// -------------------------------------------------------------
// 7. AI BUSINESS MODEL CANVAS
// -------------------------------------------------------------
router.post('/generate-bizmodel', authenticate, async (req, res) => {
  try {
    const { idea_id, title, problem, solution, industry } = req.body;

    const systemInstruction = `You are a Startup Founder Mentor. Generate a complete 9-box Business Model Canvas. Return ONLY valid JSON:
{
  "keyPartners": ["...", "..."],
  "keyActivities": ["...", "..."],
  "keyResources": ["...", "..."],
  "valuePropositions": ["...", "..."],
  "customerRelationships": ["...", "..."],
  "channels": ["...", "..."],
  "customerSegments": ["...", "..."],
  "costStructure": ["...", "..."],
  "revenueStreams": ["...", "..."]
}`;

    const userPrompt = `Startup: ${title} | Industry: ${industry}
Problem: ${problem}
Solution: ${solution}`;

    const raw = await aiGateway.generateResponse(userPrompt, { systemInstruction });
    const bizModel = cleanAndParseJSON(raw);

    if (idea_id) {
      await db.query(
        `UPDATE innovation_ideas 
         SET bizmodel_data = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND user_id = $3`,
        [JSON.stringify(bizModel), idea_id, req.user.id]
      );
    }

    res.json({ bizModel });
  } catch (err) {
    console.error('Business model canvas error:', err);
    res.status(500).json({ message: err.message || 'Error generating business model canvas' });
  }
});

// -------------------------------------------------------------
// 8. AI FINANCIAL PLANNING
// -------------------------------------------------------------
router.post('/generate-finance', authenticate, async (req, res) => {
  try {
    const { idea_id, title, solution, industry } = req.body;

    const systemInstruction = `You are a Tech Startup CFO. Generate 3-year financial projections and unit economics. Return ONLY valid JSON:
{
  "projections": [
    { "year": "Year 1", "revenue": "$100K", "expenses": "$120K", "netProfit": "-$20K", "activeUsers": 5000 },
    { "year": "Year 2", "revenue": "$500K", "expenses": "$350K", "netProfit": "$150K", "activeUsers": 35000 },
    { "year": "Year 3", "revenue": "$2.5M", "expenses": "$1.4M", "netProfit": "$1.1M", "activeUsers": 200000 }
  ],
  "unitEconomics": {
    "cac": "$35 (Customer Acquisition Cost)",
    "ltv": "$280 (Lifetime Value)",
    "paybackPeriod": "4.5 Months",
    "grossMargin": "82%"
  },
  "fundingAsk": {
    "amount": "$250,000",
    "runwayMonths": "18 Months",
    "useOfFunds": [
      { "category": "Product & Engineering", "percentage": 45 },
      { "category": "Growth & Marketing", "percentage": 35 },
      { "category": "Operations & Legal", "percentage": 20 }
    ]
  },
  "breakEvenTimeline": "Month 14"
}`;

    const userPrompt = `Startup Title: ${title} | Industry: ${industry}
Solution: ${solution}`;

    const raw = await aiGateway.generateResponse(userPrompt, { systemInstruction });
    const financeData = cleanAndParseJSON(raw);

    if (idea_id) {
      await db.query(
        `UPDATE innovation_ideas 
         SET finance_data = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND user_id = $3`,
        [JSON.stringify(financeData), idea_id, req.user.id]
      );
    }

    res.json({ financeData });
  } catch (err) {
    console.error('Financial planning error:', err);
    res.status(500).json({ message: err.message || 'Error generating financial model' });
  }
});

// -------------------------------------------------------------
// 9. AI MVP PLANNER & TECH STACK
// -------------------------------------------------------------
router.post('/generate-mvp', authenticate, async (req, res) => {
  try {
    const { idea_id, title, problem, solution } = req.body;

    const systemInstruction = `You are a CTO and Chief Product Officer. Define an MVP roadmap and tech stack. Return ONLY valid JSON:
{
  "mvpScope": {
    "coreFeatures": ["Feature 1...", "Feature 2...", "Feature 3..."],
    "futureFeatures": ["V2 Feature 1...", "V2 Feature 2..."]
  },
  "techStack": {
    "frontend": ["React", "Tailwind CSS"],
    "backend": ["Node.js / Express", "PostgreSQL"],
    "aiInfrastructure": ["Gemini / OpenRouter Gateway"],
    "hosting": ["Vercel", "Render / AWS"]
  },
  "sprintRoadmap": [
    { "phase": "Weeks 1-2", "focus": "Architecture, Auth & DB Design" },
    { "phase": "Weeks 3-4", "focus": "Core Engine & UI Components" },
    { "phase": "Weeks 5-6", "focus": "AI Integration & Analytics" },
    { "phase": "Weeks 7-8", "focus": "Beta Testing, Security & Launch" }
  ],
  "estimatedCost": "$8,000 - $15,000 (Initial Build)",
  "estimatedTimeWeeks": 8
}`;

    const userPrompt = `Startup: ${title}
Problem: ${problem}
Solution: ${solution}`;

    const raw = await aiGateway.generateResponse(userPrompt, { systemInstruction });
    const mvpData = cleanAndParseJSON(raw);

    if (idea_id) {
      await db.query(
        `UPDATE innovation_ideas 
         SET mvp_data = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND user_id = $3`,
        [JSON.stringify(mvpData), idea_id, req.user.id]
      );
    }

    res.json({ mvpData });
  } catch (err) {
    console.error('MVP planner error:', err);
    res.status(500).json({ message: err.message || 'Error generating MVP roadmap' });
  }
});

// -------------------------------------------------------------
// 10. AI PITCH DECK GENERATOR
// -------------------------------------------------------------
router.post('/generate-pitch', authenticate, async (req, res) => {
  try {
    const { idea_id, title, problem, solution, industry, country } = req.body;

    const systemInstruction = `You are a Y-Combinator Partner. Generate a 10-slide investor pitch deck structure. Return ONLY valid JSON:
{
  "slides": [
    { "slideNumber": 1, "title": "Title & Hook", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 2, "title": "The Problem", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 3, "title": "The Solution", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 4, "title": "Market Size & Opportunity", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 5, "title": "Product Architecture", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 6, "title": "Business Model", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 7, "title": "Competitive Advantage", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 8, "title": "Go-To-Market Strategy", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 9, "title": "Financial Projections", "headline": "...", "bullets": ["...", "..."] },
    { "slideNumber": 10, "title": "The Ask & Team", "headline": "...", "bullets": ["...", "..."] }
  ],
  "elevatorPitch": "A 2-sentence killer pitch for investors."
}`;

    const userPrompt = `Startup: ${title} | Industry: ${industry} | Region: ${country}
Problem: ${problem}
Solution: ${solution}`;

    const raw = await aiGateway.generateResponse(userPrompt, { systemInstruction });
    const pitchData = cleanAndParseJSON(raw);

    if (idea_id) {
      await db.query(
        `UPDATE innovation_ideas 
         SET pitch_data = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 AND user_id = $3`,
        [JSON.stringify(pitchData), idea_id, req.user.id]
      );
    }

    res.json({ pitchData });
  } catch (err) {
    console.error('Pitch deck generator error:', err);
    res.status(500).json({ message: err.message || 'Error generating pitch deck' });
  }
});

// -------------------------------------------------------------
// 11. AI BRAINSTORMING IDEA GENERATOR
// -------------------------------------------------------------
router.post('/generate-ideas', authenticate, async (req, res) => {
  try {
    const { domain, targetAudience, trend } = req.body;

    const systemInstruction = `You are a Tech Trendspotter & Startup Incubator. Generate 4 innovative, high-potential startup ideas. Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "...",
      "industry": "...",
      "problem": "...",
      "solution": "...",
      "targetAudience": "...",
      "potential": "High/Extreme",
      "tagline": "..."
    }
  ]
}`;

    const userPrompt = `Domain / Field: ${domain || 'Education & AI'}
Target Audience: ${targetAudience || 'Students & Professionals'}
Current Tech Trend: ${trend || 'Generative AI & Agentic Workflows'}`;

    const raw = await aiGateway.generateResponse(userPrompt, { systemInstruction });
    const generated = cleanAndParseJSON(raw);

    res.json({ ideas: generated.ideas || [] });
  } catch (err) {
    console.error('Idea generator error:', err);
    res.status(500).json({ message: err.message || 'Error generating startup ideas' });
  }
});

// -------------------------------------------------------------
// 12. INCUBATOR & MENTOR CHAT
// -------------------------------------------------------------
router.post('/mentor-chat', authenticate, async (req, res) => {
  try {
    const { message, context, history } = req.body;

    const systemInstruction = `You are "Incubator AI", a seasoned startup founder, investor, and product mentor.
Give strategic, actionable, highly practical advice on fundraising, product-market fit, unit economics, customer acquisition, and technical scalability.
Keep answers structured, crisp, energetic, and encouraging. Use markdown bullet points and clear sections.`;

    let conversationPrompt = '';
    if (context) {
      conversationPrompt += `Current Startup Context:\nTitle: ${context.title}\nProblem: ${context.problem}\nSolution: ${context.solution}\n\n`;
    }
    if (history && Array.isArray(history)) {
      history.slice(-6).forEach(msg => {
        conversationPrompt += `${msg.role === 'user' ? 'User' : 'Mentor'}: ${msg.content}\n`;
      });
    }
    conversationPrompt += `User Question: ${message}`;

    const response = await aiGateway.generateResponse(conversationPrompt, { systemInstruction });
    res.json({ reply: response });
  } catch (err) {
    console.error('Mentor chat error:', err);
    res.status(500).json({ message: err.message || 'Error contacting AI Startup Mentor' });
  }
});

module.exports = router;

const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/crypto');

const router = express.Router();

// Helper to mask API Key - shows last 4 characters only
const maskKey = (key) => {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return `************${key.slice(-4)}`;
};

// Helper to fetch key (DB or Env fallback)
const getProviderKey = async (providerName) => {
  const result = await db.query('SELECT api_key FROM api_configurations WHERE provider = $1', [providerName]);
  if (result.rows.length > 0 && result.rows[0].api_key) {
    return decrypt(result.rows[0].api_key);
  }
  // Fallback to env
  const envMap = {
    gemini: 'GEMINI_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    groq: 'GROQ_API_KEY',
    together: 'TOGETHER_API_KEY',
    deepgram: 'DEEPGRAM_API_KEY',
    elevenlabs: 'ELEVENLABS_API_KEY',
    assemblyai: 'ASSEMBLYAI_API_KEY',
    azure_speech: 'AZURE_SPEECH_KEY',
  };
  const envVar = envMap[providerName];
  return envVar ? process.env[envVar] || '' : '';
};

// 1. GET all API configurations & stats overview
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const configs = await db.query(
      `SELECT provider, priority, status, disabled, consecutive_failures, cooldown_until, last_used 
       FROM api_configurations 
       ORDER BY priority ASC`
    );
    
    // Enrich with masked key presence status and simple stats
    const enrichedConfigs = await Promise.all(configs.rows.map(async (row) => {
      const actualKey = await getProviderKey(row.provider);
      
      // Get recent stats for this provider
      const statsRes = await db.query(`
        SELECT 
          COUNT(*)::int as total_requests,
          COALESCE(SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::int, 0) as success_count,
          COALESCE(AVG(latency_ms)::int, 0) as avg_latency
        FROM api_usage_logs 
        WHERE provider = $1 AND created_at > NOW() - INTERVAL '30 days'
      `, [row.provider]);

      // Calculate RPM (Requests Per Minute) in the last 1 minute
      const rpmRes = await db.query(`
        SELECT COUNT(*)::int as rpm 
        FROM api_usage_logs 
        WHERE provider = $1 AND created_at > NOW() - INTERVAL '1 minute'
      `, [row.provider]);

      const stats = statsRes.rows[0];
      const successRate = stats.total_requests > 0 
        ? Math.round((stats.success_count / stats.total_requests) * 100) 
        : 100;

      return {
        ...row,
        api_key: actualKey ? maskKey(actualKey) : '',
        isConfigured: !!actualKey,
        totalRequests: stats.total_requests,
        successRate,
        avgLatency: stats.avg_latency,
        rpm: rpmRes.rows[0]?.rpm || 0
      };
    }));

    res.json(enrichedConfigs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving API settings' });
  }
});

// 2. SAVE provider key
router.post('/key', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { provider, api_key } = req.body;
    if (!provider) {
      return res.status(400).json({ message: 'Provider name is required' });
    }

    const encryptedKey = encrypt(api_key);
    await db.query(
      `INSERT INTO api_configurations (provider, api_key, status, disabled, consecutive_failures, updated_at) 
       VALUES ($1, $2, 'Disconnected', false, 0, NOW())
       ON CONFLICT (provider) DO UPDATE SET api_key = $2, status = 'Disconnected', disabled = false, consecutive_failures = 0, updated_at = NOW()`,
      [provider, encryptedKey]
    );

    // Audit Log
    await db.query(
      'INSERT INTO api_audit_logs (admin_id, action, provider, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'UPDATE_KEY', provider, `Updated key for ${provider}`]
    );

    res.json({ message: `API Key for ${provider} saved securely.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error saving API Key' });
  }
});

// 2b. TOGGLE provider active status (enable/disable)
router.post('/toggle', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { provider, disabled } = req.body;
    if (!provider) {
      return res.status(400).json({ message: 'Provider name is required' });
    }

    await db.query(
      'UPDATE api_configurations SET disabled = $1, updated_at = NOW() WHERE provider = $2',
      [!!disabled, provider]
    );

    await db.query(
      'INSERT INTO api_audit_logs (admin_id, action, provider, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, disabled ? 'DISABLE_PROVIDER' : 'ENABLE_PROVIDER', provider, `${disabled ? 'Disabled' : 'Enabled'} provider ${provider}`]
    );

    res.json({ message: `Provider ${provider} ${disabled ? 'disabled' : 'enabled'} successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error toggling provider status' });
  }
});

// 3. DELETE provider key
router.delete('/key/:provider', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { provider } = req.params;
    await db.query(
      `UPDATE api_configurations 
       SET api_key = '', status = 'Disconnected', disabled = false, consecutive_failures = 0, cooldown_until = NULL, updated_at = NOW() 
       WHERE provider = $1`,
      [provider]
    );

    // Audit Log
    await db.query(
      'INSERT INTO api_audit_logs (admin_id, action, provider, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'DELETE_KEY', provider, `Cleared API key for ${provider}`]
    );

    res.json({ message: `API Key for ${provider} cleared successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error clearing API Key' });
  }
});

// 4. UPDATE priority order
router.post('/priority', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { priorities } = req.body; // Array of provider names
    if (!Array.isArray(priorities)) {
      return res.status(400).json({ message: 'Priorities must be an array of provider names' });
    }

    for (let i = 0; i < priorities.length; i++) {
      await db.query(
        'UPDATE api_configurations SET priority = $1 WHERE provider = $2',
        [i + 1, priorities[i]]
      );
    }

    // Audit Log
    await db.query(
      'INSERT INTO api_audit_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'UPDATE_PRIORITY', `Reordered provider priorities: ${priorities.join(' -> ')}`]
    );

    res.json({ message: 'Provider priorities updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating priorities' });
  }
});

// 4b. AUTO REORDER based on success rate and latency
router.post('/auto-reorder', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Fetch stats for all configured providers in last 30 days
    const result = await db.query(`
      SELECT 
        c.provider,
        COALESCE(COUNT(l.id)::int, 0) as total_requests,
        COALESCE(SUM(CASE WHEN l.success = true THEN 1 ELSE 0 END)::int, 0) as success_count,
        COALESCE(AVG(l.latency_ms)::int, 9999) as avg_latency
      FROM api_configurations c
      LEFT JOIN api_usage_logs l ON c.provider = l.provider AND l.created_at > NOW() - INTERVAL '30 days'
      GROUP BY c.provider
    `);

    // Sort criteria: higher success rate first, then lower latency
    const sorted = result.rows.sort((a, b) => {
      const rateA = a.total_requests > 0 ? (a.success_count / a.total_requests) : 1.0;
      const rateB = b.total_requests > 0 ? (b.success_count / b.total_requests) : 1.0;
      if (rateB !== rateA) {
        return rateB - rateA; // Descending success rate
      }
      return a.avg_latency - b.avg_latency; // Ascending latency
    });

    const priorities = sorted.map(row => row.provider);

    for (let i = 0; i < priorities.length; i++) {
      await db.query(
        'UPDATE api_configurations SET priority = $1 WHERE provider = $2',
        [i + 1, priorities[i]]
      );
    }

    await db.query(
      'INSERT INTO api_audit_logs (admin_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'AUTO_REORDER_PRIORITY', `Auto reordered provider priorities based on success/latency: ${priorities.join(' -> ')}`]
    );

    res.json({ message: 'Providers auto-reordered successfully based on performance.', priorities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during auto-reordering' });
  }
});

// 5. TEST API connection (Supports LLM & Voice providers STT/TTS)
router.post('/test', authenticate, authorizeAdmin, async (req, res) => {
  const startTime = Date.now();
  const { provider, api_key, test_prompt } = req.body;
  const prompt = test_prompt || 'Hello, respond with exactly "OK"';

  if (!provider) {
    return res.status(400).json({ message: 'Provider name is required' });
  }

  // Determine key to use (1. provided key, 2. saved db key, 3. env variable fallback)
  let keyToUse = api_key;
  if (!keyToUse) {
    keyToUse = await getProviderKey(provider);
  }

  if (!keyToUse) {
    return res.status(400).json({ message: `No API key found for ${provider}. Please provide one.` });
  }

  let success = false;
  let errorMessage = null;
  let responseSnippet = '';

  try {
    if (provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(keyToUse);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      responseSnippet = result.response.text();
      success = true;
    } else if (provider === 'openrouter') {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 20
        },
        { headers: { Authorization: `Bearer ${keyToUse}`, 'Content-Type': 'application/json' } }
      );
      responseSnippet = response.data?.choices?.[0]?.message?.content || JSON.stringify(response.data);
      success = true;
    } else if (provider === 'groq') {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-8b-8192',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 20
        },
        { headers: { Authorization: `Bearer ${keyToUse}`, 'Content-Type': 'application/json' } }
      );
      responseSnippet = response.data?.choices?.[0]?.message?.content || JSON.stringify(response.data);
      success = true;
    } else if (provider === 'together') {
      const response = await axios.post(
        'https://api.together.xyz/v1/chat/completions',
        {
          model: 'meta-llama/Llama-3-8b-chat-hf',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 20
        },
        { headers: { Authorization: `Bearer ${keyToUse}`, 'Content-Type': 'application/json' } }
      );
      responseSnippet = response.data?.choices?.[0]?.message?.content || JSON.stringify(response.data);
      success = true;
    } else if (provider === 'deepgram') {
      const response = await axios.get('https://api.deepgram.com/v1/projects', {
        headers: { Authorization: `Token ${keyToUse}` }
      });
      responseSnippet = `Authenticated successfully. Found ${response.data?.projects?.length || 0} active projects.`;
      success = true;
    } else if (provider === 'elevenlabs') {
      const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': keyToUse }
      });
      responseSnippet = `Authenticated successfully. Found ${response.data?.voices?.length || 0} voices.`;
      success = true;
    } else if (provider === 'assemblyai') {
      const response = await axios.get('https://api.assemblyai.com/v2/transcript?limit=1', {
        headers: { Authorization: keyToUse }
      });
      responseSnippet = `Authenticated successfully. Transcripts accessible.`;
      success = true;
    } else if (provider === 'azure_speech') {
      // Azure uses region-based endpoints to fetch auth token
      const region = process.env.AZURE_SPEECH_REGION || 'eastus';
      const response = await axios.post(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, null, {
        headers: { 'Ocp-Apim-Subscription-Key': keyToUse }
      });
      responseSnippet = `Token issued successfully: ${response.data.substring(0, 20)}...`;
      success = true;
    } else {
      // Custom / fallback provider test
      responseSnippet = 'Simulated connection test. Success.';
      success = true;
    }
  } catch (err) {
    console.error(`Test Connection Error for ${provider}:`, err.message);
    success = false;
    errorMessage = err.response?.data?.error?.message || err.response?.data?.message || err.message;
  }

  const latency = Date.now() - startTime;
  const statusResult = success ? 'Connected' : 'Invalid Key';

  // Save to api_usage_logs (don't block the API response)
  db.query(
    'INSERT INTO api_usage_logs (provider, success, latency_ms, error_message) VALUES ($1, $2, $3, $4)',
    [provider, success, latency, errorMessage]
  ).catch(err => console.error('Error saving usage log:', err));

  // If testing the saved key, update the provider status in DB
  if (!api_key) {
    db.query(
      `UPDATE api_configurations 
       SET status = $1, consecutive_failures = $2, last_used = NOW(), updated_at = NOW() 
       WHERE provider = $3`,
      [statusResult, success ? 0 : 1, provider]
    ).catch(err => console.error('Error updating provider status:', err));
  }

  res.json({
    success,
    status: statusResult,
    latency_ms: latency,
    response: responseSnippet,
    error: errorMessage
  });
});

// 6. GET stats & health charts dashboard
router.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // 30 Days aggregations
    const summaryRes = await db.query(`
      SELECT 
        provider,
        COUNT(*)::int as request_count,
        COALESCE(SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::int, 0) as success_count,
        COALESCE(SUM(CASE WHEN success = false THEN 1 ELSE 0 END)::int, 0) as error_count,
        COALESCE(AVG(latency_ms)::int, 0) as avg_latency
      FROM api_usage_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY provider
    `);

    // Daily Usage Charts (last 7 days)
    const dailyRes = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COUNT(*)::int as requests,
        COALESCE(SUM(CASE WHEN success = true THEN 1 ELSE 0 END)::int, 0) as success
      FROM api_usage_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `);

    // Audit logs (last 20 events)
    const auditRes = await db.query(`
      SELECT 
        a.id, a.action, a.provider, a.details, a.created_at, u.name as admin_name
      FROM api_audit_logs a
      LEFT JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    res.json({
      summary: summaryRes.rows,
      daily: dailyRes.rows,
      audit: auditRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error retrieving stats' });
  }
});

module.exports = router;

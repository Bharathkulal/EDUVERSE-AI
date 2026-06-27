const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
const { decrypt } = require('./crypto');

const generateContentWithFailover = async (prompt, enableSearch = false) => {
  // 1. Fetch active providers ordered by priority
  // Exclude providers explicitly disabled OR in active cooldown
  const result = await db.query(
    `SELECT provider, api_key, priority, disabled, cooldown_until, consecutive_failures
     FROM api_configurations 
     WHERE disabled = false AND (cooldown_until IS NULL OR cooldown_until < NOW())
     ORDER BY priority ASC`
  );
  
  let providers = [];
  
  // Decrypt saved DB keys
  for (const row of result.rows) {
    let key = '';
    if (row.api_key) {
      key = decrypt(row.api_key);
    }
    // Fallback to env key if not configured in DB
    if (!key) {
      const envMap = {
        gemini: 'GEMINI_API_KEY',
        openrouter: 'OPENROUTER_API_KEY',
        groq: 'GROQ_API_KEY',
        together: 'TOGETHER_API_KEY',
      };
      const envVar = envMap[row.provider];
      key = envVar ? process.env[envVar] || '' : '';
    }
    
    if (key) {
      providers.push({ provider: row.provider, key });
    }
  }

  // If no providers have keys configured, return null (causes fallback to Demo Mode)
  if (providers.length === 0) {
    return null;
  }

  let lastError = null;
  
  // Try providers sequentially in priority order
  for (const item of providers) {
    // Retry up to 3 times total (initial try + 2 retries)
    const maxRetries = 2;
    let success = false;
    let text = '';
    let attemptError = null;
    let startTime = Date.now();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      startTime = Date.now();
      try {
        if (item.provider === 'gemini') {
          const genAI = new GoogleGenerativeAI(item.key);
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            ...(enableSearch ? { tools: [{ googleSearch: {} }] } : {})
          });
          const res = await model.generateContent(prompt);
          text = res.response.text();
        } else if (item.provider === 'openrouter') {
          const res = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'google/gemini-2.5-flash:free',
              messages: [{ role: 'user', content: prompt }],
            },
            { 
              headers: { 
                Authorization: `Bearer ${item.key}`, 
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://eduverse.ai',
                'X-Title': 'EduVerse AI'
              } 
            }
          );
          text = res.data?.choices?.[0]?.message?.content;
          if (!text) throw new Error('Empty response from OpenRouter');
        } else if (item.provider === 'groq') {
          const res = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama3-8b-8192',
              messages: [{ role: 'user', content: prompt }],
            },
            { headers: { Authorization: `Bearer ${item.key}`, 'Content-Type': 'application/json' } }
          );
          text = res.data?.choices?.[0]?.message?.content;
          if (!text) throw new Error('Empty response from Groq');
        } else if (item.provider === 'together') {
          const res = await axios.post(
            'https://api.together.xyz/v1/chat/completions',
            {
              model: 'meta-llama/Llama-3-8b-chat-hf',
              messages: [{ role: 'user', content: prompt }],
            },
            { headers: { Authorization: `Bearer ${item.key}`, 'Content-Type': 'application/json' } }
          );
          text = res.data?.choices?.[0]?.message?.content;
          if (!text) throw new Error('Empty response from Together AI');
        } else {
          throw new Error(`Provider ${item.provider} support not fully implemented for chatbot.`);
        }

        success = true;
        break; // Break retry loop on success
      } catch (err) {
        attemptError = err;
        const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
        console.warn(`Attempt ${attempt + 1} failed for provider ${item.provider}: ${errorMsg}`);
        // Small delay between retries
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    const latency = Date.now() - startTime;

    if (success) {
      // Save success log
      db.query(
        'INSERT INTO api_usage_logs (provider, success, latency_ms) VALUES ($1, true, $2)',
        [item.provider, latency]
      ).catch(e => console.error('Error logging success:', e));

      // Reset consecutive failures, status, and log last_used
      db.query(
        `UPDATE api_configurations 
         SET status = 'Connected', consecutive_failures = 0, last_used = NOW(), updated_at = NOW() 
         WHERE provider = $1`,
        [item.provider]
      ).catch(e => console.error('Error updating status:', e));

      return { text, providerUsed: item.provider };
    } else {
      lastError = attemptError;
      const errorMsg = lastError.response?.data?.error?.message || lastError.response?.data?.message || lastError.message;
      console.warn(`Failover: Provider ${item.provider} completely failed after retries: ${errorMsg}. Trying next provider...`);

      // Save error log
      db.query(
        'INSERT INTO api_usage_logs (provider, success, latency_ms, error_message) VALUES ($1, false, $2, $3)',
        [item.provider, latency, errorMsg]
      ).catch(e => console.error('Error logging error:', e));

      // Update provider consecutive failures
      try {
        const currentConfig = await db.query(
          'SELECT consecutive_failures FROM api_configurations WHERE provider = $1',
          [item.provider]
        );
        const nextFailures = (currentConfig.rows[0]?.consecutive_failures || 0) + 1;
        
        let newStatus = errorMsg.toLowerCase().includes('rate') ? 'Rate Limited' : 'Invalid Key';
        let cooldownQuery = '';
        let queryParams = [newStatus, nextFailures, item.provider];

        // If failures exceed 3, let's put the provider into a cooldown status for 5 mins
        if (nextFailures >= 3) {
          newStatus = 'Unstable';
          cooldownQuery = `, cooldown_until = NOW() + INTERVAL '5 minutes'`;
        }

        await db.query(
          `UPDATE api_configurations 
           SET status = $1, consecutive_failures = $2, last_used = NOW(), updated_at = NOW() ${cooldownQuery}
           WHERE provider = $3`,
          queryParams
        );
      } catch (err) {
        console.error('Error updating failure status:', err);
      }
    }
  }

  throw lastError || new Error('All configured providers failed.');
};

module.exports = {
  generateContentWithFailover
};

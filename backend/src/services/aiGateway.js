const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');
const { decrypt } = require('../utils/crypto');

// Helper to decrypt keys securely
const getProviderConfig = async (providerName) => {
  const result = await db.query(
    'SELECT api_key, model_name, priority, disabled, status FROM api_configurations WHERE provider = $1',
    [providerName]
  );
  if (result.rows.length > 0) {
    const row = result.rows[0];
    let key = '';
    if (row.api_key) {
      try {
        key = decrypt(row.api_key);
      } catch (err) {
        console.error(`Failed to decrypt key for ${providerName}:`, err.message);
      }
    }
    // Env fallback if empty in DB
    if (!key) {
      const envMap = {
        gemini: 'GEMINI_API_KEY',
        openrouter: 'OPENROUTER_API_KEY',
        groq: 'GROQ_API_KEY',
        together: 'TOGETHER_API_KEY',
        deepgram: 'DEEPGRAM_API_KEY',
        elevenlabs: 'ELEVENLABS_API_KEY',
        assemblyai: 'ASSEMBLYAI_API_KEY',
        azure_speech: 'AZURE_SPEECH_KEY',
        openai: 'OPENAI_API_KEY',
        anthropic: 'ANTHROPIC_API_KEY'
      };
      const envVar = envMap[providerName];
      key = envVar ? process.env[envVar] || '' : '';
    }
    return {
      provider: providerName,
      key,
      modelName: row.model_name || '',
      disabled: row.disabled,
      priority: row.priority
    };
  }
  return null;
};

// Fetch active providers ordered by priority
const getActiveProviders = async (type = 'llm') => {
  const result = await db.query(
    `SELECT provider FROM api_configurations 
     WHERE disabled = false AND (cooldown_until IS NULL OR cooldown_until < NOW())
     ORDER BY priority ASC`
  );
  
  const providers = [];
  const llmTypes = ['gemini', 'openrouter', 'groq', 'together', 'custom', 'openai', 'anthropic'];
  const speechTypes = ['deepgram', 'assemblyai', 'elevenlabs', 'azure_speech'];

  for (const row of result.rows) {
    const isLLM = llmTypes.includes(row.provider);
    const isSpeech = speechTypes.includes(row.provider);

    if (type === 'llm' && isLLM) {
      const config = await getProviderConfig(row.provider);
      if (config && config.key) {
        providers.push(config);
      }
    } else if (type === 'speech' && isSpeech) {
      const config = await getProviderConfig(row.provider);
      if (config && config.key) {
        providers.push(config);
      }
    }
  }
  return providers;
};

const generateResponse = async (prompt, options = {}) => {
  let providers = await getActiveProviders('llm');
  if (options.provider) {
    const matched = providers.filter(p => p.provider === options.provider);
    if (matched.length > 0) {
      providers = matched;
    } else {
      const directConfig = await getProviderConfig(options.provider);
      if (directConfig && directConfig.key) {
        providers = [directConfig];
      }
    }
  }
  if (providers.length === 0) {
    throw new Error('No active AI providers configured.');
  }

  let lastError = null;
  const systemInstruction = options.systemInstruction || '';
  const finalPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;

  for (const item of providers) {
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
            model: item.modelName || 'gemini-2.0-flash',
            ...(options.enableSearch ? { tools: [{ googleSearch: {} }] } : {})
          });
          const res = await model.generateContent(finalPrompt);
          text = res.response.text();
        } else if (item.provider === 'openrouter') {
          const res = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: item.modelName && !item.modelName.includes('free') ? item.modelName : 'google/gemini-2.5-flash',
              messages: [{ role: 'user', content: finalPrompt }],
              max_tokens: 1500
            },
            { 
              headers: { 
                Authorization: `Bearer ${item.key}`, 
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://eduverse.ai',
                'X-Title': 'EduVerse AI'
              }, 
              timeout: 15000 
            }
          );
          text = res.data?.choices?.[0]?.message?.content;
          if (!text) throw new Error('Empty response from OpenRouter');
        } else if (item.provider === 'groq') {
          const res = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: item.modelName && item.modelName !== 'llama3-8b-8192' ? item.modelName : 'llama-3.1-8b-instant',
              messages: [{ role: 'user', content: finalPrompt }],
            },
            { headers: { Authorization: `Bearer ${item.key}`, 'Content-Type': 'application/json' }, timeout: 15000 }
          );
          text = res.data?.choices?.[0]?.message?.content;
          if (!text) throw new Error('Empty response from Groq');
        } else if (item.provider === 'together') {
          const res = await axios.post(
            'https://api.together.xyz/v1/chat/completions',
            {
              model: item.modelName || 'meta-llama/Llama-3-8b-chat-hf',
              messages: [{ role: 'user', content: finalPrompt }],
            },
            { headers: { Authorization: `Bearer ${item.key}`, 'Content-Type': 'application/json' }, timeout: 15000 }
          );
          text = res.data?.choices?.[0]?.message?.content;
          if (!text) throw new Error('Empty response from Together AI');
        } else if (item.provider === 'openai') {
          const res = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: item.modelName || 'gpt-4o-mini',
              messages: [{ role: 'user', content: finalPrompt }],
            },
            { headers: { Authorization: `Bearer ${item.key}`, 'Content-Type': 'application/json' }, timeout: 15000 }
          );
          text = res.data?.choices?.[0]?.message?.content;
          if (!text) throw new Error('Empty response from OpenAI');
        } else if (item.provider === 'anthropic') {
          const res = await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
              model: item.modelName || 'claude-3-5-sonnet-20241022',
              max_tokens: 1500,
              messages: [{ role: 'user', content: finalPrompt }],
            },
            { 
              headers: { 
                'x-api-key': item.key, 
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json' 
              }, 
              timeout: 15000 
            }
          );
          text = res.data?.content?.[0]?.text;
          if (!text) throw new Error('Empty response from Anthropic');
        } else if (item.provider === 'custom') {
          // Fallback / mock/ custom endpoint
          text = `[Custom Provider Response] ${prompt}`;
        } else {
          throw new Error(`Provider ${item.provider} support not implemented.`);
        }

        success = true;
        break; 
      } catch (err) {
        attemptError = err;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    const latency = Date.now() - startTime;

    if (success) {
      db.query(
        'INSERT INTO api_usage_logs (provider, success, latency_ms) VALUES ($1, true, $2)',
        [item.provider, latency]
      ).catch(e => console.error('Error logging success:', e));

      db.query(
        `UPDATE api_configurations 
         SET status = 'Connected', consecutive_failures = 0, last_used = NOW(), updated_at = NOW() 
         WHERE provider = $1`,
        [item.provider]
      ).catch(e => console.error('Error updating status:', e));

      return { text, providerUsed: item.provider, modelUsed: item.modelName };
    } else {
      lastError = attemptError;
      const errorMsg = lastError.response?.data?.error?.message || lastError.response?.data?.message || lastError.message;
      console.warn(`AI Gateway switching from failed provider ${item.provider}: ${errorMsg}`);

      db.query(
        'INSERT INTO api_usage_logs (provider, success, latency_ms, error_message) VALUES ($1, false, $2, $3)',
        [item.provider, latency, errorMsg]
      ).catch(e => console.error('Error logging error:', e));

      try {
        const currentConfig = await db.query(
          'SELECT consecutive_failures FROM api_configurations WHERE provider = $1',
          [item.provider]
        );
        const nextFailures = (currentConfig.rows[0]?.consecutive_failures || 0) + 1;
        let newStatus = errorMsg.toLowerCase().includes('rate') ? 'Rate Limited' : 'Offline';
        let cooldownQuery = '';
        if (nextFailures >= 3) {
          newStatus = 'Offline';
          cooldownQuery = `, cooldown_until = NOW() + INTERVAL '5 minutes'`;
        }
        await db.query(
          `UPDATE api_configurations 
           SET status = $1, consecutive_failures = $2, last_used = NOW(), updated_at = NOW() ${cooldownQuery}
           WHERE provider = $3`,
          [newStatus, nextFailures, item.provider]
        );
      } catch (err) {
        console.error('Error updating failure status:', err);
      }
    }
  }

  throw lastError || new Error('All configured AI providers failed.');
};

// Specialized AI Tasks
const generateQuiz = async (topic, difficulty, count) => {
  const prompt = `Generate a quiz on the topic "${topic}" with difficulty "${difficulty}".
  Provide exactly ${count} multiple choice questions.
  You MUST output ONLY a valid JSON object matching the following structure:
  {
    "title": "Quiz Title",
    "questions": [
      {
        "question": "Question text here?",
        "option_a": "Option A text",
        "option_b": "Option B text",
        "option_c": "Option C text",
        "option_d": "Option D text",
        "correct_answer": "a"
      }
    ]
  }
  Make sure correct_answer is lowercase ('a', 'b', 'c', or 'd'). Do not wrap in markdown tags or write conversational text. Output raw JSON.`;

  const res = await generateResponse(prompt);
  let text = res.text;
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    text = text.substring(jsonStart, jsonEnd + 1);
  }
  return JSON.parse(text);
};

const generateMockTest = async (subject, count) => {
  return generateQuiz(subject, 'medium', count);
};

const generateCodingSolution = async (problemDesc, language) => {
  const prompt = `Generate a complete, optimized coding solution in ${language} for the following problem description. Ensure code is commented, formatted, and include a short explanation of space/time complexities.\n\nDescription: ${problemDesc}`;
  const res = await generateResponse(prompt);
  return res.text;
};

const generateRoadmap = async (topic) => {
  const prompt = `Generate a detailed learning roadmap with step-by-step topics, resources, and weekly plan for mastering: "${topic}"`;
  const res = await generateResponse(prompt);
  return res.text;
};

const generateExplanation = async (concept) => {
  const prompt = `Explain this concept in simple terms with examples for a university student:\n\n${concept}`;
  const res = await generateResponse(prompt);
  return res.text;
};

const generateStudyPlan = async (profile) => {
  const prompt = `Generate a highly personalized study planner based on this profile: ${JSON.stringify(profile)}`;
  const res = await generateResponse(prompt);
  return res.text;
};

const generateInterviewQuestion = async (role, difficulty) => {
  const prompt = `Generate a challenging technical interview question, model answer, and scoring criteria for a ${role} position (${difficulty} level).`;
  const res = await generateResponse(prompt);
  return res.text;
};

const generateRecommendation = async (studentContext) => {
  const prompt = `Analyze this student learning profile context and provide exactly 3 specific bullet-point recommendations starting with protocol names:\n\n${studentContext}`;
  const res = await generateResponse(prompt);
  return res.text.split('\n').filter(line => line.trim().length > 0);
};

const generateAnalyticsInsight = async (metrics) => {
  const prompt = `Analyze student metrics and generate academic advisor summary insights: ${JSON.stringify(metrics)}`;
  const res = await generateResponse(prompt);
  return res.text;
};

// Voice / STT / TTS operations
const voiceAssistant = async (audioBuffer) => {
  const text = await speechToText(audioBuffer);
  const response = await generateResponse(text);
  const audioOut = await textToSpeech(response.text);
  return { text, response: response.text, audio: audioOut };
};

const speechToText = async (audioBuffer) => {
  const providers = await getActiveProviders('speech');
  const dg = providers.find(p => p.provider === 'deepgram');
  if (dg) {
    try {
      const response = await axios.post(
        'https://api.deepgram.com/v1/listen?model=nova-2',
        audioBuffer,
        {
          headers: {
            Authorization: `Token ${dg.key}`,
            'Content-Type': 'audio/wav',
          },
          timeout: 10000,
        }
      );
      const text = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      if (text) return text;
    } catch (err) {
      console.error('Deepgram transcription failed, attempting failover...', err.message);
    }
  }

  // Fallback to Azure Speech or simulated STT if no working provider
  const azure = providers.find(p => p.provider === 'azure_speech');
  if (azure) {
    // simulated azure speech recognition fallback
    return "[Azure Speech Recognition fallback stub]";
  }

  throw new Error('All configured speech-to-text providers failed or are not configured.');
};

const textToSpeech = async (text) => {
  const providers = await getActiveProviders('speech');
  const el = providers.find(p => p.provider === 'elevenlabs');
  if (el) {
    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
        { text, model_id: 'eleven_monolingual_v1' },
        {
          headers: {
            'xi-api-key': el.key,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout: 10000,
        }
      );
      return Buffer.from(response.data);
    } catch (err) {
      console.error('Elevenlabs TTS failed, trying failover...', err.message);
    }
  }

  throw new Error('All configured text-to-speech providers failed or are not configured.');
};

const futureAIRequest = async (params) => {
  return generateResponse(JSON.stringify(params));
};

module.exports = {
  generateResponse,
  generateQuiz,
  generateMockTest,
  generateCodingSolution,
  generateRoadmap,
  generateExplanation,
  generateStudyPlan,
  generateInterviewQuestion,
  generateRecommendation,
  generateAnalyticsInsight,
  voiceAssistant,
  speechToText,
  textToSpeech,
  futureAIRequest
};

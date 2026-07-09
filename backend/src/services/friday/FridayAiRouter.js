const axios = require('axios');
const aiGateway = require('../aiGateway');

class FridayAiRouter {
  /**
   * Router to find the best available LLM provider for a given task type
   * @param {string} taskType - 'reasoning' | 'coding' | 'vision' | 'document' | 'general'
   * @param {string} prompt - User query
   * @param {object} options - Optional parameters (e.g. image buffer)
   */
  async route(taskType, prompt, options = {}) {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    console.log(`[FridayAiRouter] Routing task: ${taskType} | Prompt snippet: "${prompt.slice(0, 30)}..."`);

    // 1. Coding or planning -> Prefer Claude if available
    if ((taskType === 'coding' || taskType === 'reasoning') && anthropicKey) {
      try {
        const response = await this.callClaude(prompt, options.systemInstruction);
        if (response) return { text: response, providerUsed: 'anthropic' };
      } catch (err) {
        console.warn('[FridayAiRouter] Claude call failed, falling back:', err.message);
      }
    }

    // 2. Vision or diagram tasks -> Prefer Gemini
    if (taskType === 'vision' && geminiKey) {
      try {
        // Integrate with Gemini SDK or direct fetch
        const response = await aiGateway.generateResponse(prompt, { provider: 'gemini' });
        if (response) return { text: response.text, providerUsed: 'gemini' };
      } catch (err) {
        console.warn('[FridayAiRouter] Gemini vision call failed, falling back:', err.message);
      }
    }

    // 3. Fallback: call the general generateResponse gateway which auto-cycles priority
    try {
      const response = await aiGateway.generateResponse(prompt, options);
      if (response) {
        return {
          text: response.text,
          providerUsed: response.providerUsed || 'aiGateway'
        };
      }
    } catch (gatewayErr) {
      console.warn('[FridayAiRouter] General Gateway failed, falling back to static offline rules:', gatewayErr.message);
    }

    // 4. Ultimate offline response fallback
    return {
      text: this.getOfflineRuleResponse(prompt),
      providerUsed: 'offline_rules'
    };
  }

  async callClaude(prompt, systemInstruction = '') {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemInstruction || 'You are Friday, an AI voice assistant.',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data?.content?.find(b => b.type === 'text')?.text || '';
  }

  getOfflineRuleResponse(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.includes('hello') || lower.includes('hey')) {
      return "Hello, Student. Friday online. How can I assist your studies today?";
    }
    if (lower.includes('explain') || lower.includes('what is')) {
      return "That topic relates to your course syllabus. Let me query the curriculum modules for you.";
    }
    return `Processed request: "${prompt}". System status normal.`;
  }
}

module.exports = new FridayAiRouter();

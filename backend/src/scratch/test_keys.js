require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

async function testGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.startsWith('your_')) {
    console.log('❌ Gemini: Key not configured or placeholder.');
    return;
  }
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('Respond with only the word: Success');
    console.log('✅ Gemini: Success! Response:', result.response.text().trim());
  } catch (err) {
    console.log('❌ Gemini: Error:', err.message);
  }
}

async function testGroq() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.startsWith('your_')) {
    console.log('❌ Groq: Key not configured.');
    return;
  }
  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Respond with only the word: Success' }]
      },
      { headers: { Authorization: `Bearer ${key}` }, timeout: 10000 }
    );
    console.log('✅ Groq: Success! Response:', res.data.choices[0].message.content.trim());
  } catch (err) {
    console.log('❌ Groq: Error:', err.response?.data?.error?.message || err.message);
  }
}

async function testOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.startsWith('your_')) {
    console.log('❌ OpenAI: Key not configured.');
    return;
  }
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Respond with only the word: Success' }]
      },
      { headers: { Authorization: `Bearer ${key}` }, timeout: 10000 }
    );
    console.log('✅ OpenAI: Success! Response:', res.data.choices[0].message.content.trim());
  } catch (err) {
    console.log('❌ OpenAI: Error:', err.response?.data?.error?.message || err.message);
  }
}

async function testAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || key.startsWith('your_')) {
    console.log('❌ Anthropic: Key not configured.');
    return;
  }
  try {
    const res = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Respond with only the word: Success' }]
      },
      { 
        headers: { 
          'x-api-key': key, 
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json' 
        }, 
        timeout: 10000 
      }
    );
    console.log('✅ Anthropic: Success! Response:', res.data.content[0].text.trim());
  } catch (err) {
    console.log('❌ Anthropic: Error:', err.response?.data?.error?.message || err.message);
  }
}

async function testElevenLabs() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key || key.startsWith('your_')) {
    console.log('❌ ElevenLabs: Key not configured.');
    return;
  }
  try {
    const res = await axios.get('https://api.elevenlabs.io/v1/models', {
      headers: { 'xi-api-key': key },
      timeout: 10000
    });
    console.log('✅ ElevenLabs: Success! Connection established.');
  } catch (err) {
    console.log('❌ ElevenLabs: Error:', err.response?.data?.detail?.message || err.message);
  }
}

(async () => {
  console.log('=== Testing Configured API Keys ===\n');
  await testGemini();
  await testGroq();
  await testOpenAI();
  await testAnthropic();
  await testElevenLabs();
  console.log('\n=== Testing Finished ===');
})();

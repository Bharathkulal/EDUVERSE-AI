require('dotenv').config();
const db = require('../config/db');
const aiGateway = require('../services/aiGateway');

(async () => {
  try {
    console.log('Resetting API configurations statuses and cooldowns...');
    await db.query(`
      UPDATE api_configurations 
      SET status = 'Connected', consecutive_failures = 0, cooldown_until = NULL;
    `);
    console.log('Successfully reset. Testing aiGateway response...');
    
    const res = await aiGateway.generateResponse('Hello, tell me what is Java in one sentence.');
    console.log('TEST RESULT SUCCESS:', res);
  } catch (err) {
    console.error('TEST RESULT FAILED:', err.message);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', JSON.stringify(err.response.data));
    }
  } finally {
    process.exit();
  }
})();

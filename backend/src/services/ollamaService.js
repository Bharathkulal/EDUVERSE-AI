const axios = require('axios');
const os = require('os');
const db = require('../config/db');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * Check if the local Ollama server is running.
 */
async function checkConnection() {
  console.log(`[Ollama Service] Checking connection to ${OLLAMA_URL}...`);
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 });
    return {
      connected: true,
      models: res.data.models || []
    };
  } catch (err) {
    console.error('[Ollama Service] Connection check failed:', err.message);
    return {
      connected: false,
      models: [],
      error: err.message
    };
  }
}

/**
 * Delete a model from local Ollama.
 */
async function deleteModel(name) {
  console.log(`[Ollama Service] Deleting model: ${name}...`);
  try {
    await axios.delete(`${OLLAMA_URL}/api/delete`, { data: { name } });
    return { success: true };
  } catch (err) {
    console.error(`[Ollama Service] Failed to delete model ${name}:`, err.message);
    throw new Error(err.message);
  }
}

/**
 * Read system-level hardware metrics.
 */
function getSystemMetrics() {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramUsageStr = `${(usedMem / (1024 * 1024 * 1024)).toFixed(1)} / ${(totalMem / (1024 * 1024 * 1024)).toFixed(1)} GB`;

    // Simple CPU Load Average calculation (percentage based on CPU cores)
    const cpus = os.cpus();
    const load = os.loadavg();
    const cpuLoadPct = Math.min(100, Math.round((load[0] / cpus.length) * 100)) || 0;

    return {
      cpu: cpuLoadPct,
      ram: ramUsageStr,
      gpu: 'Unavailable',
      vram: 'Unavailable'
    };
  } catch (err) {
    return {
      cpu: 0,
      ram: 'Unavailable',
      gpu: 'Unavailable',
      vram: 'Unavailable'
    };
  }
}

/**
 * Stream chat request to local Ollama and update DB messages.
 */
async function streamChat(sessionId, userMsgId, payload, res) {
  const { model, messages, options, file_url, parsed_text } = payload;
  const startTime = Date.now();

  console.log(`[Ollama Service] Starting streaming chat for session: ${sessionId} using model: ${model}`);

  try {
    // Send standard event-stream headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Compile message memory
    const ollamaMessages = [...messages];

    // If parsed text context from files exists, inject it into the final prompt
    if (parsed_text && ollamaMessages.length > 0) {
      const last = ollamaMessages[ollamaMessages.length - 1];
      if (last.role === 'user') {
        last.content = `[File Document Context]\n${parsed_text}\n\n[User Prompt]\n${last.content}`;
      }
    }

    const backendAbortController = new AbortController();

    // Listen for client connection close to clean up background model processing
    res.on('close', () => {
      console.log('[Ollama Service] Client closed connection. Aborting Ollama API call...');
      backendAbortController.abort();
    });

    // Call Ollama stream chat API
    const ollamaResponse = await axios.post(`${OLLAMA_URL}/api/chat`, {
      model: model || 'deepseek-r1:7b',
      messages: ollamaMessages,
      stream: true,
      options: options || { temperature: 0.7 }
    }, {
      responseType: 'stream',
      timeout: 120000,
      signal: backendAbortController.signal
    });

    let fullText = '';
    let tokenCount = 0;
    let streamBuffer = '';

    ollamaResponse.data.on('data', chunk => {
      streamBuffer += chunk.toString();
      const lines = streamBuffer.split('\n');
      streamBuffer = lines.pop(); // Save the last incomplete line for the next chunk

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const token = parsed.message?.content || '';
          fullText += token;
          tokenCount++;

          const elapsedSec = (Date.now() - startTime) / 1000;
          const tokensPerSec = elapsedSec > 0 ? (tokenCount / elapsedSec).toFixed(1) : '0';
          const sysMetrics = getSystemMetrics();

          // Send chunk back to the client along with actual performance metrics
          res.write(`data: ${JSON.stringify({
            type: 'token',
            token: token,
            metrics: {
              tokensSec: tokensPerSec,
              latency: Date.now() - startTime,
              cpu: sysMetrics.cpu,
              ram: sysMetrics.ram,
              gpu: sysMetrics.gpu,
              vram: sysMetrics.vram
            }
          })}\n\n`);
        } catch (e) {
          console.error('[Ollama Service] Parse error on line:', e.message);
        }
      }
    });

    ollamaResponse.data.on('end', async () => {
      console.log(`[Ollama Service] Completed generation. Saving assistant reply to DB.`);
      try {
        // Insert assistant reply into database
        const dbResult = await db.query(
          `INSERT INTO chat_messages (session_id, role, content, detected_metadata) 
           VALUES ($1, 'assistant', $2, $3) RETURNING *`,
          [sessionId, fullText, JSON.stringify({ provider: 'ollama', model })]
        );

        // Update session timestamp
        await db.query('UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1', [sessionId]);

        res.write(`data: ${JSON.stringify({ type: 'done', message: dbResult.rows[0] })}\n\n`);
      } catch (dbErr) {
        console.error('[Ollama Service] Database save error:', dbErr.message);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to persist message' })}\n\n`);
      }
      res.end();
    });

    ollamaResponse.data.on('error', err => {
      console.error('[Ollama Service] Ollama Stream error:', err.message);
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    });

  } catch (err) {
    console.error('[Ollama Service] Server stream error:', err.message);
    res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
    res.end();
  }
}

module.exports = {
  checkConnection,
  deleteModel,
  streamChat,
  getSystemMetrics
};

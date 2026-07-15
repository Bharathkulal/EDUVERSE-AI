/**
 * EduVerse Command AI — Intent Engine
 * Uses the existing /friday/chat backend (LLM) to parse natural language
 * into structured command intents. Falls back to regex matching offline.
 */

import api from '../api/axios';
import { COMMAND_REGISTRY, WAKE_WORDS } from './CommandRegistry';

const SYSTEM_PROMPT = `You are the EduVerse Command AI intent parser.
Your job is to classify user voice commands into structured intents.

Available intents:
${COMMAND_REGISTRY.map(c => `- ${c.intent}: ${c.description}`).join('\n')}

Rules:
1. Always respond with ONLY valid JSON — no markdown, no explanation.
2. Extract topic/subject parameters when present.
3. Confidence must be 0.0 to 1.0.
4. If intent is unknown use UNKNOWN with confidence < 0.5.
5. requires_confirmation must match the command definition.

Response format:
{
  "intent": "INTENT_NAME",
  "confidence": 0.95,
  "parameters": { "topic": "...", "subject": "...", "language": "..." },
  "response": "Short friendly voice response (max 15 words)",
  "requires_confirmation": false
}`;

/**
 * Parse a voice utterance into a structured intent using LLM.
 * @param {string} transcript - Raw voice input
 * @param {Object} memory - Current memory context
 * @returns {Promise<IntentResult>}
 */
export async function parseIntent(transcript, memory = {}) {
  const clean = transcript.trim().toLowerCase();

  // Skip empty input
  if (!clean || clean.length < 2) {
    return buildUnknown(transcript);
  }

  // Try LLM first
  try {
    const contextBlock = memory.lastIntent
      ? `\nPrevious intent: ${memory.lastIntent}\nUser: ${memory.userName || 'Student'}`
      : '';

    const { data } = await api.post('/friday/chat', {
      message: `Parse this voice command into a structured intent JSON.\nCommand: "${transcript}"${contextBlock}`,
      category: 'tutor',
      subject: '',
      _systemOverride: SYSTEM_PROMPT,
    });

    const raw = data.response || '';
    // Extract JSON from response (LLM may wrap in markdown)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.intent && typeof parsed.confidence === 'number') {
        return normalizeIntent(parsed, transcript);
      }
    }
  } catch {
    // LLM failed — fall through to regex matching
  }

  // Offline regex fallback
  return regexFallback(clean, transcript);
}

/**
 * Normalize and validate LLM-returned intent.
 */
function normalizeIntent(parsed, raw) {
  return {
    intent: parsed.intent || 'UNKNOWN',
    confidence: Math.min(1, Math.max(0, parsed.confidence ?? 0.5)),
    parameters: parsed.parameters || {},
    response: parsed.response || getDefaultResponse(parsed.intent),
    requires_confirmation: parsed.requires_confirmation ?? false,
    rawTranscript: raw,
    source: 'llm',
    timestamp: Date.now(),
  };
}

/**
 * Lightweight regex/keyword fallback for offline use.
 */
function regexFallback(clean, raw) {
  // Sort by phrase length desc so longer matches take priority
  const sorted = [...COMMAND_REGISTRY].sort(
    (a, b) => Math.max(...b.phrases.map(p => p.length)) - Math.max(...a.phrases.map(p => p.length))
  );

  for (const cmd of sorted) {
    for (const phrase of cmd.phrases) {
      if (clean.includes(phrase)) {
        // Extract topic — everything after the matched phrase
        const afterPhrase = clean.replace(phrase, '').trim();
        const topic = extractTopic(clean);

        return {
          intent: cmd.intent,
          confidence: 0.82,
          parameters: topic ? { topic } : {},
          response: cmd.responseTemplate.replace('{topic}', topic || ''),
          requires_confirmation: cmd.requiresConfirmation,
          rawTranscript: raw,
          source: 'regex',
          timestamp: Date.now(),
        };
      }
    }
  }

  return buildUnknown(raw);
}

/**
 * Extract topic from utterances like "teach me about stacks"
 */
function extractTopic(text) {
  const patterns = [
    /(?:teach me about|explain|what is|learn about|tell me about)\s+(.+)/i,
    /(?:quiz on|quiz about|test me on)\s+(.+)/i,
    /(?:notes on|notes for|generate notes for)\s+(.+)/i,
    /(?:open|go to|show me)\s+(.+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

function getDefaultResponse(intent) {
  const cmd = COMMAND_REGISTRY.find(c => c.intent === intent);
  return cmd?.responseTemplate || 'Done.';
}

function buildUnknown(raw) {
  return {
    intent: 'UNKNOWN',
    confidence: 0.1,
    parameters: {},
    response: "I didn't understand that. Try saying 'Help' for a list of commands.",
    requires_confirmation: false,
    rawTranscript: raw,
    source: 'fallback',
    timestamp: Date.now(),
  };
}

/**
 * Detect if a transcript contains a wake word.
 * @param {string} transcript
 * @returns {{ detected: boolean, cleanedTranscript: string }}
 */
export function detectWakeWord(transcript) {
  const lower = transcript.toLowerCase().trim();
  for (const ww of WAKE_WORDS) {
    if (lower.startsWith(ww) || lower === ww) {
      return {
        detected: true,
        cleanedTranscript: lower.replace(ww, '').trim(),
      };
    }
    // Also check if wake word appears anywhere (for ambient detection)
    if (lower.includes(ww)) {
      return {
        detected: true,
        cleanedTranscript: lower.replace(ww, '').trim(),
      };
    }
  }
  return { detected: false, cleanedTranscript: transcript };
}

/**
 * @typedef {Object} IntentResult
 * @property {string}  intent
 * @property {number}  confidence
 * @property {Object}  parameters
 * @property {string}  response
 * @property {boolean} requires_confirmation
 * @property {string}  rawTranscript
 * @property {'llm'|'regex'|'fallback'} source
 * @property {number}  timestamp
 */

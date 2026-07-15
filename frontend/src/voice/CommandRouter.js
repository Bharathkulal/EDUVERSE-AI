/**
 * EduVerse Command AI — Command Router
 * Matches the parsed intent to the correct agent in the registry and triggers execution.
 */

import { COMMAND_REGISTRY } from './CommandRegistry';
import { ALL_AGENTS } from './agents/Agents';
import { checkPermission } from './PermissionChecker';
import MemoryStore from './MemoryStore';

/**
 * Route and execute the parsed voice command.
 * @param {import('./IntentEngine').IntentResult} intentResult - The parsed intent object
 * @param {string} userRole - User's current role ('student', 'teacher', 'admin')
 * @returns {Promise<RouterResult>}
 */
export async function routeCommand(intentResult, userRole = 'student') {
  const { intent, parameters, confidence } = intentResult;

  // 1. Permission check
  const permCheck = checkPermission(intent, userRole);
  if (!permCheck.allowed) {
    return {
      success: false,
      response: permCheck.error || 'Access Denied.',
      error: 'PERMISSION_DENIED'
    };
  }

  // 2. Find matching command in registry to get agent name
  const commandDef = COMMAND_REGISTRY.find(c => c.intent === intent);
  
  if (!commandDef) {
    if (intent === 'UNKNOWN') {
      return {
        success: false,
        response: intentResult.response || "I didn't catch that command. Could you try again?",
        error: 'UNKNOWN_INTENT'
      };
    }
    return {
      success: false,
      response: 'Command not recognized in registry.',
      error: 'UNREGISTERED'
    };
  }

  // 3. Find the target agent
  const agentName = commandDef.agent;
  const targetAgent = ALL_AGENTS.find(agent => agent.constructor.name === agentName || agent[agentName] || Object.keys(ALL_AGENTS).some(() => {
    // Fallback checks for direct matching
    return true; 
  }));

  // Iterate over agents and run execution
  let executionResult = null;
  for (const agent of ALL_AGENTS) {
    const res = agent.execute(intent, parameters, MemoryStore.getFullContext());
    if (res) {
      executionResult = res;
      break;
    }
  }

  if (!executionResult) {
    return {
      success: false,
      response: `Failed to execute agent action for ${intent}.`,
      error: 'AGENT_EXECUTION_FAILED'
    };
  }

  // 4. Update memory store with successful command run
  MemoryStore.setLastIntent(intent);
  MemoryStore.addCommandHistory({
    intent,
    transcript: intentResult.rawTranscript,
    response: executionResult.response,
    timestamp: Date.now()
  });

  return {
    success: true,
    intent,
    action: executionResult.action,
    route: executionResult.route,
    state: executionResult.state,
    payload: executionResult.payload,
    response: executionResult.response || commandDef.responseTemplate,
    requiresConfirmation: commandDef.requiresConfirmation
  };
}

/**
 * @typedef {Object} RouterResult
 * @property {boolean} success
 * @property {string}  [intent]
 * @property {'NAVIGATE'|'ACTION'|'TRIGGER_RESUME_DOWNLOAD'|'TUTOR_TEACH'|'STOP_VOICE'} [action]
 * @property {string}  [route]
 * @property {Object}  [state]
 * @property {Object}  [payload]
 * @property {string}  response
 * @property {boolean} [requiresConfirmation]
 * @property {string}  [error]
 */

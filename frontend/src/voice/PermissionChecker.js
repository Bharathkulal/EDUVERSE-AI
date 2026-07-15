/**
 * EduVerse Command AI — Permission Checker
 * Ensures role-based security (student, teacher, admin) for voice command execution.
 */

import { COMMAND_REGISTRY } from './CommandRegistry';

/**
 * Validates if a user role is authorized to run a specific command.
 * @param {string} intent - The intent identifier
 * @param {string} userRole - User's current role ('student', 'teacher', 'admin')
 * @returns {{ allowed: boolean, error?: string }}
 */
export function checkPermission(intent, userRole) {
  const normalizedRole = (userRole || 'student').toLowerCase();
  
  // Find the command in registry
  const command = COMMAND_REGISTRY.find(c => c.intent === intent);
  
  if (!command) {
    // If the command is not registered, deny for safety unless it's UNKNOWN
    if (intent === 'UNKNOWN') {
      return { allowed: true };
    }
    return { allowed: false, error: 'Command not registered in voice registry.' };
  }

  // Check if role matches whitelist
  const isAllowed = command.roles.includes(normalizedRole);

  if (!isAllowed) {
    return { 
      allowed: false, 
      error: `Access Denied. The command "${command.intent}" requires ${command.roles.join(' or ')} permissions, but you are logged in as a ${normalizedRole}.` 
    };
  }

  return { allowed: true };
}

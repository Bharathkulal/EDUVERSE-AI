import toast from 'react-hot-toast';

let googleAuthAvailable = false;
let githubAuthAvailable = false;
let isInitialized = false;

/**
 * Validates frontend environment variables on startup.
 * Logs status in the developer console.
 */
export function validateEnvironment() {
  if (isInitialized) return { googleAuthAvailable, githubAuthAvailable };
  isInitialized = true;

  console.log("%c=== [EDUVERSE AI] ENVIRONMENT VALIDATION ===", "color: #3b82f6; font-weight: bold;");

  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.error("%c❌ VITE_API_URL is missing! Backend integration will fail.", "color: #ef4444; font-weight: bold;");
  } else {
    console.log(`%c✔ VITE_API_URL detected: ${apiUrl}`, "color: #10b981;");
  }

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    console.warn("%c⚠ VITE_GOOGLE_CLIENT_ID is missing. Google Sign-In requires VITE_GOOGLE_CLIENT_ID in frontend/.env", "color: #f59e0b;");
    googleAuthAvailable = false;
  } else {
    console.log("%c✔ VITE_GOOGLE_CLIENT_ID detected.", "color: #10b981;");
    googleAuthAvailable = true;
  }

  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  if (!githubClientId) {
    console.warn("%c⚠ VITE_GITHUB_CLIENT_ID is missing. GitHub Sign-In requires VITE_GITHUB_CLIENT_ID in frontend/.env", "color: #f59e0b;");
    githubAuthAvailable = false;
  } else {
    console.log("%c✔ VITE_GITHUB_CLIENT_ID detected.", "color: #10b981;");
    githubAuthAvailable = true;
  }

  console.log("%c===========================================", "color: #3b82f6;");
  return { googleAuthAvailable, githubAuthAvailable };
}

/**
 * Check if Google Authentication Client ID is set.
 */
export function isGoogleAuthAvailable() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return Boolean(googleClientId && googleClientId.trim().length > 0);
}

/**
 * Check if GitHub Authentication Client ID is set.
 */
export function isGitHubAuthAvailable() {
  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  return Boolean(githubClientId && githubClientId.trim().length > 0);
}

/**
 * Developer diagnostic function for Google OAuth environment check.
 */
export function showGoogleUnavailableWarning() {
  console.warn("[OAuth Audit] VITE_GOOGLE_CLIENT_ID is not configured in frontend/.env.");
}

/**
 * Developer diagnostic function for GitHub OAuth environment check.
 */
export function showGitHubUnavailableWarning() {
  console.warn("[OAuth Audit] VITE_GITHUB_CLIENT_ID is not configured in frontend/.env.");
}



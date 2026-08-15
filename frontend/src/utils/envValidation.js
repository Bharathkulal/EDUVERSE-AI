import toast from 'react-hot-toast';

let googleAuthAvailable = false;
let githubAuthAvailable = false;
let isInitialized = false;
let googleWarningShown = false;
let githubWarningShown = false;

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
    console.warn("%c⚠ VITE_GOOGLE_CLIENT_ID is missing. Google Sign-In will be disabled.", "color: #f59e0b;");
    googleAuthAvailable = false;
  } else {
    console.log("%c✔ VITE_GOOGLE_CLIENT_ID detected.", "color: #10b981;");
    googleAuthAvailable = true;
  }

  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  if (!githubClientId) {
    console.warn("%c⚠ VITE_GITHUB_CLIENT_ID is missing. GitHub Sign-In will be disabled.", "color: #f59e0b;");
    githubAuthAvailable = false;
  } else {
    console.log("%c✔ VITE_GITHUB_CLIENT_ID detected.", "color: #10b981;");
    githubAuthAvailable = true;
  }

  console.log("%c===========================================", "color: #3b82f6;");
  return { googleAuthAvailable, githubAuthAvailable };
}

/**
 * Check if Google Authentication is fully configured.
 */
export function isGoogleAuthAvailable() {
  if (!isInitialized) {
    validateEnvironment();
  }
  return googleAuthAvailable;
}

/**
 * Check if GitHub Authentication is fully configured.
 */
export function isGitHubAuthAvailable() {
  if (!isInitialized) {
    validateEnvironment();
  }
  return githubAuthAvailable;
}

/**
 * Triggers a singleton error notification indicating Google OAuth is unconfigured.
 */
export function showGoogleUnavailableWarning() {
  if (googleWarningShown) return;
  googleWarningShown = true;

  toast.error("Google Sign-In is currently unavailable.", {
    id: "google-client-id-missing-warning", // Unique ID ensures toast is a singleton
    duration: 5000,
    style: {
      background: '#0f111a',
      color: '#fff',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }
  });

  setTimeout(() => {
    googleWarningShown = false;
  }, 6000);
}

/**
 * Triggers a singleton error notification indicating GitHub OAuth is unconfigured.
 */
export function showGitHubUnavailableWarning() {
  if (githubWarningShown) return;
  githubWarningShown = true;

  toast.error("GitHub Sign-In is currently unavailable.", {
    id: "github-client-id-missing-warning", // Unique ID ensures toast is a singleton
    duration: 5000,
    style: {
      background: '#0f111a',
      color: '#fff',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }
  });

  setTimeout(() => {
    githubWarningShown = false;
  }, 6000);
}

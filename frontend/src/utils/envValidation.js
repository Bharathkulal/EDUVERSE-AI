import toast from 'react-hot-toast';

let googleAuthAvailable = false;
let isInitialized = false;
let warningShown = false;

/**
 * Validates frontend environment variables on startup.
 * Logs status in the developer console.
 */
export function validateEnvironment() {
  if (isInitialized) return { googleAuthAvailable };
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

  console.log("%c===========================================", "color: #3b82f6;");
  return { googleAuthAvailable };
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
 * Triggers a singleton error notification indicating Google OAuth is unconfigured.
 */
export function showGoogleUnavailableWarning() {
  if (warningShown) return;
  warningShown = true;

  toast.error("Google Sign-In is currently unavailable.", {
    id: "google-client-id-missing-warning", // Unique ID ensures toast is a singleton and never duplicated
    duration: 5000,
    style: {
      background: '#0f111a',
      color: '#fff',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }
  });

  // Reset flag after 6 seconds to allow re-notifying if requested again later
  setTimeout(() => {
    warningShown = false;
  }, 6000);
}

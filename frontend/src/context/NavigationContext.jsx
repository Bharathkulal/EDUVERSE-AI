/**
 * NavigationHistoryContext — EduVerse AI
 *
 * Provides a centralized, persistent navigation history stack.
 * - Tracks every route change automatically
 * - Persists history in sessionStorage (survives refresh)
 * - Exposes goBack(), canGoBack, and clearHistory()
 * - Supports Alt+ArrowLeft keyboard shortcut globally
 * - History is cleared on logout
 */

import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationHistoryContext = createContext(null);

const SESSION_KEY = 'ev_nav_history';

// Paths that are "roots" — navigating to them resets history above them
const ROOT_PATHS = new Set([
  '/',
  '/dashboard',
  '/subjects',
  '/practice-hub',
  '/quizzes',
  '/coding',
  '/ai-tutor',
  '/chat-learn',
  '/progress',
  '/certificates',
  '/study-report',
  '/ml-analytics',
  '/ai-profile',
  '/question-bank',
  '/voice-assistant',
  '/settings',
  '/community',
  '/career-hub',
  '/it-suite',
  '/techverse',
  '/foc',
  '/typing-quest',
  '/coding-battle',
  '/dsa/stack',
  '/dsa/queue',
  '/dsa/linked-list',
  '/dsa/tree',
  '/dsa/graph',
  '/dsa/sorting',
  '/dsa/searching',
  '/admin',
]);

/** Read history stack from sessionStorage */
function readStack() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persist history stack to sessionStorage */
function writeStack(stack) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(stack));
  } catch {
    // sessionStorage full or unavailable — fail silently
  }
}

export function NavigationHistoryProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  // Use a ref so we can access latest stack inside event handlers without re-renders
  const stackRef = useRef(readStack());

  // ── Track route changes ──────────────────────────────────────────────────
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const stack = stackRef.current;

    // Skip if same as top of stack (prevents double-push on strict mode)
    if (stack.length > 0 && stack[stack.length - 1] === currentPath) {
      return;
    }

    let newStack;

    // If navigating to a root, trim the stack so root is the new bottom
    // This prevents the stack from growing unboundedly and keeps roots clean
    if (ROOT_PATHS.has(location.pathname)) {
      // Keep everything up to and including any previous occurrence of this root
      const existingIdx = stack.lastIndexOf(currentPath);
      if (existingIdx !== -1) {
        // Trim to that position + 1
        newStack = stack.slice(0, existingIdx + 1);
      } else {
        // Push root onto stack — it becomes a "checkpoint"
        newStack = [...stack, currentPath];
      }
    } else {
      // Regular sub-page: just push
      newStack = [...stack, currentPath];
    }

    stackRef.current = newStack;
    writeStack(newStack);
  }, [location.pathname, location.search]);

  // ── goBack ───────────────────────────────────────────────────────────────
  const goBack = useCallback(() => {
    const stack = stackRef.current;

    if (stack.length >= 2) {
      // Pop current page, navigate to previous
      const newStack = stack.slice(0, stack.length - 1);
      const previousPath = newStack[newStack.length - 1];
      stackRef.current = newStack;
      writeStack(newStack);
      navigate(previousPath);
    } else {
      // Fallback: use browser history (handles direct-URL scenarios)
      navigate(-1);
    }
  }, [navigate]);

  // ── canGoBack ────────────────────────────────────────────────────────────
  const canGoBack = stackRef.current.length > 1;

  // ── clearHistory ─────────────────────────────────────────────────────────
  const clearHistory = useCallback(() => {
    stackRef.current = [];
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // ── Alt+ArrowLeft keyboard shortcut ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        if (stackRef.current.length > 1) {
          goBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack]);

  const value = { goBack, canGoBack, clearHistory, stack: stackRef.current };

  return (
    <NavigationHistoryContext.Provider value={value}>
      {children}
    </NavigationHistoryContext.Provider>
  );
}

/** Hook to consume the navigation history context */
export function useNavHistory() {
  const ctx = useContext(NavigationHistoryContext);
  if (!ctx) {
    throw new Error('useNavHistory must be used inside <NavigationHistoryProvider>');
  }
  return ctx;
}

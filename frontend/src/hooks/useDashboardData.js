/**
 * useDashboardData.js
 * Production-grade dashboard data hook.
 *
 * Features:
 *  - Guest mode: skips all API calls, returns rich demo data instantly
 *  - LocalStorage cache: stale-while-revalidate for instant loads
 *  - Per-endpoint safeGet with 3x exponential backoff (1s -> 2s -> 4s)
 *  - Silent 60-second auto-refresh
 *  - Online / offline detection with automatic re-sync
 *  - Structured diagnostic logging
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const CACHE_KEY_PREFIX   = 'eduverse_dashboard_cache_';
const CACHE_TTL_MS       = 5 * 60 * 1000;   // 5 minutes
const AUTO_REFRESH_MS    = 60 * 1000;        // 60 seconds
const REQUEST_TIMEOUT_MS = 10 * 1000;        // 10 seconds
const MAX_RETRIES        = 3;

// ---------------------------------------------------------------------------
// RICH DEMO DATA (Guest / Offline fallback)
// ---------------------------------------------------------------------------
export const DEMO_DASHBOARD_DATA = {
  profile: { xp: 1850, streak: 7 },
  completedLessons: 24,
  studyHours: 18.5,
  quizScores: { average: 78 },
  codingScores: { average: 82 },
  recentQuizzes: [
    { score: 85, title: 'Python Basics',    submitted_at: new Date(Date.now() - 86400000).toISOString() },
    { score: 72, title: 'Data Structures',  submitted_at: new Date(Date.now() - 172800000).toISOString() },
    { score: 91, title: 'Web Fundamentals', submitted_at: new Date(Date.now() - 259200000).toISOString() },
    { score: 67, title: 'Algorithms 101',   submitted_at: new Date(Date.now() - 345600000).toISOString() },
  ],
};

export const DEMO_ANALYTICS_DATA = {
  currentSubject:           'Data Structures & Algorithms',
  currentTopicName:         'Binary Search Trees',
  nextRecommendedTopicName: 'Graph Traversal',
  completedTopicsCount:     16,
  totalTopicsCount:         40,
  aiSummary: 'You are excelling at Python and OOP concepts! Focus more on Dynamic Programming to improve your overall DSA score.',
  subjectProgress: [
    { name: 'Python Fundamentals', percentage: 70, completedTopics: 14, totalTopics: 20 },
    { name: 'Data Structures',     percentage: 40, completedTopics: 8,  totalTopics: 20 },
    { name: 'Web Development',     percentage: 55, completedTopics: 11, totalTopics: 20 },
    { name: 'Algorithms',          percentage: 30, completedTopics: 6,  totalTopics: 20 },
  ],
  weaknesses: 'Dynamic Programming',
  strengths:  'Python & OOP',
  studyTimeStats: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    data:   [1.5, 2.0, 0.5, 3.0, 1.0, 2.5, 1.8],
  },
  roadmap: [
    { subject: 'DSA', title: 'Arrays',             status: 'Completed'   },
    { subject: 'DSA', title: 'Linked Lists',        status: 'Completed'   },
    { subject: 'DSA', title: 'Binary Search Trees', status: 'In Progress' },
    { subject: 'DSA', title: 'Graph Traversal',     status: 'Pending'     },
    { subject: 'DSA', title: 'Dynamic Programming', status: 'Pending'     },
  ],
};

export const DEMO_GOALS = [
  { id: 1, title: 'Complete DSA module',          priority: 'high',   completed: false, xp_reward: 40 },
  { id: 2, title: 'Practice 5 coding challenges', priority: 'medium', completed: true,  xp_reward: 20 },
  { id: 3, title: 'Review Python OOP concepts',   priority: 'low',    completed: false, xp_reward: 10 },
  { id: 4, title: 'Read Graph Traversal theory',  priority: 'medium', completed: false, xp_reward: 20 },
];

export const DEMO_LEADERBOARD = [
  { id: 1, name: 'Alex Johnson',  totalXp: 4200, streak: 21, isCurrentUser: false },
  { id: 2, name: 'Priya Sharma',  totalXp: 3850, streak: 15, isCurrentUser: false },
  { id: 3, name: 'Marcus Chen',   totalXp: 3400, streak: 12, isCurrentUser: false },
  { id: 4, name: 'Sofia Rahman',  totalXp: 2900, streak: 9,  isCurrentUser: false },
  { id: 5, name: 'Guest Learner', totalXp: 1850, streak: 7,  isCurrentUser: true  },
];

export const DEMO_HEATMAP = Array.from({ length: 60 }, (_, i) => ({
  date:  new Date(Date.now() - i * 86400000).toISOString(),
  count: i % 7 === 0 ? 0 : Math.floor(Math.random() * 5) + 1,
}));

// ---------------------------------------------------------------------------
// DIAGNOSTIC LOGGER
// ---------------------------------------------------------------------------
const log = (level, msg, data = {}) => {
  const ts = new Date().toISOString();
  const style = level === 'error' ? 'color:#f87171' : level === 'warn' ? 'color:#fbbf24' : 'color:#a78bfa';
  if (level === 'error') console.error(`%c[Dashboard] ${ts} - ${msg}`, style, data);
  else if (level === 'warn') console.warn(`%c[Dashboard] ${ts} - ${msg}`, style, data);
  else console.log(`%c[Dashboard] ${ts} - ${msg}`, style, data);
};

// ---------------------------------------------------------------------------
// LOCAL STORAGE CACHE
// ---------------------------------------------------------------------------
const readCache = (userId) => {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + (userId || 'guest'));
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL_MS) return null;
    return data;
  } catch { return null; }
};

const writeCache = (userId, data) => {
  try {
    localStorage.setItem(
      CACHE_KEY_PREFIX + (userId || 'guest'),
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch { /* storage quota exceeded - ignore */ }
};

// ---------------------------------------------------------------------------
// SAFE GET WITH EXPONENTIAL BACKOFF
// ---------------------------------------------------------------------------
const safeGet = async (endpoint, fallback) => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const t0 = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const res = await api.get(endpoint, { signal: controller.signal });
      clearTimeout(timer);
      log('info', `GET ${endpoint} OK`, { status: res.status, ms: Date.now() - t0, attempt });
      return res.data;
    } catch (err) {
      const ms = Date.now() - t0;
      const isLast = attempt === MAX_RETRIES;
      log(isLast ? 'error' : 'warn',
        `GET ${endpoint} failed (attempt ${attempt}/${MAX_RETRIES})`,
        { error: err.message, ms, nextIn: isLast ? 'giving up' : `${2 ** (attempt - 1)}s` }
      );
      if (!isLast) {
        await new Promise(r => setTimeout(r, 1000 * (2 ** (attempt - 1))));
      }
    }
  }
  log('warn', `Using fallback for ${endpoint}`);
  return fallback;
};

// ---------------------------------------------------------------------------
// MAIN HOOK
// ---------------------------------------------------------------------------
export function useDashboardData(user) {
  const isGuest = user?.isGuest === true;
  const userId  = user?.id;

  const [state, setState] = useState({
    dbData:      null,
    analytics:   null,
    goals:       [],
    leaderboard: [],
    heatmapData: [],
    itDocs:      [],
    loading:     true,
    error:       null,
    isStale:     false,
    lastRefresh: null,
    isGuest,
    isOffline:   typeof navigator !== 'undefined' ? !navigator.onLine : false,
  });

  const isFetchingRef = useRef(false);
  const mountedRef    = useRef(true);
  const timerRef      = useRef(null);

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const authToken = localStorage.getItem('token');
    log('info', 'Dashboard fetch started', {
      guestMode: isGuest,
      hasToken: !!authToken,
      tokenValue: authToken === 'guest_token_session' ? 'guest' : 'real',
      silent,
      userId,
      online: navigator.onLine,
    });

    // GUEST MODE - never hit real APIs
    if (isGuest || !authToken || authToken === 'guest_token_session') {
      log('info', 'Guest mode: loading demo data');
      if (!silent) await new Promise(r => setTimeout(r, 350));
      if (!mountedRef.current) { isFetchingRef.current = false; return; }
      setState({
        dbData:      DEMO_DASHBOARD_DATA,
        analytics:   DEMO_ANALYTICS_DATA,
        goals:       DEMO_GOALS,
        leaderboard: DEMO_LEADERBOARD,
        heatmapData: DEMO_HEATMAP,
        itDocs:      [],
        loading:     false,
        error:       null,
        isStale:     false,
        lastRefresh: new Date(),
        isGuest:     true,
        isOffline:   !navigator.onLine,
      });
      isFetchingRef.current = false;
      return;
    }

    // SHOW STALE CACHE while fetching fresh data
    if (!silent) {
      const cached = readCache(userId);
      if (cached) {
        log('info', 'Rendering cached data while fetching fresh');
        setState(prev => ({ ...prev, ...cached, loading: false, isStale: true }));
      }
    }

    // OFFLINE - use cache only
    if (!navigator.onLine) {
      log('warn', 'Offline - serving cache');
      const cached = readCache(userId);
      const data = cached || {
        dbData: DEMO_DASHBOARD_DATA, analytics: DEMO_ANALYTICS_DATA,
        goals: DEMO_GOALS, leaderboard: DEMO_LEADERBOARD,
        heatmapData: DEMO_HEATMAP, itDocs: [],
      };
      setState(prev => ({ ...prev, ...data, loading: false, error: null, isStale: false, isOffline: true, lastRefresh: new Date() }));
      isFetchingRef.current = false;
      return;
    }

    // REAL API CALLS - all individually safe, never block each other
    try {
      const [dbData, analytics, goals, leaderboardRes, heatmapRes, itRes] = await Promise.all([
        safeGet('/progress/dashboard',   DEMO_DASHBOARD_DATA),
        safeGet('/progress/analytics',   DEMO_ANALYTICS_DATA),
        safeGet('/progress/goals',       DEMO_GOALS),
        safeGet('/progress/leaderboard', { leaderboard: DEMO_LEADERBOARD }),
        safeGet('/progress/heatmap',     { heatmapData: DEMO_HEATMAP }),
        safeGet('/it-suite/files',       { documents: [] }),
      ]);

      if (!mountedRef.current) { isFetchingRef.current = false; return; }

      const fresh = {
        dbData,
        analytics,
        goals:       Array.isArray(goals) ? goals : DEMO_GOALS,
        leaderboard: leaderboardRes?.leaderboard || DEMO_LEADERBOARD,
        heatmapData: heatmapRes?.heatmapData     || DEMO_HEATMAP,
        itDocs:      itRes?.documents             || [],
      };

      writeCache(userId, fresh);
      setState(prev => ({
        ...prev, ...fresh,
        loading: false, error: null, isStale: false,
        lastRefresh: new Date(), isOffline: false,
      }));
      log('info', 'Dashboard loaded successfully', { userId });
    } catch (err) {
      // belt-and-suspenders: safeGet should never reject
      log('error', 'Unexpected error', { msg: err.message });
      if (!mountedRef.current) { isFetchingRef.current = false; return; }
      const cached = readCache(userId);
      const fallback = cached || {
        dbData: DEMO_DASHBOARD_DATA, analytics: DEMO_ANALYTICS_DATA,
        goals: DEMO_GOALS, leaderboard: DEMO_LEADERBOARD,
        heatmapData: DEMO_HEATMAP, itDocs: [],
      };
      setState(prev => ({ ...prev, ...fallback, loading: false, error: null, isStale: !!cached, lastRefresh: new Date() }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [isGuest, userId]);

  // Initial load
  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  // Auto-refresh every 60s (only when tab is visible)
  useEffect(() => {
    if (!user) return;
    timerRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        log('info', 'Auto-refresh (60s interval)');
        fetchData({ silent: true });
      }
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchData, user]);

  // Online / offline events
  useEffect(() => {
    const onOnline = () => {
      log('info', 'Back online - syncing');
      setState(prev => ({ ...prev, isOffline: false }));
      fetchData({ silent: true });
    };
    const onOffline = () => {
      log('warn', 'Went offline');
      setState(prev => ({ ...prev, isOffline: true }));
    };
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [fetchData]);

  const refresh = useCallback(() => fetchData({ silent: false }), [fetchData]);
  return { ...state, refresh };
}

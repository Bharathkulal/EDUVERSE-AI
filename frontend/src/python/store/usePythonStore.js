/**
 * usePythonStore — Zustand store for Python course progress
 * Persists to localStorage so progress survives page refreshes.
 */
import { create } from 'zustand';

// Simple localStorage persistence helper (no middleware needed)
const load = () => {
  try {
    const raw = localStorage.getItem('eduverse_python_progress');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const save = (state) => {
  try {
    localStorage.setItem('eduverse_python_progress', JSON.stringify(state));
  } catch { /* ignore quota errors */ }
};

const usePythonStore = create((set, get) => {
  const saved = load();
  return {
    // ─── State ──────────────────────────────────────────────────
    completedLessons: saved.completedLessons || [],   // array of slugs
    lessonProgress:   saved.lessonProgress   || {},   // slug → 0–100
    quizScores:       saved.quizScores       || {},   // slug → score (0–100)
    xpEarned:         saved.xpEarned         || 0,
    bookmarks:        saved.bookmarks        || {},   // slug → scriptStep index
    watchPercent:     saved.watchPercent     || {},   // slug → 0–100
    activeLesson:     null,                           // current lesson object

    // ─── Actions ────────────────────────────────────────────────

    setActiveLesson: (lesson) => set({ activeLesson: lesson }),

    /** Mark a specific lesson as fully completed & award XP */
    completeLesson: (slug, xp) => {
      const s = get();
      if (s.completedLessons.includes(slug)) return; // already done
      const next = {
        completedLessons: [...s.completedLessons, slug],
        lessonProgress:   { ...s.lessonProgress, [slug]: 100 },
        xpEarned: s.xpEarned + xp,
      };
      set(next);
      save({ ...s, ...next });
    },

    /** Update progress percentage (0–100) for a lesson */
    updateProgress: (slug, percent) => {
      const s = get();
      const lessonProgress = { ...s.lessonProgress, [slug]: Math.min(100, Math.max(0, percent)) };
      set({ lessonProgress });
      save({ ...s, lessonProgress });
    },

    /** Store quiz score and optionally award XP bonus */
    saveQuizScore: (slug, score, xpBonus = 0) => {
      const s = get();
      const prev = s.quizScores[slug] || 0;
      const quizScores = { ...s.quizScores, [slug]: Math.max(prev, score) };
      const xpEarned = score > prev ? s.xpEarned + xpBonus : s.xpEarned;
      set({ quizScores, xpEarned });
      save({ ...s, quizScores, xpEarned });
    },

    /** Save/load playback bookmark (script step index) */
    saveBookmark: (slug, step) => {
      const s = get();
      const bookmarks = { ...s.bookmarks, [slug]: step };
      set({ bookmarks });
      save({ ...s, bookmarks });
    },

    getBookmark: (slug) => get().bookmarks[slug] || 0,

    /** Update how much of the lesson "video" has been watched */
    updateWatchPercent: (slug, percent) => {
      const s = get();
      const watchPercent = { ...s.watchPercent, [slug]: Math.max(s.watchPercent[slug] || 0, percent) };
      set({ watchPercent });
      save({ ...s, watchPercent });
    },

    /** Reset all progress (used in settings / debug) */
    resetAll: () => {
      localStorage.removeItem('eduverse_python_progress');
      set({
        completedLessons: [],
        lessonProgress:   {},
        quizScores:       {},
        xpEarned:         0,
        bookmarks:        {},
        watchPercent:     {},
      });
    },

    // ─── Selectors (computed) ────────────────────────────────────

    isCompleted: (slug) => get().completedLessons.includes(slug),
    getProgress: (slug) => get().lessonProgress[slug] || 0,
    getQuizScore: (slug) => get().quizScores[slug] || null,

    getTotalXP: () => get().xpEarned,

    getOverallProgress: (lessons) => {
      const { completedLessons } = get();
      if (!lessons.length) return 0;
      return Math.round((completedLessons.length / lessons.length) * 100);
    },
  };
});

export default usePythonStore;

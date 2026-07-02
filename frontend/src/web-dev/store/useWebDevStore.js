import { create } from 'zustand';

const load = () => {
  try {
    const raw = localStorage.getItem('eduverse_web_dev_progress');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const save = (state) => {
  try {
    localStorage.setItem('eduverse_web_dev_progress', JSON.stringify(state));
  } catch { /* ignore */ }
};

const useWebDevStore = create((set, get) => {
  const saved = load();
  return {
    completedLessons: saved.completedLessons || [],   // array of slugs
    lessonProgress:   saved.lessonProgress   || {},   // slug -> 0-100
    quizScores:       saved.quizScores       || {},   // slug -> score (0-100)
    xpEarned:         saved.xpEarned         || 0,
    bookmarks:        saved.bookmarks        || {},   // slug -> step index
    watchPercent:     saved.watchPercent     || {},   // slug -> 0-100
    badges:           saved.badges           || [],   // array of badge IDs
    notes:            saved.notes            || {},   // slug -> notes text
    activeLesson:     null,

    setActiveLesson: (lesson) => set({ activeLesson: lesson }),

    completeLesson: (slug, xp) => {
      const s = get();
      if (s.completedLessons.includes(slug)) return;
      
      const newBadges = [...s.badges];
      if (slug === 'html-basics' && !newBadges.includes('html-master')) {
        newBadges.push('html-master');
      } else if (slug === 'css-styling' && !newBadges.includes('css-master')) {
        newBadges.push('css-master');
      } else if (slug === 'js-core' && !newBadges.includes('js-master')) {
        newBadges.push('js-master');
      }

      const next = {
        completedLessons: [...s.completedLessons, slug],
        lessonProgress:   { ...s.lessonProgress, [slug]: 100 },
        xpEarned: s.xpEarned + xp,
        badges: newBadges
      };
      set(next);
      save({ ...s, ...next });
    },

    updateProgress: (slug, percent) => {
      const s = get();
      const lessonProgress = { ...s.lessonProgress, [slug]: Math.min(100, Math.max(0, percent)) };
      set({ lessonProgress });
      save({ ...s, lessonProgress });
    },

    saveQuizScore: (slug, score, xpBonus = 0) => {
      const s = get();
      const prev = s.quizScores[slug] || 0;
      const quizScores = { ...s.quizScores, [slug]: Math.max(prev, score) };
      const xpEarned = score > prev ? s.xpEarned + xpBonus : s.xpEarned;
      set({ quizScores, xpEarned });
      save({ ...s, quizScores, xpEarned });
    },

    saveBookmark: (slug, step) => {
      const s = get();
      const bookmarks = { ...s.bookmarks, [slug]: step };
      set({ bookmarks });
      save({ ...s, bookmarks });
    },

    getBookmark: (slug) => get().bookmarks[slug] || 0,

    updateWatchPercent: (slug, percent) => {
      const s = get();
      const watchPercent = { ...s.watchPercent, [slug]: Math.max(s.watchPercent[slug] || 0, percent) };
      set({ watchPercent });
      save({ ...s, watchPercent });
    },

    saveNotes: (slug, text) => {
      const s = get();
      const notes = { ...s.notes, [slug]: text };
      set({ notes });
      save({ ...s, notes });
    },

    getNotes: (slug) => get().notes[slug] || '',

    resetAll: () => {
      localStorage.removeItem('eduverse_web_dev_progress');
      set({
        completedLessons: [],
        lessonProgress:   {},
        quizScores:       {},
        xpEarned:         0,
        bookmarks:        {},
        watchPercent:     {},
        badges:           [],
        notes:            {},
      });
    },

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

export default useWebDevStore;

/**
 * EduVerse Command AI — Memory Store
 * localStorage-backed persistent context store for the voice OS.
 * Remembers user context, command history, lesson state, and preferences.
 */

const KEYS = {
  USER_NAME:       'cai_user_name',
  DEPARTMENT:      'cai_department',
  SEMESTER:        'cai_semester',
  LANGUAGE:        'cai_language',
  CURRENT_LESSON:  'cai_current_lesson',
  LAST_INTENT:     'cai_last_intent',
  COMMAND_HISTORY: 'cai_command_history',
  RECENT_NOTES:    'cai_recent_notes',
  QUIZ_PROGRESS:   'cai_quiz_progress',
  RESUME_STATUS:   'cai_resume_status',
  CONVERSATION:    'cai_conversation',
  WAKE_ENABLED:    'cai_wake_enabled',
  LAST_ROUTE:      'cai_last_route',
};

const MAX_HISTORY = 30;
const MAX_CONVERSATION = 10;

/** @returns {any} */
function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** @param {string} key @param {any} value */
function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded */ }
}

const MemoryStore = {
  // ─── User Profile ─────────────────────────────────────────────────────────
  getUserName:   ()    => get(KEYS.USER_NAME, ''),
  setUserName:   (v)   => set(KEYS.USER_NAME, v),

  getDepartment: ()    => get(KEYS.DEPARTMENT, ''),
  setDepartment: (v)   => set(KEYS.DEPARTMENT, v),

  getSemester:   ()    => get(KEYS.SEMESTER, ''),
  setSemester:   (v)   => set(KEYS.SEMESTER, v),

  getLanguage:   ()    => get(KEYS.LANGUAGE, 'english'),
  setLanguage:   (v)   => set(KEYS.LANGUAGE, v),

  // ─── Session State ────────────────────────────────────────────────────────
  getCurrentLesson: ()  => get(KEYS.CURRENT_LESSON, null),
  setCurrentLesson: (v) => set(KEYS.CURRENT_LESSON, v),

  getLastIntent: ()     => get(KEYS.LAST_INTENT, null),
  setLastIntent: (v)    => set(KEYS.LAST_INTENT, v),

  getLastRoute:  ()     => get(KEYS.LAST_ROUTE, '/dashboard'),
  setLastRoute:  (v)    => set(KEYS.LAST_ROUTE, v),

  getResumeStatus: ()   => get(KEYS.RESUME_STATUS, { exists: false, lastUpdated: null }),
  setResumeStatus: (v)  => set(KEYS.RESUME_STATUS, v),

  getQuizProgress: ()   => get(KEYS.QUIZ_PROGRESS, {}),
  setQuizProgress: (v)  => set(KEYS.QUIZ_PROGRESS, v),

  // ─── Wake Word ────────────────────────────────────────────────────────────
  getWakeEnabled: ()    => get(KEYS.WAKE_ENABLED, true),
  setWakeEnabled: (v)   => set(KEYS.WAKE_ENABLED, v),

  // ─── Command History ──────────────────────────────────────────────────────
  getCommandHistory: () => get(KEYS.COMMAND_HISTORY, []),

  /** @param {{ intent: string, transcript: string, response: string, timestamp: number }} entry */
  addCommandHistory(entry) {
    const history = this.getCommandHistory();
    history.unshift({ ...entry, timestamp: entry.timestamp || Date.now() });
    if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
    set(KEYS.COMMAND_HISTORY, history);
  },

  clearCommandHistory: () => set(KEYS.COMMAND_HISTORY, []),

  // ─── Recent Notes ─────────────────────────────────────────────────────────
  getRecentNotes: ()    => get(KEYS.RECENT_NOTES, []),

  addRecentNote(note) {
    const notes = this.getRecentNotes();
    notes.unshift({ content: note, timestamp: Date.now() });
    if (notes.length > 10) notes.splice(10);
    set(KEYS.RECENT_NOTES, notes);
  },

  // ─── Conversation Context ─────────────────────────────────────────────────
  getConversation: ()   => get(KEYS.CONVERSATION, []),

  /** @param {'user'|'ai'} role @param {string} content */
  addConversationTurn(role, content) {
    const conv = this.getConversation();
    conv.push({ role, content, ts: Date.now() });
    if (conv.length > MAX_CONVERSATION) conv.splice(0, conv.length - MAX_CONVERSATION);
    set(KEYS.CONVERSATION, conv);
  },

  clearConversation: () => set(KEYS.CONVERSATION, []),

  // ─── Bulk Context ─────────────────────────────────────────────────────────
  getFullContext() {
    return {
      userName:       this.getUserName(),
      department:     this.getDepartment(),
      semester:       this.getSemester(),
      language:       this.getLanguage(),
      currentLesson:  this.getCurrentLesson(),
      lastIntent:     this.getLastIntent(),
      lastRoute:      this.getLastRoute(),
      resumeStatus:   this.getResumeStatus(),
      quizProgress:   this.getQuizProgress(),
      conversation:   this.getConversation(),
    };
  },

  /** Seed memory from the existing auth user object */
  seedFromUser(user) {
    if (!user) return;
    if (user.name && !this.getUserName()) this.setUserName(user.name);
    if (user.department && !this.getDepartment()) this.setDepartment(user.department);
    if (user.semester && !this.getSemester()) this.setSemester(user.semester);
  },

  /** Wipe all Command AI state (not the user's actual app data) */
  clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};

export default MemoryStore;

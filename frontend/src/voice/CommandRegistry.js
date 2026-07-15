/**
 * EduVerse Command AI — Command Registry
 * Whitelist of all 60+ voice commands mapped to intents, routes, agents,
 * required roles, and confirmation requirements.
 */

/** @typedef {'student'|'teacher'|'admin'} Role */
/** @typedef {'NAVIGATE'|'API_CALL'|'MODAL'|'ACTION'} ExecutionType */

/**
 * @typedef {Object} CommandDef
 * @property {string}   intent
 * @property {string[]} phrases        - Example trigger phrases
 * @property {string}   agent          - Which agent handles this
 * @property {ExecutionType} type
 * @property {string}   [route]        - React Router path
 * @property {Role[]}   roles          - Allowed roles
 * @property {boolean}  requiresConfirmation
 * @property {string}   description
 * @property {string}   responseTemplate - Voice response template
 */

/** @type {CommandDef[]} */
export const COMMAND_REGISTRY = [
  // ─── NAVIGATION ────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_DASHBOARD',
    phrases: ['open dashboard', 'go to dashboard', 'show dashboard', 'home', 'go home'],
    agent: 'DashboardAgent',
    type: 'NAVIGATE',
    route: '/dashboard',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: false,
    description: 'Navigate to the main dashboard',
    responseTemplate: 'Opening your dashboard.',
  },
  {
    intent: 'GO_BACK',
    phrases: ['go back', 'back', 'previous page'],
    agent: 'DashboardAgent',
    type: 'ACTION',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: false,
    description: 'Navigate back in browser history',
    responseTemplate: 'Going back.',
  },
  {
    intent: 'GO_FORWARD',
    phrases: ['go forward', 'forward', 'next page'],
    agent: 'DashboardAgent',
    type: 'ACTION',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: false,
    description: 'Navigate forward in browser history',
    responseTemplate: 'Going forward.',
  },
  {
    intent: 'OPEN_PROFILE',
    phrases: ['open profile', 'show profile', 'my profile', 'view profile'],
    agent: 'DashboardAgent',
    type: 'NAVIGATE',
    route: '/ai-profile',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: false,
    description: 'Open AI profile page',
    responseTemplate: 'Opening your AI profile.',
  },
  {
    intent: 'OPEN_SETTINGS',
    phrases: ['open settings', 'settings', 'preferences', 'go to settings'],
    agent: 'SettingsAgent',
    type: 'NAVIGATE',
    route: '/settings',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: false,
    description: 'Open settings page',
    responseTemplate: 'Opening settings.',
  },
  {
    intent: 'LOGOUT',
    phrases: ['logout', 'log out', 'sign out', 'exit account'],
    agent: 'SettingsAgent',
    type: 'ACTION',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: true,
    description: 'Log out of EduVerse AI',
    responseTemplate: 'Are you sure you want to log out?',
  },

  // ─── RESUME ────────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_CAREER_HUB',
    phrases: ['open career hub', 'career', 'jobs', 'career center'],
    agent: 'ResumeAgent',
    type: 'NAVIGATE',
    route: '/career-hub',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open Career Hub',
    responseTemplate: 'Opening Career Hub.',
  },
  {
    intent: 'CREATE_RESUME',
    phrases: ['create resume', 'make resume', 'build my resume', 'generate resume', 'create my resume'],
    agent: 'ResumeAgent',
    type: 'NAVIGATE',
    route: '/career-hub',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Create a new resume',
    responseTemplate: 'Opening resume builder.',
  },
  {
    intent: 'DOWNLOAD_RESUME',
    phrases: ['download resume', 'export resume', 'save resume as pdf'],
    agent: 'ResumeAgent',
    type: 'ACTION',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Download current resume as PDF',
    responseTemplate: 'Downloading your resume.',
  },

  // ─── PRACTICE ──────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_PRACTICE',
    phrases: ['open practice', 'practice hub', 'go to practice', 'practice mode'],
    agent: 'PracticeAgent',
    type: 'NAVIGATE',
    route: '/practice-hub',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open Practice Hub',
    responseTemplate: 'Opening Practice Hub.',
  },
  {
    intent: 'OPEN_DSA',
    phrases: ['open dsa', 'data structures', 'algorithms', 'dsa visualizer'],
    agent: 'PracticeAgent',
    type: 'NAVIGATE',
    route: '/dsa/stack',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open DSA visualizer',
    responseTemplate: 'Opening DSA visualizer.',
  },
  {
    intent: 'OPEN_CODING',
    phrases: ['open coding', 'coding lab', 'code editor', 'programming', 'open code editor'],
    agent: 'CodingAgent',
    type: 'NAVIGATE',
    route: '/coding',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open coding lab',
    responseTemplate: 'Opening coding lab.',
  },

  // ─── QUIZ ──────────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_QUIZZES',
    phrases: ['open quizzes', 'quizzes', 'quiz center', 'take a quiz'],
    agent: 'QuizAgent',
    type: 'NAVIGATE',
    route: '/quizzes',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open quiz center',
    responseTemplate: 'Opening quiz center.',
  },
  {
    intent: 'START_JAVA_QUIZ',
    phrases: ['start java quiz', 'java quiz', 'quiz on java', 'test me on java'],
    agent: 'QuizAgent',
    type: 'NAVIGATE',
    route: '/quizzes',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Start a Java quiz',
    responseTemplate: 'Starting Java quiz. Good luck!',
  },
  {
    intent: 'START_PYTHON_QUIZ',
    phrases: ['start python quiz', 'python quiz', 'quiz on python', 'test me on python'],
    agent: 'QuizAgent',
    type: 'NAVIGATE',
    route: '/quizzes',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Start a Python quiz',
    responseTemplate: 'Starting Python quiz. Let\'s go!',
  },
  {
    intent: 'QUIZ_ME',
    phrases: ['quiz me', 'test me', 'ask me questions', 'start quiz'],
    agent: 'QuizAgent',
    type: 'NAVIGATE',
    route: '/quizzes',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Start a quiz on current subject',
    responseTemplate: 'Opening quiz arena.',
  },

  // ─── AI TUTOR ──────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_AI_TUTOR',
    phrases: ['open ai tutor', 'ai tutor', 'open tutor', 'teach me'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/ai-tutor',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open AI Tutor',
    responseTemplate: 'Opening AI Tutor.',
  },
  {
    intent: 'TEACH_TOPIC',
    phrases: ['teach me', 'explain', 'what is', 'tell me about', 'learn about'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/voice-assistant',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Teach a specific topic',
    responseTemplate: 'Let me teach you about {topic}.',
  },
  {
    intent: 'GENERATE_NOTES',
    phrases: ['generate notes', 'create notes', 'make notes', 'study notes', 'revision notes'],
    agent: 'NotesAgent',
    type: 'NAVIGATE',
    route: '/voice-assistant',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Generate study notes',
    responseTemplate: 'Generating study notes.',
  },
  {
    intent: 'GENERATE_MCQS',
    phrases: ['generate mcqs', 'create mcqs', 'make multiple choice questions', 'generate questions'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/voice-assistant',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Generate MCQ questions',
    responseTemplate: 'Generating multiple choice questions.',
  },

  // ─── SMARTBOARD ────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_SMARTBOARD',
    phrases: ['open smartboard', 'smartboard', 'whiteboard', 'open whiteboard', 'drawing board'],
    agent: 'SmartboardAgent',
    type: 'NAVIGATE',
    route: '/it-suite/smart-whiteboard',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open Smart Whiteboard',
    responseTemplate: 'Opening Smart Whiteboard.',
  },
  {
    intent: 'OPEN_IT_SUITE',
    phrases: ['open it suite', 'it suite', 'productivity tools', 'office tools'],
    agent: 'SmartboardAgent',
    type: 'NAVIGATE',
    route: '/it-suite',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open IT Suite',
    responseTemplate: 'Opening IT Suite.',
  },

  // ─── CODING ────────────────────────────────────────────────────────────────
  {
    intent: 'DEBUG_CODE',
    phrases: ['debug code', 'fix my code', 'find bugs', 'debug this'],
    agent: 'CodingAgent',
    type: 'NAVIGATE',
    route: '/voice-assistant',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Debug code using AI',
    responseTemplate: 'Opening AI code debugger.',
  },
  {
    intent: 'EXPLAIN_CODE',
    phrases: ['explain code', 'what does this code do', 'explain this program'],
    agent: 'CodingAgent',
    type: 'NAVIGATE',
    route: '/voice-assistant',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Explain code using AI',
    responseTemplate: 'I will explain the code for you.',
  },
  {
    intent: 'GENERATE_CODE',
    phrases: ['generate code', 'write a program', 'create a function', 'code for me'],
    agent: 'CodingAgent',
    type: 'NAVIGATE',
    route: '/voice-assistant',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Generate code using AI',
    responseTemplate: 'Generating code.',
  },
  {
    intent: 'OPEN_CODING_BATTLE',
    phrases: ['coding battle', 'code battle', 'competitive coding', 'battle arena'],
    agent: 'CodingAgent',
    type: 'NAVIGATE',
    route: '/coding-battle',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Open Coding Battle System',
    responseTemplate: 'Opening Coding Battle Arena.',
  },

  // ─── PROGRESS & ANALYTICS ──────────────────────────────────────────────────
  {
    intent: 'OPEN_PROGRESS',
    phrases: ['show progress', 'my progress', 'learning progress', 'open progress'],
    agent: 'AnalyticsAgent',
    type: 'NAVIGATE',
    route: '/progress',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open progress tracker',
    responseTemplate: 'Opening your progress report.',
  },
  {
    intent: 'SHOW_ATTENDANCE',
    phrases: ['show attendance', 'my attendance', 'attendance report', 'today\'s attendance'],
    agent: 'AnalyticsAgent',
    type: 'NAVIGATE',
    route: '/study-report',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Show attendance',
    responseTemplate: 'Opening attendance report.',
  },
  {
    intent: 'OPEN_STUDY_REPORT',
    phrases: ['study report', 'open study report', 'show report', 'my report'],
    agent: 'AnalyticsAgent',
    type: 'NAVIGATE',
    route: '/study-report',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Open study report',
    responseTemplate: 'Opening study report.',
  },
  {
    intent: 'OPEN_CERTIFICATES',
    phrases: ['certificates', 'my certificates', 'show certificates', 'open certificates'],
    agent: 'AnalyticsAgent',
    type: 'NAVIGATE',
    route: '/certificates',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Open certificates',
    responseTemplate: 'Opening your certificates.',
  },

  // ─── COMMUNITY ─────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_COMMUNITY',
    phrases: ['open community', 'community hub', 'community', 'forum', 'discussion'],
    agent: 'NotificationAgent',
    type: 'NAVIGATE',
    route: '/community',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open Community Hub',
    responseTemplate: 'Opening Community Hub.',
  },

  // ─── VOICE ASSISTANT ───────────────────────────────────────────────────────
  {
    intent: 'OPEN_VOICE_ASSISTANT',
    phrases: ['open voice assistant', 'voice teacher', 'ai voice teacher', 'voice mode'],
    agent: 'TeacherAgent',
    type: 'NAVIGATE',
    route: '/voice-assistant',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open AI Voice Teacher',
    responseTemplate: 'Opening AI Voice Teacher.',
  },
  {
    intent: 'OPEN_COMMAND_AI',
    phrases: ['open command ai', 'command center', 'voice os', 'command dashboard'],
    agent: 'DashboardAgent',
    type: 'NAVIGATE',
    route: '/command-ai',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: false,
    description: 'Open Command AI Dashboard',
    responseTemplate: 'Opening EduVerse Command AI.',
  },

  // ─── SUBJECTS ──────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_SUBJECTS',
    phrases: ['open subjects', 'my subjects', 'show subjects', 'all subjects'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/subjects',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open subjects list',
    responseTemplate: 'Opening subjects.',
  },
  {
    intent: 'OPEN_PYTHON_COURSE',
    phrases: ['open python', 'python course', 'learn python', 'python lessons'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/python/course/introduction',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Open Python course',
    responseTemplate: 'Opening Python course.',
  },
  {
    intent: 'OPEN_JAVA_COURSE',
    phrases: ['open java', 'java course', 'learn java', 'java lessons', 'advanced java'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/advanced-java/course/introduction',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Open Java course',
    responseTemplate: 'Opening Java course.',
  },
  {
    intent: 'OPEN_WEBDEV_COURSE',
    phrases: ['open web dev', 'web development', 'learn web dev', 'html css javascript'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/web-dev/course/introduction',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Open Web Dev course',
    responseTemplate: 'Opening Web Development course.',
  },
  {
    intent: 'OPEN_DBMS',
    phrases: ['open dbms', 'database', 'learn dbms', 'dbms lab'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/dbms-lab',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open DBMS Lab',
    responseTemplate: 'Opening DBMS Lab.',
  },
  {
    intent: 'OPEN_CHAT_LEARN',
    phrases: ['open chat learn', 'chat learn', 'chat with ai', 'learning chat'],
    agent: 'AiTutorAgent',
    type: 'NAVIGATE',
    route: '/chat-learn',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open Chat Learn',
    responseTemplate: 'Opening Chat Learning mode.',
  },

  // ─── ADMIN ONLY ────────────────────────────────────────────────────────────
  {
    intent: 'OPEN_ADMIN',
    phrases: ['open admin', 'admin dashboard', 'admin panel'],
    agent: 'DashboardAgent',
    type: 'NAVIGATE',
    route: '/admin',
    roles: ['admin'],
    requiresConfirmation: false,
    description: 'Open admin dashboard',
    responseTemplate: 'Opening admin dashboard.',
  },
  {
    intent: 'OPEN_VOICE_LOGS',
    phrases: ['voice logs', 'command logs', 'open voice analytics', 'voice analytics'],
    agent: 'AnalyticsAgent',
    type: 'NAVIGATE',
    route: '/admin/voice-logs',
    roles: ['admin'],
    requiresConfirmation: false,
    description: 'Open voice command analytics',
    responseTemplate: 'Opening voice command logs.',
  },

  // ─── TYPING QUEST ──────────────────────────────────────────────────────────
  {
    intent: 'OPEN_TYPING_QUEST',
    phrases: ['typing quest', 'typing practice', 'improve typing', 'typing game'],
    agent: 'PracticeAgent',
    type: 'NAVIGATE',
    route: '/typing-quest',
    roles: ['student'],
    requiresConfirmation: false,
    description: 'Open Typing Quest',
    responseTemplate: 'Opening Typing Quest.',
  },

  // ─── EXAM CENTER ───────────────────────────────────────────────────────────
  {
    intent: 'OPEN_EXAM_CENTER',
    phrases: ['open exam center', 'exam center', 'exam command center', 'exams'],
    agent: 'QuizAgent',
    type: 'NAVIGATE',
    route: '/exam-command-center',
    roles: ['student', 'teacher'],
    requiresConfirmation: false,
    description: 'Open Exam Command Center',
    responseTemplate: 'Opening Exam Command Center.',
  },

  // ─── SYSTEM ────────────────────────────────────────────────────────────────
  {
    intent: 'STOP_LISTENING',
    phrases: ['stop', 'stop listening', 'quiet', 'mute', 'silence'],
    agent: 'DashboardAgent',
    type: 'ACTION',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: false,
    description: 'Stop voice recognition',
    responseTemplate: 'Stopping. Say "Hey EduVerse" to wake me up.',
  },
  {
    intent: 'HELP',
    phrases: ['help', 'what can you do', 'show commands', 'list commands', 'voice help'],
    agent: 'DashboardAgent',
    type: 'ACTION',
    roles: ['student', 'teacher', 'admin'],
    requiresConfirmation: false,
    description: 'Show available commands',
    responseTemplate: 'I can help you navigate, learn, quiz, code, and more. Say "Open Dashboard", "Teach me Python", or "Start Java Quiz" to get started.',
  },
];

/** Quick lookup map: intent → CommandDef */
export const INTENT_MAP = Object.fromEntries(
  COMMAND_REGISTRY.map(cmd => [cmd.intent, cmd])
);

/** Agent names list */
export const AGENT_NAMES = [
  'DashboardAgent', 'ResumeAgent', 'PracticeAgent', 'QuizAgent',
  'AssignmentAgent', 'SmartboardAgent', 'TeacherAgent', 'AiTutorAgent',
  'NotesAgent', 'CodingAgent', 'NotificationAgent', 'CalendarAgent',
  'SettingsAgent', 'AnalyticsAgent',
];

/** Wake words */
export const WAKE_WORDS = ['hey eduverse', 'hello eduverse', 'eduverse'];

/** All intents as enum-like constant */
export const INTENTS = Object.fromEntries(
  COMMAND_REGISTRY.map(c => [c.intent, c.intent])
);

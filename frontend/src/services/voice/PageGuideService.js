// Page Guide Service
// Maps application routes to voice instructions and interactive helpers

const PAGE_GUIDES = {
  '/': {
    welcome: 'Welcome to EduVerse AI, the next-generation personalized learning platform! Click on the login button in the top right to start, or create a new student account to begin your journey.',
    explanation: 'This is the landing page. It introduces our AI-driven learning tools, visualizers, and coding challenges.'
  },
  '/login': {
    welcome: 'Please sign in. Enter your registered email address and security password to access your student space.',
    explanation: 'This is the login page. Input your email and password to proceed.'
  },
  '/register': {
    welcome: 'Welcome! Let us set up your student account. Start by entering your name and email address, then click next to configure your security credentials.',
    explanation: 'This is the register page. Complete the steps to set up your subjects, role, and learning preferences.'
  },
  '/dashboard': {
    welcome: 'Welcome back to your dashboard! Here you can view your active learning stats, track your daily goals, and see your current streak. Explore the subjects tab to pick up where you left off.',
    explanation: 'Your dashboard displays study hours, readiness indicators, active reminders, and quick-continue courses.'
  },
  '/subjects': {
    welcome: 'Here are your active courses. Select any topic, such as Mathematics or Data Structures, to open chapters, interactive sandbox labs, and visualizers.',
    explanation: 'The subjects library contains your enrolled subjects and prototypes. Click any card to launch the workspace.'
  },
  '/practice-hub': {
    welcome: 'Welcome to the Practice Hub! Practice makes perfect. Test your knowledge by taking customized quizzes and practice challenges.',
    explanation: 'The Practice Hub hosts subject-wise mock tests, MCQ practice pools, and placement prep tests.'
  },
  '/coding': {
    welcome: 'Welcome to the Coding Arena. Select an algorithm challenge or programming problem from the menu, code your solution, and click the compiler button to test your logic.',
    explanation: 'This is an interactive IDE. Write code in the editor, check test cases, and analyze runtime execution.'
  },
  '/ai-tutor': {
    welcome: 'Hi! I am Friday, your AI Study Tutor. Ask me any doubt about your syllabus, request a practice program, or upload study notes to get instant explanations.',
    explanation: 'The AI Tutor endpoint uses direct LLM memory to answer academic questions, write code, or review PDF documents.'
  },
  '/dbms-lab': {
    welcome: 'Welcome to the DBMS SQL Lab sandbox. Write SQL queries to create tables, select rows, and run database transactions. Hit the execute button to query live.',
    explanation: 'DBMS sandbox compiles SQL code against local student schemas. See structured results immediately.'
  },
  '/settings': {
    welcome: 'Here are your preferences. You can update your profile name, change user theme settings, or adjust your AI Voice Assistant speech rate and volume options.',
    explanation: 'Settings page lets you customize your learning journey, change passwords, and save assistant rates.'
  },
  '/mathematics/calculus': {
    welcome: 'Welcome to the Calculus Notebook simulator. Choose an equation solver like Gauss-Seidel or divided difference interpolation on the left, set the iterations, and click start solving.',
    explanation: 'Calculus engine calculates mathematical algorithms step-by-step, explaining basis coefficients and difference tables.'
  },
  '/dsa/stack': {
    welcome: 'Explore the Stack visualizer. You can push elements on top of the stack, pop them off, or check the size and peek elements interactively.',
    explanation: 'This sandbox visualizes Stack operations (LIFO - Last In First Out) with step-by-step memory pointer movements.'
  },
  '/dsa/queue': {
    welcome: 'Explore the Queue visualizer. Queue works on a First In First Out pattern. You can enqueue elements to the rear or dequeue them from the front.',
    explanation: 'Queue visualizer simulates data scheduling queues, showing front and rear pointer changes.'
  },
  '/dsa/linked-list': {
    welcome: 'Welcome to the Linked List visualizer. You can append nodes, insert at specific indices, or delete nodes, while watching link reference updates.',
    explanation: 'Linked List sandbox demonstrates sequential node storage linked via pointer addresses.'
  },
  '/dsa/tree': {
    welcome: 'Welcome to the Binary Search Tree visualizer. Insert key values to construct nodes, and select traversals like pre-order, in-order, or post-order.',
    explanation: 'Tree sandbox demonstrates node balancing, root paths, and search pathways.'
  },
  '/dsa/graph': {
    welcome: 'Welcome to the Graph Network visualizer. Add node vertices, connect them with weighted edges, and run pathfinding searches like Dijkstra or Breadth-First search.',
    explanation: 'Graph sandbox demonstrates network connections and graph search algorithms.'
  }
};

export const getPageGuide = (path) => {
  // Support dynamic parameterized routes e.g., /subjects/1 or /quizzes/stack
  if (path.startsWith('/subjects/')) {
    return {
      welcome: 'Exploring subject chapter details. Scroll down to view the syllabus outline, visualizer links, and quiz challenges.',
      explanation: 'Syllabus detailed page. View notes, start chapter lessons, or take subject assessments.'
    };
  }
  if (path.startsWith('/quizzes/')) {
    return {
      welcome: 'Quiz mode active. Please read the question details carefully, choose the correct answer option, and click next to proceed.',
      explanation: 'Interactive quiz test. Answer all questions to submit and earn XP and learning certificates.'
    };
  }
  
  return PAGE_GUIDES[path] || {
    welcome: 'You are now browsing the EduVerse AI platform. I am here to help you study and navigate.',
    explanation: 'EduVerse student workspace portal.'
  };
};

export default PAGE_GUIDES;

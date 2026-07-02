export const WEB_DEV_LESSONS = [
  {
    id: 1,
    slug: 'html-basics',
    title: 'HTML Structure & Semantics',
    difficulty: 'Beginner',
    duration: '25 mins',
    xp: 150,
    accent: '#EF4444',
    icon: '🌐',
    description: 'Learn the core HTML tags, document structure, and semantic elements like header, footer, section.',
    topics: ['HTML Syntax', 'Document Structure', 'Semantic Elements', 'Attributes'],
    script: [
      { type: 'intro', text: "Welcome to HTML Structure & Semantics. HTML is the building block of the Web." },
      { type: 'concept', text: "Semantic tags explain their meaning to both the browser and the developer, improving accessibility and SEO." }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which tag is used to define semantic headers in HTML5?', options: ['<head>', '<header>', '<heading>', '<hgroup>'], correct: '<header>', explanation: '<header> defines header blocks for document sections or headers.' }
      ]
    }
  },
  {
    id: 2,
    slug: 'css-styling',
    title: 'CSS Box Model & Styling',
    difficulty: 'Beginner',
    duration: '35 mins',
    xp: 180,
    accent: '#3B82F6',
    icon: '🎨',
    description: 'Master margins, borders, paddings, display behaviors, flexboxes, and CSS selectors.',
    topics: ['Box Model', 'Flexbox Alignment', 'Selectors', 'Margins & Padding'],
    script: [
      { type: 'intro', text: "Welcome to CSS Box Model & Styling. Everything in CSS is represented as boxes." }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'What components make up the CSS Box Model?', options: ['Content, Padding, Border, Margin', 'Width, Height, Border, Radius', 'Header, Article, Section, Footer', 'Flex, Grid, Relative, Absolute'], correct: 'Content, Padding, Border, Margin', explanation: 'The box model includes Content, Padding (inside spacing), Border, and Margin (outside spacing).' }
      ]
    }
  },
  {
    id: 3,
    slug: 'js-core',
    title: 'JavaScript Core Basics',
    difficulty: 'Intermediate',
    duration: '40 mins',
    xp: 200,
    accent: '#F59E0B',
    icon: '⚙️',
    description: 'Learn variables, functions, scopes, arrays, objects, and asynchronous event loops.',
    topics: ['Variables & Scopes', 'Functions & Callbacks', 'Arrays & Objects', 'Asynchronous JS'],
    script: [
      { type: 'intro', text: "Welcome to JavaScript! JS adds interactivity and logical scripting to web pages." }
    ],
    quiz: {
      mcq: [
        { id: 'q1', question: 'Which keyword defines a block-scoped re-assignable variable in JavaScript?', options: ['var', 'let', 'const', 'define'], correct: 'let', explanation: 'let is block-scoped and allows values to be re-assigned, unlike const.' }
      ]
    }
  }
];

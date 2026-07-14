import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Trophy, Award, BookOpen, AlertCircle, Bookmark, Timer, CheckCircle2, 
  XCircle, ChevronLeft, ChevronRight, HelpCircle, Share2, Flame, ArrowLeft,
  Settings, Zap, Shield, Play
} from 'lucide-react';
import toast from 'react-hot-toast';

// Rich Mock Quiz database for offline-resilience
const SUBJECT_QUIZZES = {
  'Java': [
    {
      id: 'java-1',
      title: 'Java Fundamentals',
      desc: 'Introduction to data types, variable scopes, and operations.',
      difficulty: 'Easy',
      questionsCount: 5,
      estimatedTime: '5 mins',
      tags: ['Variables', 'Syntax'],
      bestScore: 80,
      lastScore: 60,
      completion: 100,
      status: 'Completed',
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Which of the following is NOT a primitive data type in Java?',
          code: null,
          options: { a: 'int', b: 'double', c: 'String', d: 'boolean' },
          correct: 'c',
          topic: 'Variables',
          explanation: 'String is a reference class type in Java (under java.lang package), not a primitive data type. Primitives include byte, short, int, long, float, double, char, and boolean.'
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What is the default value of a local object reference variable?',
          code: null,
          options: { a: 'null', b: 'undefined', c: 'garbage value', d: 'It does not have a default value and must be initialized before use.' },
          correct: 'd',
          topic: 'Variables',
          explanation: 'Local variables in Java are allocated on the stack and do not receive default values. You must explicitly initialize them before reading their value, or it results in a compile-time error.'
        },
        {
          id: 'q3',
          type: 'mcq',
          question: 'What will be the output of this code snippet?',
          code: `int x = 5;\nSystem.out.println(x++ + ++x);`,
          options: { a: '10', b: '12', c: '11', d: 'Compile Error' },
          correct: 'b',
          topic: 'Syntax',
          explanation: 'x++ returns the current value 5, then increments x to 6. ++x increments x from 6 to 7, then returns 7. Thus, 5 + 7 = 12.'
        },
        {
          id: 'q4',
          type: 'mcq',
          question: 'Which keyword is used to restrict inheritance of a class in Java?',
          code: null,
          options: { a: 'static', b: 'const', c: 'final', d: 'abstract' },
          correct: 'c',
          topic: 'Syntax',
          explanation: 'Declaring a class as "final" prevents it from being extended by any other subclasses (e.g., the String class is final).'
        },
        {
          id: 'q5',
          type: 'mcq',
          question: 'Which of these is checked at compile-time?',
          code: null,
          options: { a: 'RuntimeException', b: 'NullPointerException', c: 'IOException', d: 'ArrayIndexOutOfBoundsException' },
          correct: 'c',
          topic: 'Syntax',
          explanation: 'IOException is a Checked Exception, meaning the Java compiler forces developers to either catch or declare it in the method signature at compile-time.'
        }
      ]
    },
    {
      id: 'java-2',
      title: 'Object Oriented Programming',
      desc: 'Deep dive into polymorphism, abstract classes, interfaces, and encapsulation.',
      difficulty: 'Medium',
      questionsCount: 4,
      estimatedTime: '6 mins',
      tags: ['Polymorphism', 'Interfaces'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'q21',
          type: 'mcq',
          question: 'Can an interface have concrete methods in Java 8 and later?',
          code: null,
          options: { a: 'No, interfaces only have abstract declarations.', b: 'Yes, using the keywords default or static.', c: 'Yes, only using static.', d: 'Yes, but only if they are private.' },
          correct: 'b',
          topic: 'Interfaces',
          explanation: 'Java 8 introduced default and static interface methods to support interface extensions without breaking backward compatibility for older implementations.'
        },
        {
          id: 'q22',
          type: 'mcq',
          question: 'What is the output of this overloading test?',
          code: `class Parent {\n    void print() { System.out.print("P "); }\n}\nclass Child extends Parent {\n    void print() { System.out.print("C "); }\n}\nParent obj = new Child();\nobj.print();`,
          options: { a: 'P ', b: 'C ', c: 'P C ', d: 'Compile Error' },
          correct: 'b',
          topic: 'Polymorphism',
          explanation: 'This is runtime polymorphism (method overriding). Since the actual object instance created is Child, Child\'s print() method is executed at runtime.'
        },
        {
          id: 'q23',
          type: 'mcq',
          question: 'Which OOP concept is achieved by hiding internal data and requiring access via public getters/setters?',
          code: null,
          options: { a: 'Abstraction', b: 'Inheritance', c: 'Encapsulation', d: 'Polymorphism' },
          correct: 'c',
          topic: 'Polymorphism',
          explanation: 'Encapsulation wraps the variables and code together into a single unit, keeping fields private and exposing controlled public interface methods.'
        },
        {
          id: 'q24',
          type: 'mcq',
          question: 'Can you instantiate an abstract class in Java?',
          code: null,
          options: { a: 'Yes, using the new keyword.', b: 'No, abstract classes can never be instantiated directly.', c: 'Yes, by referencing its subclass.', d: 'Yes, but only through inheritance static helpers.' },
          correct: 'b',
          topic: 'Interfaces',
          explanation: 'Abstract classes are incomplete definitions and cannot be instantiated directly via "new". You can only instantiate concrete classes that extend them.'
        }
      ]
    }
  ],
  'Advanced Java': [
    {
      id: 'advjava-1',
      title: 'JDBC Connection Pools',
      desc: 'Understand JDBC architecture, statement types, and pooling.',
      difficulty: 'Medium',
      questionsCount: 3,
      estimatedTime: '4 mins',
      tags: ['JDBC', 'SQL'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'q31',
          type: 'mcq',
          question: 'Which statement type is pre-compiled and helps prevent SQL Injection attacks?',
          code: null,
          options: { a: 'Statement', b: 'PreparedStatement', c: 'CallableStatement', d: 'ResultSet' },
          correct: 'b',
          topic: 'JDBC',
          explanation: 'PreparedStatement compiles the SQL template once and takes parameter markers (?). This isolates parameter values from query structure, blocking SQL injection.'
        },
        {
          id: 'q32',
          type: 'mcq',
          question: 'Which method is used to call stored procedures in database operations?',
          code: null,
          options: { a: 'prepareStatement()', b: 'createStatement()', c: 'prepareCall()', d: 'executeStoredProcedure()' },
          correct: 'c',
          topic: 'JDBC',
          explanation: 'The CallableStatement interface created via Connection.prepareCall() is designed to invoke SQL stored procedures containing IN, OUT, and INOUT parameter configurations.'
        },
        {
          id: 'q33',
          type: 'mcq',
          question: 'What is the main benefit of using a Connection Pool (like HikariCP)?',
          code: null,
          options: { a: 'Encrypts database payloads', b: 'Reuses existing connection channels to avoid expensive initial TCP handshakes', c: 'Speeds up SQL index building', d: 'Automatically formats queries' },
          correct: 'b',
          topic: 'JDBC',
          explanation: 'Creating connection threads is computationally expensive. Connection Pools maintain hot connections, recycling them to boost high-throughput database interaction speeds.'
        }
      ]
    }
  ],
  'Python': [
    {
      id: 'py-1',
      title: 'Lists & List Comprehensions',
      desc: 'Master pythonic iterations, comprehensions, and slicing scopes.',
      difficulty: 'Easy',
      questionsCount: 3,
      estimatedTime: '3 mins',
      tags: ['Slicing', 'Comprehensions'],
      bestScore: 100,
      lastScore: 100,
      completion: 100,
      status: 'Completed',
      questions: [
        {
          id: 'q41',
          type: 'mcq',
          question: 'What does the slice list[::-1] evaluate to?',
          code: null,
          options: { a: 'Empties the array', b: 'Returns every other element', c: 'Reverses the array contents', d: 'Filters out duplicate values' },
          correct: 'c',
          topic: 'Slicing',
          explanation: 'Slicing with positive/negative steps [start:stop:step] reverses direction when the step is set to -1, returning a reversed copy of the list.'
        },
        {
          id: 'q42',
          type: 'mcq',
          question: 'What is the value of result in Python?',
          code: `nums = [1, 2, 3, 4]\nresult = [x * 2 for x in nums if x % 2 == 0]`,
          options: { a: '[2, 4, 6, 8]', b: '[4, 8]', c: '[2, 6]', d: '[2, 8]' },
          correct: 'b',
          topic: 'Comprehensions',
          explanation: 'The list comprehension filters nums to keep only even values (2, 4), then multiplies each by 2, resulting in [4, 8].'
        },
        {
          id: 'q43',
          type: 'mcq',
          question: 'What will be output by type( (1) ) and type( (1,) )?',
          code: null,
          options: { a: 'tuple, tuple', b: 'int, tuple', c: 'int, int', d: 'tuple, int' },
          correct: 'b',
          topic: 'Slicing',
          explanation: 'A single value inside parentheses (1) is evaluated as the value itself (integer). To instantiate a single-element tuple, a trailing comma is required (1,).'
        }
      ]
    }
  ],
  'DSA': [
    {
      id: 'dsa-1',
      title: 'Sorting Algorithms',
      desc: 'Understand complexity limits of sorting models.',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Complexity', 'Algorithms'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'q51',
          type: 'mcq',
          question: 'What is the worst-case time complexity of Quick Sort?',
          code: null,
          options: { a: 'O(N log N)', b: 'O(N^2)', c: 'O(N)', d: 'O(log N)' },
          correct: 'b',
          topic: 'Complexity',
          explanation: 'Quick Sort degrades to O(N^2) complexity in cases where the selected pivot consistently cuts the array unbalanced (e.g., already sorted lists with first/last pivot elements).'
        },
        {
          id: 'q52',
          type: 'mcq',
          question: 'Which sorting model offers a guaranteed O(N log N) worst-case time and operates out-of-place?',
          code: null,
          options: { a: 'Bubble Sort', b: 'Insertion Sort', c: 'Merge Sort', d: 'Quick Sort' },
          correct: 'c',
          topic: 'Algorithms',
          explanation: 'Merge Sort divides the array into sublists, processes recursively, and merges them. It guarantees O(N log N) time complexity but requires auxiliary space proportional to list size.'
        },
        {
          id: 'q53',
          type: 'mcq',
          question: 'Is Bubble Sort a stable sorting algorithm?',
          code: null,
          options: { a: 'Yes, elements retain relative positions if values are equal.', b: 'No, it swaps values unpredictably.', c: 'Only if sorted in descending order.', d: 'Only for list sizes under 100.' },
          correct: 'a',
          topic: 'Algorithms',
          explanation: 'Stability means identical keys maintain chronological order. Bubble Sort only swaps if element values are strictly larger/smaller, preserving order when items are equal.'
        }
      ]
    }
  ],
  'DBMS': [
    {
      id: 'dbms-1',
      title: 'SQL Normalization Levels',
      desc: 'Understand Normal Forms (1NF, 2NF, 3NF, BCNF).',
      difficulty: 'Hard',
      questionsCount: 3,
      estimatedTime: '5 mins',
      tags: ['Normalization', 'SQL Keys'],
      bestScore: 0,
      lastScore: 0,
      completion: 0,
      status: 'Not started',
      questions: [
        {
          id: 'q61',
          type: 'mcq',
          question: 'What is required for a table database to be in 2nd Normal Form (2NF)?',
          code: null,
          options: { a: 'Must resolve partial dependency issues.', b: 'Must eliminate transitive dependencies.', c: 'Must contain only atomic values.', d: 'Must reside in 1NF and resolve all partial functional dependencies on composite keys.' },
          correct: 'd',
          topic: 'Normalization',
          explanation: '2NF requires the database schema to be in 1NF and guarantees that all non-prime attributes depend entirely on the primary candidate key, eliminating partial dependencies.'
        },
        {
          id: 'q62',
          type: 'mcq',
          question: 'A table exhibits transitive dependency if A -> B and B -> C. Which normal form eliminates this?',
          code: null,
          options: { a: '1NF', b: '2NF', c: '3NF', d: '4NF' },
          correct: 'c',
          topic: 'Normalization',
          explanation: '3NF eliminates transitive dependencies (meaning a non-prime attribute depending on another non-prime attribute instead of directly on candidate keys).'
        },
        {
          id: 'q63',
          type: 'mcq',
          question: 'Which integrity rule guarantees that foreign keys always point to valid primary keys or contain null values?',
          code: null,
          options: { a: 'Entity Integrity Rule', b: 'Referential Integrity Rule', c: 'Domain Constraint Rule', d: 'Trigger Verification Rule' },
          correct: 'b',
          topic: 'SQL Keys',
          explanation: 'The Referential Integrity Rule states that every foreign key value must match an existing primary key value in its master table, maintaining lookup accuracy.'
        }
      ]
    }
  ]
};

// Mock student stats
const INITIAL_STATS = {
  totalAttempted: 4,
  totalSolved: 12,
  accuracy: 85,
  streak: 3,
  badges: ['Java Beginner', 'Python Explorer']
};

export default function QuizArena({ onExit }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState('Java');
  const [selectedMode, setSelectedMode] = useState('Practice'); // Practice, Exam, Challenge
  const [quizzes, setQuizzes] = useState(SUBJECT_QUIZZES['Java']);
  
  const quizId = searchParams.get('quiz');
  const selectedQuiz = quizzes.find(q => q.id === quizId) || null;
  const gameState = searchParams.get('state') || 'lobby';

  const setSelectedQuiz = (quiz) => {
    if (quiz) {
      setSearchParams({ module: 'quiz', quiz: quiz.id, state: 'lobby' });
    } else {
      setSearchParams({ module: 'quiz', state: 'lobby' });
    }
  };
  
  // Game states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionKey }
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // { questionId: true } (Practice mode immediate views)
  const [bookmarked, setBookmarked] = useState({}); // { questionId: true }
  
  // Timers
  const [timerLeft, setTimerLeft] = useState(300); // 5 mins in seconds
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef(null);

  // Stats
  const [stats, setStats] = useState(INITIAL_STATS);

  // Sync quizzes when subject changes
  useEffect(() => {
    setQuizzes(SUBJECT_QUIZZES[selectedSubject] || []);
    setSearchParams({ module: 'quiz', state: 'lobby' });
  }, [selectedSubject]);

  // Handle timer inside Exam/Challenge modes
  useEffect(() => {
    if (gameState === 'in-quiz') {
      setTimeTaken(0);
      setTimerLeft(selectedQuiz ? selectedQuiz.questions.length * 60 : 300);
      
      timerRef.current = setInterval(() => {
        setTimeTaken(prev => prev + 1);
        if (selectedMode !== 'Practice') {
          setTimerLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              handleSubmitQuiz(true); // Auto-submit on timeout
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameState, selectedMode]);

  const handleStartQuiz = () => {
    if (!selectedQuiz) return;
    setAnswers({});
    setSubmittedAnswers({});
    setBookmarked({});
    setCurrentQuestionIdx(0);
    setSearchParams({ module: 'quiz', quiz: selectedQuiz.id, state: 'in-quiz' });
  };

  const handleOptionSelect = (optKey) => {
    if (gameState !== 'in-quiz') return;
    const currentQuestion = selectedQuiz.questions[currentQuestionIdx];
    
    // In practice mode, if already submitted this question, freeze option choice
    if (selectedMode === 'Practice' && submittedAnswers[currentQuestion.id]) {
      return;
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optKey
    }));
  };

  const handlePracticeSubmitQuestion = () => {
    const currentQuestion = selectedQuiz.questions[currentQuestionIdx];
    if (!answers[currentQuestion.id]) {
      toast.error('Please select an option first!');
      return;
    }
    setSubmittedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: true
    }));
  };

  const handleSubmitQuiz = (isTimeout = false) => {
    clearInterval(timerRef.current);
    if (isTimeout) {
      toast.error("Time's up! Submitting your answers.");
    } else {
      toast.success("Quiz submitted successfully!");
    }

    // Calculate score
    let correctCount = 0;
    selectedQuiz.questions.forEach(q => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / selectedQuiz.questions.length) * 100);
    
    // Update local quiz variables
    selectedQuiz.lastScore = percent;
    if (percent > selectedQuiz.bestScore) {
      selectedQuiz.bestScore = percent;
    }
    selectedQuiz.completion = 100;
    selectedQuiz.status = 'Completed';

    // Update global Stats
    setStats(prev => {
      const newAttempted = prev.totalAttempted + 1;
      const newSolved = prev.totalSolved + selectedQuiz.questions.length;
      const newAccuracy = Math.round((prev.accuracy * prev.totalAttempted + percent) / newAttempted);
      let newBadges = [...prev.badges];
      
      if (newAttempted >= 5 && !newBadges.includes('Quiz master')) {
        newBadges.push('Quiz master');
        toast.success("🏆 Unlocked new Badge: Quiz master!");
      }

      return {
        ...prev,
        totalAttempted: newAttempted,
        totalSolved: newSolved,
        accuracy: newAccuracy,
        badges: newBadges
      };
    });

    setSearchParams({ module: 'quiz', quiz: selectedQuiz.id, state: 'results' });
  };

  const toggleBookmark = (qId) => {
    setBookmarked(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
    toast.success(bookmarked[qId] ? 'Removed bookmark' : 'Bookmarked question for review');
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (diff === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  return (
    <div className="quiz-arena-container h-full flex flex-col relative overflow-y-auto">
      {/* Background canvas elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#06b6d4]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ───── LOBBY / QUIZ EXPLORER ───── */}
      {gameState === 'lobby' && (
        <div className="lobby-panel flex-1 flex flex-col justify-start">
          
          {/* Top Header Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-5 mt-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="lobby-title font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">Quiz Arena</h1>
              </div>
              <p className="text-slate-400 text-xs mt-1">Test your skills. Practice topics. Track progress.</p>
            </div>

            {/* Dropdown Filters & Controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Select Subject</span>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Java">Java Basics</option>
                  <option value="Advanced Java">Advanced Java</option>
                  <option value="Python">Python Modules</option>
                  <option value="DSA">Data Structures</option>
                  <option value="DBMS">Database Systems</option>
                </select>
              </div>

              {/* Mode Selection */}
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Select Mode</span>
                <div className="flex bg-slate-900 border border-white/10 p-0.5 rounded-xl">
                  {['Practice', 'Exam', 'Challenge'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`quiz-mode-btn px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedMode === mode ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats Chips */}
              <div className="flex gap-2 ml-auto md:ml-0 mt-3 md:mt-0">
                <div className="stat-chip bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Accuracy</span>
                  <span className="text-xs font-extrabold text-emerald-400">{stats.accuracy}%</span>
                </div>
                <div className="stat-chip bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl flex flex-col items-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Streak</span>
                  <span className="text-xs font-extrabold text-orange-400 flex items-center gap-0.5">
                    <Flame size={12} className="fill-orange-400" /> {stats.streak}d
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Area – Two Columns */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            
            {/* Left Column: Quiz List Panel (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-cyan-400" /> Available Quizzes ({quizzes.length})
              </h2>
              
              <div className="space-y-3 overflow-y-auto max-h-[380px] pr-2 scrollbar-thin">
                {quizzes.map((quiz) => {
                  const isSelected = selectedQuiz?.id === quiz.id;
                  return (
                    <div
                      key={quiz.id}
                      onClick={() => setSelectedQuiz(quiz)}
                      className={`quiz-card-item p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-500/10' 
                          : 'border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                        <span className="text-[10px] font-bold quiz-status-label">
                          {quiz.status}
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-sm text-slate-100">{quiz.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{quiz.desc}</p>
                      
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                        <span>{quiz.questionsCount} Questions</span>
                        <span>{quiz.estimatedTime}</span>
                      </div>

                      {/* Completion Progress Bar */}
                      {quiz.completion > 0 && (
                        <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500" 
                            style={{ width: `${quiz.completion}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Quiz Details Panel (7 cols) */}
            <div className="lg:col-span-7 flex flex-col">
              {selectedQuiz ? (
                <div className="quiz-detail-panel flex-1 p-6 rounded-2xl border border-white/5 bg-slate-900/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header Details */}
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {selectedQuiz.tags.map((tag, idx) => (
                          <span key={idx} className="bg-slate-800 border border-white/5 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-xl font-black text-slate-100">{selectedQuiz.title}</h2>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedQuiz.desc}</p>
                    </div>

                    {/* Meta stats list */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg border border-white/5 text-cyan-400">
                          <Timer size={18} />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Time Allocated</div>
                          <div className="text-xs font-extrabold text-slate-200">{selectedQuiz.estimatedTime}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg border border-white/5 text-purple-400">
                          <HelpCircle size={18} />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Total Questions</div>
                          <div className="text-xs font-extrabold text-slate-200">{selectedQuiz.questionsCount} items</div>
                        </div>
                      </div>
                    </div>

                    {/* Past Scores Summary */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 flex justify-around">
                      <div className="text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Best Score</span>
                        <span className="text-sm font-extrabold text-cyan-400">{selectedQuiz.bestScore}%</span>
                      </div>
                      <div className="w-px bg-white/5" />
                      <div className="text-center">
                        <span className="text-[9px] text-slate-500 font-bold uppercase block">Last Attempt</span>
                        <span className="text-sm font-extrabold text-slate-300">{selectedQuiz.lastScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Start Button */}
                  <button
                    onClick={handleStartQuiz}
                    className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-extrabold text-sm hover:scale-[1.01] transition-transform cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <Play size={16} fill="white" /> Start Quiz ({selectedMode} Mode)
                  </button>
                </div>
              ) : (
                <div className="quiz-detail-panel flex-1 p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center text-slate-500">
                  <HelpCircle size={48} className="text-slate-600 mb-3" />
                  <p className="text-sm font-bold">No Quiz Selected</p>
                  <p className="text-xs text-slate-500 mt-1">Pick a quiz from the list on the left to view details and launch the arena.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar – Live Stats */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6 text-[10px] text-slate-500">
            <span>Subject: <strong className="text-slate-300">{selectedSubject}</strong></span>
            <span>Available Quizzes: <strong className="text-slate-300">{quizzes.length}</strong></span>
            <span>Completed Badges: <strong className="text-cyan-400">{stats.badges.join(', ')}</strong></span>
          </div>
        </div>
      )}

      {/* ───── IN-QUIZ QUESTION VIEWER ───── */}
      {gameState === 'in-quiz' && (
        <div className="in-quiz-panel flex-1 flex flex-col justify-between p-4">
          
          {/* Top Breadcrumbs & Timers */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                <span>Quiz Arena</span>
                <ChevronRight size={10} />
                <span>{selectedSubject}</span>
                <ChevronRight size={10} />
                <span className="text-cyan-400">{selectedQuiz.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400">
                Question {currentQuestionIdx + 1} of {selectedQuiz.questions.length}
              </span>
              
              {/* Timer for Exam and Challenge mode */}
              {selectedMode !== 'Practice' && (
                <div className="timer-badge flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-lg text-xs font-bold">
                  <Timer size={14} />
                  <span>{formatTimer(timerLeft)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Question workspace layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side: Question and options (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="quiz-question-box p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
                <span className="text-[10px] uppercase font-bold text-slate-500">Question {currentQuestionIdx + 1}</span>
                <h2 className="text-base font-extrabold text-slate-200 leading-relaxed">
                  {selectedQuiz.questions[currentQuestionIdx].question}
                </h2>

                {/* Formatted Code Block if question has code */}
                {selectedQuiz.questions[currentQuestionIdx].code && (
                  <pre className="p-4 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-emerald-400 font-mono overflow-x-auto leading-relaxed">
                    <code>{selectedQuiz.questions[currentQuestionIdx].code}</code>
                  </pre>
                )}
              </div>

              {/* Options selection stack */}
              <div className="space-y-2">
                {Object.entries(selectedQuiz.questions[currentQuestionIdx].options).map(([key, value]) => {
                  const isSelected = answers[selectedQuiz.questions[currentQuestionIdx].id] === key;
                  const isSubmitted = submittedAnswers[selectedQuiz.questions[currentQuestionIdx].id];
                  const isCorrect = selectedQuiz.questions[currentQuestionIdx].correct === key;

                  let borderClass = 'border-white/5 bg-slate-900/20 hover:bg-slate-900/40';
                  if (isSelected) borderClass = 'border-cyan-500 bg-cyan-500/5';
                  if (isSubmitted) {
                    if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-500/5';
                    else if (isSelected) borderClass = 'border-rose-500 bg-rose-500/5';
                  }

                  return (
                    <button
                      key={key}
                      disabled={isSubmitted}
                      onClick={() => handleOptionSelect(key)}
                      className={`quiz-option-btn w-full text-left p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${borderClass}`}
                    >
                      <span className={`quiz-option-letter w-6 h-6 rounded-lg text-xs font-black uppercase flex items-center justify-center ${
                        isSelected ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {key}
                      </span>
                      <span className="quiz-option-text text-sm font-semibold text-slate-300">{value}</span>
                      
                      {isSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 ml-auto" />}
                      {isSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-400 ml-auto" />}
                    </button>
                  );
                })}
              </div>

              {/* Practice Mode immediate Explanation box */}
              {selectedMode === 'Practice' && submittedAnswers[selectedQuiz.questions[currentQuestionIdx].id] && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs text-slate-300 leading-relaxed"
                >
                  <div className="font-extrabold text-cyan-400 mb-1 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Teacher's Explanation
                  </div>
                  {selectedQuiz.questions[currentQuestionIdx].explanation}
                </motion.div>
              )}
            </div>

            {/* Right side Info Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="quiz-stats-sidebar p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                <h4 className="text-[10px] text-slate-500 uppercase font-black">Question Stats</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Difficulty</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      selectedQuiz.questions[currentQuestionIdx].topic === 'Complexity' || selectedQuiz.questions[currentQuestionIdx].topic === 'Normalization' 
                        ? getDifficultyColor('Hard') 
                        : getDifficultyColor('Easy')
                    }`}>
                      {selectedQuiz.difficulty}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Topic Area</span>
                    <span className="text-slate-300 font-extrabold">{selectedQuiz.questions[currentQuestionIdx].topic}</span>
                  </div>
                </div>

                {/* Question operations */}
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button
                    onClick={() => toggleBookmark(selectedQuiz.questions[currentQuestionIdx].id)}
                    className="flex-1 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bookmark size={14} className={bookmarked[selectedQuiz.questions[currentQuestionIdx].id] ? 'fill-cyan-400 text-cyan-400' : ''} />
                    Bookmark
                  </button>

                  <button
                    onClick={() => toast.success('Question flagged for review')}
                    className="py-2 px-3 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-rose-400 flex items-center justify-center cursor-pointer"
                  >
                    <AlertCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-6">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Middle Action button depending on mode */}
            {selectedMode === 'Practice' && !submittedAnswers[selectedQuiz.questions[currentQuestionIdx].id] ? (
              <button
                onClick={handlePracticeSubmitQuestion}
                className="px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow-md shadow-cyan-600/25 cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <div className="text-[11px] text-slate-500">
                {selectedMode === 'Practice' ? 'Answer Checked ✔' : 'Auto-saved'}
              </div>
            )}

            {currentQuestionIdx < selectedQuiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSubmitQuiz(false)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {/* ───── RESULTS & REVIEW SCREEN ───── */}
      {gameState === 'results' && (
        <div className="results-panel flex-1 flex flex-col justify-start p-4">
          
          {/* Top banner summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-6 rounded-3xl bg-slate-900/60 border border-white/5 mb-6 mt-2">
            
            {/* Left: Medal / Trophy display */}
            <div className="text-center md:text-left flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/10 mx-auto md:mx-0">
                <Trophy fill="white" size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-100">Review Completed!</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Quiz: {selectedQuiz.title}</p>
              </div>
            </div>

            {/* Middle: Score stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black block">Your Score</span>
                <span className="text-2xl font-black text-slate-200">
                  {Math.round(selectedQuiz.lastScore * selectedQuiz.questions.length / 100)} / {selectedQuiz.questions.length}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black block">Accuracy</span>
                <span className="text-2xl font-black text-emerald-400">{selectedQuiz.lastScore}%</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleStartQuiz}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs transition-colors cursor-pointer"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Back to Lobby
              </button>
            </div>
          </div>

          {/* Topic Performance Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
              <span className="text-[9px] text-emerald-400 uppercase font-black block mb-2">Strong Topics</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedQuiz.lastScore >= 60 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-500/20">
                    {selectedQuiz.questions[0].topic} Basics (High Mastery)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Answer correctly to build strong topics.</span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5">
              <span className="text-[9px] text-rose-400 uppercase font-black block mb-2">Needs Improvement</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedQuiz.lastScore < 80 ? (
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-rose-500/20">
                    {selectedQuiz.questions[0].topic} Operations (Focus Needed)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Excellent accuracy across all topics!</span>
                )}
              </div>
            </div>
          </div>

          {/* Per-Question Review List */}
          <div className="flex-1 space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Per-Question Review</h3>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {selectedQuiz.questions.map((q, idx) => {
                const userAns = answers[q.id];
                const isCorrect = userAns === q.correct;
                
                return (
                  <div key={q.id} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Question {idx + 1}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isCorrect ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-200">{q.question}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Your Answer</span>
                        <span className={`font-semibold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({userAns || '-'}) {q.options[userAns] || 'Unanswered'}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase">Correct Option</span>
                        <span className="font-semibold text-emerald-400">
                          ({q.correct}) {q.options[q.correct]}
                        </span>
                      </div>
                    </div>

                    {/* Explanations section */}
                    <div className="p-3 bg-slate-950 rounded-lg border border-white/5 text-[11px] text-slate-400 mt-2 leading-relaxed">
                      <strong className="text-cyan-400">Explanation:</strong> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

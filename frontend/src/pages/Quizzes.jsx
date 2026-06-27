import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Lock, Play, ArrowLeft, CheckCircle2, XCircle, 
  HelpCircle, Timer, Award, Star, Flame, RotateCcw, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const SUBJECTS = ['Java', 'Advanced Java', 'Python', 'DSA', 'DBMS'];

// Generates mock questions dynamically based on level and difficulty to ensure 100 levels work instantly
const generateQuestionsForLevel = (subject, level) => {
  const diff = level <= 30 ? 'Easy' : level <= 70 ? 'Medium' : 'Hard';
  
  return Array.from({ length: 10 }, (_, idx) => {
    const qNum = (level - 1) * 10 + idx + 1;
    let questionText = `[Level ${level}] ${subject} Concept Question #${qNum}`;
    let options = {
      a: 'Option A: Basic implementation concept',
      b: 'Option B: Optimized execution statement',
      c: 'Option C: Alternative dynamic algorithm',
      d: 'Option D: None of the above'
    };
    let correct = 'b';
    let explanation = `This is a simulated explanation for ${subject} Level ${level} Q${idx + 1}. Resolves correctly with Option B.`;

    if (subject === 'Java' || subject === 'Advanced Java') {
      if (idx % 3 === 0) {
        questionText = `Under Level ${level}, which statement describes polymorphic runtime bindings?`;
        options = {
          a: 'Determined at compile time static bindings',
          b: 'Resolved dynamically at execution runtime',
          c: 'Requires static methods exclusively',
          d: 'Restricts subclasses from overriding methods'
        };
        correct = 'b';
      } else if (idx % 3 === 1) {
        questionText = `What is the expected complexity of binary search lookup operations under level ${level}?`;
        options = { a: 'O(N)', b: 'O(log N)', c: 'O(N log N)', d: 'O(1)' };
        correct = 'b';
      }
    } else if (subject === 'Python') {
      if (idx % 2 === 0) {
        questionText = `Which python slice returns the reverse order of string references?`;
        options = { a: 'str[0:-1]', b: 'str[::-1]', c: 'str[-1:0]', d: 'str.reverse()' };
        correct = 'b';
      }
    }

    return {
      id: `q-${subject}-${level}-${idx}`,
      question: questionText,
      options,
      correct,
      difficulty: diff,
      explanation
    };
  });
};

export default function Quizzes() {
  const [selectedSubject, setSelectedSubject] = useState('Java');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevels, setUnlockedLevels] = useState({}); // { 'Java': 3, 'Python': 1 }
  
  // Quiz states
  const [viewState, setViewState] = useState('lobby'); // lobby, quiz, result
  const [activeLevel, setActiveLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answersLog, setAnswersLog] = useState({}); // { questionIdx: 'a' }
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for 10 questions
  const timerRef = useRef(null);

  // Load progress from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('eduverse_arena_levels');
    if (saved) {
      setUnlockedLevels(JSON.parse(saved));
    } else {
      const initial = {};
      SUBJECTS.forEach(s => { initial[s] = 1; });
      setUnlockedLevels(initial);
    }
  }, []);

  // Save progress
  const saveProgress = (subject, levelCompleted) => {
    const currentUnlocked = unlockedLevels[subject] || 1;
    if (levelCompleted >= currentUnlocked && currentUnlocked < 100) {
      const updated = {
        ...unlockedLevels,
        [subject]: currentUnlocked + 1
      };
      setUnlockedLevels(updated);
      localStorage.setItem('eduverse_arena_levels', JSON.stringify(updated));
    }
  };

  const handleStartLevel = (levelNum) => {
    const targetUnlocked = unlockedLevels[selectedSubject] || 1;
    if (levelNum > targetUnlocked) {
      toast.error('This level is locked! Complete previous levels first.');
      return;
    }

    const levelQuestions = generateQuestionsForLevel(selectedSubject, levelNum);
    setQuestions(levelQuestions);
    setActiveLevel(levelNum);
    setActiveQuestionIdx(0);
    setSelectedAnswer('');
    setAnswersLog({});
    setShowExplanation(false);
    setScore(0);
    setTimeLeft(180); // 3 minutes
    setViewState('quiz');
    toast.success(`Starting Level ${levelNum}!`);
  };

  // Timer loop
  useEffect(() => {
    if (viewState === 'quiz' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && viewState === 'quiz') {
      handleCompleteQuiz();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, viewState]);

  const handleSelectAnswer = (optionKey) => {
    if (showExplanation) return; // Cannot change answer after submit
    setSelectedAnswer(optionKey);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast.error('Please select an option.');
      return;
    }

    const currentQ = questions[activeQuestionIdx];
    const isCorrect = selectedAnswer === currentQ.correct;
    
    setAnswersLog(prev => ({
      ...prev,
      [activeQuestionIdx]: selectedAnswer
    }));

    if (isCorrect) {
      setScore(prev => prev + 1);
      toast.success('Correct answer!');
    } else {
      toast.error('Wrong answer!');
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (activeQuestionIdx < questions.length - 1) {
      setActiveQuestionIdx(prev => prev + 1);
      setSelectedAnswer(answersLog[activeQuestionIdx + 1] || '');
      setShowExplanation(false);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = () => {
    clearTimeout(timerRef.current);
    setViewState('result');
    const finalScore = score;
    
    // Unlock next level if score is passing (e.g. 70% or more)
    if (finalScore >= 7) {
      saveProgress(selectedSubject, activeLevel);
      toast.success(`Congratulations! You passed Level ${activeLevel}!`);
    } else {
      toast.error(`You need at least 70% (7/10) to pass. Try again!`);
    }
  };

  const getDifficultyRange = (lvl) => {
    if (lvl <= 30) return { label: 'Easy', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' };
    if (lvl <= 70) return { label: 'Medium', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' };
    return { label: 'Hard', color: 'text-rose-400 border-rose-500/20 bg-rose-500/5' };
  };

  const unlockedCount = unlockedLevels[selectedSubject] || 1;

  return (
    <div className="quiz-arena-container h-full flex flex-col relative overflow-y-auto">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ───── LOBBY / LEVEL SELECTOR ───── */}
      {viewState === 'lobby' && (
        <div className="flex-1 flex flex-col justify-start">
          {/* Top Navbar Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5 mb-5 mt-2">
            <div>
              <h1 className="lobby-title font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">Quiz Arena</h1>
              <p className="text-slate-500 text-xs mt-1">Conquer 100 levels per subject. Unravel increasingly difficult theoretical concepts.</p>
            </div>

            {/* Subject selector tab row */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              {SUBJECTS.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedSubject === sub 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/15' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Overview Panel */}
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Subject Progress</span>
              <h3 className="text-lg font-black text-slate-800">{selectedSubject} Master Roadmap</h3>
              <p className="text-xs text-slate-500">Unlocked Level {unlockedCount} / 100. Progress: {((unlockedCount - 1) / 100 * 100).toFixed(0)}%</p>
            </div>

            {/* Progress bar */}
            <div className="w-full md:w-64 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(unlockedCount - 1) / 100 * 100}%` }}
              />
            </div>
          </div>

          {/* 100 Levels Grid progression */}
          <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1">🏆 Arena levels (1 - 100)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
            {Array.from({ length: 100 }, (_, idx) => {
              const levelNum = idx + 1;
              const isLocked = levelNum > unlockedCount;
              const diff = getDifficultyRange(levelNum);

              return (
                <button
                  key={levelNum}
                  onClick={() => handleStartLevel(levelNum)}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between items-center text-center h-24 ${
                    isLocked 
                      ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed' 
                      : 'bg-white border-purple-200 hover:border-purple-400 text-slate-700 hover:bg-purple-50/20'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold border ${diff.color}`}>
                      {diff.label}
                    </span>
                    {isLocked ? <Lock size={10} /> : <Star size={10} className="text-amber-500 fill-amber-500" />}
                  </div>
                  
                  <span className="font-extrabold text-sm block mt-2">Lvl {levelNum}</span>
                  <span className="text-[8px] text-slate-400 block mt-1">10 Questions</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ───── INTERACTIVE QUIZ ENGINE WORKSPACE ───── */}
      {viewState === 'quiz' && questions.length > 0 && (
        <div className="flex-1 flex flex-col justify-between">
          {/* Top Panel Bar */}
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewState('lobby')} 
                className="exit-btn p-1.5 rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 cursor-pointer transition-all"
              >
                <ArrowLeft size={14} />
              </button>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{selectedSubject} Level {activeLevel}</span>
                <h3 className="text-xs font-black text-slate-800">10-Question Progress suite</h3>
              </div>
            </div>

            {/* Timer chip */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600 border border-slate-200">
              <Timer size={14} />
              <span className="text-xs font-mono font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Main Question box */}
          <div className="flex-1 max-w-3xl mx-auto w-full bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>QUESTION {activeQuestionIdx + 1} OF 10</span>
                <span>Diff: {questions[activeQuestionIdx].difficulty}</span>
              </div>

              <h2 className="text-sm font-extrabold text-slate-800 leading-relaxed">
                {questions[activeQuestionIdx].question}
              </h2>

              {/* Options list */}
              <div className="grid grid-cols-1 gap-2.5 pt-3">
                {Object.entries(questions[activeQuestionIdx].options).map(([key, optText]) => {
                  const isSelected = selectedAnswer === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectAnswer(key)}
                      className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected 
                          ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/15' 
                          : 'bg-slate-50 border-slate-200/60 text-slate-700 hover:bg-slate-100/50'
                      }`}
                    >
                      <span className="uppercase font-extrabold mr-2 text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded">
                        {key}
                      </span>
                      {optText}
                    </button>
                  );
                })}
              </div>

              {/* Solution/Explanation drawer */}
              {showExplanation && (
                <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-xs text-slate-700 space-y-2">
                  <strong className="text-purple-600 block">Tutor Explanation:</strong>
                  <p>{questions[activeQuestionIdx].explanation}</p>
                </div>
              )}
            </div>

            {/* Nav footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6">
              <span className="text-[10px] text-slate-400">Lock in your selection before proceeding.</span>
              
              {!showExplanation ? (
                <button 
                  onClick={handleSubmitAnswer}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Submit Answer
                </button>
              ) : (
                <button 
                  onClick={handleNextQuestion}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {activeQuestionIdx < 9 ? 'Next Question' : 'View Result'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ───── QUIZ RESULTS SHEET ───── */}
      {viewState === 'result' && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-md space-y-6">
            <Trophy size={48} className="text-amber-500 mx-auto fill-amber-500/10" />
            
            <div>
              <h2 className="text-lg font-black text-slate-800">Level {activeLevel} Completed!</h2>
              <p className="text-xs text-slate-500 mt-1">{selectedSubject} Master Progression</p>
            </div>

            <div className="p-5 bg-slate-50 border rounded-2xl grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Correct Answers</span>
                <span className="text-lg font-extrabold text-slate-700">{score} / 10</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Result Score</span>
                <span className={`text-lg font-extrabold ${score >= 7 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {score * 10}%
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setViewState('lobby')}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
              >
                Back to Lobby
              </button>
              <button 
                onClick={() => handleStartLevel(activeLevel)}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Retry Level
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

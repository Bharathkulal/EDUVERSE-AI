import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, Zap, Shield, Play, Pause, SkipForward, RefreshCw, Star, Target, Crosshair, Award, Code2, Clock, RotateCcw, ChevronRight } from 'lucide-react';
import { animateXP, animateCombo, animateLevelUp, xpBurst, shakeError, countdown } from '../utils/gameAnimations';

const SUBJECTS = [
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'csharp', name: 'C#', icon: '🔷' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'html', name: 'HTML', icon: '🌐' },
  { id: 'css', name: 'CSS', icon: '🎨' },
  { id: 'dbms', name: 'DBMS / SQL', icon: '🗄️' },
  { id: 'c', name: 'C', icon: '👾' },
  { id: 'cpp', name: 'C++', icon: '🚀' },
  { id: 'advjava', name: 'Advanced Java', icon: '⚡' }
];

const SNIPPETS_BY_SUBJECT = {
  java: [
    { title: 'Class Declaration & Main Method', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, EduVerse!");\n    }\n}' },
    { title: 'Enhanced For Loop', code: 'int[] numbers = {1, 2, 3, 4, 5};\nfor (int num : numbers) {\n    System.out.println("Number: " + num);\n}' },
    { title: 'Binary Search Algorithm', code: 'int binarySearch(int[] arr, int target) {\n    int low = 0, high = arr.length - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}' }
  ],
  csharp: [
    { title: 'LINQ Query Syntax', code: 'var query = from student in students\n            where student.Age > 18\n            select student;\nforeach (var std in query) {\n    Console.WriteLine(std.Name);\n}' },
    { title: 'Properties & Constructor', code: 'public class Student {\n    public string Name { get; set; }\n    public Student(string name) {\n        Name = name;\n    }\n}' }
  ],
  python: [
    { title: 'List Comprehension', code: 'squares = [x ** 2 for x in range(10)]\nprint(squares)' },
    { title: 'Function Definition', code: 'def greet(name):\n    print(f"Hello, {name}!")\n\ngreet("EduVerse")' },
    { title: 'Lambda & Map Filter', code: 'nums = [1, 2, 3, 4, 5]\nevens = list(filter(lambda x: x % 2 == 0, nums))\nprint(evens)' }
  ],
  html: [
    { title: 'Semantic Layout Structure', code: '<div className="container">\n    <header>\n        <h1>EduVerse</h1>\n    </header>\n    <main>\n        <p>Interactive learning portal.</p>\n    </main>\n</div>' }
  ],
  css: [
    { title: 'Flexbox Centering & Transitions', code: '.flex-container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    transition: all 0.3s ease-in-out;\n}' }
  ],
  dbms: [
    { title: 'SQL Aggregate Grouping', code: 'SELECT department_id, COUNT(*), AVG(salary)\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5;' }
  ],
  c: [
    { title: 'Pointer Swap Function', code: 'void swap(int *x, int *y) {\n    int temp = *x;\n    *x = *y;\n    *y = temp;\n}' }
  ],
  cpp: [
    { title: 'Vector Iteration', code: '#include <vector>\n#include <iostream>\n\nint main() {\n    std::vector<int> vec = {1, 2, 3};\n    for (int x : vec) {\n        std::cout << x << std::endl;\n    }\n}' }
  ],
  advjava: [
    { title: 'CompletableFuture Stream Async', code: 'CompletableFuture.supplyAsync(() -> "Data Fetch")\n    .thenApply(data -> data + " Parsed")\n    .thenAccept(System.out::println);' }
  ]
};

import GlobalBackButton from '../components/GlobalBackButton';
export default function TypingQuest({ onExit }) {
  // Saved stats or fallback defaults
  const savedStats = JSON.parse(localStorage.getItem('typing_quest_stats')) || {
    level: 1,
    xp: 0,
    streak: 12,
    highWpm: 0
  };

  const [activeSubject, setActiveSubject] = useState('java');
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lineInput, setLineInput] = useState('');
  
  // Game Stats
  const [xp, setXp] = useState(savedStats.xp);
  const [level, setLevel] = useState(savedStats.level);
  const [xpRequired] = useState(1000);
  const [streak, setStreak] = useState(savedStats.streak);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [charsTyped, setCharsTyped] = useState(0);
  const [correctCharsCount, setCorrectCharsCount] = useState(0);
  
  // Game State
  const [gameState, setGameState] = useState('countdown'); // countdown, playing, completed, failed
  const [countdownNum, setCountdownNum] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Time limits
  const [levelDuration, setLevelDuration] = useState(60);
  const [startTime, setStartTime] = useState(null);

  const inputRef = useRef(null);
  const xpBarRef = useRef(null);
  const comboRef = useRef(null);
  const countdownRef = useRef(null);
  const levelRef = useRef(null);
  const containerRef = useRef(null);

  const snippets = SNIPPETS_BY_SUBJECT[activeSubject] || SNIPPETS_BY_SUBJECT['java'];
  const currentSnippet = snippets[snippetIndex % snippets.length];
  const snippetLines = currentSnippet.code.split('\n');

  // Trigger when level completes / fails to persist
  useEffect(() => {
    localStorage.setItem('typing_quest_stats', JSON.stringify({
      level,
      xp,
      streak,
      highWpm: Math.max(savedStats.highWpm, wpm)
    }));
  }, [level, xp, streak, wpm]);

  // Start Countdown Sequence
  useEffect(() => {
    if (gameState === 'countdown') {
      const interval = setInterval(() => {
        setCountdownNum(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState('playing');
            setStartTime(Date.now());
            // Dynamic time based on code length (roughly 2.5 characters per second)
            const duration = Math.max(30, Math.round(currentSnippet.code.length * 0.45));
            setTimeLeft(duration);
            setLevelDuration(duration);
            return 'GO!';
          }
          if (countdownRef.current) countdown(countdownRef.current);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, snippetIndex, activeSubject]);

  // Countdown timer during play
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('failed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, timeLeft]);

  // Focus Input
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, currentLineIndex]);

  // WPM Calculation
  useEffect(() => {
    if (startTime && gameState === 'playing') {
      const interval = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 60000;
        const wordsTyped = charsTyped / 5;
        setWpm(Math.round(wordsTyped / timeElapsed) || 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, gameState, charsTyped]);

  const handleInput = (e) => {
    if (gameState !== 'playing') return;
    const value = e.target.value;
    const targetLine = snippetLines[currentLineIndex];
    
    // Prevent typing beyond the length of the current line
    if (value.length > targetLine.length) return;

    const lastCharIndex = value.length - 1;
    
    if (value.length > lineInput.length) {
      const typedChar = value[lastCharIndex];
      const targetChar = targetLine[lastCharIndex];
      
      if (typedChar === targetChar) {
        // Correct Input
        setCharsTyped(prev => prev + 1);
        setCorrectCharsCount(prev => prev + 1);
        const newXp = xp + 2 * combo;
        
        if (newXp >= xpRequired) {
          setXp(newXp - xpRequired);
          setLevel(prev => prev + 1);
          if (levelRef.current) animateLevelUp(levelRef.current);
        } else {
          setXp(newXp);
        }

        if (xpBarRef.current) {
          animateXP(xpBarRef.current, ((newXp % xpRequired) / xpRequired) * 100);
        }
        
        // Combo multiplier increment
        if (charsTyped % 8 === 0) {
          const newCombo = Math.min(combo + 1, 10);
          setCombo(newCombo);
          if (comboRef.current) animateCombo(comboRef.current, newCombo);
        }
      } else {
        // Wrong Input
        setCharsTyped(prev => prev + 1);
        const charEl = document.getElementById(`char-${currentLineIndex}-${lastCharIndex}`);
        if (charEl) shakeError(charEl);
        
        setCombo(1);
        if (comboRef.current) animateCombo(comboRef.current, 1);
        
        // Deduct lives for errors
        setLives(prev => {
          if (prev <= 1) {
            setGameState('failed');
            return 0;
          }
          return prev - 1;
        });
      }
    }

    setLineInput(value);
    setAccuracy(charsTyped === 0 ? 100 : Math.round((correctCharsCount / charsTyped) * 100));

    // Auto-advance if line is typed completely and correctly
    if (value === targetLine) {
      if (currentLineIndex === snippetLines.length - 1) {
        setGameState('completed');
        if (containerRef.current) xpBurst(containerRef.current);
      } else {
        setCurrentLineIndex(prev => prev + 1);
        setLineInput('');
      }
    }
  };

  // Prevent default Tab behavior to keep focus, and type the spaces
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const targetLine = snippetLines[currentLineIndex];
      const typedSoFar = lineInput;
      const remainingTarget = targetLine.substring(typedSoFar.length);
      
      // If the upcoming characters in target line are spaces (indentation), autocomplete them
      if (remainingTarget.startsWith('    ')) {
        setLineInput(prev => prev + '    ');
        setCharsTyped(prev => prev + 4);
        setCorrectCharsCount(prev => prev + 4);
      } else if (remainingTarget.startsWith('  ')) {
        setLineInput(prev => prev + '  ');
        setCharsTyped(prev => prev + 2);
        setCorrectCharsCount(prev => prev + 2);
      } else {
        // Just insert standard 4 spaces
        setLineInput(prev => prev + '    ');
        setCharsTyped(prev => prev + 4);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Allow moving next if input matches perfectly
      if (lineInput === snippetLines[currentLineIndex]) {
        if (currentLineIndex === snippetLines.length - 1) {
          setGameState('completed');
          if (containerRef.current) xpBurst(containerRef.current);
        } else {
          setCurrentLineIndex(prev => prev + 1);
          setLineInput('');
        }
      }
    }
  };

  const handleRestart = () => {
    setLineInput('');
    setCurrentLineIndex(0);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setCharsTyped(0);
    setCorrectCharsCount(0);
    setCombo(1);
    setLives(3);
    setGameState('countdown');
    setCountdownNum(3);
  };

  const nextLevel = () => {
    // Progress level snippet or cycle
    setSnippetIndex(prev => prev + 1);
    handleRestart();
  };

  const changeSubject = (subId) => {
    setActiveSubject(subId);
    setSnippetIndex(0);
    setLineInput('');
    setCurrentLineIndex(0);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setCharsTyped(0);
    setCorrectCharsCount(0);
    setCombo(1);
    setLives(3);
    setGameState('countdown');
    setCountdownNum(3);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#071225] text-white overflow-hidden flex flex-col md:flex-row font-sans"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #111c33 0%, #071225 100%)' }}
    >
      {/* DESKTOP LEFT PANEL (Progress) */}
      <div className="hidden md:flex w-[280px] bg-[#111c33]/80 backdrop-blur-xl border-r border-[#4f8cff]/20 flex-col p-6 shadow-[5px_0_30px_rgba(0,0,0,0.5)] z-10">
        <GlobalBackButton className="mb-8 w-full justify-center" variant="floating" label="Exit Arena" />

        <div className="text-center mb-6">
          <div 
            ref={levelRef}
            className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#4f8cff] to-purple-600 p-1 mb-4 shadow-[0_0_20px_rgba(79,140,255,0.4)]"
          >
            <div className="w-full h-full bg-[#111c33] rounded-full flex flex-col items-center justify-center border-2 border-transparent">
              <span className="text-[10px] text-[#4f8cff] font-bold tracking-widest uppercase">Level</span>
              <span className="text-3xl font-extrabold text-white">{level}</span>
            </div>
          </div>
          <h3 className="text-md font-bold text-white/80">Infinity Typist</h3>
        </div>

        {/* Subject Selection Side Menu */}
        <div className="flex-1 flex flex-col min-h-0">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Choose Subject</span>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
            {SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                onClick={() => changeSubject(sub.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-semibold transition ${
                  activeSubject === sub.id
                    ? 'bg-[#4f8cff] text-white shadow-[0_0_12px_rgba(79,140,255,0.3)]'
                    : 'bg-[#071225]/40 hover:bg-[#071225]/80 text-white/70'
                }`}
              >
                <span>{sub.icon}</span>
                <span>{sub.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/60 font-semibold">XP Progress</span>
            <span className="text-[#4f8cff] font-bold">{xp} / {xpRequired} XP</span>
          </div>
          <div className="h-2.5 w-full bg-[#071225] rounded-full overflow-hidden border border-white/5 relative">
            <div 
              ref={xpBarRef}
              className="h-full bg-gradient-to-r from-[#4f8cff] to-cyan-400 shadow-[0_0_10px_rgba(79,140,255,0.8)]"
              style={{ width: `${(xp / xpRequired) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* CENTER AREA (Arena + HUDs) */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* TOP HUD */}
        <div className="h-20 bg-[#111c33]/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-white/50 font-semibold uppercase tracking-wider">Level {level} Arena</span>
              <span className="text-md font-bold text-white flex items-center gap-2">
                <Code2 size={16} className="text-[#4f8cff]" /> {currentSnippet.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Countdown timer HUD */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              timeLeft < 10 
                ? 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse'
                : 'border-white/10 bg-[#071225]/80 text-[#4f8cff]'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-sm">{timeLeft}s</span>
            </div>

            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-5 h-5 ${i < lives ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-white/10'}`} 
                  fill={i < lives ? "currentColor" : "none"} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* MAIN GAME ARENA (Line-by-line editor view) */}
        <div 
          className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4f8cff]/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Line-by-Line Code Workspace */}
          <div className="w-full max-w-3xl relative z-10 font-mono">
            <div className="bg-[#0a1122]/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-3 min-h-[250px]">
              
              {/* Render Completed Lines */}
              {snippetLines.slice(0, currentLineIndex).map((line, idx) => (
                <div key={idx} className="text-[#22c55e] opacity-50 select-none whitespace-pre-wrap">
                  {line}
                </div>
              ))}

              {/* Active Typing Line */}
              <div className="relative py-2 px-3 bg-[#4f8cff]/10 border border-[#4f8cff]/30 rounded-xl shadow-[0_0_15px_rgba(79,140,255,0.1)]">
                <div className="whitespace-pre-wrap select-none text-xl leading-relaxed break-all relative">
                  {snippetLines[currentLineIndex].split('').map((char, charIdx) => {
                    let colorClass = 'text-white/30';
                    let isCurrent = charIdx === lineInput.length;
                    
                    if (charIdx < lineInput.length) {
                      if (lineInput[charIdx] === char) {
                        colorClass = 'text-[#22c55e] font-bold drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]';
                      } else {
                        colorClass = 'text-[#ef4444] bg-[#ef4444]/20 border-b border-[#ef4444]';
                      }
                    } else if (isCurrent && gameState === 'playing') {
                      colorClass = 'text-white bg-[#4f8cff]/30 border-l border-[#4f8cff] animate-pulse';
                    }

                    return (
                      <span key={charIdx} id={`char-${currentLineIndex}-${charIdx}`} className={colorClass}>
                        {char}
                      </span>
                    );
                  })}
                </div>
                
                {/* Hidden Textarea for exact typing Capture */}
                <textarea
                  ref={inputRef}
                  value={lineInput}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  disabled={gameState !== 'playing'}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="absolute inset-0 opacity-0 cursor-default w-full h-full resize-none z-10"
                />
              </div>

              {/* Render Upcoming Lines */}
              {snippetLines.slice(currentLineIndex + 1).map((line, idx) => (
                <div key={idx} className="text-white/20 select-none whitespace-pre-wrap">
                  {line}
                </div>
              ))}

            </div>
            
            <div className="mt-3 flex justify-between items-center text-xs text-white/40 px-2">
              <span>Press <kbd className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Tab</kbd> to autocomplete indentation spaces.</span>
              <span>Press <kbd className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Enter</kbd> to submit line.</span>
            </div>
          </div>

          {/* OVERLAYS */}
          <AnimatePresence>
            {/* Countdown Overlay */}
            {gameState === 'countdown' && (
              <motion.div 
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#071225]/85 backdrop-blur-sm"
              >
                <div ref={countdownRef} className="text-8xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
                  {countdownNum}
                </div>
              </motion.div>
            )}

            {/* Level Cleared Success Screen */}
            {gameState === 'completed' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#071225]/90 backdrop-blur-md"
              >
                <div className="bg-[#111c33] p-8 rounded-3xl border border-[#4f8cff]/50 shadow-[0_0_50px_rgba(79,140,255,0.3)] text-center max-w-md w-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4f8cff] to-purple-500" />
                  
                  <Award className="w-16 h-16 text-[#4f8cff] mx-auto mb-4 animate-bounce" />
                  <h3 className="text-3xl font-black text-white mb-1">Level Cleared!</h3>
                  <p className="text-[#4f8cff] font-bold text-lg mb-6">+{Math.floor(currentSnippet.code.length * 1.5)} XP Gained</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#071225] p-3 rounded-2xl border border-white/5">
                      <div className="text-white/50 text-xs mb-1 uppercase tracking-wider">Accuracy</div>
                      <div className="text-xl font-bold text-[#22c55e]">{accuracy}%</div>
                    </div>
                    <div className="bg-[#071225] p-3 rounded-2xl border border-white/5">
                      <div className="text-white/50 text-xs mb-1 uppercase tracking-wider">Speed</div>
                      <div className="text-xl font-bold text-[#4f8cff]">{wpm} WPM</div>
                    </div>
                  </div>

                  <button 
                    onClick={nextLevel} 
                    className="w-full py-3.5 bg-gradient-to-r from-[#4f8cff] to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold rounded-2xl transition shadow-[0_0_20px_rgba(79,140,255,0.4)] flex items-center justify-center gap-2"
                  >
                    Next Level <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Level Failed Screen */}
            {gameState === 'failed' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#071225]/95 backdrop-blur-md"
              >
                <div className="bg-[#111c33] p-8 rounded-3xl border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-center max-w-md w-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                  
                  <RotateCcw className="w-16 h-16 text-red-500 mx-auto mb-4 animate-spin-slow" />
                  <h3 className="text-3xl font-black text-white mb-2">Level Failed</h3>
                  <p className="text-white/70 text-sm mb-6">
                    {timeLeft === 0 ? "You ran out of time! Speed up your typing speed." : "Too many typos! Watch your accuracy."}
                  </p>
                  
                  <button 
                    onClick={handleRestart} 
                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} /> Try Level Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM HUD */}
        <div className="h-24 bg-[#111c33]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-6 z-20">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider flex items-center gap-1"><Zap className="w-3 h-3"/> Speed</span>
              <span className="text-2xl font-mono font-black text-white">{wpm} WPM</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider flex items-center gap-1"><Target className="w-3 h-3"/> Accuracy</span>
              <span className="text-2xl font-mono font-black text-[#22c55e]">{accuracy}%</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleRestart} className="p-3 bg-[#071225] hover:bg-white/5 border border-white/10 rounded-2xl transition flex items-center gap-2 group">
              <RefreshCw className="w-4 h-4 text-white/60 group-hover:text-white transition" />
              <span className="hidden md:block font-bold text-white/80 group-hover:text-white text-xs">Restart</span>
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP RIGHT PANEL (Rewards & Stats) */}
      <div className="hidden lg:flex w-[300px] bg-[#111c33]/80 backdrop-blur-xl border-l border-[#4f8cff]/20 flex-col p-6 shadow-[-5px_0_30px_rgba(0,0,0,0.5)] z-10">
        {/* Combo Tracker */}
        <div className="bg-[#071225] rounded-3xl p-5 border border-white/5 mb-6 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4f8cff]/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />
          <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" /> Combo Multiplier
          </div>
          <div 
            ref={comboRef}
            className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#4f8cff] to-purple-400 drop-shadow-[0_0_15px_rgba(79,140,255,0.5)]"
          >
            x{combo}
          </div>
        </div>

        {/* High Stats Summary */}
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Quest Records</h4>
        <div className="space-y-3 bg-[#071225]/50 border border-white/5 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">High speed:</span>
            <span className="font-bold text-white">{savedStats.highWpm} WPM</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">Best Streak:</span>
            <span className="font-bold text-orange-400">{streak} Days</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/60">Total XP earned:</span>
            <span className="font-bold text-blue-400">{xp} XP</span>
          </div>
        </div>

        {/* Badges */}
        <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-4">Arena Rewards</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="aspect-square bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 flex items-center justify-center hover:scale-105 transition shadow-[0_0_15px_rgba(234,179,8,0.15)]">
            <Star className="w-8 h-8 text-yellow-400" fill="currentColor" />
          </div>
          <div className="aspect-square bg-gradient-to-br from-[#4f8cff]/20 to-cyan-500/20 rounded-2xl border border-[#4f8cff]/30 flex items-center justify-center hover:scale-105 transition">
            <Target className="w-8 h-8 text-[#4f8cff]" />
          </div>
          <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 flex items-center justify-center hover:scale-105 transition flex-col">
            <span className="text-[10px] font-bold text-purple-300">WPM</span>
            <span className="text-lg font-black text-purple-400">{Math.max(savedStats.highWpm, wpm)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

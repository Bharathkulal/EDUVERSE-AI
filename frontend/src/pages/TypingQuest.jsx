import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, Zap, Shield, Play, Pause, SkipForward, RefreshCw, Star, Target, Crosshair, Award } from 'lucide-react';
import { animateXP, animateCombo, animateLevelUp, xpBurst, shakeError, countdown } from '../utils/gameAnimations';

const CODE_SNIPPETS = [
  {
    language: 'JavaScript',
    title: 'Fibonacci Sequence',
    difficulty: 'Beginner',
    code: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\nconsole.log(fibonacci(10));`
  },
  {
    language: 'Python',
    title: 'Quick Sort',
    difficulty: 'Intermediate',
    code: `def quicksort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quicksort(left) + middle + quicksort(right)`
  }
];

export default function TypingQuest({ onExit }) {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [inputValues, setInputValues] = useState('');
  const [startTime, setStartTime] = useState(null);
  
  // Game Stats
  const [xp, setXp] = useState(1240);
  const [level, setLevel] = useState(12);
  const [xpRequired] = useState(2500);
  const [streak, setStreak] = useState(14);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  // Game State
  const [gameState, setGameState] = useState('countdown'); // countdown, playing, completed, failed
  const [countdownNum, setCountdownNum] = useState(3);
  
  const inputRef = useRef(null);
  const xpBarRef = useRef(null);
  const comboRef = useRef(null);
  const countdownRef = useRef(null);
  const levelRef = useRef(null);
  const containerRef = useRef(null);

  const currentSnippet = CODE_SNIPPETS[snippetIndex];

  // Start Countdown Sequence
  useEffect(() => {
    if (gameState === 'countdown') {
      const interval = setInterval(() => {
        setCountdownNum(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState('playing');
            setStartTime(Date.now());
            return 'GO!';
          }
          if (countdownRef.current) countdown(countdownRef.current);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Focus Input
  useEffect(() => {
    if (gameState === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, inputValues]);

  // WPM Calculation
  useEffect(() => {
    if (startTime && gameState === 'playing') {
      const interval = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 60000;
        const wordsTyped = inputValues.length / 5;
        setWpm(Math.round(wordsTyped / timeElapsed) || 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, gameState, inputValues]);

  const handleInput = (e) => {
    if (gameState !== 'playing') return;
    const value = e.target.value;
    
    if (value.length > currentSnippet.code.length) return;

    const lastCharIndex = value.length - 1;
    
    // Check if new character was typed
    if (value.length > inputValues.length) {
      const typedChar = value[lastCharIndex];
      const targetChar = currentSnippet.code[lastCharIndex];
      
      if (typedChar === targetChar) {
        // Correct Input
        const newXp = xp + 1 * combo;
        setXp(newXp);
        if (xpBarRef.current) {
          animateXP(xpBarRef.current, (newXp / xpRequired) * 100);
        }
        
        // Increase Combo every 10 correct chars
        if (value.length % 10 === 0) {
          const newCombo = Math.min(combo + 1, 50);
          setCombo(newCombo);
          if (comboRef.current) animateCombo(comboRef.current, newCombo);
        }
      } else {
        // Wrong Input
        const charEl = document.getElementById(`char-${lastCharIndex}`);
        if (charEl) shakeError(charEl);
        
        // Reset Combo
        setCombo(1);
        if (comboRef.current) animateCombo(comboRef.current, 1);
      }
    }

    setInputValues(value);

    // Calculate Accuracy
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentSnippet.code[i]) correctChars++;
    }
    setAccuracy(value.length === 0 ? 100 : Math.round((correctChars / value.length) * 100));

    // Level Complete
    if (value.length === currentSnippet.code.length && correctChars === value.length) {
      setGameState('completed');
      if (containerRef.current) xpBurst(containerRef.current);
    }
  };

  const handleRestart = () => {
    setInputValues('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setCombo(1);
    setGameState('countdown');
    setCountdownNum(3);
  };

  const nextSnippet = () => {
    setSnippetIndex((prev) => (prev + 1) % CODE_SNIPPETS.length);
    handleRestart();
  };

  const renderText = () => {
    return currentSnippet.code.split('').map((char, index) => {
      let colorClass = 'text-white/20'; // Ghost code overlay opacity ~20%
      let isError = false;
      let isCurrent = index === inputValues.length;

      if (index < inputValues.length) {
        if (inputValues[index] === char) {
          colorClass = 'text-[#22c55e] font-bold drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]'; // Success Green Glow
        } else {
          colorClass = 'text-[#ef4444] bg-[#ef4444]/20 border-b-2 border-[#ef4444]'; // Error Red
          isError = true;
        }
      } else if (isCurrent && gameState === 'playing') {
        colorClass = 'text-white bg-[#4f8cff]/30 border-l-2 border-[#4f8cff] animate-pulse'; // Current Blue Pulse
      }

      return (
        <span 
          key={index} 
          id={`char-${index}`}
          className={`${colorClass} transition-colors inline-block`}
        >
          {char === '\n' ? '↵\n' : char}
        </span>
      );
    });
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#071225] text-white overflow-hidden flex flex-col md:flex-row font-sans"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #111c33 0%, #071225 100%)' }}
    >
      {/* --- DESKTOP LEFT PANEL (Progress) / MOBILE SLIDE 1 --- */}
      <div className="hidden md:flex w-[280px] bg-[#111c33]/80 backdrop-blur-xl border-r border-[#4f8cff]/20 flex-col p-6 shadow-[5px_0_30px_rgba(0,0,0,0.5)] z-10">
        <div className="flex items-center gap-4 mb-8" onClick={onExit} role="button">
          <div className="w-10 h-10 rounded-xl bg-[#4f8cff]/20 flex items-center justify-center border border-[#4f8cff]/50 hover:bg-[#4f8cff]/40 transition text-[#4f8cff]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </div>
          <span className="font-bold text-lg text-white/80 hover:text-white transition">Exit Arena</span>
        </div>

        <div className="text-center mb-8">
          <div 
            ref={levelRef}
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#4f8cff] to-purple-600 p-1 mb-4 shadow-[0_0_20px_rgba(79,140,255,0.4)]"
          >
            <div className="w-full h-full bg-[#111c33] rounded-full flex flex-col items-center justify-center border-2 border-transparent">
              <span className="text-sm text-[#4f8cff] font-bold tracking-widest uppercase">Level</span>
              <span className="text-4xl font-extrabold text-white">{level}</span>
            </div>
          </div>
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Code Ninja</h3>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60 font-semibold">XP Progress</span>
              <span className="text-[#4f8cff] font-bold">{xp} / {xpRequired}</span>
            </div>
            <div className="h-3 w-full bg-[#071225] rounded-full overflow-hidden border border-white/5 relative shadow-inner">
              <div 
                ref={xpBarRef}
                className="h-full bg-gradient-to-r from-[#4f8cff] to-cyan-400 w-[50%] shadow-[0_0_10px_rgba(79,140,255,0.8)] relative"
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>

          <div className="bg-[#071225]/50 rounded-2xl p-4 border border-white/5">
            <h4 className="text-sm font-bold text-white/60 mb-3 uppercase tracking-wider">Daily Missions</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="text-sm text-white/80 line-through opacity-50">Complete 5 challenges</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border border-white/20"></div>
                <span className="text-sm text-white/80">Reach 100 WPM</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border border-white/20"></div>
                <span className="text-sm text-white/80">50x Combo Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CENTER AREA (Arena + Top/Bottom HUD) --- */}
      <div className="flex-1 flex flex-col relative">
        {/* TOP HUD */}
        <div className="h-20 bg-[#111c33]/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col">
              <span className="text-xs text-white/50 font-semibold uppercase tracking-wider">Arena</span>
              <span className="text-lg font-bold text-white">Typing Quest</span>
            </div>
            {/* Mobile Back Button */}
            <button onClick={onExit} className="md:hidden p-2 text-white/60 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[#071225]/80 px-4 py-2 rounded-xl border border-orange-500/30">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <span className="font-bold text-orange-400">{streak} Day Streak</span>
            </div>
            
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-white/10'}`} fill={i < lives ? "currentColor" : "none"} />
              ))}
            </div>
          </div>
        </div>

        {/* MAIN GAME ARENA */}
        <div 
          className="flex-1 p-4 md:p-12 flex flex-col items-center justify-center relative overflow-hidden"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4f8cff]/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          {/* Snippet Meta */}
          <div className="w-full max-w-4xl flex justify-between items-end mb-6 z-10">
            <div>
              <h2 className="text-3xl font-extrabold text-white mb-2">{currentSnippet.title}</h2>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-[#4f8cff]/20 text-[#4f8cff] rounded-lg text-sm font-bold border border-[#4f8cff]/30 shadow-[0_0_10px_rgba(79,140,255,0.2)]">
                  {currentSnippet.language}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold border border-purple-500/30">
                  {currentSnippet.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="w-full max-w-4xl relative z-10">
            <div className="relative font-mono text-xl md:text-2xl leading-[1.8] tracking-wide bg-[#0a1122]/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              
              {/* The Ghost Code */}
              <div className="whitespace-pre-wrap select-none break-all" style={{ fontFamily: '"Fira Code", monospace' }}>
                {renderText()}
              </div>
              
              {/* Invisible Input */}
              <textarea
                ref={inputRef}
                value={inputValues}
                onChange={handleInput}
                disabled={gameState !== 'playing'}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className="absolute inset-0 opacity-0 cursor-default w-full h-full resize-none z-10"
              />
            </div>
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {gameState === 'countdown' && (
              <motion.div 
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#071225]/80 backdrop-blur-sm"
              >
                <div ref={countdownRef} className="text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">
                  {countdownNum}
                </div>
              </motion.div>
            )}

            {gameState === 'completed' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-[#071225]/90 backdrop-blur-md"
              >
                <div className="bg-[#111c33] p-10 rounded-3xl border border-[#4f8cff]/50 shadow-[0_0_50px_rgba(79,140,255,0.3)] text-center max-w-md w-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#4f8cff] to-purple-500"></div>
                  
                  <Award className="w-24 h-24 text-[#4f8cff] mx-auto mb-6 animate-bounce" />
                  <h3 className="text-4xl font-black text-white mb-2">Level Cleared!</h3>
                  <p className="text-[#4f8cff] font-bold text-xl mb-8">+{Math.floor(currentSnippet.code.length * 1.5)} XP Gained</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#071225] p-4 rounded-2xl border border-white/5">
                      <div className="text-white/50 text-sm mb-1 uppercase tracking-wider">Accuracy</div>
                      <div className="text-2xl font-bold text-[#22c55e]">{accuracy}%</div>
                    </div>
                    <div className="bg-[#071225] p-4 rounded-2xl border border-white/5">
                      <div className="text-white/50 text-sm mb-1 uppercase tracking-wider">Speed</div>
                      <div className="text-2xl font-bold text-[#4f8cff]">{wpm} WPM</div>
                    </div>
                  </div>

                  <button 
                    onClick={nextSnippet} 
                    className="w-full py-4 bg-gradient-to-r from-[#4f8cff] to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-lg rounded-2xl transition shadow-[0_0_20px_rgba(79,140,255,0.5)] hover:shadow-[0_0_30px_rgba(79,140,255,0.8)]"
                  >
                    Next Challenge ▶
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* BOTTOM HUD */}
        <div className="h-24 bg-[#111c33]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-6 z-20">
          
          {/* Live Stats */}
          <div className="flex gap-4 md:gap-8">
            <div className="flex flex-col">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider flex items-center gap-1"><Zap className="w-3 h-3"/> WPM</span>
              <span className="text-2xl md:text-3xl font-mono font-black text-white">{wpm}</span>
            </div>
            <div className="w-px h-10 bg-white/10 hidden md:block"></div>
            <div className="flex flex-col">
              <span className="text-xs text-white/50 font-bold uppercase tracking-wider flex items-center gap-1"><Target className="w-3 h-3"/> Accuracy</span>
              <span className="text-2xl md:text-3xl font-mono font-black text-[#22c55e]">{accuracy}%</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button onClick={handleRestart} className="p-3 md:px-6 md:py-3 bg-[#071225] hover:bg-white/5 border border-white/10 rounded-2xl transition flex items-center gap-2 group">
              <RefreshCw className="w-5 h-5 text-white/60 group-hover:text-white transition" />
              <span className="hidden md:block font-bold text-white/80 group-hover:text-white">Restart</span>
            </button>
            <button onClick={nextSnippet} className="p-3 md:px-6 md:py-3 bg-[#071225] hover:bg-white/5 border border-white/10 rounded-2xl transition flex items-center gap-2 group">
              <SkipForward className="w-5 h-5 text-white/60 group-hover:text-white transition" />
              <span className="hidden md:block font-bold text-white/80 group-hover:text-white">Skip</span>
            </button>
          </div>

        </div>
      </div>

      {/* --- DESKTOP RIGHT PANEL (Rewards & Stats) --- */}
      <div className="hidden lg:flex w-[320px] bg-[#111c33]/80 backdrop-blur-xl border-l border-[#4f8cff]/20 flex-col p-6 shadow-[-5px_0_30px_rgba(0,0,0,0.5)] z-10">
        
        {/* Combo Tracker */}
        <div className="bg-[#071225] rounded-3xl p-6 border border-white/5 mb-6 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4f8cff]/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> Combo Multiplier
          </div>
          <div 
            ref={comboRef}
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#4f8cff] to-purple-400 drop-shadow-[0_0_15px_rgba(79,140,255,0.5)]"
          >
            x{combo}
          </div>
        </div>

        {/* Badges */}
        <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Latest Badges</h4>
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="aspect-square bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-2xl border border-yellow-500/30 flex items-center justify-center hover:scale-110 transition shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Star className="w-8 h-8 text-yellow-400" fill="currentColor" />
          </div>
          <div className="aspect-square bg-gradient-to-br from-[#4f8cff]/20 to-cyan-500/20 rounded-2xl border border-[#4f8cff]/30 flex items-center justify-center hover:scale-110 transition">
            <Target className="w-8 h-8 text-[#4f8cff]" />
          </div>
          <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 flex items-center justify-center hover:scale-110 transition flex-col">
            <span className="text-xs font-bold text-purple-300">WPM</span>
            <span className="text-lg font-black text-purple-400">80</span>
          </div>
        </div>

        {/* Next Reward */}
        <div className="mt-auto">
          <h4 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Next Unlock</h4>
          <div className="bg-gradient-to-br from-[#071225] to-[#111c33] p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/50 text-2xl">
              🚀
            </div>
            <div>
              <div className="font-bold text-white">Speedster Trail</div>
              <div className="text-xs text-white/50">Unlocks at Level 15</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

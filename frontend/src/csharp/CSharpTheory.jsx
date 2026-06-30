import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Zap, BookOpen, CheckCircle, Award, BarChart2,
  HelpCircle, MessageSquare, RefreshCw, Code2, Play, Sparkles, StickyNote,
  Volume2, ShieldAlert, Cpu, Database, ChevronRight, CornerDownRight,
  Sun, Moon, VolumeX, Pause, BrainCircuit, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const CSHARP_THEORY_LESSONS = [
  {
    id: 'intro',
    title: 'C# Fundamentals',
    slug: 'csharp-fundamentals',
    desc: 'Learn the core C# syntax, variables, primitive types, type casting, and console input/output operations.',
    difficulty: 'Beginner',
    time: '45 mins',
    xp: 150,
    accent: '#3B82F6',
    icon: '🔷',
    topics: ['.NET Runtime', 'Syntax', 'Primitive Types', 'Casting', 'Console I/O'],
    chapters: [
      { title: '1. Welcome to C#', content: 'C# is a modern, object-oriented, and type-safe programming language developed by Microsoft.' },
      { title: '2. Common Type System', content: 'In C#, variables are divided into Value Types (stored on stack) and Reference Types (stored on heap).' },
      { title: '3. Standard Input Output', content: 'Use Console.WriteLine() to output text, and Console.ReadLine() to capture user keyboard inputs.' }
    ]
  },
  {
    id: 'control-flow',
    title: 'Control Flow & Logic',
    slug: 'control-flow',
    desc: 'Master conditional branching, pattern-matching switch expressions, and loop iterations.',
    difficulty: 'Beginner',
    time: '40 mins',
    xp: 120,
    accent: '#10B981',
    icon: '🔁',
    topics: ['If Else', 'Switch Pattern', 'For Loop', 'While Loop', 'Foreach'],
    chapters: [
      { title: '1. Conditional Statements', content: 'Use if, else if, and else blocks to conditionally branch execution based on boolean expressions.' },
      { title: '2. Switch Expressions', content: 'C# switch expressions match pattern variables and return values directly in a clean declarative syntax.' },
      { title: '3. Iteration Loops', content: 'Implement for, while, do-while, and foreach loops to iterate through collections efficiently.' }
    ]
  },
  {
    id: 'oop',
    title: 'Object-Oriented Programming',
    slug: 'oop-concepts',
    desc: 'Encapsulation, inheritance, polymorphism, classes, objects, and interface contracts.',
    difficulty: 'Intermediate',
    time: '60 mins',
    xp: 200,
    accent: '#8B5CF6',
    icon: '🏛️',
    topics: ['Classes & Objects', 'Encapsulation', 'Properties', 'Inheritance', 'Interfaces'],
    chapters: [
      { title: '1. Classes and Objects', content: 'Classes are blueprints containing fields, properties, and methods. Objects are active instances allocated in Heap memory.' },
      { title: '2. Encapsulation & Properties', content: 'Protect object state using private backing fields and expose them safely using public C# Properties.' },
      { title: '3. Inheritance & Polymorphism', content: 'Extend classes using a colon (:), override virtual methods, and enforce design contracts via Interfaces.' }
    ]
  },
  {
    id: 'linq',
    title: 'LINQ Query Processing',
    slug: 'linq-queries',
    desc: 'Language Integrated Query structures for filtering, projection, and data manipulations.',
    difficulty: 'Intermediate',
    time: '50 mins',
    xp: 180,
    accent: '#EC4899',
    icon: '🔍',
    topics: ['Linq Basics', 'Query Syntax', 'Lambdas', 'Deferred Execution', 'Filtering'],
    chapters: [
      { title: '1. What is LINQ?', content: 'LINQ enables developer-friendly SQL-like querying directly inside C# code on any enumerable dataset.' },
      { title: '2. Query Syntax vs Method Syntax', content: 'Query syntax resembles SQL (from x in list select x), while Method syntax uses fluent lambdas (.Where(x => x.Active)).' },
      { title: '3. Lazy Evaluation', content: 'LINQ queries are not executed when defined. Execution is deferred until you iterate the query using foreach or .ToList().' }
    ]
  }
];

const BADGES = [
  { id: 'csharp-beginner', name: 'C# Beginner', icon: '🔷', desc: 'Completed C# Fundamentals' },
  { id: 'oop-explorer', name: 'OOP Explorer', icon: '🏛️', desc: 'Completed C# OOP' },
  { id: 'linq-expert', name: 'LINQ Expert', icon: '🔍', desc: 'Completed LINQ Queries' },
  { id: 'net-specialist', name: 'net Specialist', icon: '🌱', desc: 'Completed ASP.NET' }
];

export default function CSharpTheory() {
  const { isDark } = useTheme();
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [activeLessonTab, setActiveLessonTab] = useState('learn'); // 'learn', 'architecture', 'practice', 'quiz', 'projects'
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceGender, setVoiceGender] = useState('female');
  const [notepad, setNotepad] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: 'Ask me to explain this chapter, give examples, or create a practice task!' }
  ]);
  const [aiInput, setAiInput] = useState('');

  // Web Speech synthesis
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const handleSpeak = () => {
    if (!synth) return;
    synth.cancel();
    
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
      return;
    }

    const currentText = selectedLesson.chapters[currentChapterIdx].content;
    const utterance = new SpeechSynthesisUtterance(currentText);
    utterance.rate = voiceSpeed;

    const voices = synth.getVoices();
    let voice = voices.find(v => v.name.toLowerCase().includes(voiceGender === 'female' ? 'zira' : 'david') || v.name.toLowerCase().includes(voiceGender));
    if (voice) utterance.voice = voice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    synth.speak(utterance);
  };

  const handleStop = () => {
    if (synth) {
      synth.cancel();
      setIsPlaying(false);
    }
  };

  const handleCoachAction = (action) => {
    let responseText = '';
    const chapterTitle = selectedLesson.chapters[currentChapterIdx].title;
    
    if (action === 'explain') {
      responseText = `Here is an in-depth breakdown of "${chapterTitle}": This is a central architecture pattern in .NET development ensuring type safety and memory garbage collection by the CLR.`;
    } else if (action === 'example') {
      responseText = `Here is a practical code example for "${chapterTitle}":\n\`\`\`csharp\n// Code snippet\nConsole.WriteLine("Executing runtime instruction...");\n\`\`\``;
    } else if (action === 'task') {
      responseText = `Try this practice task: Write a small console program that implements the concept we discussed in "${chapterTitle}".`;
    } else if (action === 'bugs') {
      responseText = `Find the bug in this snippet:\n\`\`\`csharp\nint val = null; // Can an integer be null in C#?\n\`\`\``;
    }
    
    setAiChat(prev => [...prev, { role: 'assistant', text: responseText }]);
  };

  const sendUserMessage = () => {
    if (!aiInput.trim()) return;
    setAiChat(prev => [...prev, { role: 'user', text: aiInput }]);
    const query = aiInput;
    setAiInput('');

    setTimeout(() => {
      setAiChat(prev => [...prev, { role: 'assistant', text: `Got it! Understood your question: "${query}". In C# .NET, this is processed securely by the compilation pipeline.` }]);
    }, 800);
  };

  // If a lesson is selected, show the Learning Studio (identical layout to Advanced Java theory player)
  if (selectedLesson) {
    const currentChapter = selectedLesson.chapters[currentChapterIdx];
    return (
      <div className={`min-h-screen p-6 transition-colors duration-300 ${
        isDark ? 'bg-[#090514] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
        <div className="max-w-[1280px] mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className={`p-6 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
            isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { handleStop(); setSelectedLesson(null); }}
                className={`p-2 rounded-xl border text-xs font-bold transition ${
                  isDark ? 'bg-white/5 border-white/5 text-slate-450 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-750'
                }`}
              >
                ← Back
              </button>
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-650 bg-purple-500/10 px-2 py-0.5 rounded-full">{selectedLesson.difficulty}</span>
                <h2 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedLesson.title}</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedLesson.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span>⏱️ {selectedLesson.time}</span>
              <span>✨ {selectedLesson.xp} XP</span>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm">
                Resume Module
              </button>
            </div>
          </div>

          {/* Module Mastery progress bar */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-1">
              <span>MODULE MASTERY</span>
              <span>{Math.round(((currentChapterIdx + 1) / selectedLesson.chapters.length) * 100)}% Complete</span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${((currentChapterIdx + 1) / selectedLesson.chapters.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Main workspace splits */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Center: Slide player */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
              <div className={`flex-1 min-h-[340px] rounded-3xl p-8 border flex flex-col justify-between items-center relative overflow-hidden text-center ${
                isDark ? 'bg-[#0d091f]/90 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-md'
              }`}>
                {isDark && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/5 rounded-full blur-[100px]" />}
                
                <span className="text-xs text-purple-600 font-bold uppercase tracking-wider">
                  {currentChapter.title}
                </span>

                <div className={`text-lg font-bold leading-relaxed max-w-xl ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {currentChapter.content}
                </div>

                {/* Speech Player Controls */}
                <div className={`flex items-center gap-4 p-2 rounded-2xl border ${
                  isDark ? 'bg-[#120e2a] border-white/5' : 'bg-slate-100 border-slate-200'
                }`}>
                  <button 
                    onClick={handleSpeak}
                    className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition shadow-lg shadow-purple-600/20"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                  </button>
                  
                  <span className="text-[10px] text-slate-400 font-bold">1x</span>
                  
                  <button 
                    onClick={() => setVoiceGender(prev => prev === 'female' ? 'male' : 'female')}
                    className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase border ${
                      isDark ? 'border-white/5 text-slate-355' : 'border-slate-255 text-slate-655'
                    }`}
                  >
                    {voiceGender}
                  </button>
                </div>
              </div>

              {/* Chapters navigation mapping at bottom */}
              <div className={`p-4 rounded-3xl border flex items-center gap-2 overflow-x-auto scrollbar-none ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                {selectedLesson.chapters.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => { handleStop(); setCurrentChapterIdx(idx); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition ${
                      currentChapterIdx === idx 
                        ? 'bg-purple-600 text-white border-purple-600' 
                        : isDark 
                          ? 'bg-[#0b0816] border-white/5 text-slate-400 hover:text-white' 
                          : 'bg-slate-50 border-slate-250 text-slate-750 hover:bg-slate-100'
                    }`}
                  >
                    {idx + 1}. {ch.title.split('. ')[1] || ch.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Coding Coach Sidebar */}
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border space-y-4 flex flex-col justify-between h-full ${
                isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center gap-2">
                  <BrainCircuit className="text-purple-655 animate-brain-pulse" size={20} />
                  <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Coding Coach</h3>
                </div>

                <div className={`h-40 overflow-y-auto p-3 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-[#0b0816]/60 border-white/5' : 'bg-slate-50 border-slate-150'
                }`}>
                  {aiChat.map((msg, idx) => (
                    <div key={idx} className={`text-xs p-2.5 rounded-xl ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white ml-auto max-w-[80%]' 
                        : isDark ? 'bg-white/5 text-slate-300' : 'bg-white text-slate-800 border border-slate-100 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  ))}
                </div>

                {/* Coach actions */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <button onClick={() => handleCoachAction('explain')} className={`py-2 rounded-lg border transition ${isDark ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}>Explain Again</button>
                  <button onClick={() => handleCoachAction('example')} className={`py-2 rounded-lg border transition ${isDark ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}>Give Example</button>
                  <button onClick={() => handleCoachAction('task')} className={`py-2 rounded-lg border transition ${isDark ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}>Practice Task</button>
                  <button onClick={() => handleCoachAction('bugs')} className={`py-2 rounded-lg border transition ${isDark ? 'bg-white/5 border-white/5 text-slate-350 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'}`}>Correct Bugs</button>
                </div>

                {/* Notepad */}
                <div className="pt-2 border-t border-slate-200 dark:border-white/5 flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Mentor Notepad</span>
                  <textarea 
                    placeholder="Record key architectural parameters..."
                    value={notepad}
                    onChange={(e) => setNotepad(e.target.value)}
                    className={`w-full h-16 p-3 rounded-xl border text-xs outline-none resize-none ${
                      isDark ? 'bg-[#0b0816] border-white/5 text-slate-305' : 'bg-slate-50 border-slate-250 text-slate-805'
                    }`}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Tab Selector row (identical to Java player tabs row: LEARN, ARCHITECTURE, PRACTICE, QUIZ, PROJECTS) */}
          <div className={`flex items-center gap-1 p-1 rounded-2xl border overflow-x-auto scrollbar-none ${
            isDark ? 'bg-[#120e2a] border-white/5' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {[
              { id: 'learn', label: '🎬 Learn', icon: BookOpen },
              { id: 'architecture', label: '💡 Architecture', icon: BarChart2 },
              { id: 'practice', label: '💻 Practice', icon: Code2 },
              { id: 'quiz', label: '🧠 Quiz', icon: Award },
              { id: 'projects', label: '🏆 Projects', icon: Trophy }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveLessonTab(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
                  activeLessonTab === tab.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-655 hover:text-slate-850'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Tab Panel Content */}
          <div className={`p-6 rounded-3xl border text-left ${
            isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {activeLessonTab === 'learn' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold flex items-center gap-2"><BookOpen size={16} /> Concept Deep Dive</h4>
                <p className="text-xs leading-relaxed text-slate-400 dark:text-slate-300">
                  {selectedLesson.chapters[currentChapterIdx].content} In C# .NET, this compiles directly into Intermediate Language (IL) metadata, which is executed safely inside the Virtual Common Language Runtime (CLR).
                </p>
              </div>
            )}

            {activeLessonTab === 'architecture' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold flex items-center gap-2"><BarChart2 size={16} /> Architecture Visualizer</h4>
                <div className={`p-6 rounded-2xl border text-center ${isDark ? 'bg-[#0b0816]/60 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex justify-center items-center gap-4 text-xs font-mono">
                    <span className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">C# Compiler (csc)</span>
                    <span>→</span>
                    <span className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">Intermediate Language (IL)</span>
                    <span>→</span>
                    <span className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">CLR JIT (Machine Code)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-4">Live C# execution flow visualization. Code runs securely managed by the .NET garbage collector.</p>
                </div>
              </div>
            )}

            {activeLessonTab === 'practice' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold flex items-center gap-2"><Code2 size={16} /> Interactive Practice Code</h4>
                <pre className={`p-4 rounded-xl font-mono text-xs overflow-x-auto ${isDark ? 'bg-[#07040f] text-emerald-400' : 'bg-slate-50 text-slate-800'}`}>
{`using System;

public class ModulePractice
{
    public static void Main()
    {
        // Try executing the concept of ${selectedLesson.title}
        Console.WriteLine("Executing ${currentChapter.title} practice simulator...");
    }
}`}
                </pre>
              </div>
            )}

            {activeLessonTab === 'quiz' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold flex items-center gap-2"><Award size={16} /> Chapter Assessment</h4>
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0b0816]/60 border-white/5' : 'bg-slate-50 border-slate-150'}`}>
                  <strong className="text-xs block mb-3">Which component compiles IL code into native machine code in the .NET framework?</strong>
                  <div className="space-y-2">
                    {['1. Roslyn Compiler', '2. JIT Compiler (Just-In-Time)', '3. MSBuild Engine', '4. CLR Garbage Collector'].map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          if (idx === 1) toast.success('Correct answer! +20 XP');
                          else toast.error('Incorrect. Try again!');
                        }}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition ${
                          isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 text-slate-300' : 'bg-white border-slate-205 hover:bg-slate-50 text-slate-750'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeLessonTab === 'projects' && (
              <div className="space-y-4">
                <h4 className="text-base font-bold flex items-center gap-2"><Trophy size={16} /> Module Project Milestones</h4>
                <p className="text-xs text-slate-400 dark:text-slate-300">
                  Build a full console implementation mapping out all the chapters of this module. Compile and check against the AI reviewer inside the Practical Lab.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // Course Index page (identical index layout to Advanced Java index page)
  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDark ? 'bg-[#090514] text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-[1280px] mx-auto space-y-8 pt-10">
        
        {/* Banner */}
        <div className={`p-8 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden ${
          isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {isDark && <div className="absolute top-0 right-0 w-64 h-64 bg-purple-650/10 rounded-full blur-[100px]" />}
          <div className="space-y-2 text-left z-10">
            <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-3 py-1 rounded-full uppercase tracking-wider">AI Architect Academy</span>
            <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>C# Theory Studio</h1>
            <p className={`text-xs max-w-xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Learn C# variables, logical control flow, Object-Oriented polymorphism, LINQ memory filters, and concurrent async-await frameworks inside an elite coding academy.
            </p>
          </div>

          <div className="flex items-center gap-4 z-10 shrink-0">
            <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <strong className="text-xl font-black block">4</strong>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Modules</span>
            </div>
            <div className={`p-4 rounded-2xl border text-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <strong className="text-xl font-black block">650</strong>
              <span className="text-[9px] text-slate-400 font-bold uppercase">Total XP</span>
            </div>
          </div>
        </div>

        {/* Badges Collection */}
        <div className={`p-6 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>Badges Collection</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map(badge => (
              <div key={badge.id} className={`p-4 rounded-2xl border flex items-center gap-3 ${
                isDark ? 'bg-[#0b0816] border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm'
              }`}>
                <span className="text-2xl">{badge.icon}</span>
                <div className="text-left">
                  <strong className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>{badge.name}</strong>
                  <span className="text-[10px] text-slate-400">{badge.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Syllabus Course List */}
        <div className="space-y-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-550'}`}>Course Syllabus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CSHARP_THEORY_LESSONS.map((lesson, idx) => (
              <div 
                key={lesson.id} 
                className={`p-6 rounded-3xl border flex flex-col justify-between h-full hover:border-purple-500/40 transition duration-300 ${
                  isDark ? 'bg-[#120e2a] border-purple-500/10' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Module {idx + 1}</span>
                    <span className="text-xs text-purple-650 bg-purple-500/10 px-2 py-0.5 rounded-full font-bold">{lesson.difficulty}</span>
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-850'}`}>{lesson.title}</h3>
                    <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{lesson.desc}</p>
                    
                    {/* Topics badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {lesson.topics.map((t, idx) => (
                        <span key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-105 dark:border-white/5">
                  <span className="text-xs text-slate-400">⏱️ {lesson.time} | ✨ {lesson.xp} XP</span>
                  <button 
                    onClick={() => { setSelectedLesson(lesson); setCurrentChapterIdx(0); setActiveLessonTab('learn'); }}
                    className="px-4 py-2 bg-purple-650 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Start Module
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, BookOpen, FileText, CheckSquare, Briefcase, 
  UserCheck, Clipboard, Calendar, Search, Sparkles, Send, 
  RotateCcw, Save, Copy, ChevronRight, ChevronLeft, Award, 
  TrendingUp, Star, BookMarked, ThumbsUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const TOOLS = [
  { id: 'doubt', label: 'Ask Doubt', icon: '❓', desc: 'Get direct answers & explanations' },
  { id: 'explain', label: 'Explain Concept', icon: '📖', desc: 'Easy, medium, or deep breakdown' },
  { id: 'example', label: 'Generate Examples', icon: '💡', desc: 'Code and real-life samples' },
  { id: 'practice', label: 'Practice Questions', icon: '📝', desc: 'MCQs, coding & output challenges' },
  { id: 'career', label: 'AI Career Guide', icon: '🎯', desc: 'Learning roadmaps & career paths' },
  { id: 'interview', label: 'AI Interviewer', icon: '🎙️', desc: 'Simulated interactive mock interviews' },
  { id: 'resume', label: 'Resume Reviewer', icon: '📄', desc: 'ATS analysis & bullet optimization' },
  { id: 'planner', label: 'Study Planner', icon: '📅', desc: 'Daily & weekly custom plans' },
  { id: 'questions', label: 'Questions Bank', icon: '📚', desc: 'Search syllabus database & AI failovers' },
];

export default function AITutor() {
  const [selectedTool, setSelectedTool] = useState('doubt');
  const [subject, setSubject] = useState('Computer Science');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [recentChats, setRecentChats] = useState([
    { tool: 'Ask Doubt', title: 'What is polymorphic behavior?' },
    { tool: 'Explain Concept', title: 'Deep dive into Binary Search Trees' }
  ]);

  // General Input States
  const [generalQuestion, setGeneralQuestion] = useState('');
  const [doubtResult, setDoubtResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Explain Concept States
  const [conceptTopic, setConceptTopic] = useState('');
  const [conceptLevel, setConceptLevel] = useState('medium'); // easy, medium, deep
  const [conceptResult, setConceptResult] = useState(null);

  // Generate Examples States
  const [exampleTopic, setExampleTopic] = useState('');
  const [exampleLang, setExampleLang] = useState('Python');
  const [exampleCount, setExampleCount] = useState(3);
  const [exampleResult, setExampleResult] = useState(null);

  // Practice Questions States
  const [practiceTopic, setPracticeTopic] = useState('');
  const [practiceType, setPracticeType] = useState('MCQ');
  const [practiceDifficulty, setPracticeDifficulty] = useState('Medium');
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);

  // Career Guide States
  const [careerBranch, setCareerBranch] = useState('Computer Science');
  const [careerGoal, setCareerGoal] = useState('Full Stack Developer');
  const [careerLevel, setCareerLevel] = useState('Beginner');
  const [careerResult, setCareerResult] = useState(null);

  // Interviewer States
  const [interviewRole, setInterviewRole] = useState('Frontend Engineer');
  const [interviewTopic, setInterviewTopic] = useState('React & JavaScript');
  const [interviewType, setInterviewType] = useState('Technical');
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [interviewIdx, setInterviewIdx] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState({});
  const [interviewFeedback, setInterviewFeedback] = useState(null);

  // Resume States
  const [resumeText, setResumeText] = useState('');
  const [resumeResult, setResumeResult] = useState(null);

  // Study Planner States
  const [planSubjects, setPlanSubjects] = useState('Java, DBMS, OS');
  const [planExamDate, setPlanExamDate] = useState('2026-07-15');
  const [planHours, setPlanHours] = useState(4);
  const [planWeakTopics, setPlanWeakTopics] = useState('Recursion, Normalization');
  const [planResult, setPlanResult] = useState(null);

  // Question Bank States
  const [qbSearchQuery, setQbSearchQuery] = useState('');
  const [qbResult, setQbResult] = useState(null);
  const [qbLoading, setQbLoading] = useState(false);

  const handleQbSearch = async () => {
    if (!qbSearchQuery.trim()) {
      toast.error('Please input a question first.');
      return;
    }
    setQbLoading(true);
    setQbResult(null);
    try {
      const res = await api.post('/questions/search', { query: qbSearchQuery });
      setQbResult(res.data);
      // Save query to history
      setRecentChats(prev => [{ tool: 'Questions Bank', title: qbSearchQuery }, ...prev]);
      toast.success('Search complete!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to search question bank.');
    } finally {
      setQbLoading(false);
    }
  };

  // ───── Ask Doubt Operator ─────
  const handleAskDoubt = (qText) => {
    const query = qText || generalQuestion;
    if (!query.trim()) {
      toast.error('Please input a doubt first.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setDoubtResult({
        question: query,
        answer: `Polymorphism allows objects of different classes to be treated as objects of a common superclass. The most common use of polymorphism in OOP occurs when a parent class reference is used to refer to a child class object.`,
        explanation: `For example, in Java, if a class 'Animal' has a method 'makeSound()', and subclasses 'Dog' and 'Cat' override this method, calling 'makeSound()' on an Animal reference pointing to a Dog object will trigger Dog's version of the method at runtime.`,
        tips: `Always make sure to use '@Override' annotations in Java to prevent syntax bugs.`
      });
      setIsGenerating(false);
      toast.success('Response generated!');
    }, 1000);
  };

  // ───── Explain Concept Operator ─────
  const handleExplainConcept = () => {
    if (!conceptTopic.trim()) {
      toast.error('Please enter a concept name.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setConceptResult({
        topic: conceptTopic,
        level: conceptLevel,
        definition: `Binary Search Tree (BST) is a node-based binary tree data structure where each node has at most two child nodes.`,
        structure: `The left subtree of a node contains only nodes with keys lesser than the node's key. The right subtree of a node contains only nodes with keys greater than the node's key.`,
        breakdown: `Searching: O(log N) average time. Insertion: O(log N) average time. Deletion: O(log N) average time.`,
        summary: `Excellent for quick search, insertion, and deletion operations compared to unsorted arrays or linked lists.`,
        links: ['Tree Traversals', 'AVL Trees', 'Red-Black Trees']
      });
      setIsGenerating(false);
      toast.success('Concept explained!');
    }, 1000);
  };

  // ───── Generate Examples Operator ─────
  const handleGenerateExamples = () => {
    if (!exampleTopic.trim()) {
      toast.error('Please enter a topic.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setExampleResult({
        topic: exampleTopic,
        lang: exampleLang,
        examples: [
          {
            title: 'Simple Implementation',
            code: `# Python example for ${exampleTopic}\n` +
                  `def demonstrate():\n` +
                  `    print("Demonstrating ${exampleTopic}")\n` +
                  `demonstrate()`
          },
          {
            title: 'Real-Life Scenario',
            code: `# Practical ${exampleLang} implementation representing real-world usage\n` +
                  `class ApplicationContext:\n` +
                  `    def __init__(self):\n` +
                  `        self.state = "${exampleTopic}"`
          }
        ]
      });
      setIsGenerating(false);
      toast.success('Examples generated!');
    }, 1000);
  };

  // ───── Practice Questions Operator ─────
  const handlePracticeQuestions = () => {
    if (!practiceTopic.trim()) {
      toast.error('Please enter a practice topic.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setPracticeQuestions([
        {
          id: 1,
          question: `Which of the following is correct regarding ${practiceTopic}?`,
          options: ['Option A: It is static', 'Option B: It runs dynamically', 'Option C: It has compile-time bindings', 'Option D: None of the above'],
          correct: 1,
          hint: 'Think about dynamic dispatch mechanism at runtime.',
          solution: 'Option B is correct because polymorphism resolves bindings dynamically at runtime.'
        }
      ]);
      setActiveQuestionIdx(0);
      setSelectedAnswer('');
      setShowHint(false);
      setPracticeSubmitted(false);
      setPracticeScore(0);
      setIsGenerating(false);
      toast.success('Questions loaded!');
    }, 1000);
  };

  // ───── Career Guide Operator ─────
  const handleCareerGuide = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setCareerResult({
        goal: careerGoal,
        level: careerLevel,
        roadmap: [
          { step: '1. Foundation', details: 'Learn HTML, CSS, JavaScript, and programming syntax basic principles.' },
          { step: '2. Frameworks', details: 'Master React, Vue, or Angular for front-end, Node.js or Spring for back-end.' },
          { step: '3. DB & Deploy', details: 'Relational databases SQL, non-relational MongoDB, Git, and hosting services.' }
        ],
        skills: ['JavaScript/ES6', 'React Hooks', 'REST API Architecture', 'Git Control'],
        projects: ['E-Commerce dashboard', 'Real-time Chat App', 'DSA Visualization Canvas']
      });
      setIsGenerating(false);
      toast.success('Career path generated!');
    }, 1000);
  };

  // ───── Interviewer Operator ─────
  const handleStartInterview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setInterviewQuestions([
        { id: 1, question: `Can you explain the difference between virtual DOM and real DOM in ${interviewTopic}?` },
        { id: 2, question: `How do you manage states in a highly nested component hierarchy?` }
      ]);
      setInterviewIdx(0);
      setInterviewAnswers({});
      setInterviewFeedback(null);
      setIsGenerating(false);
      toast.success('Interview started!');
    }, 1000);
  };

  const handleSubmitInterview = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setInterviewFeedback({
        score: 85,
        confidence: 'High',
        strengths: 'Excellent explanation of reconciliation and virtual DOM tree comparisons.',
        weaknesses: 'Needs deeper explanation of custom hook dependencies and callback hook scenarios.',
        tips: 'Utilize STAR method to explain real-life implementation problems you solved previously.'
      });
      setIsGenerating(false);
      toast.success('Evaluation complete!');
    }, 1000);
  };

  // ───── Resume Reviewer Operator ─────
  const handleReviewResume = () => {
    if (!resumeText.trim()) {
      toast.error('Please paste resume text.');
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setResumeResult({
        score: 78,
        formatting: 'Clean formatting, but consider using active verbs rather than passive statements.',
        gaps: ['Missing unit testing frameworks (Jest/JUnit)', 'Insufficient cloud deployment mentions'],
        optimizedBullets: [
          'Optimized: "Architected real-time chat application using WebSocket, reducing connection latency by 30%."',
          'Optimized: "Leveraged Java Streams to refactor query filters, resulting in 15% faster response times."'
        ],
        keywords: ['CI/CD Pipeline', 'RESTful Services', 'State Management', 'System Design']
      });
      setIsGenerating(false);
      toast.success('Resume analyzed!');
    }, 1000);
  };

  // ───── Study Planner Operator ─────
  const handleCreatePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPlanResult({
        daily: [
          { time: '09:00 AM', task: 'Study core theoretical definitions' },
          { time: '02:00 PM', task: 'Code practice challenges' }
        ],
        weekly: [
          { day: 'Monday', focus: `Focus on ${planWeakTopics}` },
          { day: 'Wednesday', focus: 'Solve mock questions' }
        ],
        stats: 'Estimated preparation coverage: 88%'
      });
      setIsGenerating(false);
      toast.success('Planner created!');
    }, 1000);
  };

  // ───── Utility Actions ─────
  const saveToHistory = (title) => {
    setRecentChats(prev => [{ tool: TOOLS.find(t => t.id === selectedTool).label, title }, ...prev]);
    toast.success('Saved to recent history!');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="quiz-arena-container min-h-screen flex flex-col relative overflow-y-auto">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── Top Header Bar ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5 mb-5 mt-2">
        <div>
          <h1 className="lobby-title font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">AI Tutor</h1>
          <p className="text-slate-500 text-xs mt-1">Powered by AI — ask doubts, learn concepts, generate examples, and plan studies</p>
        </div>

        {/* Search & Subject Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search concepts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Advanced Java">Advanced Java</option>
            <option value="C#">C#</option>
            <option value="DBMS">DBMS</option>
            <option value="DSA">DSA</option>
            <option value="FOC">FOC</option>
            <option value="Java">Java</option>
            <option value="Python">Python</option>
            <option value="Web Development">Web Development</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Machine Learning">Machine Learning</option>
          </select>
        </div>
      </div>

      {/* ─── 9 Compulsory Tools Large Card Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3 mb-6">
        {TOOLS.map((t) => {
          const isActive = selectedTool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTool(t.id)}
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between h-24 ${
                isActive 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-white border-slate-200/80 hover:border-slate-300/80 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <div>
                <span className="text-[10px] font-black tracking-tight block uppercase">{t.label}</span>
                <span className={`text-[8px] mt-0.5 line-clamp-1 block ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {t.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Main Content Splitted Area ─── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" style={{ minHeight: '72vh' }}>
        
        {/* Left / Center Main Workspace (9 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-4 min-h-0">
          
          <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between overflow-y-auto scrollbar-thin" style={{ minHeight: '65vh' }}>
            
            <div className="space-y-6">
              
              {/* ─── Tool 1: Ask Doubt ─── */}
              {selectedTool === 'doubt' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Ask Any Doubt</h3>
                    <p className="text-[11px] text-slate-500">Submit a query to get instant explanations from Friday tutor.</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Explain polymorphic behavior with simple real world objects" 
                      value={generalQuestion}
                      onChange={(e) => setGeneralQuestion(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => handleAskDoubt()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={14} /> Ask AI
                    </button>
                  </div>

                  {isGenerating && <div className="text-center py-8 text-xs text-slate-400 animate-pulse">Tutor is analyzing your doubt...</div>}

                  {doubtResult && !isGenerating && (
                    <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
                      <div>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Question Analyzed</span>
                        <p className="text-xs font-semibold text-slate-800 mt-1">"{doubtResult.question}"</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Tutor Answer</span>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{doubtResult.answer}</p>
                      </div>
                      <div className="p-3 bg-slate-100 rounded-xl">
                        <strong className="text-[10px] text-slate-500 uppercase block">Follow-Up Breakdown:</strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{doubtResult.explanation}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-3 text-[10px]">
                        <div className="flex gap-2">
                          <button onClick={() => copyToClipboard(doubtResult.answer)} className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center gap-1">
                            <Copy size={12} /> Copy
                          </button>
                          <button onClick={() => saveToHistory(doubtResult.question)} className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center gap-1">
                            <Save size={12} /> Save to history
                          </button>
                        </div>
                        <button onClick={() => handleAskDoubt()} className="text-blue-600 font-extrabold hover:underline flex items-center gap-1">
                          <RotateCcw size={12} /> Regenerate Answer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Tool 2: Explain Concept ─── */}
              {selectedTool === 'explain' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Explain Concept</h3>
                    <p className="text-[11px] text-slate-500">Choose complexity level to analyze key computer science theories.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Concept Topic</span>
                      <input 
                        type="text" 
                        placeholder="e.g. Binary Search Tree" 
                        value={conceptTopic}
                        onChange={(e) => setConceptTopic(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Explanation Depth</span>
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        {['easy', 'medium', 'deep'].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setConceptLevel(lvl)}
                            className={`py-1 text-[10px] uppercase font-bold rounded-lg transition-colors ${conceptLevel === lvl ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button onClick={handleExplainConcept} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 justify-center w-full">
                    <Sparkles size={14} /> Explain Concept
                  </button>

                  {isGenerating && <div className="text-center py-8 text-xs text-slate-400 animate-pulse">Tutor is breaking down the concept...</div>}

                  {conceptResult && !isGenerating && (
                    <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Tutor Definition ({conceptResult.level} mode)</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{conceptResult.definition}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Key Structure & Rules</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{conceptResult.structure}</p>
                      </div>
                      <div className="p-3.5 bg-slate-100 rounded-xl">
                        <strong className="text-[10px] text-slate-500 uppercase block">Simple breakdown:</strong>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{conceptResult.breakdown}</p>
                      </div>

                      <div className="border-t border-slate-200/60 pt-3">
                        <span className="text-[10px] text-slate-500 uppercase block">Related links</span>
                        <div className="flex gap-2 mt-1.5">
                          {conceptResult.links.map(l => (
                            <button key={l} className="text-[10px] text-blue-600 hover:underline bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Tool 3: Generate Examples ─── */}
              {selectedTool === 'example' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Generate Code Examples</h3>
                    <p className="text-[11px] text-slate-500">Produce clean syntax codes and real life comparisons.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col col-span-2">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Topic</span>
                      <input 
                        type="text" 
                        placeholder="e.g. Recursion" 
                        value={exampleTopic}
                        onChange={(e) => setExampleTopic(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Language</span>
                      <select value={exampleLang} onChange={(e) => setExampleLang(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                        <option value="Computer Science">Computer Science</option>
                        <option value="Advanced Java">Advanced Java</option>
                        <option value="C#">C#</option>
                        <option value="DBMS">DBMS</option>
                        <option value="DSA">DSA</option>
                        <option value="FOC">FOC</option>
                        <option value="Java">Java</option>
                        <option value="Python">Python</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="C">C Language</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleGenerateExamples} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center w-full">
                    <Sparkles size={14} /> Generate Examples
                  </button>

                  {isGenerating && <div className="text-center py-8 text-xs text-slate-400 animate-pulse">Tutor is building coding examples...</div>}

                  {exampleResult && !isGenerating && (
                    <div className="space-y-4">
                      {exampleResult.examples.map((ex, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-950 font-mono text-[11px] text-emerald-400">
                          <span className="text-slate-500 block mb-1"># {ex.title}</span>
                          <pre className="overflow-x-auto"><code>{ex.code}</code></pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ─── Tool 4: Practice Questions ─── */}
              {selectedTool === 'practice' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Practice Questions</h3>
                    <p className="text-[11px] text-slate-500">Test theoretical concept questions to save progress.</p>
                  </div>

                  {practiceQuestions.length === 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">Topic</span>
                          <input 
                            type="text" 
                            placeholder="e.g. Inheritance" 
                            value={practiceTopic}
                            onChange={(e) => setPracticeTopic(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">Question Type</span>
                          <select value={practiceType} onChange={(e) => setPracticeType(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                            <option value="MCQ">Multiple Choice</option>
                            <option value="Short">Short Answer</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={handlePracticeQuestions} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center w-full">
                        Generate practice set
                      </button>
                    </div>
                  )}

                  {practiceQuestions.length > 0 && (
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                        <span>QUESTION {activeQuestionIdx + 1} OF {practiceQuestions.length}</span>
                        <button onClick={() => setShowHint(!showHint)} className="text-blue-600 hover:underline">
                          {showHint ? 'Hide Hint' : 'View Hint'}
                        </button>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-800">
                        {practiceQuestions[activeQuestionIdx].question}
                      </h4>

                      {showHint && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-600 rounded-xl">
                          <strong>Hint:</strong> {practiceQuestions[activeQuestionIdx].hint}
                        </div>
                      )}

                      <div className="space-y-2">
                        {practiceQuestions[activeQuestionIdx].options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedAnswer(idx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                              selectedAnswer === idx 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {practiceSubmitted && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-700">
                          <strong className="text-emerald-600 block">Explanation Solution:</strong>
                          {practiceQuestions[activeQuestionIdx].solution}
                        </div>
                      )}

                      <div className="flex justify-between mt-4">
                        <button onClick={() => setPracticeQuestions([])} className="text-slate-400 hover:underline text-xs">
                          Exit Set
                        </button>
                        <button 
                          onClick={() => setPracticeSubmitted(true)}
                          className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                        >
                          Submit Answer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Tool 5: AI Career Guide ─── */}
              {selectedTool === 'career' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">AI Career Guide</h3>
                    <p className="text-[11px] text-slate-500">Provide goals to construct placement maps.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Branch</span>
                      <input type="text" value={careerBranch} onChange={(e) => setCareerBranch(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Goal</span>
                      <input type="text" value={careerGoal} onChange={(e) => setCareerGoal(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Skill Level</span>
                      <select value={careerLevel} onChange={(e) => setCareerLevel(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={handleCareerGuide} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center w-full">
                    Generate Roadmap
                  </button>

                  {careerResult && (
                    <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="text-xs font-bold text-slate-800">Learning Roadmap for {careerGoal}</h4>
                      <div className="space-y-2">
                        {careerResult.roadmap.map((step, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <strong className="text-xs text-blue-600 block">{step.step}</strong>
                            <p className="text-[11px] text-slate-600 mt-1">{step.details}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Skills to Learn</span>
                          <ul className="text-xs text-slate-600 mt-1 list-disc pl-4 space-y-1">
                            {careerResult.skills.map(s => <li key={s}>{s}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Suggested Projects</span>
                          <ul className="text-xs text-slate-600 mt-1 list-disc pl-4 space-y-1">
                            {careerResult.projects.map(p => <li key={p}>{p}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Tool 6: AI Interviewer ─── */}
              {selectedTool === 'interview' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">AI Interview simulator</h3>
                    <p className="text-[11px] text-slate-500">Start structured interviews with evaluation feedback.</p>
                  </div>

                  {interviewQuestions.length === 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">Target Role</span>
                          <input type="text" value={interviewRole} onChange={(e) => setInterviewRole(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">Topic</span>
                          <input type="text" value={interviewTopic} onChange={(e) => setInterviewTopic(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold mb-1">Type</span>
                          <select value={interviewType} onChange={(e) => setInterviewType(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700">
                            <option value="Technical">Technical</option>
                            <option value="Behavioral">Behavioral</option>
                          </select>
                        </div>
                      </div>
                      <button onClick={handleStartInterview} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center w-full">
                        Start Mock Interview
                      </button>
                    </div>
                  )}

                  {interviewQuestions.length > 0 && !interviewFeedback && (
                    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                        <span>QUESTION {interviewIdx + 1} OF {interviewQuestions.length}</span>
                        <span className="text-blue-600">Active simulated mic</span>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-800">
                        {interviewQuestions[interviewIdx].question}
                      </h4>

                      <textarea 
                        value={interviewAnswers[interviewIdx] || ''}
                        onChange={(e) => setInterviewAnswers({...interviewAnswers, [interviewIdx]: e.target.value})}
                        placeholder="Write or dictate your answer here..."
                        className="w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                      />

                      <div className="flex justify-between">
                        <button 
                          disabled={interviewIdx === 0}
                          onClick={() => setInterviewIdx(prev => prev - 1)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-bold rounded-xl disabled:opacity-50"
                        >
                          Previous
                        </button>

                        {interviewIdx < interviewQuestions.length - 1 ? (
                          <button 
                            onClick={() => setInterviewIdx(prev => prev + 1)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                          >
                            Next
                          </button>
                        ) : (
                          <button 
                            onClick={handleSubmitInterview}
                            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black rounded-xl"
                          >
                            Submit Interview
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {interviewFeedback && (
                    <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-800">Evaluation Feedback</h4>
                        <span className="text-xs font-black text-blue-600">Score: {interviewFeedback.score}%</span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-2">
                        <p><strong>Strengths:</strong> {interviewFeedback.strengths}</p>
                        <p><strong>Weaknesses:</strong> {interviewFeedback.weaknesses}</p>
                        <p className="p-2 bg-slate-100 rounded"><strong>Tutor Tip:</strong> {interviewFeedback.tips}</p>
                      </div>
                      <button onClick={() => setInterviewQuestions([])} className="text-xs text-blue-600 font-bold hover:underline">
                        Retry Interview
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Tool 7: Resume Reviewer ─── */}
              {selectedTool === 'resume' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Resume reviewer</h3>
                    <p className="text-[11px] text-slate-500">Paste your resume content to optimize for ATS criteria.</p>
                  </div>

                  <textarea 
                    placeholder="Paste resume text or skills list here..." 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                  />

                  <button onClick={handleReviewResume} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center w-full">
                    Analyze Resume
                  </button>

                  {resumeResult && (
                    <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-bold text-slate-800 font-mono">ATS Match Score</h4>
                        <span className="text-xs font-black text-emerald-600">{resumeResult.score}%</span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-2">
                        <p><strong>Formatting:</strong> {resumeResult.formatting}</p>
                        <div>
                          <strong className="block text-slate-700">Recommended Keywords:</strong>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {resumeResult.keywords.map(kw => (
                              <span key={kw} className="bg-slate-100 border text-[10px] px-2 py-0.5 rounded">{kw}</span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <strong className="block text-slate-700">Better Bullet points:</strong>
                          <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px]">
                            {resumeResult.optimizedBullets.map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Tool 8: Study Planner ─── */}
              {selectedTool === 'planner' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Study Planner</h3>
                    <p className="text-[11px] text-slate-500">Create revision daily and weekly milestones.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Subjects to Prepare</span>
                      <input type="text" value={planSubjects} onChange={(e) => setPlanSubjects(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold mb-1">Target Exam Date</span>
                      <input type="date" value={planExamDate} onChange={(e) => setPlanExamDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800" />
                    </div>
                  </div>

                  <button onClick={handleCreatePlan} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center w-full">
                    Build Custom Plan
                  </button>

                  {planResult && (
                    <div className="p-5 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="text-xs font-bold text-slate-800">Custom Timetable Plan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Daily Routine</span>
                          <div className="space-y-2 mt-1.5">
                            {planResult.daily.map((d, i) => (
                              <div key={i} className="text-xs p-2 bg-slate-50 border rounded-lg">
                                <strong>{d.time}:</strong> {d.task}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block font-bold">Weekly Milestones</span>
                          <div className="space-y-2 mt-1.5">
                            {planResult.weekly.map((w, i) => (
                              <div key={i} className="text-xs p-2 bg-slate-50 border rounded-lg">
                                <strong>{w.day}:</strong> {w.focus}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {/* ─── Tool 9: Questions Bank ─── */}
              {selectedTool === 'questions' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-800">Questions Bank Search</h3>
                    <p className="text-[11px] text-slate-500">Search verified syllabus question papers & AI cache databases.</p>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter a syllabus question to query (e.g. Explain JRE memory models)" 
                      value={qbSearchQuery}
                      onChange={(e) => setQbSearchQuery(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleQbSearch(); }}
                    />
                    <button 
                      onClick={handleQbSearch} 
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      disabled={qbLoading}
                    >
                      {qbLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {qbLoading && (
                    <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
                      Searching database and querying AI failover models...
                    </div>
                  )}

                  {qbResult && !qbLoading && (
                    <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                          Source: <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            qbResult.source === 'Question Bank' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>{qbResult.source}</span>
                        </span>
                        {qbResult.question_type && (
                          <span className="text-slate-400 text-[10px] font-bold">{qbResult.question_type} ({qbResult.difficulty})</span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <strong className="block text-slate-800 mb-1">Question:</strong>
                          <p className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border font-medium text-slate-700 leading-relaxed text-slate-700 dark:text-slate-200">{qbResult.question}</p>
                        </div>
                        <div>
                          <strong className="block text-slate-800 mb-1">Answer / Model Solution:</strong>
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border text-slate-700 leading-relaxed whitespace-pre-line font-normal prose prose-sm max-w-none text-slate-700 dark:text-slate-200">
                            {qbResult.answer}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions area */}
            <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between text-xs">
              <span className="text-slate-400"> Tutors are online ready to assist.</span>
              <button 
                onClick={() => {
                  setDoubtResult(null);
                  setConceptResult(null);
                  setExampleResult(null);
                  setPracticeQuestions([]);
                  setInterviewQuestions([]);
                  setInterviewFeedback(null);
                  setResumeResult(null);
                  setPlanResult(null);
                  toast.success('Cleaned active workspace');
                }}
                className="text-slate-500 hover:underline cursor-pointer font-bold"
              >
                Clear Workspace
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar Menu (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          
          {/* Quick Tips */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5"><HelpCircle size={14} className="text-blue-600" /> Study Tips</h4>
            <div className="space-y-2 text-[10px] text-slate-500 leading-relaxed">
              <p className="p-2 bg-slate-50 rounded-lg">⭐ Use Deep level in Explain Concept to prepare for complex university examinations.</p>
              <p className="p-2 bg-slate-50 rounded-lg">⭐ Practice questions can be marked and saved in your progress profile.</p>
            </div>
          </div>

          {/* Recent History / Saved Answers */}
          <div className="flex-1 bg-white border border-slate-200/80 rounded-3xl p-4 flex flex-col justify-between overflow-y-auto min-h-[220px]">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block mb-2">Recent Chats</span>
              <div className="space-y-2">
                {recentChats.map((c, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (c.tool === 'Ask Doubt') {
                        setSelectedTool('doubt');
                        handleAskDoubt(c.title);
                      } else {
                        setSelectedTool('explain');
                        setConceptTopic(c.title);
                        handleExplainConcept();
                      }
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors block text-[10px]"
                  >
                    <span className="font-bold text-blue-600 block uppercase text-[8px]">{c.tool}</span>
                    <span className="text-slate-700 font-semibold line-clamp-1 mt-0.5">{c.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-3 text-[10px] text-slate-400">
              Saved logs persist locally.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

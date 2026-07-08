/**
 * QuizEngine — Comprehensive quiz system
 * 10 MCQs + 3 Coding Problems + 2 Scenario-Based Questions
 * AI Evaluation, Hints, XP Rewards
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, HelpCircle, Lightbulb, Award,
  ChevronRight, RotateCcw, Code2, FileText, Zap, Star
} from 'lucide-react';
import useJavaStore from '../store/useJavaStore';

const TABS = [
  { id: 'mcq',      label: '📝 MCQ',       icon: HelpCircle },
  { id: 'coding',   label: '💻 Coding',    icon: Code2 },
  { id: 'scenario', label: '🧠 Scenario',  icon: FileText },
];

function MCQSection({ questions, accentColor }) {
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);

  const q = questions[current];
  if (!q) return null;

  const handleSelect = (opt) => {
    if (answered[current] !== undefined) return;
    setSelected(opt);
    setAnswered({ ...answered, [current]: opt === q.correct });
    setShowExplanation(true);
  };

  const correctCount = Object.values(answered).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Question {current + 1} of {questions.length}</span>
        <span className="font-bold" style={{ color: accentColor }}>
          {correctCount}/{Object.keys(answered).length} correct
        </span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: accentColor }}
          animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-bold text-white leading-relaxed">{q.question}</h3>

          <div className="grid gap-2">
            {q.options.map((opt) => {
              const isSelected = selected === opt && answered[current] !== undefined;
              const isCorrectOpt = opt === q.correct;
              const wasAnswered = answered[current] !== undefined;

              let borderCol = 'rgba(100,116,139,0.2)';
              let bgCol = 'transparent';
              if (wasAnswered && isCorrectOpt) {
                borderCol = '#22C55E60';
                bgCol = '#22C55E10';
              } else if (isSelected && !answered[current]) {
                borderCol = '#EF444460';
                bgCol = '#EF444410';
              }

              return (
                <motion.button
                  key={opt}
                  whileHover={!wasAnswered ? { scale: 1.01 } : {}}
                  whileTap={!wasAnswered ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(opt)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all"
                  style={{ borderColor: borderCol, background: bgCol }}
                  disabled={wasAnswered}
                >
                  <div
                    className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: borderCol }}
                  >
                    {wasAnswered && isCorrectOpt && <CheckCircle size={14} className="text-green-400" />}
                    {isSelected && !answered[current] && <XCircle size={14} className="text-red-400" />}
                  </div>
                  <span className={`${wasAnswered && isCorrectOpt ? 'text-green-400 font-bold' : 'text-slate-300'}`}>
                    {opt}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && answered[current] !== undefined && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0 }}
                className={`rounded-xl border p-4 ${answered[current] ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {answered[current]
                    ? <CheckCircle size={14} className="text-green-400" />
                    : <XCircle size={14} className="text-red-400" />
                  }
                  <span className={`text-xs font-bold ${answered[current] ? 'text-green-400' : 'text-red-400'}`}>
                    {answered[current] ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav */}
          {answered[current] !== undefined && current < questions.length - 1 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                setCurrent(current + 1);
                setSelected(null);
                setShowExplanation(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: accentColor }}
            >
              Next Question <ChevronRight size={14} />
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Final score */}
      {Object.keys(answered).length === questions.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-center"
        >
          <Star size={24} className="text-amber-400 mx-auto mb-2" />
          <div className="text-lg font-black text-amber-300">
            {correctCount} / {questions.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Score: {Math.round((correctCount / questions.length) * 100)}%
          </div>
        </motion.div>
      )}
    </div>
  );
}

function CodingSection({ problems, accentColor }) {
  const [active, setActive] = useState(0);
  const [code, setCode] = useState(problems[0]?.starterCode || '');
  const [showSolution, setShowSolution] = useState(false);

  const p = problems[active];
  if (!p) return <p className="text-xs text-slate-500">No coding problems available.</p>;

  return (
    <div className="space-y-4">
      {/* Problem tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {problems.map((prob, i) => (
          <button
            key={i}
            onClick={() => { setActive(i); setCode(prob.starterCode); setShowSolution(false); }}
            className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border transition-all ${
              active === i ? 'font-bold' : 'text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
            style={active === i ? { color: accentColor, borderColor: accentColor + '50', background: accentColor + '10' } : {}}
          >
            {prob.title}
          </button>
        ))}
      </div>

      {/* Problem description */}
      <div className="rounded-xl border border-slate-800 p-4">
        <h4 className="text-sm font-bold text-white mb-1">{p.title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{p.description}</p>
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/40">
          <span className="text-[10px] font-mono text-slate-500">Solution.java</span>
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="text-[10px] px-2 py-0.5 rounded border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
        </div>
        <textarea
          value={showSolution ? p.solution : code}
          onChange={(e) => { if (!showSolution) setCode(e.target.value); }}
          className="w-full bg-transparent text-xs text-slate-200 font-mono p-4 resize-none focus:outline-none min-h-[150px] leading-6"
          readOnly={showSolution}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function ScenarioSection({ scenarios, accentColor }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showHint, setShowHint]   = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const s = scenarios[activeIdx];
  if (!s) return <p className="text-xs text-slate-500">No scenario questions available.</p>;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {scenarios.map((_, i) => (
          <button
            key={i}
            onClick={() => { setActiveIdx(i); setShowHint(false); setShowAnswer(false); }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
              activeIdx === i ? 'font-bold' : 'text-slate-500 border-slate-800'
            }`}
            style={activeIdx === i ? { color: accentColor, borderColor: accentColor + '50', background: accentColor + '10' } : {}}
          >
            Scenario {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="rounded-xl border border-slate-800 p-5">
        <p className="text-sm text-white leading-relaxed">{s.question}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
        >
          <Lightbulb size={12} />
          {showHint ? 'Hide Hint' : 'Show Hint'}
        </button>
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border text-white transition-colors"
          style={{ borderColor: accentColor + '50', background: showAnswer ? accentColor + '20' : 'transparent' }}
        >
          <CheckCircle size={12} />
          {showAnswer ? 'Hide Answer' : 'Show Answer'}
        </button>
      </div>

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb size={14} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Hint</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{s.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-green-400" />
              <span className="text-xs font-bold text-green-300">Expert Explanation</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{s.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuizEngine({ lesson }) {
  const quiz = lesson?.quiz || {};
  const accentColor = lesson?.accent || '#3B82F6';
  const [activeTab, setActiveTab] = useState('mcq');
  const saveQuizScore = useJavaStore(s => s.saveQuizScore);

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: accentColor + '30', background: '#0a0c14' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: accentColor + '20', background: accentColor + '08' }}
      >
        <Award size={18} style={{ color: accentColor }} />
        <div>
          <h3 className="text-sm font-bold text-white">Quiz Arena</h3>
          <p className="text-[10px] text-slate-500">
            {quiz.mcq?.length || 0} MCQs • {quiz.coding?.length || 0} Coding • {quiz.scenario?.length || 0} Scenarios
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: accentColor }}>
          <Zap size={12} />
          <span className="font-bold">+XP</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: accentColor + '15' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-current'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
            style={activeTab === tab.id ? { color: accentColor, borderColor: accentColor } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {activeTab === 'mcq' && (
            <motion.div key="mcq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <MCQSection questions={quiz.mcq || []} accentColor={accentColor} />
            </motion.div>
          )}
          {activeTab === 'coding' && (
            <motion.div key="coding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CodingSection problems={quiz.coding || []} accentColor={accentColor} />
            </motion.div>
          )}
          {activeTab === 'scenario' && (
            <motion.div key="scenario" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScenarioSection scenarios={quiz.scenario || []} accentColor={accentColor} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

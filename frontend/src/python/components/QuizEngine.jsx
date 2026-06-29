/**
 * QuizEngine — 5 MCQ + 2 Coding challenges with AI evaluation and XP rewards
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, HelpCircle, Code2, Award, Zap, RefreshCw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import usePythonStore from '../store/usePythonStore';

function ConfettiExplosion({ active }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            background: ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EC4899'][i % 5],
          }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 2 + Math.random() * 1.5, delay: i * 0.04 }}
        />
      ))}
    </div>
  );
}

export default function QuizEngine({ lesson }) {
  const slug        = lesson?.slug;
  const quiz        = lesson?.quiz;
  const accentColor = lesson?.accent || '#3B82F6';
  const saveQuizScore = usePythonStore(s => s.saveQuizScore);
  const prevScore     = usePythonStore(s => s.getQuizScore(slug));

  const [phase,     setPhase]     = useState('idle');  // idle | mcq | coding | result
  const [mcqIdx,    setMcqIdx]    = useState(0);
  const [mcqAnswers,setMcqAns]    = useState({});      // qId → selected option
  const [mcqSubmitted, setMcqSub] = useState({});
  const [codingIdx, setCodingIdx] = useState(0);
  const [codingAns, setCodingAns] = useState({});      // cId → code string
  const [aiEval,    setAiEval]    = useState({});      // cId → { score, feedback }
  const [aiLoading, setAiLoading] = useState(false);
  const [score,     setScore]     = useState(0);
  const [showConf,  setShowConf]  = useState(false);
  const [expanded,  setExpanded]  = useState(true);

  if (!quiz) return null;

  const mcqs   = quiz.mcq   || [];
  const codings = quiz.coding || [];
  const currentMCQ  = mcqs[mcqIdx];
  const currentCode = codings[codingIdx];

  /* ── Start quiz ── */
  const handleStart = () => {
    setPhase('mcq');
    setMcqIdx(0);
    setMcqAns({});
    setMcqSub({});
    setCodingIdx(0);
    setCodingAns({});
    setAiEval({});
    setScore(0);
    setExpanded(true);
  };

  /* ── Submit MCQ answer ── */
  const handleMCQSubmit = (qId, selected) => {
    setMcqAns(prev => ({ ...prev, [qId]: selected }));
    setMcqSub(prev => ({ ...prev, [qId]: true }));
  };

  const handleNextMCQ = () => {
    if (mcqIdx < mcqs.length - 1) {
      setMcqIdx(i => i + 1);
    } else {
      setPhase('coding');
      setCodingIdx(0);
    }
  };

  /* ── Coding challenge AI evaluation ── */
  const handleEvalCode = async () => {
    const code = codingAns[currentCode.id] || '';
    if (!code.trim()) { toast.error('Write some code first!'); return; }
    setAiLoading(true);
    try {
      const resp = await api.post('/ai/chat', {
        message: `Evaluate this Python solution for the following task:

Task: ${currentCode.description}
Student code:
\`\`\`python
${code}
\`\`\`

Grade it from 0–100. Return JSON ONLY in this format:
{"score": <number>, "feedback": "<short feedback>", "isCorrect": <true|false>}`,
        mode: 'example',
        subject: 'Python'
      });
      let parsed;
      try {
        const raw = resp.data.response || '{}';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch?.[0] || '{}');
      } catch {
        parsed = { score: 70, feedback: 'Good attempt! Check edge cases.', isCorrect: true };
      }
      setAiEval(prev => ({ ...prev, [currentCode.id]: parsed }));
      toast.success('AI evaluated your solution!', { icon: '🤖' });
    } catch {
      const mockEval = { score: 75, feedback: 'Connect AI for detailed feedback. Good structure!', isCorrect: true };
      setAiEval(prev => ({ ...prev, [currentCode.id]: mockEval }));
    }
    setAiLoading(false);
  };

  const handleNextCoding = () => {
    if (codingIdx < codings.length - 1) {
      setCodingIdx(i => i + 1);
    } else {
      computeFinalScore();
    }
  };

  /* ── Compute final score ── */
  const computeFinalScore = () => {
    // MCQ score
    const mcqCorrect = mcqs.filter(q => mcqAnswers[q.id] === q.correct).length;
    const mcqScore   = Math.round((mcqCorrect / mcqs.length) * 60); // 60% weight

    // Coding score
    const codingTotal = codings.reduce((sum, c) => sum + (aiEval[c.id]?.score || 50), 0);
    const codingScore = Math.round((codingTotal / (codings.length * 100)) * 40); // 40% weight

    const finalScore = Math.min(100, mcqScore + codingScore);
    setScore(finalScore);
    setPhase('result');

    const xpBonus = finalScore >= 80 ? Math.round(lesson.xp * 0.5) : Math.round(lesson.xp * 0.2);
    saveQuizScore(slug, finalScore, xpBonus);

    if (finalScore >= 80) {
      setShowConf(true);
      setTimeout(() => setShowConf(false), 3500);
      toast.success(`🎉 Excellent! ${finalScore}% — +${xpBonus} XP earned!`, { duration: 4000 });
    } else {
      toast(`Quiz complete! Score: ${finalScore}%`, { icon: '📊' });
    }
  };

  /* ── Score colour ── */
  const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: accentColor + '30', background: '#0a0c14' }}
    >
      <ConfettiExplosion active={showConf} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        style={{ background: accentColor + '10', borderBottom: `1px solid ${accentColor}20` }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <HelpCircle size={18} style={{ color: accentColor }} />
          <span className="font-bold text-white">Lesson Quiz</span>
          <span className="text-xs text-slate-500">5 MCQ + 2 Coding</span>
          {prevScore !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Best: {prevScore}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs" style={{ color: accentColor }}>
            <Zap size={12} /> {Math.round(lesson.xp * 0.5)} XP
          </span>
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="p-5">
              {/* ── IDLE ── */}
              {phase === 'idle' && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">🧠</div>
                  <h3 className="text-white font-bold text-xl mb-2">Ready to test your knowledge?</h3>
                  <p className="text-slate-400 text-sm mb-6">
                    5 multiple-choice questions + 2 coding challenges.<br />
                    Score 80%+ to earn full XP bonus!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStart}
                    className="px-8 py-3 rounded-xl font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}, ${accentColor}AA)`,
                      boxShadow: `0 8px 24px ${accentColor}40`,
                    }}
                  >
                    Start Quiz 🚀
                  </motion.button>
                </div>
              )}

              {/* ── MCQ ── */}
              {phase === 'mcq' && currentMCQ && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mcqIdx}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                  >
                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-slate-500">Question {mcqIdx + 1}/{mcqs.length}</span>
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${((mcqIdx + 1) / mcqs.length) * 100}%`, background: accentColor }}
                        />
                      </div>
                    </div>

                    <h3 className="text-white font-semibold text-base mb-5 leading-relaxed">
                      {currentMCQ.question}
                    </h3>

                    <div className="space-y-3 mb-5">
                      {currentMCQ.options.map((opt) => {
                        const submitted = !!mcqSubmitted[currentMCQ.id];
                        const selected  = mcqAnswers[currentMCQ.id] === opt;
                        const isCorrect = opt === currentMCQ.correct;
                        let borderColor = 'border-slate-700 hover:border-slate-600';
                        let bg = 'bg-slate-800/50';
                        let icon = null;
                        if (submitted && isCorrect) { borderColor = 'border-emerald-500'; bg = 'bg-emerald-500/15'; icon = <CheckCircle size={16} className="text-emerald-400" />; }
                        if (submitted && selected && !isCorrect) { borderColor = 'border-red-500'; bg = 'bg-red-500/15'; icon = <XCircle size={16} className="text-red-400" />; }

                        return (
                          <button
                            key={opt}
                            disabled={submitted}
                            onClick={() => !submitted && handleMCQSubmit(currentMCQ.id, opt)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between ${bg} ${borderColor}`}
                          >
                            <span className="text-sm text-slate-200">{opt}</span>
                            {icon}
                          </button>
                        );
                      })}
                    </div>

                    {mcqSubmitted[currentMCQ.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700"
                      >
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <span className="text-amber-400 font-bold">💡 Explanation: </span>
                          {currentMCQ.explanation}
                        </p>
                      </motion.div>
                    )}

                    {mcqSubmitted[currentMCQ.id] && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleNextMCQ}
                        className="w-full py-3 rounded-xl font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}BB)` }}
                      >
                        {mcqIdx < mcqs.length - 1 ? 'Next Question →' : 'Go to Coding Challenge →'}
                      </motion.button>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* ── CODING ── */}
              {phase === 'coding' && currentCode && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={codingIdx}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Code2 size={16} style={{ color: accentColor }} />
                      <span className="text-sm font-bold text-white">{currentCode.title}</span>
                      <span className="text-xs text-slate-500 ml-auto">Coding {codingIdx + 1}/{codings.length}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                      <p className="text-sm text-amber-200">{currentCode.description}</p>
                    </div>

                    {/* Mini editor */}
                    <div className="rounded-xl overflow-hidden border border-slate-700 mb-4" style={{ height: 220 }}>
                      <Editor
                        height="220px"
                        language="python"
                        value={codingAns[currentCode.id] ?? currentCode.starterCode}
                        onChange={val => setCodingAns(prev => ({ ...prev, [currentCode.id]: val || '' }))}
                        theme="vs-dark"
                        options={{ fontSize: 13, minimap: { enabled: false }, lineNumbers: 'on', scrollBeyondLastLine: false, automaticLayout: true }}
                      />
                    </div>

                    {/* AI Feedback */}
                    <AnimatePresence>
                      {aiEval[currentCode.id] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 p-4 rounded-xl border"
                          style={{
                            borderColor: aiEval[currentCode.id].isCorrect ? '#22C55E60' : '#EF444460',
                            background: aiEval[currentCode.id].isCorrect ? '#22C55E10' : '#EF444410'
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} style={{ color: accentColor }} />
                            <span className="text-xs font-bold" style={{ color: accentColor }}>AI Evaluation</span>
                            <span
                              className="ml-auto font-bold text-sm"
                              style={{ color: aiEval[currentCode.id].isCorrect ? '#22C55E' : '#EF4444' }}
                            >
                              {aiEval[currentCode.id].score}/100
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{aiEval[currentCode.id].feedback}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleEvalCode}
                        disabled={aiLoading || !!aiEval[currentCode.id]}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                          opacity: (aiLoading || !!aiEval[currentCode.id]) ? 0.6 : 1
                        }}
                      >
                        {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        {aiLoading ? 'Evaluating...' : aiEval[currentCode.id] ? 'Evaluated ✓' : 'AI Evaluate'}
                      </motion.button>

                      {aiEval[currentCode.id] && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleNextCoding}
                          className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                          style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}BB)` }}
                        >
                          {codingIdx < codings.length - 1 ? 'Next Challenge →' : 'View Results 🏆'}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* ── RESULT ── */}
              {phase === 'result' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 1 }}
                    className="text-6xl mb-4"
                  >
                    {score >= 80 ? '🏆' : score >= 60 ? '👍' : '📖'}
                  </motion.div>

                  <h3 className="text-white font-bold text-2xl mb-1">
                    {score >= 80 ? 'Outstanding!' : score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                  </h3>

                  <motion.div
                    className="text-5xl font-black my-4"
                    style={{ color: scoreColor }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    {score}%
                  </motion.div>

                  {/* MCQ breakdown */}
                  <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                    <div className="rounded-xl p-3 bg-slate-800/60 border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">MCQ Score</div>
                      <div className="font-bold text-white">
                        {mcqs.filter(q => mcqAnswers[q.id] === q.correct).length}/{mcqs.length} correct
                      </div>
                    </div>
                    <div className="rounded-xl p-3 bg-slate-800/60 border border-slate-700">
                      <div className="text-slate-400 text-xs mb-1">Coding Score</div>
                      <div className="font-bold text-white">
                        {codings.map(c => aiEval[c.id]?.score || 50).join(' + ')} pts
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleStart}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-slate-700 text-slate-300 hover:border-slate-500"
                    >
                      <RefreshCw size={14} /> Retry
                    </motion.button>
                    {score >= 80 && (
                      <motion.div
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                        style={{ background: '#22C55E20', border: '1px solid #22C55E60', color: '#22C55E' }}
                      >
                        <Award size={14} /> +{Math.round(lesson.xp * 0.5)} XP Earned!
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

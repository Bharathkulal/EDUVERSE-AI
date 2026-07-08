/**
 * AITeacher — Step-by-step lesson content renderer with "Explain Like Software Architect" mode
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Code2, Lightbulb, AlertTriangle, HelpCircle,
  Award, ChevronDown, ChevronUp, Building2
} from 'lucide-react';

const TYPE_CONFIG = {
  intro:   { icon: BookOpen,       label: 'Introduction',    color: '#3B82F6', bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  concept: { icon: Lightbulb,      label: 'Key Concept',     color: '#8B5CF6', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  code:    { icon: Code2,          label: 'Live Coding',     color: '#10B981', bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
  explain: { icon: BookOpen,       label: 'Explanation',     color: '#06B6D4', bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20'   },
  warn:    { icon: AlertTriangle,  label: 'Watch Out!',      color: '#F59E0B', bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  quiz:    { icon: HelpCircle,     label: 'Quick Question',  color: '#EC4899', bg: 'bg-pink-500/10',   border: 'border-pink-500/20'   },
  congrats:{ icon: Award,          label: 'Well Done!',      color: '#22C55E', bg: 'bg-green-500/10',  border: 'border-green-500/20'  },
  summary: { icon: Award,          label: 'Lesson Summary',  color: '#A855F7', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
};

function JavaCodeBlock({ code, accent = '#10B981' }) {
  const [expanded, setExpanded] = useState(true);
  const lines = code.split('\n');

  return (
    <div
      className="rounded-xl overflow-hidden border mt-3"
      style={{ borderColor: accent + '40', background: '#0a0a1a' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b cursor-pointer"
        style={{ borderColor: accent + '30', background: accent + '10' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-xs text-slate-500 ml-2 font-mono">java</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm leading-7">
                {lines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-8 text-right text-slate-600 select-none mr-4 flex-shrink-0 text-xs pt-0.5">{i + 1}</span>
                    <span className="text-slate-200 whitespace-pre font-mono"
                      dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                          // Java keywords
                          .replace(/\b(public|private|protected|static|final|void|class|interface|extends|implements|import|package|return|new|if|else|for|while|try|catch|finally|throw|throws|this|super|abstract|synchronized|volatile|transient|native|strictfp|switch|case|break|continue|default|do|instanceof|enum|assert)\b/g,
                            '<span style="color:#C084FC">$1</span>')
                          // Annotations
                          .replace(/(@\w+)/g, '<span style="color:#FCD34D">$1</span>')
                          // Strings
                          .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color:#86EFAC">$1</span>')
                          // Numbers
                          .replace(/\b(\d+\.?\d*[fFdDlL]?)\b/g, '<span style="color:#FCD34D">$1</span>')
                          // Comments
                          .replace(/(\/\/.*)$/g, '<span style="color:#64748B;font-style:italic">$1</span>')
                          // Types
                          .replace(/\b(String|int|long|double|float|boolean|byte|short|char|Integer|Long|Double|Boolean|List|Map|Set|Optional|Connection|Statement|PreparedStatement|ResultSet|Session|EntityManager)\b/g,
                            '<span style="color:#7DD3FC">$1</span>')
                      }}
                    />
                  </div>
                ))}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArchitectPanel({ lesson }) {
  const arch = lesson?.architectExplain;
  if (!arch) return null;

  const items = [
    { icon: '🏢', label: 'Why Companies Use It', text: arch.whyCompaniesUseIt },
    { icon: '📈', label: 'Scalability Impact', text: arch.scalabilityImpact },
    { icon: '⚡', label: 'Performance Impact', text: arch.performanceImpact },
    { icon: '🌍', label: 'Industry Examples', text: arch.realWorldExamples },
    { icon: '🧠', label: 'Architecture Decisions', text: arch.decisions },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-amber-500/30 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,0,0,0.3))' }}
    >
      <div className="flex items-center gap-3 px-5 py-3 border-b border-amber-500/20 bg-amber-500/5">
        <Building2 size={16} className="text-amber-400" />
        <span className="text-sm font-bold text-amber-300">Software Architect Perspective</span>
        <span className="text-[9px] text-amber-500/60 font-mono ml-auto">ENTERPRISE VIEW</span>
      </div>
      <div className="p-4 space-y-3">
        {items.map(({ icon, label, text }) => (
          <div key={label} className="flex gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
            <div>
              <div className="text-xs font-bold text-amber-300 mb-0.5">{label}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function AITeacher({ lesson, currentStep }) {
  const script       = lesson?.script || [];
  const codeExamples = lesson?.codeExamples || [];
  const accentColor  = lesson?.accent || '#3B82F6';

  const step   = script[currentStep] || {};
  const config = TYPE_CONFIG[step.type] || TYPE_CONFIG.concept;
  const Icon   = config.icon;

  // Which code example to show
  const codeStep    = script.slice(0, currentStep + 1).filter(s => s.type === 'code').length;
  const codeExample = codeExamples[codeStep - 1];

  const [history, setHistory] = useState([]);
  const [showArchitect, setShowArchitect] = useState(false);

  useEffect(() => {
    setHistory(script.slice(0, currentStep + 1));
  }, [currentStep, script]);

  return (
    <div className="space-y-4">
      {/* Architect mode toggle */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowArchitect(!showArchitect)}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-dashed transition-all font-bold text-sm"
        style={{
          borderColor: showArchitect ? '#F59E0B80' : '#F59E0B30',
          background: showArchitect
            ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))'
            : 'transparent',
          color: showArchitect ? '#FCD34D' : '#F59E0B80',
        }}
      >
        <Building2 size={18} />
        {showArchitect ? '✦ Architect Mode Active — Click to Close' : '🏛️ Explain Like Software Architect'}
      </motion.button>

      {/* Architect panel */}
      <AnimatePresence>
        {showArchitect && <ArchitectPanel lesson={lesson} />}
      </AnimatePresence>

      {/* Timeline of all steps shown so far */}
      <div className="space-y-3">
        {history.map((s, i) => {
          const c = TYPE_CONFIG[s.type] || TYPE_CONFIG.concept;
          const I = c.icon;
          const isActive = i === currentStep;
          const isCode = s.type === 'code';
          const codeIdx = script.slice(0, i + 1).filter(x => x.type === 'code').length;
          const ce = isCode ? codeExamples[codeIdx - 1] : null;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-xl border p-4 transition-all ${isActive ? 'ring-1' : 'opacity-70'}`}
              style={{
                borderColor: isActive ? c.color + '60' : 'rgba(100,116,139,0.15)',
                background: isActive ? c.color + '08' : 'transparent',
                ringColor: isActive ? c.color + '40' : 'transparent',
              }}
            >
              {/* Step header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: c.color + '20' }}
                >
                  <I size={12} style={{ color: c.color }} />
                </div>
                <span className="text-xs font-bold" style={{ color: c.color }}>{c.label}</span>
                <span className="text-[9px] text-slate-600 font-mono ml-auto">Step {i + 1}</span>
              </div>

              {/* Step text */}
              <p className="text-sm text-slate-300 leading-relaxed">{s.text}</p>

              {/* Code example for 'code' type steps */}
              {ce && (
                <div className="mt-3">
                  <div className="text-xs font-bold text-slate-400 mb-1">💻 {ce.title}</div>
                  <JavaCodeBlock code={ce.code} accent={c.color} />
                  {ce.explanation && (
                    <p className="text-xs text-slate-500 mt-2 italic">📝 {ce.explanation}</p>
                  )}
                  {ce.output && (
                    <div className="mt-2 text-xs font-mono bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-green-400">
                      <span className="text-slate-600">Output: </span>
                      {ce.output}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

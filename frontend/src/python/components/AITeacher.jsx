/**
 * AITeacher — Step-by-step lesson content renderer
 * Drives Introduction → Concept → Code → Practice → Quiz → Summary
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Code2, Lightbulb, AlertTriangle, HelpCircle, Award, ChevronDown, ChevronUp } from 'lucide-react';

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

function CodeBlock({ code, language = 'python', accent = '#10B981' }) {
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
          <span className="text-xs text-slate-500 ml-2 font-mono">{language}</span>
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
                          // Python keywords
                          .replace(/\b(def|return|if|elif|else|for|while|in|and|or|not|import|from|class|pass|break|continue|lambda|True|False|None|global|nonlocal|with|as|try|except|finally|raise|yield|async|await)\b/g,
                            '<span style="color:#C084FC">$1</span>')
                          // Strings
                          .replace(/(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g, '<span style="color:#86EFAC">$1$2$3</span>')
                          // Numbers
                          .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#FCD34D">$1</span>')
                          // Comments
                          .replace(/(#.*)$/g, '<span style="color:#64748B;font-style:italic">$1</span>')
                          // Built-ins
                          .replace(/\b(print|input|len|range|int|float|str|bool|list|dict|set|tuple|type|sorted|max|min|sum|abs|round)\b/g,
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

export default function AITeacher({ lesson, currentStep }) {
  const script       = lesson?.script || [];
  const codeExamples = lesson?.codeExamples || [];
  const accentColor  = lesson?.accent || '#3B82F6';

  const step         = script[currentStep] || {};
  const config       = TYPE_CONFIG[step.type] || TYPE_CONFIG.concept;
  const Icon         = config.icon;

  // Which code example to show (code type steps cycle through examples)
  const codeStep     = script.slice(0, currentStep + 1).filter(s => s.type === 'code').length;
  const codeExample  = codeExamples[codeStep - 1];

  // History of all steps shown so far (for scrollable timeline)
  const [history, setHistory] = useState([]);
  useEffect(() => {
    setHistory(script.slice(0, currentStep + 1));
  }, [currentStep, script]);

  return (
    <div className="space-y-4">
      {/* Current step highlight */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`rounded-2xl border p-5 ${config.bg} ${config.border}`}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: config.color + '20', border: `1px solid ${config.color}40` }}
            >
              <Icon size={17} style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
              <motion.p
                className="mt-1.5 text-slate-200 leading-relaxed text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {step.text}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Code example for current code step */}
      <AnimatePresence>
        {step.type === 'code' && codeExample && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border p-5"
            style={{ background: '#0d1117', borderColor: accentColor + '30' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Code2 size={14} style={{ color: accentColor }} />
              <span className="text-sm font-bold" style={{ color: accentColor }}>
                {codeExample.title}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{codeExample.explanation}</p>
            <CodeBlock code={codeExample.code} accent={accentColor} />
            {codeExample.output && (
              <div
                className="mt-3 rounded-xl p-3 text-xs font-mono"
                style={{ background: '#020409', border: `1px solid ${accentColor}20` }}
              >
                <div className="text-slate-500 mb-1 text-[10px] uppercase tracking-wider">Output</div>
                <pre className="text-emerald-400 whitespace-pre-wrap">{codeExample.output}</pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lesson step timeline */}
      {history.length > 1 && (
        <div className="rounded-2xl border border-slate-800/60 p-4 bg-slate-900/30">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Lesson Timeline</h4>
          <div className="space-y-2">
            {history.slice(0, -1).map((s, i) => {
              const c = TYPE_CONFIG[s.type] || TYPE_CONFIG.concept;
              const I = c.icon;
              return (
                <div key={i} className="flex items-center gap-2 opacity-60">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: c.color + '20' }}
                  >
                    <I size={11} style={{ color: c.color }} />
                  </div>
                  <span className="text-xs text-slate-400 truncate">{s.text.slice(0, 70)}…</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

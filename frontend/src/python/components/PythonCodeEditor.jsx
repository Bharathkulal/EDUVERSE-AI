/**
 * PythonCodeEditor — Monaco-powered Python editor with run, AI autocorrect, terminal
 */
import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2, Wand2, Terminal, RefreshCw, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const STARTER_CODE = `# Python Practice Editor
# Write your code below and click Run

print("Hello, Python! 🐍")

# Try it yourself:
name = input("What's your name? ")
print(f"Welcome to EduVerse, {name}!")
`;

const MOCK_OUTPUTS = {
  default: `Hello, Python! 🐍\nWhat's your name? Alice\nWelcome to EduVerse, Alice!\n\n✅ Process completed (0.12s)`,
  print:   `Output displayed successfully\n\n✅ Process completed (0.08s)`,
  error:   `  File "main.py", line 2\n    prnt("hello")\n    ^^^^\nNameError: name 'prnt' is not defined\n\n❌ Process exited with code 1`,
};

function getMockOutput(code) {
  if (code.includes('NameError') || code.includes('prnt') || code.includes('errr')) return MOCK_OUTPUTS.error;
  if (!code.includes('input')) return MOCK_OUTPUTS.print;
  return MOCK_OUTPUTS.default;
}

export default function PythonCodeEditor({ lesson, starterCode }) {
  const [code,       setCode]       = useState(starterCode || STARTER_CODE);
  const [output,     setOutput]     = useState('');
  const [running,    setRunning]    = useState(false);
  const [aiLoading,  setAiLoading]  = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [showTerm,   setShowTerm]   = useState(false);
  const editorRef                   = useRef(null);

  const accentColor = lesson?.accent || '#3B82F6';

  /* ── Run code (mock simulation) ── */
  const handleRun = async () => {
    setRunning(true);
    setShowTerm(true);
    setOutput('🔄 Compiling and running...\n');
    await new Promise(r => setTimeout(r, 800));

    const mockOut = getMockOutput(code);
    setOutput(mockOut);
    setRunning(false);

    if (mockOut.includes('❌')) {
      toast.error('Runtime error detected!', { icon: '🐛' });
    } else {
      toast.success('Code ran successfully!', { icon: '✅' });
    }
  };

  /* ── AI Auto-correct ── */
  const handleAutoCorrect = async () => {
    if (!code.trim()) { toast.error('Write some code first!'); return; }
    setAiLoading(true);
    try {
      const resp = await api.post('/ai/chat', {
        message: `Review and auto-correct this Python code. Return ONLY the corrected code without any explanation:\n\n${code}`,
        mode: 'example',
        subject: 'Python'
      });
      const cleaned = (resp.data.response || '')
        .replace(/```python/gi, '').replace(/```/g, '').trim();
      if (cleaned) {
        setCode(cleaned);
        toast.success('AI corrected your code!', { icon: '🤖' });
      }
    } catch {
      // Fallback: just show current code (mock mode)
      toast('AI auto-correct requires API connection', { icon: '⚡' });
    }
    setAiLoading(false);
  };

  /* ── Copy code ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied!');
  };

  /* ── Reset ── */
  const handleReset = () => {
    setCode(starterCode || STARTER_CODE);
    setOutput('');
    toast('Editor reset to starter code', { icon: '🔄' });
  };

  /* ── Delete all ── */
  const handleDelete = () => {
    setCode('');
    setOutput('');
  };

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: accentColor + '30', background: '#0d1117' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: accentColor + '20', background: accentColor + '08' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-bold" style={{ color: accentColor }}>
            🐍 Python Editor
          </span>
          <span className="text-xs text-slate-500 font-mono">main.py</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 transition-all"
          >
            <RefreshCw size={12} /> Reset
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 border border-red-800/40 hover:border-red-600/60 transition-all"
          >
            <Trash2 size={12} /> Clear
          </button>

          {/* AI Auto-correct */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAutoCorrect}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              color: '#fff',
              opacity: aiLoading ? 0.7 : 1,
            }}
          >
            {aiLoading
              ? <RefreshCw size={12} className="animate-spin" />
              : <Wand2 size={12} />}
            {aiLoading ? 'Fixing...' : 'AI Fix'}
          </motion.button>

          {/* Run */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}BB)`,
              color: '#fff',
              boxShadow: `0 4px 12px ${accentColor}40`,
              opacity: running ? 0.7 : 1,
            }}
          >
            {running
              ? <RefreshCw size={12} className="animate-spin" />
              : <Play size={12} fill="white" />}
            {running ? 'Running...' : 'Run ▶'}
          </motion.button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ height: 320 }}>
        <Editor
          height="100%"
          language="python"
          value={code}
          onChange={val => setCode(val || '')}
          onMount={editor => { editorRef.current = editor; }}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            roundedSelection: true,
            renderLineHighlight: 'all',
            cursorStyle: 'line',
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Terminal output */}
      <div
        className="border-t cursor-pointer"
        style={{ borderColor: accentColor + '20' }}
        onClick={() => output && setShowTerm(v => !v)}
      >
        <div
          className="flex items-center gap-2 px-5 py-2.5"
          style={{ background: '#020409' }}
        >
          <Terminal size={13} style={{ color: accentColor }} />
          <span className="text-xs font-bold" style={{ color: accentColor }}>Terminal</span>
          {output && (
            <span className={`ml-auto text-[10px] font-mono ${output.includes('❌') ? 'text-red-400' : 'text-emerald-400'}`}>
              {output.includes('❌') ? '● Error' : '● Success'}
            </span>
          )}
        </div>
        <AnimatePresence>
          {showTerm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: '#020409' }}
              className="overflow-hidden"
            >
              <div className="px-5 py-4">
                {running ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={12} className="animate-spin text-blue-400" />
                    <span className="text-xs text-blue-400 font-mono">Executing...</span>
                  </div>
                ) : output ? (
                  <pre
                    className={`text-sm font-mono whitespace-pre-wrap leading-relaxed ${
                      output.includes('❌') ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {output}
                  </pre>
                ) : (
                  <span className="text-xs text-slate-600 font-mono">
                    Click Run ▶ to execute your code...
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

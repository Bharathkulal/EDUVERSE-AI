import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Terminal, Code2 } from 'lucide-react';

export default function ExecutionSimulator() {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(-1);
  const [stack, setStack] = useState([]);
  const [output, setOutput] = useState([]);

  const codeLines = [
    'Stack<string> myStack = new Stack<string>();', // 0
    'myStack.Push("Apple");',                       // 1
    'myStack.Push("Banana");',                      // 2
    'myStack.Push("Cherry");',                      // 3
    'string topItem = myStack.Pop();',              // 4
    'Console.WriteLine("Popped: " + topItem);',     // 5
  ];

  const reset = () => {
    setIsRunning(false);
    setCurrentLine(-1);
    setStack([]);
    setOutput([]);
  };

  const runSimulation = async () => {
    reset();
    setIsRunning(true);
    
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Line 0
    setCurrentLine(0); await delay(1000);
    // Line 1
    setCurrentLine(1); setStack(['Apple']); await delay(1000);
    // Line 2
    setCurrentLine(2); setStack(['Apple', 'Banana']); await delay(1000);
    // Line 3
    setCurrentLine(3); setStack(['Apple', 'Banana', 'Cherry']); await delay(1000);
    // Line 4
    setCurrentLine(4); setStack(['Apple', 'Banana']); await delay(1000);
    // Line 5
    setCurrentLine(5); setOutput(['Popped: Cherry']); await delay(1000);

    setCurrentLine(-1);
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Interactive Simulator</h1>
            <p className="text-sm text-slate-500">C# Stack Implementation</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={reset} disabled={isRunning} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={runSimulation} disabled={isRunning} className="btn-primary flex items-center gap-2">
            <Play className="w-4 h-4" /> Run Code
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 flex-1">
        {/* Code Editor */}
        <div className="lg:col-span-5 card-glass bg-slate-900 border-slate-800 p-0 overflow-hidden flex flex-col">
          <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-mono text-sm">Program.cs</span>
          </div>
          <div className="p-4 font-mono text-sm flex-1 overflow-auto">
            {codeLines.map((line, idx) => (
              <div 
                key={idx} 
                className={`px-2 py-1 flex items-center gap-4 rounded ${currentLine === idx ? 'bg-blue-500/20 border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
              >
                <span className="text-slate-600 w-4 text-right">{idx + 1}</span>
                <span className={`transition-colors ${currentLine === idx ? 'text-blue-300' : 'text-slate-300'}`}>
                  {line}
                </span>
                {currentLine === idx && (
                  <motion.div layoutId="pointer" className="w-2 h-2 rounded-full bg-blue-500 ml-auto" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Viz & Output */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Visualization */}
          <div className="card-glass flex-1 relative flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="absolute top-6 left-6 font-bold text-slate-400 uppercase tracking-widest text-xs">Memory Visualization</h3>
            <div className="w-48 border-b-4 border-l-4 border-r-4 border-slate-300 rounded-b-xl relative flex flex-col justify-end p-2 gap-2 bg-white shadow-inner h-64 mt-10">
              <AnimatePresence>
                {stack.map((item, index) => (
                  <motion.div
                    key={`${item}-${index}`}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="w-full py-2 bg-blue-500 rounded text-center text-white font-bold shadow"
                  >
                    {item}
                  </motion.div>
                ))}
              </AnimatePresence>
              {stack.length === 0 && <div className="text-center text-slate-400 text-sm py-2">Empty</div>}
            </div>
          </div>

          {/* Terminal Output */}
          <div className="card-glass bg-black border-slate-800 p-0 h-48 flex flex-col">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 font-mono text-sm">Console Output</span>
            </div>
            <div className="p-4 font-mono text-sm text-green-400">
              <AnimatePresence>
                {output.map((out, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    &gt; {out}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isRunning && currentLine >= 0 && output.length === 0 && (
                <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

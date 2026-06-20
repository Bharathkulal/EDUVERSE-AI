import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Info } from 'lucide-react';

export default function StackVisualization() {
  const navigate = useNavigate();
  const [stack, setStack] = useState(['Arrays', 'Linked List']);
  const [actionLabel, setActionLabel] = useState(null);

  const pushItem = () => {
    if (stack.length >= 6) return;
    const items = ['Trees', 'Graphs', 'HashMaps', 'Heaps', 'Tries'];
    const next = items[stack.length % items.length];
    setStack([...stack, next]);
    setActionLabel('PUSH');
    setTimeout(() => setActionLabel(null), 1000);
  };

  const popItem = () => {
    if (stack.length === 0) return;
    setStack(stack.slice(0, -1));
    setActionLabel('POP');
    setTimeout(() => setActionLabel(null), 1000);
  };

  return (
    <div className="min-h-screen p-6 md:p-10 flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/subjects/dsa')} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stack (LIFO)</h1>
          <p className="text-sm text-slate-500">Data Structures Module</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 flex-1">
        {/* Left: Explanation */}
        <div className="flex flex-col gap-6">
          <div className="card-glass border-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Info className="w-20 h-20 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">How it works</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              A Stack is a linear data structure that follows the <strong>Last In, First Out (LIFO)</strong> principle. 
              The last element added is the first one to be removed.
            </p>
            <div className="space-y-3">
              <div className="bg-white/50 p-3 rounded-lg border border-slate-100 flex gap-3 items-start">
                <span className="font-mono text-sm font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Push()</span>
                <span className="text-sm text-slate-600">Adds an element to the top of the stack.</span>
              </div>
              <div className="bg-white/50 p-3 rounded-lg border border-slate-100 flex gap-3 items-start">
                <span className="font-mono text-sm font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">Pop()</span>
                <span className="text-sm text-slate-600">Removes the top element from the stack.</span>
              </div>
            </div>
          </div>

          <div className="card-glass flex-1 flex flex-col justify-center items-center gap-6">
            <h3 className="text-lg font-bold text-slate-800">Ready to write code?</h3>
            <p className="text-slate-500 text-center max-w-sm">Test your understanding by writing and running actual Stack implementations.</p>
            <button 
              onClick={() => navigate('/dsa/stack/simulator')}
              className="btn-primary w-full max-w-xs flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" /> Try Example Simulator
            </button>
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="card-glass bg-slate-50/50 flex flex-col items-center justify-center py-12 relative min-h-[500px]">
          {/* Action indicator animation */}
          <AnimatePresence>
            {actionLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className={`absolute top-10 font-black text-4xl uppercase tracking-widest ${actionLabel === 'PUSH' ? 'text-blue-500/20' : 'text-red-500/20'}`}
              >
                {actionLabel}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-64 h-96 border-b-4 border-l-4 border-r-4 border-slate-300 rounded-b-xl relative flex flex-col justify-end p-2 gap-2 bg-white shadow-inner">
            <AnimatePresence>
              {stack.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 50, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`w-full h-14 rounded-lg flex items-center justify-center font-bold text-white shadow-md relative
                    ${index === stack.length - 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500 ring-4 ring-blue-200' : 'bg-slate-400'}`}
                >
                  {item}
                  {index === stack.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute -left-20 text-blue-600 font-bold flex items-center gap-2"
                    >
                      TOP <ArrowLeft className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {stack.length === 0 && <div className="text-center text-slate-400 font-medium py-4">Stack is empty</div>}
          </div>

          <div className="flex gap-4 mt-12">
            <button onClick={popItem} disabled={stack.length===0} className="btn-secondary w-32 border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 font-bold tracking-wide">
              POP
            </button>
            <button onClick={pushItem} disabled={stack.length>=6} className="btn-primary w-32 bg-blue-600 font-bold tracking-wide">
              PUSH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, List, GitCommit, GitMerge, Share2, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  const categories = [
    { id: 'stack', title: 'Stack', icon: Layers, desc: 'LIFO data structure. Ideal for undo/redo and recursion.', progress: 100 },
    { id: 'queue', title: 'Queue', icon: List, desc: 'FIFO data structure. Great for task scheduling and BFS.', progress: 40 },
    { id: 'linked-list', title: 'Linked List', icon: GitCommit, desc: 'Dynamic memory allocation with O(1) insertions.', progress: 0 },
    { id: 'tree', title: 'Tree', icon: GitMerge, desc: 'Hierarchical structure. Essential for databases and search.', progress: 0 },
    { id: 'graph', title: 'Graph', icon: Share2, desc: 'Nodes and edges representing networks and paths.', progress: 0 },
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVars = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Scroll Parallax Header */}
      <motion.div 
        style={{ y, opacity }}
        className="relative h-64 bg-gradient-to-r from-blue-600 to-indigo-700 flex flex-col justify-center px-8 sm:px-16 text-white overflow-hidden rounded-b-[40px] shadow-lg shadow-blue-500/20"
      >
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Data Structures</h1>
          <p className="text-blue-100 text-lg max-w-xl font-medium">Master the foundational building blocks of efficient algorithms and software design.</p>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-8 relative z-20">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Learning Modules</h2>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVars}
          initial="hidden"
          animate="visible"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={cardVars}
              whileHover={{ scale: 1.03, y: -5 }}
              onClick={() => {
                if (cat.id === 'stack') navigate('/dsa/stack');
              }}
              className={`card-glass cursor-pointer flex flex-col justify-between ${cat.id === 'stack' ? 'ring-2 ring-blue-500 shadow-blue-500/20' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                  <cat.icon className="w-6 h-6" />
                </div>
                {cat.progress === 100 && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">{cat.title}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">{cat.desc}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.progress}%` }}></div>
                  </div>
                </div>
                <button className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                  <PlayCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

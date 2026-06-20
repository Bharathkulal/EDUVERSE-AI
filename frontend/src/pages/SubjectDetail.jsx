import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import CSharpLab from '../components/CSharpLab';
import DBMSLab from '../components/DBMSLab';
import JavaLab from '../components/JavaLab';
import DSALab from '../components/DSALab';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, List, GitCommit, GitMerge, Share2, PlayCircle, CheckCircle2 } from 'lucide-react';

export default function SubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);

  useEffect(() => {
    if (id === 'math-proto') {
      setSubject({
        id: 'math-proto',
        subject_name: 'Mathematics',
        description: 'Advanced numerical methods and calculus execution engines.',
        topics: []
      });
      return;
    }
    api.get(`/subjects/${id}`).then((res) => {
      setSubject(res.data);
      if (res.data.topics?.length) setActiveTopic(res.data.topics[0]);
    }).catch(err => {
      console.error(err);
    });
  }, [id]);

  const markComplete = async (topicId) => {
    try {
      await api.post('/progress/complete-topic', { topic_id: topicId, study_minutes: 20 });
      toast.success('Topic marked as completed!');
    } catch {
      toast.error('Could not update progress');
    }
  };

  if (!subject) return <div className="animate-pulse h-96 bg-slate-200 rounded-xl" />;

  // DBMS gets the interactive lab experience
  if (subject.subject_name === 'DBMS') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>{subject.subject_name}</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>{subject.description}</p>
        </div>
        <DBMSLab />
      </div>
    );
  }

  // Advanced Java gets the interactive lab experience
  if (subject.subject_name === 'Advanced Java') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>{subject.subject_name}</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>{subject.description}</p>
        </div>
        <JavaLab />
      </div>
    );
  }

  // C# gets the interactive lab experience
  if (subject.subject_name === 'C#') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 4px' }}>{subject.subject_name}</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>{subject.description}</p>
        </div>
        <CSharpLab />
      </div>
    );
  }

  // --- NEW FRAMER MOTION DSA PROTOTYPE ---
  if (subject.subject_name === 'DSA') {
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
                  if (cat.id === 'queue') navigate('/dsa/queue');
                  if (cat.id === 'linked-list') navigate('/dsa/linked-list');
                  if (cat.id === 'tree') navigate('/dsa/tree');
                }}
                className={`card-glass cursor-pointer flex flex-col justify-between ${['stack', 'queue', 'linked-list', 'tree'].includes(cat.id) ? 'ring-2 ring-blue-500 shadow-blue-500/20' : ''}`}
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

  // --- NEW FRAMER MOTION MATHEMATICS PROTOTYPE ---
  if (subject.subject_name === 'Mathematics') {
    const categories = [
      { id: 'numerical-methods', title: 'Numerical Methods', icon: Layers, desc: 'Trapezoidal, Simpson’s, RK4, and Interpolation runtimes.', progress: 80 },
      { id: 'calculus', title: 'Calculus Simulator', icon: Share2, desc: 'Live limits, derivatives, and integral area calculations.', progress: 20 },
      { id: 'linear-algebra', title: 'Linear Algebra', icon: GitMerge, desc: 'Matrix transformations, Eigenvalues, and Vector Spaces.', progress: 0 },
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
        <motion.div 
          style={{ y, opacity }}
          className="relative h-64 bg-gradient-to-r from-emerald-600 to-teal-700 flex flex-col justify-center px-8 sm:px-16 text-white overflow-hidden rounded-b-[40px] shadow-lg shadow-emerald-500/20"
        >
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Mathematics Lab</h1>
            <p className="text-teal-100 text-lg max-w-xl font-medium">Watch mathematical formulas execute live like a programming runtime.</p>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 mt-8 relative z-20">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Visual Solver Engines</h2>
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
                  if (cat.id === 'numerical-methods') navigate('/mathematics/numerical-methods');
                }}
                className={`card-glass cursor-pointer flex flex-col justify-between ${cat.id === 'numerical-methods' ? 'ring-2 ring-emerald-500 shadow-emerald-500/20' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                    <cat.icon className="w-6 h-6" />
                  </div>
                  {cat.progress === 100 && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">{cat.title}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1">{cat.desc}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cat.progress}%` }}></div>
                    </div>
                  </div>
                  <button className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition">
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

  // Generic fallback UI for all other subjects
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{subject.subject_name}</h1>
        <p className="text-slate-500">{subject.description}</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 card h-fit">
          <h2 className="font-semibold mb-3">Topics</h2>
          <ul className="space-y-1">
            {subject.topics?.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveTopic(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeTopic?.id === t.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}
                >
                  {t.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3 card">
          {activeTopic ? (
            <>
              <h2 className="text-xl font-semibold">{activeTopic.title}</h2>
              <div className="prose prose-slate mt-4 max-w-none">
                <p className="text-slate-700 whitespace-pre-wrap">{activeTopic.content}</p>
                {activeTopic.notes && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h3 className="font-medium text-amber-800">Notes</h3>
                    <p className="text-amber-900 mt-1">{activeTopic.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {activeTopic.pdf_url && (
                  <a href={activeTopic.pdf_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm">📄 View PDF</a>
                )}
                {activeTopic.video_url && (
                  <a href={activeTopic.video_url} target="_blank" rel="noreferrer" className="btn-secondary text-sm">🎥 Watch Video</a>
                )}
                <button onClick={() => markComplete(activeTopic.id)} className="btn-primary text-sm">Mark as Completed</button>
              </div>
            </>
          ) : (
            <p className="text-slate-500">Select a topic to view content</p>
          )}
        </div>
      </div>
    </div>
  );
}

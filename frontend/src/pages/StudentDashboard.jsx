import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Braces, Terminal, BrainCircuit, FolderGit2, Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const subjects = [
    { id: 'dsa', name: 'Data Structures & Algorithms', icon: Code2, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', text: 'text-blue-600', path: '/subjects/dsa', progress: 45 },
    { id: 'csharp', name: 'C# Interactive Lab', icon: Braces, color: 'from-purple-500 to-fuchsia-600', bg: 'bg-purple-50', text: 'text-purple-600', path: '/subjects/csharp', progress: 12 },
    { id: 'java', name: 'Advanced Java', icon: Terminal, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-600', path: '/subjects/java', progress: 88 },
    { id: 'ai-tutor', name: 'AI Tutor Sessions', icon: BrainCircuit, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50', text: 'text-emerald-600', path: '/ai-tutor', progress: 100 },
    { id: 'projects', name: 'My Projects', icon: FolderGit2, color: 'from-slate-600 to-slate-800', bg: 'bg-slate-100', text: 'text-slate-700', path: '/projects', progress: 30 },
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVars = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 backdrop-blur-md p-6 rounded-[24px] border border-white shadow-sm"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Good Morning, {user?.name?.split(' ')[0] || 'Student'}! ☀️</h1>
          <p className="text-slate-500 font-medium mt-1">Pick up where you left off or start a new module.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search subjects..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Grid */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-slate-800">Your Learning Paths</h2>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVars}
          initial="hidden"
          animate="visible"
        >
          {subjects.map((subject) => (
            <motion.div
              key={subject.id}
              variants={cardVars}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              onClick={() => navigate(subject.path)}
              className="card-glass group cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            >
              {/* Background gradient hint */}
              <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${subject.color} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${subject.bg} ${subject.text} flex items-center justify-center mb-6 shadow-sm group-hover:animate-brain-pulse`}>
                  <subject.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{subject.name}</h3>
              </div>

              <div className="relative z-10 mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progress</span>
                  <span className="text-xs font-bold text-slate-700">{subject.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full bg-gradient-to-r ${subject.color}`}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add New Module Card */}
          <motion.div
            variants={cardVars}
            whileHover={{ scale: 1.02 }}
            className="card-glass border-dashed border-2 border-slate-300 bg-transparent hover:bg-slate-50/50 cursor-pointer flex flex-col items-center justify-center min-h-[220px] text-slate-400 hover:text-blue-500 transition-colors"
          >
            <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-4">
              <span className="text-2xl">+</span>
            </div>
            <p className="font-semibold">Explore New Subject</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

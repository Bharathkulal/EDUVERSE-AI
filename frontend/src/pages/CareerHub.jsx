import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Award, FileText, CheckCircle2, ChevronRight, Play, RotateCcw, 
  User, Mail, Phone, BookOpen, Star, AlertCircle, Shield, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';

const HASH_TO_TAB = {
  '#resume': 'resume',
  '#placement': 'placement',
  '#company': 'company',
  '#interview': 'interview',
  '#aptitude': 'aptitude',
  '#portfolio': 'portfolio',
  '#certifications': 'certifications',
};

export default function CareerHub() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('resume');
  
  // States for Resume builder
  const [resumeName, setResumeName] = useState('Bharath Kulal');
  const [resumeEmail, setResumeEmail] = useState('bharath@eduverse.ai');
  const [resumePhone, setResumePhone] = useState('+91 9876543210');
  const [resumeSkills, setResumeSkills] = useState('React, Node.js, Python, SQL, DSA');
  const [generatedResume, setGeneratedResume] = useState(null);

  // States for Placement prep Q&A
  const [prepMode, setPrepMode] = useState('lobby'); // lobby, study
  const [selectedPrepTopic, setSelectedPrepTopic] = useState('');
  const [prepIndex, setPrepIndex] = useState(0);

  // States for Company Qs
  const [companyMode, setCompanyMode] = useState('lobby'); // lobby, questions
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyAnswers, setCompanyAnswers] = useState({});
  const [companyScore, setCompanyScore] = useState(null);

  // States for Interview prep
  const [interviewMode, setInterviewMode] = useState('lobby'); // lobby, active, evaluation
  const [interviewType, setInterviewType] = useState('');
  const [interviewIdx, setInterviewIdx] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState({});

  // States for Aptitude
  const [aptitudeMode, setAptitudeMode] = useState('lobby'); // lobby, test, result
  const [selectedAptTopic, setSelectedAptTopic] = useState(null);
  const [aptIdx, setAptIdx] = useState(0);
  const [selectedAptAns, setSelectedAptAns] = useState('');
  const [aptAnswers, setAptAnswers] = useState({});
  const [aptScore, setAptScore] = useState(0);

  // States for Portfolio
  const [portfolioGenerated, setPortfolioGenerated] = useState(false);

  // States for Certifications
  const [certs, setCerts] = useState([
    { id: 1, name: 'Java Fundamentals', provider: 'EduVerse AI', progress: 85, icon: '☕', color: 'from-orange-500 to-red-500' },
    { id: 2, name: 'DSA Mastery', provider: 'EduVerse AI', progress: 60, icon: '🌳', color: 'from-green-500 to-emerald-500' },
    { id: 3, name: 'Python Developer', provider: 'EduVerse AI', progress: 40, icon: '🐍', color: 'from-blue-500 to-cyan-500' },
    { id: 4, name: 'Database Expert', provider: 'EduVerse AI', progress: 20, icon: '🗄️', color: 'from-yellow-500 to-amber-500' },
  ]);

  const companyQuestions = [
    { company: 'Google', role: 'SDE Intern', difficulty: 'Hard', questions: 45, icon: '🔍' },
    { company: 'Microsoft', role: 'SDE 1', difficulty: 'Medium', questions: 62, icon: '🪟' },
    { company: 'Amazon', role: 'SDE Intern', difficulty: 'Medium', questions: 78, icon: '📦' },
    { company: 'TCS', role: 'Developer', difficulty: 'Easy', questions: 120, icon: '💻' },
    { company: 'Infosys', role: 'SE', difficulty: 'Easy', questions: 95, icon: '🔷' },
    { company: 'Wipro', role: 'Developer', difficulty: 'Easy', questions: 88, icon: '🌐' },
  ];

  const aptitudeTopics = [
    { topic: 'Quantitative Aptitude', questions: 250, completed: 45, icon: '🔢' },
    { topic: 'Logical Reasoning', questions: 200, completed: 30, icon: '🧩' },
    { topic: 'Verbal Ability', questions: 180, completed: 20, icon: '📝' },
    { topic: 'Data Interpretation', questions: 120, completed: 10, icon: '📊' },
    { topic: 'Attention to Detail', questions: 150, completed: 25, icon: '🔍' },
    { topic: 'Spatial Ability', questions: 100, completed: 15, icon: '📐' },
  ];
  const [activeCertCertificate, setActiveCertCertificate] = useState(null);

  useEffect(() => {
    const hash = location.hash;
    if (hash && HASH_TO_TAB[hash]) {
      setActiveTab(HASH_TO_TAB[hash]);
    }
  }, [location.hash]);

  const tabs = [
    { id: 'resume', label: 'Resume Builder', icon: '📄' },
    { id: 'placement', label: 'Placement Prep', icon: '🎓' },
    { id: 'company', label: 'Company Qs', icon: '🏢' },
    { id: 'interview', label: 'Interview Prep', icon: '🎤' },
    { id: 'aptitude', label: 'Aptitude', icon: '🧮' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'certifications', label: 'Certifications', icon: '🏆' },
  ];

  // Mock Placement Prep Questions
  const prepQuestions = {
    'Technical Round Prep': [
      { q: 'What is a binary search tree?', a: 'A tree data structure where each node has at most two children, the left child has a key less than the parent, and the right child has a key greater than the parent. Searching, insertion, and deletion take O(log n) average time.' },
      { q: 'Explain polymorphic behavior.', a: 'Allowing subclasses to provide custom overriding implementations for parent functions. Method call resolution is dynamically resolved at runtime (dynamic dispatch / runtime polymorphism).' },
      { q: 'What is the difference between a process and a thread?', a: 'A process is an independent execution unit with its own memory space allocated by the OS. A thread is a lightweight subset of a process that shares memory and resources with other threads in the same process.' },
      { q: 'Explain the concept of time complexity and Big O notation.', a: 'Big O notation describes the upper bound of the execution time or space requirements of an algorithm in the worst-case scenario relative to the input size (n).' },
      { q: 'What is the difference between a Stack and a Queue?', a: 'A Stack follows the Last-In-First-Out (LIFO) model where elements are added and removed from the same end. A Queue follows First-In-First-Out (FIFO) where elements are added at the rear and removed from the front.' }
    ],
    'HR Round Prep': [
      { q: 'Why do you want to join us?', a: 'Highlight alignment with the target company\'s mission, culture, engineering scale, and active learning environments. Connect their specific business goals to your skillset.' },
      { q: 'Describe a conflict resolution scenario.', a: 'Use the STAR method: describe a healthy debate/conflict, show how you focused on communication and objective data metrics, compromised, and drove the team to a successful outcome.' },
      { q: 'What is your greatest strength and weakness?', a: 'For strength, highlight a transferable technical or collaborative skill. For weakness, name a real weakness you have recognized and show the specific steps you are taking to improve it.' },
      { q: 'Tell me about a time you failed and how you handled it.', a: 'Describe a minor professional setback, take full responsibility, explain what you learned from it, and show how you applied that lesson to succeed in a subsequent project.' },
      { q: 'Where do you see yourself in five years?', a: 'Express a desire to grow into a senior technical or leadership role, mastering the domain, and contributing to high-impact projects at the organization.' }
    ],
    'System Design Prep': [
      { q: 'How does a Content Delivery Network (CDN) work?', a: 'A CDN is a geographically distributed network of proxy servers that cache content close to end users. It reduces latency, minimizes bandwidth costs, and improves page load times.' },
      { q: 'Explain horizontal vs. vertical scaling.', a: 'Vertical scaling (scaling up) means adding more power (CPU, RAM) to an existing machine. Horizontal scaling (scaling out) means adding more machines/nodes to the pool to distribute the load.' },
      { q: 'What is database partitioning/sharding?', a: 'A database design pattern where a single dataset is split into smaller, independent parts (shards) across multiple databases/servers to improve write performance and read throughput.' },
      { q: 'Explain the CAP Theorem.', a: 'A distributed system can guarantee at most two out of three characteristics: Consistency (all nodes see same data), Availability (every request receives a response), and Partition Tolerance (system operates despite message losses).' },
      { q: 'How would you design a rate limiter?', a: 'Use algorithms like Token Bucket, Leaky Bucket, or Sliding Window Log. Track request counts per user/IP in a fast memory cache like Redis to reject requests exceeding the limit.' }
    ],
    'DBMS & SQL Prep': [
      { q: 'What is the difference between INNER JOIN and LEFT JOIN?', a: 'INNER JOIN returns records that have matching values in both tables. LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and the matched records from the right table (filling with NULL if no match).' },
      { q: 'Explain Database Normalization and its forms.', a: 'Normalization is organizing database fields/tables to minimize redundancy and dependency. 1NF removes duplicate columns; 2NF ensures all non-key columns depend on the primary key; 3NF removes transitive functional dependencies.' },
      { q: 'What are ACID properties in a database?', a: 'ACID guarantees database transactions are processed reliably: Atomicity (all or nothing), Consistency (preserves database rules), Isolation (independent concurrent execution), and Durability (saved permanently).' },
      { q: 'What is an index and how does it speed up queries?', a: 'An index is a database structure (typically a B-Tree) that enables fast lookup of rows. It speeds up SELECT queries but incurs overhead on INSERT, UPDATE, and DELETE operations.' },
      { q: 'Explain the difference between SQL and NoSQL.', a: 'SQL databases are relational, structured (schemas), table-based, and scale vertically (great for ACID). NoSQL databases are non-relational, distributed, schema-less, document/key-value/graph-based, and scale horizontally.' }
    ],
    'OS & Networks Prep': [
      { q: 'What happens when you type a URL into a browser?', a: 'Browser parses URL -> DNS lookup to find IP -> Establishes TCP connection (three-way handshake) -> Sends HTTP/S request -> Server processes and returns response -> Browser renders HTML, CSS, JS.' },
      { q: 'Explain the difference between TCP and UDP protocols.', a: 'TCP is connection-oriented, reliable, guarantees packet ordering, and features congestion control (slower). UDP is connectionless, unreliable, sends packets without confirmation (faster, great for streaming/gaming).' },
      { q: 'What is virtual memory and how does it work?', a: 'An OS memory management technique that uses hardware and software to map virtual addresses used by an application into physical addresses. It allows using disk space as secondary RAM (swap).' },
      { q: 'Explain the concept of a Deadlock and its prevention.', a: 'A state where two or more processes are unable to proceed because each is waiting for the other to release a resource. Prevent by breaking Mutual Exclusion, Hold & Wait, No Preemption, or Circular Wait.' },
      { q: 'What is paging in operating systems?', a: 'A memory management scheme that eliminates the need for contiguous allocation of physical memory. The OS divides virtual memory into pages and physical memory into frames of equal size.' }
    ]
  };

  // Mock Company Questions
  const companyData = {
    'Google': [
      { id: 'g1', q: 'Find the longest substring without repeating characters.', ans: 'Sliding window approach' },
      { id: 'g2', q: 'Design an autocomplete search engine suggestion service.', ans: 'Trie data structure structure' }
    ],
    'Microsoft': [
      { id: 'm1', q: 'Reverse a linked list in pairs of k.', ans: 'Recursion or stack pointers' },
      { id: 'm2', q: 'Explain deadlock conditions.', ans: 'Mutual exclusion, hold and wait, no preemption, circular wait' }
    ]
  };

  // Mock Aptitude Questions
  const aptitudeData = {
    'Quantitative Aptitude': [
      { q: 'A train 100m long passes a platform 200m long in 30 seconds. What is its speed?', opts: ['10 m/s', '15 m/s', '20 m/s', '25 m/s'], ans: 0 },
      { q: 'If 3 pumps work 8 hours a day to empty a tank in 2 days, how many hours a day must 4 pumps work to empty it in 1 day?', opts: ['8 hours', '12 hours', '10 hours', '6 hours'], ans: 1 },
      { q: 'A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. What is the sum?', opts: ['Rs. 650', 'Rs. 690', 'Rs. 698', 'Rs. 700'], ans: 2 },
      { q: 'Two numbers are in the ratio 3:5. If 9 is subtracted from each, the new numbers are in the ratio 12:23. The smaller number is:', opts: ['27', '33', '49', '55'], ans: 0 }
    ],
    'Logical Reasoning': [
      { q: 'Point to a photograph, a man says "I have no brother or sister but that man\'s father is my father\'s son." Whose photograph is it?', opts: ['His own', 'His son\'s', 'His father\'s', 'His nephew\'s'], ans: 1 },
      { q: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?', opts: ['1/3', '1/8', '2/8', '1/16'], ans: 1 },
      { q: 'SCD, TEF, UGH, ____, WKL. What letters should fill in the blank?', opts: ['VIJ', 'VJH', 'IJT', 'UJI'], ans: 0 },
      { q: 'If A + B means A is the brother of B; A - B means A is the sister of B and A x B means A is the father of B. Which of the following means that C is the son of M?', opts: ['M - N x C', 'F - C + M', 'M x N - C', 'M x C - F'], ans: 3 }
    ],
    'Verbal Ability': [
      { q: 'Find the synonym of: ADVERSITY', opts: ['Crisis', 'Misfortune', 'Failure', 'Helplessness'], ans: 1 },
      { q: 'Select the word that is opposite in meaning (antonym) to: ENORMOUS', opts: ['Soft', 'Average', 'Tiny', 'Weak'], ans: 2 },
      { q: 'Choose the correct spelling:', opts: ['Receive', 'Recieve', 'Receve', 'Reiceve'], ans: 0 },
      { q: 'Identify the grammatical error: "He is one of those men who is never satisfied."', opts: ['He is', 'one of those', 'men who is', 'never satisfied'], ans: 2 }
    ],
    'Data Interpretation': [
      { q: 'If the total sales of a company in 2025 were $5 million and increased by 20% in 2026, what were the sales in 2026?', opts: ['$5.5 million', '$6.0 million', '$6.2 million', '$6.5 million'], ans: 1 },
      { q: 'In a pie chart representing student grades, 25% of students got an A. What is the central angle for the sector representing Grade A?', opts: ['45 degrees', '90 degrees', '120 degrees', '180 degrees'], ans: 1 },
      { q: 'A bar graph shows sales of Cars: Year 1 = 150, Year 2 = 180, Year 3 = 210. What is the average sales across the three years?', opts: ['160', '180', '190', '200'], ans: 1 }
    ],
    'Attention to Detail': [
      { q: 'Which of the following pairs is NOT an exact match?', opts: ['849302-A / 849302-A', 'Microsoft Corp. / Microsoft Corp.', 'O\'Connor, John / O\'Conner, John', '9812-321-X / 9812-321-X'], ans: 2 },
      { q: 'How many times does the letter \'e\' appear in the word \'representation\'?', opts: ['1', '2', '3', '4'], ans: 1 },
      { q: 'Compare 479201948 and 479201948. Are they identical?', opts: ['Yes', 'No', 'Cannot be determined', 'They are partially identical'], ans: 0 }
    ],
    'Spatial Ability': [
      { q: 'If you fold a piece of paper in half and punch a hole in the center, how many holes will there be when you unfold it?', opts: ['1', '2', '3', '4'], ans: 1 },
      { q: 'A cube has its faces numbered 1 through 6. If the numbers 1 and 6 are on opposite faces, and 2 and 5 are on opposite faces, which number is opposite to 3?', opts: ['4', '5', '6', '1'], ans: 0 },
      { q: 'If a clock shows 3:00, what is the angle between the hour and minute hand?', opts: ['45 degrees', '60 degrees', '90 degrees', '120 degrees'], ans: 2 }
    ]
  };

  // ───── Resume Builder ─────
  const handleBuildResume = (templateType) => {
    setGeneratedResume({
      template: templateType,
      name: resumeName,
      email: resumeEmail,
      phone: resumePhone,
      skills: resumeSkills
    });
    toast.success(`${templateType} Resume built successfully!`);
  };

  // ───── Certifications Tracker ─────
  const handleProgressCert = (certId) => {
    setCerts(prev => prev.map(c => {
      if (c.id === certId) {
        const nextProg = Math.min(c.progress + 10, 100);
        if (nextProg === 100) {
          toast.success(`🎉 Congratulations! Earning certificate for ${c.name}!`);
        } else {
          toast.success(`Progressed ${c.name} by 10%`);
        }
        return { ...c, progress: nextProg };
      }
      return c;
    }));
  };

  return (
    <div className="space-y-6 pb-8 quiz-arena-container h-full overflow-y-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 border border-[rgba(245,158,11,0.2)] bg-gradient-to-br from-[#1a1005] via-[#2a1a0b] to-[#0f0b05]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
        <h1 className="text-3xl font-extrabold text-white">🔥 Career Hub</h1>
        <p className="text-amber-200/70 text-sm mt-1">Prepare for placements, build your portfolio, earn certifications</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-full max-w-full overflow-x-auto scrollbar-none" style={{ backgroundColor: 'var(--db-input-bg)', border: '1px solid var(--db-sidebar-border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              // reset states when changing tabs
              setPrepMode('lobby');
              setCompanyMode('lobby');
              setInterviewMode('lobby');
              setAptitudeMode('lobby');
              setPortfolioGenerated(false);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === tab.id ? 'shadow-md' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--db-card-bg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--db-text-accent)' : 'var(--db-text-muted)',
              border: activeTab === tab.id ? '1px solid var(--db-sidebar-border)' : '1px solid transparent'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* RESUME BUILDER */}
        {activeTab === 'resume' && (
          <motion.div key="resume" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="p-6 rounded-3xl border bg-white border-slate-200 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800">Resume Details</h3>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold mb-1">Full Name</span>
                    <input type="text" value={resumeName} onChange={e => setResumeName(e.target.value)} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs text-slate-800" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold mb-1">Email ID</span>
                    <input type="email" value={resumeEmail} onChange={e => setResumeEmail(e.target.value)} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs text-slate-800" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold mb-1">Phone Number</span>
                    <input type="text" value={resumePhone} onChange={e => setResumePhone(e.target.value)} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs text-slate-800" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold mb-1">Key Skills (comma separated)</span>
                    <input type="text" value={resumeSkills} onChange={e => setResumeSkills(e.target.value)} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs text-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  {['Professional', 'Creative', 'Minimal'].map(t => (
                    <button key={t} onClick={() => handleBuildResume(t)} className="py-2 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-xl cursor-pointer">
                      Use {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-6 rounded-3xl border bg-white border-slate-200 flex flex-col justify-between">
                {generatedResume ? (
                  <div className="space-y-4 font-sans text-slate-700">
                    <div className="border-b pb-3 text-center">
                      <h2 className="text-lg font-extrabold tracking-tight text-slate-900">{generatedResume.name}</h2>
                      <div className="text-[10px] text-slate-500 flex justify-center gap-4 mt-1">
                        <span>📧 {generatedResume.email}</span>
                        <span>📞 {generatedResume.phone}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-bold text-violet-600 tracking-wider block">Skills & Toolsets</span>
                      <p className="text-xs text-slate-600 mt-1">{generatedResume.skills}</p>
                    </div>

                    <div className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-violet-600 tracking-wider block">Eduverse Progress Verified</span>
                      <p className="text-[10px] text-slate-600 mt-1">Verified: Level 1 DSA mastery completed & MCQ sets solved.</p>
                    </div>

                    <button onClick={() => toast.success('Downloading PDF...')} className="w-full py-2 bg-slate-950 text-white text-xs font-bold rounded-xl">
                      Download PDF Document
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                    <p className="text-4xl">📄</p>
                    <p className="text-xs mt-2">Fill details and choose a template to preview resume draft.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PLACEMENT PREP */}
        {activeTab === 'placement' && (
          <motion.div key="placement" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {prepMode === 'lobby' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Technical Round Prep', desc: 'DSA, OOP, and data structures', icon: '💻', color: 'from-violet-500 to-purple-600' },
                  { title: 'HR Round Prep', desc: 'Behavioral, situational, and STAR framework', icon: '🎤', color: 'from-blue-500 to-cyan-600' },
                  { title: 'System Design Prep', desc: 'CDNs, scalability, caching, sharding', icon: '🏗️', color: 'from-amber-500 to-orange-600' },
                  { title: 'DBMS & SQL Prep', desc: 'ACID, JOINs, indexing, normalization', icon: '🗄️', color: 'from-emerald-500 to-green-600' },
                  { title: 'OS & Networks Prep', desc: 'HTTP lifecycle, TCP/UDP, deadlock, paging', icon: '🌐', color: 'from-pink-500 to-rose-600' },
                ].map((item, i) => {
                  const qCount = prepQuestions[item.title]?.length || 0;
                  return (
                    <div 
                      key={i} 
                      onClick={() => { setSelectedPrepTopic(item.title); setPrepIndex(0); setPrepMode('study'); }}
                      className="p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group flex gap-4 bg-white border-slate-200"
                    >
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl text-white shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
                        <p className="text-xs mb-1 text-slate-400 leading-snug">{item.desc}</p>
                        <span className="text-[10px] font-bold text-violet-600">{qCount} Questions Loaded</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {prepMode === 'study' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 space-y-4 max-w-xl mx-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xs font-black text-slate-800">{selectedPrepTopic}</h3>
                  <button onClick={() => setPrepMode('lobby')} className="text-xs text-slate-400 hover:underline">Back</button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border rounded-2xl">
                    <span className="text-[10px] font-bold text-violet-600 uppercase">Question {prepIndex + 1}:</span>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{prepQuestions[selectedPrepTopic][prepIndex].q}</p>
                  </div>

                  <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
                    <span className="text-[10px] font-bold text-violet-600 uppercase">Recommended Answer Framework:</span>
                    <p className="text-xs text-slate-700 mt-1">{prepQuestions[selectedPrepTopic][prepIndex].a}</p>
                  </div>
                </div>

                <div className="flex justify-between mt-4">
                  <button 
                    disabled={prepIndex === 0} 
                    onClick={() => setPrepIndex(prev => prev - 1)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={prepIndex === prepQuestions[selectedPrepTopic].length - 1} 
                    onClick={() => setPrepIndex(prev => prev + 1)}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* COMPANY QUESTIONS */}
        {activeTab === 'company' && (
          <motion.div key="company" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {companyMode === 'lobby' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyQuestions.map((cq, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (companyData[cq.company]) {
                        setSelectedCompany(cq.company);
                        setCompanyAnswers({});
                        setCompanyScore(null);
                        setCompanyMode('questions');
                      } else {
                        toast.error(`Company questions database for ${cq.company} is unlocking soon.`);
                      }
                    }}
                    className="p-5 rounded-2xl border hover:shadow-lg transition-all cursor-pointer group bg-white border-slate-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl group-hover:scale-110 transition-transform">{cq.icon}</div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-600">{cq.difficulty}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{cq.company}</h3>
                    <p className="text-xs text-slate-400">{cq.role}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs font-bold text-violet-600">{cq.company === 'Google' || cq.company === 'Microsoft' ? '2 Loaded' : 'Unlocking soon'}</span>
                      <span className="text-xs font-semibold text-slate-500">Start →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {companyMode === 'questions' && selectedCompany && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-xs font-black text-slate-800">{selectedCompany} Assessment</h3>
                  <button onClick={() => setCompanyMode('lobby')} className="text-xs text-slate-400 hover:underline">Back</button>
                </div>

                {companyData[selectedCompany].map((qItem, idx) => (
                  <div key={qItem.id} className="space-y-2 p-4 bg-slate-50 border rounded-2xl">
                    <p className="text-xs font-bold text-slate-800">Q{idx + 1}: {qItem.q}</p>
                    <input 
                      type="text"
                      placeholder="Write your approach description..."
                      value={companyAnswers[qItem.id] || ''}
                      onChange={e => setCompanyAnswers({...companyAnswers, [qItem.id]: e.target.value})}
                      className="w-full bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                ))}

                <button 
                  onClick={() => {
                    setCompanyScore(90);
                    toast.success('Approach submitted successfully!');
                  }}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl"
                >
                  Submit Solutions
                </button>

                {companyScore && (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-slate-700">
                    <strong className="text-emerald-600 block">Assessment Evaluated</strong>
                    Excellent. Your solution architecture approach fits Google standards. Code reviews match expected metrics.
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* INTERVIEW PREP */}
        {activeTab === 'interview' && (
          <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {interviewMode === 'lobby' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200">
                <h2 className="text-sm font-extrabold text-slate-800 mb-2">🎤 AI Mock Interview</h2>
                <p className="text-xs text-slate-500 mb-6">Select a track to launch customized placement interviewing checks.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Technical Interview', 'Behavioral Interview', 'System Design'].map((type, i) => (
                    <div key={i} className="p-4 rounded-2xl border text-center hover:shadow-lg transition-all bg-slate-50 border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="text-3xl mb-3">{['💻', '🎙️', '🏗️'][i]}</div>
                        <h4 className="text-sm font-bold text-slate-800 mb-2">{type}</h4>
                        <p className="text-[10px] text-slate-400 mb-4">{['Data structures, algorithms, OOP', 'Teamwork, leadership, situational', 'Architecture & scalability'][i]}</p>
                      </div>
                      <button 
                        onClick={() => { setInterviewType(type); setInterviewIdx(0); setInterviewAnswers({}); setInterviewMode('active'); }}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer w-full"
                      >
                        Start Interview
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interviewMode === 'active' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{interviewType} Simulator</span>
                  <button onClick={() => setInterviewMode('lobby')} className="text-xs text-slate-400 hover:underline">Exit</button>
                </div>

                <p className="text-xs font-extrabold text-slate-800">
                  {interviewIdx === 0 
                    ? 'Question 1: Explain the difference between thread safe operations and default asynchronous execution.'
                    : 'Question 2: How do you verify and optimize index queries inside database tables?'}
                </p>

                <textarea 
                  value={interviewAnswers[interviewIdx] || ''}
                  onChange={e => setInterviewAnswers({...interviewAnswers, [interviewIdx]: e.target.value})}
                  placeholder="Type your response here..."
                  className="w-full h-24 p-3 bg-slate-50 border rounded-xl text-xs focus:outline-none"
                />

                <div className="flex justify-between">
                  <button 
                    disabled={interviewIdx === 0}
                    onClick={() => setInterviewIdx(0)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {interviewIdx === 0 ? (
                    <button 
                      onClick={() => setInterviewIdx(1)}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl"
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      onClick={() => setInterviewMode('evaluation')}
                      className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black rounded-xl"
                    >
                      Submit Mock Test
                    </button>
                  )}
                </div>
              </div>
            )}

            {interviewMode === 'evaluation' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto text-center space-y-4">
                <Trophy size={40} className="text-amber-500 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-800">Mock Interview Evaluated!</h3>
                <p className="text-xs text-slate-500">Your mock performance score: <strong>82/100</strong></p>
                <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed text-left">
                  <strong>Tutor Review:</strong> Strong conceptual explanation. Could optimize by giving concrete concurrency class names in Java.
                </div>
                <button onClick={() => setInterviewMode('lobby')} className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl">
                  Try Another Category
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* APTITUDE */}
        {activeTab === 'aptitude' && (
          <motion.div key="aptitude" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {aptitudeMode === 'lobby' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aptitudeTopics.map((topic, i) => (
                  <div key={i} className="p-5 rounded-2xl border hover:shadow-lg transition-all bg-white border-slate-200 flex flex-col justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div>
                        <h3 className="text-base font-bold text-slate-800">{topic.topic}</h3>
                        <p className="text-xs text-slate-400">{topic.completed}/{topic.questions} completed</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${(topic.completed / topic.questions) * 100}%` }} />
                    </div>
                    <button 
                      onClick={() => {
                        if (aptitudeData[topic.topic]) {
                          setSelectedAptTopic(topic.topic);
                          setAptIdx(0);
                          setSelectedAptAns('');
                          setAptAnswers({});
                          setAptScore(0);
                          setAptitudeMode('test');
                        } else {
                          toast.error(`${topic.topic} is unlocking soon.`);
                        }
                      }}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Continue Practice
                    </button>
                  </div>
                ))}
              </div>
            )}

            {aptitudeMode === 'test' && selectedAptTopic && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">{selectedAptTopic}</span>
                  <button onClick={() => setAptitudeMode('lobby')} className="text-xs text-slate-400 hover:underline">Exit</button>
                </div>

                <p className="text-xs font-extrabold text-slate-800">
                  {aptitudeData[selectedAptTopic][aptIdx].q}
                </p>

                <div className="space-y-2">
                  {aptitudeData[selectedAptTopic][aptIdx].opts.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => setSelectedAptAns(i)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedAptAns === i ? 'bg-violet-600 border-violet-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    const isCorrect = selectedAptAns === aptitudeData[selectedAptTopic][aptIdx].ans;
                    if (isCorrect) setAptScore(prev => prev + 1);
                    
                    if (aptIdx < aptitudeData[selectedAptTopic].length - 1) {
                      setAptIdx(prev => prev + 1);
                      setSelectedAptAns('');
                    } else {
                      setAptitudeMode('result');
                    }
                  }}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl"
                >
                  Submit & Continue
                </button>
              </div>
            )}

            {aptitudeMode === 'result' && (
              <div className="p-6 rounded-3xl border bg-white border-slate-200 max-w-xl mx-auto text-center space-y-4">
                <Trophy size={40} className="text-amber-500 mx-auto" />
                <h3 className="text-sm font-extrabold text-slate-800">Aptitude Practice Completed!</h3>
                <p className="text-xs text-slate-500">Your score: <strong>{aptScore} / {aptitudeData[selectedAptTopic].length}</strong></p>
                <button onClick={() => setAptitudeMode('lobby')} className="px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-xl">
                  Back to Topics
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="p-6 rounded-3xl border bg-white border-slate-200">
              <h2 className="text-sm font-extrabold text-slate-800 mb-2">💼 Portfolio Builder</h2>
              <p className="text-xs text-slate-500 mb-6">Create a stunning developer portfolio from your EduVerse learning data.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Topics Mastered', value: '24', icon: '📚' },
                  { label: 'Projects Built', value: '3', icon: '🚀' },
                  { label: 'Certifications', value: '2', icon: '🏆' },
                  { label: 'Coding Problems', value: '89', icon: '💻' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-2xl border text-center bg-slate-50 border-slate-200" >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-slate-800">{stat.value}</div>
                    <div className="text-[10px] font-semibold text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {!portfolioGenerated ? (
                <button 
                  onClick={() => { setPortfolioGenerated(true); toast.success('Personal Portfolio generated!'); }}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-lg"
                >
                  Generate Portfolio →
                </button>
              ) : (
                <div className="mt-6 p-5 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl text-center space-y-3">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Your Developer Portfolio is Live!</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Link: eduverse.ai/portfolio/bharath-kulal</p>
                  </div>
                  <button onClick={() => setPortfolioGenerated(false)} className="text-[10px] text-violet-600 font-extrabold hover:underline">
                    Reset Portfolio State
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <motion.div key="certifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {certs.map((cert, i) => (
                <div key={i} className="p-5 rounded-2xl border hover:shadow-lg transition-all flex flex-col justify-between gap-3 bg-white border-slate-200" >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cert.color} flex items-center justify-center text-xl text-white shadow-md`}>
                      {cert.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 leading-tight">{cert.name}</h3>
                      <p className="text-[10px] text-slate-400">{cert.provider}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Progress</span>
                      <span>{cert.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${cert.color} rounded-full transition-all`} style={{ width: `${cert.progress}%` }} />
                    </div>
                  </div>

                  {cert.progress >= 100 ? (
                    <button 
                      onClick={() => setActiveCertCertificate(cert)}
                      className="w-full py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      🎉 View Certificate
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleProgressCert(cert.id)}
                      className="w-full py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 cursor-pointer"
                    >
                      Continue Learning
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Certificate overlay modal */}
            {activeCertCertificate && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-8 text-center space-y-6 shadow-2xl relative">
                  <button 
                    onClick={() => setActiveCertCertificate(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    Close
                  </button>

                  <Award size={64} className="text-amber-500 mx-auto" />
                  
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-violet-600 tracking-wider">EDUVERSE ACADEMY CERTIFICATE OF PROGRESS</span>
                    <h2 className="text-xl font-black text-slate-800">{activeCertCertificate.name}</h2>
                    <p className="text-xs text-slate-500">This certifies that <strong>{resumeName}</strong> has successfully completed the curriculum requirements.</p>
                  </div>

                  <div className="border-t border-b py-3 text-[10px] text-slate-400 flex justify-between">
                    <span>DATE: {new Date().toLocaleDateString()}</span>
                    <span>VERIFICATION ID: EDV-{activeCertCertificate.id}93A</span>
                  </div>

                  <button 
                    onClick={() => { toast.success('Certificate PDF download started!'); setActiveCertCertificate(null); }}
                    className="w-full py-2 bg-violet-600 text-white text-xs font-bold rounded-xl"
                  >
                    Download Certificate Document
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

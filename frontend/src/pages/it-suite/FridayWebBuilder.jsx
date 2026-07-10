import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Layers, Grid, Undo2, Redo2, Save, Download, Globe, 
  Smartphone, Tablet, Laptop, Monitor, LayoutTemplate, MessageSquare, 
  Settings2, Plus, Trash2, ArrowLeft, Code, Play, CheckCircle, 
  AlertCircle, ChevronRight, Eye, RefreshCw, Copy, AlignLeft, 
  Maximize2, RotateCw, Image as ImageIcon, Send, Volume2, Mic, Search,
  Terminal as TermIcon, FileText, Database, Shield, Activity, Share2,
  FolderOpen, Sliders, Cpu, History, PlayCircle, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Fonts
const FONTS = [
  { name: 'Inter', class: 'font-sans' },
  { name: 'Outfit', class: 'font-outfit' },
  { name: 'Space Grotesk', class: 'font-space' },
  { name: 'Syne', class: 'font-syne' }
];

const PRESETS = {
  SaaS: {
    hero: { title: "Next-Gen Intelligent AI Platform", desc: "Supercharge your team workflows with enterprise-grade automated agentic reasoning engines." },
    about: { title: "Automating Complex Systems", desc: "We deploy autonomous models that orchestrate microservices and eliminate manual processes." },
    pricing: [
      { name: "Starter", price: "$29", features: ["1 Team Seat", "10k Monthly Runs", "Standard Support"] },
      { name: "Pro", price: "$99", features: ["10 Team Seats", "Unlimited Runs", "Priority Support"] }
    ]
  },
  Agency: {
    hero: { title: "We Design Premium Brand Experiences", desc: "Award-winning creative developers specializing in ultra-fast next-gen platforms." },
    about: { title: "Strategy Meets Digital Excellence", desc: "We bridge the gap between creative concepts and high-performance technical engineering." },
    pricing: [
      { name: "Standard Project", price: "$4,900", features: ["Custom Brand Strategy", "Premium UI/UX", "3 Months Support"] },
      { name: "Retainer Growth", price: "$2,500/mo", features: ["Continuous Design", "Weekly Code Updates", "Dedicated Specialist"] }
    ]
  },
  Cyberpunk: {
    hero: { title: "NEURAL HACKING INTERFACE", desc: "Override the network grid. Download unauthorized firmware fragments directly to your implant." },
    about: { title: "GRID OPERATORS", desc: "Anonymous nodes tunneling end-to-end data encryption across decentralized server hives." },
    pricing: [
      { name: "Netrunner", price: "400 Cr", features: ["Basic Decryption Deck", "Proxy Anonymizer", "Darknet Forums Access"] },
      { name: "Cyber-Mercenary", price: "1200 Cr", features: ["Quantum Overclocking", "Hardware Interface Hook", "24/7 Grid Support"] }
    ]
  }
};

// Simulated Multi-File Explorer state
const INITIAL_FILES = [
  { path: 'app/page.tsx', lang: 'typescript', label: 'page.tsx' },
  { path: 'app/globals.css', lang: 'css', label: 'globals.css' },
  { path: 'tailwind.config.ts', lang: 'typescript', label: 'tailwind.config.ts' },
  { path: 'package.json', lang: 'json', label: 'package.json' }
];

export default function FridayWebBuilder() {
  const navigate = useNavigate();

  // Project state
  const [projectState, setProjectState] = useState(() => {
    const saved = localStorage.getItem('friday_builder_project');
    return saved ? JSON.parse(saved) : {
      businessName: 'EduVerse Launch',
      category: 'SaaS',
      description: 'An AI-powered learning hub for modern students.',
      theme: 'glass', 
      primaryColor: '#8B5CF6',
      accentColor: '#06B6D4',
      fontFamily: 'Outfit',
      targetAudience: 'Students & Developers',
      language: 'English',
      pages: ['Home', 'About', 'Pricing', 'FAQ', 'Contact'],
      activePage: 'Home',
      components: [
        { id: 'sec-1', type: 'navbar', content: { logo: 'Friday AI', links: ['Home', 'About', 'Pricing', 'Contact'] }, style: { padding: '16px', bg: 'rgba(15, 12, 30, 0.4)' } },
        { id: 'sec-2', type: 'hero', content: { title: 'Elevate Your Digital Experience', desc: 'Instantly build premium high-fidelity web layouts using agentic code rendering generators.' }, style: { padding: '80px 24px', textAlign: 'center' } },
        { id: 'sec-3', type: 'features', content: { items: ['AI-Driven Architecture', 'Glassmorphism Style Sheets', 'Monaco Code Compilers'] }, style: { padding: '48px 24px' } },
        { id: 'sec-4', type: 'pricing', content: { packages: [{ name: 'Starter Pack', price: '$19' }, { name: 'Pro Account', price: '$49' }] }, style: { padding: '48px 24px' } },
        { id: 'sec-5', type: 'footer', content: { copyright: '© 2026 EduVerse Friday Builder. All rights reserved.' }, style: { padding: '24px', bg: 'rgba(8, 6, 16, 0.9)' } }
      ]
    };
  });

  // Wizard Generation View
  const [isWizardActive, setIsWizardActive] = useState(true);
  const [wizardName, setWizardName] = useState('Nebula Web');
  const [wizardCat, setWizardCat] = useState('SaaS');
  const [wizardDesc, setWizardDesc] = useState('An intelligent website template platform.');
  const [wizardTheme, setWizardTheme] = useState('glass');
  const [wizardPrimary, setWizardPrimary] = useState('#8B5CF6');

  // Left sidebar & Workspace parameters
  const [activeLeftTab, setActiveLeftTab] = useState('explorer'); // 'explorer', 'chat', 'components', 'assets', 'templates', 'deployments'
  const [activeRightTab, setActiveRightTab] = useState('browser'); // 'browser', 'console', 'network', 'performance'
  const [activeBottomTab, setActiveBottomTab] = useState('terminal'); // 'terminal', 'build', 'ai_actions', 'git'
  
  const [viewportMode, setViewportMode] = useState('desktop'); 
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Multi-File selection state
  const [selectedFilePath, setSelectedFilePath] = useState('app/page.tsx');
  const [editedCode, setEditedCode] = useState('');

  // AI chat parameters
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Friday Web System online. Choose an AI Model (OpenAI, Claude, Gemini, DeepSeek, Groq) and ask me to generate pages, mock schemas, or style templates.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [activeAiModel, setActiveAiModel] = useState('gpt-4o'); 
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [aiTokenLimit, setAiTokenLimit] = useState(4096);

  // Settings states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  // Deployment Logs Console State
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployTarget, setDeployTarget] = useState('Vercel'); 
  const [deployLogs, setDeployLogs] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');

  // History State for Undo/Redo
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Asset Generator States
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [generatedImages, setGeneratedImages] = useState([
    '/theory_bg.png',
    '/practical_bg.png',
    '/glowing_ai_hand.png'
  ]);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Autosave execution every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem('friday_builder_project', JSON.stringify(projectState));
      toast.success('Project autosaved!', { id: 'autosave-toast', duration: 1000 });
    }, 10000);
    return () => clearInterval(timer);
  }, [projectState]);

  // Keep code synced with visual components
  useEffect(() => {
    updateGeneratedCodeView();
  }, [projectState, selectedFilePath]);

  // Generate code based on design components tree and selected file
  const updateGeneratedCodeView = () => {
    let codeStr = '';
    if (selectedFilePath === 'app/page.tsx') {
      codeStr = `import React from 'react';
import { motion } from 'framer-motion';

export default function GeneratedWebsite() {
  return (
    <div className="min-h-screen ${projectState.theme === 'glass' ? 'bg-[#0a051d] text-white' : 'bg-slate-900 text-slate-100'} font-[${projectState.fontFamily}]">
      
      {/* 1. Navigation Header */}
      <nav className="flex justify-between items-center p-4 backdrop-blur-md border-b border-white/5" style={{ background: '${projectState.components[0]?.style?.bg || 'rgba(15, 12, 30, 0.4)'}' }}>
        <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">${projectState.businessName}</div>
        <div className="flex gap-6 text-sm font-medium text-slate-300">
          ${projectState.pages.map(p => `<a href="#${p.toLowerCase()}" className="hover:text-cyan-400 transition">${p}</a>`).join('\n          ')}
        </div>
      </nav>

      {/* 2. Hero Component */}
      <section className="py-24 text-center px-6 max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent"
        >
          ${projectState.components[1]?.content?.title || 'Launch Your AI Platform'}
        </motion.h1>
        <p className="mt-4 text-slate-400 text-base max-w-2xl mx-auto">
          ${projectState.components[1]?.content?.desc || ''}
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <button className="px-6 py-3 bg-[${projectState.primaryColor}] hover:opacity-90 rounded-xl font-bold transition">Get Started Free</button>
          <button className="px-6 py-3 border border-white/10 hover:bg-white/5 rounded-xl font-bold transition">Book a Demo</button>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
        ${(projectState.components[2]?.content?.items || []).map((item, idx) => `
        <div className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
          <div className="text-cyan-400 font-bold mb-2">0${idx+1}. Feature</div>
          <h3 className="text-lg font-black">${item}</h3>
          <p className="text-slate-400 text-xs mt-2">Fully configured and integrated natively with modern web structures.</p>
        </div>`).join('\n        ')}
      </section>

    </div>
  );
}`;
    } else if (selectedFilePath === 'app/globals.css') {
      codeStr = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-accent: ${projectState.primaryColor};
  --secondary-accent: ${projectState.accentColor};
}

body {
  background-color: #03010b;
  color: #ffffff;
  font-family: '${projectState.fontFamily}', sans-serif;
}`;
    } else if (selectedFilePath === 'tailwind.config.ts') {
      codeStr = `import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${projectState.primaryColor}',
        accent: '${projectState.accentColor}',
      },
    },
  },
  plugins: [],
};
export default config;`;
    } else {
      codeStr = `{
  "name": "friday-generated-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next": "14.2.3",
    "framer-motion": "^11.2.6",
    "lucide-react": "^0.379.0"
  }
}`;
    }
    setEditedCode(codeStr);
  };

  // Push state to Undo stack
  const saveStateForUndo = (newState) => {
    const nextStack = historyStack.slice(0, historyIndex + 1);
    setHistoryStack([...nextStack, JSON.stringify(projectState)]);
    setHistoryIndex(nextStack.length);
  };

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const prev = historyStack[historyIndex];
      setHistoryIndex(historyIndex - 1);
      setProjectState(JSON.parse(prev));
      toast.success('Undo action applied');
    } else {
      toast.error('No undo history remaining');
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextState = historyStack[nextIdx];
      setHistoryIndex(nextIdx);
      setProjectState(JSON.parse(nextState));
      toast.success('Redo action applied');
    } else {
      toast.error('No redo history remaining');
    }
  };

  // Setup Wizard Submission - Generate Website dynamically
  const handleWizardGenerate = (e) => {
    e.preventDefault();
    const preset = PRESETS[wizardCat] || PRESETS.SaaS;
    
    const generatedComponents = [
      { id: 'sec-1', type: 'navbar', content: { logo: wizardName, links: ['Home', 'About', 'Pricing', 'Contact'] }, style: { padding: '18px', bg: 'rgba(10, 8, 22, 0.7)' } },
      { id: 'sec-2', type: 'hero', content: { title: preset.hero.title, desc: preset.hero.desc }, style: { padding: '100px 24px', textAlign: 'center' } },
      { id: 'sec-3', type: 'about', content: { title: preset.about.title, desc: preset.about.desc }, style: { padding: '60px 24px' } },
      { id: 'sec-4', type: 'pricing', content: { packages: preset.pricing }, style: { padding: '60px 24px' } },
      { id: 'sec-5', type: 'footer', content: { copyright: `© 2026 ${wizardName}. Fully optimized with Friday Web Builder.` }, style: { padding: '24px', bg: 'rgba(5, 4, 10, 0.95)' } }
    ];

    saveStateForUndo(projectState);
    setProjectState({
      businessName: wizardName,
      category: wizardCat,
      description: wizardDesc,
      theme: wizardTheme,
      primaryColor: wizardPrimary,
      accentColor: '#06B6D4',
      fontFamily: 'Outfit',
      targetAudience: 'Target Customers',
      language: 'English',
      pages: ['Home', 'About', 'Pricing', 'FAQ', 'Contact'],
      activePage: 'Home',
      components: generatedComponents
    });
    
    setIsWizardActive(false);
    toast.success('AI Website Generated successfully!');
  };

  // Add component
  const addComponentToPage = (type) => {
    let newComp = {
      id: `sec-${Date.now()}`,
      type,
      style: { padding: '48px 24px', bg: 'rgba(255,255,255,0.02)' }
    };

    if (type === 'testimonials') {
      newComp.content = {
        title: 'Client Feedback',
        reviews: ['Excellent speed and implementation!', 'Best UI builder interface.']
      };
    } else if (type === 'accordion') {
      newComp.content = {
        title: 'Frequently Asked Questions',
        items: [
          { q: 'Is hosting free?', a: 'Yes, we support direct GitHub and Vercel hosting integration.' },
          { q: 'Can I export clean React code?', a: 'Absolutely, Friday Web Builder exports pure clean components code.' }
        ]
      };
    } else if (type === 'timeline') {
      newComp.content = {
        title: 'Our Journey',
        milestones: ['Year 2024: Founded', 'Year 2025: Released Beta Builder', 'Year 2026: EduVerse Integration']
      };
    } else if (type === 'cards') {
      newComp.content = {
        title: 'Features Matrix',
        items: ['Visual Drag-and-Drop', 'Live Code Exporter', 'AI Integration Engine']
      };
    } else {
      newComp.content = { title: `${type.toUpperCase()} Section`, desc: 'Customize this component content via the right properties sidebar panel.' };
    }

    saveStateForUndo(projectState);
    setProjectState({
      ...projectState,
      components: [...projectState.components, newComp]
    });
    setSelectedCompId(newComp.id);
    toast.success(`Added ${type} section to page`);
  };

  // Delete component
  const deleteComponent = (id) => {
    saveStateForUndo(projectState);
    setProjectState({
      ...projectState,
      components: projectState.components.filter(c => c.id !== id)
    });
    if (selectedCompId === id) setSelectedCompId(null);
    toast.success('Section deleted');
  };

  // Move component up or down
  const moveComponent = (index, direction) => {
    const list = [...projectState.components];
    if (direction === 'up' && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    } else {
      return;
    }
    saveStateForUndo(projectState);
    setProjectState({ ...projectState, components: list });
  };

  // Chat commands parser
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = `Connecting with model: ${activeAiModel}. Prompting...`;
      let updated = false;
      const lower = userText.toLowerCase();

      saveStateForUndo(projectState);

      if (lower.includes('cyberpunk') || lower.includes('neon')) {
        setProjectState(prev => ({
          ...prev,
          theme: 'cyberpunk',
          primaryColor: '#00ffcc',
          accentColor: '#ff007f',
          components: prev.components.map(c => {
            if (c.type === 'hero') {
              return { ...c, content: { ...c.content, title: 'NEON MATRIX INTERFACE CONNECTED' } };
            }
            return c;
          })
        }));
        reply = "Decoupled visual parameters and applied cyberpunk neon layers.";
        updated = true;
      } else if (lower.includes('color') || lower.includes('violet') || lower.includes('purple')) {
        setProjectState(prev => ({
          ...prev,
          primaryColor: '#a78bfa',
          accentColor: '#c084fc'
        }));
        reply = "Set global primary colors to violet spectrum gradients.";
        updated = true;
      } else if (lower.includes('green') || lower.includes('emerald')) {
        setProjectState(prev => ({
          ...prev,
          primaryColor: '#10b981',
          accentColor: '#34d399'
        }));
        reply = "Global primary theme color set to green.";
        updated = true;
      } else if (lower.includes('add timeline')) {
        addComponentToPage('timeline');
        reply = "Appended timeline milestone tracker component.";
        updated = true;
      } else if (lower.includes('add pricing')) {
        addComponentToPage('pricing');
        reply = "Added subscription pricing plan table.";
        updated = true;
      } else if (lower.includes('add accordion') || lower.includes('add faq')) {
        addComponentToPage('accordion');
        reply = "Added FAQ Accordion dropdown elements.";
        updated = true;
      } else if (lower.includes('logo') || lower.includes('brand name')) {
        const matches = userText.match(/"([^"]+)"/) || userText.match(/'([^']+)'/);
        const name = matches ? matches[1] : 'Nebula';
        setProjectState(prev => ({
          ...prev,
          businessName: name,
          components: prev.components.map(c => {
            if (c.type === 'navbar') {
              return { ...c, content: { ...c.content, logo: name } };
            }
            return c;
          })
        }));
        reply = `Updated header logotype branding to "${name}"`;
        updated = true;
      } else {
        reply = `Command processed by ${activeAiModel}. Synthesized file alterations to page.tsx structure.`;
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      if (updated) {
        toast.success('Live canvas updated via Friday agent!');
      }
    }, 1000);
  };

  // Mock Deployer Operations
  const handleStartDeployment = () => {
    setIsDeploying(true);
    setDeployLogs(['Preparing environment configurations...', 'Resolving Vite workspace packages...']);
    setDeployedUrl('');

    const logSteps = [
      'Compiling React components tree with Vite...',
      'Optimizing CSS modules & scanning Tailwind declarations...',
      'Bundling application outputs to Cloudflare edge networks...',
      'Synchronizing metadata & dynamic routing variables...',
      'Provisioning SSL certificate keys...',
      'Deployment published successfully!'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logSteps.length) {
        setDeployLogs(prev => [...prev, logSteps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        const slug = projectState.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        setDeployedUrl(`https://${slug || 'eduverse-site'}.${deployTarget.toLowerCase()}.app`);
        toast.success(`Website deployed successfully to ${deployTarget}!`);
      }
    }, 1200);
  };

  // Stock Generator
  const handleAssetGenerate = () => {
    if (!assetSearchQuery.trim()) return;
    setIsGeneratingAsset(true);
    toast.success('Connecting to Stability AI engine...');

    setTimeout(() => {
      setGeneratedImages(prev => [
        ...prev,
        '/glowing_ai_hand.png'
      ]);
      setIsGeneratingAsset(false);
      toast.success('Asset generated successfully and loaded in tray!');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#070313] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Radial Glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* SETUP WIZARD PANEL */}
      <AnimatePresence>
        {isWizardActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#070313]/98 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-xl bg-[#120e2a]/90 border border-purple-500/20 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 pointer-events-none" />
              
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-500 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-lg shadow-purple-500/20">
                  🌐
                </div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">Friday Web Builder Setup</h2>
                <p className="text-xs text-slate-400 mt-1">Configure your branding credentials and watch the AI construct your high-fidelity site layout.</p>
              </div>

              <form onSubmit={handleWizardGenerate} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Company / Brand Name</label>
                  <input 
                    type="text" 
                    value={wizardName} 
                    onChange={e => setWizardName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Website Category</label>
                    <select 
                      value={wizardCat} 
                      onChange={e => setWizardCat(e.target.value)}
                      className="w-full bg-[#120e2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="SaaS">SaaS Platform</option>
                      <option value="Agency">Creative Agency</option>
                      <option value="Cyberpunk">Hacker Cyberpunk</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Visual Theme Style</label>
                    <select 
                      value={wizardTheme} 
                      onChange={e => setWizardTheme(e.target.value)}
                      className="w-full bg-[#120e2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="glass">Glassmorphism</option>
                      <option value="cyberpunk">Cyberpunk Neon</option>
                      <option value="minimal">Minimalist Light</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Brand Description</label>
                  <textarea 
                    value={wizardDesc} 
                    onChange={e => setWizardDesc(e.target.value)}
                    rows={3}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500" 
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Primary Color Tone</label>
                    <div className="flex gap-3">
                      {['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'].map(c => (
                        <button 
                          key={c}
                          type="button"
                          onClick={() => setWizardPrimary(c)}
                          className={`w-8 h-8 rounded-full border-2 ${wizardPrimary === c ? 'border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => navigate('/it-suite')}
                    className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl transition duration-300"
                  >
                    Cancel Workspace
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold rounded-xl transition duration-300 shadow-md shadow-purple-500/20"
                  >
                    Generate Layout with AI
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER MENU NAVBAR */}
      <header className="h-16 border-b border-white/5 bg-[#120e2a]/80 backdrop-blur-md px-6 flex items-center justify-between z-45 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/it-suite')}
            className="p-2 hover:bg-white/5 rounded-xl transition text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h1 className="text-xs font-black leading-none uppercase tracking-wider text-slate-400">EduVerse IDE</h1>
              <span className="text-sm font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Friday Web Core</span>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <button onClick={handleUndo} className="p-1 hover:bg-white/5 rounded transition text-slate-400 hover:text-white" title="Undo">
              <Undo2 size={14} />
            </button>
            <button onClick={handleRedo} className="p-1 hover:bg-white/5 rounded transition text-slate-400 hover:text-white" title="Redo">
              <Redo2 size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setViewportMode('desktop')} className={`p-1 rounded ${viewportMode === 'desktop' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'}`}><Monitor size={14} /></button>
            <button onClick={() => setViewportMode('tablet')} className={`p-1 rounded ${viewportMode === 'tablet' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'}`}><Tablet size={14} /></button>
            <button onClick={() => setViewportMode('mobile')} className={`p-1 rounded ${viewportMode === 'mobile' ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400'}`}><Smartphone size={14} /></button>
          </div>
        </div>

        {/* Workspace controls */}
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettingsModal(true)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white">
            <Settings size={16} />
          </button>
          <button 
            onClick={() => setShowDeployModal(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-slate-900 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Globe size={14} />
            Deploy Website
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE PANELS */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT WORKSPACE PANELS SWITCH PANEL (IDE MODE) */}
        <aside className="w-14 bg-[#090615] border-r border-white/5 flex flex-col items-center py-4 gap-4 flex-shrink-0 z-30">
          {[
            { id: 'explorer', icon: <FolderOpen size={18} />, label: 'Explorer' },
            { id: 'chat', icon: <MessageSquare size={18} />, label: 'AI Chat' },
            { id: 'components', icon: <Plus size={18} />, label: 'Add Block' },
            { id: 'assets', icon: <ImageIcon size={18} />, label: 'Assets' },
            { id: 'templates', icon: <LayoutTemplate size={18} />, label: 'Themes' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveLeftTab(btn.id)}
              className={`p-2.5 rounded-xl transition relative group ${activeLeftTab === btn.id ? 'bg-purple-500/15 text-purple-400' : 'text-slate-400 hover:text-white'}`}
              title={btn.label}
            >
              {btn.icon}
              <span className="absolute left-full ml-2 px-2 py-0.5 bg-slate-900 border border-white/10 text-[9px] rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">{btn.label}</span>
            </button>
          ))}
        </aside>

        {/* LEFT SIDEBAR ACTIVE CONTENT CONTAINER */}
        <aside className="w-72 bg-[#0d0a1d] border-r border-white/5 flex flex-col flex-shrink-0 z-20">
          
          {/* Section: File Explorer list */}
          {activeLeftTab === 'explorer' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Project Files</span>
              <div className="space-y-1">
                {INITIAL_FILES.map(file => (
                  <div
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition ${selectedFilePath === file.path ? 'bg-purple-500/10 text-purple-400 font-bold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span>📄</span>
                    <span>{file.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: AI Chat Panel */}
          {activeLeftTab === 'chat' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-3 border-b border-white/5 bg-white/5 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Model: {activeAiModel}</span>
                <select 
                  className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white"
                  value={activeAiModel}
                  onChange={(e) => setActiveAiModel(e.target.value)}
                >
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="deepseek-coder">DeepSeek Coder</option>
                  <option value="llama-3">Llama 3 (Groq)</option>
                </select>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`p-2.5 rounded-xl max-w-[90%] text-[11px] leading-relaxed ${msg.role === 'assistant' ? 'bg-white/5 text-slate-200' : 'bg-purple-600/30 text-purple-200 ml-auto'}`}>
                    {msg.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleChatSubmit} className="p-2 border-t border-white/5 bg-white/5 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask Friday (e.g. change color to emerald)..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 bg-black/30 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none" 
                />
                <button type="submit" className="p-1.5 bg-cyan-500 text-slate-900 rounded-lg"><Send size={14} /></button>
              </form>
            </div>
          )}

          {/* Section: Add Block Components Library */}
          {activeLeftTab === 'components' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Drag & Add Blocks</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: 'hero', label: 'Hero block', emoji: '🚀' },
                  { type: 'features', label: 'Feature card', emoji: '💎' },
                  { type: 'pricing', label: 'Pricing packages', emoji: '💰' },
                  { type: 'accordion', label: 'FAQ Accordion', emoji: '💬' },
                  { type: 'timeline', label: 'Timeline log', emoji: '📅' },
                  { type: 'about', label: 'About Summary', emoji: '📖' },
                  { type: 'footer', label: 'Footer info', emoji: '⚓' }
                ].map(comp => (
                  <div 
                    key={comp.type}
                    onClick={() => addComponentToPage(comp.type)}
                    className="p-3 bg-white/5 border border-white/5 hover:border-purple-500/40 rounded-xl cursor-pointer transition text-center"
                  >
                    <span className="text-lg block mb-1">{comp.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-300 block">{comp.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Assets Generated tray */}
          {activeLeftTab === 'assets' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">AI Asset Generator</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Prompt: Cyberpunk grid"
                  value={assetSearchQuery}
                  onChange={e => setAssetSearchQuery(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none" 
                />
                <button onClick={handleAssetGenerate} className="px-2.5 py-1 bg-purple-600 rounded-lg text-xs font-bold">Gen</button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {generatedImages.map((img, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/5 aspect-square">
                    <img src={img} alt="Generated asset" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Themes Select */}
          {activeLeftTab === 'templates' && (
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Visual Themes</span>
              {['glass', 'cyberpunk', 'minimal'].map(themeKey => (
                <div 
                  key={themeKey} 
                  onClick={() => {
                    saveStateForUndo(projectState);
                    setProjectState({ ...projectState, theme: themeKey });
                    toast.success(`Theme updated to ${themeKey}`);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition ${projectState.theme === themeKey ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                >
                  <strong className="text-xs capitalize text-slate-200">{themeKey} Theme</strong>
                </div>
              ))}
            </div>
          )}

        </aside>

        {/* CENTER INTERACTIVE EDITOR & PREVIEW PANELS */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#070313]">
          
          {/* Top Tabs panel (Monaco simulation) */}
          <div className="h-11 bg-[#0f0b22] border-b border-white/5 flex items-center px-4 justify-between">
            <div className="flex gap-2">
              {INITIAL_FILES.map(f => (
                <button
                  key={f.path}
                  onClick={() => setSelectedFilePath(f.path)}
                  className={`px-3 py-1 text-xs font-mono rounded-t-lg transition border-t-2 ${selectedFilePath === f.path ? 'bg-black/40 border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            
            <button className="text-[10px] font-bold bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/10 text-slate-300">
              Format Code (Prettier)
            </button>
          </div>

          {/* Core code block panel (IDE Mode) */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 font-mono text-xs p-4 overflow-y-auto bg-black/20 text-cyan-300/80 leading-relaxed text-left border-r border-white/5 select-text">
              <pre className="whitespace-pre-wrap">{editedCode}</pre>
            </div>

            {/* Right side live website preview window */}
            <div className="w-[45%] flex flex-col bg-[#090516] overflow-hidden">
              <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <PlayCircle size={14} className="text-green-400" />
                  Live Preview Browser
                </span>

                <div className="flex gap-1.5">
                  {['browser', 'console', 'network'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveRightTab(tab)}
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded transition ${activeRightTab === tab ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viewport: Live interactive rendering */}
              {activeRightTab === 'browser' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <div 
                    className={`transition-all duration-300 mx-auto rounded-[20px] border-2 border-slate-700 bg-[#090515] overflow-hidden ${
                      viewportMode === 'mobile' ? 'w-[280px] min-h-[480px]' : 
                      viewportMode === 'tablet' ? 'w-[360px] min-h-[500px]' : 
                      'w-full min-h-[550px]'
                    }`}
                  >
                    <div 
                      className={`w-full h-full p-4 overflow-hidden text-left ${
                        projectState.theme === 'glass' ? 'bg-[#090515] text-white' : 
                        projectState.theme === 'cyberpunk' ? 'bg-[#03010b] text-white' : 
                        'bg-slate-900 text-slate-100'
                      }`}
                      style={{ fontFamily: FONTS.find(f => f.name === projectState.fontFamily)?.name || 'Outfit' }}
                    >
                      {projectState.components.map(comp => (
                        <div key={comp.id} className="py-4 border-b border-white/5 relative">
                          {comp.type === 'navbar' && (
                            <div className="flex justify-between items-center py-1 px-2 rounded bg-white/5">
                              <span className="text-xs font-extrabold text-cyan-400">🌐 {comp.content?.logo || projectState.businessName}</span>
                              <span className="text-[9px] text-slate-400">Home</span>
                            </div>
                          )}
                          {comp.type === 'hero' && (
                            <div className="text-center py-4">
                              <h4 className="text-sm font-extrabold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">{comp.content?.title}</h4>
                              <p className="text-[9px] text-slate-400 mt-1">{comp.content?.desc}</p>
                            </div>
                          )}
                          {comp.type === 'features' && (
                            <div className="grid grid-cols-2 gap-1.5 py-2">
                              {(comp.content?.items || []).map((item, idx) => (
                                <div key={idx} className="p-2 bg-white/5 rounded border border-white/5">
                                  <div className="text-[8px] font-bold text-slate-200">{item}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {comp.type === 'about' && (
                            <div className="text-left py-2">
                              <h4 className="text-xs font-bold">{comp.content?.title}</h4>
                              <p className="text-[8px] text-slate-400 mt-1">{comp.content?.desc}</p>
                            </div>
                          )}
                          {comp.type === 'pricing' && (
                            <div className="grid grid-cols-2 gap-2 py-2">
                              {(comp.content?.packages || []).map((p, idx) => (
                                <div key={idx} className="p-2 bg-[#120e2a] rounded text-center">
                                  <div className="text-[8px] text-slate-400">{p.name}</div>
                                  <div className="text-xs font-bold text-white mt-1">{p.price}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          {comp.type === 'footer' && (
                            <div className="text-center text-[7px] text-slate-500 pt-2 border-t border-white/5">
                              {comp.content?.copyright}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Viewport: Console logger */}
              {activeRightTab === 'console' && (
                <div className="flex-1 font-mono text-[10px] text-emerald-400 bg-black/40 p-4 space-y-1 overflow-y-auto text-left">
                  <div>[Vite] dev server running...</div>
                  <div>[HMR] connection established.</div>
                  <div>[Console] Loading state theme assets: {projectState.theme}</div>
                  <div>[Console] Component hydration finished. Ready.</div>
                </div>
              )}

              {/* Viewport: Network tracker */}
              {activeRightTab === 'network' && (
                <div className="flex-1 font-mono text-[9px] text-slate-300 bg-black/40 p-4 space-y-1.5 overflow-y-auto text-left">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span>File Path</span>
                    <span>Status</span>
                    <span>Latency</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>GET /app/page.tsx</span>
                    <span>200 OK</span>
                    <span>14ms</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>GET /tailwind.config.ts</span>
                    <span>200 OK</span>
                    <span>22ms</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>GET /assets/glowing_ai_hand.png</span>
                    <span>200 OK</span>
                    <span>120ms</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom terminal panel (Logs & GIT console) */}
          <div className="h-44 bg-[#090515] border-t border-white/5 flex flex-col">
            <div className="h-9 px-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex gap-2">
                {[
                  { id: 'terminal', label: 'Terminal logs' },
                  { id: 'build', label: 'Build Console' },
                  { id: 'git', label: 'Git status' }
                ].map(term => (
                  <button
                    key={term.id}
                    onClick={() => setActiveBottomTab(term.id)}
                    className={`px-3 py-1 text-xs font-semibold transition ${activeBottomTab === term.id ? 'text-purple-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}
                  >
                    {term.label}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500 font-mono">PAGER=cat</span>
            </div>

            {/* Bottom active tab contents */}
            {activeBottomTab === 'terminal' && (
              <div className="flex-1 font-mono text-[10px] text-cyan-400/90 p-4 overflow-y-auto space-y-1 text-left bg-black/30">
                <div>$ npm run dev</div>
                <div>Local: http://localhost:3000/</div>
                <div>File changes detected. hot reload success in 14ms.</div>
              </div>
            )}

            {activeBottomTab === 'build' && (
              <div className="flex-1 font-mono text-[10px] text-slate-400 p-4 overflow-y-auto space-y-1 text-left bg-black/30">
                <div>vite v5.2.11 building for production...</div>
                <div>✓ 42 modules transformed.</div>
                <div>dist/assets/index.js 242.14 kB</div>
                <div className="text-green-400">✓ build complete in 2.14s</div>
              </div>
            )}

            {activeBottomTab === 'git' && (
              <div className="flex-1 font-mono text-[10px] text-yellow-400/80 p-4 overflow-y-auto space-y-1 text-left bg-black/30">
                <div>$ git status</div>
                <div>On branch main</div>
                <div>Your branch is up to date with 'origin/main'.</div>
                <div>modified:   app/page.tsx</div>
                <div>nothing added to commit but untracked files present.</div>
              </div>
            )}

          </div>

        </main>

      </div>

      {/* ONE-CLICK DEPLOYMENT MODAL */}
      <AnimatePresence>
        {showDeployModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-[#120e2a]/95 border border-purple-500/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>🚀</span> Launch Production Deployment
                </h3>
                <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="flex gap-3 mb-4">
                {['Vercel', 'Netlify', 'GitHub'].map(target => (
                  <button 
                    key={target}
                    onClick={() => setDeployTarget(target)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      deployTarget === target ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'bg-white/5 border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    {target}
                  </button>
                ))}
              </div>

              <div className="bg-black/60 rounded-xl p-4 h-40 overflow-y-auto font-mono text-[10px] text-cyan-400/90 space-y-1.5 text-left border border-white/5 mb-4">
                {deployLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-500">{i+1}.</span>
                    <span>{log}</span>
                  </div>
                ))}
                {isDeploying && <div className="text-slate-400 animate-pulse">Running build scripts...</div>}
                {!isDeploying && deployLogs.length === 0 && <div className="text-slate-500 italic">Select target cloud network and click deploy to launch pipeline.</div>}
              </div>

              {deployedUrl && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-emerald-400 block uppercase">Deployment Online</span>
                    <a href={deployedUrl} target="_blank" rel="noreferrer" className="text-xs text-white font-bold hover:underline">{deployedUrl}</a>
                  </div>
                  <span className="text-xl">✅</span>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeployModal(false)}
                  className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl transition"
                >
                  Close
                </button>
                <button 
                  onClick={handleStartDeployment}
                  disabled={isDeploying}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-900 font-extrabold text-xs rounded-xl transition"
                >
                  {isDeploying ? 'Deploying...' : `Deploy to ${deployTarget}`}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED INTERACTIVE SETTINGS MODAL */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-[#120e2a]/95 border border-purple-500/25 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>⚙️</span> Workspace Preferences
                </h3>
                <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="copilot-form-group">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Temperature</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0" 
                      max="1" 
                      value={aiTemperature}
                      onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="copilot-form-group">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Max Token Limit</label>
                    <input 
                      type="number" 
                      value={aiTokenLimit}
                      onChange={(e) => setAiTokenLimit(parseInt(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">OpenAI API Key</label>
                  <input 
                    type="password" 
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Anthropic API Key</label>
                  <input 
                    type="password" 
                    placeholder="sk-ant-..."
                    value={claudeKey}
                    onChange={(e) => setClaudeKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    toast.success("Workspace parameters updated.");
                    setShowSettingsModal(false);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-900 font-extrabold text-xs rounded-xl transition"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

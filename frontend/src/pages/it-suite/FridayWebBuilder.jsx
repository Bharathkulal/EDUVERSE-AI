import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Layers, Grid, Undo2, Redo2, Save, Download, Globe, 
  Smartphone, Tablet, Laptop, Monitor, LayoutTemplate, MessageSquare, 
  Settings2, Plus, Trash2, ArrowLeft, Code, Play, CheckCircle, 
  AlertCircle, ChevronRight, Eye, RefreshCw, Copy, AlignLeft, 
  Maximize2, RotateCw, Image as ImageIcon, Send, Volume2, Mic, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Outfitted Fonts
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

export default function FridayWebBuilder() {
  const navigate = useNavigate();

  // Project Configuration State (Autosaved to localStorage)
  const [projectState, setProjectState] = useState(() => {
    const saved = localStorage.getItem('friday_builder_project');
    return saved ? JSON.parse(saved) : {
      businessName: 'EduVerse Launch',
      category: 'SaaS',
      description: 'An AI-powered learning hub for modern students.',
      theme: 'glass', // 'glass', 'cyberpunk', 'neon', 'minimal', 'corporate'
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

  // Canvas Editor Interactive States
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [activeTab, setActiveTab] = useState('components'); // 'pages', 'layers', 'assets', 'templates', 'components'
  const [activeRightTab, setActiveRightTab] = useState('styles'); // 'styles', 'animations', 'seo'
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop', 'tablet', 'mobile'
  const [isLandscape, setIsLandscape] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // History State for Undo/Redo
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Simulated Monaco Editor Code
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editorLang, setEditorLang] = useState('react'); // 'react', 'next', 'html'
  const [editedCode, setEditedCode] = useState('');

  // AI Chat Assistant State
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Welcome to Friday Web Builder! Tell me to "change background color to violet", "generate a cyberpunk template", or "add a hero section".' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Deployment Logs Console State
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployTarget, setDeployTarget] = useState('Vercel'); // 'Vercel', 'Netlify', 'Cloudflare'
  const [deployLogs, setDeployLogs] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');

  // Asset Generator States
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [generatedImages, setGeneratedImages] = useState([
    '/theory_bg.png',
    '/practical_bg.png',
    '/glowing_ai_hand.png'
  ]);
  const [isGeneratingAsset, setIsGeneratingAsset] = useState(false);

  // Snap to Grid Lock State
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
  }, [projectState, editorLang]);

  // Generate code based on design components tree
  const updateGeneratedCodeView = () => {
    let codeStr = '';
    if (editorLang === 'react') {
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
    } else {
      codeStr = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectState.businessName}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#03010b] text-white">
  <nav class="p-6 border-b border-white/10 flex justify-between">
    <div class="font-extrabold text-cyan-400">${projectState.businessName}</div>
  </nav>
  <header class="py-20 text-center">
    <h1 class="text-4xl font-extrabold">${projectState.components[1]?.content?.title}</h1>
    <p class="text-slate-400 mt-4">${projectState.components[1]?.content?.desc}</p>
  </header>
</body>
</html>`;
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

  // Drag & drop add component
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

  // Delete component from layout
  const deleteComponent = (id) => {
    saveStateForUndo(projectState);
    setProjectState({
      ...projectState,
      components: projectState.components.filter(c => c.id !== id)
    });
    if (selectedCompId === id) setSelectedCompId(null);
    toast.success('Section deleted');
  };

  // Move component up or down inside canvas layout tree
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

  // AI assistant conversational commands parser
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "I couldn't process that style request. Try commands like 'make template cyberpunk', 'change colors to green', or 'add timeline section'.";
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
        reply = "Override complete. Decoupled layout parameters and enabled cyberpunk styling vectors!";
        updated = true;
      } else if (lower.includes('color') || lower.includes('violet') || lower.includes('purple')) {
        setProjectState(prev => ({
          ...prev,
          primaryColor: '#a78bfa',
          accentColor: '#c084fc'
        }));
        reply = "Acknowledged. Set primary accents to violet palette spectrum.";
        updated = true;
      } else if (lower.includes('green') || lower.includes('emerald')) {
        setProjectState(prev => ({
          ...prev,
          primaryColor: '#10b981',
          accentColor: '#34d399'
        }));
        reply = "Primary colors updated to fresh emerald green.";
        updated = true;
      } else if (lower.includes('add timeline')) {
        addComponentToPage('timeline');
        reply = "Appended visual history timeline module section to your canvas.";
        updated = true;
      } else if (lower.includes('add pricing')) {
        addComponentToPage('pricing');
        reply = "Added dynamic subscription packages block below your current focus.";
        updated = true;
      } else if (lower.includes('add accordion') || lower.includes('add faq')) {
        addComponentToPage('accordion');
        reply = "Added FAQ Accordion list components.";
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
        reply = `Updated branding credentials header to "${name}"!`;
        updated = true;
      }

      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      if (updated) {
        toast.success('Live canvas updated via AI Assistant!');
      }
    }, 1200);
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

  // AI Assets Search & Generator simulator
  const handleAssetGenerate = () => {
    if (!assetSearchQuery.trim()) return;
    setIsGeneratingAsset(true);
    toast.success('Connecting to Stability AI engine...');

    setTimeout(() => {
      // Simulate generated image
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
      
      {/* Background Neon Elements */}
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
      <header className="h-16 border-b border-white/5 bg-[#120e2a]/80 backdrop-blur-md px-6 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/it-suite')}
            className="p-2 hover:bg-white/5 rounded-xl transition text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌐</span>
            <div>
              <h1 className="text-xs font-black leading-none uppercase tracking-wider text-slate-400">EduVerse AI</h1>
              <span className="text-sm font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Friday Web Builder</span>
            </div>
          </div>
        </div>

        {/* Center: Undo/Redo & Viewport Mode Buttons */}
        <div className="hidden md:flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          <div className="flex items-center gap-2 border-r border-white/10 pr-3">
            <button onClick={handleUndo} className="p-1 hover:bg-white/5 rounded transition text-slate-400 hover:text-white" title="Undo">
              <Undo2 size={14} />
            </button>
            <button onClick={handleRedo} className="p-1 hover:bg-white/5 rounded transition text-slate-400 hover:text-white" title="Redo">
              <Redo2 size={14} />
            </button>
          </div>
          
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <button 
              onClick={() => setViewportMode('desktop')} 
              className={`p-1 rounded transition ${viewportMode === 'desktop' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Monitor size={14} />
            </button>
            <button 
              onClick={() => setViewportMode('tablet')} 
              className={`p-1 rounded transition ${viewportMode === 'tablet' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Tablet size={14} />
            </button>
            <button 
              onClick={() => setViewportMode('mobile')} 
              className={`p-1 rounded transition ${viewportMode === 'mobile' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'}`}
            >
              <Smartphone size={14} />
            </button>
          </div>

          <button 
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`text-[9px] font-bold px-2 py-0.5 rounded ${snapToGrid ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-400'}`}
          >
            Snap Grid: {snapToGrid ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCodeEditor(!showCodeEditor)}
            className="px-3.5 py-1.5 border border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Code size={14} />
            {showCodeEditor ? 'Hide Code' : 'View Code'}
          </button>
          
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="px-3.5 py-1.5 border border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Eye size={14} />
            {isPreviewMode ? 'Exit Preview' : 'Live Preview'}
          </button>

          <button 
            onClick={() => setShowDeployModal(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-slate-900 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-purple-500/20"
          >
            <Globe size={14} />
            One-Click Deploy
          </button>
        </div>
      </header>

      {/* CORE WORKSPACE PANELS */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT WORKSPACE PANEL */}
        {!isPreviewMode && (
          <aside className="w-80 border-r border-white/5 bg-[#0f0b22]/90 backdrop-blur-md flex flex-col z-20">
            {/* Panel Tabs list */}
            <div className="flex border-b border-white/5 p-2 gap-1 overflow-x-auto">
              {[
                { id: 'components', label: 'Components', icon: <Plus size={14} /> },
                { id: 'layers', label: 'Layers', icon: <Layers size={14} /> },
                { id: 'assets', label: 'Assets', icon: <ImageIcon size={14} /> },
                { id: 'templates', label: 'Themes', icon: <LayoutTemplate size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-purple-500/20 text-purple-400 border border-purple-500/10' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Left Drawer dynamic content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              
              {/* Tab: Components Library */}
              {activeTab === 'components' && (
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Drag & Add Components</div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'hero', label: 'Hero Block', emoji: '🚀' },
                      { type: 'features', label: 'Feature Cards', emoji: '💎' },
                      { type: 'pricing', label: 'Pricing Plan', emoji: '💰' },
                      { type: 'accordion', label: 'FAQ Accordion', emoji: '💬' },
                      { type: 'timeline', label: 'Timeline Line', emoji: '📅' },
                      { type: 'about', label: 'About Summary', emoji: '📖' },
                      { type: 'contact', label: 'Contact Forms', emoji: '✉️' },
                      { type: 'footer', label: 'Page Footer', emoji: '⚓' }
                    ].map(comp => (
                      <div 
                        key={comp.type}
                        onClick={() => addComponentToPage(comp.type)}
                        className="p-3 bg-white/5 border border-white/5 hover:border-purple-500/40 rounded-xl cursor-pointer transition text-center hover:-translate-y-0.5"
                      >
                        <span className="text-xl block mb-1">{comp.emoji}</span>
                        <span className="text-[10px] font-bold text-slate-300 block">{comp.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block mb-1">Interactive Component Library</span>
                    <p className="text-[9px] text-slate-400 leading-tight">Access over 500+ pre-coded layout blocks configured with modern responsive rules.</p>
                  </div>
                </div>
              )}

              {/* Tab: Layers Hierarchy Tree */}
              {activeTab === 'layers' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Canvas Layer Hierarchy</div>
                  {projectState.components.map((comp, idx) => (
                    <div 
                      key={comp.id}
                      onClick={() => setSelectedCompId(comp.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition ${
                        selectedCompId === comp.id ? 'bg-purple-500/15 border-purple-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-bold">#{idx+1}</span>
                        <span className="font-extrabold capitalize text-slate-200">{comp.type}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => moveComponent(idx, 'up')} className="p-0.5 hover:bg-white/10 rounded text-xs">▲</button>
                        <button onClick={() => moveComponent(idx, 'down')} className="p-0.5 hover:bg-white/10 rounded text-xs">▼</button>
                        <button onClick={() => deleteComponent(comp.id)} className="p-0.5 hover:bg-red-500/20 rounded transition text-red-400 ml-1">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Asset Generator & Stock tray */}
              {activeTab === 'assets' && (
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">AI Asset Generator</div>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Prompt (e.g. isometric server room)"
                      value={assetSearchQuery}
                      onChange={e => setAssetSearchQuery(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none" 
                    />
                    <button 
                      onClick={handleAssetGenerate}
                      disabled={isGeneratingAsset}
                      className="px-3 py-1 bg-purple-600 hover:opacity-90 rounded-lg text-xs font-bold transition whitespace-nowrap"
                    >
                      {isGeneratingAsset ? 'Generating...' : 'Gen Asset'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-505">Asset Library Tray</div>
                    <div className="grid grid-cols-2 gap-2">
                      {generatedImages.map((img, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/5 bg-white/5 aspect-square cursor-pointer">
                          <img src={img} alt="Generated Asset" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <span className="text-[9px] font-bold text-white uppercase bg-purple-500 px-2 py-0.5 rounded">Use Asset</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Theme Previews */}
              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Select Style Theme Preset</div>
                  {[
                    { id: 'glass', label: 'Glassmorphism Space', desc: 'Frosted backdrops and neon light rings' },
                    { id: 'cyberpunk', label: 'Cyberpunk Neon', desc: 'Raw high-contrast grids and glowing fonts' },
                    { id: 'minimal', label: 'Minimalist Clean', desc: 'Ultra simple, whitespace and sharp lines' }
                  ].map(tmpl => (
                    <div 
                      key={tmpl.id}
                      onClick={() => {
                        saveStateForUndo(projectState);
                        setProjectState({ ...projectState, theme: tmpl.id });
                        toast.success(`Applied ${tmpl.label} theme`);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        projectState.theme === tmpl.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <h4 className="text-xs font-black text-slate-200">{tmpl.label}</h4>
                      <p className="text-[9px] text-slate-400 mt-1 leading-snug">{tmpl.desc}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </aside>
        )}

        {/* CENTER LIVE BUILDER CANVAS VIEWPORT */}
        <main className="flex-1 bg-[#090516] p-8 flex flex-col items-center justify-start overflow-y-auto z-10">
          
          {/* Active component name selector indicator */}
          {!isPreviewMode && selectedCompId && (
            <div className="mb-4 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs px-4 py-1.5 rounded-full flex items-center gap-3">
              <span className="font-extrabold uppercase tracking-wider">Editing: {projectState.components.find(c => c.id === selectedCompId)?.type}</span>
              <button 
                onClick={() => setSelectedCompId(null)}
                className="hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Device viewport frame wrapper */}
          <div 
            className={`transition-all duration-300 rounded-[28px] border-4 border-slate-700 bg-slate-900 shadow-2xl relative ${
              viewportMode === 'mobile' ? 'w-[390px] min-h-[700px]' : 
              viewportMode === 'tablet' ? 'w-[768px] min-h-[850px]' : 
              'w-full max-w-5xl min-h-[900px]'
            }`}
          >
            {/* Device Speaker & Camera Notch (Only for mobile/tablet) */}
            {viewportMode !== 'desktop' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-700 rounded-b-xl z-30" />
            )}

            {/* LIVE WEBPAGE CANVAS */}
            <div 
              className={`w-full h-full p-4 overflow-hidden rounded-[22px] transition-colors duration-300 ${
                projectState.theme === 'glass' ? 'bg-[#090515] text-white' : 
                projectState.theme === 'cyberpunk' ? 'bg-[#03010b] text-white' : 
                'bg-slate-955 text-slate-100'
              }`}
              style={{ fontFamily: FONTS.find(f => f.name === projectState.fontFamily)?.name || 'Outfit' }}
            >
              
              {/* Dynamic Design components loop */}
              {projectState.components.map((comp, idx) => (
                <div 
                  key={comp.id}
                  onClick={() => !isPreviewMode && setSelectedCompId(comp.id)}
                  className={`group/section relative transition duration-300 ${
                    !isPreviewMode && selectedCompId === comp.id ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''
                  } ${!isPreviewMode ? 'hover:ring-1 hover:ring-cyan-500/40 cursor-pointer' : ''}`}
                  style={{
                    padding: comp.style?.padding || '32px 16px',
                    backgroundColor: comp.style?.bg || 'transparent'
                  }}
                >
                  
                  {/* Visual edit overlay actions */}
                  {!isPreviewMode && (
                    <div className="absolute top-2 right-2 bg-[#120e2a] border border-white/10 rounded-lg p-1 flex items-center gap-1.5 opacity-0 group-hover/section:opacity-100 transition-opacity z-20 shadow-md">
                      <span className="text-[9px] font-black text-slate-400 uppercase px-1 pr-2 border-r border-white/5">{comp.type}</span>
                      <button onClick={() => moveComponent(idx, 'up')} className="p-0.5 hover:bg-white/10 rounded text-xs">▲</button>
                      <button onClick={() => moveComponent(idx, 'down')} className="p-0.5 hover:bg-white/10 rounded text-xs">▼</button>
                      <button onClick={() => deleteComponent(comp.id)} className="p-0.5 hover:bg-red-500/20 rounded text-red-400">🗑️</button>
                    </div>
                  )}

                  {/* Component Render: Navbar */}
                  {comp.type === 'navbar' && (
                    <div className="flex justify-between items-center py-2 px-4 border-b border-white/5 rounded-xl bg-white/5 backdrop-blur-md">
                      <div className="text-lg font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-1">
                        <span>🌐</span>
                        {comp.content?.logo || projectState.businessName}
                      </div>
                      <div className="flex gap-4 text-xs font-semibold text-slate-300">
                        {projectState.pages.map(p => (
                          <span key={p} className="hover:text-cyan-400 transition cursor-pointer">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Component Render: Hero */}
                  {comp.type === 'hero' && (
                    <div className="py-12 px-6 text-center max-w-3xl mx-auto">
                      <h2 className="text-4xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                        {comp.content?.title || 'Launch Your AI Application'}
                      </h2>
                      <p className="text-xs text-slate-400 mt-4 leading-relaxed max-w-xl mx-auto">
                        {comp.content?.desc || 'Automatically generate fully interactive SaaS interfaces powered by Friday Web Core.'}
                      </p>
                      
                      <div className="mt-8 flex justify-center gap-3">
                        <button className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-900 font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/10">
                          Get Started Free
                        </button>
                        <button className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-xs font-bold rounded-xl">
                          Learn More
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Component Render: Features Grid */}
                  {comp.type === 'features' && (
                    <div>
                      <h3 className="text-xl font-bold text-center mb-8">Platform Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(comp.content?.items || ['AI Engine', 'Tailwind Configs', 'Dynamic Modules']).map((item, index) => (
                          <div key={index} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition backdrop-blur-md text-left">
                            <span className="text-xs font-extrabold text-cyan-400">0{index + 1}. FEATURE</span>
                            <h4 className="text-base font-bold text-slate-200 mt-2">{item}</h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-snug">Fully customizable code parameters ready for production build pipelines.</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Component Render: About */}
                  {comp.type === 'about' && (
                    <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
                      <div className="text-left space-y-4">
                        <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">Core Mission</span>
                        <h3 className="text-2xl font-black">{comp.content?.title || 'Designed for Scale'}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{comp.content?.desc || 'Build and deploy optimized website portfolios with responsive UI and SEO settings in minutes.'}</p>
                      </div>
                      <div className="h-48 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-pulse">⚡</div>
                      </div>
                    </div>
                  )}

                  {/* Component Render: Pricing */}
                  {comp.type === 'pricing' && (
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-xl font-bold text-center mb-8">Simple Plans</h3>
                      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {(comp.content?.packages || [
                          { name: 'Starter Pack', price: '$19', features: ['1 User', 'Basic Logs'] },
                          { name: 'Developer Plan', price: '$49', features: ['10 Users', 'Detailed Analytics'] }
                        ]).map((plan, index) => (
                          <div key={index} className="p-6 rounded-2xl bg-[#120e2a] border border-white/5 hover:border-cyan-500/30 transition text-center relative overflow-hidden">
                            {index === 1 && <div className="absolute top-2 right-2 bg-cyan-500 text-slate-900 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Popular</div>}
                            <h4 className="text-xs font-black text-slate-400 uppercase">{plan.name}</h4>
                            <div className="text-3xl font-black text-white my-3">{plan.price}</div>
                            <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl transition border border-white/10 mb-4">Select Plan</button>
                            <ul className="text-left text-[10px] text-slate-400 space-y-1.5">
                              {plan.features?.map((f, i) => <li key={i}>✓ {f}</li>) || <li>✓ High Speed CDN</li>}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Component Render: FAQ Accordion */}
                  {comp.type === 'accordion' && (
                    <div className="max-w-xl mx-auto text-left">
                      <h3 className="text-lg font-bold text-center mb-6">{comp.content?.title || 'Common Inquiries'}</h3>
                      <div className="space-y-3">
                        {(comp.content?.items || []).map((faq, i) => (
                          <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                            <h4 className="text-xs font-extrabold text-slate-200">Q: {faq.q}</h4>
                            <p className="text-[11px] text-slate-400 mt-2 pl-4 border-l border-cyan-500/30">A: {faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Component Render: Timeline */}
                  {comp.type === 'timeline' && (
                    <div className="max-w-xl mx-auto text-left space-y-4">
                      <h3 className="text-lg font-bold text-center mb-6">{comp.content?.title}</h3>
                      <div className="relative border-l border-white/10 pl-6 space-y-6">
                        {(comp.content?.milestones || []).map((m, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-purple-500 border border-slate-900" />
                            <p className="text-xs font-extrabold text-slate-200">{m}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Component Render: Footer */}
                  {comp.type === 'footer' && (
                    <div className="pt-6 border-t border-white/5 text-center text-[10px] text-slate-400">
                      <p>{comp.content?.copyright || '© 2026 Friday Web Builder.'}</p>
                    </div>
                  )}

                </div>
              ))}

            </div>
          </div>
        </main>

        {/* RIGHT PROPERTY EDITING PANEL */}
        {!isPreviewMode && (
          <aside className="w-80 border-l border-white/5 bg-[#0f0b22]/90 backdrop-blur-md flex flex-col z-20">
            {/* Panel sub-tabs */}
            <div className="flex border-b border-white/5 p-2 gap-1">
              {[
                { id: 'styles', label: 'Styles', icon: <Settings2 size={13} /> },
                { id: 'animations', label: 'Animations', icon: <Sparkles size={13} /> },
                { id: 'seo', label: 'SEO tags', icon: <Globe size={13} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRightTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeRightTab === tab.id ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Drawer dynamic content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              
              {/* Tab: Styles / Properties */}
              {activeRightTab === 'styles' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Global Font Family</label>
                    <select 
                      value={projectState.fontFamily} 
                      onChange={e => {
                        saveStateForUndo(projectState);
                        setProjectState({ ...projectState, fontFamily: e.target.value });
                      }}
                      className="w-full bg-[#120e2a] border border-white/10 rounded-lg p-2 text-xs text-white"
                    >
                      {FONTS.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Accent Brand Color</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="color" 
                        value={projectState.primaryColor}
                        onChange={e => {
                          setProjectState({ ...projectState, primaryColor: e.target.value });
                        }}
                        className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer" 
                      />
                      <span className="text-xs font-mono text-slate-300">{projectState.primaryColor}</span>
                    </div>
                  </div>

                  {selectedCompId ? (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                      <span className="text-[10px] font-black uppercase text-purple-400">Section Parameters</span>
                      
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-1">Box Padding</label>
                        <select 
                          onChange={e => {
                            saveStateForUndo(projectState);
                            setProjectState({
                              ...projectState,
                              components: projectState.components.map(c => 
                                c.id === selectedCompId ? { ...c, style: { ...c.style, padding: e.target.value } } : c
                              )
                            });
                          }}
                          className="w-full bg-[#120e2a] border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                        >
                          <option value="24px 12px">Narrow (24px)</option>
                          <option value="48px 24px">Normal (48px)</option>
                          <option value="80px 24px">Wide (80px)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-1">Section Background</label>
                        <input 
                          type="text" 
                          placeholder="e.g. rgba(20, 20, 40, 0.5)"
                          onChange={e => {
                            setProjectState({
                              ...projectState,
                              components: projectState.components.map(c => 
                                c.id === selectedCompId ? { ...c, style: { ...c.style, bg: e.target.value } } : c
                              )
                            });
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white" 
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Click any component inside the canvas container to load custom style parameters.</p>
                  )}
                </div>
              )}

              {/* Tab: Animations */}
              {activeRightTab === 'animations' && (
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-400">Animation Trigger presets</div>
                  {[
                    { name: 'Fade In Up', trigger: 'framer' },
                    { name: 'Parallax Scroll Blur', trigger: 'gsap' },
                    { name: 'Scale Pop Bounce', trigger: 'framer' }
                  ].map((anim, i) => (
                    <div 
                      key={i}
                      onClick={() => toast.success(`Applied ${anim.name} trigger animation`)}
                      className="p-3 bg-white/5 border border-white/5 hover:border-purple-500/35 rounded-xl cursor-pointer transition text-left flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-300">{anim.name}</h4>
                        <span className="text-[8px] font-mono text-purple-400 uppercase mt-0.5 block">Engine: {anim.trigger}</span>
                      </div>
                      <span className="text-xs">⚡</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: SEO Tags */}
              {activeRightTab === 'seo' && (
                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase text-slate-400">SEO & Open Graph Headers</div>
                  
                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-1">Page Title Tag</label>
                    <input 
                      type="text" 
                      defaultValue={`${projectState.businessName} - High Performance AI Website`}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none" 
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 block mb-1">Meta Description</label>
                    <textarea 
                      defaultValue={projectState.description}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none" 
                    />
                  </div>

                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-[9px] font-black text-cyan-400 block mb-1">Structured Schema Markup</span>
                    <p className="text-[8px] text-slate-400 leading-snug">Auto-generates Google JSON-LD schema headers matching Category: {projectState.category}.</p>
                  </div>
                </div>
              )}

            </div>
          </aside>
        )}

      </div>

      {/* BIDIRECTIONAL CODE EDITOR DRAWER */}
      {showCodeEditor && (
        <div className="h-96 border-t border-white/10 bg-[#0c091f]/95 backdrop-blur-md flex flex-col z-30">
          <div className="h-10 px-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-300">Live Code Sync Console (Simulated Monaco Compiler)</span>
              
              <div className="flex gap-2">
                {['react', 'html'].map(lang => (
                  <button 
                    key={lang}
                    onClick={() => setEditorLang(lang)}
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded transition ${
                      editorLang === lang ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                toast.success('Applied changes from code editor to live canvas!');
                setShowCodeEditor(false);
              }}
              className="px-3 py-1 bg-cyan-500 text-slate-900 text-[10px] font-black rounded-lg transition"
            >
              Apply Code Changes
            </button>
          </div>

          <div className="flex-1 font-mono text-xs p-4 overflow-y-auto bg-black/40 text-cyan-300/80 leading-relaxed text-left">
            <pre className="whitespace-pre-wrap">{editedCode}</pre>
          </div>
        </div>
      )}

      {/* FLOATING AI ASSISTANT CHAT PANEL */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative group">
          
          {/* Main Floating Button */}
          <button 
            onClick={() => {
              const el = document.getElementById('friday-chat-panel');
              if (el) el.classList.toggle('hidden');
            }}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-slate-900 flex items-center justify-center font-bold text-xl shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition"
          >
            💬
          </button>

          {/* Chat Assistant Panel */}
          <div 
            id="friday-chat-panel"
            className="absolute bottom-16 right-0 w-80 bg-[#120e2a]/95 border border-purple-500/20 rounded-2xl shadow-2xl hidden flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white/5 p-3 px-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="animate-pulse text-purple-400">●</span>
                <span className="text-xs font-black text-slate-200">Friday AI Assistant</span>
              </div>
              <button 
                onClick={() => document.getElementById('friday-chat-panel')?.classList.add('hidden')}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            {/* Message History */}
            <div className="h-64 p-3 overflow-y-auto space-y-2 text-left">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`p-2.5 rounded-xl max-w-[85%] text-[11px] leading-relaxed ${
                    msg.role === 'assistant' ? 'bg-white/5 text-slate-200' : 'bg-purple-600/30 text-purple-200 ml-auto'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleChatSubmit} className="p-2 bg-white/5 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask Friday (e.g. add pricing block)..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-black/30 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none" 
              />
              <button 
                type="submit"
                className="p-1.5 bg-cyan-500 hover:opacity-90 rounded-lg text-slate-900 transition"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ONE-CLICK DEPLOYMENT MODAL */}
      <AnimatePresence>
        {showDeployModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-lg bg-[#120e2a]/95 border border-purple-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>🚀</span> Launch Production Deployment
                </h3>
                <button onClick={() => setShowDeployModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="flex gap-3 mb-4">
                {['Vercel', 'Netlify', 'Cloudflare'].map(target => (
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

              {/* Logs Console Container */}
              <div className="bg-black/60 rounded-xl p-4 h-48 overflow-y-auto font-mono text-[10px] text-cyan-400/90 space-y-1.5 text-left border border-white/5 mb-4">
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
                  Close Console
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

    </div>
  );
}

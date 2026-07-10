import React, { useState, useEffect, useRef } from 'react';
import './LearningTimeline.css';

// Milestones database (Interconnected nodes across Timeline, Graph, and Universe)
const MILESTONES = [
  {
    id: 'relativity',
    year: 1905,
    title: 'Theory of Relativity',
    category: 'Physics',
    difficulty: 'Hard',
    scientists: 'Albert Einstein',
    company: 'Swiss Patent Office',
    country: 'Switzerland',
    description: 'Albert Einstein published his Special Theory of Relativity, introducing the concept that space and time are linked and speed of light is constant.',
    aiExplanation: 'Special Relativity shook classical physics by proving that time dilates and lengths contract relative to the observer speed. Its formula E=mc² showed that energy and mass are interchangeable, opening the nuclear age and cosmic understandings.',
    citationCount: 452900,
    influenceScore: 99,
    popularityScore: 98,
    historicalImpact: 'Shifted the absolute Newtonian framework to space-time continuum.',
    quiz: {
      question: "According to Special Relativity, what remains constant for all observers?",
      options: [
        "The passage of time",
        "The speed of light in a vacuum",
        "The length of an object",
        "Gravitational acceleration"
      ],
      answerIndex: 1
    },
    pos3d: { x: -120, y: 80, z: 250 },
    graphPos: { x: 100, y: 80 },
    connections: [
      { target: 'quantum', type: 'Inspired' },
      { target: 'gps', type: 'Built Upon' }
    ],
    dependsOn: ['Newtonian Mechanics'],
    futureTrend: 'Quantum gravity unification experiments',
    career: 'Cosmologist, Quantum Physicist, Particle Accelerator Engineer'
  },
  {
    id: 'eniac',
    year: 1945,
    title: 'ENIAC General Computer',
    category: 'Technology',
    difficulty: 'Medium',
    scientists: 'J. Presper Eckert, John Mauchly',
    company: 'University of Pennsylvania',
    country: 'United States',
    description: 'The Electronic Numerical Integrator and Computer was completed, representing the first programmable, electronic, general-purpose digital computer.',
    aiExplanation: 'Before ENIAC, "computers" were humans who calculated artillery tables. Using 18,000 vacuum tubes, ENIAC could perform 5,000 additions per second, operating purely electronically without gears, initiating the computer age.',
    citationCount: 125400,
    influenceScore: 95,
    popularityScore: 89,
    historicalImpact: 'Demonstrated massive scale electronic computation viability.',
    quiz: {
      question: "What hardware component was primarily used for computation logic in ENIAC?",
      options: [
        "Microprocessors",
        "Transistors",
        "Vacuum Tubes",
        "Magnetic Core Memory"
      ],
      answerIndex: 2
    },
    pos3d: { x: 50, y: -40, z: 180 },
    graphPos: { x: 280, y: 150 },
    connections: [
      { target: 'transistor', type: 'Succeeded By' },
      { target: 'www', type: 'Inspired' }
    ],
    dependsOn: ['Analytical Engine'],
    futureTrend: 'Supercomputing grids',
    career: 'Hardware Design Engineer, High-Performance Computing Developer'
  },
  {
    id: 'transistor',
    year: 1947,
    title: 'Invention of the Transistor',
    category: 'Technology',
    difficulty: 'Medium',
    scientists: 'John Bardeen, Walter Brattain, William Shockley',
    company: 'Bell Labs',
    country: 'United States',
    description: 'The creation of the solid-state point-contact transistor at Bell Labs revolutionized electronic amplification and digital logic gating.',
    aiExplanation: 'By replacing fragile and power-hungry vacuum tubes with miniature solid-state semiconductors, the transistor allowed the scaling of computers. It is the core building block of all modern microprocessors and integrated circuit networks.',
    citationCount: 389000,
    influenceScore: 98,
    popularityScore: 95,
    historicalImpact: 'Began the Silicon Age and the semiconductor scaling timeline.',
    quiz: {
      question: "Which laboratory did Bardeen, Brattain, and Shockley work at when they invented the transistor?",
      options: [
        "IBM Research",
        "Bell Laboratories",
        "MIT Lincoln Lab",
        "Intel Labs"
      ],
      answerIndex: 1
    },
    pos3d: { x: 120, y: 20, z: 120 },
    graphPos: { x: 420, y: 80 },
    connections: [
      { target: 'www', type: 'Inspired' },
      { target: 'gpt3', type: 'Enabled' }
    ],
    dependsOn: ['Quantum Theory', 'ENIAC'],
    futureTrend: '2nm gate-all-around nanosheet architectures',
    career: 'Semiconductor Fabrication Scientist, VLSI Design Engineer'
  },
  {
    id: 'dna',
    year: 1953,
    title: 'DNA Double Helix Structure',
    category: 'Biology',
    difficulty: 'Hard',
    scientists: 'James Watson, Francis Crick, Rosalind Franklin',
    company: 'Cavendish Laboratory',
    country: 'United Kingdom',
    description: 'Watson and Crick published the double-helix chemical structure of DNA, building on crucial X-ray diffraction images captured by Rosalind Franklin.',
    aiExplanation: 'The double-helix molecular model unlocked the biochemical code of heredity. It immediately explained how genetic materials replicate (base-pairing rule) and encode instructions for building proteins in all organic cells.',
    citationCount: 512000,
    influenceScore: 97,
    popularityScore: 96,
    historicalImpact: 'Began molecular genetics and synthetic biology industries.',
    quiz: {
      question: "Whose critical X-ray diffraction photograph (Photo 51) was pivotal in solving the DNA double helix structure?",
      options: [
        "James Watson",
        "Rosalind Franklin",
        "Francis Crick",
        "Maurice Wilkins"
      ],
      answerIndex: 1
    },
    pos3d: { x: -80, y: -90, z: 140 },
    graphPos: { x: 220, y: 280 },
    connections: [
      { target: 'crispr', type: 'Inspired' }
    ],
    dependsOn: ['Organic Chemistry', 'X-ray Crystallography'],
    futureTrend: 'DNA data storage networks',
    career: 'Bioinformatics Analyst, Genomics Researcher, Molecular Biologist'
  },
  {
    id: 'www',
    year: 1989,
    title: 'World Wide Web Proposal',
    category: 'Technology',
    difficulty: 'Medium',
    scientists: 'Tim Berners-Lee',
    company: 'CERN',
    country: 'Switzerland',
    description: 'Tim Berners-Lee wrote a proposal for information management, establishing HTML, HTTP, URLs, and the basic architecture of the web.',
    aiExplanation: 'Berners-Lee combined hypertext with internet protocols. By making documents linkable globally across a decentralized network, it turned the military-academic internet into a global, accessible information space.',
    citationCount: 310400,
    influenceScore: 96,
    popularityScore: 99,
    historicalImpact: 'Connected humanity, spawning the digital economy and internet media.',
    quiz: {
      question: "What scientific research center did Tim Berners-Lee work at when proposing the Web?",
      options: [
        "MIT CSAIL",
        "DARPA Labs",
        "CERN (European Organization for Nuclear Research)",
        "Stanford Research Institute"
      ],
      answerIndex: 2
    },
    pos3d: { x: 220, y: -20, z: 60 },
    graphPos: { x: 550, y: 220 },
    connections: [
      { target: 'gpt3', type: 'Inspired' }
    ],
    dependsOn: ['ARPANET', 'DNS Protocol'],
    futureTrend: 'Decentralized Web 3.0 protocol clusters',
    career: 'Full-Stack Developer, Network Architect, Cloud Infrastructure Specialist'
  },
  {
    id: 'crispr',
    year: 2012,
    title: 'CRISPR Gene Editing Tool',
    category: 'Biology',
    difficulty: 'Hard',
    scientists: 'Jennifer Doudna, Emmanuelle Charpentier',
    company: 'UC Berkeley / Umeå University',
    country: 'Global',
    description: 'Doudna and Charpentier programmed CRISPR-Cas9 as a highly flexible, precision editing tool to slice and modify targeted DNA sequences.',
    aiExplanation: 'Leveraging a bacterial defense mechanism, CRISPR utilizes a guide RNA to locate specific coordinates in genetic strands and the Cas9 enzyme to excise or replace code. It transformed genome editing from an expensive struggle to a precise script.',
    citationCount: 88500,
    influenceScore: 94,
    popularityScore: 92,
    historicalImpact: 'Granted humans absolute write-access control over genetic genomes.',
    quiz: {
      question: "CRISPR-Cas9 gene editing was adapted from which biological system?",
      options: [
        "A viral replication pathway",
        "A bacterial immune defense system against viruses",
        "A eukaryotic protein folding mechanism",
        "A mitochondrial transcription cycle"
      ],
      answerIndex: 1
    },
    pos3d: { x: -160, y: -120, z: 40 },
    graphPos: { x: 380, y: 340 },
    connections: [
      { target: 'dna', type: 'Built Upon' }
    ],
    dependsOn: ['DNA structure', 'Bacterial genome indexing'],
    futureTrend: 'In-vivo epigenetic genetic corrections',
    career: 'Gene Therapy Technician, Bio-ethics Advisor, Genetic Counselor'
  },
  {
    id: 'gpt3',
    year: 2020,
    title: 'GPT-3 Language Model Release',
    category: 'AI',
    difficulty: 'Hard',
    scientists: 'OpenAI Research Team',
    company: 'OpenAI',
    country: 'United States',
    description: 'OpenAI introduced GPT-3, a 175-billion parameter autoregressive language model showcasing emergency few-shot learning capabilities.',
    aiExplanation: 'GPT-3 proved that scaling simple autoregressive language model parameters produces emergent capabilities (reasoning, coding, summarization) without explicit task tuning. It accelerated research in Generative AI and AI agents.',
    citationCount: 62000,
    influenceScore: 92,
    popularityScore: 97,
    historicalImpact: 'Initiated the generative agentic AI coding revolution.',
    quiz: {
      question: "How many training parameters did the GPT-3 language model contain?",
      options: [
        "1.5 Billion",
        "17.5 Billion",
        "175 Billion",
        "1.75 Trillion"
      ],
      answerIndex: 2
    },
    pos3d: { x: 320, y: 120, z: -40 },
    graphPos: { x: 680, y: 130 },
    connections: [
      { target: 'www', type: 'Built Upon' },
      { target: 'transistor', type: 'Depends On' }
    ],
    dependsOn: ['Transformer Architecture', 'Internet Web Datasets'],
    futureTrend: 'Autonomous general intelligence systems',
    career: 'Machine Learning Research Engineer, Prompt Architect, NLP Specialist'
  }
];

export default function LearningTimeline() {
  const [activeMode, setActiveMode] = useState('timeline'); // 'timeline', 'graph', 'universe'
  const [selectedId, setSelectedId] = useState('relativity');
  const [timelineLayout, setTimelineLayout] = useState('horizontal'); // 'horizontal', 'vertical'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);

  // Notes state
  const [notesText, setNotesText] = useState("");
  const [showNotesPopup, setShowNotesPopup] = useState(false);
  const [savedNotes, setSavedNotes] = useState({});

  // TTS state
  const [isNarrating, setIsNarrating] = useState(false);

  // Friday AI Chat Integration
  const [fridayMessages, setFridayMessages] = useState([
    { role: 'ai', text: "👋 I'm Friday, your AI navigator! Choose a milestone, explore the 3D Universe or ask me relationship questions like 'Explain like a beginner' or 'What depends on this?'" }
  ]);
  const [fridayInput, setFridayInput] = useState('');

  // Selected Milestone Data
  const currentItem = MILESTONES.find(m => m.id === selectedId) || MILESTONES[0];

  // Auto-save notes helper
  useEffect(() => {
    setNotesText(savedNotes[selectedId] || "");
  }, [selectedId, savedNotes]);

  // Sync camera targets on selection inside Universe Canvas
  const [targetCamPos, setTargetCamPos] = useState({ x: 0, y: 0, z: 500 });
  useEffect(() => {
    if (currentItem) {
      // Zoom into target planet, offset slightly for perspective
      setTargetCamPos({
        x: currentItem.pos3d.x,
        y: currentItem.pos3d.y,
        z: currentItem.pos3d.z + 140
      });
    }
  }, [selectedId]);

  // ==========================================
  // SPEECH UTILITIES (TTS)
  // ==========================================
  const toggleNarration = () => {
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    } else {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentItem.description);
      utterance.onstart = () => setIsNarrating(true);
      utterance.onend = () => setIsNarrating(false);
      utterance.onerror = () => setIsNarrating(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    // stop talking when switching selected item
    window.speechSynthesis?.cancel();
    setIsNarrating(false);
  }, [selectedId]);

  // ==========================================
  // UNIVERSE CANVAS VIEWPORT (WebGL/3D Simulation)
  // ==========================================
  const canvasRef = useRef(null);
  const camPosRef = useRef({ x: 0, y: 0, z: 600 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const orbitAngleRef = useRef({ alpha: 0, beta: 0 });

  useEffect(() => {
    if (activeMode !== 'universe') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId = null;

    // Build random background stars
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800,
        color: Math.random() > 0.8 ? '#06b6d4' : '#ffffff'
      });
    }

    const renderLoop = () => {
      // Handle camera lerping towards targets
      camPosRef.current.x += (targetCamPos.x - camPosRef.current.x) * 0.08;
      camPosRef.current.y += (targetCamPos.y - camPosRef.current.y) * 0.08;
      camPosRef.current.z += (targetCamPos.z - camPosRef.current.z) * 0.08;

      // Clear viewport
      ctx.fillStyle = '#010204';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create glowing space background
      const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width * 0.8);
      grad.addColorStop(0, '#090b14');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const fov = 400 * zoomLevel;
      const cX = canvas.width / 2;
      const cY = canvas.height / 2;

      // Rotate stars & nodes slightly relative to orbit drag
      const cosA = Math.cos(orbitAngleRef.current.alpha);
      const sinA = Math.sin(orbitAngleRef.current.alpha);
      const cosB = Math.cos(orbitAngleRef.current.beta);
      const sinB = Math.sin(orbitAngleRef.current.beta);

      // Helper 3D rotation projection
      const project = (x, y, z) => {
        // Rotate around Y-axis (alpha)
        let x1 = x * cosA - z * sinA;
        let z1 = x * sinA + z * cosA;

        // Rotate around X-axis (beta)
        let y2 = y * cosB - z1 * sinB;
        let z2 = y * sinB + z1 * cosB;

        // Relative to cam
        let rx = x1 - camPosRef.current.x;
        let ry = y2 - camPosRef.current.y;
        let rz = z2 - camPosRef.current.z;

        // Perspective divide
        if (rz >= 0) rz = 1; // clip behind camera
        const scale = fov / Math.abs(rz);
        return {
          x: cX + rx * scale,
          y: cY + ry * scale,
          depth: rz
        };
      };

      // Draw background stars
      stars.forEach(star => {
        const proj = project(star.x, star.y, star.z);
        if (proj.x >= 0 && proj.x <= canvas.width && proj.y >= 0 && proj.y <= canvas.height) {
          ctx.fillStyle = star.color;
          ctx.fillRect(proj.x, proj.y, 1.5, 1.5);
        }
      });

      // Draw Nebula dust clouds (static mockup glow behind planets)
      ctx.fillStyle = 'rgba(139, 92, 246, 0.03)';
      ctx.beginPath();
      ctx.arc(cX, cY, 150, 0, Math.PI * 2);
      ctx.fill();

      // Draw Constellation Lines connecting milestones
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1.5;
      MILESTONES.forEach(m => {
        const p1 = project(m.pos3d.x, m.pos3d.y, m.pos3d.z);
        m.connections.forEach(conn => {
          const targetNode = MILESTONES.find(t => t.id === conn.target);
          if (targetNode) {
            const p2 = project(targetNode.pos3d.x, targetNode.pos3d.y, targetNode.pos3d.z);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      // Draw planet/discoveries
      MILESTONES.forEach(m => {
        const proj = project(m.pos3d.x, m.pos3d.y, m.pos3d.z);
        const distanceToCam = Math.sqrt(
          Math.pow(m.pos3d.x - camPosRef.current.x, 2) +
          Math.pow(m.pos3d.y - camPosRef.current.y, 2) +
          Math.pow(m.pos3d.z - camPosRef.current.z, 2)
        );

        // Size adapts based on perspective distance
        const baseRadius = m.id === 'relativity' ? 18 : 12;
        const rad = Math.max(2, (baseRadius * fov) / distanceToCam);

        // Drawing Planet glow
        const glowRad = rad * 2.2;
        const planetGlow = ctx.createRadialGradient(proj.x, proj.y, rad * 0.5, proj.x, proj.y, glowRad);
        
        const colorBase = m.category === 'Physics' ? '139, 92, 246' : m.category === 'AI' ? '239, 68, 68' : '6, 182, 212';
        planetGlow.addColorStop(0, `rgba(${colorBase}, 1)`);
        planetGlow.addColorStop(0.3, `rgba(${colorBase}, 0.5)`);
        planetGlow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = planetGlow;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Planet core
        ctx.fillStyle = m.id === selectedId ? '#ffffff' : `rgb(${colorBase})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, rad, 0, Math.PI * 2);
        ctx.fill();

        // Circle ring border for selected node
        if (m.id === selectedId) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, rad + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw text labels
        ctx.fillStyle = '#fff';
        ctx.font = '10px Space Grotesk';
        ctx.fillText(`${m.year}: ${m.title}`, proj.x + rad + 8, proj.y + 3);
      });

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Responsive Canvas Resize
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [activeMode, selectedId, targetCamPos, zoomLevel]);

  // Click Canvas to Select Closest Discovery
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const fov = 400 * zoomLevel;
    const cX = canvas.width / 2;
    const cY = canvas.height / 2;

    const cosA = Math.cos(orbitAngleRef.current.alpha);
    const sinA = Math.sin(orbitAngleRef.current.alpha);
    const cosB = Math.cos(orbitAngleRef.current.beta);
    const sinB = Math.sin(orbitAngleRef.current.beta);

    let closestNodeId = null;
    let minDistance = 30; // click threshold radius

    MILESTONES.forEach(m => {
      let x1 = m.pos3d.x * cosA - m.pos3d.z * sinA;
      let z1 = m.pos3d.x * sinA + m.pos3d.z * cosA;
      let y2 = m.pos3d.y * cosB - z1 * sinB;
      let z2 = m.pos3d.y * sinB + z1 * cosB;

      let rx = x1 - camPosRef.current.x;
      let ry = y2 - camPosRef.current.y;
      let rz = z2 - camPosRef.current.z;

      if (rz >= 0) rz = 1;
      const scale = fov / Math.abs(rz);
      const px = cX + rx * scale;
      const py = cY + ry * scale;

      const dist = Math.sqrt(Math.pow(clickX - px, 2) + Math.pow(clickY - py, 2));
      if (dist < minDistance) {
        minDistance = dist;
        closestNodeId = m.id;
      }
    });

    if (closestNodeId) {
      setSelectedId(closestNodeId);
    }
  };

  // Drag mouse to orbit camera
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    orbitAngleRef.current.alpha += dx * 0.005;
    orbitAngleRef.current.beta += dy * 0.005;

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // ==========================================
  // MODE 2: KNOWLEDGE GRAPH SVG DRAG AND LINK
  // ==========================================
  const [graphNodes, setGraphNodes] = useState(MILESTONES);
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  const startNodeDrag = (id, e) => {
    e.stopPropagation();
    setDraggingNodeId(id);
    setSelectedId(id);
  };

  const handleNodeDrag = (e) => {
    if (!draggingNodeId) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // Convert client coordinates to SVG viewport bounds
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setGraphNodes(nodes => nodes.map(n => {
      if (n.id === draggingNodeId) {
        return {
          ...n,
          graphPos: { x, y }
        };
      }
      return n;
    }));
  };

  const stopNodeDrag = () => {
    setDraggingNodeId(null);
  };

  // ==========================================
  // SEARCH & FILTERS
  // ==========================================
  const filteredMilestones = MILESTONES.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.scientists.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // ==========================================
  // FRIDAY AI EXPLORATION DISCOVERY TRIGGERS
  // ==========================================
  const askFridayQuestion = (qType) => {
    let reply = "";
    if (qType === 'importance') {
      reply = `**Why is "${currentItem.title}" important?**\n${currentItem.aiExplanation}\n\n*Historical Impact: ${currentItem.historicalImpact}*`;
    } else if (qType === 'inventor') {
      reply = `**Who invented "${currentItem.title}"?**\nCreated by **${currentItem.scientists}** at **${currentItem.company}** (${currentItem.country}).`;
    } else if (qType === 'before') {
      reply = `**What happened before "${currentItem.title}"?**\nIt built directly upon **${currentItem.dependsOn.join(', ')}**. This dependency laid the conceptual frameworks.`;
    } else if (qType === 'dependencies') {
      reply = `**What technologies depend on "${currentItem.title}"?**\nEssential components inspired include: ${currentItem.connections.map(c => c.target).join(', ')}.`;
    } else if (qType === 'beginner') {
      reply = `**Explain "${currentItem.title}" like a beginner:**\nImagine you are building a house. ${currentItem.title === 'Invention of the Transistor' ? "Instead of switching massive water valves manually, the transistor is a tiny water faucet helper that controls currents electronically in nanoseconds!" : "This discovery operates like a global library index where every book instantly connects with page reference ropes."}`;
    }

    setFridayMessages(prev => [
      { role: 'user', text: `Explain: ${qType}` },
      { role: 'ai', text: reply },
      ...prev
    ]);
  };

  const sendFridayChat = () => {
    if (!fridayInput.trim()) return;
    const msg = fridayInput.trim();
    setFridayInput('');

    let aiAnswer = `I navigated the universe structure for your query. Timelines indicate "${currentItem.title}" represents a major node in ${currentItem.category}. Ask me to explain it to a beginner or list its ancestor dependencies!`;
    
    // Simple mock NLP matcher
    if (msg.toLowerCase().includes('invent') || msg.toLowerCase().includes('who')) {
      aiAnswer = `**Invention Context:** Created by **${currentItem.scientists}** at **${currentItem.company}** (Year: ${currentItem.year}).`;
    } else if (msg.toLowerCase().includes('beginner')) {
      aiAnswer = `Let's explain it simply: ${currentItem.description} Think of it like a puzzle piece unlocking the next century.`;
    }

    setFridayMessages(prev => [
      { role: 'user', text: msg },
      { role: 'ai', text: aiAnswer },
      ...prev
    ]);
  };

  // ==========================================
  // NOTE TAKING
  // ==========================================
  const saveNotes = () => {
    setSavedNotes(prev => ({
      ...prev,
      [selectedId]: notesText
    }));
    setShowNotesPopup(false);
  };

  // ==========================================
  // RENDER COMPONENT
  // ==========================================
  return (
    <div className="lt-container">
      {/* Immersive Top Experience Bar */}
      <div className="lt-topbar">
        <div className="lt-brand">
          <span>⏳</span>
          <span>AI Learning Timeline Exploration Engine</span>
        </div>

        {/* Seamless view switcher (Timeline, Graph, Universe) */}
        <div className="lt-mode-tabs">
          <button className={`lt-mode-btn ${activeMode === 'timeline' ? 'active' : ''}`} onClick={() => setActiveMode('timeline')}>
            📅 Chronological Timeline
          </button>
          <button className={`lt-mode-btn ${activeMode === 'graph' ? 'active' : ''}`} onClick={() => setActiveMode('graph')}>
            🌐 Knowledge Graph Link
          </button>
          <button className={`lt-mode-btn ${activeMode === 'universe' ? 'active' : ''}`} onClick={() => setActiveMode('universe')}>
            🌌 Immersive Universe
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="ecc-btn ecc-btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setShowNotesPopup(true)}>
            ✏️ Notes {savedNotes[selectedId] ? "✓" : ""}
          </button>
          <button className="ecc-btn ecc-btn-primary" style={{ fontSize: '0.75rem' }} onClick={() => setActiveQuiz(currentItem.quiz)}>
            🧪 Test Quiz
          </button>
        </div>
      </div>

      {/* Timeline Filter Controls */}
      <div className="lt-filter-bar">
        <input 
          type="text" 
          className="lt-filter-input" 
          placeholder="Search timeline..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select className="lt-filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Physics">Physics</option>
          <option value="Biology">Biology</option>
          <option value="AI">AI</option>
        </select>

        {activeMode === 'timeline' && (
          <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
            <button className={`lt-mode-btn ${timelineLayout === 'horizontal' ? 'active' : ''}`} onClick={() => setTimelineLayout('horizontal')}>
              Horizontal Path
            </button>
            <button className={`lt-mode-btn ${timelineLayout === 'vertical' ? 'active' : ''}`} onClick={() => setTimelineLayout('vertical')}>
              Vertical Stack
            </button>
            <button className="lt-mode-btn" onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))}>Zoom -</button>
            <button className="lt-mode-btn" onClick={() => setZoomLevel(z => Math.min(2, z + 0.25))}>Zoom +</button>
          </div>
        )}

        {activeMode === 'universe' && (
          <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto', alignItems: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--hub-text-muted)' }}>Universe Zoom:</span>
            <input 
              type="range" 
              min="0.5" 
              max="2.5" 
              step="0.1" 
              value={zoomLevel} 
              onChange={(e) => setZoomLevel(parseFloat(e.target.value))} 
              style={{ accentColor: 'var(--hub-cyan)', width: '80px', height: '4px' }}
            />
          </div>
        )}
      </div>

      {/* Main interactive area split between selected Mode viewport & Side Info panel */}
      <div className="lt-viewport-wrapper">
        
        <div className="lt-workspace">
          
          {/* ==========================================
              MODE 1: TIMELINE VIEW
              ========================================== */}
          {activeMode === 'timeline' && (
            <div className="timeline-view-wrap">
              {timelineLayout === 'horizontal' ? (
                <div className="timeline-h-container">
                  <div className="timeline-h-line" />
                  {filteredMilestones.map(m => (
                    <div 
                      key={m.id} 
                      className={`timeline-h-node ${selectedId === m.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(m.id)}
                    >
                      <span className="timeline-h-year">{m.year}</span>
                      <div className="timeline-h-dot" />
                      <span className="timeline-h-title">{m.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="timeline-v-container">
                  <div className="timeline-v-line" />
                  {filteredMilestones.map(m => (
                    <div 
                      key={m.id} 
                      className={`timeline-v-item ${selectedId === m.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(m.id)}
                    >
                      <div className="timeline-v-dot" />
                      <div className="timeline-v-card">
                        <span className="timeline-v-year">{m.year}</span>
                        <h4 className="timeline-v-title">{m.title}</h4>
                        <p className="timeline-v-desc">{m.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              MODE 2: KNOWLEDGE GRAPH VIEW (Interactive Bezier node networks)
              ========================================== */}
          {activeMode === 'graph' && (
            <div className="graph-view-wrap">
              <svg 
                className="graph-svg-canvas"
                onMouseMove={handleNodeDrag}
                onMouseUp={stopNodeDrag}
                onMouseLeave={stopNodeDrag}
              >
                {/* Connection paths */}
                {graphNodes.map(node => (
                  node.connections.map((conn, cIdx) => {
                    const targetNode = graphNodes.find(t => t.id === conn.target);
                    if (!targetNode) return null;
                    
                    // Draw bezier curves connecting coordinates
                    const x1 = node.graphPos.x;
                    const y1 = node.graphPos.y;
                    const x2 = targetNode.graphPos.x;
                    const y2 = targetNode.graphPos.y;
                    
                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2 - 20;

                    return (
                      <g key={`${node.id}-${conn.target}-${cIdx}`}>
                        <path
                          d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                          fill="none"
                          stroke={selectedId === node.id || selectedId === targetNode.id ? 'var(--hub-cyan)' : 'rgba(255,255,255,0.08)'}
                          strokeWidth={selectedId === node.id || selectedId === targetNode.id ? '2' : '1.2'}
                          className="graph-link-line"
                        />
                        <text
                          x={midX}
                          y={midY - 5}
                          fill="var(--hub-text-muted)"
                          fontSize="7"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {conn.type}
                        </text>
                      </g>
                    );
                  })
                ))}

                {/* Node groups */}
                {graphNodes.map(node => (
                  <g
                    key={node.id}
                    transform={`translate(${node.graphPos.x}, ${node.graphPos.y})`}
                    className={`graph-node ${selectedId === node.id ? 'selected' : ''}`}
                    onMouseDown={(e) => startNodeDrag(node.id, e)}
                  >
                    <circle
                      r="16"
                      fill={node.id === selectedId ? 'var(--hub-cyan)' : node.category === 'Physics' ? 'var(--hub-primary)' : 'rgba(31, 41, 55, 0.9)'}
                      className="graph-node-circle"
                    />
                    
                    <rect
                      x="-50"
                      y="22"
                      width="100"
                      height="16"
                      className="graph-node-label-bg"
                    />
                    <text
                      y="32"
                      className="graph-node-text"
                    >
                      {node.title.substring(0, 15)}...
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}

          {/* ==========================================
              MODE 3: IMMERSIVE 3D UNIVERSE
              ========================================== */}
          {activeMode === 'universe' && (
            <div className="universe-view-wrap">
              <div className="universe-instructions">
                🌌 Click and drag space to orbit camera • Mousewheel to zoom
              </div>

              <canvas
                ref={canvasRef}
                className="universe-canvas"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
              />

              <div className="universe-overlay-hud">
                <strong>Camera Coordinate:</strong>
                <span>X: {Math.round(camPosRef.current.x)} | Y: {Math.round(camPosRef.current.y)} | Z: {Math.round(camPosRef.current.z)}</span>
                <strong>Orbit Target:</strong>
                <span>Planet: {currentItem.title}</span>
              </div>
            </div>
          )}

        </div>

        {/* Selected milestone metadata & Friday AI companion */}
        <div className="lt-details-sidebar">
          <div className="details-header">
            <span className="details-header-year">{currentItem.year}</span>
            <h2 className="details-header-title">{currentItem.title}</h2>
          </div>

          <div className="details-section">
            <p className="details-desc-text">{currentItem.description}</p>
            <div style={{ marginTop: '0.75rem' }}>
              <button className="ecc-btn ecc-btn-secondary" style={{ fontSize: '0.75rem', width: '100%' }} onClick={toggleNarration}>
                {isNarrating ? "🔇 Stop Narration" : "🔊 Speak Discovery"}
              </button>
            </div>
          </div>

          <div className="details-section">
            <div className="details-section-title">Discovery Meta</div>
            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div><strong>Scientists:</strong> {currentItem.scientists}</div>
              <div><strong>Filiation:</strong> {currentItem.company} ({currentItem.country})</div>
              <div><strong>Bloom Taxonomy Level:</strong> {currentItem.id === 'relativity' ? 'Understanding' : 'Applying'}</div>
            </div>
          </div>

          <div className="details-section">
            <div className="details-section-title">Connected Dependencies</div>
            <div className="tag-list">
              {currentItem.dependsOn.map(dep => (
                <span key={dep} className="detail-tag">📖 {dep}</span>
              ))}
            </div>
          </div>

          <div className="details-section">
            <div className="details-section-title">AI Impact Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--hub-text-muted)' }}>Citations</span>
                <div style={{ fontWeight: 'bold' }}>{currentItem.citationCount.toLocaleString()}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '4px' }}>
                <span style={{ color: 'var(--hub-text-muted)' }}>Influence Score</span>
                <div style={{ fontWeight: 'bold' }}>{currentItem.influenceScore}%</div>
              </div>
            </div>
          </div>

          {/* Friday AI Chat integration */}
          <div className="lt-friday-box">
            <div className="lt-friday-header">
              <span>🤖</span>
              <strong style={{ fontSize: '0.8rem' }}>Friday AI Navigator</strong>
            </div>

            <div className="lt-friday-prompts">
              <span className="lt-prompt-chip" onClick={() => askFridayQuestion('importance')}>Why is this important?</span>
              <span className="lt-prompt-chip" onClick={() => askFridayQuestion('inventor')}>Who invented it?</span>
              <span className="lt-prompt-chip" onClick={() => askFridayQuestion('before')}>What was before?</span>
              <span className="lt-prompt-chip" onClick={() => askFridayQuestion('dependencies')}>What depends on it?</span>
              <span className="lt-prompt-chip" onClick={() => askFridayQuestion('beginner')}>Explain for beginner</span>
            </div>

            <div className="lt-friday-messages">
              {fridayMessages.map((m, idx) => (
                <div key={idx} className={`lt-msg-bubble ${m.role}`}>
                  <strong>{m.role === 'ai' ? 'Friday: ' : 'You: '}</strong>
                  <div style={{ whiteSpace: 'pre-wrap', marginTop: '0.2rem' }}>{m.text}</div>
                </div>
              ))}
            </div>

            <div className="lt-friday-inputs">
              <input 
                type="text" 
                className="lt-friday-input" 
                placeholder="Ask Friday a connection question..." 
                value={fridayInput}
                onChange={(e) => setFridayInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendFridayChat()}
              />
              <button className="ecc-btn ecc-btn-primary" style={{ padding: '0.3rem 0.85rem' }} onClick={sendFridayChat}>
                Send
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ==========================================
          QUIZ ASSESSMENT MODAL POPUP
          ========================================== */}
      {activeQuiz && (
        <div className="lt-modal-overlay">
          <div className="lt-modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="lt-modal-title" style={{ margin: 0 }}>🧪 Dynamic Assessment Quiz</h3>
              <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => {
                setActiveQuiz(null);
                setSelectedQuizOption(null);
                setQuizChecked(false);
              }}>✕</button>
            </div>
            
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.4 }}>{activeQuiz.question}</p>
            
            {activeQuiz.options.map((opt, idx) => {
              let optClass = "";
              if (quizChecked) {
                if (idx === activeQuiz.answerIndex) optClass = "correct";
                else if (selectedQuizOption === idx) optClass = "incorrect";
              }
              return (
                <button
                  key={idx}
                  className={`lt-quiz-option ${optClass}`}
                  onClick={() => !quizChecked && setSelectedQuizOption(idx)}
                  style={{
                    borderColor: selectedQuizOption === idx && !quizChecked ? 'var(--hub-cyan)' : 'rgba(255,255,255,0.06)',
                    background: selectedQuizOption === idx && !quizChecked ? 'rgba(6, 182, 212, 0.08)' : ''
                  }}
                >
                  {opt}
                </button>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.5rem' }}>
              {!quizChecked ? (
                <button 
                  className="ecc-btn ecc-btn-primary" 
                  onClick={() => setQuizChecked(true)}
                  disabled={selectedQuizOption === null}
                >
                  Check Answer
                </button>
              ) : (
                <button 
                  className="ecc-btn ecc-btn-secondary" 
                  onClick={() => {
                    setActiveQuiz(null);
                    setSelectedQuizOption(null);
                    setQuizChecked(false);
                  }}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          NOTES MODAL POPUP
          ========================================== */}
      {showNotesPopup && (
        <div className="lt-modal-overlay">
          <div className="lt-modal-box">
            <h3 className="lt-modal-title">✏️ Take Notes: {currentItem.title}</h3>
            <textarea
              className="copilot-textarea"
              style={{ width: '100%', minHeight: '120px', fontSize: '0.8rem', color: '#fff', marginBottom: '1rem' }}
              placeholder="Write your research notes, annotations, or summaries for this discovery..."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="ecc-btn ecc-btn-secondary" onClick={() => setShowNotesPopup(false)}>
                Cancel
              </button>
              <button className="ecc-btn ecc-btn-primary" onClick={saveNotes}>
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

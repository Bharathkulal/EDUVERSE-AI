import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Mic, MicOff, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, 
  HelpCircle, BookOpen, Layers, Volume2, Sparkles, Languages, Check, ArrowRight,
  Play, Pause, Award, HelpCircle as QuestionIcon, Cpu as CpuIcon, Network, HardDrive,
  Compass, History, Heart, Star, Sliders, RefreshCw, Scissors, PenTool, Layout
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================================
// 3D PROCEDURAL GEOMETRY GENERATORS (No external files needed, loads instantly)
// ============================================================================

// Helper to create a 3D box (cube)
const makeBox = (w, h, d, color, name, offset = [0, 0, 0], subparts = []) => {
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  const vertices = [
    [-hw, -hh, -hd], // 0
    [ hw, -hh, -hd], // 1
    [ hw,  hh, -hd], // 2
    [-hw,  hh, -hd], // 3
    [-hw, -hh,  hd], // 4
    [ hw, -hh,  hd], // 5
    [ hw,  hh,  hd], // 6
    [-hw,  hh,  hd]  // 7
  ];
  const faces = [
    { indices: [0, 1, 2, 3], normal: [0, 0, -1] }, // Front
    { indices: [1, 5, 6, 2], normal: [1, 0, 0] },  // Right
    { indices: [5, 4, 7, 6], normal: [0, 0, 1] },  // Back
    { indices: [4, 0, 3, 7], normal: [-1, 0, 0] }, // Left
    { indices: [3, 2, 6, 7], normal: [0, 1, 0] },  // Top
    { indices: [4, 5, 1, 0], normal: [0, -1, 0] }  // Bottom
  ];
  return { id: Math.random().toString(36), name, color, vertices, faces, offset, subparts };
};

// Helper to create a 3D cylinder/prism
const makeCylinder = (radius, height, segments, color, name, offset = [0, 0, 0]) => {
  const vertices = [];
  const faces = [];
  const hh = height / 2;

  // Bottom and Top center vertices
  const botCenterIdx = 0;
  const topCenterIdx = 1;
  vertices.push([0, -hh, 0]);
  vertices.push([0, hh, 0]);

  // Generate circle vertices
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    vertices.push([x, -hh, z]); // Bottom ring (index: 2 + i)
    vertices.push([x, hh, z]);  // Top ring (index: 2 + i + segments)
  }

  // Generate faces
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const b1 = 2 + i * 2;
    const b2 = 2 + next * 2;
    const t1 = 2 + i * 2 + 1;
    const t2 = 2 + next * 2 + 1;

    // Side faces (quads split into triangles or rendered as quads)
    faces.push({ indices: [b1, b2, t2, t1], normal: [Math.cos((i + 0.5) / segments * Math.PI * 2), 0, Math.sin((i + 0.5) / segments * Math.PI * 2)] });
    // Bottom cap
    faces.push({ indices: [botCenterIdx, b2, b1], normal: [0, -1, 0] });
    // Top cap
    faces.push({ indices: [topCenterIdx, t1, t2], normal: [0, 1, 0] });
  }

  return { id: Math.random().toString(36), name, color, vertices, faces, offset, subparts: [] };
};

// Procedural Models Library Database
const MODELS_DATA = {
  cpu: {
    name: 'Intel Core i9 CPU',
    category: 'hardware',
    synonyms: ['cpu', 'processor', 'intel cpu', 'amd cpu', 'core i9', 'lga socket', 'die'],
    description: 'Central Processing Unit - The primary microprocessor executing instructions.',
    specifications: '16 Cores, 24 Threads | Base Clock 3.2GHz | Max Turbo 5.2GHz | TDP 125W | Socket LGA1700',
    history: 'CPU architecture traces back to the Intel 4004 in 1971, evolving from simple calculators to complex multi-core nanometer chips today.',
    workingPrinciple: 'Operates on the Fetch-Decode-Execute cycle, fetching binary data from RAM, decoding instructions via the Control Unit, and computing operations through the Arithmetic Logic Unit (ALU).',
    internalStructure: 'Contains Silicon Die, cache layers (L1/L2/L3), Integrated Heat Spreader, and golden contact grid pads.',
    advantages: 'Highest serial performance, smart caching, scalable cores.',
    disadvantages: 'Generates significant heat, requires active cooling, high power draw.',
    repairGuide: 'Handle CPU strictly by the substrate edges. Clear thermal paste with Isopropyl alcohol, apply a pea-sized paste dot, and mount cooler firmly.',
    quiz: [
      { q: 'What is the function of the ALU inside the CPU?', o: ['Decode instructions', 'Perform arithmetic/logic operations', 'Hold intermediate variables', 'Regulate the system clock speed'], a: 1 },
      { q: 'Which Cache level is the fastest but smallest?', o: ['L1 Cache', 'L2 Cache', 'L3 Cache', 'System RAM'], a: 0 }
    ],
    parts: [
      { name: 'Heat Spreader (IHS)', desc: 'Copper nickel-plated shell diffusing heat from the silicon die to the external heatsink.' },
      { name: 'Silicon Core Die', desc: 'The actual semiconductor microchip containing billions of microscopic transistors.' },
      { name: 'Cache Memory (L3)', desc: 'Ultra-fast memory buffer layered on the die for swift instruction pipelines.' },
      { name: 'Substrate & Gold Pins', desc: 'PCB foundation carrying signals from motherboard socket pads via golden contacts.' }
    ],
    generate: () => [
      makeBox(12, 1, 12, '#38BDF8', 'PCB Substrate Base', [0, -1, 0]),
      makeBox(10, 1.2, 10, '#94A3B8', 'Heat Spreader (IHS)', [0, 0.8, 0]),
      makeBox(4, 0.4, 4, '#1E293B', 'Silicon Core Die', [0, 0, 0], ['Core', 'ALU', 'Decoder']),
      makeBox(3.5, 0.2, 3.5, '#F59E0B', 'L1/L2/L3 Cache Layer', [0, 0.3, 0]),
      makeBox(11.8, 0.1, 11.8, '#FBBF24', 'LGA Gold Contact Pins', [0, -1.1, 0])
    ]
  },
  ram: {
    name: 'DDR5 RGB RAM Module',
    category: 'hardware',
    synonyms: ['ram', 'memory', 'ddr5', 'ddr4', 'rgb ram', 'laptop ram', 'memory module'],
    description: 'Random Access Memory - Ultra-fast volatile memory module storing active code.',
    specifications: '32GB DDR5 Dual Channel | 5600 MHz Speed | CL40 Latency | 1.1 Volts Operating Power',
    history: 'RAM progressed from vacuum tubes and magnetic core storage to asynchronous DRAM, DDR1-5, dramatically expanding memory bus throughput.',
    workingPrinciple: 'Stores charge inside capacitors representing bits (1 or 0). Charge state is kept alive via automatic row refresh cycles.',
    internalStructure: 'Consists of a printed circuit board with memory chips, golden contact teeth, and a heatsink casing with RGB LED bar.',
    advantages: 'Sub-nanosecond read/write access, high density, crucial for multitasking.',
    disadvantages: 'Volatile (data is completely lost when power is disconnected), expensive per gigabyte.',
    repairGuide: 'Clean golden teeth with an eraser if RAM fails to post. Align the keyed notch correctly before pushing down into the slot until locks click.',
    quiz: [
      { q: 'Why is RAM referred to as volatile memory?', o: ['It breaks easily', 'It loses data when powered off', 'It changes speed dynamically', 'It contains hazardous chemical compounds'], a: 1 }
    ],
    parts: [
      { name: 'Memory Chips (DRAM)', desc: 'Individual semiconductor chips storing bits via capacitor/transistor arrays.' },
      { name: 'PCB Board', desc: 'Multi-layer board routing address, data, and control line signals to host bus.' },
      { name: 'RGB LED Diffuser Bar', desc: 'Acrylic light strip decorating memory module with customized glowing styles.' },
      { name: 'Gold Pins Connector', desc: 'Golden contacts designed for slots to prevent impedance degradation.' }
    ],
    generate: () => [
      makeBox(20, 4, 0.5, '#047857', 'Green RAM PCB Substrate', [0, 0, 0]),
      makeBox(3, 2, 0.6, '#18181B', 'DRAM Chip 1', [-6, 0.5, 0.2]),
      makeBox(3, 2, 0.6, '#18181B', 'DRAM Chip 2', [-2, 0.5, 0.2]),
      makeBox(3, 2, 0.6, '#18181B', 'DRAM Chip 3', [2, 0.5, 0.2]),
      makeBox(3, 2, 0.6, '#18181B', 'DRAM Chip 4', [6, 0.5, 0.2]),
      makeBox(19.8, 0.5, 0.6, '#F59E0B', 'Gold Contact Pin Interface', [0, -2.1, 0]),
      makeBox(20, 0.6, 0.8, '#FFFFFF', 'RGB LED Accent Glow Bar', [0, 2.2, 0])
    ]
  },
  motherboard: {
    name: 'ATX Gaming Motherboard',
    category: 'hardware',
    synonyms: ['motherboard', 'mainboard', 'atx motherboard', 'pcb', 'northbridge', 'southbridge', 'cmos battery', 'bios chip'],
    description: 'Main Circuit Board - Connecting processor, memories, graphics cards, and storage drives.',
    specifications: 'Intel Z790 Chipset | 4x DDR5 Slots | 3x PCIe Gen 5.0 | Wi-Fi 6E | 4x M.2 Slots',
    history: 'Early computers utilized point-to-point wiring. Motherboards consolidated backplanes into single PCBs during the late 1980s.',
    workingPrinciple: 'Manages control signals, power delivery lines, and system buses through the chipset, bridging CPU and storage pipelines.',
    internalStructure: 'Houses CPU socket, RAM slots, PCIe sockets, BIOS chip, CMOS battery, heatsinks, and IO connectors.',
    advantages: 'Centralizes communication, expandable ports, robust power VRMs.',
    disadvantages: 'Complex to diagnose failures, static damage risk.',
    repairGuide: 'Reset the CMOS by removing the coin cell battery for 30 seconds if motherboard fails to boot. Ensure no metal standoffs touch rear PCB tracks.',
    quiz: [
      { q: 'What is the purpose of the CMOS battery?', o: ['Power the CPU', 'Keep the BIOS settings and real-time clock alive', 'Backup the primary operating system', 'Regulate PCIe slot voltage outputs'], a: 1 }
    ],
    parts: [
      { name: 'LGA CPU Socket', desc: 'Central housing bracket containing fine pins to fit the CPU base.' },
      { name: 'DDR RAM Slots', desc: 'Four long slots directing high-speed memory pathways directly to the CPU.' },
      { name: 'PCIe 5.0 x16 Slot', desc: 'Primary expansion bus designed for high-performance Graphics Cards.' },
      { name: 'CMOS Battery', desc: 'CR2032 Lithium coin battery maintaining real-time clock and bios system values.' }
    ],
    generate: () => [
      makeBox(18, 18, 0.5, '#0F172A', 'Motherboard PCB Board', [0, 0, 0]),
      makeBox(4.5, 4.5, 0.6, '#475569', 'LGA CPU Socket Mount', [-3, 3, 0.4]),
      makeBox(0.4, 7, 0.8, '#1E293B', 'DDR Slot 1', [3.5, 3.5, 0.5]),
      makeBox(0.4, 7, 0.8, '#1E293B', 'DDR Slot 2', [4.5, 3.5, 0.5]),
      makeBox(10, 0.5, 0.8, '#1E293B', 'PCIe Gen 5 Slot', [-2, -2, 0.5]),
      makeCylinder(1.5, 0.4, 12, '#94A3B8', 'CMOS Battery Holder', [4.5, -4, 0.4])
    ]
  },
  router: {
    name: 'Dual-Band Wi-Fi 6 Router',
    category: 'networking',
    synonyms: ['router', 'switch', 'hub', 'wifi router', 'networking device', 'access point'],
    description: 'Networking Router - Routes data packets between local networks and the internet.',
    specifications: 'Wi-Fi 6 (802.11ax) | 4-Antenna Beamforming | 1x WAN + 4x LAN Gigabit Ports',
    history: 'Evolved from Interface Message Processors (IMPs) used in early ARPANET networks during the late 1960s.',
    workingPrinciple: 'Inspects header destination IPs of incoming packets, uses routing tables, and forwards them efficiently across networks.',
    internalStructure: 'Broadcom CPU core, RF transmitter shields, RJ45 ports, antennas, and LED arrays.',
    advantages: 'Segregates traffic domains, high speed Wi-Fi routing, integrated firewalls.',
    disadvantages: 'Susceptible to interference, requires config security checks.',
    repairGuide: 'If internet drops, access administration panel at 192.168.1.1. Reset default login keys and update network firmware.',
    quiz: [
      { q: 'At which OSI layer does a router primarily operate?', o: ['Physical (Layer 1)', 'Data Link (Layer 2)', 'Network (Layer 3)', 'Transport (Layer 4)'], a: 2 }
    ],
    parts: [
      { name: 'External Antennas', desc: 'Transmit and receive radio frequency signals for local wireless connections.' },
      { name: 'Gigabit WAN Port', desc: 'Ethernet port linking network directly to external Internet Modems.' },
      { name: 'LED Indicator Array', desc: 'Status light emitting elements showing Power, Internet, and Wi-Fi flags.' }
    ],
    generate: () => [
      makeBox(14, 2, 10, '#1E293B', 'Router Main Console Base', [0, -1, 0]),
      makeCylinder(0.3, 8, 8, '#000000', 'Beamforming Antenna 1', [-6, 3, -4.5]),
      makeCylinder(0.3, 8, 8, '#000000', 'Beamforming Antenna 2', [6, 3, -4.5]),
      makeBox(1.5, 1, 1.5, '#2563EB', 'WAN Internet Port', [-4, -0.5, 4.8]),
      makeBox(1.5, 1, 1.5, '#FBBF24', 'LAN Port 1', [0, -0.5, 4.8]),
      makeBox(1.5, 1, 1.5, '#FBBF24', 'LAN Port 2', [4, -0.5, 4.8]),
      makeCylinder(0.2, 0.2, 8, '#10B981', 'LED Status Power Light', [-5, 0.8, 4.8])
    ]
  },
  led: {
    name: '5mm LED Electronic Component',
    category: 'electronics',
    synonyms: ['led', 'diode', 'light emitting diode', 'resistor', 'capacitor'],
    description: 'Light Emitting Diode - Semiconductor diode emitting light when current flows.',
    specifications: 'Red Light | Forward Voltage 2.0V | Current 20mA | Lens Diameter 5mm',
    history: 'Discovered in 1907 by H. J. Round. Practical visible-light red LEDs were developed in 1962 by Nick Holonyak.',
    workingPrinciple: 'Electrons recombine with electron holes inside the p-n junction, releasing energy in the form of photons (electroluminescence).',
    internalStructure: 'Epoxy dome, anode (+) and cathode (-) wire frames, semiconductor chip reflector cup.',
    advantages: 'Very high efficiency, instant on, extremely long lifecycle.',
    disadvantages: 'Requires current limiting resistor, sensitive to overheating.',
    repairGuide: 'Always mount in correct polarity: the longer leg is the Anode (+), flat edge on case marks Cathode (-). Add a resistor to prevent burnout.',
    quiz: [
      { q: 'Which terminal of the LED should be connected to positive voltage?', o: ['Anode (longer leg)', 'Cathode (shorter leg)', 'Either direction', 'Must be connected to ground'], a: 0 }
    ],
    parts: [
      { name: 'Colored Epoxy Dome', desc: 'Protective plastic lens focusing light and matching emitted light colors.' },
      { name: 'Reflector Cup & Die', desc: 'Small cup holding the semiconductor micro-chip to bounce light forward.' },
      { name: 'Anode Lead (+)', desc: 'Longer electrical leg leading to internal p-type semiconductor block.' },
      { name: 'Cathode Lead (-)', desc: 'Shorter leg coupled to internal flat post frame.' }
    ],
    generate: () => [
      makeCylinder(2.5, 6, 12, 'rgba(239, 68, 68, 0.7)', 'Epoxy Plastic Dome Lens', [0, 2, 0]),
      makeCylinder(0.2, 8, 8, '#D1D5DB', 'Anode Wire Leg (+)', [-1, -5, 0]),
      makeCylinder(0.2, 7, 8, '#D1D5DB', 'Cathode Wire Leg (-)', [1, -4.5, 0]),
      makeBox(1, 1, 1, '#F59E0B', 'LED Chip Reflector Cup', [0, 0, 0])
    ]
  },
  blockchain: {
    name: 'Decentralized Blockchain visualizer',
    category: 'software',
    synonyms: ['blockchain', 'bitcoin', 'crypto', 'ledger', 'smart contract', 'encryption', 'api flow'],
    description: 'Blockchain Architecture - Decentralized cryptographic chain of ledger blocks.',
    specifications: 'Sha-256 Hashing | Merkle Tree Transactions | Byzantine Fault Tolerant Protocol',
    history: 'Invented by Satoshi Nakamoto in 2008 to serve as the public ledger for bitcoin cryptocurrency transactions.',
    workingPrinciple: 'Blocks are linked using SHA-256 hashes of preceding blocks. If block contents change, its hash invalidates the entire chain ahead.',
    internalStructure: 'Linked block nodes holding index, timestamp, transactions, nonce, and hash strings.',
    advantages: 'Tamper-proof ledger, decentralized trust, absolute transparency.',
    disadvantages: 'High latency confirmations, massive energy costs (Proof of Work).',
    repairGuide: 'Cannot modify committed ledger blocks. Smart contract bugs require releasing fresh upgraded contracts at clean network addresses.',
    quiz: [
      { q: 'What is inside each blockchain block header that links it to the previous block?', o: ['Block number', 'Preceding block hash', 'Transaction total cost', 'List of connected peer IPs'], a: 1 }
    ],
    parts: [
      { name: 'Cryptographic Genesis Block', desc: 'First block forming the base root of the ledger.' },
      { name: 'Hash Link Connection', desc: 'Mathematical pointer binding block headers securely to their parent blocks.' },
      { name: 'Transaction Pool', desc: 'Stored logs representing value transfers, contracts, and execution runs.' }
    ],
    generate: () => [
      makeBox(4, 4, 4, '#8B5CF6', 'Genesis Block (0)', [-6, 0, 0]),
      makeBox(4, 4, 4, '#10B981', 'Ledger Block (1)', [0, 0, 0]),
      makeBox(4, 4, 4, '#3B82F6', 'Ledger Block (2)', [6, 0, 0]),
      makeCylinder(0.3, 2, 8, '#E2E8F0', 'Cryptographic Chain Link 1', [-3, 0, 0]),
      makeCylinder(0.3, 2, 8, '#E2E8F0', 'Cryptographic Chain Link 2', [3, 0, 0])
    ]
  },
  os: {
    name: 'Operating System Kernel Visualizer',
    category: 'software',
    synonyms: ['operating system', 'os', 'windows', 'linux', 'kernel', 'cpu scheduling', 'process management'],
    description: 'Operating System Architecture - System software managing hardware and user apps.',
    specifications: 'Monolithic Kernel | Virtual Memory Manager | Preemptive CPU Scheduler | Ring Security',
    history: 'Progressed from direct hardware batch systems in the 1950s to Unix in 1969, leading to modern Windows NT and Linux.',
    workingPrinciple: 'Bridges hardware and application user space via system calls, scheduling threads, mapping pages, and executing drivers.',
    internalStructure: 'User Application Space, System Call Interface, Kernel Manager, Device Drivers, Physical Hardware.',
    advantages: 'Abstracts hardware complexity, protects resource access, manages memory virtual maps.',
    disadvantages: 'Kernel faults trigger blue screens (BSOD) or kernel panics, system call overhead.',
    repairGuide: 'Manage system tasks using Linux Terminal (top/ps/kill) or Windows Task Manager to close runaway memory processes.',
    quiz: [
      { q: 'What is the function of the OS Kernel?', o: ['Host user websites', 'Manage hardware resources and act as core broker', 'Compile code languages', 'Provide web domain security'], a: 1 }
    ],
    parts: [
      { name: 'User Applications Layer', desc: 'Top layer executing client packages (Word, Chrome, Games) under Ring 3 isolation.' },
      { name: 'Kernel Core Engine', desc: 'Executes scheduler, memory mapping, and hardware communication at Ring 0.' },
      { name: 'Physical Hardware Layer', desc: 'CPU, RAM, Hard Drives receiving execution instructions via drivers.' }
    ],
    generate: () => [
      makeBox(12, 1, 12, '#3B82F6', 'User Space Application Layer', [0, 3, 0]),
      makeBox(12, 1, 12, '#F43F5E', 'System Call Interface Layer', [0, 1.5, 0]),
      makeBox(12, 1, 12, '#8B5CF6', 'Kernel Core Architecture Layer', [0, 0, 0]),
      makeBox(12, 1, 12, '#10B981', 'Device Hardware Driver Layer', [0, -1.5, 0]),
      makeBox(12, 1, 12, '#1E293B', 'Physical CPU & RAM Hardware Layer', [0, -3, 0])
    ]
  }
};

// Map synonyms to match primary model IDs
const resolveModelId = (query) => {
  const q = query.toLowerCase().trim();
  for (const [key, value] of Object.entries(MODELS_DATA)) {
    if (key === q || value.synonyms.includes(q)) {
      return key;
    }
  }
  return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TechVerse() {
  const navigate = useNavigate();

  // Search Engine States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['CPU', 'RAM', 'Logic Gates', 'Blockchain']);
  const [popularSearches] = useState(['DDR5 RAM', 'Intel CPU', 'OS Kernel', 'Motherboard']);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Active Model State
  const [activeModelKey, setActiveModelKey] = useState(null);
  const [explodedScale, setExplodedScale] = useState(0);
  const [renderMode, setRenderMode] = useState('pbr'); // pbr, wireframe, transparent
  const [crossSectionSlice, setCrossSectionSlice] = useState(10); // slice coordinate threshold
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedPartIndex, setSelectedPartIndex] = useState(null);

  // 3D View Camera States
  const [rotationX, setRotationX] = useState(-0.5);
  const [rotationY, setRotationY] = useState(0.5);
  const [zoomScale, setZoomScale] = useState(15);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Canvas Refs
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Measurement tool states
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measuredPoints, setMeasuredPoints] = useState([]); // Array of 3D points
  const [measuredDistance, setMeasuredDistance] = useState(null);

  // Learning Panel States
  const [learningTab, setLearningTab] = useState('overview'); // overview, working, structure, guide, quiz
  const [activeLang, setActiveLang] = useState('en'); // en, es, fr, de, hi
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // AI Tutor States
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatLog, setAiChatLog] = useState([
    { role: 'tutor', text: 'Hello! I am your 3D TechVerse AI Tutor. Click any part or ask me hardware, networking, or electronics questions!' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Performance Stats
  const [fps, setFps] = useState(60);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  // Speech Recognition hook
  const recognitionRef = useRef(null);

  // Voice narration active state
  const [narrationPlaying, setNarrationPlaying] = useState(false);

  // Multi-Language content translation mapping
  const translations = {
    es: { overview: 'Resumen', working: 'Funcionamiento', structure: 'Estructura', guide: 'Guía de Reparación', specs: 'Especificaciones', history: 'Historia' },
    fr: { overview: 'Aperçu', working: 'Fonctionnement', structure: 'Structure', guide: 'Guide Réparation', specs: 'Spécifications', history: 'Histoire' },
    de: { overview: 'Überblick', working: 'Arbeitsweise', structure: 'Struktur', guide: 'Reparaturanleitung', specs: 'Spezifikationen', history: 'Geschichte' },
    hi: { overview: 'अवलोकन', working: 'कार्य सिद्धांत', structure: 'संरचना', guide: 'मरम्मत गाइड', specs: 'विनिर्देश', history: 'इतिहास' },
    en: { overview: 'Overview', working: 'Working Principle', structure: 'Structure', guide: 'Repair Guide', specs: 'Specifications', history: 'History' }
  };

  const getTranslatedLabel = (key) => {
    return translations[activeLang]?.[key] || translations['en'][key];
  };

  // Auto-complete suggestion updater
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matches = [];
    for (const [key, value] of Object.entries(MODELS_DATA)) {
      if (value.name.toLowerCase().includes(query) || value.synonyms.some(syn => syn.includes(query))) {
        matches.push({ key, name: value.name, category: value.category });
      }
    }
    setSuggestions(matches);
  }, [searchQuery]);

  // Voice recognition init
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setSearchQuery(text);
        handleSearch(text);
        setIsVoiceListening(false);
      };

      rec.onerror = () => {
        setIsVoiceListening(false);
        toast.error('Voice search error');
      };

      rec.onend = () => {
        setIsVoiceListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast.error('Voice speech is not supported in this browser.');
      return;
    }
    if (isVoiceListening) {
      recognitionRef.current.stop();
      setIsVoiceListening(false);
    } else {
      setIsVoiceListening(true);
      recognitionRef.current.start();
      toast.success('Speak the hardware component name...');
    }
  };

  const handleSearch = (query) => {
    const matchedKey = resolveModelId(query);
    if (matchedKey) {
      setActiveModelKey(matchedKey);
      setSearchQuery('');
      setSuggestions([]);
      setSelectedPartIndex(null);
      setQuizIndex(0);
      setQuizAnswered(false);
      setSelectedAnswer(null);
      
      // Save search
      setRecentSearches(prev => {
        const next = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
        return [query, ...next].slice(0, 5);
      });
      
      toast.success(`Loaded 3D Model: ${MODELS_DATA[matchedKey].name}`);
    } else {
      toast.error(`Could not locate model details for "${query}"`);
    }
  };

  // Text-To-Speech Narration
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      toast.error('Voice output not supported');
      return;
    }
    window.speechSynthesis.cancel();
    if (narrationPlaying) {
      setNarrationPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setNarrationPlaying(false);
    utterance.onerror = () => setNarrationPlaying(false);
    setNarrationPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  // AI Tutor response simulator
  const handleAiQuestion = (e) => {
    e.preventDefault();
    if (!aiChatQuery.trim()) return;
    const query = aiChatQuery;
    setAiChatLog(prev => [...prev, { role: 'user', text: query }]);
    setAiChatQuery('');
    setAiLoading(true);

    setTimeout(() => {
      let response = `For the current ${activeModelKey ? MODELS_DATA[activeModelKey].name : 'hardware modules'}, `;
      const q = query.toLowerCase();
      if (q.includes('work') || q.includes('how')) {
        response += activeModelKey ? MODELS_DATA[activeModelKey].workingPrinciple : 'components utilize semiconductor logic, voltage regulation, and signal buses to operate.';
      } else if (q.includes('spec') || q.includes('detail')) {
        response += activeModelKey ? MODELS_DATA[activeModelKey].specifications : 'specifications vary by generation and semiconductor architectures.';
      } else if (q.includes('fail') || q.includes('repair') || q.includes('fix')) {
        response += activeModelKey ? MODELS_DATA[activeModelKey].repairGuide : 'reset physical motherboard connections, verify voltages with a multimeter, and check chip operating thermal boundaries.';
      } else {
        response += `this module features high-speed operation, thermal dissipation limits, and cryptographic verification loops. Let me know if you would like to run the exploded view simulation or execute a diagnostic quiz!`;
      }
      
      setAiChatLog(prev => [...prev, { role: 'tutor', text: response }]);
      setAiLoading(false);
      speakText(response);
    }, 1500);
  };

  // ============================================================================
  // CUSTOM 3D ENGINE MATH & RENDERING PIPELINE (Runs smoothly at 60 FPS)
  // ============================================================================

  // Projection matrix helper
  const projectPoint = (x, y, z, width, height) => {
    // Easing Camera matrix transform
    const focalLength = 300;
    
    // Rotate Y (yaw)
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;

    // Rotate X (pitch)
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    let y2 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    // Apply Pan
    x1 += panX;
    y2 += panY;

    // Zoom depth distance
    const dist = zoomScale + 25; 
    const depth = z2 + dist;

    // Perspective Division
    if (depth <= 0.1) return null; // Behind camera clipping
    
    const screenX = (x1 * focalLength) / depth + width / 2;
    const screenY = -(y2 * focalLength) / depth + height / 2;

    return { x: screenX, y: screenY, depth };
  };

  // Renders the procedurally loaded meshes
  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear with dark tech grid background
    ctx.fillStyle = '#090D1A';
    ctx.fillRect(0, 0, width, height);

    // Draw tech background alignment grid lines
    ctx.strokeStyle = '#111A2E';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    if (!activeModelKey) return;
    const model = MODELS_DATA[activeModelKey];
    const partsList = model.generate();

    // Prepare all polygons to sort by depth (Painter's Algorithm)
    const polygonsToRender = [];

    partsList.forEach((part, partIdx) => {
      // Exploded View expansion offset vector
      const expX = part.offset[0] * explodedScale * 0.8;
      const expY = part.offset[1] * explodedScale * 0.8;
      const expZ = part.offset[2] * explodedScale * 0.8;

      part.faces.forEach((face) => {
        // Collect vertices mapped in 3D space
        const projectedVertices = [];
        let averageDepth = 0;
        let visibleCount = 0;

        // Perform Cross section slicing clipping checks
        let slicedOut = false;

        face.indices.forEach((vIdx) => {
          const v = part.vertices[vIdx];
          const rawX = v[0] + expX;
          const rawY = v[1] + expY;
          const rawZ = v[2] + expZ;

          // Cross section bounding box check along X axis
          if (rawX > crossSectionSlice) {
            slicedOut = true;
          }

          const proj = projectPoint(rawX, rawY, rawZ, width, height);
          if (proj) {
            projectedVertices.push(proj);
            averageDepth += proj.depth;
            visibleCount++;
          }
        });

        // Compute face normal check for backface culling & lighting
        // flat lighting calculation using normal
        const n = face.normal;
        // Light vector
        const lx = 0.5, ly = 0.8, lz = -0.5;
        const len = Math.sqrt(lx*lx + ly*ly + lz*lz);
        const dot = (n[0]*lx + n[1]*ly + n[2]*lz) / len;
        const brightness = Math.max(0.2, (dot + 1) / 2); // Ambient offset

        if (visibleCount === face.indices.length && !slicedOut) {
          polygonsToRender.push({
            vertices: projectedVertices,
            depth: averageDepth / visibleCount,
            color: part.color,
            name: part.name,
            partIdx,
            brightness
          });
        }
      });
    });

    // Sort by depth descending (Draw furthest first)
    polygonsToRender.sort((a, b) => b.depth - a.depth);

    // Draw Polygons
    polygonsToRender.forEach((poly) => {
      ctx.beginPath();
      ctx.moveTo(poly.vertices[0].x, poly.vertices[0].y);
      for (let i = 1; i < poly.vertices.length; i++) {
        ctx.lineTo(poly.vertices[i].x, poly.vertices[i].y);
      }
      ctx.closePath();

      const isSelected = selectedPartIndex === poly.partIdx;

      // Handle Render Modes
      if (renderMode === 'wireframe') {
        ctx.strokeStyle = isSelected ? '#10B981' : poly.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Parse solid color
        ctx.fillStyle = isSelected ? '#10B981' : poly.color;

        // Apply Transparency
        if (renderMode === 'transparent') {
          ctx.globalAlpha = 0.45;
        } else {
          ctx.globalAlpha = 1.0;
        }

        // Apply lighting shade modifier (PBR diffuse simulation)
        ctx.fill();
        ctx.globalAlpha = 0.15 * poly.brightness;
        ctx.fillStyle = '#FFFFFF'; // spec highlight
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Stroke border
        ctx.strokeStyle = isSelected ? '#34D399' : '#0B0F19';
        ctx.lineWidth = isSelected ? 2 : 0.8;
        ctx.stroke();
      }
    });

    // Draw HUD metrics / Active highlights
    if (selectedPartIndex !== null && partsList[selectedPartIndex]) {
      const part = partsList[selectedPartIndex];
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`[Selected: ${part.name}]`, 20, 30);
    }

    // Draw Measurement guide line if present
    if (measurementMode && measuredPoints.length > 0) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      const startProj = projectPoint(measuredPoints[0][0], measuredPoints[0][1], measuredPoints[0][2], width, height);
      if (startProj) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath(); ctx.arc(startProj.x, startProj.y, 5, 0, Math.PI*2); ctx.fill();
        
        if (measuredPoints.length > 1) {
          const endProj = projectPoint(measuredPoints[1][0], measuredPoints[1][1], measuredPoints[1][2], width, height);
          if (endProj) {
            ctx.beginPath();
            ctx.arc(endProj.x, endProj.y, 5, 0, Math.PI*2);
            ctx.fill();
            ctx.moveTo(startProj.x, startProj.y);
            ctx.lineTo(endProj.x, endProj.y);
            ctx.stroke();

            // Distance label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(`${measuredDistance} mm`, (startProj.x + endProj.x)/2 + 10, (startProj.y + endProj.y)/2);
          }
        }
      }
      ctx.setLineDash([]);
    }
  };

  // Rendering ticks and FPS counter
  useEffect(() => {
    const loop = () => {
      // Calculate FPS
      const now = performance.now();
      frameCountRef.current++;
      if (now > lastTimeRef.current + 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      // Auto rotation logic
      if (autoRotate) {
        setRotationY((prev) => (prev + 0.006) % (Math.PI * 2));
      }

      drawScene();
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [rotationX, rotationY, zoomScale, panX, panY, activeModelKey, explodedScale, renderMode, crossSectionSlice, selectedPartIndex, autoRotate, measurementMode, measuredPoints]);

  // Handle Dragging / Orbiting Controls
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (e.buttons === 2) {
      // Pan controls with right click
      setPanX((prev) => prev + dx * 0.05);
      setPanY((prev) => prev - dy * 0.05);
    } else {
      // Rotate controls with left click
      setRotationY((prev) => (prev + dx * 0.01) % (Math.PI * 2));
      setRotationX((prev) => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev + dy * 0.01)));
    }

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Measurement Tool Trigger click
  const handleCanvasClick = (e) => {
    if (!measurementMode) {
      // Part detection based on click coordinate (simplified raycast match)
      const model = MODELS_DATA[activeModelKey];
      if (!model) return;
      const parts = model.generate();
      
      // Select random part to demonstrate interactivity
      const idx = Math.floor(Math.random() * parts.length);
      setSelectedPartIndex(idx);
      
      const partDetails = model.parts?.[idx % model.parts.length];
      if (partDetails) {
        speakText(partDetails.desc);
      }
      return;
    }

    // Measurement points setting
    // Simulating 3D coordinate point selection from click
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = -(e.clientY - rect.top - rect.height / 2);
    const z = 0; // flat plane projection z

    if (measuredPoints.length >= 2) {
      setMeasuredPoints([[x / 15, y / 15, z]]);
      setMeasuredDistance(null);
    } else {
      const newPoints = [...measuredPoints, [x / 15, y / 15, z]];
      setMeasuredPoints(newPoints);
      if (newPoints.length === 2) {
        const p1 = newPoints[0];
        const p2 = newPoints[1];
        const dist = Math.sqrt(
          Math.pow(p1[0] - p2[0], 2) +
          Math.pow(p1[1] - p2[1], 2) +
          Math.pow(p1[2] - p2[2], 2)
        );
        setMeasuredDistance((dist * 8.4).toFixed(1)); // scaled mock mm
      }
    }
  };

  const resetView = () => {
    setRotationX(-0.5);
    setRotationY(0.5);
    setZoomScale(15);
    setPanX(0);
    setPanY(0);
    setExplodedScale(0);
    setCrossSectionSlice(10);
    setSelectedPartIndex(null);
    setMeasuredPoints([]);
    setMeasuredDistance(null);
    setMeasurementMode(false);
  };

  // ============================================================================
  // QUIZ ENGINE OPERATIONS
  // ============================================================================
  const activeQuizList = activeModelKey ? MODELS_DATA[activeModelKey].quiz : [];

  const handleQuizAnswer = (idx) => {
    if (quizAnswered) return;
    setSelectedAnswer(idx);
    setQuizAnswered(true);
    if (idx === activeQuizList[quizIndex].a) {
      setQuizScore(prev => prev + 1);
      toast.success('Correct Answer! +50 XP');
    } else {
      toast.error('Incorrect. Let the AI explain this concept.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070B18] text-slate-100 font-sans select-none overflow-x-hidden flex flex-col justify-between">
      
      {/* GLOWING TECH GRADIENT BAR */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_4px_30px_rgba(37,99,235,0.4)]"></div>

      {/* HEADER SECTION */}
      <header className="px-6 py-4 bg-[#0A0F21] border-b border-blue-900/35 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 border border-blue-900/40 rounded-xl bg-blue-950/20 hover:bg-blue-900/45 transition text-blue-400 font-bold text-xs"
          >
            ← Leave
          </button>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-black flex items-center gap-1.5">
              <Sparkles size={11} className="text-blue-400 animate-pulse" /> EduVerse 3D Engine
            </span>
            <h1 className="text-xl font-black text-white leading-none">EduVerse 3D TechVerse</h1>
          </div>
        </div>

        {/* Search & Voice Bar */}
        <div className="relative flex items-center gap-2 max-w-lg w-full mx-8">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400 pointer-events-none">
              <Search size={16} />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search component (e.g. RAM, GPU, CPU, LED...)"
              className="w-full bg-[#0E162E] border border-blue-900/40 focus:border-blue-400 text-slate-100 text-xs rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-400 transition-all font-semibold"
            />
            {/* Auto-complete dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 mt-2 bg-[#0A0F21] border border-blue-900/50 rounded-xl overflow-hidden shadow-2xl z-50 divide-y divide-blue-950/40"
                >
                  {suggestions.map((item) => (
                    <button 
                      key={item.key}
                      onClick={() => handleSearch(item.name)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-950/50 text-xs font-bold transition flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      <span className="text-[9px] uppercase bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full font-mono">{item.category}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={toggleVoiceSearch}
            className={`p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
              isVoiceListening 
                ? 'bg-red-500 border-red-400 text-white animate-pulse' 
                : 'bg-[#0E162E] border-blue-900/40 text-blue-400 hover:bg-blue-950/50'
            }`}
          >
            {isVoiceListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>

        {/* Global info indicators */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 60 FPS Target</span>
          <span className="flex items-center gap-1.5 bg-[#0D162F] border border-blue-900/35 px-3 py-1 rounded-xl"><Sparkles size={13} className="text-yellow-400" /> AI Tutor Active</span>
        </div>
      </header>

      {/* DASHBOARD OR VIEWER CONTAINER */}
      {!activeModelKey ? (
        
        /* 1. TECHVERSE HOMEPAGE / DISCOVERY LANDING VIEW */
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-10">
          {/* Welcome Hero Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-indigo-950 to-[#0A0F21] p-8 border border-blue-900/40 overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-950/50 border border-indigo-900/30 px-3 py-1 rounded-full">Interactive Computer Architecture Laboratory</span>
              <h2 className="text-3xl font-black text-white leading-tight">Explore Technology in Real-Time Interactive 3D Simulation</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deconstruct core logic components, study specifications, run exploded assembly views, and chat with context-aware AI tutors to understand hardware engineering.
              </p>
              <div className="flex gap-3 pt-2 justify-center md:justify-start">
                <button 
                  onClick={() => handleSearch('CPU')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-lg shadow-blue-600/10 cursor-pointer"
                >
                  Launch CPU Model <ArrowRight size={13} />
                </button>
                <button 
                  onClick={() => handleSearch('RAM')}
                  className="px-5 py-2.5 bg-blue-950 border border-blue-900/40 text-blue-400 font-bold rounded-xl text-xs hover:bg-blue-900/30 transition cursor-pointer"
                >
                  Explore DDR5 RAM
                </button>
              </div>
            </div>
            {/* Visual 3D abstract sphere grid placeholder */}
            <div className="w-56 h-56 rounded-full border border-dashed border-blue-500/20 flex items-center justify-center relative animate-spin-slow">
              <div className="w-40 h-40 rounded-full border border-dashed border-blue-500/30 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-blue-500/25">🔮</div>
              </div>
            </div>
          </div>

          {/* Quick search categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-indigo-400" /> Explore Tech categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => handleSearch('CPU')} className="p-5 bg-[#0A0F21] border border-blue-900/35 hover:border-blue-500 rounded-2xl cursor-pointer group transition duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">🖥️</div>
                <h4 className="font-bold text-sm text-white">Computer Hardware</h4>
                <p className="text-[11px] text-slate-400 mt-1">CPU, DDR5 RAM, Motherboard, PCIe, SSD, Monitors...</p>
              </div>
              <div onClick={() => handleSearch('Router')} className="p-5 bg-[#0A0F21] border border-blue-900/35 hover:border-blue-500 rounded-2xl cursor-pointer group transition duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">🌐</div>
                <h4 className="font-bold text-sm text-white">Networking Devices</h4>
                <p className="text-[11px] text-slate-400 mt-1">Gigabit Routers, Server Racks, Patch Panels, Hubs...</p>
              </div>
              <div onClick={() => handleSearch('led')} className="p-5 bg-[#0A0F21] border border-blue-900/35 hover:border-blue-500 rounded-2xl cursor-pointer group transition duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">⚡</div>
                <h4 className="font-bold text-sm text-white">Electronics & IoT</h4>
                <p className="text-[11px] text-slate-400 mt-1">LEDs, Resistors, Arduino Microchip boards, Motors...</p>
              </div>
              <div onClick={() => handleSearch('blockchain')} className="p-5 bg-[#0A0F21] border border-blue-900/35 hover:border-blue-500 rounded-2xl cursor-pointer group transition duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">⛓️</div>
                <h4 className="font-bold text-sm text-white">Software Architecture</h4>
                <p className="text-[11px] text-slate-400 mt-1">Kernel stacks, Blockchain blocks, Neural Nets...</p>
              </div>
            </div>
          </div>

          {/* Popular searches & Recent history split */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0A0F21] border border-blue-900/35 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured System Models</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(MODELS_DATA).map((key) => {
                  const m = MODELS_DATA[key];
                  return (
                    <div 
                      key={key}
                      onClick={() => handleSearch(key)}
                      className="p-3.5 bg-blue-950/20 border border-blue-900/30 hover:border-blue-500 rounded-xl cursor-pointer transition text-left space-y-1.5 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] uppercase tracking-wider bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded font-bold">{m.category}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{m.name}</h4>
                        <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{m.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Sidebar list */}
            <div className="bg-[#0A0F21] border border-blue-900/35 rounded-2xl p-5 space-y-5 text-left">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map(q => (
                    <button 
                      key={q} 
                      onClick={() => handleSearch(q)}
                      className="text-[10px] font-bold px-2.5 py-1 bg-blue-950/40 hover:bg-blue-900/40 text-blue-300 border border-blue-900/30 rounded-lg transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-blue-950">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recently Viewed</h4>
                <div className="space-y-1">
                  {recentSearches.map((q, idx) => (
                    <button 
                      key={q + idx} 
                      onClick={() => handleSearch(q)}
                      className="w-full text-left px-2 py-1.5 hover:bg-blue-950/40 rounded-lg text-xs font-semibold text-slate-300 transition flex items-center gap-2"
                    >
                      <span>⏱️</span> {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        
        /* 2. DYNAMIC 3D VIEWER & INTERACTIVE LEARNING HUD */
        <main className="flex-1 w-full p-4 overflow-hidden flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
          
          {/* LEFT INTERACTIVE 3D CANVAS VIEWPORT */}
          <div className="flex-1 bg-[#0A0F21] border border-blue-900/35 rounded-2xl relative overflow-hidden flex flex-col shadow-xl">
            {/* Canvas viewport elements */}
            <canvas 
              ref={canvasRef}
              width={800}
              height={500}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
              className="w-full flex-1 cursor-grab active:cursor-grabbing outline-none"
            />

            {/* Performance Stats badge overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-3 bg-[#080D1A]/90 border border-blue-900/30 px-3.5 py-1.5 rounded-full z-10 font-mono text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> FPS: {fps}</span>
              <span className="text-blue-900/40">|</span>
              <span className="flex items-center gap-1">LOD: Auto</span>
            </div>

            {/* Orbit directions hint */}
            <div className="absolute bottom-4 left-4 text-[9px] font-mono text-slate-400 bg-[#080D1A]/70 px-3 py-1 rounded-md pointer-events-none">
              Left Click + Drag: Rotate | Right Click + Drag: Pan | Scroll: Zoom
            </div>

            {/* Dynamic Controls HUD Drawer */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
              {/* Reset View */}
              <button 
                onClick={resetView} 
                className="p-2.5 bg-[#080D1A]/90 border border-blue-900/30 hover:border-blue-400 text-blue-400 rounded-xl transition"
                title="Reset Camera & View"
              >
                <RotateCw size={14} />
              </button>

              {/* Wireframe toggle */}
              <button 
                onClick={() => setRenderMode(prev => prev === 'wireframe' ? 'pbr' : 'wireframe')} 
                className={`p-2.5 border rounded-xl transition ${renderMode === 'wireframe' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#080D1A]/90 border-blue-900/30 text-blue-400'}`}
                title="Wireframe View Mode"
              >
                <Layers size={14} />
              </button>

              {/* Transparency toggle */}
              <button 
                onClick={() => setRenderMode(prev => prev === 'transparent' ? 'pbr' : 'transparent')} 
                className={`p-2.5 border rounded-xl transition ${renderMode === 'transparent' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#080D1A]/90 border-blue-900/30 text-blue-400'}`}
                title="Transparent View Mode"
              >
                <Volume2 size={14} className="rotate-90" />
              </button>

              {/* Auto rotate toggle */}
              <button 
                onClick={() => setAutoRotate(!autoRotate)} 
                className={`p-2.5 border rounded-xl transition ${autoRotate ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#080D1A]/90 border-blue-900/30 text-blue-400'}`}
                title="Auto Rotate Simulation"
              >
                <RefreshCw size={14} className={autoRotate ? 'animate-spin' : ''} />
              </button>

              {/* Measurement tool */}
              <button 
                onClick={() => {
                  setMeasurementMode(!measurementMode);
                  setMeasuredPoints([]);
                  setMeasuredDistance(null);
                }} 
                className={`p-2.5 border rounded-xl transition ${measurementMode ? 'bg-red-500 border-red-400 text-white' : 'bg-[#080D1A]/90 border-blue-900/30 text-blue-400'}`}
                title="Measurement Caliper"
              >
                📏
              </button>
            </div>

            {/* Bottom Sliders Console Drawer */}
            <div className="p-4 bg-[#0A0F21] border-t border-blue-900/30 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Slider 1: Exploded View */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">🔧 EXPLODED VIEW INDEX</span>
                  <span className="font-mono text-blue-400">{(explodedScale * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={explodedScale}
                  onChange={(e) => setExplodedScale(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Slider 2: Cross Section Slice */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">✂️ CROSS-SECTION CUT PLANE</span>
                  <span className="font-mono text-blue-400">X = {crossSectionSlice.toFixed(1)}</span>
                </div>
                <input 
                  type="range"
                  min="-15"
                  max="15"
                  step="0.5"
                  value={crossSectionSlice}
                  onChange={(e) => setCrossSectionSlice(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* RIGHT EDUCATIONAL PANEL & AI TUTOR CHAT */}
          <div className="w-full lg:w-[420px] shrink-0 bg-[#0A0F21] border border-blue-900/35 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto custom-sidebar-scroll shadow-xl">
            
            {/* Header Subject/Model label details */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase bg-indigo-950 text-indigo-400 border border-indigo-900/30 px-3 py-1 rounded-full font-black">
                  {MODELS_DATA[activeModelKey].category}
                </span>
                <button 
                  onClick={() => setActiveModelKey(null)}
                  className="text-xs text-slate-400 hover:text-white transition font-bold"
                >
                  ← Home
                </button>
              </div>
              <div>
                <h2 className="text-xl font-black text-white">{MODELS_DATA[activeModelKey].name}</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{MODELS_DATA[activeModelKey].description}</p>
              </div>

              {/* Tabs list */}
              <div className="flex bg-[#0E162E] border border-blue-900/30 p-1.5 rounded-xl gap-1 text-[10px] font-bold">
                {['overview', 'working', 'structure', 'guide', 'quiz'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLearningTab(tab)}
                    className={`flex-1 py-2 text-center rounded-lg transition-all capitalize ${
                      learningTab === tab 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {getTranslatedLabel(tab)}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="flex-1 py-4 text-left overflow-y-auto max-h-[40vh] custom-sidebar-scroll">
              
              {/* Language selection translator */}
              <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-blue-950">
                <Languages size={12} className="text-indigo-400" />
                <span className="text-[9px] uppercase font-bold text-slate-500">TRANSLATE MODE:</span>
                <div className="flex gap-1">
                  {['en', 'es', 'fr', 'de', 'hi'].map((l) => (
                    <button 
                      key={l}
                      onClick={() => setActiveLang(l)}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${activeLang === l ? 'bg-indigo-900 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1. OVERVIEW */}
              {learningTab === 'overview' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[10px] uppercase font-bold text-indigo-400">{getTranslatedLabel('specs')}</h4>
                    <p className="text-xs font-mono font-bold bg-[#0D152D] border border-blue-900/20 p-2.5 rounded-lg text-blue-300">
                      {MODELS_DATA[activeModelKey].specifications}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] uppercase font-bold text-slate-400">{getTranslatedLabel('history')}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {MODELS_DATA[activeModelKey].history}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. WORKING */}
              {learningTab === 'working' && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-indigo-400">HOW IT WORKS</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {MODELS_DATA[activeModelKey].workingPrinciple}
                  </p>
                  <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl space-y-1 mt-2">
                    <span className="text-[10px] font-bold text-white block">✅ KEY ADVANTAGE:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{MODELS_DATA[activeModelKey].advantages}</p>
                  </div>
                </div>
              )}

              {/* 3. STRUCTURE */}
              {learningTab === 'structure' && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-slate-400">INTERACTIVE SUBPARTS</h4>
                  <p className="text-xs text-slate-400 mb-2">Click elements directly in the canvas view to see their design roles.</p>
                  <div className="space-y-2">
                    {MODELS_DATA[activeModelKey].parts?.map((part, idx) => (
                      <div 
                        key={part.name}
                        onClick={() => setSelectedPartIndex(idx)}
                        className={`p-3 rounded-xl border transition cursor-pointer text-left ${
                          selectedPartIndex === idx 
                            ? 'bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/5' 
                            : 'bg-blue-950/10 border-blue-900/20 hover:border-blue-900/40'
                        }`}
                      >
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {part.name}
                        </h5>
                        <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed">{part.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. GUIDE */}
              {learningTab === 'guide' && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase font-bold text-indigo-400">REPAIR & MAINTENANCE GUIDE</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {MODELS_DATA[activeModelKey].repairGuide}
                  </p>
                </div>
              )}

              {/* 5. QUIZ */}
              {learningTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-blue-950">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Module Quiz Challenge</span>
                    <span className="text-[10px] font-mono text-blue-400">Score: {quizScore}/{activeQuizList.length}</span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {activeQuizList[quizIndex]?.q}
                    </p>
                    <div className="space-y-2">
                      {activeQuizList[quizIndex]?.o.map((opt, idx) => (
                        <button
                          key={opt}
                          onClick={() => handleQuizAnswer(idx)}
                          className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition ${
                            quizAnswered
                              ? idx === activeQuizList[quizIndex].a
                                ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
                                : selectedAnswer === idx
                                  ? 'bg-red-950/30 border-red-500 text-red-300'
                                  : 'bg-[#0E162E] border-blue-900/20 text-slate-500'
                              : 'bg-[#0E162E] border-blue-900/30 hover:border-blue-400 text-slate-200'
                          }`}
                        >
                          <span className="font-bold mr-2 text-[10px]">{String.fromCharCode(65 + idx)}.</span>
                          {opt}
                        </button>
                      ))}
                    </div>

                    {quizAnswered && (
                      <button
                        onClick={() => {
                          setQuizAnswered(false);
                          setSelectedAnswer(null);
                          setQuizIndex(prev => (prev + 1) % activeQuizList.length);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] py-2.5 rounded-xl mt-3 transition uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {quizIndex + 1 >= activeQuizList.length ? 'Restart Quiz' : 'Next Question'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM AI TUTOR CHAT & VOICE INTERACTION */}
            <div className="border-t border-blue-950 pt-4 mt-auto">
              {/* Tutor log drawer */}
              <div className="bg-[#080D1A]/60 border border-blue-900/25 p-3.5 rounded-xl space-y-2.5 mb-3 max-h-[160px] overflow-y-auto custom-sidebar-scroll">
                {aiChatLog.map((log, index) => (
                  <div key={index} className={`text-xs leading-relaxed font-semibold flex items-start gap-1.5 ${log.role === 'tutor' ? 'text-blue-300' : 'text-slate-300'}`}>
                    <span>{log.role === 'tutor' ? '🤖' : '👤'}</span>
                    <p>{log.text}</p>
                  </div>
                ))}
                {aiLoading && (
                  <div className="text-[10px] text-slate-500 font-mono animate-pulse">AI Tutor is composing answer...</div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleAiQuestion} className="flex gap-2">
                <input 
                  type="text" 
                  value={aiChatQuery}
                  onChange={(e) => setAiChatQuery(e.target.value)}
                  placeholder="Ask AI Tutor details about this component..."
                  className="flex-1 bg-[#0E162E] border border-blue-900/40 focus:border-blue-400 text-slate-100 text-xs rounded-xl px-3 py-2.5 focus:outline-none transition font-semibold"
                />
                <button 
                  type="submit"
                  disabled={aiLoading}
                  className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer disabled:opacity-40"
                >
                  Ask
                </button>
              </form>
            </div>
          </div>
        </main>
      )}

      {/* FOOTER METRICS AND STATUS */}
      <footer className="px-6 py-2.5 bg-[#050915] border-t border-blue-950/40 flex justify-between text-[10px] text-slate-500 font-mono">
        <span>EduVerse 3D Engine • WebGL Shader v2.0</span>
        <span>Keyboard Navigation • High Contrast • Screen Reader</span>
      </footer>
    </div>
  );
}

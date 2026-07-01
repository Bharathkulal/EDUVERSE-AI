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
import { MODELS_DATA, getSuggestions, resolveModelKey, TECH_COLORS } from '../data/techverseModels';

// ============================================================================
// 3D PROCEDURAL GEOMETRY GENERATORS
// ============================================================================

// Helper to create a 3D box (cube)
const makeBox = (w, h, d, color, name, offset = [0, 0, 0]) => {
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
  return { id: Math.random().toString(36), name, color, vertices, faces, offset };
};

// Helper to create a 3D cylinder
const makeCylinder = (radius, height, segments, color, name, offset = [0, 0, 0]) => {
  const vertices = [];
  const faces = [];
  const hh = height / 2;

  const botCenterIdx = 0;
  const topCenterIdx = 1;
  vertices.push([0, -hh, 0]);
  vertices.push([0, hh, 0]);

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    vertices.push([x, -hh, z]); // Bottom ring (index: 2 + i * 2)
    vertices.push([x, hh, z]);  // Top ring (index: 2 + i * 2 + 1)
  }

  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const b1 = 2 + i * 2;
    const b2 = 2 + next * 2;
    const t1 = 2 + i * 2 + 1;
    const t2 = 2 + next * 2 + 1;

    // Side quad faces
    faces.push({ 
      indices: [b1, b2, t2, t1], 
      normal: [Math.cos((i + 0.5) / segments * Math.PI * 2), 0, Math.sin((i + 0.5) / segments * Math.PI * 2)] 
    });
    // Bottom triangle cap
    faces.push({ indices: [botCenterIdx, b2, b1], normal: [0, -1, 0] });
    // Top triangle cap
    faces.push({ indices: [topCenterIdx, t1, t2], normal: [0, 1, 0] });
  }

  return { id: Math.random().toString(36), name, color, vertices, faces, offset };
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function TechVerse() {
  const navigate = useNavigate();

  // Search Engine States
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['CPU', 'RAM', 'LED', 'Blockchain']);
  const [popularSearches] = useState(['RTX GPU', 'Intel CPU', 'OS Layers', 'Motherboard']);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Active Model State
  const [activeModelKey, setActiveModelKey] = useState(null);
  const [explodedScale, setExplodedScale] = useState(0);
  const [renderMode, setRenderMode] = useState('pbr'); // pbr, wireframe, transparent
  const [crossSectionSlice, setCrossSectionSlice] = useState(15); // cut section coordinate boundary
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedPartIndex, setSelectedPartIndex] = useState(null);

  // Camera Settings
  const [rotationX, setRotationX] = useState(-0.5);
  const [rotationY, setRotationY] = useState(0.5);
  const [zoomScale, setZoomScale] = useState(15);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // Caliper Measurement Tools
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measuredPoints, setMeasuredPoints] = useState([]);
  const [measuredDistance, setMeasuredDistance] = useState(null);

  // Viewport DOM Canvas refs
  const canvasRef = useRef(null);
  const viewportWrapperRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Learning Panel Configuration
  const [learningTab, setLearningTab] = useState('overview'); // overview, working, structure, guide, quiz, flashcards
  const [activeLang, setActiveLang] = useState('en'); // en, es, fr, de, hi
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // AI Tutor States
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatLog, setAiChatLog] = useState([
    { role: 'tutor', text: 'Hello! I am your 3D TechVerse AI Tutor. Click any model part or ask me hardware, networking, or electronics questions!' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Performance Profiling
  const [fps, setFps] = useState(60);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const [lodLevel, setLodLevel] = useState('High'); // High, Medium, Low (LOD)

  // Speech Recognition hook
  const recognitionRef = useRef(null);
  const [narrationPlaying, setNarrationPlaying] = useState(false);

  // Translate mode dictionaries
  const translations = {
    es: { overview: 'Resumen', working: 'Funcionamiento', structure: 'Estructura', guide: 'Guía de Reparación', quiz: 'Cuestionario', flashcards: 'Tarjetas', specs: 'Especificaciones', history: 'Historia', advantages: 'Ventajas', disadvantages: 'Desventajas' },
    fr: { overview: 'Aperçu', working: 'Fonctionnement', structure: 'Structure', guide: 'Guide Réparation', quiz: 'Quiz', flashcards: 'Cartes', specs: 'Spécifications', history: 'Histoire', advantages: 'Avantages', disadvantages: 'Inconvénients' },
    de: { overview: 'Überblick', working: 'Arbeitsweise', structure: 'Struktur', guide: 'Reparaturanleitung', quiz: 'Quiz', flashcards: 'Karteikarten', specs: 'Spezifikationen', history: 'Geschichte', advantages: 'Vorteile', disadvantages: 'Nachteile' },
    hi: { overview: 'अवलोकन', working: 'कार्य सिद्धांत', structure: 'संरचना', guide: 'मरम्मत गाइड', quiz: 'प्रश्नोत्तरी', flashcards: 'फ्लैशकार्ड', specs: 'विनिर्देश', history: 'इतिहास', advantages: 'लाभ', disadvantages: 'हानि' },
    en: { overview: 'Overview', working: 'Working Principle', structure: 'Structure', guide: 'Repair Guide', quiz: 'Quiz', flashcards: 'Flashcards', specs: 'Specifications', history: 'History', advantages: 'Advantages', disadvantages: 'Disadvantages' }
  };

  const getTranslatedLabel = (key) => {
    return translations[activeLang]?.[key] || translations['en'][key];
  };

  // Suggestion updater
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }
    const matches = getSuggestions(searchQuery);
    setSuggestions(matches);
  }, [searchQuery]);

  // Voice Search setup
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
      toast.error('Speech recognition not supported in this browser.');
      return;
    }
    if (isVoiceListening) {
      recognitionRef.current.stop();
      setIsVoiceListening(false);
    } else {
      setIsVoiceListening(true);
      recognitionRef.current.start();
      toast.success('Listening... Speak a hardware or software name.');
    }
  };

  const handleSearch = (query) => {
    const resolvedKey = resolveModelKey(query);
    if (resolvedKey) {
      setActiveModelKey(resolvedKey);
      setSearchQuery('');
      setSuggestions([]);
      setSelectedPartIndex(null);
      setQuizIndex(0);
      setQuizAnswered(false);
      setSelectedAnswer(null);
      setMeasuredPoints([]);
      setMeasuredDistance(null);
      
      setRecentSearches(prev => {
        const filtered = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
        return [query, ...filtered].slice(0, 5);
      });
      
      toast.success(`Loaded 3D Model: ${MODELS_DATA[resolvedKey].name}`);
    } else {
      toast.error(`Could not locate 3D model configuration for "${query}"`);
    }
  };

  // TTS Voice Narration
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      toast.error('TTS Audio not supported in this browser.');
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

  // Conversational AI Tutor reply simulation
  const handleAiQuestion = (e) => {
    e.preventDefault();
    if (!aiChatQuery.trim()) return;
    const query = aiChatQuery;
    setAiChatLog(prev => [...prev, { role: 'user', text: query }]);
    setAiChatQuery('');
    setAiLoading(true);

    setTimeout(() => {
      let response = '';
      const q = query.toLowerCase();
      const currentModel = activeModelKey ? MODELS_DATA[activeModelKey] : null;

      if (currentModel) {
        if (q.includes('work') || q.includes('how')) {
          response = `The ${currentModel.name} works as follows: ${currentModel.workingPrinciple}`;
        } else if (q.includes('spec') || q.includes('detail')) {
          response = `Here are the specifications for the ${currentModel.name}: ${currentModel.specifications}`;
        } else if (q.includes('fail') || q.includes('repair') || q.includes('fix')) {
          response = `Regarding repair guidelines: ${currentModel.repairGuide}`;
        } else if (q.includes('advantage') || q.includes('benefit')) {
          response = `Key benefits: ${currentModel.advantages}. However, challenges include: ${currentModel.disadvantages}`;
        } else if (q.includes('part') || q.includes('structure') || q.includes('inside')) {
          const partsStr = currentModel.parts?.map(p => `${p.name} (${p.desc})`).join(', ');
          response = `The internal assembly contains: ${partsStr}`;
        } else {
          response = `The ${currentModel.name} is a vital ${currentModel.category} component. It has applications in ${currentModel.applications || 'various engineering fields'}. Do you have questions about its specifications, working principles, or troubleshooting?`;
        }
      } else {
        response = "Please load a 3D model first, and I will be happy to explain its sub-components, internal registers, dataflows, and common repair protocols!";
      }

      setAiChatLog(prev => [...prev, { role: 'tutor', text: response }]);
      setAiLoading(false);
      speakText(response);
    }, 1200);
  };

  // ============================================================================
  // 3D GRAPHICS PROJECTION PIPELINE
  // ============================================================================

  const projectPoint = (x, y, z, width, height) => {
    const focalLength = 320;
    
    // Y-Axis Rotation (yaw)
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;

    // X-Axis Rotation (pitch)
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    let y2 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    // Apply translation panning
    x1 += panX;
    y2 += panY;

    // Camera offset zoom
    const cameraDepthOffset = zoomScale + 25;
    const projectedDepth = z2 + cameraDepthOffset;

    if (projectedDepth <= 0.1) return null; // clip clipping boundary
    
    const screenX = (x1 * focalLength) / projectedDepth + width / 2;
    const screenY = -(y2 * focalLength) / projectedDepth + height / 2;

    return { x: screenX, y: screenY, depth: projectedDepth };
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear viewport with deep tech gradient background
    ctx.fillStyle = '#080D1F';
    ctx.fillRect(0, 0, width, height);

    // Draw coordinate alignment overlay grid
    ctx.strokeStyle = '#121C37';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    if (!activeModelKey || !MODELS_DATA[activeModelKey]) return;
    const model = MODELS_DATA[activeModelKey];

    // Build the meshes dynamically from layout templates
    let partsList = [];
    if (model.shapes) {
      partsList = model.shapes.map((s, idx) => {
        let mesh;
        if (s.shape === 'box') {
          mesh = makeBox(s.size[0], s.size[1], s.size[2], s.color, s.name, s.offset || [0, 0, 0]);
        } else {
          mesh = makeCylinder(s.radius, s.height, s.segments || 10, s.color, s.name, s.offset || [0, 0, 0]);
        }
        mesh.partIndex = idx;
        return mesh;
      });
    }

    // Determine Level of Detail (LOD) based on zoom depth & rotation speed
    // If zoomed far away, downscale segments to optimize frame budgets
    let currentLod = 'High';
    if (zoomScale > 35) {
      currentLod = 'Low';
    } else if (zoomScale > 22) {
      currentLod = 'Medium';
    }
    if (lodLevel !== currentLod) {
      setLodLevel(currentLod);
    }

    const polygonsToRender = [];

    partsList.forEach((part) => {
      // LOD optimization: Skip secondary parts (like pins, clips) on Low detail
      if (currentLod === 'Low' && part.name.toLowerCase().includes('pin')) {
        return;
      }

      // Exploded View expansion offset translation vectors
      const expX = part.offset[0] * (1 + explodedScale * 1.4);
      const expY = part.offset[1] * (1 + explodedScale * 1.4);
      const expZ = part.offset[2] * (1 + explodedScale * 1.4);

      part.faces.forEach((face) => {
        const projectedVertices = [];
        let avgDepth = 0;
        let visibleCount = 0;
        let slicedOut = false;

        face.indices.forEach((vIdx) => {
          const v = part.vertices[vIdx];
          const rawX = v[0] + expX;
          const rawY = v[1] + expY;
          const rawZ = v[2] + expZ;

          // Cross section slicing check along the X plane
          if (rawX > crossSectionSlice) {
            slicedOut = true;
          }

          const proj = projectPoint(rawX, rawY, rawZ, width, height);
          if (proj) {
            projectedVertices.push(proj);
            avgDepth += proj.depth;
            visibleCount++;
          }
        });

        // Face lighting & Ambient shading (PBR diffuse simulation)
        const normal = face.normal;
        const lightDir = [0.5, 0.8, -0.5]; // directional lighting vector
        const lightLen = Math.sqrt(lightDir[0]*lightDir[0] + lightDir[1]*lightDir[1] + lightDir[2]*lightDir[2]);
        const dot = (normal[0]*lightDir[0] + normal[1]*lightDir[1] + normal[2]*lightDir[2]) / lightLen;
        const brightness = Math.max(0.2, (dot + 1) / 2); // Diffuse multiplier

        if (visibleCount === face.indices.length && !slicedOut) {
          polygonsToRender.push({
            vertices: projectedVertices,
            depth: avgDepth / visibleCount,
            color: part.color,
            name: part.name,
            partIndex: part.partIndex,
            brightness
          });
        }
      });
    });

    // Painter's algorithm depth sorting (furthest polygons drawn first)
    polygonsToRender.sort((a, b) => b.depth - a.depth);

    // Render pass
    polygonsToRender.forEach((poly) => {
      ctx.beginPath();
      ctx.moveTo(poly.vertices[0].x, poly.vertices[0].y);
      for (let i = 1; i < poly.vertices.length; i++) {
        ctx.lineTo(poly.vertices[i].x, poly.vertices[i].y);
      }
      ctx.closePath();

      const isSelected = selectedPartIndex === poly.partIndex;

      if (renderMode === 'wireframe') {
        ctx.strokeStyle = isSelected ? '#10B981' : poly.color;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else {
        ctx.fillStyle = isSelected ? '#10B981' : poly.color;
        ctx.globalAlpha = renderMode === 'transparent' ? 0.4 : 1.0;
        ctx.fill();

        // Highlight shininess diffuse shading overlay
        ctx.globalAlpha = 0.18 * poly.brightness;
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.strokeStyle = isSelected ? '#34D399' : '#040815';
        ctx.lineWidth = isSelected ? 1.8 : 0.6;
        ctx.stroke();
      }
    });

    // Draw active annotation label tags directly in 3D projection space
    if (selectedPartIndex !== null && partsList[selectedPartIndex]) {
      const part = partsList[selectedPartIndex];
      const cx = part.offset[0] * (1 + explodedScale * 1.4);
      const cy = part.offset[1] * (1 + explodedScale * 1.4);
      const cz = part.offset[2] * (1 + explodedScale * 1.4);
      const projectedCenter = projectPoint(cx, cy, cz, width, height);

      if (projectedCenter) {
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(projectedCenter.x, projectedCenter.y);
        ctx.lineTo(projectedCenter.x + 35, projectedCenter.y - 30);
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.fillRect(projectedCenter.x + 35, projectedCenter.y - 45, 120, 20);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(part.name.substring(0, 20), projectedCenter.x + 40, projectedCenter.y - 32);
      }
    }

    // Draw caliper measurement guides
    if (measurementMode && measuredPoints.length > 0) {
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      const startProj = projectPoint(measuredPoints[0][0], measuredPoints[0][1], measuredPoints[0][2], width, height);
      if (startProj) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath(); ctx.arc(startProj.x, startProj.y, 6, 0, Math.PI*2); ctx.fill();
        
        if (measuredPoints.length > 1) {
          const endProj = projectPoint(measuredPoints[1][0], measuredPoints[1][1], measuredPoints[1][2], width, height);
          if (endProj) {
            ctx.beginPath(); ctx.arc(endProj.x, endProj.y, 6, 0, Math.PI*2); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(startProj.x, startProj.y);
            ctx.lineTo(endProj.x, endProj.y);
            ctx.stroke();

            ctx.setLineDash([]);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px monospace';
            ctx.fillText(`${measuredDistance} mm`, (startProj.x + endProj.x)/2 + 10, (startProj.y + endProj.y)/2);
          }
        }
      }
      ctx.setLineDash([]);
    }
  };

  // Rendering Tick loop
  useEffect(() => {
    const tick = () => {
      const now = performance.now();
      frameCountRef.current++;
      if (now > lastTimeRef.current + 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      if (autoRotate && !isDraggingRef.current) {
        setRotationY((prev) => (prev + 0.005) % (Math.PI * 2));
      }

      drawScene();
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [rotationX, rotationY, zoomScale, panX, panY, activeModelKey, explodedScale, renderMode, crossSectionSlice, selectedPartIndex, autoRotate, measurementMode, measuredPoints]);

  // Dragging event controllers (orbit camera)
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (e.buttons === 2) {
      // Right drag -> Panning
      setPanX((prev) => prev + dx * 0.04);
      setPanY((prev) => prev - dy * 0.04);
    } else {
      // Left drag -> Orbit Rotation
      setRotationY((prev) => (prev + dx * 0.008) % (Math.PI * 2));
      setRotationX((prev) => Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, prev + dy * 0.008)));
    }
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Scroll wheel Zoom controller
  const handleWheel = (e) => {
    e.preventDefault();
    setZoomScale((prev) => Math.max(5, Math.min(60, prev + e.deltaY * 0.02)));
  };

  // Caliper coordinates and click calculations
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2;
    const clickY = -(e.clientY - rect.top - rect.height / 2);
    
    if (measurementMode) {
      // Caliper coordinate simulator
      const simulatedZ = 0;
      if (measuredPoints.length >= 2) {
        setMeasuredPoints([[clickX / 14, clickY / 14, simulatedZ]]);
        setMeasuredDistance(null);
      } else {
        const nextPoints = [...measuredPoints, [clickX / 14, clickY / 14, simulatedZ]];
        setMeasuredPoints(nextPoints);
        if (nextPoints.length === 2) {
          const p1 = nextPoints[0];
          const p2 = nextPoints[1];
          const dist = Math.sqrt(
            Math.pow(p1[0] - p2[0], 2) +
            Math.pow(p1[1] - p2[1], 2) +
            Math.pow(p1[2] - p2[2], 2)
          );
          setMeasuredDistance((dist * 7.8).toFixed(1));
          toast.success(`Distance measured: ${(dist * 7.8).toFixed(1)} mm`);
        }
      }
      return;
    }

    // Raycast parts click match simulation
    const model = MODELS_DATA[activeModelKey];
    if (model && model.shapes) {
      // Cycle selected components
      const nextIdx = selectedPartIndex === null ? 0 : (selectedPartIndex + 1) % model.shapes.length;
      setSelectedPartIndex(nextIdx);
      
      const partDetail = model.parts?.[nextIdx % model.parts.length];
      if (partDetail) {
        speakText(partDetail.desc);
        toast(`Highlight: ${partDetail.name}`);
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
    setCrossSectionSlice(15);
    setSelectedPartIndex(null);
    setMeasuredPoints([]);
    setMeasuredDistance(null);
    setMeasurementMode(false);
    toast.success('Camera view reset completed');
  };

  // Full Screen Viewport
  const toggleFullScreen = () => {
    const el = viewportWrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => toast.error('Fullscreen access denied.'));
    } else {
      document.exitFullscreen();
    }
  };

  // Quiz calculations
  const activeQuizList = activeModelKey ? MODELS_DATA[activeModelKey].quiz || [] : [];
  const handleQuizAnswer = (idx) => {
    if (quizAnswered) return;
    setSelectedAnswer(idx);
    setQuizAnswered(true);
    if (idx === activeQuizList[quizIndex].a) {
      setQuizScore(prev => prev + 1);
      toast.success('Correct Answer! +50 XP earned');
    } else {
      toast.error('Incorrect option selected.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#070B19] text-slate-100 font-sans flex flex-col justify-between overflow-x-hidden">
      
      {/* 3D TECHVERSE HUD HEADER */}
      <header className="px-6 py-4 bg-[#090D1E] border-b border-blue-900/30 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg shadow-blue-500/20 text-white">🔮</div>
          <div>
            <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-extrabold flex items-center gap-1.5">
              <Sparkles size={11} className="text-blue-400 animate-pulse" /> Interactive Computer Engineering Laboratory
            </span>
            <h1 className="text-lg font-black text-white leading-none">EduVerse 3D TechVerse</h1>
          </div>
        </div>

        {/* Intelligent Synonym Search & Suggestion Bar */}
        <div className="relative flex items-center gap-2 max-w-lg w-full">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400 pointer-events-none">
              <Search size={15} />
            </span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search components (e.g. RAM, GPU, CPU, LED, OS, Router...)"
              className="w-full bg-[#0E1630] border border-blue-900/30 focus:border-blue-500 text-slate-100 text-xs rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-semibold"
            />
            {/* Auto-complete Suggestions popup */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 mt-2 bg-[#090D1E] border border-blue-900/50 rounded-xl overflow-hidden shadow-2xl z-30 divide-y divide-blue-950/40"
                >
                  {suggestions.map((item) => (
                    <button 
                      key={item.name}
                      onClick={() => handleSearch(item.name)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-950/40 text-xs font-bold transition flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      <span className="text-[8px] uppercase bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded-full font-mono">{item.category}</span>
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
                : 'bg-[#0E1630] border-blue-900/30 text-blue-400 hover:bg-blue-950/40'
            }`}
            title="Voice Search Activation"
          >
            {isVoiceListening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        </div>
      </header>

      {/* DASHBOARD OR VIEWER RENDER BLOCK */}
      {!activeModelKey ? (
        
        /* 1. DISCOVERY / WELCOME HERO HUB */
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-10">
          
          {/* Welcome Banner */}
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/50 via-indigo-950/30 to-[#090D1E] p-8 border border-blue-900/30 overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-[90px] pointer-events-none" />
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <span className="text-[9px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-3.5 py-1 rounded-full">Interactive Computer Architecture Laboratory</span>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">Deconstruct Hardware & Software Architectures in Interactive 3D</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Deconstruct core logic nodes, study full technical specifications, execute exploded assembly reviews, and chat with AI tutors to master engineering.
              </p>
              <div className="flex gap-3 pt-2 justify-center md:justify-start">
                <button 
                  onClick={() => handleSearch('CPU')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  Launch CPU <ArrowRight size={13} />
                </button>
                <button 
                  onClick={() => handleSearch('RAM')}
                  className="px-5 py-2.5 bg-blue-950/50 border border-blue-900/30 text-blue-400 font-bold rounded-xl text-xs hover:bg-blue-900/40 transition cursor-pointer"
                >
                  Explore DDR5 RAM
                </button>
              </div>
            </div>
            {/* Visual 3D Orbit Spinner */}
            <div className="w-48 h-48 rounded-full border border-dashed border-indigo-500/20 flex items-center justify-center relative animate-spin-slow">
              <div className="w-36 h-36 rounded-full border border-dashed border-blue-500/30 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-2xl text-white shadow-2xl">🔮</div>
              </div>
            </div>
          </div>

          {/* Quick Categories cards grid */}
          <div className="space-y-4 text-left">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Layout size={14} className="text-indigo-400" /> Explore Tech categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => handleSearch('CPU')} className="p-5 bg-[#090D1E] border border-blue-900/20 hover:border-blue-500 rounded-2xl cursor-pointer group transition duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">🖥️</div>
                <h4 className="font-bold text-sm text-white">Computer Hardware</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">CPU, DDR5 RAM, Motherboard, PCIe Expansion cards, ROM chipsets...</p>
              </div>
              <div onClick={() => handleSearch('Router')} className="p-5 bg-[#090D1E] border border-blue-900/20 hover:border-blue-500 rounded-2xl cursor-pointer group transition duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">🌐</div>
                <h4 className="font-bold text-sm text-white">Networking Devices</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Dual-band Routers, Gigabit Switches, patch configurations...</p>
              </div>
              <div onClick={() => handleSearch('LED')} className="p-5 bg-[#090D1E] border border-blue-900/20 hover:border-blue-500 rounded-2xl cursor-pointer group transition duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">⚡</div>
                <h4 className="font-bold text-sm text-white">Electronics & IoT</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">LED diodes, film resistors, electrolytic capacitors, Arduino Uno boards...</p>
              </div>
              <div onClick={() => handleSearch('OS')} className="p-5 bg-[#090D1E] border border-blue-900/20 hover:border-blue-500 rounded-2xl cursor-pointer group transition duration-300">
                <div className="text-3xl mb-3 group-hover:scale-110 transition duration-300">⚙️</div>
                <h4 className="font-bold text-sm text-white">Software Architecture</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Monolithic OS kernels, blockchain ledger blocks, neural layers...</p>
              </div>
            </div>
          </div>

          {/* Featured Models list & Searches row */}
          <div className="grid lg:grid-cols-3 gap-6 text-left">
            
            {/* Library Showcase */}
            <div className="lg:col-span-2 bg-[#090D1E] border border-blue-900/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Interactive Models</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(MODELS_DATA).map((key) => {
                  const m = MODELS_DATA[key];
                  return (
                    <div 
                      key={key}
                      onClick={() => handleSearch(key)}
                      className="p-3.5 bg-blue-950/10 border border-blue-900/20 hover:border-blue-500 rounded-xl cursor-pointer transition flex flex-col justify-between"
                    >
                      <span className="text-[8px] uppercase tracking-wider bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-md font-bold self-start">{m.category}</span>
                      <div className="mt-3">
                        <h4 className="text-xs font-bold text-white line-clamp-1">{m.name}</h4>
                        <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5 font-medium">{m.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Searches panel */}
            <div className="bg-[#090D1E] border border-blue-900/20 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Popular Searches</h4>
                <div className="flex flex-wrap gap-1.5">
                  {popularSearches.map(q => (
                    <button 
                      key={q} 
                      onClick={() => handleSearch(q)}
                      className="text-[9px] font-bold px-2.5 py-1.5 bg-blue-950/30 hover:bg-blue-900/30 text-blue-300 border border-blue-900/20 rounded-lg transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-blue-950/45">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recently Viewed</h4>
                <div className="space-y-1">
                  {recentSearches.map((q, idx) => (
                    <button 
                      key={q + idx} 
                      onClick={() => handleSearch(q)}
                      className="w-full text-left px-2 py-1 hover:bg-blue-950/20 rounded-lg text-xs font-semibold text-slate-300 transition flex items-center gap-2"
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
        
        /* 2. DYNAMIC 3D VIEWER WORKSPACE */
        <main className="flex-1 w-full p-4 overflow-hidden flex flex-col lg:flex-row gap-4 h-[calc(100vh-170px)]">
          
          {/* VIEWPORT CONTROLLER & CANVAS DRAWABLE area */}
          <div ref={viewportWrapperRef} className="flex-1 bg-[#090D1E] border border-blue-900/30 rounded-2xl relative overflow-hidden flex flex-col shadow-2xl">
            <canvas 
              ref={canvasRef}
              width={800}
              height={500}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onClick={handleCanvasClick}
              className="w-full flex-1 cursor-grab active:cursor-grabbing outline-none"
            />

            {/* Performance status & details badge overlay */}
            <div className="absolute top-4 left-4 flex items-center gap-3 bg-[#080D1F]/90 border border-blue-900/20 px-3.5 py-1.5 rounded-full z-10 font-mono text-[9px] text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> FPS: {fps}</span>
              <span className="text-blue-950">|</span>
              <span className="flex items-center gap-1.5">LOD: {lodLevel}</span>
              <span className="text-blue-950">|</span>
              <span className="flex items-center gap-1.5">Auto-Rotate: {autoRotate ? 'ON' : 'OFF'}</span>
            </div>

            {/* Viewport Control Panel Drawer */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              {/* Reset View */}
              <button 
                onClick={resetView} 
                className="p-2.5 bg-[#080D1F]/90 border border-blue-900/20 hover:border-blue-400 text-blue-400 rounded-xl transition"
                title="Reset Camera & Viewport"
              >
                <RotateCw size={14} />
              </button>

              {/* Wireframe toggle */}
              <button 
                onClick={() => setRenderMode(prev => prev === 'wireframe' ? 'pbr' : 'wireframe')} 
                className={`p-2.5 border rounded-xl transition ${renderMode === 'wireframe' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#080D1F]/90 border-blue-900/20 text-blue-400'}`}
                title="Wireframe Skeleton View"
              >
                <Layers size={14} />
              </button>

              {/* Translucent view */}
              <button 
                onClick={() => setRenderMode(prev => prev === 'transparent' ? 'pbr' : 'transparent')} 
                className={`p-2.5 border rounded-xl transition ${renderMode === 'transparent' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#080D1F]/90 border-blue-900/20 text-blue-400'}`}
                title="Glass Translucent View"
              >
                <Volume2 size={14} className="rotate-90" />
              </button>

              {/* Auto rotate toggle */}
              <button 
                onClick={() => setAutoRotate(!autoRotate)} 
                className={`p-2.5 border rounded-xl transition ${autoRotate ? 'bg-blue-600 border-blue-400 text-white' : 'bg-[#080D1F]/90 border-blue-900/20 text-blue-400'}`}
                title="Auto Rotate Rotation"
              >
                <RefreshCw size={14} className={autoRotate ? 'animate-spin' : ''} />
              </button>

              {/* Caliper measurement caliper */}
              <button 
                onClick={() => {
                  setMeasurementMode(!measurementMode);
                  setMeasuredPoints([]);
                  setMeasuredDistance(null);
                }} 
                className={`p-2.5 border rounded-xl transition ${measurementMode ? 'bg-red-500 border-red-400 text-white' : 'bg-[#080D1F]/90 border-blue-900/20 text-blue-400'}`}
                title="Measurement Caliper"
              >
                📏
              </button>

              {/* Toggle Full Screen */}
              <button 
                onClick={toggleFullScreen}
                className="p-2.5 bg-[#080D1F]/90 border border-blue-900/20 hover:border-blue-400 text-blue-400 rounded-xl transition"
                title="Toggle Fullscreen View"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            {/* Orbit Hint banner overlay */}
            <div className="absolute bottom-4 left-4 text-[8px] font-mono text-slate-400 bg-[#080D1F]/70 px-3 py-1 rounded-md pointer-events-none">
              Left Click + Drag: Rotate | Right Click + Drag: Pan | Scroll wheel: Zoom | Click parts to highlight
            </div>

            {/* Dual Slider adjust controls */}
            <div className="p-4 bg-[#090D1E] border-t border-blue-900/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {/* Exploded assembly slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">🔧 EXPLODED ASSEMBLY VIEW</span>
                  <span className="font-mono text-blue-400">{(explodedScale * 100).toFixed(0)}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={explodedScale}
                  onChange={(e) => setExplodedScale(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-blue-950/40 rounded-lg appearance-none h-1"
                />
              </div>

              {/* Cross-section cut coordinate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">✂️ CROSS-SECTION CUT PLANE</span>
                  <span className="font-mono text-blue-400">X = {crossSectionSlice.toFixed(1)}</span>
                </div>
                <input 
                  type="range"
                  min="-15"
                  max="15"
                  step="0.5"
                  value={crossSectionSlice}
                  onChange={(e) => setCrossSectionSlice(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-blue-950/40 rounded-lg appearance-none h-1"
                />
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR PANEL - DETAILED LECTURES & AI CHAT */}
          <div className="w-full lg:w-[420px] shrink-0 bg-[#090D1E] border border-blue-900/30 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto custom-sidebar-scroll shadow-2xl text-left">
            
            {/* Subject card title */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase bg-indigo-950 text-indigo-400 border border-indigo-900/30 px-3 py-0.5 rounded-full font-black">
                  {MODELS_DATA[activeModelKey].category}
                </span>
                <button 
                  onClick={() => {
                    setActiveModelKey(null);
                    window.speechSynthesis.cancel();
                  }}
                  className="text-xs text-slate-400 hover:text-white transition font-bold"
                >
                  ← Home
                </button>
              </div>
              <div>
                <h2 className="text-lg font-black text-white">{MODELS_DATA[activeModelKey].name}</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-1 font-medium">{MODELS_DATA[activeModelKey].description}</p>
              </div>

              {/* Dynamic educational tabs list */}
              <div className="flex flex-wrap bg-[#0E1630] border border-blue-900/20 p-1 rounded-xl gap-1 text-[9px] font-bold">
                {['overview', 'working', 'structure', 'guide', 'quiz', 'flashcards'].map((tab) => (
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

            {/* TAB CONTENT HOUSER CONTAINER */}
            <div className="flex-1 py-4 text-left overflow-y-auto max-h-[35vh] custom-sidebar-scroll">
              
              {/* Translate widget */}
              <div className="flex items-center gap-1.5 pb-2.5 mb-3 border-b border-blue-950/45">
                <Languages size={12} className="text-indigo-400 animate-pulse" />
                <span className="text-[8px] uppercase font-black text-slate-500">TRANSLATION ENGINE:</span>
                <div className="flex gap-1">
                  {['en', 'es', 'fr', 'de', 'hi'].map((langCode) => (
                    <button 
                      key={langCode}
                      onClick={() => setActiveLang(langCode)}
                      className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded transition ${activeLang === langCode ? 'bg-indigo-900 text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      {langCode.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* A. OVERVIEW DETAILS */}
              {learningTab === 'overview' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[9px] uppercase font-bold text-indigo-400">{getTranslatedLabel('specs')}</h4>
                    <p className="text-xs font-mono font-bold bg-[#0D152D] border border-blue-900/10 p-2.5 rounded-lg text-blue-300 leading-normal">
                      {MODELS_DATA[activeModelKey].specifications}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[9px] uppercase font-bold text-slate-400">{getTranslatedLabel('history')}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {MODELS_DATA[activeModelKey].history}
                    </p>
                  </div>
                </div>
              )}

              {/* B. WORKING PRINCIPLE */}
              {learningTab === 'working' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-[9px] uppercase font-bold text-indigo-400">WORKING MECHANISMS</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                      {MODELS_DATA[activeModelKey].workingPrinciple}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <div className="p-3 bg-emerald-950/15 border border-emerald-900/20 rounded-xl">
                      <span className="text-[9px] font-bold text-emerald-400 block mb-0.5">👍 ADVANTAGES</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{MODELS_DATA[activeModelKey].advantages}</p>
                    </div>
                    <div className="p-3 bg-red-950/15 border border-red-900/20 rounded-xl">
                      <span className="text-[9px] font-bold text-red-400 block mb-0.5">👎 DISADVANTAGES</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">{MODELS_DATA[activeModelKey].disadvantages}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* C. INTERNAL STRUCTURE DETAILS */}
              {learningTab === 'structure' && (
                <div className="space-y-3">
                  <h4 className="text-[9px] uppercase font-bold text-slate-400">STRUCTURE HOTSPOTS ({MODELS_DATA[activeModelKey].parts?.length || 0})</h4>
                  <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">Hover and click parts inside the 3D viewport canvas or click items below to run narration checks.</p>
                  <div className="space-y-2">
                    {MODELS_DATA[activeModelKey].parts?.map((p, idx) => (
                      <div 
                        key={p.name}
                        onClick={() => {
                          setSelectedPartIndex(idx);
                          speakText(p.desc);
                        }}
                        className={`p-3 rounded-xl border transition cursor-pointer ${
                          selectedPartIndex === idx 
                            ? 'bg-blue-950/20 border-blue-500 shadow-md' 
                            : 'bg-blue-950/5 border-blue-900/10 hover:border-blue-900/30'
                        }`}
                      >
                        <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> {p.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-medium">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* D. REPAIR GUIDE */}
              {learningTab === 'guide' && (
                <div className="space-y-3">
                  <h4 className="text-[9px] uppercase font-bold text-indigo-400">TROUBLESHOOTING & REPAIR</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {MODELS_DATA[activeModelKey].repairGuide}
                  </p>
                </div>
              )}

              {/* E. QUIZ MODULE */}
              {learningTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-blue-950/45">
                    <span className="text-[9px] font-bold uppercase text-slate-500">Module Quiz Challenge</span>
                    <span className="text-[10px] font-mono text-blue-400 font-bold">Score: {quizScore}/{activeQuizList.length}</span>
                  </div>

                  {activeQuizList.length > 0 ? (
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
                                  ? 'bg-emerald-950/20 border-emerald-500 text-emerald-300'
                                  : selectedAnswer === idx
                                    ? 'bg-red-950/20 border-red-500 text-red-300'
                                    : 'bg-[#0E1630] border-blue-900/10 text-slate-500'
                                : 'bg-[#0E1630] border-blue-900/20 hover:border-blue-400 text-slate-200'
                            }`}
                          >
                            <span className="font-bold mr-2 text-[9px]">{String.fromCharCode(65 + idx)}.</span>
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
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] py-2.5 rounded-xl mt-3 transition uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {quizIndex + 1 >= activeQuizList.length ? 'Restart Quiz' : 'Next Question'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No quiz questions loaded for this visualizer yet.</p>
                  )}
                </div>
              )}

              {/* F. FLASHCARDS */}
              {learningTab === 'flashcards' && (
                <div className="space-y-4">
                  <h4 className="text-[9px] uppercase font-bold text-slate-400">STUDY FLASHCARDS</h4>
                  {MODELS_DATA[activeModelKey].flashcards?.map((card, idx) => (
                    <div key={idx} className="p-4 bg-blue-950/10 border border-blue-900/20 rounded-xl space-y-2">
                      <span className="text-[8px] uppercase font-mono text-indigo-400">Question {idx + 1}</span>
                      <p className="text-xs font-bold text-white">{card.q}</p>
                      <div className="pt-2 border-t border-blue-950/45">
                        <span className="text-[8px] uppercase font-mono text-emerald-400">Answer</span>
                        <p className="text-[11px] text-slate-300 font-semibold">{card.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI TUTOR WIDGET CHAT INTERACTION */}
            <div className="border-t border-blue-950/45 pt-4 mt-auto">
              <div className="bg-[#080C19]/60 border border-blue-900/15 p-3 rounded-xl space-y-2 mb-3 max-h-[140px] overflow-y-auto custom-sidebar-scroll">
                {aiChatLog.map((log, index) => (
                  <div key={index} className={`text-xs leading-relaxed font-semibold flex items-start gap-1.5 ${log.role === 'tutor' ? 'text-blue-300' : 'text-slate-300'}`}>
                    <span>{log.role === 'tutor' ? '🤖' : '👤'}</span>
                    <p>{log.text}</p>
                  </div>
                ))}
                {aiLoading && (
                  <div className="text-[9px] text-slate-500 font-mono animate-pulse">AI Tutor is generating answer...</div>
                )}
              </div>

              <form onSubmit={handleAiQuestion} className="flex gap-2">
                <input 
                  type="text" 
                  value={aiChatQuery}
                  onChange={(e) => setAiChatQuery(e.target.value)}
                  placeholder="Ask AI Tutor details about this component..."
                  className="flex-1 bg-[#0E1630] border border-blue-900/30 focus:border-blue-500 text-slate-100 text-xs rounded-xl px-3 py-2.5 focus:outline-none transition font-semibold"
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

      {/* 3D ENGINE BAR STATUS FOOTER */}
      <footer className="px-6 py-2.5 bg-[#050814] border-t border-blue-950/30 flex justify-between text-[9px] text-slate-500 font-mono">
        <span>EduVerse 3D Engine • WebGL Shader v2.0</span>
        <span>Keyboard Navigation • High Contrast • Screen Reader</span>
      </footer>
    </div>
  );
}

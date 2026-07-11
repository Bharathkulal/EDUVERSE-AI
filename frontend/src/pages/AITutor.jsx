import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Cpu, Sliders, Database, BarChart2, 
  RotateCcw, Play, Activity, Settings, Network
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AITutor() {
  // Hyperparameters
  const [learningRate, setLearningRate] = useState(0.01);
  const [batchSize, setBatchSize] = useState(32);
  const [optimizer, setOptimizer] = useState('Adam');
  const [activation, setActivation] = useState('ReLU');
  
  // Training Simulation State
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [confidence, setConfidence] = useState(0.5);

  // Active sub-page elements (Quick Access)
  const [activeAccessCard, setActiveAccessCard] = useState(null);

  // Canvas Refs
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Generate Simulation Data based on hyperparameters
  const generateFullHistory = (lr, bs, opt, act) => {
    let history = [];
    let currentLoss = 0.95;
    let currentTrainAcc = 0.42;
    let currentValAcc = 0.40;

    // Hyperparameter multipliers
    const lrFactor = lr > 0.05 ? 1.4 : lr < 0.005 ? 0.6 : 1.0;
    const optFactor = opt === 'Adam' ? 1.2 : opt === 'RMSprop' ? 1.05 : 0.85;
    const actFactor = act === 'ReLU' ? 1.1 : act === 'GELU' ? 1.15 : act === 'Tanh' ? 0.95 : 0.8;

    const rate = 0.15 * lrFactor * optFactor * actFactor;

    for (let epoch = 1; epoch <= 20; epoch++) {
      // Simulate loss curve decay
      const decay = Math.exp(-epoch * rate);
      const lossNoise = (Math.random() - 0.5) * 0.03 * (1 / epoch);
      currentLoss = Math.max(0.04, 0.95 * decay + lossNoise);

      // Simulate accuracy curve growth
      const accLimit = 0.92 + (opt === 'Adam' ? 0.05 : 0.02) + (lr > 0.05 ? -0.04 : 0.01);
      const accGrowth = accLimit * (1 - Math.exp(-epoch * rate * 0.95));
      const trainNoise = (Math.random() - 0.5) * 0.02;
      const valNoise = (Math.random() - 0.5) * 0.03 - (epoch > 15 && lr > 0.04 ? 0.02 : 0); // Simulate overfitting on high LR

      currentTrainAcc = Math.min(0.99, 0.42 + accGrowth + trainNoise);
      currentValAcc = Math.min(0.98, 0.40 + accGrowth * 0.96 + valNoise);

      history.push({
        epoch,
        loss: parseFloat(currentLoss.toFixed(4)),
        trainAcc: parseFloat((currentTrainAcc * 100).toFixed(1)),
        valAcc: parseFloat((currentValAcc * 100).toFixed(1))
      });
    }
    return history;
  };

  // Run Training simulation tick
  useEffect(() => {
    let interval = null;
    if (isTraining) {
      interval = setInterval(() => {
        setCurrentEpoch(prev => {
          if (prev >= 20) {
            setIsTraining(false);
            toast.success('Model Training Complete! Confidence: ' + (confidence * 100).toFixed(1) + '%');
            return prev;
          }
          const next = prev + 1;
          // Dynamically increase classification confidence
          setConfidence(0.5 + (next / 20) * 0.44 + (optimizer === 'Adam' ? 0.05 : 0.01));
          return next;
        });
      }, 350);
    }
    return () => clearInterval(interval);
  }, [isTraining, optimizer, confidence]);

  // Regenerate history when parameters change
  useEffect(() => {
    const fullHistory = generateFullHistory(learningRate, batchSize, optimizer, activation);
    setTrainingHistory(fullHistory);
    setCurrentEpoch(0);
    setIsTraining(false);
    setConfidence(0.45);
  }, [learningRate, batchSize, optimizer, activation]);

  // 3D Neural Network Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle high DPI screens
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3D Nodes setup
    const nodeCount = 38;
    const nodes = [];
    const layers = [4, 8, 10, 8, 5, 3]; // Neural network layer sizes
    
    // Distribute nodes across layer columns
    const totalLayers = layers.length;
    const layerSpacing = 300 / (totalLayers - 1 || 1);

    layers.forEach((layerSize, layerIdx) => {
      const x = -150 + layerIdx * layerSpacing;
      const verticalSpacing = 160 / (layerSize - 1 || 1);
      for (let j = 0; j < layerSize; j++) {
        const y = -80 + j * verticalSpacing;
        nodes.push({
          x,
          y,
          z: (Math.random() - 0.5) * 80,
          originalX: x,
          originalY: y,
          layer: layerIdx,
          id: `${layerIdx}-${j}`
        });
      }
    });

    let angleX = 0.003;
    let angleY = 0.005;

    // Render loop
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse rotation offsets
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const currentAngleY = angleY + mouse.x * 0.0002;
      const currentAngleX = angleX + mouse.y * 0.0002;

      // Project and rotate 3D nodes
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);
      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);

      const projectedNodes = nodes.map(node => {
        // Rotate around Y axis
        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;

        // Rotate around X axis
        let y2 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        // Perspective projection
        const depth = 280;
        const scale = depth / (depth + z2);
        const screenX = w / 2 + x1 * scale * 1.2;
        const screenY = h / 2 + y2 * scale * 1.1;

        // Rotate original values slightly for continuous movement
        node.x = x1;
        node.y = y2;
        node.z = z2;

        return {
          id: node.id,
          x: screenX,
          y: screenY,
          z: z2,
          layer: node.layer,
          scale
        };
      });

      // Draw Connections (feedforward lines)
      ctx.lineWidth = 0.45;
      for (let i = 0; i < projectedNodes.length; i++) {
        const n1 = projectedNodes[i];
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n2 = projectedNodes[j];
          
          // Connect consecutive layers
          if (n2.layer === n1.layer + 1) {
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Restrict connections to visual clarity
            if (dist < 100) {
              const alpha = Math.max(0.04, (1 - dist / 100) * 0.25 * (n1.scale + n2.scale) / 2);
              
              // Gradient line (Cyan -> Pink/Purple)
              const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
              grad.addColorStop(0, `rgba(6, 182, 212, ${alpha})`); // Cyan
              grad.addColorStop(1, `rgba(236, 72, 153, ${alpha})`); // Pink
              
              ctx.strokeStyle = grad;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }
        }
      }

      // Draw Nodes
      projectedNodes.forEach(node => {
        const radius = Math.max(1.5, 3.5 * node.scale);
        
        // Depth-based transparency
        const opacity = Math.max(0.15, (node.z + 100) / 200);
        
        // Dynamic node gradient glow
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 3);
        if (node.layer === 0) {
          // Input nodes: Bright Electric Cyan
          grad.addColorStop(0, `rgba(6, 182, 212, ${opacity})`);
          grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = `rgba(6, 182, 212, ${opacity * 0.85})`;
        } else if (node.layer === layers.length - 1) {
          // Output nodes: Magenta / Purple
          grad.addColorStop(0, `rgba(236, 72, 153, ${opacity})`);
          grad.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.fillStyle = `rgba(236, 72, 153, ${opacity * 0.85})`;
        } else {
          // Hidden layers: Purple / Indigo gradient
          grad.addColorStop(0, `rgba(168, 85, 247, ${opacity})`);
          grad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = `rgba(168, 85, 247, ${opacity * 0.8})`;
        }
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Mouse movement handler
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;
      mouseRef.current.targetX = mouseX;
      mouseRef.current.targetY = mouseY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const startTrainingRun = () => {
    setCurrentEpoch(0);
    setIsTraining(true);
    toast.loading('Initializing neural compilation run...', { id: 'train' });
    setTimeout(() => {
      toast.dismiss('train');
    }, 800);
  };

  const resetTuning = () => {
    setLearningRate(0.01);
    setBatchSize(32);
    setOptimizer('Adam');
    setActivation('ReLU');
    setCurrentEpoch(0);
    setIsTraining(false);
    setConfidence(0.45);
    toast.success('Hyperparameters reset to baseline defaults');
  };

  // Helper values for active simulation subset
  const visibleHistory = trainingHistory.slice(0, currentEpoch || 1);
  const latestMetric = visibleHistory[visibleHistory.length - 1] || { loss: 0.95, trainAcc: 42.0, valAcc: 40.0 };

  return (
    <div className="relative w-full h-full flex flex-col overflow-y-auto bg-[#070814] p-6 select-none text-white scrollbar-thin">
      {/* Background neon flares */}
      <div className="absolute top-[-10%] right-[-15%] w-[55%] h-[55%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="grain-overlay" />

      {/* ─── Top Header Section ─── */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-indigo-500/15 pb-5 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 neon-glow-text-purple flex items-center gap-2">
            <Network className="text-cyan-400 animate-pulse" size={28} />
            Neural Network Visualizer
          </h1>
          <p className="text-[#64748b] text-xs mt-1 font-medium">
            Advanced real-time hologram simulation of deep learning models and parameter backpropagation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl border border-indigo-500/15 bg-indigo-500/5 text-xs text-[#cbd5e1] font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Active Model: NeuralNet-V2.4</span>
          </div>
          
          <button 
            onClick={resetTuning}
            className="p-2.5 rounded-xl border border-indigo-500/15 bg-[#121324] hover:bg-[#1e1b4b] text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset Parameters"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* ─── Main Grid Layout ─── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        
        {/* LEFT WORKSPACE: 3D Hologram Mesh Visualizer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative dark-glass-card rounded-3xl p-5 flex flex-col h-[400px] justify-between overflow-hidden">
            {/* Hologram panel details */}
            <div className="flex justify-between items-center z-10">
              <div>
                <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">Central Projection Space</span>
                <span className="text-sm font-black text-white">Interactive Feedforward Layer Connections</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-pink-400 font-extrabold uppercase tracking-wider block">System Confidence</span>
                <span className="text-sm font-mono font-black text-pink-400">{(confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Interactive 3D Canvas */}
            <div className="absolute inset-0 z-0">
              <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
            </div>

            {/* Dynamic Status indicators */}
            <div className="flex items-end justify-between z-10">
              <div className="flex gap-4 text-[10px] font-mono text-[#64748b]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Input (4)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Hidden (8, 10, 8, 5)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span>Output (3)</span>
                </div>
              </div>
              
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-cyan-400">
                Rotation speed dynamic mapping enabled
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT WORKSPACE: Hyperparameter Control Room (4 cols) */}
        <div className="lg:col-span-4">
          <div className="dark-glass-card rounded-3xl p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 border-b border-indigo-500/15 pb-3 mb-5">
                <Sliders className="text-purple-400" size={16} />
                <div>
                  <h3 className="text-sm font-extrabold text-white">Hyperparameter Tuning</h3>
                  <p className="text-[10px] text-[#64748b]">Adjust active weights before compiling training layers</p>
                </div>
              </div>

              {/* Tuning Elements */}
              <div className="space-y-4">
                {/* Slider: Learning Rate */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-[#cbd5e1] font-bold">Learning Rate (α)</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{learningRate}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.001" 
                    max="0.1" 
                    step="0.005"
                    value={learningRate} 
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-[#121324] h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-[#64748b] mt-1 font-semibold">
                    <span>Conservative (0.001)</span>
                    <span>Aggressive (0.1)</span>
                  </div>
                </div>

                {/* Dropdown: Batch Size */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#cbd5e1] font-bold mb-1.5">Batch Size</span>
                  <select 
                    value={batchSize} 
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    className="bg-[#121324] border border-indigo-500/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#cbd5e1] focus:border-purple-400 outline-none"
                  >
                    <option value="16">16 Samples</option>
                    <option value="32">32 Samples (Optimized)</option>
                    <option value="64">64 Samples</option>
                    <option value="128">128 Samples</option>
                  </select>
                </div>

                {/* Dropdown: Optimizer */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#cbd5e1] font-bold mb-1.5">Optimizer Algorithm</span>
                  <select 
                    value={optimizer} 
                    onChange={(e) => setOptimizer(e.target.value)}
                    className="bg-[#121324] border border-indigo-500/15 rounded-xl px-3 py-2 text-xs font-semibold text-[#cbd5e1] focus:border-purple-400 outline-none"
                  >
                    <option value="Adam">Adam (Adaptive Moment Estimation)</option>
                    <option value="RMSprop">RMSprop (Root Mean Squared Propagation)</option>
                    <option value="SGD">SGD (Stochastic Gradient Descent)</option>
                  </select>
                </div>

                {/* Dropdown: Activation Function */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#cbd5e1] font-bold mb-1.5">Activation Function</span>
                  <div className="grid grid-cols-4 gap-1.5 bg-[#121324] p-1 rounded-xl border border-indigo-500/15">
                    {['ReLU', 'GELU', 'Tanh', 'Sigmoid'].map(act => (
                      <button
                        key={act}
                        onClick={() => setActivation(act)}
                        className={`py-1 text-[9px] font-bold rounded-lg transition-colors cursor-pointer ${
                          activation === act 
                            ? 'bg-purple-600 text-white shadow-md' 
                            : 'text-[#64748b] hover:text-white'
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Run Actions */}
            <div className="pt-6 mt-6 border-t border-indigo-500/15">
              <button 
                onClick={startTrainingRun}
                disabled={isTraining}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/10 transition-all active:scale-[0.98]"
              >
                <Play size={14} fill="currentColor" /> 
                {isTraining ? `Training (Epoch ${currentEpoch}/20)...` : 'Start Neural Training Run'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Secondary Layout Row: Glass Graphs (Model Progress & Metrics) ─── */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* GRAPH 1: Model Training Progress */}
        <div className="dark-glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-pink-400 animate-pulse" size={16} />
              <div>
                <h4 className="text-sm font-extrabold text-white">Model Training Progress</h4>
                <p className="text-[10px] text-[#64748b]">Real-time Cross-Entropy Loss optimization</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#64748b] font-bold uppercase block">Latest Loss</span>
              <span className="text-xs font-mono font-bold text-pink-400">{latestMetric.loss}</span>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="w-full h-40 relative">
            <svg className="w-full h-full" viewBox="0 0 400 180">
              <defs>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0"/>
                </linearGradient>
                <filter id="glowLoss" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Grid Lines */}
              {[30, 60, 90, 120, 150].map((y, i) => (
                <line key={i} x1="20" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              ))}

              {/* Data Path */}
              {visibleHistory.length > 0 && (
                <>
                  {/* Filled area */}
                  <path 
                    d={`M 20 160 ${visibleHistory.map((h, i) => {
                      const x = 20 + (i * 18);
                      const y = 160 - (140 * (1 - h.loss));
                      return `L ${x} ${y}`;
                    }).join(' ')} L ${20 + ((visibleHistory.length - 1) * 18)} 160 Z`}
                    fill="url(#lossGrad)"
                  />
                  {/* Neon line */}
                  <path 
                    d={`M 20 ${160 - (140 * (1 - visibleHistory[0].loss))} ${visibleHistory.map((h, i) => {
                      const x = 20 + (i * 18);
                      const y = 160 - (140 * (1 - h.loss));
                      return `L ${x} ${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2.5"
                    filter="url(#glowLoss)"
                  />
                  {/* Data Points */}
                  {visibleHistory.map((h, i) => {
                    const x = 20 + (i * 18);
                    const y = 160 - (140 * (1 - h.loss));
                    return (
                      <circle 
                        key={i} 
                        cx={x} 
                        cy={y} 
                        r="3" 
                        fill="#fff" 
                        stroke="#ec4899" 
                        strokeWidth="1.5" 
                        title={`Epoch ${h.epoch}: Loss ${h.loss}`}
                      />
                    );
                  })}
                </>
              )}
              
              {/* Axes Labels */}
              <text x="20" y="172" fill="#64748b" fontSize="8" fontFamily="monospace">Epoch 1</text>
              <text x="360" y="172" fill="#64748b" fontSize="8" fontFamily="monospace">Epoch 20</text>
            </svg>
          </div>
        </div>

        {/* GRAPH 2: Validation Accuracy */}
        <div className="dark-glass-card rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="text-cyan-400" size={16} />
              <div>
                <h4 className="text-sm font-extrabold text-white">Validation Accuracy</h4>
                <p className="text-[10px] text-[#64748b]">Compare network training vs validation score</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#64748b] font-bold uppercase block">Val Acc</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{latestMetric.valAcc}%</span>
            </div>
          </div>

          {/* SVG Line Graph (Multi-line) */}
          <div className="w-full h-40 relative">
            <svg className="w-full h-full" viewBox="0 0 400 180">
              <defs>
                <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Lines */}
              {[30, 60, 90, 120, 150].map((y, i) => (
                <line key={i} x1="20" y1={y} x2="380" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              ))}

              {visibleHistory.length > 0 && (
                <>
                  {/* Training Accuracy Path (Neon Purple) */}
                  <path 
                    d={`M 20 ${160 - (120 * (visibleHistory[0].trainAcc / 100))} ${visibleHistory.map((h, i) => {
                      const x = 20 + (i * 18);
                      const y = 160 - (120 * (h.trainAcc / 100));
                      return `L ${x} ${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    opacity="0.85"
                  />

                  {/* Validation Accuracy Path (Neon Cyan) */}
                  <path 
                    d={`M 20 ${160 - (120 * (visibleHistory[0].valAcc / 100))} ${visibleHistory.map((h, i) => {
                      const x = 20 + (i * 18);
                      const y = 160 - (120 * (h.valAcc / 100));
                      return `L ${x} ${y}`;
                    }).join(' ')}`}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    filter="url(#glowCyan)"
                  />

                  {/* Val Acc Markers */}
                  {visibleHistory.map((h, i) => {
                    const x = 20 + (i * 18);
                    const y = 160 - (120 * (h.valAcc / 100));
                    return (
                      <circle 
                        key={i} 
                        cx={x} 
                        cy={y} 
                        r="3" 
                        fill="#fff" 
                        stroke="#06b6d4" 
                        strokeWidth="1.5" 
                      />
                    );
                  })}
                </>
              )}

              {/* Axes Labels */}
              <text x="20" y="172" fill="#64748b" fontSize="8" fontFamily="monospace">Epoch 1</text>
              <text x="360" y="172" fill="#64748b" fontSize="8" fontFamily="monospace">Epoch 20</text>

              {/* Legend */}
              <g transform="translate(240, 10)">
                <circle cx="0" cy="0" r="3.5" fill="#a855f7" />
                <text x="8" y="3" fill="#cbd5e1" fontSize="8">Train Acc</text>
                <circle cx="65" cy="0" r="3.5" fill="#06b6d4" />
                <text x="73" y="3" fill="#cbd5e1" fontSize="8">Val Acc</text>
              </g>
            </svg>
          </div>
        </div>

      </div>

      {/* ─── BOTTOM QUICK ACCESS: Horizontal Jewel-Toned Cards ─── */}
      <div>
        <h4 className="text-xs font-extrabold text-[#64748b] uppercase tracking-widest mb-4">Quick Access Nodes</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Cloud Datasets */}
          <div 
            onClick={() => {
              setActiveAccessCard(activeAccessCard === 'datasets' ? null : 'datasets');
              toast.success('Accessing cloud database registry...');
            }}
            className="relative dark-glass-card jewel-card-green rounded-2xl p-5 cursor-pointer select-none"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Database size={16} />
              </div>
              <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Secure Vault</span>
            </div>
            <h5 className="text-xs font-black text-white">Cloud Datasets</h5>
            <p className="text-[10px] text-[#64748b] mt-1 leading-normal">
              Sync weights directly into distributed S3 and GCP bucket endpoints securely.
            </p>
            {activeAccessCard === 'datasets' && (
              <div className="mt-3 pt-3 border-t border-white/5 text-[9px] font-mono text-emerald-400">
                Status: Connected • 1.4 TB Active Records
              </div>
            )}
          </div>

          {/* Card 2: Compute Cluster Status */}
          <div 
            onClick={() => {
              setActiveAccessCard(activeAccessCard === 'cluster' ? null : 'cluster');
              toast.success('Querying cluster task manager...');
            }}
            className="relative dark-glass-card jewel-card-gold rounded-2xl p-5 cursor-pointer select-none"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <Cpu size={16} />
              </div>
              <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Optimized</span>
            </div>
            <h5 className="text-xs font-black text-white">Compute Cluster Status</h5>
            <p className="text-[10px] text-[#64748b] mt-1 leading-normal">
              Live metrics for GPU nodes, memory allocation, and active execution pools.
            </p>
            {activeAccessCard === 'cluster' && (
              <div className="mt-3 pt-3 border-t border-white/5 text-[9px] font-mono text-amber-400">
                GPUs: 8/8 Active • Memory: 192GB / 256GB Allocation
              </div>
            )}
          </div>

          {/* Card 3: A/B Tests */}
          <div 
            onClick={() => {
              setActiveAccessCard(activeAccessCard === 'abtests' ? null : 'abtests');
              toast.success('Synchronizing AB experiment logs...');
            }}
            className="relative dark-glass-card jewel-card-crimson rounded-2xl p-5 cursor-pointer select-none"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                <Activity size={16} />
              </div>
              <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Live Experiments</span>
            </div>
            <h5 className="text-xs font-black text-white">A/B Tests</h5>
            <p className="text-[10px] text-[#64748b] mt-1 leading-normal">
              Benchmark experimental compilation parameters against current deployment baselines.
            </p>
            {activeAccessCard === 'abtests' && (
              <div className="mt-3 pt-3 border-t border-white/5 text-[9px] font-mono text-red-400">
                Active Tests: 3 • Win Rate: +4.2% Classification Margin
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

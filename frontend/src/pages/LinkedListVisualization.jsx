import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, SkipForward, SkipBack, RotateCcw, 
  ChevronRight, Cpu, Code2, Database, Zap, Settings, Info
} from 'lucide-react';

export default function LinkedListVisualization() {
  const navigate = useNavigate();
  const [listType, setListType] = useState('singly'); // singly, doubly, circular
  const [operation, setOperation] = useState('insertPosition');
  const [inputValue, setInputValue] = useState('10');
  const [inputPosition, setInputPosition] = useState('2');
  const [activeTab, setActiveTab] = useState('code'); // code, variables, memory
  const [speed, setSpeed] = useState(1);
  
  // Settings Toggles
  const [showAddresses, setShowAddresses] = useState(true);
  const [showPointerNames, setShowPointerNames] = useState(true);
  const [showCodeSync, setShowCodeSync] = useState(true);
  const [showComplexity, setShowComplexity] = useState(true);

  // Linked list state
  const [nodes, setNodes] = useState([
    { id: 1, value: 5, address: '0x101' },
    { id: 2, value: 8, address: '0x102' },
    { id: 3, value: 12, address: '0x103' }
  ]);

  // Debugger Execution State
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // Code Definition for C
  const getCCode = () => {
    if (listType === 'doubly') {
      return [
        { line: 1, text: "struct Node {" },
        { line: 2, text: "    int data;" },
        { line: 3, text: "    struct Node* next;" },
        { line: 4, text: "    struct Node* prev;" },
        { line: 5, text: "};" },
        { line: 6, text: "" },
        { line: 7, text: "void insertAtPos(struct Node** head, int val, int pos) {" },
        { line: 8, text: "    struct Node* newNode = createNode(val);" },
        { line: 9, text: "    if (pos == 1) {" },
        { line: 10, text: "        newNode->next = *head;" },
        { line: 11, text: "        if (*head) (*head)->prev = newNode;" },
        { line: 12, text: "        *head = newNode;" },
        { line: 13, text: "        return;" },
        { line: 14, text: "    }" },
        { line: 15, text: "    struct Node* current = *head;" },
        { line: 16, text: "    for(int i=1; i < pos-1 && current; i++) {" },
        { line: 17, text: "        current = current->next;" },
        { line: 18, text: "    }" },
        { line: 19, text: "    newNode->next = current->next;" },
        { line: 20, text: "    if (current->next) current->next->prev = newNode;" },
        { line: 21, text: "    current->next = newNode;" },
        { line: 22, text: "    newNode->prev = current;" },
        { line: 23, text: "}" }
      ];
    } else if (listType === 'circular') {
      return [
        { line: 1, text: "struct Node {" },
        { line: 2, text: "    int data;" },
        { line: 3, text: "    struct Node* next;" },
        { line: 4, text: "};" },
        { line: 5, text: "" },
        { line: 6, text: "void insertAtPos(struct Node** head, int val, int pos) {" },
        { line: 7, text: "    struct Node* newNode = createNode(val);" },
        { line: 8, text: "    if (pos == 1) {" },
        { line: 9, text: "        struct Node* temp = *head;" },
        { line: 10, text: "        while(temp->next != *head) temp = temp->next;" },
        { line: 11, text: "        newNode->next = *head;" },
        { line: 12, text: "        temp->next = newNode;" },
        { line: 13, text: "        *head = newNode;" },
        { line: 14, text: "        return;" },
        { line: 15, text: "    }" },
        { line: 16, text: "    struct Node* current = *head;" },
        { line: 17, text: "    for(int i=1; i < pos-1; i++) {" },
        { line: 18, text: "        current = current->next;" },
        { line: 19, text: "    }" },
        { line: 20, text: "    newNode->next = current->next;" },
        { line: 21, text: "    current->next = newNode;" },
        { line: 22, text: "}" }
      ];
    } else {
      // Singly
      return [
        { line: 1, text: "struct Node {" },
        { line: 2, text: "    int data;" },
        { line: 3, text: "    struct Node* next;" },
        { line: 4, text: "};" },
        { line: 5, text: "" },
        { line: 6, text: "void insertAtPos(struct Node** head, int val, int pos) {" },
        { line: 7, text: "    struct Node* newNode = createNode(val);" },
        { line: 8, text: "    if (pos == 1) {" },
        { line: 9, text: "        newNode->next = *head;" },
        { line: 10, text: "        *head = newNode;" },
        { line: 11, text: "        return;" },
        { line: 12, text: "    }" },
        { line: 13, text: "    struct Node* current = *head;" },
        { line: 14, text: "    for(int i=1; i < pos-1; i++) {" },
        { line: 15, text: "        current = current->next;" },
        { line: 16, text: "    }" },
        { line: 17, text: "    newNode->next = current->next;" },
        { line: 18, text: "    current->next = newNode;" },
        { line: 19, text: "}" }
      ];
    }
  };

  // Generate steps based on active operations
  const generateSteps = () => {
    const val = parseInt(inputValue) || 10;
    const pos = parseInt(inputPosition) || 2;
    const initialNodes = [...nodes];
    const newSteps = [];

    // Step 0: Initial State
    newSteps.push({
      label: "Initial linked list state before operation starts.",
      activeLine: 7,
      nodes: initialNodes.map(n => ({ ...n, state: 'default' })),
      wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
      variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: 'NULL' }
    });

    // Step 1: Create New Node
    const newNodeObj = { id: 99, value: val, address: '0x200', state: 'new', isVirtual: true };
    newSteps.push({
      label: `Allocate memory for new node with data: ${val}.`,
      activeLine: 8,
      nodes: [...initialNodes.map(n => ({ ...n, state: 'default' })), newNodeObj],
      wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
      variables: { head: initialNodes[0]?.address || 'NULL', current: 'NULL', newNode: '0x200' }
    });

    // Step 2: Initialize Traversal (Set current to head)
    newSteps.push({
      label: "Point traversal pointer 'current' to HEAD.",
      activeLine: 13,
      nodes: [...initialNodes.map((n, i) => ({ ...n, state: i === 0 ? 'active' : 'default' })), newNodeObj],
      wires: initialNodes.map((_, i) => i < initialNodes.length - 1 ? 'default' : 'none'),
      variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[0]?.address || 'NULL', newNode: '0x200' }
    });

    // Step 3: Traverse to Position
    const maxTraverse = Math.min(pos - 1, initialNodes.length);
    for (let i = 1; i < maxTraverse; i++) {
      newSteps.push({
        label: `Traverse current pointer next. Current is at node index ${i}.`,
        activeLine: 15,
        nodes: [...initialNodes.map((n, idx) => ({ ...n, state: idx === i ? 'active' : 'default' })), newNodeObj],
        wires: initialNodes.map((_, idx) => {
          if (idx === i - 1) return 'traversal';
          return idx < initialNodes.length - 1 ? 'default' : 'none';
        }),
        variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[i]?.address || 'NULL', newNode: '0x200' }
      });
    }

    // Step 4: Link New Node -> Next Node
    const nextNodeAddress = initialNodes[maxTraverse]?.address || 'NULL';
    newSteps.push({
      label: `Set newNode->next to current->next (${nextNodeAddress}).`,
      activeLine: 17,
      nodes: [...initialNodes.map((n, idx) => ({ ...n, state: idx === maxTraverse - 1 ? 'active' : 'default' })), { ...newNodeObj, state: 'new' }],
      wires: [
        ...initialNodes.map((_, idx) => {
          if (idx === maxTraverse - 1) return 'disconnecting';
          return idx < initialNodes.length - 1 ? 'default' : 'none';
        }),
        'new-next' // Virtual pointer from new node
      ],
      variables: { head: initialNodes[0]?.address || 'NULL', current: initialNodes[maxTraverse - 1]?.address || 'NULL', newNode: '0x200' }
    });

    // Step 5: Link Current Node -> New Node
    const finalNodes = [...initialNodes];
    finalNodes.splice(maxTraverse, 0, { id: 99, value: val, address: '0x200' });
    newSteps.push({
      label: "Update current->next to point to the new node.",
      activeLine: 18,
      nodes: finalNodes.map((n) => ({ ...n, state: n.id === 99 ? 'new' : 'default' })),
      wires: finalNodes.map((_, i) => i < finalNodes.length - 1 ? (i === maxTraverse - 1 || i === maxTraverse ? 'new' : 'default') : 'none'),
      variables: { head: finalNodes[0]?.address || 'NULL', current: finalNodes[maxTraverse - 1]?.address || 'NULL', newNode: '0x200' }
    });

    // Step 6: Final clean state
    newSteps.push({
      label: "Insertion operation complete. Linked List is synchronized.",
      activeLine: 19,
      nodes: finalNodes.map(n => ({ ...n, state: 'default' })),
      wires: finalNodes.map((_, i) => i < finalNodes.length - 1 ? 'default' : 'none'),
      variables: { head: finalNodes[0]?.address || 'NULL', current: 'NULL', newNode: 'NULL' }
    });

    setSteps(newSteps);
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    generateSteps();
  }, [listType, operation, nodes]);

  // Handle playing simulation
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500 / speed);
    } else {
      clearInterval(playTimerRef.current);
    }
    return () => clearInterval(playTimerRef.current);
  }, [isPlaying, steps, speed]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
  };
  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  };
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const activeStep = steps[currentStepIndex] || {
    label: "Loading...",
    activeLine: 7,
    nodes: nodes.map(n => ({ ...n, state: 'default' })),
    wires: [],
    variables: { head: 'NULL', current: 'NULL', newNode: 'NULL' }
  };

  // Perform operational change directly to testing list state
  const executeDirectOperation = () => {
    const val = parseInt(inputValue) || 10;
    const pos = parseInt(inputPosition) || 1;
    let nextNodes = [...nodes];
    const newAddr = `0x${Math.floor(Math.random() * 900 + 100)}`;

    if (operation === 'insertBeginning') {
      nextNodes.unshift({ id: Date.now(), value: val, address: newAddr });
    } else if (operation === 'insertEnd') {
      nextNodes.push({ id: Date.now(), value: val, address: newAddr });
    } else if (operation === 'insertPosition') {
      const index = Math.max(0, Math.min(pos - 1, nextNodes.length));
      nextNodes.splice(index, 0, { id: Date.now(), value: val, address: newAddr });
    } else if (operation === 'deleteBeginning') {
      nextNodes.shift();
    } else if (operation === 'deleteEnd') {
      nextNodes.pop();
    } else if (operation === 'deletePosition') {
      const index = Math.max(0, Math.min(pos - 1, nextNodes.length - 1));
      nextNodes.splice(index, 1);
    } else if (operation === 'clear') {
      nextNodes = [];
    }

    setNodes(nextNodes);
  };

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* HEADER BREADCRUMB - 64px */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm relative z-10">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
          <span>Home</span> <ChevronRight className="w-4 h-4" />
          <span>Subjects</span> <ChevronRight className="w-4 h-4" />
          <span>DSA</span> <ChevronRight className="w-4 h-4" />
          <span className="text-blue-600 font-bold">Linked List</span> <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800">Operations</span>
        </div>
      </header>

      {/* CORE WORKSPACE - 3-PANEL LAYOUT */}
      <main className="flex-1 p-5 gap-5 flex h-[calc(100vh-64px)] max-w-[1920px] mx-auto w-full overflow-hidden">
        
        {/* ==========================================
            LEFT PANEL: CONTROL CENTER (22%)
        =========================================== */}
        <div className="w-[22%] min-w-[280px] h-full bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg p-6 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F172A] flex items-center gap-2 mb-1">
                <Zap className="w-6 h-6 text-blue-500" /> Controls
              </h2>
              <p className="text-[#64748B] text-xs">Configure list architectures and trigger animations.</p>
            </div>

            {/* List Type Segmented Toggle */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">List Architecture</label>
              <div className="grid grid-cols-3 gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-slate-200">
                {['singly', 'doubly', 'circular'].map(type => (
                  <button 
                    key={type} 
                    onClick={() => setListType(type)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${listType === type ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Operation Selector & Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Select Operation</label>
                <select 
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="insertBeginning">Insert Beginning</option>
                  <option value="insertEnd">Insert End</option>
                  <option value="insertPosition">Insert at Position</option>
                  <option value="deleteBeginning">Delete Beginning</option>
                  <option value="deleteEnd">Delete End</option>
                  <option value="deletePosition">Delete at Position</option>
                  <option value="clear">Clear List</option>
                </select>
              </div>

              {/* Value Input */}
              {operation.includes('insert') && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Value</label>
                  <input 
                    type="number" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter Value"
                    className="w-full bg-white border-2 border-slate-200 text-slate-800 text-sm font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
              )}

              {/* Position Input */}
              {operation.includes('Position') && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Index Position</label>
                  <input 
                    type="number" 
                    value={inputPosition}
                    onChange={(e) => setInputPosition(e.target.value)}
                    placeholder="Enter Position"
                    className="w-full bg-white border-2 border-slate-200 text-slate-800 text-sm font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-blue-500 text-center"
                  />
                </div>
              )}

              <button 
                onClick={executeDirectOperation}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
              >
                Execute Action
              </button>
            </div>

            {/* Playback Controls */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Execution Debugger</label>
              <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 gap-1">
                <button onClick={handleReset} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500 hover:text-slate-800" title="Reset Step">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={handlePrev} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500 hover:text-slate-800" title="Previous Step">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={handlePlayPause} className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition" title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
                <button onClick={handleNext} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-500 hover:text-slate-800" title="Next Step">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Speed</span>
                  <span>{speed}x</span>
                </div>
                <div className="flex justify-between items-center bg-slate-100 p-1 rounded-xl">
                  {[0.5, 1, 2].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSpeed(s)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${speed === s ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* View Toggles */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Display Settings</label>
              {[
                { label: "Show Addresses", state: showAddresses, set: setShowAddresses },
                { label: "Show Pointer Names", state: showPointerNames, set: setShowPointerNames },
                { label: "Show Code Sync", state: showCodeSync, set: setShowCodeSync },
                { label: "Show Complexity", state: showComplexity, set: setShowComplexity },
              ].map(opt => (
                <label key={opt.label} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer hover:text-slate-800 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={opt.state} 
                    onChange={(e) => opt.set(e.target.checked)}
                    className="accent-blue-600 rounded border-slate-300"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

          </div>

          {/* Complexity / Metadata info */}
          {showComplexity && (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 mt-6">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>Active Nodes:</span>
                <span className="text-slate-800">{activeStep.nodes?.length || 0}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>Operation:</span>
                <span className="text-slate-800 capitalize">{operation.replace('insert', 'Insert ').replace('delete', 'Delete ')}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>Time Complexity:</span>
                <span className="text-emerald-600">O(n)</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>Space Complexity:</span>
                <span className="text-emerald-600">O(1)</span>
              </div>
            </div>
          )}

        </div>

        {/* ==========================================
            CENTER PANEL: VISUALIZER (45%)
        =========================================== */}
        <div className="w-[45%] h-full bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg flex flex-col relative justify-between overflow-hidden">
          
          {/* Debug Description Bar */}
          <div className="h-12 border-b border-slate-200 bg-slate-50/80 px-6 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Status: <span className="text-blue-600 uppercase font-extrabold">{isPlaying ? "Debugging" : "Paused"}</span></span>
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
          </div>

          {/* Core Visualizer Area */}
          <div className="flex-1 w-full flex flex-col justify-center items-center relative p-6 overflow-hidden">
            
            {/* Labels layer (Head / Tail) */}
            <div className="absolute top-12 flex justify-start items-center gap-24 w-full max-w-md px-6">
              {showPointerNames && (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-extrabold tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg shadow-sm">HEAD</span>
                  <div className="w-[1.5px] h-4 bg-blue-300"></div>
                </div>
              )}
            </div>

            {/* Linked List Nodes Grid */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-2xl relative z-10">
              
              {activeStep.nodes?.map((node, index) => {
                const isNew = node.state === 'new';
                const isActive = node.state === 'active';

                return (
                  <div key={node.id} className="flex items-center">
                    
                    {/* Node Element */}
                    <motion.div
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: isActive ? 1.05 : 1, 
                        opacity: 1,
                        boxShadow: isActive ? '0 0 15px rgba(37, 99, 235, 0.2)' : 'none'
                      }}
                      className={`relative flex flex-col rounded-xl border-2 overflow-hidden w-28 text-center transition-colors duration-300 ${
                        isActive ? 'bg-[#2563EB] border-[#2563EB] text-white' : 
                        isNew ? 'bg-green-50 border-green-500 text-green-700' : 'bg-[#F8FAFC] border-slate-200 text-slate-800'
                      }`}
                    >
                      {/* Address Info Header */}
                      {showAddresses && (
                        <div className={`text-[9px] font-mono py-1 border-b ${isActive ? 'bg-blue-700 text-blue-100 border-blue-600' : 'bg-slate-100/80 text-slate-400 border-slate-200'}`}>
                          {node.address}
                        </div>
                      )}
                      
                      {/* Node Fields split: Data | Next */}
                      <div className="flex text-xs h-10 items-center">
                        <div className={`flex-1 font-extrabold border-r py-2 flex flex-col justify-center ${isActive ? 'border-blue-600' : 'border-slate-200'}`}>
                          <span className={`text-[7px] font-bold uppercase ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>Data</span>
                          <span className="text-sm">{node.value}</span>
                        </div>
                        <div className="flex-1 font-mono py-2 flex flex-col justify-center">
                          <span className={`text-[7px] font-bold uppercase ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>Next</span>
                          <span className={isActive ? 'text-blue-100' : 'text-slate-500'}>
                            {index < (activeStep.nodes?.length - 1) ? activeStep.nodes[index + 1].address : 'NULL'}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* SVG Connector Wires */}
                    {index < (activeStep.nodes?.length - 1) && (
                      <div className="w-10 h-10 flex items-center justify-center relative">
                        <svg className="absolute w-full h-full" viewBox="0 0 40 40">
                          <line 
                            x1="0" 
                            y1="20" 
                            x2="32" 
                            y2="20" 
                            stroke={activeStep.wires?.[index] === 'traversal' ? '#2563EB' : '#94A3B8'} 
                            strokeWidth={activeStep.wires?.[index] === 'traversal' ? '4' : '2'}
                          />
                          <polygon 
                            points="32,16 40,20 32,24" 
                            fill={activeStep.wires?.[index] === 'traversal' ? '#2563EB' : '#94A3B8'} 
                          />
                          {activeStep.wires?.[index] === 'traversal' && (
                            <motion.circle 
                              r="3" 
                              fill="#2563EB" 
                              animate={{ cx: [0, 40] }} 
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          )}
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* End of list element */}
              <div className="flex items-center text-xs font-mono text-slate-500 ml-2 border-2 border-slate-200 bg-[#F8FAFC] px-2.5 py-1.5 rounded-lg shadow-sm">
                NULL
              </div>

            </div>

            {/* Circular list loopback representation */}
            {listType === 'circular' && activeStep.nodes?.length > 0 && (
              <div className="absolute bottom-12 w-full max-w-sm h-8 flex items-center justify-center">
                <svg className="w-full h-12" viewBox="0 0 400 40">
                  <path d="M 320,10 C 320,30 80,30 80,10" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4,4" />
                  <polygon points="76,14 80,4 84,14" fill="#94A3B8" />
                  <text x="160" y="32" fill="#64748B" className="text-[9px] font-mono font-bold tracking-wider">LOOPBACK TO HEAD</text>
                </svg>
              </div>
            )}

          </div>

          {/* Stepper info footer / Explanation */}
          <div className="border-t border-slate-200 bg-slate-50/80 p-5 flex flex-col justify-center items-center gap-1">
            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Debugger Log
            </h4>
            <span className="text-xs font-semibold text-slate-700 text-center max-w-md">{activeStep.label}</span>
          </div>

        </div>

        {/* ==========================================
            RIGHT PANEL: PROGRAM WORKSPACE (33%)
        =========================================== */}
        <div className="w-[33%] min-w-[340px] h-full bg-white/70 backdrop-blur-xl border border-[#E2E8F0] rounded-[24px] shadow-lg flex flex-col overflow-hidden">
          
          {/* Work Tabs */}
          <div className="grid grid-cols-3 border-b border-slate-200 shrink-0 bg-slate-50">
            {[
              { id: 'code', label: 'C Code', icon: Code2 },
              { id: 'variables', label: 'Variables', icon: Cpu },
              { id: 'memory', label: 'Memory Map', icon: Database }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-auto p-5 bg-white">
            <AnimatePresence mode="wait">
              {activeTab === 'code' && (
                <motion.div 
                  key="code" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="font-mono text-xs leading-relaxed text-slate-600 space-y-1 h-full"
                >
                  <pre className="text-[12px] bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-y-auto h-full font-mono">
                    <code>
                      {getCCode().map((line) => {
                        const isActive = activeStep.activeLine === line.line;
                        return (
                          <div 
                            key={line.line}
                            className={`py-0.5 px-2 rounded transition-all duration-200 flex items-start ${isActive ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-500 font-bold' : 'border-l-4 border-transparent'}`}
                          >
                            <span className="w-6 text-slate-400 select-none shrink-0 text-right mr-2">{line.line}</span>
                            <span className="whitespace-pre">{line.text}</span>
                          </div>
                        );
                      })}
                    </code>
                  </pre>
                </motion.div>
              )}

              {activeTab === 'variables' && (
                <motion.div 
                  key="variables" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="space-y-4 font-mono text-xs text-slate-600"
                >
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Live Stack Frame</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500">head</span>
                      <span className="text-slate-800 font-bold text-xs">{activeStep.variables?.head}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500">current</span>
                      <span className="text-blue-600 font-bold text-xs">{activeStep.variables?.current}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                      <span className="text-slate-500">newNode</span>
                      <span className="text-purple-600 font-bold text-xs">{activeStep.variables?.newNode}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'memory' && (
                <motion.div 
                  key="memory" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="space-y-4 font-mono text-xs text-slate-600"
                >
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Heap Memory Allocation</h4>
                  <div className="space-y-2">
                    {activeStep.nodes?.map((node, i) => (
                      <div key={node.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-lg justify-between shadow-inner">
                        <span className="text-slate-500 text-[10px] font-bold">{node.address}</span>
                        <div className="flex gap-2">
                          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 text-[10px] font-bold">Data: {node.value}</span>
                          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-blue-600 text-[10px] font-bold">
                            Next: {i < activeStep.nodes.length - 1 ? activeStep.nodes[i+1].address : 'NULL'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>

    </div>
  );
}

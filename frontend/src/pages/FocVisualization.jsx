import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, SkipForward, RotateCcw, 
  BookOpen, HelpCircle, CheckCircle, ChevronDown, 
  Layers, Volume2, ShieldAlert, Cpu, Database, 
  Binary, Terminal, RefreshCw, Send, Zap, Award, Edit3,
  Info, Lightbulb, Hash, ArrowRight, Star, AlertCircle
} from 'lucide-react';
import logoImg from '../assets/logo.png';

// Core topics
const FOC_TOPICS = [
  { id: 'number-system', title: 'Number System', icon: '🔢', desc: 'Decimal, binary, octal, hex conversion with farmer seeds.', diff: 'Medium', time: '15 mins', progress: 65, category: 'core', borderColor: 'border-blue-400/50 hover:border-blue-600' },
  { id: 'logic-gates', title: 'Logic Gates', icon: '⚡', desc: 'AND, OR, NOT, NAND, NOR, XOR logic gate simulation.', diff: 'Easy', time: '10 mins', progress: 80, category: 'core', borderColor: 'border-amber-400/50 hover:border-amber-600' },
  { id: 'ascii-unicode', title: 'ASCII & Unicode', icon: '🔤', desc: 'Character representation and encoding systems.', diff: 'Easy', time: '10 mins', progress: 40, category: 'core', borderColor: 'border-purple-400/50 hover:border-purple-600' },
  { id: 'flowcharts', title: 'Flowcharts', icon: '📋', desc: 'Visualize algorithm execution flow step-by-step.', diff: 'Medium', time: '15 mins', progress: 20, category: 'core', borderColor: 'border-emerald-400/50 hover:border-emerald-600' },
  { id: 'memory-org', title: 'Memory Organization', icon: '💾', desc: 'Cache, RAM, SSD, and HDD hierarchy simulation.', diff: 'Hard', time: '20 mins', progress: 10, category: 'core', borderColor: 'border-indigo-400/50 hover:border-indigo-600' },
  { id: 'computer-arch', title: 'Computer Architecture', icon: '🖥', desc: 'ALU, CPU, memory, and register pathways.', diff: 'Hard', time: '25 mins', progress: 0, category: 'core', borderColor: 'border-pink-400/50 hover:border-pink-600' },
  { id: 'os-basics', title: 'Operating System', icon: '⚙', desc: 'Kernel, processes, scheduler, and resource management.', diff: 'Medium', time: '15 mins', progress: 0, category: 'core', borderColor: 'border-cyan-400/50 hover:border-cyan-600' },
  { id: 'number-rep', title: 'Number Representation', icon: '🌐', desc: 'Sign-magnitude, 1\'s and 2\'s complement formats.', diff: 'Medium', time: '12 mins', progress: 0, category: 'core', borderColor: 'border-rose-400/50 hover:border-rose-600' }
];

const SPECIAL_CARDS = [
  { id: 'binary-playground', title: 'Binary Playground', icon: '🧠', desc: 'Interactive sandbox for binary arithmetic.', diff: 'Playground', time: 'Unlimited', progress: 90, category: 'special' },
  { id: 'debug-simulator', title: 'Debug Simulator', icon: '🐞', desc: 'Step through code processes to find execution bugs.', diff: 'Simulator', time: '15 mins', progress: 50, category: 'special' },
  { id: 'quiz-arena', title: 'Quiz Arena', icon: '🎯', desc: 'Test your understanding with real-time FOC questions.', diff: 'Quiz', time: '10 mins', progress: 30, category: 'special' },
  { id: 'animation-replay', title: 'Replay Studio', icon: '🎬', desc: 'Rewind and replay visual computing lessons.', diff: 'Studio', time: 'Unlimited', progress: 10, category: 'special' },
  { id: 'complexity-explorer', title: 'Complexity Explorer', icon: '📊', desc: 'Explore runtime complexity and big O notations.', diff: 'Explorer', time: '20 mins', progress: 0, category: 'special' },
  { id: 'practice-lab', title: 'Practice Lab', icon: '🧪', desc: 'Write expression logic and compile simulations.', diff: 'Lab', time: 'Unlimited', progress: 0, category: 'special' },
  { id: 'ai-tutor', title: 'AI Tutor Mode', icon: '🤖', desc: 'Get smart context-aware tips from the AI tutor.', diff: 'AI Assistant', time: 'Custom', progress: 95, category: 'special' }
];

const NUMBER_SYSTEM_NOTES = `📘 NUMBER SYSTEM — COMPLETE STUDY NOTES
═══════════════════════════════════════

1️⃣ DECIMAL SYSTEM (Base-10)
   • Digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
   • Used in everyday counting
   • Each position = digit × 10^position
   • Example: 259 = 2×100 + 5×10 + 9×1

2️⃣ BINARY SYSTEM (Base-2)
   • Digits: 0, 1
   • Foundation of all digital computing
   • Each position = bit × 2^position
   • Example: 10011 = 1×16 + 0×8 + 0×4 + 1×2 + 1×1 = 19

3️⃣ OCTAL SYSTEM (Base-8)
   • Digits: 0, 1, 2, 3, 4, 5, 6, 7
   • Used in Unix file permissions (chmod 755)
   • 1 octal digit = 3 binary bits
   • Example: 23₈ = 2×8 + 3×1 = 19

4️⃣ HEXADECIMAL SYSTEM (Base-16)
   • Digits: 0-9, A(10), B(11), C(12), D(13), E(14), F(15)
   • Used in memory addresses, color codes (#FF5733)
   • 1 hex digit = 4 binary bits
   • Example: 13₁₆ = 1×16 + 3×1 = 19

═══════════════════════════════════════
📐 CONVERSION FORMULAS

🔹 Decimal → Binary: Divide by 2, collect remainders (bottom→top)
🔹 Binary → Decimal: Multiply each bit by 2^position, sum all
🔹 Decimal → Octal: Divide by 8, collect remainders
🔹 Decimal → Hex: Divide by 16, collect remainders (10→A, 11→B...)
🔹 Binary → Octal: Group 3 bits from right, convert each group
🔹 Binary → Hex: Group 4 bits from right, convert each group

═══════════════════════════════════════
⚡ COMPLEMENTS

🔹 1's Complement: Flip all bits (0↔1)
   Example: 10011 → 01100

🔹 2's Complement: 1's complement + 1
   Example: 10011 → 01100 + 1 = 01101
   Used for negative number representation

═══════════════════════════════════════
🧮 BINARY ARITHMETIC

🔹 Addition Rules:
   0+0=0  |  0+1=1  |  1+0=1  |  1+1=10 (carry 1)

🔹 Subtraction: Use 2's complement method
   A - B = A + (2's complement of B)

═══════════════════════════════════════
💡 QUICK REFERENCE TABLE

  Dec  |  Bin    |  Oct  |  Hex
  ─────┼─────────┼───────┼─────
   0   |  0000   |  0    |  0
   5   |  0101   |  5    |  5
   8   |  1000   |  10   |  8
  10   |  1010   |  12   |  A
  15   |  1111   |  17   |  F
  16   |  10000  |  20   |  10
  19   |  10011  |  23   |  13
  31   |  11111  |  37   |  1F
  255  |  11111111| 377   |  FF

═══════════════════════════════════════
✍️ MY PERSONAL NOTES:

`;

const MEMORY_ORG_NOTES = `📘 MEMORY ORGANIZATION — COMPLETE STUDY NOTES
═══════════════════════════════════════

1️⃣ REGISTERS (The Pocket)
   • Fastest accessible memory
   • Smallest capacity (Bytes to Kilobytes)
   • Located inside the CPU core
   • Holds data currently being processed

2️⃣ CACHE MEMORY (The Backpack)
   • Very fast memory
   • Small capacity (Megabytes)
   • Located on or very near the CPU (L1, L2, L3)
   • Stores frequently used data to speed up processing

3️⃣ MAIN MEMORY / RAM (The Desk)
   • Fast access
   • Medium capacity (Gigabytes)
   • Volatile: loses data when powered off
   • Holds the OS and currently running applications

4️⃣ SECONDARY STORAGE (The Filing Cabinet / Warehouse)
   • SSDs and HDDs
   • Slower access times
   • Huge capacity (Terabytes)
   • Non-volatile: keeps data when powered off
   • Long-term storage of files, programs, and the OS

═══════════════════════════════════════
⚡ KEY PRINCIPLES

🔹 The Memory Hierarchy Trade-off:
   As you move closer to the CPU:
   ↑ Speed Increases
   ↑ Cost per Byte Increases
   ↓ Capacity Decreases

🔹 Volatility:
   • Volatile (requires power): RAM, Cache, Registers
   • Non-volatile (keeps data without power): SSD, HDD, ROM

═══════════════════════════════════════
✍️ MY PERSONAL NOTES:

`;

const COMPUTER_ARCH_NOTES = `📘 COMPUTER ARCHITECTURE — COMPLETE STUDY NOTES
═══════════════════════════════════════

1️⃣ CPU (Central Processing Unit)
   • The "brain" of the computer.
   • Executes instructions and manages data flow.
   • Contains ALU, Control Unit, and Registers.

2️⃣ ALU (Arithmetic Logic Unit)
   • Performs all mathematical calculations (addition, subtraction, etc.).
   • Executes all logical operations (AND, OR, NOT).

3️⃣ CONTROL UNIT (CU)
   • Directs the operation of the processor.
   • Fetches instructions from memory and decodes them.
   • Sends timing and control signals to other components.

4️⃣ REGISTERS
   • Tiny, lightning-fast memory locations inside the CPU.
   • Program Counter (PC): Holds address of next instruction.
   • Instruction Register (IR): Holds the current instruction.
   • Accumulator (ACC): Holds intermediate ALU results.

5️⃣ BUS SYSTEM
   • Data Bus: Carries actual data between components.
   • Address Bus: Carries memory addresses where data should be read/written.
   • Control Bus: Carries control signals (read/write commands).

═══════════════════════════════════════
⚡ THE FETCH-DECODE-EXECUTE CYCLE

   1. Fetch: Get instruction from RAM using the PC.
   2. Decode: CU figures out what the instruction means.
   3. Execute: ALU performs the operation.
   4. Store: Save the result back to memory or register.

═══════════════════════════════════════
✍️ MY PERSONAL NOTES:

`;

const OS_BASICS_NOTES = `📘 OPERATING SYSTEM BASICS — COMPLETE STUDY NOTES
═══════════════════════════════════════
 
1️⃣ WHAT IS AN OS?
   • Software that acts as a bridge between computer hardware and the user.
   • Manages resources (CPU, memory, devices) so applications can run.

2️⃣ THE KERNEL (The Core)
   • Heart of the OS. Runs with highest privileges.
   • Handles memory management, process scheduling, and hardware communication.

3️⃣ PROCESS MANAGEMENT
   • A "process" is a program in execution.
   • The OS schedules when each process gets CPU time.
   • Multitasking allows multiple processes to appear to run simultaneously.

4️⃣ MEMORY MANAGEMENT
   • Keeps track of which parts of RAM are in use.
   • Allocates memory to processes when they start.
   • Swapping/Paging: Moves inactive data to disk to free up RAM.

5️⃣ FILE SYSTEM
   • Organizes data on storage drives into files and directories (folders).
   • Handles permissions (who can read/write what).

═══════════════════════════════════════
⚡ COMMON OS TYPES
   • Windows: Dominant in desktop/gaming.
   • macOS: Built on Unix, optimized for Apple hardware.
   • Linux: Open-source, powers most servers and Android.
 
═══════════════════════════════════════
✍️ MY PERSONAL NOTES:
 
`;

export default function FocVisualization() {
  const navigate = useNavigate();
  
  // App states
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('explanation'); // explanation, steps, quiz, notes
  const [mode, setMode] = useState('normal'); // normal, slow-motion, debug, exam, ai-tutor
  
  // Visualizer states
  const [operation, setOperation] = useState('');
  const [inputValue, setInputValue] = useState('19');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Logic Gates states
  const [gateA, setGateA] = useState(true);
  const [gateB, setGateB] = useState(false);
  const [gateType, setGateType] = useState('AND');
  const [gateResult, setGateResult] = useState(false);
  
  // Flowchart states
  const [flowchartTopic, setFlowchartTopic] = useState('Even/Odd');
  
  // Memory & Arch states
  const [activeStorageIndex, setActiveStorageIndex] = useState(-1);
  const [activeArchNode, setActiveArchNode] = useState(null);

  // Quiz States
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);

  // Notes state
  const [userNotes, setUserNotes] = useState('Type your study notes here for reference...');

  // Setup operations when topic changes
  useEffect(() => {
    if (selectedTopic) {
      if (selectedTopic.id === 'number-system') {
        setOperation('decimal-binary');
        setInputValue('19');
        setUserNotes(NUMBER_SYSTEM_NOTES);
      } else if (selectedTopic.id === 'logic-gates') {
        setOperation('AND');
        setGateType('AND');
        setUserNotes('Type your logic gates notes here...');
      } else if (selectedTopic.id === 'flowcharts') {
        setOperation('Even/Odd');
        setFlowchartTopic('Even/Odd');
        setUserNotes('Type your flowcharts notes here...');
      } else if (selectedTopic.id === 'ascii-unicode') {
        setOperation('char-binary');
        setInputValue('A');
        setUserNotes('Type your ASCII/Unicode notes here...');
      } else if (selectedTopic.id === 'memory-org') {
        setOperation('hierarchy');
        setUserNotes(MEMORY_ORG_NOTES);
      } else if (selectedTopic.id === 'computer-arch') {
        setOperation('data-path');
        setUserNotes(COMPUTER_ARCH_NOTES);
      } else if (selectedTopic.id === 'os-basics') {
        setOperation('os-layers');
        setUserNotes(OS_BASICS_NOTES);
      }
      setAnimationStep(0);
      setIsAnimating(false);
      setQuizIndex(0);
      setQuizAnswered(false);
      setSelectedAnswer(null);
    }
  }, [selectedTopic]);

  // Recalculate logic gates outputs
  useEffect(() => {
    let result = false;
    switch (gateType) {
      case 'AND': result = gateA && gateB; break;
      case 'OR': result = gateA || gateB; break;
      case 'NOT': result = !gateA; break;
      case 'NAND': result = !(gateA && gateB); break;
      case 'NOR': result = !(gateA || gateB); break;
      case 'XOR': result = gateA !== gateB; break;
      default: result = false;
    }
    setGateResult(result);
  }, [gateA, gateB, gateType]);

  // Handle animation play loop
  useEffect(() => {
    let timer;
    if (isAnimating) {
      const delay = (mode === 'slow-motion' ? 2000 : 1000) / playbackSpeed;
      timer = setTimeout(() => {
        setAnimationStep((prev) => {
          let maxSteps = 5;
          if (selectedTopic?.id === 'number-system') maxSteps = 6;
          if (selectedTopic?.id === 'logic-gates') maxSteps = 3;
          if (selectedTopic?.id === 'flowcharts') maxSteps = 6;
          if (selectedTopic?.id === 'ascii-unicode') maxSteps = 9;
          if (selectedTopic?.id === 'memory-org') maxSteps = 4;
          if (selectedTopic?.id === 'computer-arch') maxSteps = 5;

          if (prev >= maxSteps - 1) {
            setIsAnimating(false);
            return prev;
          }
          return prev + 1;
        });
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [isAnimating, animationStep, playbackSpeed, selectedTopic, mode]);

  // Helper values for number conversion representation
  const getBinaryBaskets = (valStr) => {
    const val = parseInt(valStr, 10) || 0;
    return [
      { name: '16', value: 16, active: (val & 16) > 0 },
      { name: '8', value: 8, active: (val & 8) > 0 },
      { name: '4', value: 4, active: (val & 4) > 0 },
      { name: '2', value: 2, active: (val & 2) > 0 },
      { name: '1', value: 1, active: (val & 1) > 0 },
    ];
  };

  const getExplanation = () => {
    if (selectedTopic?.id === 'number-system') {
      if (operation === 'decimal-binary') {
        const val = parseInt(inputValue, 10) || 0;
        const binary = val.toString(2).padStart(5, '0');
        const stepsList = [
          `Starting Decimal to Binary for ${val}.`,
          `Check 16: ${val} >= 16? Yes. Put 1 in 16's basket. Remainder = ${val - 16}.`,
          `Check 8: ${val - 16} >= 8? No. Put 0 in 8's basket.`,
          `Check 4: ${val - 16} >= 4? No. Put 0 in 4's basket.`,
          `Check 2: ${val - 16} >= 2? Yes. Put 1 in 2's basket. Remainder = ${(val - 16) - 2}.`,
          `Check 1: ${(val - 16) - 2} >= 1? Yes. Put 1 in 1's basket. Remainder = 0.`,
          `Conversion complete! Binary code is: ${binary}`
        ];
        return stepsList[Math.min(animationStep, stepsList.length - 1)];
      }
      return 'Simulating complementary bits logic.';
    }

    if (selectedTopic?.id === 'logic-gates') {
      return `Chickens representing inputs A (${gateA ? 'True' : 'False'}) and B (${gateB ? 'True' : 'False'}) pass through the ${gateType} gate. The output egg matches the operation result: ${gateResult ? 'True (Healthy Egg)' : 'False (Empty Shell)'}.`;
    }

    if (selectedTopic?.id === 'flowcharts') {
      return `Algorithm: ${flowchartTopic}. Flow chart starts, checks decision block, branches dynamically, and terminates at End state.`;
    }

    if (selectedTopic?.id === 'ascii-unicode') {
      const char = inputValue || 'A';
      const code = char.charCodeAt(0) || 0;
      const bin = code.toString(2).padStart(8, '0');
      return `Converting character '${char}' (ASCII decimal ${code}) to 8-bit binary representation: ${bin}. The farmer places seeds in the matching bit baskets.`;
    }

    return 'Explore computer basics dynamically.';
  };

  // ========== NUMBER SYSTEM DETAILED CONTENT ==========

  // Comprehensive explanation content per operation
  const NUMBER_SYSTEM_EXPLANATIONS = {
    'decimal-binary': {
      title: 'Decimal to Binary Conversion',
      concept: 'The decimal (base-10) system uses digits 0–9, while binary (base-2) uses only 0 and 1. Every digital device processes data in binary because transistors have two states: ON (1) and OFF (0).',
      keyPoints: [
        'Binary is a positional number system with base 2',
        'Each position represents a power of 2 (1, 2, 4, 8, 16, 32...)',
        'Method: Repeatedly divide by 2 and collect remainders',
        'Read remainders from bottom to top for the binary result'
      ],
      realWorld: '🌾 Farmer Analogy: Imagine you have seeds to distribute into baskets labeled 16, 8, 4, 2, 1. Start from the biggest basket — if you have enough seeds, fill it (1). Otherwise skip it (0).',
      formula: 'Decimal N → Binary: Divide N by 2 repeatedly. Remainders in reverse = binary.',
      conversionTable: [
        { dec: '0', bin: '0000', oct: '0', hex: '0' },
        { dec: '5', bin: '0101', oct: '5', hex: '5' },
        { dec: '10', bin: '1010', oct: '12', hex: 'A' },
        { dec: '15', bin: '1111', oct: '17', hex: 'F' },
        { dec: '19', bin: '10011', oct: '23', hex: '13' },
        { dec: '31', bin: '11111', oct: '37', hex: '1F' }
      ]
    },
    'binary-decimal': {
      title: 'Binary to Decimal Conversion',
      concept: 'To convert binary to decimal, multiply each bit by its positional power of 2, then sum all values. The rightmost bit is 2⁰, next is 2¹, then 2², and so on.',
      keyPoints: [
        'Each binary digit is multiplied by 2 raised to its position',
        'Position counting starts from 0 (rightmost)',
        'Sum all the products to get the decimal value',
        'Example: 10011 = 1×16 + 0×8 + 0×4 + 1×2 + 1×1 = 19'
      ],
      realWorld: '🌾 Farmer Analogy: Count how many seeds are in each basket (16, 8, 4, 2, 1). If there\'s a seed (1), count that basket\'s value. Add them all up!',
      formula: 'Binary b₄b₃b₂b₁b₀ → Decimal = b₄×2⁴ + b₃×2³ + b₂×2² + b₁×2¹ + b₀×2⁰'
    },
    'decimal-octal': {
      title: 'Decimal to Octal Conversion',
      concept: 'Octal (base-8) uses digits 0–7. It\'s commonly used in Unix file permissions and as a shorthand for binary (each octal digit = 3 binary bits).',
      keyPoints: [
        'Octal is base-8: digits are 0, 1, 2, 3, 4, 5, 6, 7',
        'Method: Repeatedly divide by 8 and collect remainders',
        'Read remainders from bottom to top',
        '1 octal digit = exactly 3 binary digits'
      ],
      realWorld: '🌾 Farmer Analogy: Instead of 2-seed baskets, imagine baskets that hold up to 7 seeds each. Fill from the largest group of 8 first!',
      formula: 'Decimal N → Octal: Divide N by 8 repeatedly. Remainders in reverse = octal.'
    },
    'decimal-hex': {
      title: 'Decimal to Hexadecimal Conversion',
      concept: 'Hexadecimal (base-16) uses digits 0–9 and letters A–F (where A=10, B=11, C=12, D=13, E=14, F=15). It\'s widely used in memory addresses, color codes (#FF5733), and programming.',
      keyPoints: [
        'Hex is base-16: 0-9 and A(10), B(11), C(12), D(13), E(14), F(15)',
        'Method: Repeatedly divide by 16 and collect remainders',
        'Remainders ≥ 10 are replaced with letters A-F',
        '1 hex digit = exactly 4 binary digits'
      ],
      realWorld: '🌾 Farmer Analogy: Super-sized baskets! Each basket can hold up to 15 seeds. When counting past 9, use letter names (A=10 seeds, B=11...).',
      formula: 'Decimal N → Hex: Divide N by 16 repeatedly. Remainders (using A-F for 10-15) in reverse = hex.'
    },
    'binary-addition': {
      title: 'Binary Addition',
      concept: 'Binary addition follows the same principle as decimal addition, but carries happen at 2 instead of 10. The rules are: 0+0=0, 0+1=1, 1+0=1, 1+1=10 (0 carry 1).',
      keyPoints: [
        '0 + 0 = 0 (no carry)',
        '0 + 1 = 1 (no carry)',
        '1 + 0 = 1 (no carry)',
        '1 + 1 = 10 (write 0, carry 1)',
        '1 + 1 + 1 = 11 (write 1, carry 1)'
      ],
      realWorld: '🌾 Farmer Analogy: When two seed baskets overflow (both have 1), combine them and carry one seed to the next bigger basket!',
      formula: 'Add column by column from right to left, carrying over when sum ≥ 2.'
    },
    'ones-complement': {
      title: "1's Complement",
      concept: "1's complement is found by flipping (inverting) every bit of the binary number. 0 becomes 1, and 1 becomes 0. It's used in older systems to represent negative numbers.",
      keyPoints: [
        'Flip every bit: 0→1 and 1→0',
        'Used for representing negative numbers in some systems',
        'Has two representations of zero (+0 and -0)',
        'Range for n bits: -(2ⁿ⁻¹ - 1) to +(2ⁿ⁻¹ - 1)'
      ],
      realWorld: "🌾 Farmer Analogy: For every basket that HAS a seed, remove it. For every EMPTY basket, add a seed. It's like swapping full and empty!",
      formula: "1's complement of N = Flip all bits (0↔1)"
    },
    'twos-complement': {
      title: "2's Complement",
      concept: "2's complement is the most widely used method for representing signed (negative) integers in computers. It's calculated by taking 1's complement and adding 1.",
      keyPoints: [
        "Step 1: Find 1's complement (flip all bits)",
        'Step 2: Add 1 to the result',
        'Only one representation of zero',
        'Range for n bits: -2ⁿ⁻¹ to +(2ⁿ⁻¹ - 1)',
        'Used in all modern processors for signed arithmetic'
      ],
      realWorld: "🌾 Farmer Analogy: Swap all seeds and empties (1's complement), then add one extra seed to the smallest basket!",
      formula: "2's complement of N = (Flip all bits) + 1"
    }
  };

  const MEMORY_ORG_EXPLANATION = {
    title: 'Memory Hierarchy',
    concept: 'Computer memory is organized in a hierarchy based on speed, capacity, and cost. Faster memory is more expensive and smaller in capacity, while slower memory is cheaper and larger.',
    keyPoints: [
      'Cache (L1/L2/L3): Extremely fast, small capacity, located on or near the CPU.',
      'RAM (Main Memory): Fast volatile memory used for active processes.',
      'SSD/HDD (Secondary Storage): Slower, non-volatile memory for long-term storage.',
      'Registers: The fastest and smallest memory locations directly within the CPU.'
    ],
    realWorld: '🌾 Farmer Analogy: Think of it like accessing tools! Tools in your pocket (Cache) are accessed instantly. Tools in your bag (RAM) take a bit longer to get. Tools in the shed (SSD) take a walk to fetch, and tools in a distant warehouse (HDD) take a truck ride!',
    formula: 'Speed vs Capacity Trade-off: As you move down the hierarchy, Capacity increases but Speed decreases.'
  };

  const COMPUTER_ARCH_EXPLANATION = {
    title: 'Hardware Data-Pathways',
    concept: 'Computer Architecture defines how the physical components of a computer system are organized and interact. The core principle is the movement of data between memory, the processor, and input/output devices through a shared bus system.',
    keyPoints: [
      'The CPU consists of the ALU (math/logic) and Control Unit (orchestrator).',
      'The System Bus acts as the highway, moving data, addresses, and control signals.',
      'RAM stores both the instructions and the data being processed (Von Neumann architecture).',
      'Data flows from input (Keyboard) → RAM → CPU (Processing) → RAM → output (Monitor).'
    ],
    realWorld: '🌾 Farmer Analogy: Think of a factory! The RAM is the warehouse. The CPU is the factory floor where workers (ALU) assemble items. The Control Unit is the manager directing workers. The Bus is the conveyor belt moving raw materials and finished goods around!',
    formula: 'Fetch-Decode-Execute Cycle: The fundamental operating sequence of all modern computers.'
  };

  const OS_BASICS_EXPLANATION = {
    title: 'Operating System Core',
    concept: 'An Operating System acts as the chief manager of a computer. It sits between the user/applications and the physical hardware, ensuring everything runs smoothly without crashing into each other.',
    keyPoints: [
      'Kernel: The absolute core of the OS that has complete control over everything in the system.',
      'Process Management: Decides which application gets to use the CPU and for how long.',
      'Memory Management: Allocates RAM to running programs safely so they don\'t overwrite each other.',
      'File System: Organizes how data is stored and retrieved from the hard drive.'
    ],
    realWorld: '🌾 Farmer Analogy: Imagine a massive, busy restaurant. The Hardware is the kitchen equipment. The Apps are the customers ordering food. The OS is the General Manager ensuring chefs (CPU) cook the right meals, ingredients (RAM) are tracked, and waiters deliver food without chaos.',
    formula: 'Resource Allocation: OS = Hardware Abstraction + Resource Management.'
  };

  // Dynamic steps generator per operation
  const getNumberSystemSteps = () => {
    const val = parseInt(inputValue, 10) || 0;
    
    if (operation === 'decimal-binary') {
      const steps = [];
      let n = val;
      steps.push({ label: 'Start', detail: `Convert decimal ${val} to binary using repeated division by 2.`, icon: '🚀' });
      let divisions = [];
      let tempN = val;
      while (tempN > 0) {
        const remainder = tempN % 2;
        const quotient = Math.floor(tempN / 2);
        divisions.push({ dividend: tempN, quotient, remainder });
        tempN = quotient;
      }
      if (divisions.length === 0) divisions.push({ dividend: 0, quotient: 0, remainder: 0 });
      divisions.forEach((d, i) => {
        steps.push({ label: `Division ${i + 1}`, detail: `${d.dividend} ÷ 2 = ${d.quotient}, remainder = ${d.remainder}`, icon: '➗' });
      });
      const binary = val.toString(2);
      steps.push({ label: 'Collect', detail: `Read remainders bottom → top: ${binary}`, icon: '📋' });
      steps.push({ label: 'Result', detail: `Decimal ${val} = Binary ${binary}`, icon: '✔️' });
      return steps;
    }
    
    if (operation === 'binary-decimal') {
      const binary = val.toString(2);
      const steps = [{ label: 'Start', detail: `Convert binary of ${val} back to decimal using positional weights.`, icon: '🚀' }];
      const bits = binary.split('');
      bits.forEach((bit, i) => {
        const power = bits.length - 1 - i;
        const contribution = parseInt(bit) * Math.pow(2, power);
        steps.push({ label: `Bit ${i + 1}`, detail: `${bit} × 2^${power} = ${bit} × ${Math.pow(2, power)} = ${contribution}`, icon: bit === '1' ? '🌾' : '⬜' });
      });
      steps.push({ label: 'Sum', detail: `Add all: ${bits.map((b, i) => parseInt(b) * Math.pow(2, bits.length - 1 - i)).join(' + ')} = ${val}`, icon: '➕' });
      steps.push({ label: 'Result', detail: `Binary ${binary} = Decimal ${val}`, icon: '✔️' });
      return steps;
    }
    
    if (operation === 'decimal-octal') {
      const steps = [{ label: 'Start', detail: `Convert decimal ${val} to octal using repeated division by 8.`, icon: '🚀' }];
      let tempN = val;
      let divisions = [];
      while (tempN > 0) {
        const remainder = tempN % 8;
        const quotient = Math.floor(tempN / 8);
        divisions.push({ dividend: tempN, quotient, remainder });
        tempN = quotient;
      }
      if (divisions.length === 0) divisions.push({ dividend: 0, quotient: 0, remainder: 0 });
      divisions.forEach((d, i) => {
        steps.push({ label: `Division ${i + 1}`, detail: `${d.dividend} ÷ 8 = ${d.quotient}, remainder = ${d.remainder}`, icon: '➗' });
      });
      const octal = val.toString(8);
      steps.push({ label: 'Collect', detail: `Read remainders bottom → top: ${octal}`, icon: '📋' });
      steps.push({ label: 'Result', detail: `Decimal ${val} = Octal ${octal}`, icon: '✔️' });
      return steps;
    }
    
    if (operation === 'decimal-hex') {
      const steps = [{ label: 'Start', detail: `Convert decimal ${val} to hexadecimal using repeated division by 16.`, icon: '🚀' }];
      let tempN = val;
      let divisions = [];
      while (tempN > 0) {
        const remainder = tempN % 16;
        const quotient = Math.floor(tempN / 16);
        const hexChar = remainder >= 10 ? String.fromCharCode(55 + remainder) : remainder.toString();
        divisions.push({ dividend: tempN, quotient, remainder, hexChar });
        tempN = quotient;
      }
      if (divisions.length === 0) divisions.push({ dividend: 0, quotient: 0, remainder: 0, hexChar: '0' });
      divisions.forEach((d, i) => {
        steps.push({ label: `Division ${i + 1}`, detail: `${d.dividend} ÷ 16 = ${d.quotient}, remainder = ${d.remainder}${d.remainder >= 10 ? ` (${d.hexChar})` : ''}`, icon: '➗' });
      });
      const hex = val.toString(16).toUpperCase();
      steps.push({ label: 'Collect', detail: `Read remainders bottom → top: ${hex}`, icon: '📋' });
      steps.push({ label: 'Result', detail: `Decimal ${val} = Hexadecimal 0x${hex}`, icon: '✔️' });
      return steps;
    }
    
    if (operation === 'binary-addition') {
      return [
        { label: 'Setup', detail: 'Write both binary numbers aligned by right side.', icon: '🚀' },
        { label: 'Rule 1', detail: '0 + 0 = 0 (no carry)', icon: '📝' },
        { label: 'Rule 2', detail: '0 + 1 = 1 or 1 + 0 = 1 (no carry)', icon: '📝' },
        { label: 'Rule 3', detail: '1 + 1 = 10 → write 0, carry 1 to next column', icon: '📝' },
        { label: 'Rule 4', detail: '1 + 1 + 1 (with carry) = 11 → write 1, carry 1', icon: '📝' },
        { label: 'Process', detail: 'Add column by column from rightmost bit to left.', icon: '⚡' },
        { label: 'Done', detail: 'Include final carry bit if present.', icon: '✔️' }
      ];
    }
    
    if (operation === 'ones-complement') {
      const binary = val.toString(2).padStart(5, '0');
      const flipped = binary.split('').map(b => b === '0' ? '1' : '0').join('');
      return [
        { label: 'Start', detail: `Find 1\'s complement of decimal ${val}.`, icon: '🚀' },
        { label: 'Convert', detail: `Decimal ${val} in binary = ${binary}`, icon: '🔄' },
        ...binary.split('').map((b, i) => ({ label: `Flip bit ${i + 1}`, detail: `Bit ${b} → ${b === '0' ? '1' : '0'}`, icon: b === '0' ? '🌾' : '⬜' })),
        { label: 'Result', detail: `1\'s complement of ${binary} = ${flipped}`, icon: '✔️' }
      ];
    }
    
    if (operation === 'twos-complement') {
      const binary = val.toString(2).padStart(5, '0');
      const onesComp = binary.split('').map(b => b === '0' ? '1' : '0').join('');
      const twosVal = parseInt(onesComp, 2) + 1;
      const twosComp = twosVal.toString(2).padStart(5, '0');
      return [
        { label: 'Start', detail: `Find 2\'s complement of decimal ${val}.`, icon: '🚀' },
        { label: 'Convert', detail: `Decimal ${val} in binary = ${binary}`, icon: '🔄' },
        { label: "1's Complement", detail: `Flip all bits: ${binary} → ${onesComp}`, icon: '🔁' },
        { label: 'Add 1', detail: `${onesComp} + 1 = ${twosComp}`, icon: '➕' },
        { label: 'Result', detail: `2\'s complement of ${val} = ${twosComp}`, icon: '✔️' }
      ];
    }
    
    return [
      { label: 'Start', detail: 'Select an operation and input a value to see steps.', icon: '🚀' },
      { label: 'Process', detail: 'The conversion will be shown step by step.', icon: '⚙️' },
      { label: 'Result', detail: 'Final result will appear here.', icon: '✔️' }
    ];
  };

  // Quizzes list
  const QUIZ_QUESTIONS = {
    'number-system': [
      { q: "What is the binary representation of decimal 19?", o: ["10011", "10101", "11001", "10001"], a: 0 },
      { q: "How is binary addition 1 + 1 calculated?", o: ["0 with carry 0", "1 with carry 1", "0 with carry 1", "2"], a: 2 },
      { q: "What is the octal equivalent of decimal 19?", o: ["21", "23", "17", "19"], a: 1 },
      { q: "What is the hexadecimal equivalent of decimal 255?", o: ["EF", "FF", "FE", "1F"], a: 1 },
      { q: "What is the 1's complement of binary 10011?", o: ["01100", "10100", "01101", "11100"], a: 0 },
      { q: "What is the 2's complement of binary 10011?", o: ["01100", "01101", "10100", "01110"], a: 1 },
      { q: "How many binary bits does one hexadecimal digit represent?", o: ["2 bits", "3 bits", "4 bits", "8 bits"], a: 2 },
      { q: "What is binary 1010 in decimal?", o: ["8", "10", "12", "11"], a: 1 },
      { q: "Which number system is base-8?", o: ["Binary", "Decimal", "Hexadecimal", "Octal"], a: 3 },
      { q: "In hexadecimal, what letter represents decimal 12?", o: ["A", "B", "C", "D"], a: 2 }
    ],
    'logic-gates': [
      { q: "Which gate gives output 1 only when both inputs are 1?", o: ["OR", "AND", "XOR", "NAND"], a: 1 },
      { q: "NAND output is equivalent to which combination?", o: ["AND + NOT", "OR + NOT", "XOR + NOT", "None"], a: 0 }
    ],
    'flowcharts': [
      { q: "What shape represents a decision block in a flowchart?", o: ["Rectangle", "Oval", "Diamond", "Parallelogram"], a: 2 }
    ],
    'memory-org': [
      { q: "Which memory level is the fastest?", o: ["RAM", "SSD", "Hard Disk", "Cache"], a: 3 },
      { q: "Which memory is volatile and loses data when power is turned off?", o: ["ROM", "SSD", "RAM", "Hard Disk"], a: 2 },
      { q: "Which of these provides the largest storage capacity typically?", o: ["Cache", "RAM", "Registers", "Hard Disk"], a: 3 },
      { q: "Where is L1 cache located?", o: ["On the motherboard", "Inside the CPU", "In the RAM stick", "In the Hard Drive"], a: 1 },
      { q: "Which type of memory uses magnetic platters to store data?", o: ["SSD", "RAM", "HDD", "Cache"], a: 2 },
      { q: "What does SSD stand for?", o: ["Solid State Drive", "Super Speed Disk", "System Storage Device", "Silicon State Disk"], a: 0 },
      { q: "What is the primary function of RAM?", o: ["Long term storage", "Storing the OS permanently", "Holding active programs and data", "Cooling the CPU"], a: 2 },
      { q: "Which memory is closest to the CPU execution units?", o: ["L3 Cache", "RAM", "Registers", "L1 Cache"], a: 2 },
      { q: "As you go down the memory hierarchy (from CPU outwards), what happens?", o: ["Speed increases, capacity decreases", "Speed decreases, capacity increases", "Both increase", "Both decrease"], a: 1 },
      { q: "Which type of storage uses flash memory instead of spinning disks?", o: ["HDD", "SSD", "CD-ROM", "Floppy Disk"], a: 1 }
    ],
    'computer-arch': [
      { q: "What unit executes arithmetic operations in the CPU?", o: ["ALU", "Control Unit", "Registers", "Cache"], a: 0 },
      { q: "What does the Control Unit do?", o: ["Stores data permanently", "Performs math", "Directs processor operations", "Draws graphics"], a: 2 },
      { q: "Which part of the CPU stores the current instruction being executed?", o: ["ALU", "Instruction Register (IR)", "Program Counter (PC)", "RAM"], a: 1 },
      { q: "What carries memory addresses between components?", o: ["Data Bus", "Control Bus", "Address Bus", "USB"], a: 2 },
      { q: "What is the sequence of the fundamental CPU cycle?", o: ["Execute-Fetch-Decode", "Fetch-Decode-Execute", "Decode-Execute-Fetch", "Fetch-Execute-Decode"], a: 1 },
      { q: "Which component is considered the 'brain' of the computer?", o: ["RAM", "Motherboard", "CPU", "Hard Drive"], a: 2 },
      { q: "What architecture uses the same memory for both instructions and data?", o: ["Harvard Architecture", "Von Neumann Architecture", "Turing Architecture", "RISC Architecture"], a: 1 },
      { q: "What does the Accumulator register do?", o: ["Holds intermediate ALU results", "Keeps track of time", "Holds the next memory address", "Controls the power supply"], a: 0 },
      { q: "Which bus carries signals like read/write commands?", o: ["Data Bus", "Address Bus", "Control Bus", "Universal Bus"], a: 2 },
      { q: "What is the primary function of the Program Counter (PC)?", o: ["Counts the number of active programs", "Holds the address of the next instruction", "Stores user input", "Calculates math equations"], a: 1 }
    ]
  };

  const getQuizQuestions = () => {
    return QUIZ_QUESTIONS[selectedTopic?.id] || [
      { q: "What is the core unit of digital memory?", o: ["Byte", "Bit", "Kilobyte", "Word"], a: 1 }
    ];
  };

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-[#FAFAFA] text-black flex flex-col font-sans select-none relative">
      
      {/* Subtle light background dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0" />

      {/* TOP HEADER */}
      <header className="h-16 shrink-0 border-b border-neutral-200 flex items-center justify-between px-6 bg-white/95 backdrop-blur-xl relative z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (selectedTopic) setSelectedTopic(null);
              else navigate('/subjects');
            }} 
            className="p-2 hover:bg-neutral-100 border border-neutral-200 hover:border-black rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest text-neutral-500 font-bold uppercase">EduVerse AI Lab</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-black">Fundamentals of Computing</span>
              {selectedTopic && (
                <>
                  <span className="text-neutral-300">/</span>
                  <span className="text-black font-semibold flex items-center gap-1.5 bg-neutral-100 px-2.5 py-0.5 rounded-full text-xs border border-neutral-200">
                    {selectedTopic.icon} {selectedTopic.title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick info status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Visual Engine Active
            </span>
          </div>

          {selectedTopic && (
            <div className="flex bg-neutral-100 border border-neutral-200 p-0.5 rounded-lg">
              {['normal', 'slow-motion', 'debug', 'ai-tutor'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                    mode === m 
                      ? 'bg-white text-black shadow-sm' 
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
                  }`}
                >
                  {m.toUpperCase().replace('-', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* INTERACTIVE SCREENS CONTAINER */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          
          {/* LEVEL 1: DASHBOARD VIEW */}
          {!selectedTopic ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col p-6 overflow-hidden max-w-[1600px] mx-auto w-full justify-between"
            >
              <div>
                <div className="mb-4">
                  <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-black">
                    FOC Visualizer Laboratory
                  </h1>
                  <p className="text-neutral-500 text-sm mt-1 font-medium">
                    Interact, play, and comprehend the core fundamentals of computer science with visual farmer-themed simulations.
                  </p>
                </div>

                {/* Learning Roadmap Timeline */}
                <div className="mb-5 bg-white border border-neutral-200 rounded-2xl p-4 relative overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Learning Roadmap Timeline</h3>
                    <span className="text-[10px] text-neutral-400 font-mono">STEP-BY-STEP PROGRESSION</span>
                  </div>
                  
                  {/* Timeline path */}
                  <div className="relative flex items-center justify-between px-6 py-2">
                    {/* Connecting line background */}
                    <div className="absolute left-10 right-10 top-[22px] h-[2px] bg-neutral-100 z-0" />
                    {/* Active line fill */}
                    <div className="absolute left-10 top-[22px] h-[2px] bg-neutral-300 z-0" style={{ width: '40%' }} />

                    {FOC_TOPICS.slice(0, 6).map((topic, index) => {
                      const isCompleted = topic.progress === 100 || index < 2; 
                      
                      return (
                        <div 
                          key={topic.id} 
                          className="relative z-10 flex flex-col items-center group cursor-pointer" 
                          onClick={() => setSelectedTopic(topic)}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isCompleted ? 'bg-neutral-100 border-neutral-400 text-neutral-600' :
                            'bg-white border-neutral-200 text-neutral-400 group-hover:border-neutral-400 group-hover:text-neutral-600'
                          }`}>
                            <span className="text-xs font-mono font-bold">{index + 1}</span>
                          </div>
                          <span className="text-[10.5px] mt-2 font-bold tracking-tight text-neutral-400 group-hover:text-neutral-600 transition-colors">
                            {topic.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Learning Modules grid */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Learning Modules</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {FOC_TOPICS.map((topic) => (
                      <motion.div
                        key={topic.id}
                        whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}
                        onClick={() => setSelectedTopic(topic)}
                        className={`bg-white border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 flex flex-col justify-between group h-36 shadow-sm ${topic.borderColor}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="text-2xl transition-transform duration-300 group-hover:scale-125">{topic.icon}</div>
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded-full font-mono font-bold">
                              {topic.time}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              topic.diff === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              topic.diff === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {topic.diff}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-sm text-neutral-800 mt-2 group-hover:text-black transition-colors">
                            {topic.title}
                          </h4>
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-1 leading-relaxed">
                            {topic.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-neutral-100">
                          <div className="flex-1 mr-4">
                            <div className="w-full bg-neutral-100 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-black transition-all duration-500" 
                                style={{ width: `${topic.progress}%` }} 
                              />
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-neutral-400 group-hover:text-black">
                            {topic.progress}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Special Learning Tools */}
              <div className="mt-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Specialized Simulations & Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {SPECIAL_CARDS.map((card) => (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.03, borderColor: '#000000', boxShadow: '0 0 15px rgba(0,0,0,0.04)' }}
                      onClick={() => {
                        const matched = FOC_TOPICS.find(t => t.id === 'number-system');
                        setSelectedTopic(matched);
                      }}
                      className="bg-white border border-neutral-200 rounded-xl p-3 cursor-pointer transition-all duration-300 flex flex-col justify-between group h-28 shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-xl group-hover:rotate-12 transition-transform duration-300">{card.icon}</div>
                        <span className="text-[9px] bg-neutral-100 border border-neutral-200 text-neutral-500 px-1.5 py-0.2 rounded font-mono">
                          {card.diff}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-neutral-800 mt-2 line-clamp-1 group-hover:text-black">{card.title}</h4>
                        <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">{card.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            
            /* LEVEL 2: THREE-PANEL INTERACTIVE VISUALIZER */
            <motion.div 
              key="visualizer"
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.3 }}
              className="h-full flex p-4 gap-4 overflow-hidden"
            >
              
              {/* LEFT PANEL: CONTROLS */}
              <div className="w-[300px] shrink-0 h-full bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
                <div className="space-y-4">
                  {/* EduVerse AI Learning Card */}
                  <div className="bg-black text-white p-3.5 rounded-xl border border-neutral-900 space-y-1.5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">EduVerse AI Learning Card</span>
                      <span className="text-xs">✨</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black tracking-tight text-white">{selectedTopic.title}</h4>
                      <p className="text-[10px] text-neutral-400">Fundamentals of Computing</p>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-neutral-900 mt-1">
                      <span className="text-[9px] font-mono text-neutral-400">EST: {selectedTopic.time}</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">DIFF: {selectedTopic.diff.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Operation Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-500 font-bold">SELECT OPERATION</label>
                    <div className="relative">
                      {selectedTopic.id === 'number-system' && (
                        <select 
                          value={operation}
                          onChange={(e) => setOperation(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="decimal-binary">➕ Decimal → Binary</option>
                          <option value="binary-decimal">➕ Binary → Decimal</option>
                          <option value="decimal-octal">➕ Decimal → Octal</option>
                          <option value="decimal-hex">➕ Decimal → Hexadecimal</option>
                          <option value="binary-addition">➕ Binary Addition</option>
                          <option value="ones-complement">➕ 1's Complement</option>
                          <option value="twos-complement">➕ 2's Complement</option>
                        </select>
                      )}

                      {selectedTopic.id === 'logic-gates' && (
                        <select 
                          value={gateType}
                          onChange={(e) => setGateType(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="AND">AND Gate</option>
                          <option value="OR">OR Gate</option>
                          <option value="NOT">NOT Gate</option>
                          <option value="NAND">NAND Gate</option>
                          <option value="NOR">NOR Gate</option>
                          <option value="XOR">XOR Gate</option>
                        </select>
                      )}

                      {selectedTopic.id === 'flowcharts' && (
                        <select 
                          value={flowchartTopic}
                          onChange={(e) => setFlowchartTopic(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="Even/Odd">Even/Odd Algorithm</option>
                          <option value="Prime Number">Prime Number Checker</option>
                          <option value="Factorial">Factorial Calculator</option>
                          <option value="Largest Among Three">Largest of Three</option>
                        </select>
                      )}

                      {selectedTopic.id === 'ascii-unicode' && (
                        <select 
                          value={operation}
                          onChange={(e) => setOperation(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option value="char-binary">➕ Character → Binary</option>
                          <option value="binary-char">➕ Binary → Character</option>
                        </select>
                      )}

                      {selectedTopic.id === 'memory-org' && (
                        <select 
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-black focus:outline-none focus:border-black transition-all appearance-none cursor-pointer"
                        >
                          <option>Cache → RAM → SSD → HDD</option>
                        </select>
                      )}

                      {selectedTopic.id === 'computer-arch' && (
                        <select 
                          className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-white transition-all appearance-none cursor-pointer"
                        >
                          <option>Full Architecture Pathways</option>
                        </select>
                      )}
                      
                      <div className="absolute right-3 top-3.5 pointer-events-none text-neutral-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Input Value */}
                  {selectedTopic.id === 'number-system' && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-500 font-bold">INPUT VALUE</label>
                      <input 
                        type="number" 
                        value={inputValue}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(31, parseInt(e.target.value, 10) || 0));
                          setInputValue(val.toString());
                        }}
                        className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-xl px-3 py-2.5 text-sm font-bold text-black focus:outline-none transition-all font-mono"
                        placeholder="Value (0-31)"
                      />
                    </div>
                  )}

                  {selectedTopic.id === 'ascii-unicode' && (
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-500 font-bold">INPUT CHARACTER</label>
                      <input 
                        type="text" 
                        maxLength={1}
                        value={inputValue}
                        onChange={(e) => {
                          const val = e.target.value || 'A';
                          setInputValue(val);
                        }}
                        className="w-full bg-neutral-50 border border-neutral-200 focus:border-black rounded-xl px-3 py-2.5 text-sm font-bold text-black focus:outline-none transition-all font-mono text-center text-xl font-black"
                        placeholder="A"
                      />
                    </div>
                  )}

                  {/* Gate Toggle Switch for logic gates */}
                  {selectedTopic.id === 'logic-gates' && (
                    <div className="space-y-3 bg-neutral-50 border border-neutral-200 p-3 rounded-xl">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Toggle Inputs</span>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold font-mono">Input A</span>
                        <button 
                          onClick={() => setGateA(!gateA)}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${gateA ? 'bg-black' : 'bg-neutral-300'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${gateA ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {gateType !== 'NOT' && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold font-mono">Input B</span>
                          <button 
                            onClick={() => setGateB(!gateB)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${gateB ? 'bg-black' : 'bg-neutral-300'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${gateB ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Control Buttons Group */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setIsAnimating(true);
                        setAnimationStep(0);
                      }}
                      disabled={isAnimating}
                      className="bg-white hover:bg-neutral-50 text-black border border-neutral-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-sm disabled:opacity-40"
                    >
                      <Play className="w-3.5 h-3.5 fill-black text-black" /> Run
                    </button>
                    <button 
                      onClick={() => setIsAnimating(false)}
                      className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-black"
                    >
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </button>
                    <button 
                      onClick={() => {
                        let maxSteps = 5;
                        setAnimationStep(prev => (prev + 1) % maxSteps);
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-black"
                    >
                      <SkipForward className="w-3.5 h-3.5" /> Step
                    </button>
                    <button 
                      onClick={() => {
                        setAnimationStep(0);
                        setIsAnimating(false);
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-black"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                  </div>

                  {/* Speed slider */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[11px] font-bold text-neutral-400">
                      <span>SPEED</span>
                      <span>{playbackSpeed}x</span>
                    </div>
                    <input 
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.25"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                </div>

                {/* Extra buttons */}
                <div className="space-y-2 border-t border-neutral-200 pt-4">
                  <button 
                    onClick={() => setActiveTab('quiz')}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-black font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-black"
                  >
                    <Award className="w-3.5 h-3.5" /> Take Module Quiz
                  </button>
                  <button 
                    onClick={() => {
                      setAnimationStep(0);
                      setIsAnimating(true);
                    }}
                    className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-black font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-black"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Speech Explanation
                  </button>
                </div>
              </div>

              {/* CENTER PANEL: VISUALIZATION CANVAS */}
              <div className="flex-1 h-full bg-white border border-neutral-200 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-sm">
                
                {/* Farmer Theme Alert / Description */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-neutral-50 border border-neutral-200 px-3.5 py-1.5 rounded-full z-20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">Farmer Simulation Engine</span>
                </div>

                {/* 1. NUMBER SYSTEM MODULE ANIMATION */}
                {selectedTopic.id === 'number-system' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-lg space-y-8">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">FARMER SEED PLACEMENT</span>
                      <h4 className="text-2xl font-extrabold mt-1">Decimal {inputValue} to Binary</h4>
                    </div>

                    {/* Basket grid representation */}
                    <div className="flex justify-center items-end gap-5 h-48 relative w-full pt-8">
                      {getBinaryBaskets(inputValue).map((basket, index) => {
                        const isCurrentActive = animationStep > index;
                        return (
                          <div key={basket.name} className="flex flex-col items-center space-y-3 flex-1 max-w-[80px]">
                            {/* Seed placing anim / seed state */}
                            <div className="h-16 flex items-center justify-center relative w-full">
                              <AnimatePresence>
                                {isCurrentActive && basket.active && (
                                  <motion.div 
                                    initial={{ y: -60, opacity: 0, scale: 0.5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    className="text-3xl filter drop-shadow-[0_0_10px_rgba(22,163,74,0.3)]"
                                  >
                                    ✔️
                                  </motion.div>
                                )}
                                {isCurrentActive && !basket.active && (
                                  <motion.div 
                                    initial={{ y: -60, opacity: 0 }}
                                    animate={{ y: 0, opacity: 0.4 }}
                                    className="text-lg font-black text-red-500 font-mono"
                                  >
                                    ❌
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Basket UI */}
                            <motion.div 
                              animate={isCurrentActive && basket.active ? { 
                                borderColor: '#000000', 
                                boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)' 
                              } : {}}
                              className="w-full h-16 border-2 border-neutral-300 rounded-b-xl rounded-t-sm flex flex-col items-center justify-center bg-neutral-50 relative"
                            >
                              <span className="text-xs font-mono font-bold text-neutral-400">Basket</span>
                              <span className="text-lg font-black font-mono">{basket.name}</span>
                            </motion.div>

                            {/* Binary Bit value */}
                            <div className="font-mono text-xl font-bold">
                              {isCurrentActive ? (basket.active ? '1' : '0') : '-'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center font-mono text-xl tracking-widest font-black text-neutral-600 pt-4">
                      BINARY CODE: {
                        getBinaryBaskets(inputValue)
                          .map((b, i) => (animationStep > i ? (b.active ? '1' : '0') : '-'))
                          .join(' ')
                      }
                    </div>
                  </div>
                )}

                {/* 2. LOGIC GATES MODULE ANIMATION */}
                {selectedTopic.id === 'logic-gates' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-xl space-y-10">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">CHICKEN LOGIC FLOW</span>
                      <h4 className="text-2xl font-extrabold mt-1">{gateType} Logic Gate</h4>
                    </div>

                    <div className="flex items-center justify-between w-full h-40 px-10 relative">
                      {/* Chicken inputs */}
                      <div className="flex flex-col gap-8 justify-center">
                        <motion.div 
                          animate={isAnimating ? { x: [0, 160, 160], opacity: [1, 1, 0] } : {}}
                          transition={{ duration: 2 }}
                          className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200"
                        >
                          <span className="text-2xl">🐔</span>
                          <div className="flex flex-col">
                            <span className="text-[9px] text-neutral-500 font-bold uppercase">Input A</span>
                            <span className={`text-xs font-bold font-mono ${gateA ? 'text-emerald-600' : 'text-neutral-500'}`}>
                              {gateA ? 'TRUE (1)' : 'FALSE (0)'}
                            </span>
                          </div>
                        </motion.div>

                        {gateType !== 'NOT' && (
                          <motion.div 
                            animate={isAnimating ? { x: [0, 160, 160], opacity: [1, 1, 0] } : {}}
                            transition={{ duration: 2 }}
                            className="flex items-center gap-3 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200"
                          >
                            <span className="text-2xl">🐔</span>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-neutral-500 font-bold uppercase">Input B</span>
                              <span className={`text-xs font-bold font-mono ${gateB ? 'text-emerald-600' : 'text-neutral-500'}`}>
                                {gateB ? 'TRUE (1)' : 'FALSE (0)'}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Gate Node */}
                      <div className="w-28 h-28 rounded-full border-2 border-neutral-300 bg-white flex items-center justify-center relative shadow-sm z-10">
                        <span className="font-black tracking-widest text-lg font-mono">{gateType}</span>
                        <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-25 ${
                          gateResult ? 'border-emerald-500' : 'border-red-500'
                        }`} />
                      </div>

                      {/* Output Egg */}
                      <div>
                        <motion.div 
                          animate={isAnimating ? { scale: [0.5, 1.2, 1] } : {}}
                          className={`flex items-center gap-3 p-3 rounded-2xl border ${
                            gateResult 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                              : 'bg-red-50 border-red-500 text-red-700 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                          }`}
                        >
                          <span className="text-3xl">{gateResult ? '🥚' : '🍳'}</span>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase text-neutral-500">Output</span>
                            <span className="text-sm font-black font-mono">
                              {gateResult ? 'TRUE (1)' : 'FALSE (0)'}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. FLOWCHARTS MODULE ANIMATION */}
                {selectedTopic.id === 'flowcharts' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-md space-y-6">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">LOGIC PATHWAY</span>
                      <h4 className="text-xl font-extrabold mt-1">{flowchartTopic} Flowchart</h4>
                    </div>

                    <div className="space-y-4 w-full flex flex-col items-center">
                      {/* START block */}
                      <div className={`px-5 py-2.5 rounded-full border text-xs font-mono font-bold transition-all ${
                        animationStep === 0 ? 'bg-black text-white border-black scale-105 shadow-md' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        [ START ]
                      </div>

                      <div className="w-0.5 h-6 bg-neutral-200" />

                      {/* INPUT block */}
                      <div className={`px-6 py-2.5 rounded-md border text-xs font-mono font-bold transition-all skew-x-12 ${
                        animationStep === 1 ? 'bg-black text-white border-black scale-105 shadow-md' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        Input Number N
                      </div>

                      <div className="w-0.5 h-6 bg-neutral-200" />

                      {/* DECISION block */}
                      <div className={`px-5 py-4 border text-xs font-mono font-bold transition-all rotate-45 flex items-center justify-center w-24 h-24 ${
                        animationStep === 2 ? 'bg-black text-white border-black scale-105 shadow-md' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        <span className="-rotate-45 text-center">N % 2 == 0?</span>
                      </div>

                      <div className="w-0.5 h-6 bg-neutral-200" />

                      {/* BRANCH blocks */}
                      <div className="flex justify-between w-full max-w-[280px]">
                        <div className={`px-4 py-2 rounded-md border text-[11px] font-mono transition-all ${
                          animationStep === 3 ? 'bg-emerald-500 text-white border-emerald-400 scale-105 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                        }`}>
                          Print "Even"
                        </div>
                        <div className={`px-4 py-2 rounded-md border text-[11px] font-mono transition-all ${
                          animationStep === 4 ? 'bg-amber-500 text-white border-amber-400 scale-105 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                        }`}>
                          Print "Odd"
                        </div>
                      </div>

                      <div className="w-0.5 h-6 bg-neutral-200" />

                      {/* END block */}
                      <div className={`px-5 py-2.5 rounded-full border text-xs font-mono font-bold transition-all ${
                        animationStep === 5 ? 'bg-black text-white border-black scale-105 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      }`}>
                        [ END ]
                      </div>
                    </div>
                  </div>
                )}

                {/* 3.5. ASCII & UNICODE MODULE ANIMATION */}
                {selectedTopic.id === 'ascii-unicode' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-xl space-y-8">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">ENCODING ENGINE</span>
                      <h4 className="text-2xl font-extrabold mt-1">Character representation for '{inputValue || 'A'}'</h4>
                    </div>

                    <div className="flex justify-around items-center w-full bg-neutral-50 border border-neutral-200 p-4 rounded-2xl">
                      <div className="text-center">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">CHARACTER</span>
                        <span className="text-4xl font-extrabold text-black mt-1 block font-mono">'{inputValue || 'A'}'</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">ASCII DECIMAL</span>
                        <span className="text-3xl font-black text-emerald-600 mt-1 block font-mono">
                          {(inputValue || 'A').charCodeAt(0) || 0}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-neutral-500 font-mono uppercase block">UNICODE POINT</span>
                        <span className="text-3xl font-black text-blue-600 mt-1 block font-mono">
                          U+{((inputValue || 'A').charCodeAt(0) || 0).toString(16).toUpperCase().padStart(4, '0')}
                        </span>
                      </div>
                    </div>

                    {/* 8-bit seed baskets */}
                    <div className="flex justify-center items-end gap-3 h-32 relative w-full pt-4">
                      {Array.from({ length: 8 }).map((_, i) => {
                        const bitIndex = 7 - i;
                        const bitWeight = 1 << bitIndex;
                        const charCode = (inputValue || 'A').charCodeAt(0) || 0;
                        const bitActive = (charCode & bitWeight) > 0;
                        const isCurrentActive = animationStep > i;

                        return (
                          <div key={bitWeight} className="flex flex-col items-center space-y-2 flex-1 max-w-[60px]">
                            <div className="h-8 flex items-center justify-center relative w-full">
                              <AnimatePresence>
                                {isCurrentActive && bitActive && (
                                  <motion.div 
                                    initial={{ y: -30, opacity: 0, scale: 0.5 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    className="text-2xl filter drop-shadow-[0_0_8px_rgba(22,163,74,0.3)]"
                                  >
                                    ✔️
                                  </motion.div>
                                )}
                                {isCurrentActive && !bitActive && (
                                  <motion.div 
                                    initial={{ y: -30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 0.4 }}
                                    className="text-sm font-black text-red-500 font-mono"
                                  >
                                    ❌
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Basket UI */}
                            <motion.div 
                              animate={isCurrentActive && bitActive ? { 
                                borderColor: '#000000', 
                                boxShadow: '0 0 10px rgba(0,0,0,0.1)' 
                              } : {}}
                              className="w-full h-12 border-2 border-neutral-300 rounded-b-lg rounded-t-sm flex flex-col items-center justify-center bg-neutral-50 relative"
                            >
                              <span className="text-[8px] font-mono text-neutral-500">{bitWeight}</span>
                            </motion.div>

                            {/* Binary Bit value */}
                            <div className="font-mono text-sm font-bold">
                              {isCurrentActive ? (bitActive ? '1' : '0') : '-'}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center font-mono text-lg tracking-widest font-black text-neutral-500">
                      BINARY CODE: {
                        Array.from({ length: 8 }).map((_, i) => {
                          const bitIndex = 7 - i;
                          const bitWeight = 1 << bitIndex;
                          const charCode = (inputValue || 'A').charCodeAt(0) || 0;
                          const bitActive = (charCode & bitWeight) > 0;
                          return animationStep > i ? (bitActive ? '1' : '0') : '-';
                        }).join(' ')
                      }
                    </div>
                  </div>
                )}

                {/* 4. MEMORY ORGANIZATION ANIMATION */}
                {selectedTopic.id === 'memory-org' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-xl space-y-8">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">STORAGE HIERARCHY</span>
                      <h4 className="text-2xl font-extrabold mt-1">Speed vs. Capacity Model</h4>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                      {/* Pocket (Cache) */}
                      <motion.div 
                        onClick={() => setActiveStorageIndex(0)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          activeStorageIndex === 0 ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">👖</span>
                          <div>
                            <h5 className={`font-bold text-sm ${activeStorageIndex === 0 ? 'text-indigo-900' : 'text-black'}`}>Pocket (Cache Memory)</h5>
                            <p className="text-[10px] text-neutral-500">Extremely fast, but tiny storage capacity.</p>
                          </div>
                        </div>
                        <span className={`text-xs font-mono font-bold ${activeStorageIndex === 0 ? 'text-indigo-600' : 'text-black'}`}>SPEED: 0.5ns | CAP: 32MB</span>
                      </motion.div>

                      {/* Bag (RAM) */}
                      <motion.div 
                        onClick={() => setActiveStorageIndex(1)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          activeStorageIndex === 1 ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎒</span>
                          <div>
                            <h5 className={`font-bold text-sm ${activeStorageIndex === 1 ? 'text-indigo-900' : 'text-black'}`}>Bag (RAM - Random Access)</h5>
                            <p className="text-[10px] text-neutral-500">Fast volatile memory for open applications.</p>
                          </div>
                        </div>
                        <span className={`text-xs font-mono font-bold ${activeStorageIndex === 1 ? 'text-indigo-600' : 'text-black'}`}>SPEED: 15ns | CAP: 16GB</span>
                      </motion.div>

                      {/* Store Room (SSD) */}
                      <motion.div 
                        onClick={() => setActiveStorageIndex(2)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          activeStorageIndex === 2 ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🚪</span>
                          <div>
                            <h5 className={`font-bold text-sm ${activeStorageIndex === 2 ? 'text-indigo-900' : 'text-black'}`}>Store Room (Solid State Drive)</h5>
                            <p className="text-[10px] text-neutral-500">High-speed non-volatile storage.</p>
                          </div>
                        </div>
                        <span className={`text-xs font-mono font-bold ${activeStorageIndex === 2 ? 'text-indigo-600' : 'text-black'}`}>SPEED: 100μs | CAP: 1TB</span>
                      </motion.div>

                      {/* Warehouse (Hard Disk) */}
                      <motion.div 
                        onClick={() => setActiveStorageIndex(3)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          activeStorageIndex === 3 ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20 scale-[1.02]' : 'bg-white border-neutral-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🏭</span>
                          <div>
                            <h5 className={`font-bold text-sm ${activeStorageIndex === 3 ? 'text-indigo-900' : 'text-black'}`}>Warehouse (Mechanical Hard Disk)</h5>
                            <p className="text-[10px] text-neutral-500">Huge capacity, slowest access times.</p>
                          </div>
                        </div>
                        <span className={`text-xs font-mono font-bold ${activeStorageIndex === 3 ? 'text-indigo-600' : 'text-black'}`}>SPEED: 5ms | CAP: 16TB</span>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* 5. COMPUTER ARCHITECTURE ANIMATION */}
                {selectedTopic.id === 'computer-arch' && (
                  <div className="flex flex-col items-center justify-center w-full max-w-2xl space-y-8">
                    <div className="text-center">
                      <span className="text-[11px] text-neutral-400 font-mono tracking-widest uppercase block">HARDWARE DATA-PATHWAYS</span>
                      <h4 className="text-2xl font-extrabold mt-1">Bus Line Data Packet simulation</h4>
                    </div>

                    <div className="flex items-center justify-between w-full px-6 relative h-40">
                      {/* Keyboard */}
                      <motion.div 
                        onClick={() => setActiveArchNode('keyboard')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl w-28 cursor-pointer transition-all ${
                          activeArchNode === 'keyboard' ? 'bg-white border-2 border-pink-500 shadow-md ring-2 ring-pink-500/20 scale-[1.05]' : 'bg-neutral-50 border border-neutral-200 hover:bg-white hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-3xl">⌨️</span>
                        <span className="text-xs font-bold font-mono">Keyboard</span>
                      </motion.div>

                      {/* CPU / ALU */}
                      <motion.div 
                        onClick={() => setActiveArchNode('cpu')}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl w-36 shadow-sm relative cursor-pointer transition-all ${
                          activeArchNode === 'cpu' ? 'bg-white border-2 border-pink-500 shadow-lg ring-4 ring-pink-500/20 scale-[1.05]' : 'bg-white border-2 border-black hover:border-neutral-800 hover:scale-[1.02]'
                        }`}
                      >
                        <span className="text-3xl">⚙️</span>
                        <span className="text-xs font-extrabold font-mono">CPU Core</span>
                        <div className="text-[9px] text-neutral-500 bg-white border border-neutral-200 px-1.5 py-0.5 rounded font-mono">
                          ALU + Control Unit
                        </div>
                      </motion.div>

                      {/* Memory */}
                      <motion.div 
                        onClick={() => setActiveArchNode('ram')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl w-28 cursor-pointer transition-all ${
                          activeArchNode === 'ram' ? 'bg-white border-2 border-pink-500 shadow-md ring-2 ring-pink-500/20 scale-[1.05]' : 'bg-neutral-50 border border-neutral-200 hover:bg-white hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-3xl">💾</span>
                        <span className="text-xs font-bold font-mono">RAM</span>
                      </motion.div>

                      {/* Monitor */}
                      <motion.div 
                        onClick={() => setActiveArchNode('monitor')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl w-28 cursor-pointer transition-all ${
                          activeArchNode === 'monitor' ? 'bg-white border-2 border-pink-500 shadow-md ring-2 ring-pink-500/20 scale-[1.05]' : 'bg-neutral-50 border border-neutral-200 hover:bg-white hover:border-neutral-300'
                        }`}
                      >
                        <span className="text-3xl">🖥️</span>
                        <span className="text-xs font-bold font-mono">Monitor</span>
                      </motion.div>

                      {/* Glowing dot packet travel */}
                      <AnimatePresence>
                        {isAnimating && (
                          <motion.div 
                            initial={{ left: '10%' }}
                            animate={{ left: ['10%', '35%', '65%', '85%', '85%'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-[45%] w-4 h-4 bg-black rounded-full border border-white shadow-sm"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* 6. GENERAL FALLBACK */}
                {['os-basics', 'number-rep'].includes(selectedTopic.id) && (
                  <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    <span className="text-5xl">{selectedTopic.icon}</span>
                    <h4 className="text-2xl font-black">{selectedTopic.title}</h4>
                    <p className="text-neutral-500 max-w-md text-sm">
                      This specialized interactive model is fully configured. Use the tabs on the right side to read notes or take the mini quizzes.
                    </p>
                    <button 
                      onClick={() => setAnimationStep((prev) => prev + 1)}
                      className="px-4 py-2 bg-black text-white font-bold rounded-xl text-xs hover:bg-neutral-800 transition-all"
                    >
                      Cycle Animation Step
                    </button>
                  </div>
                )}

              </div>

              {/* RIGHT PANEL: EXPLANATIONS & TABS */}
              <div className="w-[340px] shrink-0 h-full bg-white border border-neutral-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                
                {/* Tabs selection */}
                <div className="flex border-b border-neutral-200 bg-neutral-50 p-1">
                  {['explanation', 'steps', 'quiz', 'notes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                        activeTab === tab 
                          ? 'bg-white text-black border border-neutral-200 shadow-sm font-black' 
                          : 'text-neutral-400 hover:text-black font-semibold'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab contents */}
                <div className="flex-1 p-4 overflow-hidden flex flex-col justify-between">
                  
                  <div className="space-y-4 flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d4 transparent' }}>
                    
                    {/* ======================== EXPLANATION TAB ======================== */}
                    {activeTab === 'explanation' && (
                      <div className="space-y-4">
                        {/* Topic-specific rich explanation for Number System */}
                        {selectedTopic.id === 'number-system' && NUMBER_SYSTEM_EXPLANATIONS[operation] ? (
                          <>
                            {/* Title & Concept */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                                  <Hash className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                                <h4 className="text-sm font-black text-black tracking-tight">
                                  {NUMBER_SYSTEM_EXPLANATIONS[operation].title}
                                </h4>
                              </div>
                              <p className="text-[11.5px] text-neutral-700 leading-relaxed font-medium">
                                {NUMBER_SYSTEM_EXPLANATIONS[operation].concept}
                              </p>
                            </div>

                            {/* Key Points */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Key Points</span>
                              </div>
                              <ul className="space-y-1.5">
                                {NUMBER_SYSTEM_EXPLANATIONS[operation].keyPoints.map((point, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[11px] text-amber-900 font-medium leading-relaxed">
                                    <span className="text-amber-500 font-black mt-0.5">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Farmer Analogy */}
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3">
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">🌾 Farmer Analogy</span>
                              <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                                {NUMBER_SYSTEM_EXPLANATIONS[operation].realWorld}
                              </p>
                            </div>

                            {/* Formula Box */}
                            <div className="bg-neutral-900 text-white rounded-xl p-3">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">📐 Formula</span>
                              <p className="text-[11px] font-mono font-bold text-emerald-400 leading-relaxed">
                                {NUMBER_SYSTEM_EXPLANATIONS[operation].formula}
                              </p>
                            </div>

                            {/* Conversion Table (only for decimal-binary) */}
                            {NUMBER_SYSTEM_EXPLANATIONS[operation].conversionTable && (
                              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                                <div className="bg-neutral-100 px-3 py-1.5">
                                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Quick Reference Table</span>
                                </div>
                                <table className="w-full text-[10px] font-mono">
                                  <thead>
                                    <tr className="bg-neutral-50 border-b border-neutral-200">
                                      <th className="px-2 py-1.5 text-left font-black text-neutral-500">DEC</th>
                                      <th className="px-2 py-1.5 text-left font-black text-neutral-500">BIN</th>
                                      <th className="px-2 py-1.5 text-left font-black text-neutral-500">OCT</th>
                                      <th className="px-2 py-1.5 text-left font-black text-neutral-500">HEX</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {NUMBER_SYSTEM_EXPLANATIONS[operation].conversionTable.map((row, i) => (
                                      <tr key={i} className={`border-b border-neutral-100 ${parseInt(row.dec) === parseInt(inputValue) ? 'bg-blue-50 font-black' : ''}`}>
                                        <td className="px-2 py-1.5 font-bold">{row.dec}</td>
                                        <td className="px-2 py-1.5 text-blue-600 font-bold">{row.bin}</td>
                                        <td className="px-2 py-1.5 text-purple-600 font-bold">{row.oct}</td>
                                        <td className="px-2 py-1.5 text-emerald-600 font-bold">{row.hex}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Live Animation Feedback */}
                            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">⚡ LIVE ANIMATION FEEDBACK</span>
                              <p className="text-[11px] text-neutral-700 leading-relaxed font-mono font-semibold">
                                {getExplanation()}
                              </p>
                            </div>
                          </>
                        ) : selectedTopic.id === 'memory-org' ? (
                          <>
                            {/* Title & Concept */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-center">
                                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                                </div>
                                <h4 className="text-sm font-black text-black tracking-tight">
                                  {MEMORY_ORG_EXPLANATION.title}
                                </h4>
                              </div>
                              <p className="text-[11.5px] text-neutral-700 leading-relaxed font-medium">
                                {MEMORY_ORG_EXPLANATION.concept}
                              </p>
                            </div>

                            {/* Key Points */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Key Points</span>
                              </div>
                              <ul className="space-y-1.5">
                                {MEMORY_ORG_EXPLANATION.keyPoints.map((point, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[11px] text-indigo-900 font-medium leading-relaxed">
                                    <span className="text-indigo-500 font-black mt-0.5">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Farmer Analogy */}
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3">
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">🌾 Farmer Analogy</span>
                              <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                                {MEMORY_ORG_EXPLANATION.realWorld}
                              </p>
                            </div>

                            {/* Formula Box */}
                            <div className="bg-neutral-900 text-white rounded-xl p-3">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">📐 Principle</span>
                              <p className="text-[11px] font-mono font-bold text-emerald-400 leading-relaxed">
                                {MEMORY_ORG_EXPLANATION.formula}
                              </p>
                            </div>
                            
                            {/* Live Animation Feedback */}
                            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">⚡ LIVE ANIMATION FEEDBACK</span>
                              <p className="text-[11px] text-neutral-700 leading-relaxed font-mono font-semibold">
                                {activeStorageIndex === -1 ? 'Click on a storage layer to interact.' : `Selected layer index: ${activeStorageIndex}. Notice the capacity and speed metrics.`}
                              </p>
                            </div>
                          </>
                        ) : selectedTopic.id === 'computer-arch' ? (
                          <>
                            {/* Title & Concept */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 bg-pink-50 border border-pink-200 rounded-lg flex items-center justify-center">
                                  <Cpu className="w-3.5 h-3.5 text-pink-600" />
                                </div>
                                <h4 className="text-sm font-black text-black tracking-tight">
                                  {COMPUTER_ARCH_EXPLANATION.title}
                                </h4>
                              </div>
                              <p className="text-[11.5px] text-neutral-700 leading-relaxed font-medium">
                                {COMPUTER_ARCH_EXPLANATION.concept}
                              </p>
                            </div>

                            {/* Key Points */}
                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-pink-600" />
                                <span className="text-[10px] font-black text-pink-700 uppercase tracking-widest">Key Points</span>
                              </div>
                              <ul className="space-y-1.5">
                                {COMPUTER_ARCH_EXPLANATION.keyPoints.map((point, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[11px] text-pink-900 font-medium leading-relaxed">
                                    <span className="text-pink-500 font-black mt-0.5">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Farmer Analogy */}
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3">
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">🌾 Farmer Analogy</span>
                              <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                                {COMPUTER_ARCH_EXPLANATION.realWorld}
                              </p>
                            </div>

                            {/* Formula Box */}
                            <div className="bg-neutral-900 text-white rounded-xl p-3">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">📐 Principle</span>
                              <p className="text-[11px] font-mono font-bold text-emerald-400 leading-relaxed">
                                {COMPUTER_ARCH_EXPLANATION.formula}
                              </p>
                            </div>
                            
                            {/* Live Animation Feedback */}
                            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">⚡ LIVE ANIMATION FEEDBACK</span>
                              <p className="text-[11px] text-neutral-700 leading-relaxed font-mono font-semibold">
                                {activeArchNode === 'keyboard' ? '⌨️ Keyboard: Input device sending electrical signals to the CPU/RAM.' :
                                 activeArchNode === 'cpu' ? '⚙️ CPU Core: The brain. Fetches instructions, decodes them, and executes mathematical/logic operations.' :
                                 activeArchNode === 'ram' ? '💾 RAM: Volatile memory storing the actively running program and its data.' :
                                 activeArchNode === 'monitor' ? '🖥️ Monitor: Output device displaying the final rendered frames and text.' :
                                 isAnimating ? "Simulating data travel across the hardware buses..." : "Click a component to learn more, or click Run to simulate bus line data packets."}
                              </p>
                            </div>
                          </>
                        ) : selectedTopic.id === 'os-basics' ? (
                          <>
                            {/* Title & Concept */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center justify-center">
                                  <Layers className="w-3.5 h-3.5 text-cyan-600" />
                                </div>
                                <h4 className="text-sm font-black text-black tracking-tight">
                                  {OS_BASICS_EXPLANATION.title}
                                </h4>
                              </div>
                              <p className="text-[11.5px] text-neutral-700 leading-relaxed font-medium">
                                {OS_BASICS_EXPLANATION.concept}
                              </p>
                            </div>

                            {/* Key Points */}
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-cyan-600" />
                                <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Key Points</span>
                              </div>
                              <ul className="space-y-1.5">
                                {OS_BASICS_EXPLANATION.keyPoints.map((point, i) => (
                                  <li key={i} className="flex items-start gap-2 text-[11px] text-cyan-900 font-medium leading-relaxed">
                                    <span className="text-cyan-500 font-black mt-0.5">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Farmer Analogy */}
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3">
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-1">🌾 Farmer Analogy</span>
                              <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
                                {OS_BASICS_EXPLANATION.realWorld}
                              </p>
                            </div>

                            {/* Formula Box */}
                            <div className="bg-neutral-900 text-white rounded-xl p-3">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">📐 Principle</span>
                              <p className="text-[11px] font-mono font-bold text-emerald-400 leading-relaxed">
                                {OS_BASICS_EXPLANATION.formula}
                              </p>
                            </div>
                          </>
                        ) : (
                          /* Default explanation for non-number-system topics */
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Description</h4>
                            <p className="text-sm text-neutral-800 leading-relaxed font-semibold">
                              {selectedTopic.desc}
                            </p>
                            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">LIVE FEEDBACK</span>
                              <p className="text-xs text-neutral-700 leading-relaxed font-mono font-medium">
                                {getExplanation()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ======================== STEPS TAB ======================== */}
                    {activeTab === 'steps' && (
                      <div className="space-y-3">
                        {selectedTopic.id === 'number-system' ? (
                          <>
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Step-by-Step Breakdown</h4>
                              <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold font-mono">
                                {getNumberSystemSteps().length} steps
                              </span>
                            </div>

                            {/* Operation label */}
                            <div className="bg-white border border-neutral-200 text-black rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-[10px] font-bold font-mono tracking-wider">
                                {NUMBER_SYSTEM_EXPLANATIONS[operation]?.title || 'Conversion Steps'}
                              </span>
                            </div>

                            {/* Dynamic Steps */}
                            <div className="space-y-1.5">
                              {getNumberSystemSteps().map((step, i) => {
                                const isActive = animationStep === i;
                                const isDone = animationStep > i;
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-2.5 rounded-lg border text-[11px] font-mono transition-all duration-300 flex items-start gap-2.5 ${
                                      isActive 
                                        ? 'bg-white text-emerald-900 border-emerald-400 shadow-md scale-[1.02] ring-2 ring-emerald-500/10' 
                                        : isDone 
                                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                                          : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                                    }`}
                                  >
                                    <span className="text-sm flex-shrink-0 mt-0.5">
                                      {isDone ? '✔️' : isActive ? '▶️' : step.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-[9px] font-black uppercase tracking-widest block ${
                                        isActive ? 'text-emerald-500' : isDone ? 'text-emerald-600' : 'text-neutral-300'
                                      }`}>
                                        {step.label}
                                      </span>
                                      <span className="block leading-relaxed font-semibold mt-0.5 break-words">
                                        {step.detail}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>

                            {/* Progress indicator */}
                            <div className="flex items-center gap-2 pt-1">
                              <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                <motion.div 
                                  className="h-full bg-black rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, (animationStep / Math.max(1, getNumberSystemSteps().length - 1)) * 100)}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                              <span className="text-[9px] font-mono font-bold text-neutral-400">
                                {animationStep}/{getNumberSystemSteps().length - 1}
                              </span>
                            </div>
                          </>
                        ) : selectedTopic.id === 'memory-org' ? (
                          <>
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Step-by-Step Breakdown</h4>
                              <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold font-mono">
                                4 levels
                              </span>
                            </div>

                            {/* Operation label */}
                            <div className="bg-white border border-neutral-200 text-black rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                              <Database className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="text-[10px] font-bold font-mono tracking-wider">
                                Access Flow
                              </span>
                            </div>

                            {/* Dynamic Steps */}
                            <div className="space-y-1.5">
                              {[
                                { label: 'CPU Request', detail: 'CPU needs data, checks Cache (L1/L2) first. (~0.5ns)', icon: '👖' },
                                { label: 'Cache Miss', detail: 'Data not in Cache. CPU checks RAM. (~15ns)', icon: '🎒' },
                                { label: 'Page Fault', detail: 'Data not in RAM. OS fetches from SSD/HDD. (~100μs / 5ms)', icon: '🚪' },
                                { label: 'Data Loaded', detail: 'Data moved to RAM, then Cache, then CPU Register.', icon: '✔️' }
                              ].map((step, i) => {
                                const isActive = animationStep === i;
                                const isDone = animationStep > i;
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-2.5 rounded-lg border text-[11px] font-mono transition-all duration-300 flex items-start gap-2.5 ${
                                      isActive 
                                        ? 'bg-white text-indigo-900 border-indigo-400 shadow-md scale-[1.02] ring-2 ring-indigo-500/10' 
                                        : isDone 
                                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800' 
                                          : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                                    }`}
                                  >
                                    <span className="text-sm flex-shrink-0 mt-0.5">
                                      {isDone ? '✔️' : isActive ? '▶️' : step.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-[9px] font-black uppercase tracking-widest block ${
                                        isActive ? 'text-indigo-500' : isDone ? 'text-indigo-600' : 'text-neutral-300'
                                      }`}>
                                        {step.label}
                                      </span>
                                      <span className="block leading-relaxed font-semibold mt-0.5 break-words">
                                        {step.detail}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </>
                        ) : selectedTopic.id === 'computer-arch' ? (
                          <>
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Step-by-Step Breakdown</h4>
                              <span className="text-[9px] bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full font-bold font-mono">
                                4 phases
                              </span>
                            </div>

                            {/* Operation label */}
                            <div className="bg-white border border-neutral-200 text-black rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                              <Cpu className="w-3.5 h-3.5 text-pink-500" />
                              <span className="text-[10px] font-bold font-mono tracking-wider">
                                Fetch-Execute Cycle
                              </span>
                            </div>

                            {/* Dynamic Steps */}
                            <div className="space-y-1.5">
                              {[
                                { label: 'Input Generation', detail: 'User types on Keyboard. Signal sent to RAM.', icon: '⌨️' },
                                { label: 'Fetch Phase', detail: 'Control Unit retrieves instructions/data from RAM.', icon: '⚡' },
                                { label: 'Execute Phase', detail: 'ALU performs processing on the data packet.', icon: '⚙️' },
                                { label: 'Output Phase', detail: 'Result is routed via bus to the Monitor display.', icon: '🖥️' }
                              ].map((step, i) => {
                                const isActive = isAnimating && (Math.floor(animationStep) % 4 === i);
                                const isDone = !isAnimating || (Math.floor(animationStep) % 4 > i);
                                return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`p-2.5 rounded-lg border text-[11px] font-mono transition-all duration-300 flex items-start gap-2.5 ${
                                      isActive 
                                        ? 'bg-white text-pink-900 border-pink-400 shadow-md scale-[1.02] ring-2 ring-pink-500/10' 
                                        : isDone 
                                          ? 'bg-pink-50 border-pink-300 text-pink-800' 
                                          : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                                    }`}
                                  >
                                    <span className="text-sm flex-shrink-0 mt-0.5">
                                      {isDone ? '✔️' : isActive ? '▶️' : step.icon}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-[9px] font-black uppercase tracking-widest block ${
                                        isActive ? 'text-pink-500' : isDone ? 'text-pink-600' : 'text-neutral-300'
                                      }`}>
                                        {step.label}
                                      </span>
                                      <span className="block leading-relaxed font-semibold mt-0.5 break-words">
                                        {step.detail}
                                      </span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          /* Default steps for other topics */
                          <>
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Execution Steps</h4>
                            <div className="space-y-2">
                              <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                                animationStep === 0 ? 'bg-white text-black border-neutral-400 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                              }`}>
                                01. Initialize system variables and clear workspace.
                              </div>
                              <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                                animationStep === 1 ? 'bg-white text-black border-neutral-400 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                              }`}>
                                02. Input parameters validation and logic testing.
                              </div>
                              <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                                animationStep === 2 ? 'bg-white text-black border-neutral-400 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                              }`}>
                                03. Execute mathematical conversion or flowchart decision.
                              </div>
                              <div className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                                animationStep >= 3 ? 'bg-white text-black border-neutral-400 shadow-sm' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                              }`}>
                                04. Format final outputs and render completed elements.
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* ======================== QUIZ TAB ======================== */}
                    {activeTab === 'quiz' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Practice Quiz</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-neutral-100 border border-neutral-200 text-neutral-500 px-2 py-0.5 rounded-full font-mono font-bold">
                              Q{quizIndex + 1}/{getQuizQuestions().length}
                            </span>
                            <span className="text-xs font-bold font-mono text-black flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500" /> {quizScore}
                            </span>
                          </div>
                        </div>

                        {/* Score bar for quizzes */}
                        {(selectedTopic.id === 'number-system' || selectedTopic.id === 'memory-org') && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                style={{ width: `${(quizScore / getQuizQuestions().length) * 100}%` }} 
                              />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-neutral-400">
                              {Math.round((quizScore / getQuizQuestions().length) * 100)}%
                            </span>
                          </div>
                        )}

                        <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl space-y-3">
                          <p className="text-xs font-bold leading-relaxed text-black">
                            {getQuizQuestions()[quizIndex]?.q}
                          </p>
                          <div className="space-y-1.5">
                            {getQuizQuestions()[quizIndex]?.o.map((opt, oIdx) => (
                              <button
                                key={opt}
                                onClick={() => {
                                  if (quizAnswered) return;
                                  setSelectedAnswer(oIdx);
                                  setQuizAnswered(true);
                                  if (oIdx === getQuizQuestions()[quizIndex].a) {
                                    setQuizScore(prev => prev + 1);
                                  }
                                }}
                                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all border flex items-center justify-between ${
                                  quizAnswered
                                    ? oIdx === getQuizQuestions()[quizIndex].a
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                      : selectedAnswer === oIdx
                                        ? 'bg-red-50 border-red-500 text-red-700'
                                        : 'bg-white border-neutral-200 text-neutral-300'
                                    : selectedAnswer === oIdx
                                      ? 'bg-black text-white border-black'
                                      : 'bg-white hover:bg-neutral-100 border-neutral-200 hover:border-black text-black'
                                }`}
                              >
                                <div>
                                  <span className="font-bold mr-2 text-[10px]">{String.fromCharCode(65 + oIdx)}.</span>
                                  {opt}
                                </div>
                                {quizAnswered && oIdx === getQuizQuestions()[quizIndex].a && (
                                  <img src={logoImg} alt="Correct" className="h-4 object-contain" />
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Answer feedback for specific topics */}
                          {quizAnswered && (selectedTopic.id === 'number-system' || selectedTopic.id === 'memory-org') && (
                            <div className={`p-2.5 rounded-lg text-[11px] font-semibold ${
                              selectedAnswer === getQuizQuestions()[quizIndex].a 
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                              {selectedAnswer === getQuizQuestions()[quizIndex].a 
                                ? <div className="flex items-center gap-1.5"><img src={logoImg} alt="Correct" className="h-4 object-contain" /> Correct! Great understanding!</div>
                                : `❌ Not quite. The correct answer is: ${getQuizQuestions()[quizIndex].o[getQuizQuestions()[quizIndex].a]}`
                              }
                            </div>
                          )}

                          {quizAnswered && (
                            <button
                              onClick={() => {
                                setQuizAnswered(false);
                                setSelectedAnswer(null);
                                setQuizIndex((prev) => (prev + 1) % getQuizQuestions().length);
                              }}
                              className="w-full bg-black text-white font-bold text-[10px] py-2 rounded-lg mt-2 transition-all uppercase tracking-wider hover:bg-neutral-800 flex items-center justify-center gap-1.5"
                            >
                              <ArrowRight className="w-3 h-3" />
                              {quizIndex + 1 >= getQuizQuestions().length ? 'Restart Quiz' : 'Next Question'}
                            </button>
                          )}
                        </div>

                        {/* Reset quiz button */}
                        {(selectedTopic.id === 'number-system' || selectedTopic.id === 'memory-org') && (quizIndex > 0 || quizScore > 0) && (
                          <button
                            onClick={() => {
                              setQuizIndex(0);
                              setQuizScore(0);
                              setQuizAnswered(false);
                              setSelectedAnswer(null);
                            }}
                            className="w-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-black font-bold text-[10px] py-2 rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3 h-3" /> Reset Quiz
                          </button>
                        )}
                      </div>
                    )}

                    {/* ======================== NOTES TAB ======================== */}
                    {activeTab === 'notes' && (
                      <div className="space-y-3 h-full flex flex-col">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">My Lab Notes</h4>
                          {selectedTopic.id === 'number-system' && (
                            <button 
                              onClick={() => setUserNotes(NUMBER_SYSTEM_NOTES)}
                              className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold hover:bg-blue-100 transition-all flex items-center gap-1"
                            >
                              <BookOpen className="w-3 h-3" /> Load Study Notes
                            </button>
                          )}
                          {selectedTopic.id === 'memory-org' && (
                            <button 
                              onClick={() => setUserNotes(MEMORY_ORG_NOTES)}
                              className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold hover:bg-indigo-100 transition-all flex items-center gap-1"
                            >
                              <BookOpen className="w-3 h-3" /> Load Study Notes
                            </button>
                          )}
                        </div>

                        {/* Quick formula cards for Number System */}
                        {selectedTopic.id === 'number-system' && (
                          <div className="grid grid-cols-2 gap-1.5">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block">Dec→Bin</span>
                              <span className="text-[10px] font-mono font-bold text-blue-800">÷ 2 method</span>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 text-center">
                              <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest block">Dec→Oct</span>
                              <span className="text-[10px] font-mono font-bold text-purple-800">÷ 8 method</span>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
                              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block">Dec→Hex</span>
                              <span className="text-[10px] font-mono font-bold text-emerald-800">÷ 16 method</span>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
                              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest block">2's Comp</span>
                              <span className="text-[10px] font-mono font-bold text-amber-800">Flip + 1</span>
                            </div>
                          </div>
                        )}

                        <textarea
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          placeholder={selectedTopic.id === 'number-system' || selectedTopic.id === 'memory-org'
                            ? 'Click "Load Study Notes" above to fill with comprehensive notes, or type your own notes here...' 
                            : 'Type your study notes here for reference...'}
                          className="flex-1 w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-[11px] text-black focus:outline-none focus:border-black font-mono resize-none transition-all" 
                          style={{ minHeight: '200px' }}
                        />

                        {/* Notes action bar */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[9px] text-neutral-400 font-mono">
                            {userNotes.length} characters
                          </span>
                          <button 
                            onClick={() => setUserNotes('')}
                            className="text-[9px] text-neutral-400 hover:text-red-500 font-bold transition-colors"
                          >
                            Clear notes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Tutor Chat overlay */}
                  {mode === 'ai-tutor' && (
                    <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xl mt-3 flex flex-col space-y-2 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">🤖</span>
                        <span className="text-[10px] font-bold text-black uppercase tracking-wider">AI Tutor Assistant</span>
                      </div>
                      <p className="text-[10.5px] text-neutral-600 leading-relaxed font-semibold">
                        "Notice how dividing by 2 repeatedly checks if the remainder is 1. That's why the baskets fill up systematically!"
                      </p>
                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

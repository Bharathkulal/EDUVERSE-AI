import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalBackButton from '../components/GlobalBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ChevronRight, Zap, Info, ShieldAlert,
  Play, Pause, RotateCcw, SkipBack, SkipForward,
  Trophy, Heart, Timer, Award, CheckCircle2, AlertCircle, RefreshCw,
  LayoutGrid, Disc, Sliders, Activity, HelpCircle, Code2, Database,
  ArrowRight, ShieldCheck, Flame, Star, Lock, PlayCircle, Eye
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggleButton from '../components/ThemeToggleButton';
import '../pages/DashboardTheme.css';

// ═══════════════════════════════════════════════════════════
// ALGORITHMS DEFINITIONS (CODE & COMPLEXITIES)
// ═══════════════════════════════════════════════════════════
const ALGORITHMS = {
  linear: {
    name: 'Linear Search',
    best: 'O(1)',
    avg: 'O(N)',
    worst: 'O(N)',
    space: 'O(1)',
    desc: 'Linear Search sequentially checks each element in the array from start to end until a match is found or the search range is exhausted.',
    code: {
      c: [
        { text: 'int linearSearch(int arr[], int n, int target) {', line: 1 },
        { text: '    for (int i = 0; i < n; i++) {', line: 2 },
        { text: '        if (arr[i] == target)', line: 3 },
        { text: '            return i; // Found', line: 4 },
        { text: '    }', line: 5 },
        { text: '    return -1; // Not Found', line: 6 },
        { text: '}', line: 7 }
      ],
      cpp: [
        { text: 'int linearSearch(vector<int>& arr, int target) {', line: 1 },
        { text: '    for (int i = 0; i < arr.size(); i++) {', line: 2 },
        { text: '        if (arr[i] == target) return i;', line: 3 },
        { text: '    }', line: 4 },
        { text: '    return -1;', line: 5 },
        { text: '}', line: 6 }
      ],
      java: [
        { text: 'public int linearSearch(int[] arr, int target) {', line: 1 },
        { text: '    for (int i = 0; i < arr.length; i++) {', line: 2 },
        { text: '        if (arr[i] == target) {', line: 3 },
        { text: '            return i;', line: 4 },
        { text: '        }', line: 5 },
        { text: '    }', line: 6 },
        { text: '    return -1;', line: 7 },
        { text: '}', line: 8 }
      ],
      python: [
        { text: 'def linear_search(arr, target):', line: 1 },
        { text: '    for i in range(len(arr)):', line: 2 },
        { text: '        if arr[i] == target:', line: 3 },
        { text: '            return i', line: 4 },
        { text: '    return -1', line: 5 }
      ],
      csharp: [
        { text: 'public int LinearSearch(int[] arr, int target) {', line: 1 },
        { text: '    for (int i = 0; i < arr.Length; i++) {', line: 2 },
        { text: '        if (arr[i] == target) return i;', line: 3 },
        { text: '    }', line: 4 },
        { text: '    return -1;', line: 5 },
        { text: '}', line: 6 }
      ]
    }
  },
  binary: {
    name: 'Binary Search',
    best: 'O(1)',
    avg: 'O(log N)',
    worst: 'O(log N)',
    space: 'O(1)',
    desc: 'Binary Search divides the sorted search space in half. It compares the middle element to the target and discards the half where the target cannot exist.',
    code: {
      c: [
        { text: 'int binarySearch(int arr[], int n, int target) {', line: 1 },
        { text: '    int left = 0, right = n - 1;', line: 2 },
        { text: '    while (left <= right) {', line: 3 },
        { text: '        int mid = left + (right - left) / 2;', line: 4 },
        { text: '        if (arr[mid] == target) return mid;', line: 5 },
        { text: '        if (arr[mid] < target) left = mid + 1;', line: 6 },
        { text: '        else right = mid - 1;', line: 7 },
        { text: '    }', line: 8 },
        { text: '    return -1;', line: 9 },
        { text: '}', line: 10 }
      ],
      cpp: [
        { text: 'int binarySearch(vector<int>& arr, int target) {', line: 1 },
        { text: '    int left = 0, right = arr.size() - 1;', line: 2 },
        { text: '    while (left <= right) {', line: 3 },
        { text: '        int mid = left + (right - left) / 2;', line: 4 },
        { text: '        if (arr[mid] == target) return mid;', line: 5 },
        { text: '        if (arr[mid] < target) left = mid + 1;', line: 6 },
        { text: '        else right = mid - 1;', line: 7 },
        { text: '    }', line: 8 },
        { text: '    return -1;', line: 9 },
        { text: '}', line: 10 }
      ],
      java: [
        { text: 'public int binarySearch(int[] arr, int target) {', line: 1 },
        { text: '    int left = 0, right = arr.length - 1;', line: 2 },
        { text: '    while (left <= right) {', line: 3 },
        { text: '        int mid = left + (right - left) / 2;', line: 4 },
        { text: '        if (arr[mid] == target) return mid;', line: 5 },
        { text: '        if (arr[mid] < target) left = mid + 1;', line: 6 },
        { text: '        else right = mid - 1;', line: 7 },
        { text: '    }', line: 8 },
        { text: '    return -1;', line: 9 },
        { text: '}', line: 10 }
      ],
      python: [
        { text: 'def binary_search(arr, target):', line: 1 },
        { text: '    left, right = 0, len(arr) - 1', line: 2 },
        { text: '    while left <= right:', line: 3 },
        { text: '        mid = (left + right) // 2', line: 4 },
        { text: '        if arr[mid] == target: return mid', line: 5 },
        { text: '        elif arr[mid] < target: left = mid + 1', line: 6 },
        { text: '        else: right = mid - 1', line: 7 },
        { text: '    return -1', line: 8 }
      ],
      csharp: [
        { text: 'public int BinarySearch(int[] arr, int target) {', line: 1 },
        { text: '    int left = 0, right = arr.Length - 1;', line: 2 },
        { text: '    while (left <= right) {', line: 3 },
        { text: '        int mid = left + (right - left) / 2;', line: 4 },
        { text: '        if (arr[mid] == target) return mid;', line: 5 },
        { text: '        if (arr[mid] < target) left = mid + 1;', line: 6 },
        { text: '        else right = mid - 1;', line: 7 },
        { text: '    }', line: 8 },
        { text: '    return -1;', line: 9 },
        { text: '}', line: 10 }
      ]
    }
  },
  ternary: {
    name: 'Ternary Search',
    best: 'O(1)',
    avg: 'O(log₃ N)',
    worst: 'O(log₃ N)',
    space: 'O(1)',
    desc: 'Ternary Search splits the sorted search space into three parts using two midpoints. It discards one-third sections based on key comparisons.',
    code: {
      c: [
        { text: 'int ternarySearch(int arr[], int n, int target) {', line: 1 },
        { text: '    int left = 0, right = n - 1;', line: 2 },
        { text: '    while (left <= right) {', line: 3 },
        { text: '        int mid1 = left + (right - left) / 3;', line: 4 },
        { text: '        int mid2 = right - (right - left) / 3;', line: 5 },
        { text: '        if (arr[mid1] == target) return mid1;', line: 6 },
        { text: '        if (arr[mid2] == target) return mid2;', line: 7 },
        { text: '        if (target < arr[mid1]) right = mid1 - 1;', line: 8 },
        { text: '        else if (target > arr[mid2]) left = mid2 + 1;', line: 9 },
        { text: '        else { left = mid1 + 1; right = mid2 - 1; }', line: 10 },
        { text: '    }', line: 11 },
        { text: '    return -1;', line: 12 },
        { text: '}', line: 13 }
      ],
      cpp: [
        { text: 'int ternarySearch(vector<int>& arr, int target) {', line: 1 },
        { text: '    int left = 0, right = arr.size() - 1;', line: 2 },
        { text: '    while (left <= right) {', line: 3 },
        { text: '        int mid1 = left + (right - left) / 3;', line: 4 },
        { text: '        int mid2 = right - (right - left) / 3;', line: 5 },
        { text: '        if (arr[mid1] == target) return mid1;', line: 6 },
        { text: '        if (arr[mid2] == target) return mid2;', line: 7 },
        { text: '        if (target < arr[mid1]) right = mid1 - 1;', line: 8 },
        { text: '        else if (target > arr[mid2]) left = mid2 + 1;', line: 9 },
        { text: '        else { left = mid1 + 1; right = mid2 - 1; }', line: 10 },
        { text: '    }', line: 11 },
        { text: '    return -1;', line: 12 },
        { text: '}', line: 13 }
      ],
      java: [
        { text: 'public int ternarySearch(int[] arr, int target) {', line: 1 },
        { text: '    int left = 0, right = arr.length - 1;', line: 2 },
        { text: '    while (left <= right) {', line: 3 },
        { text: '        int mid1 = left + (right - left) / 3;', line: 4 },
        { text: '        int mid2 = right - (right - left) / 3;', line: 5 },
        { text: '        if (arr[mid1] == target) return mid1;', line: 6 },
        { text: '        if (arr[mid2] == target) return mid2;', line: 7 },
        { text: '        if (target < arr[mid1]) right = mid1 - 1;', line: 8 },
        { text: '        else if (target > arr[mid2]) left = mid2 + 1;', line: 9 },
        { text: '        else { left = mid1 + 1; right = mid2 - 1; }', line: 10 },
        { text: '    }', line: 11 },
        { text: '    return -1;', line: 12 },
        { text: '}', line: 13 }
      ],
      python: [
        { text: 'def ternary_search(arr, target):', line: 1 },
        { text: '    l, r = 0, len(arr) - 1', line: 2 },
        { text: '    while l <= r:', line: 3 },
        { text: '        mid1 = l + (r - l) // 3', line: 4 },
        { text: '        mid2 = r - (r - l) // 3', line: 5 },
        { text: '        if arr[mid1] == target: return mid1', line: 6 },
        { text: '        if arr[mid2] == target: return mid2', line: 7 },
        { text: '        if target < arr[mid1]: r = mid1 - 1', line: 8 },
        { text: '        elif target > arr[mid2]: l = mid2 + 1', line: 9 },
        { text: '        else: l, r = mid1 + 1, mid2 - 1', line: 10 },
        { text: '    return -1', line: 11 }
      ],
      csharp: [
        { text: 'public int TernarySearch(int[] arr, int target) {', line: 1 },
        { text: '    int left = 0, right = arr.Length - 1;', line: 2 },
        { text: '    while (left <= right) {', line: 3 },
        { text: '        int mid1 = left + (right - left) / 3;', line: 4 },
        { text: '        int mid2 = right - (right - left) / 3;', line: 5 },
        { text: '        if (arr[mid1] == target) return mid1;', line: 6 },
        { text: '        if (arr[mid2] == target) return mid2;', line: 7 },
        { text: '        if (target < arr[mid1]) right = mid1 - 1;', line: 8 },
        { text: '        else if (target > arr[mid2]) left = mid2 + 1;', line: 9 },
        { text: '        else { left = mid1 + 1; right = mid2 - 1; }', line: 10 },
        { text: '    }', line: 11 },
        { text: '    return -1;', line: 12 },
        { text: '}', line: 13 }
      ]
    }
  }
};

const CODE_LANGUAGES = [
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
  { id: 'csharp', label: 'C#' }
];

export default function SearchingVisualization() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Rotate / Gaming Mode Layout state
  const [isGameRotated, setIsGameRotated] = useState(localStorage.getItem('dsa_game_mode') === 'true');

  // Core Simulation Configuration
  const [algorithm, setAlgorithm] = useState('binary');
  const [arraySize, setArraySize] = useState(8);
  const [speed, setSpeed] = useState(1);
  const [viewMode, setViewMode] = useState('bars'); // 'bars' | 'blocks'
  const [mode, setMode] = useState('Learn'); // 'Learn' | 'Practice' | 'Challenge'
  const [codeLang, setCodeLang] = useState('c');
  const [manualInput, setManualInput] = useState('5, 12, 18, 24, 30, 41, 55, 67');
  const [targetVal, setTargetVal] = useState(41);

  // Simulation State
  const [array, setArray] = useState([]);
  const [history, setHistory] = useState([]);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimer = useRef(null);

  // Performance/live stats
  const [stats, setStats] = useState({
    comparisons: 0,
    visited: 0,
    movements: 0,
    elapsedTime: 0,
    startTime: null
  });

  // Custom Cinematic Phases
  const [isIntroOpen, setIsIntroOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');
  const [confettiActive, setConfettiActive] = useState(false);

  // Initialize
  useEffect(() => {
    handleSetManualArray();
  }, [algorithm]);

  // Live Timer
  useEffect(() => {
    let timer = null;
    if (isPlaying && currentStepIndex < steps.length - 1) {
      timer = setInterval(() => {
        setStats(prev => ({
          ...prev,
          elapsedTime: prev.startTime ? Math.floor((Date.now() - prev.startTime) / 1000) : 0
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex]);

  // Drop fall-in sequential array creation
  const dropBarsSequentially = async (valuesArray) => {
    setIsGenerating(true);
    setGenerationPhase('Creating array items sequentially...');
    setArray([]);
    setSteps([]);
    setCurrentStepIndex(-1);
    setStats({ comparisons: 0, visited: 0, movements: 0, elapsedTime: 0, startTime: null });
    setConfettiActive(false);

    // Keep array sorted for searching models
    const sortedVals = [...valuesArray].sort((a, b) => a - b);

    const generated = [];
    for (let i = 0; i < sortedVals.length; i++) {
      await new Promise(r => setTimeout(r, 180));
      const item = { value: sortedVals[i], id: `search-bar-${i}-${sortedVals[i]}-${Math.random()}` };
      generated.push(item);
      setArray([...generated]);
    }

    await new Promise(r => setTimeout(r, 200));
    setGenerationPhase('Array Generated Successfully!');
    await new Promise(r => setTimeout(r, 600));
    setIsGenerating(false);

    buildSearchingSteps(generated);
  };

  const handleSetManualArray = async () => {
    if (!manualInput.trim()) return;
    setIsPlaying(false);
    if (playTimer.current) clearTimeout(playTimer.current);

    const parsed = manualInput.split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(n => !isNaN(n));

    if (parsed.length > 0) {
      await dropBarsSequentially(parsed);
    }
  };

  const generateArrayFromPreset = async (presetType) => {
    setIsPlaying(false);
    if (playTimer.current) clearTimeout(playTimer.current);

    let rawValues = [];
    const size = Math.min(Math.max(arraySize, 5), 15);
    if (presetType === 'random') {
      rawValues = Array.from({ length: size }, () => Math.floor(Math.random() * 80) + 10);
    } else if (presetType === 'nearly') {
      rawValues = Array.from({ length: size }, (_, i) => Math.floor((i / size) * 80) + 10);
    } else if (presetType === 'reverse') {
      rawValues = Array.from({ length: size }, (_, i) => Math.floor(((size - i) / size) * 80) + 10);
    } else if (presetType === 'duplicate') {
      const pool = [15, 30, 45, 60];
      rawValues = Array.from({ length: size }, (_, i) => pool[i % pool.length]);
    }

    await dropBarsSequentially(rawValues);
  };

  // ═══════════════════════════════════════════════════════════
  // OPERATION GENERATOR STEPS
  // ═══════════════════════════════════════════════════════════
  const buildSearchingSteps = (rawArrayObjects) => {
    const list = [...rawArrayObjects];
    const generatedSteps = [];
    const target = parseInt(targetVal, 10);

    // Initial step
    generatedSteps.push({
      array: list.map(item => ({ ...item, state: 'normal' })),
      pointers: {},
      compared: [],
      line: 1,
      action: 'Initial State',
      explanation: `Interactive searching loaded. Target is set to ${target}. Click Start to scan.`,
      variables: { target }
    });

    if (algorithm === 'linear') {
      let found = false;
      for (let i = 0; i < list.length; i++) {
        // Checking step
        generatedSteps.push({
          array: list.map((item, idx) => ({
            ...item,
            state: idx === i ? 'checking' : idx < i ? 'discarded' : 'normal'
          })),
          pointers: { current: i },
          compared: [i],
          line: 3,
          action: 'Comparing',
          explanation: `Checking element at index ${i} (${list[i].value}). Does it match target ${target}?`,
          variables: { target, i }
        });

        if (list[i].value === target) {
          found = true;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: idx === i ? 'found' : idx < i ? 'discarded' : 'normal'
            })),
            pointers: { current: i },
            compared: [],
            line: 4,
            action: 'Found',
            explanation: `Target ${target} found at index ${i}!`,
            variables: { target, i }
          });
          break;
        }
      }

      if (!found) {
        generatedSteps.push({
          array: list.map(item => ({ ...item, state: 'discarded' })),
          pointers: {},
          compared: [],
          line: 6,
          action: 'Not Found',
          explanation: `Target ${target} was not found in the array.`,
          variables: { target }
        });
      }
    } else if (algorithm === 'binary') {
      let left = 0;
      let right = list.length - 1;
      let found = false;

      while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);

        // Display check range
        generatedSteps.push({
          array: list.map((item, idx) => ({
            ...item,
            state: (idx >= left && idx <= right) ? 'normal' : 'discarded'
          })),
          pointers: { left, right, mid },
          compared: [],
          line: 3,
          action: 'Split Range',
          explanation: `Narrowed search space to index boundaries [${left} to ${right}]. Recalculating middle index to ${mid}.`,
          variables: { target, left, right, mid }
        });

        // Compare step
        generatedSteps.push({
          array: list.map((item, idx) => ({
            ...item,
            state: idx === mid ? 'checking' : (idx >= left && idx <= right) ? 'normal' : 'discarded'
          })),
          pointers: { left, right, mid },
          compared: [mid],
          line: 5,
          action: 'Comparing',
          explanation: `Comparing middle element at index ${mid} (${list[mid].value}) with target ${target}.`,
          variables: { target, left, right, mid }
        });

        if (list[mid].value === target) {
          found = true;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: idx === mid ? 'found' : 'discarded'
            })),
            pointers: { mid },
            compared: [],
            line: 5,
            action: 'Found',
            explanation: `Match found! Target ${target} is at middle index ${mid}.`,
            variables: { target, left, right, mid }
          });
          break;
        }

        if (list[mid].value < target) {
          left = mid + 1;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: (idx >= left && idx <= right) ? 'normal' : 'discarded'
            })),
            pointers: { left, right },
            compared: [],
            line: 6,
            action: 'Discard Left',
            explanation: `Since middle element ${list[mid].value} is smaller than target ${target}, ignore left half.`,
            variables: { target, left, right, mid }
          });
        } else {
          right = mid - 1;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: (idx >= left && idx <= right) ? 'normal' : 'discarded'
            })),
            pointers: { left, right },
            compared: [],
            line: 7,
            action: 'Discard Right',
            explanation: `Since middle element ${list[mid].value} is larger than target ${target}, ignore right half.`,
            variables: { target, left, right, mid }
          });
        }
      }

      if (!found) {
        generatedSteps.push({
          array: list.map(item => ({ ...item, state: 'discarded' })),
          pointers: {},
          compared: [],
          line: 9,
          action: 'Not Found',
          explanation: `Target ${target} was not found in binary search boundaries.`,
          variables: { target }
        });
      }
    } else if (algorithm === 'ternary') {
      let left = 0;
      let right = list.length - 1;
      let found = false;

      while (left <= right) {
        const mid1 = Math.floor(left + (right - left) / 3);
        const mid2 = Math.floor(right - (right - left) / 3);

        generatedSteps.push({
          array: list.map((item, idx) => ({
            ...item,
            state: (idx >= left && idx <= right) ? 'normal' : 'discarded'
          })),
          pointers: { left, right, mid1, mid2 },
          compared: [],
          line: 3,
          action: 'Split Range',
          explanation: `Dividing sorted space into three sections at midpoint boundaries index ${mid1} and ${mid2}.`,
          variables: { target, left, right, mid1, mid2 }
        });

        // Check mid1
        generatedSteps.push({
          array: list.map((item, idx) => ({
            ...item,
            state: idx === mid1 ? 'checking' : (idx >= left && idx <= right) ? 'normal' : 'discarded'
          })),
          pointers: { left, right, mid1, mid2 },
          compared: [mid1],
          line: 6,
          action: 'Comparing Mid1',
          explanation: `Comparing target ${target} with element at first midpoint ${list[mid1].value}.`,
          variables: { target, left, right, mid1, mid2 }
        });

        if (list[mid1].value === target) {
          found = true;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: idx === mid1 ? 'found' : 'discarded'
            })),
            pointers: { mid1 },
            compared: [],
            line: 6,
            action: 'Found',
            explanation: `Target ${target} found at first midpoint index ${mid1}!`,
            variables: { target, left, right, mid1, mid2 }
          });
          break;
        }

        // Check mid2
        generatedSteps.push({
          array: list.map((item, idx) => ({
            ...item,
            state: idx === mid2 ? 'checking' : (idx >= left && idx <= right) ? 'normal' : 'discarded'
          })),
          pointers: { left, right, mid1, mid2 },
          compared: [mid2],
          line: 7,
          action: 'Comparing Mid2',
          explanation: `Comparing target ${target} with element at second midpoint ${list[mid2].value}.`,
          variables: { target, left, right, mid1, mid2 }
        });

        if (list[mid2].value === target) {
          found = true;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: idx === mid2 ? 'found' : 'discarded'
            })),
            pointers: { mid2 },
            compared: [],
            line: 7,
            action: 'Found',
            explanation: `Target ${target} found at second midpoint index ${mid2}!`,
            variables: { target, left, right, mid1, mid2 }
          });
          break;
        }

        if (target < list[mid1].value) {
          right = mid1 - 1;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: (idx >= left && idx <= right) ? 'normal' : 'discarded'
            })),
            pointers: { left, right },
            compared: [],
            line: 8,
            action: 'Discard Right 2/3',
            explanation: `Target ${target} is smaller than first midpoint ${list[mid1].value}. Discarding upper two-thirds.`,
            variables: { target, left, right }
          });
        } else if (target > list[mid2].value) {
          left = mid2 + 1;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: (idx >= left && idx <= right) ? 'normal' : 'discarded'
            })),
            pointers: { left, right },
            compared: [],
            line: 9,
            action: 'Discard Left 2/3',
            explanation: `Target ${target} is larger than second midpoint ${list[mid2].value}. Discarding lower two-thirds.`,
            variables: { target, left, right }
          });
        } else {
          left = mid1 + 1;
          right = mid2 - 1;
          generatedSteps.push({
            array: list.map((item, idx) => ({
              ...item,
              state: (idx >= left && idx <= right) ? 'normal' : 'discarded'
            })),
            pointers: { left, right },
            compared: [],
            line: 10,
            action: 'Keep Middle 1/3',
            explanation: `Target is between midpoints [${list[mid1].value} and ${list[mid2].value}]. Narrowing search range to middle section.`,
            variables: { target, left, right }
          });
        }
      }

      if (!found) {
        generatedSteps.push({
          array: list.map(item => ({ ...item, state: 'discarded' })),
          pointers: {},
          compared: [],
          line: 12,
          action: 'Not Found',
          explanation: `Target ${target} was not found in the search range.`,
          variables: { target }
        });
      }
    }

    setSteps(generatedSteps);
    setCurrentStepIndex(0);
    setArray(list.map(item => ({ ...item, state: 'normal' })));
  };

  const triggerStep = (index, autoPlay = false) => {
    if (index < 0 || index >= steps.length) {
      setIsPlaying(false);
      if (index >= steps.length && steps.length > 0) {
        setConfettiActive(true);
      }
      return;
    }

    setCurrentStepIndex(index);
    const step = steps[index];

    // Compute stats
    let cmpCount = 0;
    let visCount = 0;
    for (let k = 0; k <= index; k++) {
      if (steps[k].action.startsWith('Comparing')) cmpCount++;
      if (steps[k].compared.length > 0) visCount += steps[k].compared.length;
    }
    setStats(prev => ({
      ...prev,
      comparisons: cmpCount,
      visited: visCount,
      movements: index
    }));

    if (step.action && step.action !== 'Initial State') {
      setHistory(prev => [`${step.action}: ${step.explanation}`, ...prev].slice(0, 4));
    }

    setArray(step.array);

    if (autoPlay && isPlaying) {
      const stepDuration = 1600 / speed;
      playTimer.current = setTimeout(() => {
        triggerStep(index + 1, true);
      }, stepDuration);
    }
  };

  const handleStartPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playTimer.current) clearTimeout(playTimer.current);
    } else {
      setIsPlaying(true);
      setStats(prev => ({
        ...prev,
        startTime: prev.startTime || Date.now()
      }));
      triggerStep(currentStepIndex + 1, true);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (playTimer.current) clearTimeout(playTimer.current);
    if (currentStepIndex < steps.length - 1) {
      triggerStep(currentStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (playTimer.current) clearTimeout(playTimer.current);
    if (currentStepIndex > 0) {
      triggerStep(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (playTimer.current) clearTimeout(playTimer.current);
    triggerStep(0);
    setHistory([]);
    setStats({ comparisons: 0, visited: 0, movements: 0, elapsedTime: 0, startTime: null });
    setConfettiActive(false);
  };

  // Color mapping
  const getBarColorAndOverlay = (index) => {
    const item = array[index] || { state: 'normal' };
    
    if (item.state === 'found') {
      return {
        background: 'linear-gradient(to top, #10B981, #34D399)',
        shadow: '0 0 20px rgba(16, 185, 129, 0.6)',
        label: 'Found'
      };
    }

    if (item.state === 'checking') {
      return {
        background: 'linear-gradient(to top, #3B82F6, #60A5FA)',
        shadow: '0 0 25px rgba(59, 130, 246, 0.8)',
        label: 'Checking'
      };
    }

    if (item.state === 'discarded') {
      return {
        background: 'linear-gradient(to top, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
        shadow: 'none',
        label: 'Ignored',
        opacity: 0.25
      };
    }

    return {
      background: 'linear-gradient(to top, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
      shadow: 'none',
      label: null
    };
  };

  const activeStep = steps[currentStepIndex] || {
    pointers: {},
    compared: [],
    line: 0,
    action: 'Ready',
    explanation: 'Interactive searching simulator. Press Play to start.',
    variables: {}
  };

  return (
    <div className={`w-full flex flex-col font-sans db-page-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'} ${isGameRotated ? 'rotate-landscape-mode' : 'min-h-screen lg:h-screen lg:overflow-hidden'} relative`} style={{ backgroundColor: 'var(--db-bg)', color: 'var(--db-text-main)' }}>
      
      {/* Dynamic CSS styles override block */}
      <style>{`
        .indicator-label-capsule {
          color: #ffffff !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          background-color: #0b0f19 !important;
          border: 1px solid #3b82f6 !important;
          padding: 3px 8px !important;
          border-radius: 6px !important;
          z-index: 50 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
          display: inline-block !important;
          text-transform: uppercase !important;
        }
      `}</style>

      {/* Confetti Particle celebration */}
      {confettiActive && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 45 }).map((_, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 1, x: '50vw', y: '50vh', scale: Math.random() * 0.6 + 0.4 }}
              animate={{ 
                x: `${Math.random() * 100}vw`, 
                y: `${Math.random() * 100}vh`, 
                opacity: 0,
                rotate: Math.random() * 360 
              }}
              transition={{ duration: 2.2, ease: "easeOut" }}
              className="absolute w-4 h-4 rounded"
              style={{ 
                backgroundColor: ['#3B82F6', '#10B981', '#EC4899', '#EAB308', '#8B5CF6'][i % 5] 
              }}
            />
          ))}
        </div>
      )}

      {/* HEADER BREADCRUMB */}
      <header className="h-16 shrink-0 bg-[var(--db-card-bg)] border-b border-[var(--db-header-border)] flex items-center justify-between px-4 lg:px-8 shadow-sm relative z-10">
        <div className="flex items-center overflow-hidden">
          <GlobalBackButton className="mr-2 lg:mr-4" />
          <div className="flex items-center text-xs lg:text-sm font-medium text-[var(--db-text-muted)] gap-1.5 lg:gap-2 truncate">
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/dashboard')}>Home</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects')}>Subjects</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
            <span className="hover:text-[var(--db-text-main)] cursor-pointer" onClick={() => navigate('/subjects/dsa-lab')}>DSA Practical Lab</span> <ChevronRight className="w-3 h-3 lg:w-4 h-4 shrink-0" />
            <span className="text-blue-500 font-bold">Searching Visualizer</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Game Rotate Mode Button */}
          <button 
            onClick={() => {
              const nextVal = !isGameRotated;
              setIsGameRotated(nextVal);
              localStorage.setItem('dsa_game_mode', nextVal ? 'true' : 'false');
            }}
            className="px-2.5 py-1.5 lg:px-3.5 lg:py-1.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl text-[10px] lg:text-xs font-black shadow flex items-center gap-1 cursor-pointer"
          >
            <span>🎮 Game Mode</span>
          </button>
          
          <button 
            onClick={() => setIsIntroOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-4 h-4" /> Intro Guide
          </button>
          <ThemeToggleButton />
        </div>
      </header>

      {/* INTRODUCTION CARD OVERLAY */}
      <AnimatePresence>
        {isIntroOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-[32px] p-8 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-500">Algorithm Introduction</span>
                  <h2 className="text-3xl font-black text-[var(--db-text-main)] mt-1">{ALGORITHMS[algorithm].name}</h2>
                </div>
                <div className="bg-blue-600/10 text-blue-400 p-2.5 rounded-2xl border border-blue-500/20">
                  <Activity className="w-6 h-6" />
                </div>
              </div>

              <p className="text-sm text-[var(--db-text-secondary)] leading-relaxed mb-6">
                {ALGORITHMS[algorithm].desc}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[var(--db-card-bg-elevated)] p-4 rounded-2xl border border-[var(--db-card-border)]">
                  <span className="block text-[10px] uppercase font-bold text-[var(--db-text-muted)]">Time Complexity</span>
                  <div className="text-xs font-bold mt-1 text-[var(--db-text-secondary)]">
                    <div>Best: <span className="text-emerald-400 font-mono">{ALGORITHMS[algorithm].best}</span></div>
                    <div>Average: <span className="text-yellow-400 font-mono">{ALGORITHMS[algorithm].avg}</span></div>
                    <div>Worst: <span className="text-red-400 font-mono">{ALGORITHMS[algorithm].worst}</span></div>
                  </div>
                </div>

                <div className="bg-[var(--db-card-bg-elevated)] p-4 rounded-2xl border border-[var(--db-card-border)]">
                  <span className="block text-[10px] uppercase font-bold text-[var(--db-text-muted)]">Space Complexity</span>
                  <div className="text-xs font-bold mt-1 text-[var(--db-text-secondary)]">
                    <div>Space: <span className="text-blue-400 font-mono">{ALGORITHMS[algorithm].space}</span></div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsIntroOpen(false)}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/20 transition active:scale-[0.98]"
              >
                Let's Start Searching
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className={`flex-1 p-4 lg:p-5 gap-5 flex max-w-[1920px] mx-auto w-full ${
        isGameRotated 
          ? 'flex-row h-[calc(100vw-64px)] overflow-hidden' 
          : 'flex-col lg:flex-row h-auto lg:h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden'
      }`}>
        
        {/* LEFT PANEL */}
        <div className={`bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg p-5 flex flex-col justify-between shrink-0 gap-5 overflow-y-auto ${
          isGameRotated ? 'w-1/4 min-w-[260px] h-full' : 'w-full lg:w-1/4 lg:min-w-[300px]'
        }`}>
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black text-[var(--db-text-main)] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-500" /> Control Panel
              </h2>
              <p className="text-[var(--db-text-muted)] text-xs mt-0.5">Define target value and trace pointers.</p>
            </div>

            {/* Algorithm selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[var(--db-text-muted)] font-black">Search Algorithm</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(ALGORITHMS).map((key) => (
                  <button 
                    key={key}
                    onClick={() => {
                      setAlgorithm(key);
                      setIsPlaying(false);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-[11px] font-black transition-all ${
                      algorithm === key 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20' 
                        : 'bg-[var(--db-card-bg-elevated)] text-[var(--db-text-secondary)] border-[var(--db-card-border)] hover:border-blue-500/50'
                    }`}
                  >
                    {ALGORITHMS[key].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Value Input */}
            <div className="space-y-1.5 bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
              <label className="text-[10px] uppercase tracking-widest text-[var(--db-text-muted)] font-black block">Search Target</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={targetVal}
                  onChange={(e) => setTargetVal(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-1.5 bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500 text-[var(--db-text-main)]"
                />
                <button 
                  onClick={handleSetManualArray}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black transition"
                >
                  Apply Target
                </button>
              </div>
            </div>

            {/* Input presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-[var(--db-text-muted)] font-black">Input Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'random', label: '🎲 Random' },
                  { id: 'nearly', label: '📊 Sorted Range' },
                  { id: 'reverse', label: '🔄 Reverse' },
                  { id: 'duplicate', label: '👥 Duplicates' }
                ].map(preset => (
                  <button 
                    key={preset.id}
                    onClick={() => generateArrayFromPreset(preset.id)}
                    className="py-1.5 px-2 bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] hover:border-blue-400 hover:text-blue-400 rounded-lg text-[10px] font-bold text-[var(--db-text-secondary)] transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual input */}
            <div className="space-y-1.5 bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
              <label className="text-[10px] uppercase tracking-widest text-[var(--db-text-muted)] font-black block">Manual Array Input</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="e.g., 5, 12, 18, 24, 30"
                  className="flex-1 px-3 py-1.5 bg-[var(--db-card-bg)] border border-[var(--db-card-border)] rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500 text-[var(--db-text-main)]"
                />
                <button 
                  onClick={handleSetManualArray}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black transition"
                >
                  Set
                </button>
              </div>
            </div>

            {/* Array Size Slider */}
            <div className="space-y-1.5 bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
              <div className="flex justify-between text-[10px] font-black text-[var(--db-text-secondary)] uppercase">
                <span>Array Size</span>
                <span className="font-mono text-blue-400">{arraySize} elements</span>
              </div>
              <input 
                type="range" 
                min={5} 
                max={15} 
                value={arraySize}
                onChange={(e) => setArraySize(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-ew-resize bg-[var(--db-card-bg)] rounded-lg appearance-none h-1.5"
              />
            </div>

            {/* Speed selection */}
            <div className="space-y-1.5 bg-[var(--db-card-bg-elevated)] p-3 rounded-xl border border-[var(--db-card-border)]">
              <div className="flex justify-between text-[10px] font-black text-[var(--db-text-secondary)] uppercase">
                <span>Animation Speed</span>
                <span className="font-mono text-blue-400">{speed}x</span>
              </div>
              <div className="flex gap-1.5 mt-1">
                {[0.25, 0.5, 1, 2, 4].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`flex-1 py-1 text-[10px] font-black rounded-md border transition-all ${
                      speed === s 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20' 
                        : 'bg-[var(--db-card-bg)] text-[var(--db-text-muted)] border-[var(--db-card-border)]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Simulation Buttons */}
          <div className="space-y-2 border-t pt-4 border-[var(--db-card-border)]">
            <div className="flex gap-2">
              <button 
                onClick={handleStartPause}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-1.5"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isPlaying ? 'Pause' : 'Start'}
              </button>
              <button 
                onClick={handleReset}
                className="py-2.5 px-3 bg-[var(--db-card-bg-elevated)] hover:bg-[var(--db-btn-secondary-hover)] border border-[var(--db-card-border)] text-[var(--db-text-secondary)] font-black text-xs rounded-xl flex items-center justify-center"
                title="Reset Simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleStepBackward}
                disabled={currentStepIndex <= 0}
                className="py-2 bg-[var(--db-card-bg-elevated)] hover:bg-[var(--db-btn-secondary-hover)] disabled:opacity-40 border border-[var(--db-card-border)] text-[var(--db-text-secondary)] font-bold text-[10px] rounded-lg flex items-center justify-center gap-1"
              >
                <SkipBack className="w-3.5 h-3.5" /> Step Back
              </button>
              <button 
                onClick={handleStepForward}
                disabled={currentStepIndex >= steps.length - 1}
                className="py-2 bg-[var(--db-card-bg-elevated)] hover:bg-[var(--db-btn-secondary-hover)] disabled:opacity-40 border border-[var(--db-card-border)] text-[var(--db-text-secondary)] font-bold text-[10px] rounded-lg flex items-center justify-center gap-1"
              >
                Step Forward <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className={`bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg flex flex-col justify-between overflow-hidden relative p-5 gap-4 ${
          isGameRotated ? 'w-[45%] h-full' : 'flex-1'
        }`}>
          
          <div className="flex justify-between items-center z-10">
            <div>
              <h3 className="text-lg font-black text-[var(--db-text-main)] flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-500" /> Interactive Arena
              </h3>
              <p className="text-[var(--db-text-muted)] text-xs mt-0.5">Observe sliding pointers and active boundaries.</p>
            </div>

            <div className="bg-[var(--db-card-bg-elevated)] p-1 rounded-xl border border-[var(--db-card-border)] flex">
              {['bars', 'blocks'].map(m => (
                <button 
                  key={m} 
                  onClick={() => setViewMode(m)}
                  className={`p-1.5 rounded-lg transition ${viewMode === m ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--db-text-muted)] hover:text-[var(--db-text-main)]'}`}
                  title={`${m} view mode`}
                >
                  {m === 'bars' && <Sliders className="w-3.5 h-3.5" />}
                  {m === 'blocks' && <LayoutGrid className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* VISUALIZATION STAGE */}
          <div className="flex-1 min-h-[300px] bg-[var(--db-card-bg-elevated)]/40 border border-[var(--db-card-border)] rounded-[20px] shadow-inner p-6 flex flex-col justify-end relative overflow-hidden">
            
            <AnimatePresence>
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-slate-700 animate-spin mb-2" />
                  <h4 className="text-sm font-black text-white">{generationPhase}</h4>
                </motion.div>
              )}
            </AnimatePresence>

            {viewMode === 'bars' && (
              <div className="w-full flex items-end justify-center h-full gap-2 relative">
                
                {/* Smooth Sliding Pointers */}
                <div className="absolute top-0 inset-x-0 h-8 flex justify-center pointer-events-none">
                  {array.map((item, idx) => {
                    const isLeft = activeStep.pointers.left === idx;
                    const isRight = activeStep.pointers.right === idx;
                    const isMid = activeStep.pointers.mid === idx;
                    const isMid1 = activeStep.pointers.mid1 === idx;
                    const isMid2 = activeStep.pointers.mid2 === idx;
                    const isCurrent = activeStep.pointers.current === idx;

                    return (
                      <div key={`pointer-${idx}`} className="flex-1 flex justify-center relative">
                        {isCurrent && (
                          <motion.div layoutId="search-ptr-curr" className="absolute -top-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow z-30 whitespace-nowrap">
                            ptr <span>▼</span>
                          </motion.div>
                        )}
                        {isLeft && (
                          <motion.div layoutId="search-ptr-l" className="absolute -top-1 bg-purple-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow z-30 whitespace-nowrap">
                            left <span>▼</span>
                          </motion.div>
                        )}
                        {isMid && (
                          <motion.div layoutId="search-ptr-m" className="absolute -top-6 bg-yellow-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow z-30 whitespace-nowrap">
                            mid <span>▼</span>
                          </motion.div>
                        )}
                        {isMid1 && (
                          <motion.div layoutId="search-ptr-m1" className="absolute -top-6 bg-amber-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow z-30 whitespace-nowrap">
                            mid1 <span>▼</span>
                          </motion.div>
                        )}
                        {isMid2 && (
                          <motion.div layoutId="search-ptr-m2" className="absolute -top-6 bg-orange-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow z-30 whitespace-nowrap">
                            mid2 <span>▼</span>
                          </motion.div>
                        )}
                        {isRight && (
                          <motion.div layoutId="search-ptr-r" className="absolute -top-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow z-30 whitespace-nowrap">
                            right <span>▼</span>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {array.map((item, idx) => {
                  const state = getBarColorAndOverlay(idx);

                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -300 }}
                      animate={{ 
                        opacity: state.opacity || 1, 
                        y: 0,
                        transition: { type: 'spring', stiffness: 140, damping: 15 }
                      }}
                      className="flex-1 flex flex-col justify-end items-center relative group"
                      style={{ height: '80%' }}
                    >
                      <motion.div 
                        className="w-full rounded-t-xl relative transition-all"
                        style={{ 
                          height: `${item.value}%`, 
                          background: state.background,
                          boxShadow: state.shadow
                        }}
                      >
                        {state.label && (
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap indicator-label-capsule">
                            {state.label}
                          </span>
                        )}
                      </motion.div>
                      
                      <span className="text-[11px] font-black font-mono text-[var(--db-text-secondary)] mt-2">
                        {item.value}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {viewMode === 'blocks' && (
              <div className="w-full h-full flex flex-wrap content-center justify-center gap-3">
                {array.map((item, idx) => {
                  const state = getBarColorAndOverlay(idx);

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-lg text-white shadow-lg transition-all relative border border-white/10"
                      style={{ 
                        background: state.background,
                        boxShadow: state.shadow,
                        opacity: state.opacity || 1
                      }}
                    >
                      <span>{item.value}</span>
                      <span className="text-[8px] opacity-70 font-mono mt-0.5">idx {idx}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* STEP EXPLANATION PANEL */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700 rounded-[20px] shadow-xl p-4 text-white flex flex-col relative overflow-hidden shrink-0">
            <h3 className="text-xs font-bold text-blue-400 mb-2.5 flex items-center gap-2 relative z-10 uppercase tracking-widest">
              <Info className="w-4 h-4" /> Live Search Steps
            </h3>
            <div className="flex-1 flex items-center relative z-10 min-h-[44px]">
              <p className="text-[13px] text-slate-200 leading-relaxed font-semibold">
                {activeStep.explanation}
              </p>
            </div>
            <div className="flex justify-between border-t border-slate-700/60 pt-2.5 mt-2.5 text-[10px] font-mono text-slate-400">
              <div>Target: <span className="text-white font-bold">{targetVal}</span></div>
              <div>Action: <span className="text-blue-400 font-bold">{activeStep.action}</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={`bg-[var(--db-card-bg)]/70 backdrop-blur-xl border border-[var(--db-card-border)] rounded-[24px] shadow-lg p-5 flex flex-col justify-between shrink-0 gap-5 overflow-y-auto ${
          isGameRotated ? 'w-1/4 min-w-[260px] h-full' : 'w-full lg:w-[30%] lg:max-w-[420px]'
        }`}>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--db-card-border)] pb-3">
              <h3 className="text-md font-black text-[var(--db-text-main)] flex items-center gap-1.5">
                <Code2 className="w-5 h-5 text-blue-500" /> Implementation Code
              </h3>
              
              <select 
                value={codeLang} 
                onChange={(e) => setCodeLang(e.target.value)}
                className="bg-[var(--db-card-bg-elevated)] text-[var(--db-text-secondary)] border border-[var(--db-card-border)] px-2 py-1 rounded-lg text-[10px] font-bold outline-none cursor-pointer"
              >
                {CODE_LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
            </div>

            {/* Code debugger */}
            <div className="rounded-xl overflow-hidden bg-[#0A0F1D]/90 p-4 border border-[var(--db-card-border)] relative">
              <pre className="font-mono text-[10px] leading-relaxed text-slate-300 overflow-x-auto">
                <code>
                  {ALGORITHMS[algorithm].code[codeLang]?.map((line, idx) => {
                    const isHighlighted = activeStep.line === line.line;
                    return (
                      <div 
                        key={idx}
                        className={`px-2 py-0.5 rounded transition-all ${
                          isHighlighted ? 'bg-blue-600/30 text-blue-300 font-bold border-l-4 border-blue-500 -ml-2' : ''
                        }`}
                      >
                        {line.text}
                      </div>
                    );
                  })}
                </code>
              </pre>
            </div>

            {/* Memory Layout */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[var(--db-text-muted)] font-black flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> Memory Space Trace
              </label>
              <div className="grid grid-cols-6 border border-[var(--db-card-border)] rounded-xl overflow-hidden text-center text-xs font-mono">
                {array.slice(0, 6).map((item, idx) => {
                  const isChecking = item.state === 'checking';
                  const isFound = item.state === 'found';

                  return (
                    <div 
                      key={`mem-${idx}`} 
                      className={`border-r border-[var(--db-card-border)] transition-all ${
                        isFound ? 'bg-emerald-500/20 text-emerald-400 font-black' : isChecking ? 'bg-blue-500/20 text-blue-400 font-black' : 'bg-[var(--db-card-bg-elevated)] text-[var(--db-text-secondary)]'
                      }`}
                    >
                      <div className="bg-[var(--db-card-bg)] py-1 border-b border-[var(--db-card-border)] text-[9px] text-[var(--db-text-muted)] font-bold">idx {idx}</div>
                      <div className="py-2 font-bold">{item.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--db-card-bg-elevated)] p-3.5 rounded-2xl border border-[var(--db-card-border)] flex flex-col justify-between">
                <div>
                  <span className="block text-[10px] text-[var(--db-text-muted)] uppercase font-bold tracking-wider mb-1">Comparisons</span>
                  <span className="text-xl font-mono font-black text-blue-500">{stats.comparisons}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--db-card-border)]/60">
                  <span className="block text-[10px] text-[var(--db-text-muted)] uppercase font-bold tracking-wider mb-1">Visited Items</span>
                  <span className="text-xl font-mono font-black text-purple-500">{stats.visited}</span>
                </div>
              </div>

              <div className="bg-[var(--db-card-bg-elevated)] p-3.5 rounded-2xl border border-[var(--db-card-border)] flex flex-col justify-between">
                <div className="text-center">
                  <span className="text-[10px] text-[var(--db-text-muted)] uppercase font-bold">Time Elapsed</span>
                  <span className="block text-2xl font-mono font-black text-emerald-400 mt-1">{stats.elapsedTime}s</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[var(--db-card-border)]/60 text-center">
                  <span className="text-[9px] text-[var(--db-text-muted)] uppercase font-bold">Pointer Moves</span>
                  <span className="block text-lg font-mono font-black text-orange-400 mt-0.5">{stats.movements}</span>
                </div>
              </div>
            </div>

            {/* Complexities */}
            <div className="bg-[var(--db-card-bg-elevated)]/60 border border-[var(--db-card-border)] rounded-2xl p-4 space-y-3">
              <h4 className="text-[10px] uppercase tracking-widest text-[var(--db-text-muted)] font-black">Asymptotic Complexity</h4>
              
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[var(--db-card-bg)] p-2 rounded-xl border border-[var(--db-card-border)]">
                  <span className="block text-[9px] text-[var(--db-text-muted)]">Best</span>
                  <span className="font-mono font-black text-emerald-400">{ALGORITHMS[algorithm].best}</span>
                </div>
                <div className="bg-[var(--db-card-bg)] p-2 rounded-xl border border-[var(--db-card-border)]">
                  <span className="block text-[9px] text-[var(--db-text-muted)]">Average</span>
                  <span className="font-mono font-black text-yellow-400">{ALGORITHMS[algorithm].avg}</span>
                </div>
                <div className="bg-[var(--db-card-bg)] p-2 rounded-xl border border-[var(--db-card-border)]">
                  <span className="block text-[9px] text-[var(--db-text-muted)]">Worst</span>
                  <span className="font-mono font-black text-red-400">{ALGORITHMS[algorithm].worst}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER TIMELINE */}
      <footer className="shrink-0 bg-[var(--db-card-bg)] border-t border-[var(--db-header-border)] p-4 flex flex-col gap-4 relative z-10">
        
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--db-text-muted)]">Timeline Steps:</span>
            <span className="text-xs font-mono font-bold bg-[var(--db-card-bg-elevated)] border border-[var(--db-card-border)] px-2.5 py-1 rounded-lg">
              Step {currentStepIndex + 1} / {steps.length}
            </span>
          </div>

          <div className="flex-1 h-3 flex items-center justify-between relative gap-1 bg-[var(--db-card-bg-elevated)] rounded-full px-2 border border-[var(--db-card-border)]">
            {steps.map((st, idx) => {
              const isActive = currentStepIndex === idx;
              const isPast = idx < currentStepIndex;

              return (
                <button
                  key={idx}
                  onClick={() => triggerStep(idx)}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    isActive 
                      ? 'bg-blue-500 scale-y-125' 
                      : isPast 
                        ? 'bg-blue-600/40 hover:bg-blue-500/50' 
                        : 'bg-slate-700/60 hover:bg-slate-600'
                  }`}
                  title={`${st.action}: ${st.explanation}`}
                />
              );
            })}
          </div>
        </div>

      </footer>
    </div>
  );
}

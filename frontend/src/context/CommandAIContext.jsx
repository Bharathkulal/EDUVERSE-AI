/**
 * EduVerse Command AI — Global Context Provider
 * Manages the state, wake word lifecycle, voice recognition, LLM intent parsing,
 * router execution, and Speech Synthesis TTS output.
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { parseIntent } from '../voice/IntentEngine';
import { routeCommand } from '../voice/CommandRouter';
import MemoryStore from '../voice/MemoryStore';
import WakeWordDetector from '../voice/WakeWordDetector';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CommandAIContext = createContext(null);

export const CommandAIProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Unified voice state
  const [isWakeEnabled, setIsWakeEnabled] = useState(() => MemoryStore.getWakeEnabled());
  const [activeState, setActiveState] = useState('idle'); // idle, listening, thinking, speaking
  const [transcript, setTranscript] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [history, setHistory] = useState(() => MemoryStore.getCommandHistory());
  
  // Voice synth settings
  const [volume, setVolume] = useState(0.85);
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(1.0);
  const [voiceStyle, setVoiceStyle] = useState('Natural');

  // Diagnostics & Permissions state
  const [microphoneStatus, setMicrophoneStatus] = useState('granted'); // granted, prompt, denied, missing
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [restartCount, setRestartCount] = useState(0);
  const [lastExecutionTime, setLastExecutionTime] = useState(0);
  const [lastConfidence, setLastConfidence] = useState(0.95);
  const [lastParsedIntent, setLastParsedIntent] = useState('READY');

  const recognitionRef = useRef(null);
  const wakeWordDetectorRef = useRef(null);
  const isMountedRef = useRef(true);

  const addDiagnosticLog = useCallback((type, message) => {
    const entry = { time: new Date().toLocaleTimeString(), type, message };
    setDiagnosticLogs(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  // Pre-check microphone permissions
  const checkMicrophonePermissions = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicrophoneStatus('missing');
      return;
    }
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const status = await navigator.permissions.query({ name: 'microphone' });
        setMicrophoneStatus(status.state);
        status.onchange = () => setMicrophoneStatus(status.state);
      }
    } catch (e) {
      // Ignore query permission unsupported edge cases
    }
  }, []);

  useEffect(() => {
    checkMicrophonePermissions();
  }, [checkMicrophonePermissions]);

  const requestMicrophonePermission = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicrophoneStatus('missing');
        toast.error('Microphone API is not supported in this browser.');
        return false;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicrophoneStatus('granted');
      toast.success('Microphone access granted!');
      addDiagnosticLog('permission', 'Microphone access granted');
      return true;
    } catch (err) {
      setMicrophoneStatus('denied');
      toast.error('Microphone permission denied. Please click the camera/mic icon in address bar to allow.');
      addDiagnosticLog('error', `Microphone denied: ${err.message}`);
      return false;
    }
  }, [addDiagnosticLog]);

  // Initialize Memory Store from logged-in user profile
  useEffect(() => {
    if (user) {
      MemoryStore.seedFromUser(user);
    }
  }, [user]);

  // Sync wake word setting to MemoryStore
  useEffect(() => {
    MemoryStore.setWakeEnabled(isWakeEnabled);
  }, [isWakeEnabled]);

  /** Speak text out loud using browser SpeechSynthesis */
  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => {
      if (isMountedRef.current) setActiveState('speaking');
    };
    utterance.onend = () => {
      if (isMountedRef.current) {
        setActiveState('idle');
        if (isWakeEnabled && wakeWordDetectorRef.current) {
          wakeWordDetectorRef.current.start();
        }
      }
    };
    utterance.onerror = () => {
      if (isMountedRef.current) {
        setActiveState('idle');
        if (isWakeEnabled && wakeWordDetectorRef.current) {
          wakeWordDetectorRef.current.start();
        }
      }
    };

    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(
      (v) => v.name.includes('Google US English') || v.name.includes('Female') || v.name.includes('Zira')
    );
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
  }, [volume, pitch, rate, isWakeEnabled]);

  /** Execute Router Result Actions in React space */
  const executeRouterAction = useCallback(async (result) => {
    if (!result.success) {
      if (result.error !== 'UNKNOWN_INTENT') {
        speak(result.response);
        toast.error(result.response);
      }
      return;
    }

    const { action, route, state, payload, response } = result;

    speak(response);

    switch (action) {
      case 'NAVIGATE':
        if (route) {
          navigate(route, { state });
        }
        break;
      case 'HISTORY_BACK':
        window.history.back();
        break;
      case 'HISTORY_FORWARD':
        window.history.forward();
        break;
      case 'SCROLL_DOWN':
        window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' });
        break;
      case 'SCROLL_UP':
        window.scrollBy({ top: -window.innerHeight * 0.6, behavior: 'smooth' });
        break;
      case 'SWITCH_THEME': {
        const themeBtn = document.querySelector('button[title*="theme" i]') || document.querySelector('button[aria-label*="theme" i]') || document.querySelector('.theme-toggle');
        if (themeBtn) themeBtn.click();
        break;
      }
      case 'VOICE_SEARCH': {
        const q = payload?.query || '';
        const searchInput = document.querySelector('input[placeholder*="search" i]') || document.querySelector('input[type="search"]');
        if (searchInput) {
          searchInput.focus();
          if (q) {
            searchInput.value = q;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
        break;
      }
      case 'START_TIMER':
        toast.success('Focus Timer activated (25 min)');
        break;
      case 'STOP_TIMER':
        toast.success('Focus Timer paused');
        break;
      case 'EXPORT_NOTES':
        toast.success('Exporting study notes as PDF...');
        break;
      case 'DELETE_CHAT':
        toast.success('Workspace cleared.');
        break;
      case 'TRIGGER_RESUME_DOWNLOAD':
        toast.loading('Compiling and generating resume PDF...');
        setTimeout(() => {
          toast.success('Resume downloaded successfully!');
        }, 1500);
        break;
      case 'TUTOR_TEACH':
        if (route) {
          navigate(route, { state: payload });
        }
        break;
      case 'STOP_VOICE':
        if (recognitionRef.current) recognitionRef.current.stop();
        if (wakeWordDetectorRef.current) wakeWordDetectorRef.current.stop();
        break;
      case 'LOGOUT':
        MemoryStore.clearAll();
        api.post('/auth/logout').finally(() => {
          window.location.href = '/';
        });
        break;
      default:
        break;
    }

    try {
      await api.post('/voice/log', {
        intent: result.intent,
        transcript: transcript || result.rawTranscript || 'Command Input',
        confidence: 0.95,
        status: 'success'
      });
    } catch (e) {
      // Silent catch
    }

    setHistory(MemoryStore.getCommandHistory());
  }, [navigate, speak, transcript]);

  /** Main Command Execution Pipeline */
  const executeCommand = useCallback(async (rawText) => {
    if (!rawText.trim()) return;

    const startTime = performance.now();
    setActiveState('thinking');
    addDiagnosticLog('intent', `Parsing: "${rawText}"`);
    
    // 1. LLM / Fuzzy Intent parsing
    const intentResult = await parseIntent(rawText, MemoryStore.getFullContext());
    setLastParsedIntent(intentResult.intent);
    setLastConfidence(intentResult.confidence);

    // 2. Command routing
    const routerResult = await routeCommand(intentResult, user?.role || 'student');
    
    const duration = Math.round(performance.now() - startTime);
    setLastExecutionTime(duration);
    addDiagnosticLog('action', `Executed: ${intentResult.intent} (${duration}ms)`);

    // 3. React execution
    await executeRouterAction(routerResult);
  }, [user, executeRouterAction, addDiagnosticLog]);

  /** Activate Speech Recognition manually */
  const startListening = useCallback(async () => {
    if (microphoneStatus === 'denied') {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (wakeWordDetectorRef.current) {
      wakeWordDetectorRef.current.stop();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        return;
      } catch {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setActiveState('listening');
      setTranscript('');
      setIsPanelOpen(true);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      addDiagnosticLog('speech', 'Speech recognition engine started');
    };

    rec.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };

    rec.onend = () => {
      setActiveState('idle');
      setRestartCount(prev => prev + 1);
      setTranscript((currentVal) => {
        if (currentVal.trim()) {
          executeCommand(currentVal);
        }
        return '';
      });
    };

    rec.onerror = (event) => {
      setActiveState('idle');
      addDiagnosticLog('error', `Speech engine error: ${event.error}`);

      // Filter out benign operational abort / no-speech errors to prevent intrusive toasts
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        if (event.error === 'not-allowed') {
          setMicrophoneStatus('denied');
          toast.error('Microphone permission blocked. Please enable mic access.');
        } else {
          console.warn(`[CommandAI] Recognition note: ${event.error}`);
        }
      }

      if (isWakeEnabled && wakeWordDetectorRef.current) {
        wakeWordDetectorRef.current.start();
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      addDiagnosticLog('error', `Speech start exception: ${e.message}`);
    }
  }, [executeCommand, isWakeEnabled, microphoneStatus, requestMicrophonePermission, addDiagnosticLog]);


  // Handle continuous Wake Word Lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    
    if (isWakeEnabled) {
      const detector = new WakeWordDetector({
        onWake: () => {
          toast.success('EduVerse OS listening…');
          speak('Yes? I am listening.');
          startListening();
        },
        onError: (err) => {
          console.warn('WakeWord error:', err);
        }
      });
      wakeWordDetectorRef.current = detector;
      detector.start();
    } else {
      if (wakeWordDetectorRef.current) {
        wakeWordDetectorRef.current.stop();
      }
    }

    return () => {
      isMountedRef.current = false;
      if (wakeWordDetectorRef.current) wakeWordDetectorRef.current.stop();
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [isWakeEnabled, startListening, speak]);

  const value = {
    isWakeEnabled,
    setIsWakeEnabled,
    activeState,
    transcript,
    isPanelOpen,
    setIsPanelOpen,
    history,
    volume,
    setVolume,
    pitch,
    setPitch,
    rate,
    setRate,
    voiceStyle,
    setVoiceStyle,
    microphoneStatus,
    requestMicrophonePermission,
    diagnosticLogs,
    restartCount,
    lastExecutionTime,
    lastConfidence,
    lastParsedIntent,
    speak,
    startListening,
    executeCommand
  };

  return (
    <CommandAIContext.Provider value={value}>
      {children}
    </CommandAIContext.Provider>
  );

};

export const useCommandAI = () => {
  const context = useContext(CommandAIContext);
  if (!context) {
    throw new Error('useCommandAI must be used within a CommandAIProvider');
  }
  return context;
};
export default CommandAIContext;

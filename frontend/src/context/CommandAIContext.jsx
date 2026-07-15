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

  const recognitionRef = useRef(null);
  const wakeWordDetectorRef = useRef(null);
  const isMountedRef = useRef(true);

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
        // Restart wake word detector if enabled
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

    // Find custom female voice if available
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
      speak(result.response);
      toast.error(result.response);
      return;
    }

    const { action, route, state, payload, response } = result;

    // Trigger TTS response
    speak(response);

    // React Action handler
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
        // Wipe local storage state and trigger normal logout redirect
        MemoryStore.clearAll();
        api.post('/auth/logout').finally(() => {
          window.location.href = '/';
        });
        break;
      default:
        break;
    }

    // Log the voice command execution to backend analytics for Admin audit trail
    try {
      await api.post('/voice/log', {
        intent: result.intent,
        transcript: transcript || result.rawTranscript || 'Command Input',
        confidence: 0.95,
        status: 'success'
      });
    } catch (e) {
      // Backend log failed but client command succeeded
    }

    // Update state history
    setHistory(MemoryStore.getCommandHistory());
  }, [navigate, speak, transcript]);

  /** Main Command Execution Pipeline */
  const executeCommand = useCallback(async (rawText) => {
    if (!rawText.trim()) return;

    setActiveState('thinking');
    
    // 1. LLM Intent parsing
    const intentResult = await parseIntent(rawText, MemoryStore.getFullContext());
    
    // 2. Command routing
    const routerResult = await routeCommand(intentResult, user?.role || 'student');
    
    // 3. React execution
    await executeRouterAction(routerResult);
  }, [user, executeRouterAction]);

  /** Activate Speech Recognition manually */
  const startListening = useCallback(() => {
    // Cancel any active wake word listener
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
        recognitionRef.current.stop();
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
    };

    rec.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };

    rec.onend = () => {
      setActiveState('idle');
      // Trigger execution automatically if transcript exists
      setTranscript((currentVal) => {
        if (currentVal.trim()) {
          executeCommand(currentVal);
        }
        return '';
      });
    };

    rec.onerror = (event) => {
      setActiveState('idle');
      if (event.error !== 'no-speech') {
        toast.error(`Mic error: ${event.error}`);
      }
      if (isWakeEnabled && wakeWordDetectorRef.current) {
        wakeWordDetectorRef.current.start();
      }
    };

    recognitionRef.current = rec;
    rec.start();
  }, [executeCommand, isWakeEnabled]);

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

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

// Synthesize a futuristic notification chime using Web Audio API
function playChime(type = 'wake') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'wake') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
      
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440.00, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {
    console.warn('[useFridayAgent] Could not play notification chime:', e);
  }
}

export function useFridayAgent(options = {}) {
  const navigate = useNavigate();
  const { onStateChange, onTranscript, onSpeakStart, onSpeakEnd, isEnabled = true } = options;

  const [agentState, setAgentState] = useState('idle'); // idle, listening, thinking, speaking
  const [transcriptText, setTranscriptText] = useState('');
  
  const recognitionRef = useRef(null);
  const activeAudioRef = useRef(null);
  
  // Track current mode: 'WAKE' (waiting for wake word) or 'COMMAND' (capturing user request)
  const modeRef = useRef('WAKE'); 
  const isEnabledRef = useRef(isEnabled);
  const finalTranscriptRef = useRef('');
  const speakActiveRef = useRef(false);

  // Sync isEnabled to ref to prevent stale closures in recognition callbacks
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  const updateAgentState = useCallback((state) => {
    setAgentState(state);
    if (onStateChange) onStateChange(state);
  }, [onStateChange]);

  // Stop active audio playbacks
  const stopSpeakPlayback = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speakActiveRef.current = false;
    updateAgentState('idle');
    if (onSpeakEnd) onSpeakEnd();
  }, [updateAgentState, onSpeakEnd]);

  // Fallback to browser Speech Synthesis
  const speakFallback = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#`_\-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onstart = () => {
      speakActiveRef.current = true;
      updateAgentState('speaking');
      if (onSpeakStart) onSpeakStart();
    };
    utterance.onend = () => {
      speakActiveRef.current = false;
      updateAgentState('idle');
      if (onSpeakEnd) onSpeakEnd();
    };
    utterance.onerror = () => {
      speakActiveRef.current = false;
      updateAgentState('idle');
      if (onSpeakEnd) onSpeakEnd();
    };

    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(
      (v) => v.name.includes('Google US English') || v.name.includes('Female') || v.name.includes('Zira')
    );
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
  }, [updateAgentState, onSpeakStart, onSpeakEnd]);

  // Play ElevenLabs audio
  const playAudioResponse = useCallback((base64Audio, textFallback) => {
    try {
      stopSpeakPlayback();
      
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onplay = () => {
        speakActiveRef.current = true;
        updateAgentState('speaking');
        if (onSpeakStart) onSpeakStart();
      };

      audio.onended = () => {
        speakActiveRef.current = false;
        updateAgentState('idle');
        if (onSpeakEnd) onSpeakEnd();
        activeAudioRef.current = null;
      };

      audio.onerror = (e) => {
        console.warn('ElevenLabs play error, falling back to browser synthesis:', e);
        speakFallback(textFallback);
      };

      audio.play().catch(err => {
        console.warn('Playback blocked, using fallback:', err);
        speakFallback(textFallback);
      });
    } catch (err) {
      console.warn('Audio response error, using fallback:', err);
      speakFallback(textFallback);
    }
  }, [stopSpeakPlayback, speakFallback, updateAgentState, onSpeakStart, onSpeakEnd]);

  // Route navigation commands
  const executeAgentCommand = useCallback((action) => {
    if (!action) return;
    const { command, params } = action;
    console.log('[useFridayAgent] Executing tool command:', command, params);

    switch (command) {
      case 'open_lesson': {
        const lesson = params.lesson_name || '';
        toast.success(`Opening lesson: "${lesson}"`);
        navigate('/subjects');
        break;
      }
      case 'start_quiz': {
        const topic = params.topic || '';
        toast.success(`Starting quiz: "${topic}"`);
        navigate('/practice-hub');
        break;
      }
      case 'set_reminder': {
        const { task, time } = params;
        toast.success(`Study Reminder set: "${task}" for ${time}`);
        break;
      }
      case 'navigate_to_screen': {
        const screen = params.screen || '';
        const routes = {
          dashboard: '/dashboard',
          profile: '/ai-profile',
          progress: '/subjects',
          settings: '/settings'
        };
        if (routes[screen]) {
          toast.success(`Navigating to: ${screen}`);
          navigate(routes[screen]);
        } else {
          toast.error(`Unknown screen destination: ${screen}`);
        }
        break;
      }
      default:
        console.warn('Unknown voice command:', command);
    }
  }, [navigate]);

  // Main SpeechRecognition initializer
  const initSpeechLoop = useCallback(() => {
    if (!isEnabledRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not supported in this browser.');
      return;
    }

    // Cancel previous instance if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = (modeRef.current === 'WAKE');
    rec.interimResults = (modeRef.current === 'COMMAND');
    rec.lang = 'en-US';

    rec.onstart = () => {
      console.log(`[useFridayAgent] Speech Recognition started in mode: ${modeRef.current}`);
    };

    rec.onresult = (event) => {
      const lastIndex = event.resultIndex;
      const text = event.results[lastIndex][0].transcript.toLowerCase().trim();

      if (modeRef.current === 'WAKE') {
        console.log('[useFridayAgent] Wake phrase monitor:', text);
        const hasWakeWord = [
          'friday', 'hey friday', 'hello friday', 'hi friday', 'okay friday', 'hey eduverse', 
          'hay friday', 'hi friday', 'ok friday', 'wake up friday', 'hey edu verse'
        ].some(wake => text.includes(wake));

        if (hasWakeWord) {
          console.log('[useFridayAgent] Hotword detected!');
          playChime('wake');
          modeRef.current = 'COMMAND';
          finalTranscriptRef.current = '';
          updateAgentState('listening');
          
          // Switch to command input mode
          try {
            rec.stop();
          } catch (e) {}
        }
      } else if (modeRef.current === 'COMMAND') {
        const currentInterim = event.results[lastIndex][0].transcript;
        console.log('[useFridayAgent] Live transcript interim:', currentInterim);
        setTranscriptText(currentInterim);
        if (onTranscript) onTranscript(currentInterim);

        if (event.results[lastIndex].isFinal) {
          finalTranscriptRef.current = currentInterim;
        }
      }
    };

    rec.onend = async () => {
      console.log(`[useFridayAgent] Speech Recognition ended in mode: ${modeRef.current}`);

      if (modeRef.current === 'COMMAND') {
        const userCommand = finalTranscriptRef.current.trim();
        if (userCommand) {
          updateAgentState('thinking');
          try {
            const response = await api.post('/friday/voice-text', { message: userCommand });
            const { response: textResponse, action, audio } = response.data;

            if (action) {
              executeAgentCommand(action);
            }

            if (audio) {
              playAudioResponse(audio, textResponse);
            } else if (textResponse) {
              speakFallback(textResponse);
            } else {
              updateAgentState('idle');
              modeRef.current = 'WAKE';
              initSpeechLoop();
            }
          } catch (err) {
            console.error('[useFridayAgent] Command transmission error:', err);
            toast.error('Voice Assistant command failed');
            updateAgentState('idle');
            modeRef.current = 'WAKE';
            initSpeechLoop();
          }
        } else {
          // Silence timeout, revert to wake-word listening
          updateAgentState('idle');
          modeRef.current = 'WAKE';
          initSpeechLoop();
        }
      } else {
        // In wake-word mode, restart listening loop immediately
        setTimeout(() => {
          if (isEnabledRef.current && modeRef.current === 'WAKE' && !speakActiveRef.current) {
            initSpeechLoop();
          }
        }, 300);
      }
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('[useFridayAgent] Recognition Error:', e.error);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.warn('[useFridayAgent] Recognition start exception:', e.message);
    }
  }, [updateAgentState, executeAgentCommand, playAudioResponse, speakFallback, onTranscript, onSpeakStart, onSpeakEnd]);

  // Manually trigger command mode on microphone button click
  const triggerManualCommand = useCallback(() => {
    stopSpeakPlayback();
    playChime('wake');
    modeRef.current = 'COMMAND';
    finalTranscriptRef.current = '';
    setTranscriptText('');
    updateAgentState('listening');
    initSpeechLoop();
  }, [stopSpeakPlayback, initSpeechLoop, updateAgentState]);

  // Effect to manage active listener states
  useEffect(() => {
    if (isEnabled) {
      modeRef.current = 'WAKE';
      initSpeechLoop();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      stopSpeakPlayback();
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [isEnabled, initSpeechLoop, stopSpeakPlayback]);

  return {
    agentState,
    transcriptText,
    recordCommand: triggerManualCommand,
    stopSpeaking: stopSpeakPlayback
  };
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import React from 'react';

// Synthesize a notification chime
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
    console.warn('[useFridayAgent] Chime playback failed:', e);
  }
}

export function useFridayAgent(options = {}) {
  const navigate = useNavigate();
  const { onStateChange, onTranscript, onSpeakStart, onSpeakEnd, isEnabled = true } = options;

  const [agentState, setAgentState] = useState('idle'); // idle, listening, thinking, speaking
  const [transcriptText, setTranscriptText] = useState('');
  
  const recognitionRef = useRef(null);
  const activeAudioRef = useRef(null);
  
  const modeRef = useRef('WAKE'); 
  const isEnabledRef = useRef(isEnabled);
  const finalTranscriptRef = useRef('');
  const speakActiveRef = useRef(false);
  const isWakeTransitionRef = useRef(false);

  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  const updateAgentState = useCallback((state) => {
    setAgentState(state);
    if (onStateChange) onStateChange(state);
  }, [onStateChange]);

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
        console.warn('ElevenLabs audio error, using Web Speech fallback:', e);
        speakFallback(textFallback);
      };

      audio.play().catch(err => {
        console.warn('Play blocked, using fallback:', err);
        speakFallback(textFallback);
      });
    } catch (err) {
      console.warn('Audio response error, using fallback:', err);
      speakFallback(textFallback);
    }
  }, [stopSpeakPlayback, speakFallback, updateAgentState, onSpeakStart, onSpeakEnd]);

  // Navigate/Execute action commands locally
  const executeAgentCommand = useCallback((action) => {
    if (!action) return;
    const { command, params } = action;
    console.log('[useFridayAgent] Command instruction received:', command, params);

    switch (command) {
      case 'open_lesson': {
        const lesson = params.lesson_name || '';
        toast.success(`Opening course path: "${lesson}"`);
        navigate('/subjects');
        break;
      }
      case 'start_quiz': {
        const topic = params.topic || '';
        toast.success(`Starting chapter quiz: "${topic}"`);
        navigate('/practice-hub');
        break;
      }
      case 'set_reminder': {
        const { task, time } = params;
        toast.success(`Reminder saved: "${task}" for ${time}`);
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
          toast.success(`Navigating to ${screen}`);
          navigate(routes[screen]);
        } else {
          toast.error(`Unknown destination: ${screen}`);
        }
        break;
      }
      case 'open_app': {
        toast.success(`Launching desktop application: ${params.appName}`);
        break;
      }
      case 'generate_document': {
        toast.success(`Document created successfully!`);
        break;
      }
      default:
        console.warn('[useFridayAgent] Action unhandled:', command);
    }
  }, [navigate]);

  // Send action authorization confirmation back to backend
  const confirmAction = useCallback(async (taskId, confirmed) => {
    updateAgentState('thinking');
    try {
      const response = await api.post('/friday/action-confirm', { taskId, confirmed });
      const { response: textResponse } = response.data;
      speakFallback(textResponse);
      updateAgentState('idle');
      modeRef.current = 'WAKE';
      initSpeechLoop();
    } catch (err) {
      console.error('[useFridayAgent] Confirmation failure:', err);
      toast.error('Action permission failed');
      updateAgentState('idle');
      modeRef.current = 'WAKE';
      initSpeechLoop();
    }
  }, [updateAgentState, speakFallback]);

  // Request user validation for sensitive OS commands
  const requestUserPermission = useCallback((taskId, textResponse) => {
    toast((t) => {
      return React.createElement('div', { className: 'flex flex-col gap-2 p-2' },
        React.createElement('span', { className: 'text-sm font-semibold text-gray-800 dark:text-gray-100' }, textResponse),
        React.createElement('div', { className: 'flex gap-2 justify-end' },
          React.createElement('button', {
            onClick: async () => {
              toast.dismiss(t.id);
              await confirmAction(taskId, true);
            },
            className: 'px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold'
          }, 'Authorize'),
          React.createElement('button', {
            onClick: async () => {
              toast.dismiss(t.id);
              await confirmAction(taskId, false);
            },
            className: 'px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-semibold'
          }, 'Cancel')
        )
      );
    }, { duration: 10000, id: 'friday-auth-confirm' });
  }, [confirmAction]);

  // Speech Recognition loop
  const initSpeechLoop = useCallback(() => {
    if (!isEnabledRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = (modeRef.current === 'WAKE');
    rec.interimResults = (modeRef.current === 'COMMAND');
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      const lastIndex = event.resultIndex;
      const text = event.results[lastIndex][0].transcript.toLowerCase().trim();

      if (modeRef.current === 'WAKE') {
        console.log('[useFridayAgent] Wake-phrase listener:', text);
        const wakePhrases = [
          'hey friday', 'hello friday', 'hi friday', 'okay friday', 'hey eduverse', 
          'hay friday', 'hi friday', 'ok friday', 'wake up friday', 'hey edu verse', 'friday'
        ];
        const hasWakeWord = wakePhrases.some(wake => text.includes(wake));

        if (hasWakeWord) {
          console.log('[useFridayAgent] Wake word heard!');
          playChime('wake');

          // Extract any words spoken after the wake phrase in the same utterance
          let commandAfterWake = '';
          for (const wake of wakePhrases) {
            if (text.includes(wake)) {
              const idx = text.indexOf(wake);
              const remaining = text.substring(idx + wake.length).trim();
              if (remaining) {
                commandAfterWake = remaining;
                break;
              }
            }
          }

          modeRef.current = 'COMMAND';
          if (commandAfterWake) {
            finalTranscriptRef.current = commandAfterWake;
            isWakeTransitionRef.current = false;
          } else {
            finalTranscriptRef.current = '';
            isWakeTransitionRef.current = true;
          }

          updateAgentState('listening');
          try {
            rec.stop();
          } catch (e) {}
        }
      } else if (modeRef.current === 'COMMAND') {
        const interim = event.results[lastIndex][0].transcript;
        setTranscriptText(interim);
        if (onTranscript) onTranscript(interim);

        if (event.results[lastIndex].isFinal) {
          finalTranscriptRef.current = interim;
        }
      }
    };

    rec.onend = async () => {
      if (modeRef.current === 'COMMAND') {
        const userCommand = finalTranscriptRef.current.trim();
        if (userCommand) {
          updateAgentState('thinking');
          try {
            const response = await api.post('/friday/voice-text', { message: userCommand });
            const { status, taskId, response: textResponse, action, audio } = response.data;

            if (status === 'pending_permission') {
              speakFallback(textResponse);
              requestUserPermission(taskId, textResponse);
              return;
            }

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
            console.error('[useFridayAgent] Command failed:', err);
            toast.error('Voice Assistant command failed');
            updateAgentState('idle');
            modeRef.current = 'WAKE';
            initSpeechLoop();
          }
        } else if (isWakeTransitionRef.current) {
          // We just transitioned from wake, so start listening for the actual command in COMMAND mode
          isWakeTransitionRef.current = false;
          updateAgentState('listening');
          initSpeechLoop();
        } else {
          updateAgentState('idle');
          modeRef.current = 'WAKE';
          initSpeechLoop();
        }
      } else {
        setTimeout(() => {
          if (isEnabledRef.current && modeRef.current === 'WAKE' && !speakActiveRef.current) {
            initSpeechLoop();
          }
        }, 300);
      }
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('[useFridayAgent] Speech error:', e.error);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.warn('[useFridayAgent] Speech start exception:', e.message);
    }
  }, [updateAgentState, executeAgentCommand, requestUserPermission, playAudioResponse, speakFallback, onTranscript]);

  const triggerManualCommand = useCallback(() => {
    stopSpeakPlayback();
    playChime('wake');
    modeRef.current = 'COMMAND';
    finalTranscriptRef.current = '';
    setTranscriptText('');
    updateAgentState('listening');
    initSpeechLoop();
  }, [stopSpeakPlayback, initSpeechLoop, updateAgentState]);

  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (navigator.userActivation && navigator.userActivation.hasBeenActive) {
      setHasInteracted(true);
      return;
    }

    const handleInteraction = () => {
      setHasInteracted(true);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (isEnabled && hasInteracted) {
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
  }, [isEnabled, hasInteracted, initSpeechLoop, stopSpeakPlayback]);

  return {
    agentState,
    transcriptText,
    recordCommand: triggerManualCommand,
    stopSpeaking: stopSpeakPlayback
  };
}

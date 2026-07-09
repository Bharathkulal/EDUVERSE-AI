import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export function useFridayAgent(options = {}) {
  const navigate = useNavigate();
  const { onStateChange, onTranscript, onSpeakStart, onSpeakEnd, isEnabled = true } = options;

  const [agentState, setAgentState] = useState('idle'); // idle, listening, thinking, speaking
  const [transcriptText, setTranscriptText] = useState('');
  
  const wakeRecognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null);
  const activeAudioRef = useRef(null);
  const isListeningRef = useRef(false);
  const wakeWordCheckingRef = useRef(false);

  // Sync state to parent callback
  const updateAgentState = useCallback((state) => {
    setAgentState(state);
    if (onStateChange) onStateChange(state);
  }, [onStateChange]);

  // Stop any active audio playbacks
  const stopSpeakPlayback = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    updateAgentState('idle');
    if (onSpeakEnd) onSpeakEnd();
  }, [updateAgentState, onSpeakEnd]);

  // Speak a text response using browser speechSynthesis (fallback)
  const speakFallback = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#`_\-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onstart = () => {
      updateAgentState('speaking');
      if (onSpeakStart) onSpeakStart();
    };
    utterance.onend = () => {
      updateAgentState('idle');
      if (onSpeakEnd) onSpeakEnd();
    };
    utterance.onerror = () => {
      updateAgentState('idle');
      if (onSpeakEnd) onSpeakEnd();
    };

    // Find custom voices
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(
      (v) => v.name.includes('Google US English') || v.name.includes('Female') || v.name.includes('Zira')
    );
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
  }, [updateAgentState, onSpeakStart, onSpeakEnd]);

  // Play audio response (ElevenLabs base64 string)
  const playAudioResponse = useCallback((base64Audio, textFallback) => {
    try {
      stopSpeakPlayback();
      
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onplay = () => {
        updateAgentState('speaking');
        if (onSpeakStart) onSpeakStart();
      };

      audio.onended = () => {
        updateAgentState('idle');
        if (onSpeakEnd) onSpeakEnd();
        activeAudioRef.current = null;
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error, falling back to speech synthesis:', e);
        speakFallback(textFallback);
      };

      audio.play().catch(err => {
        console.warn('Playback block or fail, falling back to speech synthesis:', err);
        speakFallback(textFallback);
      });
    } catch (err) {
      console.warn('Audio response error, using fallback:', err);
      speakFallback(textFallback);
    }
  }, [stopSpeakPlayback, speakFallback, updateAgentState, onSpeakStart, onSpeakEnd]);

  // Execute commands from Claude tool calling
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
        console.warn('Unknown voice command received:', command);
    }
  }, [navigate]);

  // Record command audio clip
  const recordCommandClip = useCallback(async () => {
    try {
      updateAgentState('listening');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Close stream tracks
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 500) {
          console.warn('Audio clip too short or empty');
          updateAgentState('idle');
          return;
        }

        // Send audio to backend
        updateAgentState('thinking');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'command.webm');

        try {
          const response = await api.post('/friday/voice', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          const { transcript, response: textResponse, action, audio } = response.data;
          
          setTranscriptText(transcript);
          if (onTranscript) onTranscript(transcript);

          // If tool call is matched, execute it
          if (action) {
            executeAgentCommand(action);
          }

          // TTS play
          if (audio) {
            playAudioResponse(audio, textResponse);
          } else if (textResponse) {
            speakFallback(textResponse);
          } else {
            updateAgentState('idle');
          }
        } catch (err) {
          console.error('Error sending Friday voice clip:', err);
          toast.error('Voice Assistant command failed');
          updateAgentState('idle');
        }
      };

      mediaRecorder.start();

      // Record for a fixed duration of 3.5 seconds
      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 3500);

    } catch (err) {
      console.error('Failed to access microphone for command clip:', err);
      toast.error('Could not access microphone');
      updateAgentState('idle');
    }
  }, [updateAgentState, executeAgentCommand, playAudioResponse, speakFallback, onTranscript]);

  // Start continuous wake-word listening
  const startWakeWordListener = useCallback(() => {
    if (wakeWordCheckingRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Continuous Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListeningRef.current = true;
      wakeWordCheckingRef.current = true;
      console.log('[useFridayAgent] Wake-word listener active. Listening for "Hey Friday"...');
    };

    recognition.onresult = (event) => {
      const lastIndex = event.resultIndex;
      const resultText = event.results[lastIndex][0].transcript.toLowerCase().trim();
      console.log('[useFridayAgent] Heard phrase:', resultText);

      if (resultText.includes('friday') || resultText.includes('hey friday') || resultText.includes('hay friday')) {
        console.log('[useFridayAgent] Wake word "Hey Friday" DETECTED!');
        // Stop wake-word recognition temporarily to record the command clip
        recognition.stop();
        // Trigger command clip recording
        recordCommandClip();
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      wakeWordCheckingRef.current = false;
      // Restart loop if enabled and agent is not busy
      setTimeout(() => {
        if (isEnabled && agentState === 'idle') {
          startWakeWordListener();
        }
      }, 500);
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        console.warn('Wake-word speech recognition error:', e.error);
      }
    };

    wakeRecognitionRef.current = recognition;
    recognition.start();
  }, [isEnabled, agentState, recordCommandClip]);

  const stopWakeWordListener = useCallback(() => {
    if (wakeRecognitionRef.current) {
      wakeRecognitionRef.current.stop();
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  // Monitor enabled state and busy state to start/stop wake-word listener
  useEffect(() => {
    if (isEnabled && agentState === 'idle') {
      startWakeWordListener();
    } else {
      stopWakeWordListener();
    }

    return () => {
      stopWakeWordListener();
    };
  }, [isEnabled, agentState, startWakeWordListener, stopWakeWordListener]);

  return {
    agentState,
    transcriptText,
    recordCommand: recordCommandClip,
    stopSpeaking: stopSpeakPlayback
  };
}

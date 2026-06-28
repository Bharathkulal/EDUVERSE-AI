import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToasterStore } from 'react-hot-toast';
import SpeechSynthesisService from '../services/voice/SpeechSynthesisService';
import SpeechRecognitionService from '../services/voice/SpeechRecognitionService';
import PageGuideService, { getPageGuide } from '../services/voice/PageGuideService';
import VoiceCommandParser from '../services/voice/VoiceCommandParser';
import UserProgressTracker from '../services/voice/UserProgressTracker';
import api from '../api/axios';

const VoiceContext = createContext(null);

export const VoiceAssistantProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts } = useToasterStore();

  // Load configuration from local storage
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('voice_assistant_settings');
    return saved ? JSON.parse(saved) : {
      volume: 1,
      rate: 1.0,
      pitch: 1.0,
      provider: 'native',
      voiceURI: null,
      autoStart: true,
      encouragement: true,
      autoGuidance: true
    };
  });

  const [isEnabled, setIsEnabled] = useState(() => {
    const savedState = localStorage.getItem('voice_assistant_enabled');
    return savedState !== 'false';
  });

  const [isMuted, setIsMuted] = useState(false);
  const [activeState, setActiveState] = useState('idle'); // idle, listening, thinking, speaking
  const [subtitle, setSubtitle] = useState('');
  const [isListening, setIsListening] = useState(false);

  const lastSpeechRef = useRef('');
  const processedToastsRef = useRef(new Set());
  const isEnabledRef = useRef(isEnabled);
  const settingsRef = useRef(settings);
  const isMutedRef = useRef(isMuted);

  // Sync refs to avoid dependency re-renders in callbacks
  useEffect(() => { isEnabledRef.current = isEnabled; }, [isEnabled]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // Persist toggles
  useEffect(() => {
    localStorage.setItem('voice_assistant_enabled', isEnabled ? 'true' : 'false');
  }, [isEnabled]);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('voice_assistant_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Speak function
  const speak = useCallback((text) => {
    if (!isEnabledRef.current || isMutedRef.current) return;
    
    lastSpeechRef.current = text;
    setSubtitle(text);

    SpeechSynthesisService.speak(
      text,
      settingsRef.current,
      () => setActiveState('speaking'),
      () => {
        setActiveState('idle');
        setSubtitle('');
      },
      (err) => {
        console.error('Speech synthesis error:', err);
        setActiveState('idle');
        setSubtitle('');
      }
    );
  }, []);

  const stopSpeech = useCallback(() => {
    SpeechSynthesisService.cancel();
    setActiveState('idle');
    setSubtitle('');
  }, []);

  // Encapsulated LLM query for site questions
  const askAI = useCallback(async (question) => {
    if (!isEnabledRef.current) return;
    
    setActiveState('thinking');
    setSubtitle('F.R.I.D.A.Y. is thinking...');
    
    try {
      const websiteContext = `
You are F.R.I.D.A.Y., the supportive student AI voice assistant for the EduVerse AI platform.
The user is asking a question about the website.
Here is the core outline of the EduVerse AI spaces:
1. Dashboard (/dashboard): View study goals, strengths, streaks, and current readiness progress.
2. Subjects (/subjects): Enrolled syllabus catalog (Mathematics, Data Structures, etc.).
3. Practice Hub (/practice-hub): Take subject assessments and MCQ mock trials.
4. Coding Playground (/coding): Edit and run code logic in multiple programming languages (Java, Python, C, C++).
5. DBMS SQL Laboratory (/dbms-lab): SQL shell sandboxing query statements.
6. Friday AI Tutor (/ai-tutor): Study notes parser, chat hub, and tutor.
7. Visualizers: Stack (/dsa/stack), Queue (/dsa/queue), Linked List (/dsa/linked-list), Tree (/dsa/tree), Graph (/dsa/graph), and Calculus Notebook (/mathematics/calculus) step solvers.
8. Settings (/settings): Manage student details and toggle voice assistant parameters.

Give a friendly, direct, and concise response in 1 to 2 sentences. Only discuss website features. If the user asks general or unrelated queries, politely remind them that you are focused on helping them navigate and use EduVerse.
`;
      const payload = {
        message: `${websiteContext}\nUser question: ${question}`,
        mode: 'doubt',
        subject: 'EduVerse AI platform help'
      };
      
      const { data } = await api.post('/ai/chat', payload);
      speak(data.response);
    } catch (err) {
      console.error('Doubt assistant lookup failure:', err);
      speak("Pardon me, but I had trouble connecting to my central brain. Please check your network connection.");
    }
  }, [speak]);

  // Voice commands actions mapping
  const executeVoiceCommand = useCallback((transcript) => {
    const actions = {
      navigate: (path) => navigate(path),
      explain: () => {
        const guide = getPageGuide(location.pathname);
        speak(guide.explanation);
      },
      next: () => {
        // Find next buttons or trigger walkthrough steps if present
        const nextBtn = document.querySelector('button[aria-label="Next"], button:contains("Next")') || document.querySelector('button.btn-primary');
        if (nextBtn) {
          nextBtn.click();
          speak("Clicking next step for you.");
        } else {
          speak("I couldn't locate a next step action on this screen.");
        }
      },
      back: () => {
        navigate(-1);
        speak("Going back to the previous screen.");
      },
      repeat: () => {
        if (lastSpeechRef.current) {
          speak(lastSpeechRef.current);
        } else {
          speak("I haven't spoken anything yet.");
        }
      },
      stop: () => {
        stopSpeech();
        speak("Stopping voice guide.");
      },
      continue: () => {
        if (lastSpeechRef.current) {
          speak(lastSpeechRef.current);
        }
      }
    };

    const result = VoiceCommandParser.parse(transcript, actions);
    if (!result) {
      // If transcript is not a direct static command, query Gemini
      askAI(transcript);
    }
  }, [navigate, location.pathname, speak, stopSpeech, askAI]);

  // Listening controls
  const startListening = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    SpeechRecognitionService.start(
      (text) => {
        setSubtitle(`Heard: "${text}"`);
        executeVoiceCommand(text);
      },
      () => {
        setIsListening(false);
        // Autoloop restart if enabled
        if (isEnabledRef.current && !isMutedRef.current) {
          setTimeout(() => {
            if (isEnabledRef.current && !isMutedRef.current && activeState !== 'speaking') {
              startListening();
            }
          }, 1000);
        }
      },
      (err) => {
        console.error('Recognition error handler:', err);
        setIsListening(false);
      }
    );
    setIsListening(true);
  }, [executeVoiceCommand, activeState]);

  const stopListening = useCallback(() => {
    SpeechRecognitionService.stop();
    setIsListening(false);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => {
      const nextState = !prev;
      if (!nextState) {
        // Shut down immediately
        SpeechSynthesisService.cancel();
        SpeechRecognitionService.stop();
        UserProgressTracker.stop();
        setActiveState('idle');
        setSubtitle('');
        setIsListening(false);
      }
      return nextState;
    });
  }, []);

  // Track page changes
  useEffect(() => {
    if (!isEnabled) return;

    // Reset inactivity tracker on path navigation
    UserProgressTracker.stop();
    UserProgressTracker.start(() => {
      speak("It looks like you've been inactive for a bit. If you need any assistance on this page, just say 'help me' or ask me a question.");
    }, 45000); // 45 seconds timeout for stuck nudges

    if (settings.autoGuidance) {
      const guide = getPageGuide(location.pathname);
      // Wait a moment for page layouts to paint
      const timeout = setTimeout(() => {
        speak(guide.welcome);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, isEnabled, settings.autoGuidance, speak]);

  // Track toasts for validations and achievements
  useEffect(() => {
    if (!isEnabled || !settings.encouragement) return;

    toasts.forEach((toastItem) => {
      if (processedToastsRef.current.has(toastItem.id)) return;
      processedToastsRef.current.add(toastItem.id);

      // Extract raw text from toast message
      let msgText = '';
      if (typeof toastItem.message === 'string') {
        msgText = toastItem.message;
      } else if (toastItem.message && toastItem.message.props && typeof toastItem.message.props.children === 'string') {
        msgText = toastItem.message.props.children;
      }

      if (!msgText) return;

      if (toastItem.type === 'error') {
        const warningPhrases = [
          `That is okay, let us try again. ${msgText}`,
          `Please check details. ${msgText}`,
          `Don't worry, I can help you fix it. ${msgText}`
        ];
        const randomPhrase = warningPhrases[Math.floor(Math.random() * warningPhrases.length)];
        speak(randomPhrase);
      } else if (toastItem.type === 'success') {
        const successPhrases = [
          `Great job! ${msgText}`,
          `Nice work! ${msgText}`,
          `Excellent work! ${msgText}`,
          `You're doing fantastic! ${msgText}`
        ];
        const randomPhrase = successPhrases[Math.floor(Math.random() * successPhrases.length)];
        speak(randomPhrase);
      }
    });

    // Cleanup reference memory occasionally
    if (processedToastsRef.current.size > 100) {
      processedToastsRef.current.clear();
    }
  }, [toasts, isEnabled, settings.encouragement, speak]);

  // Background listening switch
  useEffect(() => {
    if (isEnabled && !isMuted && activeState !== 'speaking') {
      startListening();
    } else {
      stopListening();
    }
  }, [isEnabled, isMuted, activeState, startListening, stopListening]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      SpeechSynthesisService.cancel();
      SpeechRecognitionService.stop();
      UserProgressTracker.stop();
    };
  }, []);

  return (
    <VoiceContext.Provider value={{
      isEnabled,
      toggleEnabled,
      isMuted,
      setIsMuted,
      activeState,
      subtitle,
      isListening,
      settings,
      updateSettings,
      speak,
      stopSpeech,
      askAI,
      startListening,
      stopListening
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceAssistant = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};

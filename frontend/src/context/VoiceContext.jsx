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

// In-Memory Blended English + Kannada & Pure Kannada dictionary mapping for major syllabus subjects
const TRANSLATIONS = {
  // Advanced Java
  "Multithreading allows multiple threads to execute concurrently.": {
    kannada: "ಮಲ್ಟಿಥ್ರೆಡಿಂಗ್ ಎಂದರೆ ಒಂದೇ ಸಮಯದಲ್ಲಿ ಹಲವು ಥ್ರೆಡ್ಗಳನ್ನು ಕಾರ್ಯಗತಗೊಳಿಸುವ ವಿಧಾನ.",
    mixed: "Multithreading ಅಂದರೆ Java ನಲ್ಲಿ multiple threads ಅನ್ನು same time ನಲ್ಲಿ execute ಮಾಡುವ feature."
  },
  "Welcome. Today we will learn about Java Collections Framework.": {
    kannada: "ಸ್ವಾಗತ. ಇಂದು ನಾವು ಜಾವಾ ಕಲೆಕ್ಷನ್ಸ್ ಫ್ರೇಮ್‌ವರ್ಕ್ ಬಗ್ಗೆ ಕಲಿಯಲಿದ್ದೇವೆ.",
    mixed: "Welcome. ಇವತ್ತು ನಾವು Java Collections Framework ಬಗ್ಗೆ ಕಲಿಯೋಣ."
  },
  "The JDBC architecture consists of two layers: the JDBC API and the JDBC Driver API.": {
    kannada: "JDBC ಆರ್ಕಿಟೆಕ್ಚರ್ ಎರಡು ಪದರಗಳನ್ನು ಒಳಗೊಂಡಿದೆ: JDBC API ಮತ್ತು JDBC ಡ್ರೈವರ್ API.",
    mixed: "JDBC architecture ನಲ್ಲಿ ಎರಡು layers ಇರುತ್ತೆ: ಒಂದು JDBC API ಮತ್ತೆ ಇನ್ನೊಂದು JDBC Driver API."
  },
  "Variables are divided into Value Types stored on stack and Reference Types stored on heap.": {
    kannada: "ವೇರಿಯೇಬಲ್‌ಗಳನ್ನು ಸ್ಟ್ಯಾಕ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾದ ವ್ಯಾಲ್ಯೂ ಟೈಪ್ಸ್ ಮತ್ತು ಹೀಪ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾದ ರೆಫರೆನ್ಸ್ ಟೈಪ್ಸ್ ಎಂದು ವಿಂಗಡಿಸಲಾಗಿದೆ.",
    mixed: "Variables ಅಲ್ಲಿ ಎರಡು ವಿಧ: Stack ಅಲ್ಲಿ store ಆಗೋ Value Types ಮತ್ತೆ Heap ಅಲ್ಲಿ store ಆಗೋ Reference Types."
  },
  // Default fallback rules generator for dynamic texts
  fallback: (text, mode) => {
    if (mode === 'english') return text;
    
    // Simple rule-based translation to Kannada/Mixed for generic phrases if not hardcoded
    if (mode === 'kannada') {
      if (text.includes("Welcome")) return "EduVerse AI ಶಿಕ್ಷಕರಿಗೆ ಸ್ವಾಗತ. ನಾವು ಈಗ ಕಲಿಯೋಣ: " + text.replace(/Welcome\.?/i, "");
      return "ತಿಳುವಳಿಕೆ: " + text;
    }
    if (mode === 'mixed') {
      if (text.includes("Welcome")) return "Welcome back! ಇವತ್ತು ನಾವು ಕಲಿಯೋಣ: " + text.replace(/Welcome\.?/i, "");
      return text.split(' ').map(w => w.length > 6 ? w + ' ಅಂದರೆ' : w).join(' ').slice(0, 80) + " ವಿವರಣೆ.";
    }
    return text;
  }
};

export const VoiceAssistantProvider = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toasts } = useToasterStore();

  // Unified settings including new voice teacher parameters
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('voice_assistant_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      volume: parsed.volume !== undefined ? parsed.volume : 1,
      rate: parsed.rate !== undefined ? parsed.rate : 1.0,
      pitch: parsed.pitch !== undefined ? parsed.pitch : 1.0,
      provider: 'native', // Force native to guarantee built-in synthesis
      voiceURI: parsed.voiceURI || null,
      autoStart: parsed.autoStart !== undefined ? parsed.autoStart : true,
      encouragement: parsed.encouragement !== undefined ? parsed.encouragement : true,
      autoGuidance: parsed.autoGuidance !== undefined ? parsed.autoGuidance : true,
      languageMode: parsed.languageMode || 'mixed', // english, kannada, mixed, auto
      gender: parsed.gender || 'female',      // female, male
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

  // Lesson Narration Integration States
  const [currentNarratedText, setCurrentNarratedText] = useState('');
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(-1);
  const [transcriptHistory, setTranscriptHistory] = useState([]);
  const [currentCodeLine, setCurrentCodeLine] = useState(-1);

  // Stats / Progress tracking state
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('voice_teacher_stats');
    return savedStats ? JSON.parse(savedStats) : {
      lessonsCompleted: 0,
      listeningMinutes: 0,
      topicsExplainedCount: 0,
      quizAttempts: 0,
    };
  });

  const lastSpeechRef = useRef('');
  const processedToastsRef = useRef(new Set());
  const isEnabledRef = useRef(isEnabled);
  const settingsRef = useRef(settings);
  const isMutedRef = useRef(isMuted);

  // Sync refs to avoid dependency re-renders in callbacks
  useEffect(() => { isEnabledRef.current = isEnabled; }, [isEnabled]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

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

  // Language translation selector helper
  const getNarrativeText = useCallback((text, langMode) => {
    const targetMode = langMode || settingsRef.current.languageMode;
    if (targetMode === 'english') return text;
    
    // Look up hardcoded translation first
    const match = TRANSLATIONS[text];
    if (match) {
      if (targetMode === 'kannada') return match.kannada;
      if (targetMode === 'mixed') return match.mixed;
    }
    
    return TRANSLATIONS.fallback(text, targetMode);
  }, []);

  // Advanced speak function which automatically translates and chooses the correct browser voice
  const speak = useCallback((text, options = {}) => {
    if (!isEnabledRef.current || isMutedRef.current) return;

    // Apply translation mode
    const finalLanguage = options.langMode || settingsRef.current.languageMode;
    const translatedText = getNarrativeText(text, finalLanguage);

    lastSpeechRef.current = text;
    setSubtitle(translatedText);
    setCurrentNarratedText(translatedText);
    if (options.paragraphIdx !== undefined) {
      setActiveParagraphIndex(options.paragraphIdx);
    }

    // Auto-scroll any highlighted elements
    setTimeout(() => {
      const activeEl = document.querySelector('.active-narrated-paragraph');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Set voice configuration dynamically
    const synthesisConfig = {
      volume: settingsRef.current.volume,
      rate: settingsRef.current.rate,
      pitch: settingsRef.current.pitch,
      provider: 'native',
      voiceURI: settingsRef.current.voiceURI
    };

    // Autoselect Kannada voice or English voice based on contents/languageMode
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      let matchedVoice = null;

      if (finalLanguage === 'kannada' || (finalLanguage === 'mixed' && translatedText.match(/[\u0c80-\u0cff]/))) {
        matchedVoice = voices.find(v => v.lang.startsWith('kn') || v.name.includes('Kannada'));
      }

      if (!matchedVoice) {
        // Fallback to configured gender preference
        const genderWord = settingsRef.current.gender === 'male' ? 'Male' : 'Female';
        matchedVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes(genderWord) || v.name.includes('Zira') || v.name.includes('David')));
      }

      if (matchedVoice) {
        synthesisConfig.voiceURI = matchedVoice.voiceURI;
      }
    }

    SpeechSynthesisService.speak(
      translatedText,
      synthesisConfig,
      () => {
        setActiveState('speaking');
        // Update Explained Topics Statistics
        setStats(prev => {
          const next = { ...prev, topicsExplainedCount: prev.topicsExplainedCount + 1 };
          localStorage.setItem('voice_teacher_stats', JSON.stringify(next));
          return next;
        });
      },
      () => {
        setActiveState('idle');
        setSubtitle('');
        if (options.onEnd) options.onEnd();
      },
      (err) => {
        console.error('Speech synthesis error:', err);
        setActiveState('idle');
        setSubtitle('');
        if (options.onEnd) {
          // Advance slide step even if speech synthesis is blocked by browser policies
          options.onEnd();
        }
      }
    );
  }, [getNarrativeText]);

  const stopSpeech = useCallback(() => {
    SpeechSynthesisService.cancel();
    setActiveState('idle');
    setSubtitle('');
    setCurrentNarratedText('');
    setActiveParagraphIndex(-1);
  }, []);

  // Web query LLM fallback
  const askAI = useCallback(async (question) => {
    if (!isEnabledRef.current) return;
    
    setActiveState('thinking');
    setSubtitle('AI Teacher is thinking...');
    
    try {
      const websiteContext = `
You are the EDUVERSE AI Voice Teacher. 
The student is asking: "${question}".
Provide a friendly, helpful, and concise response in 1 to 2 sentences. Include mixed English/Kannada terms where helpful.
`;
      const payload = {
        message: websiteContext,
        mode: 'doubt',
        subject: 'EDUVERSE Core'
      };
      
      const { data } = await api.post('/ai/chat', payload);
      speak(data.response);
    } catch (err) {
      speak("I encountered an issue connecting to my core brain. Please try again.");
    }
  }, [speak]);

  // Voice Command parser with full syllabus controller functions
  const executeVoiceCommand = useCallback((transcript) => {
    const text = transcript.toLowerCase().trim();
    setTranscriptHistory(prev => [transcript, ...prev].slice(0, 10));

    // Custom handlers for floating controls
    const actions = {
      navigate: (path) => navigate(path),
      explain: () => {
        const guide = getPageGuide(location.pathname);
        speak(guide.explanation);
      },
      next: () => {
        const nextBtn = document.querySelector('button[aria-label="Next"], button:contains("Next")') || document.querySelector('.smart-tv-next-btn');
        if (nextBtn) {
          nextBtn.click();
          speak("Opening next topic.");
        } else {
          speak("No further steps found.");
        }
      },
      back: () => {
        navigate(-1);
        speak("Going back.");
      },
      repeat: () => {
        if (lastSpeechRef.current) {
          speak(lastSpeechRef.current);
        }
      },
      stop: () => {
        stopSpeech();
        speak("Stopped.");
      },
      continue: () => {
        if (lastSpeechRef.current) {
          speak(lastSpeechRef.current);
        }
      }
    };

    // 1. Check custom commands
    if (text.includes("slow down")) {
      const newRate = Math.max(0.6, settingsRef.current.rate - 0.2);
      updateSettings({ rate: parseFloat(newRate.toFixed(1)) });
      speak("Slowing down speech rate.");
      return;
    }
    if (text.includes("speak faster") || text.includes("talk faster")) {
      const newRate = Math.min(2.0, settingsRef.current.rate + 0.2);
      updateSettings({ rate: parseFloat(newRate.toFixed(1)) });
      speak("Increasing speech rate.");
      return;
    }
    if (text.includes("explain in kannada") || text.includes("kannada details")) {
      updateSettings({ languageMode: 'kannada' });
      speak("ಕನ್ನಡ ವಿವರಣೆ ನೀಡಲಾಗುವುದು.");
      return;
    }
    if (text.includes("explain in english")) {
      updateSettings({ languageMode: 'english' });
      speak("Switching to English explanation mode.");
      return;
    }
    if (text.includes("explain in mixed") || text.includes("kannada and english")) {
      updateSettings({ languageMode: 'mixed' });
      speak("Switching to English plus Kannada mixed mode.");
      return;
    }
    if (text.includes("give example") || text.includes("example please")) {
      const exampleBtn = document.querySelector('button:contains("Example"), button:contains("example")') || document.querySelector('[data-coach="example"]');
      if (exampleBtn) {
        exampleBtn.click();
      } else {
        speak("Sure, let me generate a C# or Java code example for this conceptual model.");
      }
      return;
    }
    if (text.includes("ask quiz") || text.includes("start quiz")) {
      const quizBtn = document.querySelector('button:contains("Quiz"), button:contains("quiz")') || document.querySelector('[data-tab="quiz"]');
      if (quizBtn) quizBtn.click();
      speak("Loading chapter assessment quiz for you.");
      return;
    }
    if (text.includes("interview mode")) {
      speak("Activating AI mock interview session. Please listen to the questions and speak your response clearly.");
      navigate('/career-hub');
      return;
    }

    const result = VoiceCommandParser.parse(transcript, actions);
    if (!result) {
      askAI(transcript);
    }
  }, [navigate, location.pathname, speak, stopSpeech, askAI, updateSettings]);

  // Start Recognition loops
  const startListening = useCallback(() => {
    if (!isEnabledRef.current) return;
    
    // Set recognition language based on settings
    const lang = settingsRef.current.languageMode === 'kannada' ? 'kn-IN' : 'en-IN';
    SpeechRecognitionService.recognition = null; // Force refresh config lang
    
    SpeechRecognitionService.start(
      (text) => {
        setSubtitle(`Heard: "${text}"`);
        executeVoiceCommand(text);
      },
      () => {
        setIsListening(false);
        if (isEnabledRef.current && !isMutedRef.current) {
          setTimeout(() => {
            if (isEnabledRef.current && !isMutedRef.current && activeState !== 'speaking') {
              startListening();
            }
          }, 1000);
        }
      },
      (err) => {
        setIsListening(false);
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          console.warn('Speech recognition permission denied or disabled:', err);
          setIsEnabled(false);
          isEnabledRef.current = false;
          SpeechRecognitionService.stop();
        }
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

  // Inactivity guide
  useEffect(() => {
    if (!isEnabled) return;
    UserProgressTracker.stop();
    UserProgressTracker.start(() => {
      speak("Need any assistance with this chapter? Just speak out loud to let me know!");
    }, 60000);

    if (settings.autoGuidance) {
      const guide = getPageGuide(location.pathname);
      const timeout = setTimeout(() => {
        speak(guide.welcome);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, isEnabled, settings.autoGuidance, speak]);

  // Track listening stats duration
  useEffect(() => {
    if (!isEnabled || activeState !== 'speaking') return;
    const interval = setInterval(() => {
      setStats(prev => {
        const next = { ...prev, listeningMinutes: prev.listeningMinutes + 0.1 };
        localStorage.setItem('voice_teacher_stats', JSON.stringify(next));
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isEnabled, activeState]);

  // Loop restart logic
  useEffect(() => {
    if (isEnabled && !isMuted && activeState !== 'speaking') {
      startListening();
    } else {
      stopListening();
    }
  }, [isEnabled, isMuted, activeState, startListening, stopListening]);

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
      stopListening,
      activeParagraphIndex,
      setActiveParagraphIndex,
      currentNarratedText,
      currentCodeLine,
      setCurrentCodeLine,
      stats,
      transcriptHistory,
      getNarrativeText
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

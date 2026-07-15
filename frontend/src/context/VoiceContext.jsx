/**
 * EduVerse Command AI — VoiceContext Shim
 * Delegates calls to the new CommandAIProvider for complete backwards compatibility.
 */

import { createContext, useContext } from 'react';
import { CommandAIProvider, useCommandAI } from './CommandAIContext';

const VoiceContext = createContext(null);

export const VoiceAssistantProvider = ({ children }) => {
  return (
    <CommandAIProvider>
      <VoiceAssistantWrapper>{children}</VoiceAssistantWrapper>
    </CommandAIProvider>
  );
};

const VoiceAssistantWrapper = ({ children }) => {
  const cmd = useCommandAI();

  const legacyValue = {
    isEnabled: cmd.isWakeEnabled,
    toggleEnabled: () => cmd.setIsWakeEnabled(!cmd.isWakeEnabled),
    isMuted: false,
    setIsMuted: () => {},
    activeState: cmd.activeState,
    subtitle: cmd.transcript,
    isListening: cmd.activeState === 'listening',
    settings: {
      volume: cmd.volume,
      rate: cmd.rate,
      pitch: cmd.pitch,
      provider: 'native',
      voiceURI: null,
      autoStart: true,
      encouragement: true,
      autoGuidance: true,
      languageMode: 'english',
      gender: 'female'
    },
    updateSettings: (s) => {
      if (s.volume !== undefined) cmd.setVolume(s.volume);
      if (s.rate !== undefined) cmd.setRate(s.rate);
      if (s.pitch !== undefined) cmd.setPitch(s.pitch);
    },
    speak: (text) => cmd.speak(text),
    stopSpeech: () => window.speechSynthesis.cancel(),
    askAI: (text) => cmd.executeCommand(text),
    startListening: () => cmd.startListening(),
    stopListening: () => window.speechSynthesis.cancel(),
    activeParagraphIndex: -1,
    setActiveParagraphIndex: () => {},
    currentNarratedText: '',
    currentCodeLine: -1,
    setCurrentCodeLine: () => {},
    stats: {
      lessonsCompleted: 0,
      listeningMinutes: 0,
      topicsExplainedCount: 0,
      quizAttempts: 0
    },
    transcriptHistory: [],
    getNarrativeText: (text) => text
  };

  return (
    <VoiceContext.Provider value={legacyValue}>
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
export default VoiceContext;

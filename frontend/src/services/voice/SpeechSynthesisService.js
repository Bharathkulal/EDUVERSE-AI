// Speech Synthesis Abstraction Layer
// Supports native Web Speech Synthesis and Cloud Voice Providers

export const CloudVoiceProviders = {
  elevenlabs: async (text, settings) => {
    console.log(`[ElevenLabs TTS] Speaking: "${text}" with settings:`, settings);
    // In a production environment, this would call ElevenLabs API (or a proxy endpoint)
    return new Promise((resolve) => setTimeout(resolve, 2000));
  },
  azure: async (text, settings) => {
    console.log(`[Azure Speech TTS] Speaking: "${text}" with settings:`, settings);
    return new Promise((resolve) => setTimeout(resolve, 2000));
  },
  google: async (text, settings) => {
    console.log(`[Google Cloud TTS] Speaking: "${text}" with settings:`, settings);
    return new Promise((resolve) => setTimeout(resolve, 2000));
  },
  polly: async (text, settings) => {
    console.log(`[Amazon Polly TTS] Speaking: "${text}" with settings:`, settings);
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }
};

class SpeechSynthesisService {
  constructor() {
    this.currentUtterance = null;
    this.cloudAudio = null;
  }

  cancel() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.cloudAudio) {
      this.cloudAudio.pause();
      this.cloudAudio = null;
    }
  }

  async speak(text, settings = {}, onStart = () => {}, onEnd = () => {}, onError = () => {}) {
    this.cancel();

    const provider = settings.provider || 'native';
    const volume = settings.volume !== undefined ? settings.volume : 1;
    const rate = settings.rate !== undefined ? settings.rate : 1;
    const pitch = settings.pitch !== undefined ? settings.pitch : 1;
    const voiceURI = settings.voiceURI || null;
    const forceLanguage = settings.forceLanguage || null;

    if (provider !== 'native' && CloudVoiceProviders[provider]) {
      onStart();
      try {
        await CloudVoiceProviders[provider](text, { volume, rate, pitch });
        onEnd();
      } catch (err) {
        console.error(`${provider} TTS failed:`, err);
        onError(err);
        // Fallback to native on failure
        this.speakNative(text, { volume, rate, pitch, voiceURI, forceLanguage }, onStart, onEnd, onError);
      }
      return;
    }

    this.speakNative(text, { volume, rate, pitch, voiceURI, forceLanguage }, onStart, onEnd, onError);
  }

  speakNative(text, config, onStart, onEnd, onError) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      onError(new Error('Speech synthesis not supported'));
      return;
    }

    // Clean formatting patterns (bold, italics, headers) from text
    const cleanText = text
      .replace(/[*#`_\-]/g, '')
      .replace(/\[.*\]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.volume = config.volume;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;

    // Find and set voice & language lang code
    if (config.voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const selected = voices.find(v => v.voiceURI === config.voiceURI);
      if (selected) {
        utterance.voice = selected;
        utterance.lang = selected.lang;
      }
    } else if (config.forceLanguage) {
      utterance.lang = config.forceLanguage;
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(config.forceLanguage.slice(0, 2)) || v.name.toLowerCase().includes('kannada'));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    } else {
      const voices = window.speechSynthesis.getVoices();
      
      // Auto-detect based on text range
      if (cleanText.match(/[\u0c80-\u0cff]/)) {
        utterance.lang = 'kn-IN';
      } else {
        utterance.lang = 'en-IN'; // Standard fallback
      }
      
      const defaultVoice = voices.find(
        (v) => v.lang.startsWith(utterance.lang.slice(0, 2)) || v.name.toLowerCase().includes('kannada')
      );
      if (defaultVoice) {
        utterance.voice = defaultVoice;
        utterance.lang = defaultVoice.lang; // Force lang code to match the voice to prevent silent errors
      } else if (!cleanText.match(/[\u0c80-\u0cff]/)) {
        utterance.lang = 'en-US'; // Absolute safest fallback for English only
      }
    }

    utterance.onstart = onStart;
    utterance.onend = onEnd;
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') {
        onError(e);
      } else {
        onEnd();
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.resume(); // Fix Chrome/Edge speech synthesis pause bug
    window.speechSynthesis.speak(utterance);
  }
}

export default new SpeechSynthesisService();

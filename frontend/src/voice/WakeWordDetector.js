/**
 * EduVerse Command AI — Wake Word Detector
 * Lightweight browser-native wake word detector using continuous Web Speech Recognition.
 * Listens for "Hey EduVerse", "Hello EduVerse", or "EduVerse" and triggers activation callback.
 */

import { detectWakeWord } from './IntentEngine';

export class WakeWordDetector {
  /**
   * @param {Object} options
   * @param {() => void} options.onWake - Fired when wake word is detected
   * @param {(text: string) => void} [options.onTranscript] - Fired with intermediate transcripts
   * @param {(err: string) => void} [options.onError] - Fired on speech API errors
   */
  constructor(options) {
    this.onWake = options.onWake;
    this.onTranscript = options.onTranscript;
    this.onError = options.onError;
    this.recognition = null;
    this.isListening = false;
  }

  start() {
    if (this.isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (this.onError) this.onError('SpeechRecognition not supported in this browser.');
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        this.isListening = true;
      };

      rec.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullTranscript = (finalTranscript || interimTranscript).toLowerCase().trim();
        if (this.onTranscript) {
          this.onTranscript(fullTranscript);
        }

        // Run wake word scan
        const detection = detectWakeWord(fullTranscript);
        if (detection.detected) {
          this.onWake();
          this.stop(); // Temporarily stop wake word detector while voice OS resolves command
        }
      };

      rec.onerror = (event) => {
        if (event.error === 'no-speech') return; // ignore silence errors
        if (this.onError) this.onError(event.error);
      };

      rec.onend = () => {
        this.isListening = false;
        // Auto-restart if we should be continuously listening for wake word
        if (this.shouldRestart) {
          this.start();
        }
      };

      this.shouldRestart = true;
      this.recognition = rec;
      this.recognition.start();
    } catch (e) {
      if (this.onError) this.onError(e.message);
    }
  }

  stop() {
    this.shouldRestart = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.isListening = false;
  }
}
export default WakeWordDetector;

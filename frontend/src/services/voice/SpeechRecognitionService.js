// Speech Recognition Abstraction Layer

class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.active = false;
  }

  init(onResult, onEnd, onError) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser.');
      return false;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      const current = event.resultIndex;
      const resultText = event.results[current][0].transcript;
      onResult(resultText);
    };

    rec.onend = () => {
      this.active = false;
      onEnd();
    };

    rec.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error);
        onError(event.error);
      }
    };

    this.recognition = rec;
    return true;
  }

  start(onResult, onEnd, onError) {
    if (this.active) return;
    
    if (!this.recognition) {
      const success = this.init(onResult, onEnd, onError);
      if (!success) return;
    } else {
      // Re-bind callbacks to capture current state/context updates
      this.recognition.onresult = (event) => {
        const current = event.resultIndex;
        const resultText = event.results[current][0].transcript;
        onResult(resultText);
      };
      this.recognition.onend = () => {
        this.active = false;
        onEnd();
      };
      this.recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          onError(event.error);
        }
      };
    }

    try {
      this.recognition.start();
      this.active = true;
    } catch (e) {
      console.warn('Speech recognition start exception:', e.message);
    }
  }

  stop() {
    if (!this.active || !this.recognition) return;
    try {
      this.recognition.stop();
      this.active = false;
    } catch (e) {
      console.error('Speech recognition stop exception:', e.message);
    }
  }
}

export default new SpeechRecognitionService();

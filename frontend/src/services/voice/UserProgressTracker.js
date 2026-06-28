// User Inactivity and Stuck-State Tracker

class UserProgressTracker {
  constructor() {
    this.timer = null;
    this.onStuckCallback = null;
    this.timeoutMs = 30000; // 30 seconds default
    this.active = false;

    this.handleInteraction = this.handleInteraction.bind(this);
  }

  start(onStuck, timeoutMs = 30000) {
    this.onStuckCallback = onStuck;
    this.timeoutMs = timeoutMs;
    this.active = true;

    this.attachListeners();
    this.resetTimer();
  }

  stop() {
    this.active = false;
    this.clearTimer();
    this.detachListeners();
  }

  resetTimer() {
    if (!this.active) return;
    this.clearTimer();
    this.timer = setTimeout(() => {
      if (this.onStuckCallback) {
        this.onStuckCallback();
      }
    }, this.timeoutMs);
  }

  clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  handleInteraction() {
    this.resetTimer();
  }

  attachListeners() {
    window.addEventListener('click', this.handleInteraction);
    window.addEventListener('keydown', this.handleInteraction);
    window.addEventListener('scroll', this.handleInteraction);
    window.addEventListener('touchstart', this.handleInteraction);
  }

  detachListeners() {
    window.removeEventListener('click', this.handleInteraction);
    window.removeEventListener('keydown', this.handleInteraction);
    window.removeEventListener('scroll', this.handleInteraction);
    window.removeEventListener('touchstart', this.handleInteraction);
  }
}

export default new UserProgressTracker();

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { Star, Heart } from 'lucide-react';

const RATING_TEXTS = {
  1: '⭐ Poor',
  2: '⭐⭐ Fair',
  3: '⭐⭐⭐ Good',
  4: '⭐⭐⭐⭐ Very Good',
  5: '⭐⭐⭐⭐⭐ Excellent',
};

// Pure CSS Confetti Component
function ConfettiParticles() {
  const particles = Array.from({ length: 60 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[200]">
      {particles.map((_, i) => {
        const left = Math.random() * 100; // %
        const delay = Math.random() * 3; // s
        const duration = Math.random() * 2 + 2; // s
        const size = Math.random() * 8 + 6; // px
        const color = ['#FFC107', '#E91E63', '#9C27B0', '#00BCD4', '#4CAF50', '#FF5722'][Math.floor(Math.random() * 6)];
        
        return (
          <div
            key={i}
            className="absolute top-0 rounded-full animate-fall"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        );
      })}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}

export default function ReviewPopup() {
  const { user } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const feedbackRef = useRef(null);
  const suggestionRef = useRef(null);
  const activeTimeRef = useRef(0);
  const lastActiveRef = useRef(Date.now());
  const localSubmittedRef = useRef(false);

  // 1. Tracks user activity & time
  useEffect(() => {
    if (!user || user.role === 'admin' || user.review_submitted || localSubmittedRef.current) return;

    // Load saved active time
    const userId = user.id;
    const storedTime = localStorage.getItem(`eduverse_review_active_time_${userId}`);
    activeTimeRef.current = storedTime ? parseInt(storedTime, 10) : 0;

    // Listeners to detect active usage (idle check)
    const handleActivity = () => {
      lastActiveRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    // Active usage timer
    const interval = setInterval(() => {
      // If user was active within last 60 seconds, increment active time
      const timeSinceLastActive = Date.now() - lastActiveRef.current;
      if (timeSinceLastActive < 60000) {
        activeTimeRef.current += 1;
        localStorage.setItem(`eduverse_review_active_time_${userId}`, activeTimeRef.current.toString());

        // Check if 10 minutes (600 seconds) have passed
        const targetTime = 600;
        const postponedTimeStr = localStorage.getItem(`eduverse_review_postponed_at_${userId}`);
        
        let show = false;
        if (!postponedTimeStr) {
          // First time review trigger
          if (activeTimeRef.current >= targetTime) {
            show = true;
          }
        } else {
          // Re-trigger review after 5 minutes (300 seconds) of additional active time
          const postponedAt = parseInt(postponedTimeStr, 10);
          if (activeTimeRef.current >= postponedAt + 300) {
            show = true;
          }
        }

        if (show && !showPopup && !submitted) {
          setShowPopup(true);
        }
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(interval);
    };
  }, [user, showPopup, submitted]);

  // Handle textarea auto-resize
  useEffect(() => {
    if (feedbackRef.current) {
      feedbackRef.current.style.height = 'auto';
      feedbackRef.current.style.height = `${feedbackRef.current.scrollHeight}px`;
    }
  }, [feedback]);

  useEffect(() => {
    if (suggestionRef.current) {
      suggestionRef.current.style.height = 'auto';
      suggestionRef.current.style.height = `${suggestionRef.current.scrollHeight}px`;
    }
  }, [suggestion]);

  if (!user || user.role === 'admin' || user.review_submitted || localSubmittedRef.current) return null;

  const handlePostpone = () => {
    const userId = user.id;
    // Postpone and record active time to count next 5 active minutes
    localStorage.setItem(`eduverse_review_postponed_at_${userId}`, activeTimeRef.current.toString());
    setShowPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !feedback.trim()) return;

    setLoading(true);

    // Get system details
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    if (ua.includes('Firefox')) browserName = 'Mozilla Firefox';
    else if (ua.includes('SamsungBrowser')) browserName = 'Samsung Internet';
    else if (ua.includes('Opera') || ua.includes('OPR')) browserName = 'Opera';
    else if (ua.includes('Trident')) browserName = 'Internet Explorer';
    else if (ua.includes('Edge')) browserName = 'Microsoft Edge';
    else if (ua.includes('Chrome')) browserName = 'Google Chrome';
    else if (ua.includes('Safari')) browserName = 'Safari';

    let osName = 'Unknown';
    if (ua.includes('Windows')) osName = 'Windows';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) osName = 'macOS';
    else if (ua.includes('Android')) osName = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';
    else if (ua.includes('Linux')) osName = 'Linux';

    let deviceType = 'Desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      deviceType = 'Mobile';
    }
    if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua.toLowerCase())) {
      deviceType = 'Tablet';
    }

    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || 'en';

    // Best effort country extraction based on timezone / language, default to timezone prefix
    const country = timezone.split('/')[0] || 'Unknown';

    try {
      await api.post('/reviews', {
        rating,
        feedback,
        suggestion,
        timezone,
        browser: browserName,
        operatingSystem: osName,
        deviceType,
        screenResolution,
        language,
        country,
        activeUsageTime: activeTimeRef.current,
        appVersion: '1.0.0',
        reviewVersion: '1.0.0'
      });

      // Update auth context locally & set submit flag
      user.review_submitted = true;
      localStorage.setItem('user', JSON.stringify(user));
      localSubmittedRef.current = true;
      
      setSubmitted(true);

      // Automatically close after 4 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          {submitted && <ConfettiParticles />}

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative"
            style={{
              background: 'var(--db-card-bg)',
              color: 'var(--db-text-main)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
          >
            {/* Header background glow */}
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl pointer-events-none" />

            <div className="p-6 md:p-8 flex flex-col justify-between h-full">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title & Description */}
                  <div className="text-center">
                    <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--db-text-main)' }}>
                      ⭐ Enjoying EDUVERSE AI?
                    </h2>
                    <p className="text-xs text-[var(--db-text-muted)] mt-2">
                      Your opinion helps us improve EDUVERSE AI for everyone. Please rate your experience and share your thoughts.
                    </p>
                  </div>

                  {/* Stars Section */}
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (hoverRating || rating);
                        return (
                          <motion.button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            whileHover={{ scale: 1.25 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1 focus:outline-none cursor-pointer"
                          >
                            <Star
                              className={`w-9 h-9 transition-all duration-300 ${
                                isFilled
                                  ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                                  : 'text-slate-400 hover:text-amber-300'
                              }`}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                    {/* Selected Rating Label */}
                    <div className="h-6 flex items-center">
                      {(rating || hoverRating) ? (
                        <motion.span
                          key={rating || hoverRating}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs font-extrabold uppercase tracking-widest text-amber-500"
                        >
                          {RATING_TEXTS[hoverRating || rating]}
                        </motion.span>
                      ) : (
                        <span className="text-[11px] text-[var(--db-text-muted)] italic font-semibold">Select a star rating</span>
                      )}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-4">
                    {/* Feedback (Compulsory) */}
                    <div className="relative">
                      <textarea
                        ref={feedbackRef}
                        rows={3}
                        maxLength={1000}
                        placeholder="Tell us about your experience..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] placeholder-[var(--db-text-muted)] text-xs rounded-2xl py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200 resize-none overflow-hidden max-h-40"
                        required
                      />
                      <div className="absolute right-3.5 bottom-2 flex justify-between items-center text-[9px] text-[var(--db-text-muted)] font-bold pointer-events-none">
                        <span>{feedback.length}/1000</span>
                      </div>
                    </div>

                    {/* Suggestion (Optional) */}
                    <div className="relative">
                      <textarea
                        ref={suggestionRef}
                        rows={2}
                        maxLength={1000}
                        placeholder="Any suggestions to improve EDUVERSE AI?"
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        className="w-full bg-[var(--db-input-bg)] border border-[var(--db-input-border)] text-[var(--db-text-main)] placeholder-[var(--db-text-muted)] text-xs rounded-2xl py-3 px-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200 resize-none overflow-hidden max-h-40"
                      />
                      <div className="absolute right-3.5 bottom-2 flex justify-between items-center text-[9px] text-[var(--db-text-muted)] font-bold pointer-events-none">
                        <span>{suggestion.length}/1000</span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePostpone}
                      className="flex-1 py-3 px-4 border border-[var(--db-input-border)] rounded-2xl text-xs font-bold transition hover:bg-[var(--db-btn-secondary-hover)] cursor-pointer"
                      style={{ color: 'var(--db-text-main)' }}
                    >
                      Later
                    </button>

                    <button
                      type="submit"
                      disabled={!rating || !feedback.trim() || loading}
                      className="flex-1 py-3 px-4 rounded-2xl text-xs font-black text-white transition duration-200 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                      }}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Review</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-4"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"
                  >
                    <Heart className="w-8 h-8 fill-red-500" />
                  </motion.div>
                  <h2 className="text-3xl font-black tracking-tight text-white">
                    ❤️ Thank You!
                  </h2>
                  <p className="text-xs text-[var(--db-text-muted)] max-w-sm">
                    Your feedback helps us make EDUVERSE AI better. We have logged your opinion and will analyze it immediately.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

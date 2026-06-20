import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function TypewriterStep({ text, onComplete, isActive, speed = 1, isMath = true, forceShowFullText }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const hasCalledComplete = useRef(false);

  // Reset when text changes (e.g., on replay)
  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;
    hasCalledComplete.current = false;
  }, [text]);

  useEffect(() => {
    // If we want to immediately force display of the full text (past steps)
    if (forceShowFullText) {
      setDisplayedText(text);
      setIsComplete(true);
      if (!hasCalledComplete.current && onComplete) {
        hasCalledComplete.current = true;
        onComplete();
      }
      return;
    }

    // If this step is NOT active but WAS already completed, show full text
    if (!isActive && isComplete) return;
    
    // If not active and not complete, show nothing (waiting to start)
    if (!isActive) return;

    // If already at the end, mark complete
    if (indexRef.current >= text.length) {
      setIsComplete(true);
      setDisplayedText(text);
      if (!hasCalledComplete.current && onComplete) {
        hasCalledComplete.current = true;
        onComplete();
      }
      return;
    }

    const baseDelay = (Math.random() * 25 + 8) / speed;
    const timeout = setTimeout(() => {
      indexRef.current += 1;
      setDisplayedText(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        setIsComplete(true);
        if (!hasCalledComplete.current && onComplete) {
          hasCalledComplete.current = true;
          onComplete();
        }
      }
    }, baseDelay);

    return () => clearTimeout(timeout);
  }, [isActive, displayedText, text, speed, onComplete, isComplete, forceShowFullText]);

  // When step has already been passed, render full text immediately
  const showFullText = forceShowFullText || (!isActive && isComplete);

  // Render newlines as <br/> or use whitespace pre-wrap
  const renderText = showFullText ? text : displayedText;

  return (
    <div className={`relative whitespace-pre-wrap ${isMath ? 'font-mono text-[15px] leading-relaxed text-emerald-900 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/60 shadow-sm' : 'text-slate-700 text-[15px] leading-relaxed'}`}>
      <span>{renderText}</span>
      {isActive && !isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="inline-block w-[2px] h-[1.1em] bg-emerald-500 ml-[2px] align-text-bottom"
        />
      )}
    </div>
  );
}

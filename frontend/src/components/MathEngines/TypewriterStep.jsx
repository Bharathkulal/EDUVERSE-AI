import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function TypewriterStep({ text, onComplete, isActive, speed = 1, isMath = true, forceShowFullText }) {
  const lines = useMemo(() => text.split('\n'), [text]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  
  const hasCalledComplete = useRef(false);
  const containerRef = useRef(null);

  // Reset when text changes (e.g. on replay)
  useEffect(() => {
    setCurrentLineIndex(0);
    setCharIndex(0);
    setDisplayedLines(Array(lines.length).fill(''));
    setIsComplete(false);
    hasCalledComplete.current = false;
  }, [text, lines]);

  // Handle immediate show (skip / complete)
  useEffect(() => {
    if (forceShowFullText) {
      setDisplayedLines(lines);
      setCurrentLineIndex(lines.length);
      setIsComplete(true);
      if (!hasCalledComplete.current && onComplete) {
        hasCalledComplete.current = true;
        onComplete();
      }
    }
  }, [forceShowFullText, lines, onComplete]);

  // Main typing loop
  useEffect(() => {
    if (forceShowFullText || !isActive || isComplete) return;

    const currentLineText = lines[currentLineIndex] || '';

    // If character typing is finished for the current line
    if (charIndex >= currentLineText.length) {
      // Pause at the end of the line before going to the next line
      const linePauseDelay = 400 / speed;
      const pauseTimeout = setTimeout(() => {
        if (currentLineIndex + 1 < lines.length) {
          setCharIndex(0);
          setCurrentLineIndex(prev => prev + 1);
        } else {
          setIsComplete(true);
          if (!hasCalledComplete.current && onComplete) {
            hasCalledComplete.current = true;
            onComplete();
          }
        }
      }, linePauseDelay);

      return () => clearTimeout(pauseTimeout);
    }

    // Type next character
    const charDelay = 30 / speed;
    const charTimeout = setTimeout(() => {
      setDisplayedLines(prev => {
        const next = [...prev];
        next[currentLineIndex] = currentLineText.slice(0, charIndex + 1);
        return next;
      });
      setCharIndex(prev => prev + 1);
    }, charDelay);

    return () => clearTimeout(charTimeout);
  }, [isActive, isComplete, currentLineIndex, charIndex, lines, speed, onComplete, forceShowFullText]);

  // Auto-scroll logic to center the active typing line
  useEffect(() => {
    if (containerRef.current && isActive && !isComplete) {
      const activeEl = containerRef.current.querySelector('.active-writing-line');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentLineIndex, displayedLines, isActive, isComplete]);

  return (
    <div 
      ref={containerRef}
      className={`relative flex flex-col gap-2 w-full transition-all duration-300 ${
        isMath 
          ? 'font-mono text-[15px] leading-relaxed text-[var(--db-math-text)] bg-[var(--db-math-bg)] p-5 rounded-xl border border-[var(--db-math-border)] shadow-sm' 
          : 'text-[var(--db-text-main)] text-[15px] leading-relaxed'
      }`}
    >
      {lines.map((originalLine, idx) => {
        const isPast = idx < currentLineIndex;
        const isCurrent = idx === currentLineIndex;
        const isFuture = idx > currentLineIndex;

        // Skip rendering future lines to simulate live writing
        if (isFuture && !forceShowFullText) return null;

        const displayText = forceShowFullText || isPast ? originalLine : (displayedLines[idx] || '');

        return (
          <div 
            key={idx}
            className={`min-h-[1.5em] transition-all duration-500 flex items-center flex-wrap ${
              isCurrent && !isComplete
                ? `active-writing-line opacity-100 font-semibold scale-[1.01] origin-left ${isMath ? 'text-[var(--db-math-text)]' : 'text-[var(--db-text-main)]'}` 
                : isComplete || forceShowFullText
                  ? `opacity-100 ${isMath ? 'text-[var(--db-math-text)]' : 'text-[var(--db-text-main)]'}`
                  : 'opacity-40 text-slate-400 dark:text-slate-600'
            }`}
          >
            <span>{displayText}</span>
            {isCurrent && !isComplete && !forceShowFullText && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="inline-block w-2.5 h-[1.1em] bg-emerald-500 dark:bg-emerald-400 ml-[3px] align-text-bottom shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

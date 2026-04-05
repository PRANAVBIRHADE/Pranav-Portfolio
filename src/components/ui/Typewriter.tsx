'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({ text, speed = 30, delay = 0, className = '', onComplete }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsStarted(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;
    
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isStarted, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-[2px] h-[1em] bg-cyan-400 ml-1 align-middle"
      />
    </span>
  );
}

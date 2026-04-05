'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEngineStore } from '@/store/useEngineStore';
import { ReactNode } from 'react';

interface HolographicPanelProps {
  children: ReactNode;
  visible?: boolean;
  className?: string;
}

export default function HolographicPanel({ children, visible = true, className = "" }: HolographicPanelProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
           initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
           animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
           exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className={`relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl ${className}`}
        >
          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
          
          <div className="relative z-10">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

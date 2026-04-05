'use client';

import { motion } from 'framer-motion';
import { useEngineStore } from '@/store/useEngineStore';
import { Home } from 'lucide-react';

export function HomeDiamond() {
  const { activeSection, setActiveSection } = useEngineStore();

  if (activeSection === 'HOME') return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0, rotate: -45 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0, rotate: 45 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setActiveSection('HOME')}
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] group pointer-events-auto"
    >
      <div className="relative flex items-center justify-center w-20 h-20">
        {/* Outer Rotating Diamond Ring */}
        <div className="absolute inset-0 border border-cyan-500/20 rotate-45 group-hover:rotate-[135deg] transition-transform duration-1000" />
        
        {/* Middle Pulsating Diamond */}
        <div className="absolute inset-2 bg-cyan-500/5 border border-cyan-500/80 rotate-45 backdrop-blur-xl group-hover:bg-cyan-500/20 transition-all duration-500" />
        
        {/* Inner Tech Ring (Pulsing) */}
        <div className="absolute inset-4 border-2 border-dashed border-cyan-400/40 rotate-45 animate-[spin_10s_linear_infinite]" />
        
        {/* The Icon */}
        <div className="relative z-10 flex flex-col items-center">
            <Home className="w-6 h-6 text-cyan-400 group-hover:text-white transition-colors" />
            <span className="mt-1 text-[8px] font-mono text-cyan-500/60 font-black tracking-widest group-hover:text-cyan-400">HOME</span>
        </div>

        {/* Floating Scanline */}
        <div className="absolute inset-0 overflow-hidden rotate-45">
            <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-[scan_2s_linear_infinite]" />
        </div>
      </div>
    </motion.button>
  );
}

'use client';

import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useEngineStore } from '@/store/useEngineStore';

export function HomeHero() {
  const { activeSection, scene, isTransitioning } = useEngineStore();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-500, 500], [15, -15]);
  const rotateY = useTransform(mouseX, [-500, 500], [-15, 15]);

  if (scene !== 'INTERFACE' || activeSection !== 'HOME') return null;

  // Cinematic Delay Logic: Only delay if we are transitioning (reintegrating) to Home
  const entranceDelay = isTransitioning ? 2.5 : 0.5;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
        transition={{ duration: 1.5, delay: entranceDelay, ease: "easeOut" }}
        className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-[60]"
        onMouseMove={(e) => {
          mouseX.set(e.clientX - window.innerWidth / 2);
          mouseY.set(e.clientY - window.innerHeight / 2);
        }}
      >
        <motion.div 
          style={{ 
            perspective: '1000px',
            rotateX: useSpring(rotateX, { stiffness: 100, damping: 30 }),
            rotateY: useSpring(rotateY, { stiffness: 100, damping: 30 }),
          }}
          className="relative group pointer-events-auto cursor-default"
        >
          {/* Ghost Reflection Layer */}
          <motion.div 
            animate={{ 
                opacity: [0.2, 0.4, 0.2],
                scale: [1.02, 1.05, 1.02],
                x: [0, 5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 text-7xl md:text-8xl font-black tracking-tighter text-cyan-500/10 blur-sm select-none italic"
          >
            PRANAV BIRHADE
          </motion.div>

          <motion.div 
            animate={{ 
              textShadow: [
                "0 0 20px rgba(0,242,255,0.3)",
                "0 0 40px rgba(0,242,255,0.6)",
                "0 0 20px rgba(0,242,255,0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl md:text-8xl font-black tracking-tighter text-white text-center select-none relative z-10 italic"
          >
            PRANAV BIRHADE
            
            {/* Holographic Scanline */}
            <motion.div 
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-cyan-400/50 blur-[1px] z-20"
            />
          </motion.div>
          
          <div className="flex flex-col items-center mt-6">
            <div className="flex items-center gap-4 w-full">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cyan-500/50" />
                <span className="text-cyan-400 font-mono tracking-[0.8em] text-[10px] md:text-xs uppercase bg-black/40 px-6 py-2 border border-cyan-500/20 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                Web Developer & AI Architect
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-cyan-500/50" />
            </div>
            <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[9px] font-mono text-cyan-600 mt-4 tracking-[0.5em] uppercase"
            >
                [ System_Status: Singularity_Ready ]
            </motion.div>
          </div>

          {/* Background Glow */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            className="absolute -inset-20 bg-cyan-500/5 blur-[120px] rounded-full -z-10 pointer-events-none"
          />
        </motion.div>

        {/* Scroll Indicator / Hint */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 flex flex-col items-center gap-3"
        >
          <div className="w-px h-16 bg-gradient-to-b from-cyan-500/50 via-cyan-500/20 to-transparent relative">
             <motion.div 
                animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"
             />
          </div>
          <span className="text-[9px] font-mono text-cyan-500/30 uppercase tracking-[0.6em]">
            Engage Neural Nodes
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

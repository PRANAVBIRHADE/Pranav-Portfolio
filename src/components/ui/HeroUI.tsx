'use client';

import { useEngineStore } from '@/store/useEngineStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import HolographicPanel from './HolographicPanel';
import { HomeHero } from './HomeHero';
import { HomeDiamond } from './HomeDiamond';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function HeroUI() {
  const { isInitialized, initSystem, activeSection, scene } = useEngineStore(
    useShallow((state) => ({
      isInitialized: state.isInitialized,
      initSystem: state.initSystem,
      activeSection: state.activeSection,
      scene: state.scene
    }))
  );

  if (scene === 'INTERFACE') {
    return (
      <>
        {activeSection === 'HOME' && <HomeHero />}
        <HomeDiamond />
      </>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {!isInitialized && (
          <HolographicPanel 
            className="max-w-md text-center pointer-events-auto"
            key="init-panel"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)', transition: { duration: 0.4 } }}
            >
              <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-cyan-500" />
              <h1 className="text-2xl font-bold tracking-widest text-white">
                PRANAV CORE v3.0
              </h1>
              <p className="mt-2 text-xs font-mono text-cyan-400/70">
                ENGINE STATE: DEACTIVATED
              </p>
              
              <motion.button 
                onClick={initSystem}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                exit={{ 
                  scale: 0.2, 
                  opacity: 0, 
                  filter: 'blur(20px)',
                  transition: { duration: 0.6, ease: "easeIn" } 
                }}
                className="mt-8 group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-cyan-500/50 hover:bg-cyan-500/20 px-8 py-3 font-mono text-sm font-bold text-white transition-all"
              >
                  <span className="relative flex items-center gap-2">
                      <Terminal className="h-4 w-4" />
                      INITIATE CORE BOOT
                  </span>
                  <div className="absolute inset-0 animate-pulse bg-cyan-500/10" />
              </motion.button>
            </motion.div>
          </HolographicPanel>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEngineStore } from '@/store/useEngineStore';
import HolographicPanel from './HolographicPanel';
import { HomeHero } from './HomeHero';
import { HomeDiamond } from './HomeDiamond';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function HeroUI() {
  const { isInitialized, initSystem, activeSection, scene, isReturningHome, transitionProgress } = useEngineStore();

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
      <HolographicPanel 
        className="max-w-md text-center pointer-events-auto transition-opacity duration-700 ease-out"
        style={{ opacity: isInitialized ? 0 : 1 }}
      >
        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-cyan-500" />
        <h1 className="text-2xl font-bold tracking-widest text-white">
          PRANAV CORE v3.0
        </h1>
        <p className="mt-2 text-xs font-mono text-cyan-400/70">
          ENGINE STATE: DEACTIVATED
        </p>
        
        <button 
          onClick={initSystem}
          className="mt-8 group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-cyan-500/50 hover:bg-cyan-500/20 px-8 py-3 font-mono text-sm font-bold text-white transition-all active:scale-95"
        >
            <span className="relative flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                INITIATE CORE BOOT
            </span>
            <div className="absolute inset-0 animate-pulse bg-cyan-500/10" />
        </button>
      </HolographicPanel>
    </div>
  );
}

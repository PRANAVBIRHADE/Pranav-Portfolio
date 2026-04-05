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

  const glitchProgress = (isInitialized && !isReturningHome && transitionProgress < 0.25) ? transitionProgress / 0.25 : 0;
  
  return (
    <div 
      className="flex h-screen items-center justify-center pointer-events-none"
      style={{
          transform: glitchProgress > 0 ? `translate(${(Math.random()-0.5)*20*glitchProgress}px, ${(Math.random()-0.5)*20*glitchProgress}px)` : 'none'
      }}
    >
      <HolographicPanel 
        className={`max-w-md text-center pointer-events-auto transition-all duration-75 ${glitchProgress > 0 ? 'scale-110 !border-red-500/50 !bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : ''}`}
        style={{ opacity: isInitialized && transitionProgress >= 0.25 ? 0 : 1, transition: 'opacity 0.2s ease-out' }}
      >
        <ShieldAlert className={`mx-auto mb-4 h-12 w-12 animate-pulse ${glitchProgress > 0 ? 'text-red-500' : 'text-cyan-500'}`} />
        <h1 className={`text-2xl font-bold tracking-widest ${glitchProgress > 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {glitchProgress > 0 ? 'SYSTEM OVERLOAD' : 'PRANAV CORE v3.0'}
        </h1>
        <p className={`mt-2 text-xs font-mono ${glitchProgress > 0 ? 'text-red-400' : 'text-cyan-400/70'}`}>
          {glitchProgress > 0 ? 'CRITICAL FAILURE: CAT_404' : 'ENGINE STATE: DEACTIVATED'}
        </p>
        
        <button 
          onClick={initSystem}
          className={`mt-8 group relative inline-flex items-center justify-center overflow-hidden rounded-full border px-8 py-3 font-mono text-sm font-bold text-white transition-all active:scale-95 ${glitchProgress > 0 ? 'border-red-500 bg-red-500/20' : 'border-cyan-500/50 hover:bg-cyan-500/20'}`}
        >
            <span className="relative flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                {glitchProgress > 0 ? 'FORCE REBOOT' : 'INITIATE CORE BOOT'}
            </span>
            <div className={`absolute inset-0 animate-pulse ${glitchProgress > 0 ? 'bg-red-500/10' : 'bg-cyan-500/10'}`} />
        </button>
      </HolographicPanel>
    </div>
  );
}

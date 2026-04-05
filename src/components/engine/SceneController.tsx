'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// --- Dynamic Import (Crucial for React 19 / Next.js 15 Compatibility) ---

const DynamicScene = dynamic(() => import('./SceneComponent'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-black animate-pulse" />
});

// --- Fallback Component ---

function WebGLFallback() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-black font-mono text-cyan-500 overflow-hidden">
      <div className="max-w-md p-8 text-center border border-cyan-500/30 bg-cyan-950/20 rounded-lg relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        <h2 className="text-xl font-bold mb-4 tracking-tighter">HARDWARE ACCELERATION REQUIRED</h2>
        <p className="text-sm opacity-70 leading-relaxed">
          The Pranav Core Engine requires a WebGL-compatible browser and hardware acceleration to render the high-fidelity 3D cinematic environment.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <div className="h-1 w-full bg-cyan-900 overflow-hidden rounded-full">
              <div className="h-full bg-cyan-500 animate-[pulse_2s_infinite]" style={{ width: '40%' }} />
          </div>
          <span className="text-[10px] animate-pulse uppercase tracking-[0.2em]">System State: Waiting for Graphics Context</span>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
             style={{ background: 'repeating-linear-gradient(0deg, #00f2ff, #00f2ff 1px, transparent 1px, transparent 2px)', backgroundSize: '100% 2px' }} />
      </div>
    </div>
  );
}

// --- Main Scene Controller (The Gatekeeper) ---

export default function SceneController() {
  const [canRender, setCanRender] = useState(false);
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    // 1. Check mounting
    // 2. Perform early WebGL check before even triggering the dynamic import's render
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLError(true);
      } else {
        setCanRender(true);
      }
    } catch (e) {
      setWebGLError(true);
    }
  }, []);

  if (webGLError) return <WebGLFallback />;
  if (!canRender) return <div className="h-full w-full bg-black" />;

  return (
    <div className="h-full w-full overflow-hidden">
      <DynamicScene onWebGLError={() => setWebGLError(true)} />
    </div>
  );
}

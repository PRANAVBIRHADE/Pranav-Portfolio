'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Canvas components to prevent SSR issues with Three.js
const SceneController = dynamic(() => import('@/components/engine/SceneController'), { ssr: false });
const AudioManager = dynamic(() => import('@/components/engine/AudioManager'), { ssr: false });
const HeroUI = dynamic(() => import('@/components/ui/HeroUI'), { ssr: false });

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <AudioManager />
      
      {/* 3D Engine Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center bg-black">
            <div className="h-32 w-32 animate-pulse border-t-2 border-cyan-500 rounded-full" />
          </div>
        }>
          <SceneController />
        </Suspense>
      </div>

      {/* 2D Overlay UI Layer */}
      <div className="relative z-10 h-full w-full pointer-events-none">
        <div className="pointer-events-none h-full w-full">
            <HeroUI />
        </div>
      </div>
      
      {/* Cinematic Fog & Noise */}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay" />
    </main>
  );
}

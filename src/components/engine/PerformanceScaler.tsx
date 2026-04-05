'use client';

import { useState } from 'react';
import { useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';

export function PerformanceScaler() {
  const { setDpr } = useThree();
  const [dpr, setDprValue] = useState(1.5);

  return (
    <PerformanceMonitor
      onIncline={() => setDprValue(2)}
      onDecline={() => setDprValue(1)}
      onChange={({ factor }) => {
        // Factor is a weighted average of performance
        // We use it to smoothly adjust DPR between 1 and 2
        const targetDpr = 1 + factor; 
        setDpr(targetDpr);
        setDprValue(targetDpr);
      }}
    >
      {/* 
        This component doesn't render anything, 
        it just monitors and adjusts the global DPR.
      */}
    </PerformanceMonitor>
  );
}

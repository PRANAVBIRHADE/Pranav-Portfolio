'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export function GlobalParticles({ count = 500, color = "#00f2ff" }: { count?: number, color?: string }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        temp[i * 3] = (Math.random() - 0.5) * 40;
        temp[i * 3 + 1] = (Math.random() - 0.5) * 40;
        temp[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pointsRef.current) {
        pointsRef.current.rotation.y = t * 0.05;
        pointsRef.current.rotation.x = t * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={particles.length / 3} 
          array={particles} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15} 
        color={color} 
        transparent 
        opacity={0.4} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

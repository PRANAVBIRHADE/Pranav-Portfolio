'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export interface ConnectionPoint {
  position: [number, number, number];
}

export function NeuralConnections({ points, color = "#00f2ff" }: { points: ConnectionPoint[], color?: string }) {
  return (
    <group>
      {points.map((point, i) => (
        <ConnectionLine key={i} end={point.position} color={color} />
      ))}
    </group>
  );
}

function ConnectionLine({ end, color }: { end: [number, number, number], color: string }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  
  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(end[0] * 0.5, 2, end[2] * 0.5),
      new THREE.Vector3(...end)
    );
  }, [end]);

  const points = useMemo(() => curve.getPoints(50), [curve]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pulseRef.current) {
        const progress = (t * 0.5) % 1;
        const pos = curve.getPoint(progress);
        pulseRef.current.position.copy(pos);
        pulseRef.current.scale.setScalar(0.1 + Math.sin(t * 10) * 0.05);
    }
  });

  return (
    <group>
      <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.2
      }))} />
      
      {/* Moving Data Bit */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={10} 
            transparent 
            opacity={0.8} 
        />
      </mesh>
    </group>
  );
}

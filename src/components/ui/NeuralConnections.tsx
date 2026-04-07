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
  const pulseRefs = useRef<THREE.Mesh[]>([]);
  
  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(end[0] * 0.5, 2, end[2] * 0.5),
      new THREE.Vector3(...end)
    );
  }, [end]);

  const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.008, 8, false), [curve]);
  
  const pulseData = useMemo(() => {
    return [
        { offset: 0, speed: 0.4 },
        { offset: 0.3, speed: 0.6 },
        { offset: 0.7, speed: 0.3 }
    ];
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    pulseRefs.current.forEach((ref, i) => {
        if (ref) {
            const data = pulseData[i];
            const progress = (t * data.speed + data.offset) % 1;
            const pos = curve.getPoint(progress);
            
            ref.position.copy(pos);
            ref.scale.setScalar(0.08 + Math.sin(t * 8 + i) * 0.05);
            ref.rotation.x += delta * 5;
            ref.rotation.y += delta * 3;
            
            // Dynamic emissive intensity based on position along the curve
            const intensity = 15 + Math.sin(progress * Math.PI) * 20;
            if (ref.material instanceof THREE.MeshStandardMaterial) {
                ref.material.emissiveIntensity = intensity;
            }
        }
    });
  });

  return (
    <group>
      {/* Fiber Optic Tube - High Refraction */}
      <mesh geometry={tubeGeometry}>
        <meshPhysicalMaterial 
            color={color} 
            transparent 
            opacity={0.3} 
            transmission={0.8}
            thickness={0.5}
            roughness={0.1}
            metalness={0.2}
            clearcoat={1}
            emissive={color}
            emissiveIntensity={1.5}
            envMapIntensity={3}
        />
      </mesh>
      
      {/* Moving Data Bits - Shards */}
      {pulseData.map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) pulseRefs.current[i] = el; }}>
            <icosahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial 
                color={color} 
                emissive={color} 
                emissiveIntensity={15} 
                transparent 
                opacity={0.9} 
                toneMapped={false}
            />
        </mesh>
      ))}
    </group>
  );
}

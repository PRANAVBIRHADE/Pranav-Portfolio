'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Html, Float } from '@react-three/drei';

interface NavigationNodeProps {
  position: [number, number, number];
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}

export default function NavigationNode({ position, label, active, onClick, color = '#00f2ff' }: NavigationNodeProps) {
  const [hovered, setHovered] = useState(false);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const barsRef = useRef<THREE.Group>(null);

  const shards = useMemo(() => {
    return Array.from({ length: 4 }).map(() => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ),
      rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
      speed: 0.5 + Math.random() * 0.5
    }));
  }, []);

  // Manage cursor state
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, [hovered]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (coreRef.current) {
        coreRef.current.rotation.y = t * 0.5;
        coreRef.current.rotation.x = t * 0.2;
        const s = (hovered || active) ? 1.4 : 1;
        coreRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    }
    
    if (ringRef.current) {
        ringRef.current.rotation.z = -t * 0.3;
        ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.2;
    }

    if (barsRef.current) {
        barsRef.current.rotation.y = t * 0.2;
        barsRef.current.children.forEach((child: any, i: number) => {
            child.position.y = Math.sin(t * 2 + i) * 0.1;
        });
    }
  });

  return (
    <group position={position}>
      {/* Invisible Raycast Hitbox */}
      <mesh 
        position={[0, 0, 0.5]} 
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
        }}
        onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
        }}
      >
        <boxGeometry args={[3, 2.5, 0.2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Outer Refractive Diamond Shell */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.35, 1]} />
          <meshPhysicalMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={active || hovered ? 0.5 : 0.1}
            transmission={1}
            thickness={1.5}
            roughness={0}
            ior={2.4}
            attenuationColor={color}
            attenuationDistance={1}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Inner Pulsing Core */}
        <mesh scale={0.15}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={active ? 20 : (hovered ? 12 : 4)}
            toneMapped={false}
          />
        </mesh>

        {/* Orbiting Shards - Extreme Realistic Glass Squares */}
        <group>
            {shards.map((shard: any, i: number) => (
                <Float key={i} speed={hovered ? shard.speed * 2.5 : shard.speed} rotationIntensity={hovered ? 4 : 1} floatIntensity={hovered ? 2 : 1}>
                    <mesh position={shard.position.toArray() as [number, number, number]} rotation={shard.rotation}>
                        <boxGeometry args={[0.08, 0.08, 0.08]} />
                        <meshPhysicalMaterial 
                            color={color} 
                            emissive={color} 
                            emissiveIntensity={active || hovered ? 15 : 2}
                            transparent
                            opacity={0.8}
                            roughness={0.1}
                            metalness={0.9}
                            transmission={0.9}
                            thickness={0.2}
                            ior={1.5}
                        />
                    </mesh>
                </Float>
            ))}
        </group>

        {/* Orbital Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.7, 0.005, 16, 100]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={active || hovered ? 2 : 0.5}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* HUD Elements - Vertical Bars */}
        <group ref={barsRef}>
            {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
                <mesh key={i} position={[Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2]}>
                    <boxGeometry args={[0.02, 1, 0.02]} />
                    <meshStandardMaterial 
                        color={color} 
                        emissive={color}
                        emissiveIntensity={hovered || active ? 2 : 0.2}
                        transparent
                        opacity={0.2}
                    />
                </mesh>
            ))}
        </group>

        {/* Text Label UI */}
        <Html 
            position={[0, -1.2, 0]} 
            center 
            distanceFactor={10} 
            pointerEvents="none"
        >
          <div 
            className={`
              flex flex-col items-center transition-all duration-500 font-mono tracking-[0.5em] select-none
              ${hovered || active ? 'opacity-100 translate-y-0 scale-110' : 'opacity-30 translate-y-2 scale-100'}
            `}
            style={{ 
                color: active || hovered ? color : '#666',
                textShadow: (active || hovered) ? `0 0 20px ${color}` : 'none'
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className={`h-[1px] w-8 transition-all ${hovered || active ? 'bg-current w-16' : 'bg-gray-800'}`} />
              <span className="text-[11px] font-black uppercase">
                {label}
              </span>
              <div className={`h-[1px] w-8 transition-all ${hovered || active ? 'bg-current w-16' : 'bg-gray-800'}`} />
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

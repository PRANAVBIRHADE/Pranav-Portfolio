'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useEngineStore } from '@/store/useEngineStore';

export function GlobalParticles({ count = 400, color = "#00f2ff" }: { count?: number, color?: string }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  
  // Per-particle state
  const particles = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
        data.push({
            pos: new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40),
            rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
            speed: 0.05 + Math.random() * 0.1,
            rotSpeed: new THREE.Euler(Math.random() * 0.01, Math.random() * 0.01, Math.random() * 0.01),
            size: 0.04 + Math.random() * 0.08
        });
    }
    return data;
  }, [count]);

  const { isTransitioning, transitionProgress, transitionPhase } = useEngineStore();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (meshRef.current) {
        particles.forEach((p, i) => {
            // Floating Drift
            p.pos.y += Math.sin(t * p.speed + i) * 0.005;
            p.pos.x += Math.cos(t * p.speed * 0.5 + i) * 0.005;
            
            // Rotation
            p.rot.x += p.rotSpeed.x;
            p.rot.y += p.rotSpeed.y;
            
            // Interaction: Pulse during scatter
            let s = p.size;
            if (isTransitioning) {
                const pulse = Math.sin(transitionProgress * Math.PI);
                s *= (1 + pulse * 1.5);
            }

            dummy.position.copy(p.pos);
            dummy.rotation.copy(p.rot);
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (materialRef.current) {
        const pulse = isTransitioning ? Math.sin(transitionProgress * Math.PI) : 0;
        materialRef.current.emissiveIntensity = 0.5 + pulse * 5;
        materialRef.current.opacity = 0.3 + pulse * 0.5;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[null as any, null as any, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial 
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={2}
        metalness={0.9}
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={5}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  );
}

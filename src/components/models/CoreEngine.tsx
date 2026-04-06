'use client';

import { useFrame, extend } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { useEngineStore } from '@/store/useEngineStore';
import EnergyCoreMaterial from '../materials/EnergyCoreMaterial';

// Register the custom shader material with R3F
extend({ EnergyCoreMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      energyCoreMaterial: any;
    }
  }
}

const SHARD_COUNT = 40;
const tempObject = new THREE.Object3D();

export default function CoreEngine({ color = "#00f2ff" }: { color?: string }) {
  const outerShellRef = useRef<THREE.Group>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const shaderRef = useRef<any>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const { 
    activeSection, 
    isTransitioning, 
    isReturningHome, 
    transitionStartTime, 
    transitionPhase, 
    completeReverse,
    pendingSection 
  } = useEngineStore();

  const radiusRef = useRef(3);
  const fractureProgressRef = useRef(0);

  // Pre-calculate shard data
  const shards = useMemo(() => {
    const data = [];
    for (let i = 0; i < SHARD_COUNT; i++) {
        // Initial position roughly forming an octahedron/diamond
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 0.8 + Math.random() * 0.4;
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        data.push({
            initialPos: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3(x, y, z).normalize().multiplyScalar(3 + Math.random() * 5),
            swirlAxis: new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(Math.random(), 0, Math.random()), Math.random()),
            swirlSpeed: (Math.random() - 0.5) * 20,
            rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
            rotationSpeed: Math.random() * 10
        });
    }
    return data;
  }, []);

  useFrame((state: any, delta: number) => {
    const t = state.clock.getElapsedTime();
    // 1. Color Morphing Logic
    const colorMap = {
      HOME: '#00f2ff',
      ABOUT: '#00f2ff',
      PROJECTS: '#00ff88',
      SKILLS: '#bc00ff',
      CONTACT: '#ff4400'
    } as const;

    const currentColor = new THREE.Color(colorMap[activeSection as keyof typeof colorMap] || '#00f2ff');
    const targetColorStr = colorMap[(pendingSection || activeSection) as keyof typeof colorMap] || '#00f2ff';
    const targetColor = new THREE.Color(targetColorStr);
    
    // Lerp color based on transition progress
    const mixColor = new THREE.Color().copy(currentColor);
    if (isTransitioning) {
        const timeSinceStart = Date.now() - transitionStartTime;
        const duration = transitionPhase === 'REVERSING' ? 1000 : 2500;
        const colorProgress = Math.min(timeSinceStart / duration, 1);
        mixColor.lerp(targetColor, transitionPhase === 'REVERSING' ? colorProgress * 0.5 : colorProgress);
    }

    // 2. Fragment & Radius Logic
    const isFragmented = activeSection !== 'HOME';
    const targetFracture = isFragmented ? 1 : 0;
    fractureProgressRef.current = THREE.MathUtils.lerp(
        fractureProgressRef.current, 
        targetFracture, 
        isReturningHome ? delta * 1.5 : delta * 2.5
    );

    const targetRadius = isFragmented ? 10 : 3;
    radiusRef.current = THREE.MathUtils.lerp(radiusRef.current, targetRadius, delta * 2);

    // 3. Boot Handover Scaling
    const { scene, transitionProgress } = useEngineStore.getState();
    let bootScale = 1;
    if (scene === 'BOOT') {
        // Core starts forming at 75% boot progress
        bootScale = transitionProgress > 0.75 ? (transitionProgress - 0.75) / 0.25 : 0;
    }

    if (shaderRef.current) {
      shaderRef.current.uTime = t;
      shaderRef.current.uColor.copy(mixColor);
      shaderRef.current.uIntensity = ((isFragmented ? 0.3 : 2.0) + Math.sin(t * 3.0) * 0.5) * bootScale;
    }

    if (outerShellRef.current) {
      outerShellRef.current.rotation.y = t * 0.2;
      outerShellRef.current.scale.setScalar(bootScale);
    }
    
    // Animate Shards
    if (instancedMeshRef.current) {
        // Use Global Store Progress (0 to 1) which is frame-synced with Camera
        const globalP = transitionProgress;
        
        let p = 0;
        const REVERSE_END = 0.33; // 1.5s of 4.5s

        if (transitionPhase === 'REVERSING') {
            // Map 0 -> 0.33 to 1 -> 0 (Pulling back)
            const localP = Math.min(globalP / REVERSE_END, 1);
            const easedP = localP < 0.5 ? 4 * localP * localP * localP : 1 - Math.pow(-2 * localP + 2, 3) / 2;
            p = 1 - easedP;
            
            if (globalP >= REVERSE_END) {
                // Trigger phase swap in store
                completeReverse();
            }
        } else if (transitionPhase === 'SCATTERING') {
            // Map 0.33 -> 1.0 to 0 -> 1 (Exploding out)
            const localP = (globalP - REVERSE_END) / (1 - REVERSE_END);
            const easedP = localP < 0.5 ? 4 * localP * localP * localP : 1 - Math.pow(-2 * localP + 2, 3) / 2;
            p = easedP;
        } else if (scene === 'BOOT') {
            p = 0;
        } else {
            p = activeSection === 'HOME' ? 0 : 1;
        }

        shards.forEach((shard, i) => {
            const pos = shard.initialPos.clone();
            // Shard Scatter Radius
            pos.add(shard.velocity.clone().multiplyScalar(p * 2.5));
            
            if (p > 0) {
                const swirlAngle = shard.swirlSpeed * p;
                pos.applyAxisAngle(shard.swirlAxis, swirlAngle);
            }
            
            tempObject.position.copy(pos);
            tempObject.rotation.setFromVector3(
                shard.rotationAxis.clone().multiplyScalar(t * shard.rotationSpeed * (p + 0.1))
            );
            
            const swell = Math.sin(p * Math.PI) * 0.5;
            const s = (1 + swell - (p * 0.4)) * bootScale;
            tempObject.scale.setScalar(s);
            
            tempObject.updateMatrix();
            instancedMeshRef.current!.setMatrixAt(i, tempObject.matrix);
        });
        
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
        instancedMeshRef.current.visible = bootScale > 0;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.4;
      ring1Ref.current.rotation.y = t * 0.6;
      ring1Ref.current.scale.setScalar(THREE.MathUtils.lerp(ring1Ref.current.scale.x, isFragmented ? 4 : 1, delta * 2));
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = t * -0.5;
      ring2Ref.current.rotation.x = t * 0.2;
      ring2Ref.current.scale.setScalar(THREE.MathUtils.lerp(ring2Ref.current.scale.x, isFragmented ? 5 : 1, delta * 2));
    }

    // Update pillar positions
    if (outerShellRef.current) {
      outerShellRef.current.children.forEach((child: any, i: number) => {
        const angle = (i / 8) * Math.PI * 2;
        const targetX = Math.sin(angle) * radiusRef.current;
        const targetZ = Math.cos(angle) * radiusRef.current;
        
        child.position.x = THREE.MathUtils.lerp(child.position.x, targetX, delta * 3);
        child.position.z = THREE.MathUtils.lerp(child.position.z, targetZ, delta * 3);
        
        if (isFragmented) {
          child.position.y = THREE.MathUtils.lerp(child.position.y, Math.sin(t + i) * 5, delta * 1);
          child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, t * 0.1, delta * 1);
        } else {
          child.position.y = THREE.MathUtils.lerp(child.position.y, 0, delta * 4);
          child.rotation.x = THREE.MathUtils.lerp(child.rotation.x, 0, delta * 4);
        }
      });
    }
  });

  return (
    <group>
      <Float speed={5} rotationIntensity={2} floatIntensity={2}>
        <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, SHARD_COUNT]} raycast={() => null}>
          <tetrahedronGeometry args={[0.3, 0]} />
          <meshPhysicalMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={2} 
            transparent 
            opacity={0.9}
            metalness={0.9}
            roughness={0.1}
            transmission={0.8}
            thickness={1}
            ior={1.5}
            attenuationColor={color}
            attenuationDistance={0.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </instancedMesh>
        
        {/* Glow Core (Internal) - Enhanced with Fresnel-like properties */}
        {(!activeSection || activeSection === 'HOME') && (
          <mesh raycast={() => null}>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshPhysicalMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={10} 
              transparent 
              opacity={0.6} 
              transmission={0.9}
              thickness={2}
            />
          </mesh>
        )}
      </Float>

      <mesh ref={ring1Ref} raycast={() => null}>
        <torusGeometry args={[2, 0.05, 16, 100]} />
        <meshStandardMaterial color="#333" metalness={1} roughness={0.1} />
      </mesh>

      <mesh ref={ring2Ref} raycast={() => null}>
        <torusGeometry args={[2.5, 0.03, 16, 100]} />
        <meshPhysicalMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={2} 
          metalness={1} 
          roughness={0} 
        />
      </mesh>

      <group ref={outerShellRef}>
        {[...Array(8)].map((_, i) => (
          <mesh 
            key={i} 
            raycast={() => null}
            position={[
              Math.sin((i / 8) * Math.PI * 2) * 3,
              0,
              Math.cos((i / 8) * Math.PI * 2) * 3
            ]}
          >
            <boxGeometry args={[0.2, 4, 0.2]} />
            <meshStandardMaterial color="#111" metalness={1} roughness={0.1} />
            
            <mesh position={[0, 0, 0.11]} raycast={() => null}>
              <planeGeometry args={[0.05, 3.8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
            </mesh>
          </mesh>
        ))}
      </group>

      <pointLight intensity={isTransitioning ? 50 : 20} color={color} distance={20} />
    </group>
  );
}

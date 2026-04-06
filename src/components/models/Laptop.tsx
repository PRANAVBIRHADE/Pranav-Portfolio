import { useShallow } from 'zustand/react/shallow';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { Text, RenderTexture, PerspectiveCamera } from '@react-three/drei';
import { useEngineStore } from '@/store/useEngineStore';
import CoreEngine from './CoreEngine';

interface LaptopProps {
  open?: boolean;
  onBoot?: () => void;
  visible?: boolean;
}

const FRAGMENT_COUNT = 250; 

export default function LaptopModel({ open = false, onBoot, visible = true }: LaptopProps) {
  const lidRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const trackpadRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const fragmentRef = useRef<THREE.InstancedMesh>(null);
  
  const { transitionProgress, isTransitioning, scene } = useEngineStore(
    useShallow((state) => ({
      transitionProgress: state.transitionProgress,
      isTransitioning: state.isTransitioning,
      scene: state.scene
    }))
  );
  const [booting, setBooting] = useState(false);
  
  // Use specialized refs for high-frequency property updates to bypass React re-renders
  const opacityRef = useRef(1);

  // Pre-calculate fragment trajectories for "Vacuum Explosion"
  const fragments = useMemo(() => {
    const data = [];
    for (let i = 0; i < FRAGMENT_COUNT; i++) {
        const startX = (Math.random() - 0.5) * 4.5;
        const startY = (Math.random() - 0.5) * 3.5;
        const startZ = (Math.random() - 0.5) * 0.8;

        const angle = Math.atan2(startY, startX);
        const distFromCenter = Math.sqrt(startX * startX + startY * startY);
        const force = 15 + distFromCenter * 20 + Math.random() * 30;
        
        data.push({
            position: new THREE.Vector3(startX, startY + 1.2, startZ),
            velocity: new THREE.Vector3(
                Math.cos(angle) * force,
                Math.sin(angle) * force,
                (Math.random() - 0.5) * 40
            ),
            rotation: new THREE.Euler(
                Math.random() * Math.PI * 2, 
                Math.random() * Math.PI * 2, 
                Math.random() * Math.PI * 2
            ),
            rotSpeed: (Math.random() - 0.5) * 15
        });
    }
    return data;
  }, []);

  // Shared dummy for matrix calculations to avoid object creation in loop
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state: any, delta: number) => {
    if (!lidRef.current || !groupRef.current) return;
    
    const isBooting = scene === 'BOOT' && isTransitioning;
    
    // 1. STAGE 1: INTENSE CHARGE (0% - 25% | 1.5s)
    if (isBooting && transitionProgress < 0.25) {
        const intensity = (transitionProgress / 0.25);
        groupRef.current.position.x = (Math.random() - 0.5) * 0.15 * intensity;
        groupRef.current.position.y = -0.5 + (Math.random() - 0.5) * 0.15 * intensity;
        groupRef.current.rotation.z = (Math.random() - 0.5) * 0.05 * intensity;
    } else if (!isTransitioning) {
        groupRef.current.position.set(0, -0.5, 1.5);
        groupRef.current.rotation.z = 0;
    }

    // 2. LID LOGIC
    if (isBooting) {
        lidRef.current.rotation.x = -Math.PI / 2;
    } else {
        const targetRotation = open ? -Math.PI / 2 : 0;
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, delta * 10);
    }

    // 3. SHATTER & VACUUM PHYSICS (STAGES 2 & 3)
    const isShattering = scene === 'BOOT' && transitionProgress > 0.25;
    const isVacuuming = scene === 'BOOT' && transitionProgress > 0.75;
    
    // Shatter progress (0 to 1 between 0.25 and 0.75)
    const shatterProgress = isShattering ? Math.min(1, (transitionProgress - 0.25) / 0.5) : 0;
    // Vacuum progress (0 to 1 between 0.75 and 1.0)
    const vacuumProgress = isVacuuming ? (transitionProgress - 0.75) / 0.25 : 0;
    
    if (fragmentRef.current) {
        const time = state.clock.elapsedTime;
        for (let i = 0; i < FRAGMENT_COUNT; i++) {
            const f = fragments[i];
            
            // Initial Shatter Position
            const shatterPos = new THREE.Vector3().copy(f.position).addScaledVector(f.velocity, 45 * Math.pow(shatterProgress, 1.5));
            
            // Stage 3: Convergence towards (0, 0, 0)
            if (isVacuuming) {
                dummy.position.lerpVectors(shatterPos, new THREE.Vector3(0, 0, 0), Math.pow(vacuumProgress, 2));
            } else {
                dummy.position.copy(shatterPos);
            }

            dummy.rotation.set(
              f.rotation.x + time * f.rotSpeed,
              f.rotation.y + time * f.rotSpeed,
              f.rotation.z + time * f.rotSpeed
            );
            
            const baseScale = 0.05 + Math.random() * 0.1;
            const vanishScale = Math.max(0, 1 - vacuumProgress);
            const scale = baseScale * (1 - shatterProgress * 0.5) * vanishScale;
            
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            fragmentRef.current.setMatrixAt(i, dummy.matrix);
        }
        fragmentRef.current.instanceMatrix.needsUpdate = true;
        fragmentRef.current.visible = isShattering;
    }

    // Direct Material Updates to avoid React state triggers at 60FPS
    const targetOp = (visible && !isShattering) ? 1 : 0;
    opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, targetOp, delta * 20);
    
    // Update all parts visibility/opacity directly on the refs
    [bodyRef.current, trackpadRef.current, lidRef.current?.children[0]]?.forEach((mesh: any) => {
        if (mesh && mesh.material) {
            mesh.material.opacity = opacityRef.current;
            mesh.visible = opacityRef.current > 0.01;
        }
    });

    if (open && screenRef.current) {
        if (!booting) {
            setBooting(true);
            onBoot?.();
        }
        
        const mat = screenRef.current.material as THREE.MeshStandardMaterial;
        let screenIntensity = isShattering ? 0 : 0.5;
        if (isBooting && transitionProgress < 0.25) {
            screenIntensity = Math.random() > 0.8 ? 20 : 1;
        }
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, screenIntensity, 0.3);
        mat.opacity = opacityRef.current;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 1.5]}>
      <instancedMesh ref={fragmentRef} args={[undefined, undefined, FRAGMENT_COUNT]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#ffffff"
          metalness={1}
          roughness={0.05}
          envMapIntensity={6}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Internal Explosion Pulse Light */}
      {scene === 'BOOT' && transitionProgress > 0.25 && (
        <pointLight 
            position={[0, 1.2, 0]} 
            intensity={Math.sin((transitionProgress - 0.25) * Math.PI * 2) * 100} 
            color="#00f2ff" 
            distance={15}
            decay={2}
        />
      )}

      <group>
          <mesh ref={bodyRef} receiveShadow castShadow>
            <boxGeometry args={[4, 0.2, 3]} />
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} transparent />
          </mesh>
          
          <mesh ref={trackpadRef} position={[0, 0.11, 1]} receiveShadow>
            <boxGeometry args={[1.2, 0.01, 0.8]} />
            <meshStandardMaterial color="#111" metalness={1} roughness={0.1} transparent />
          </mesh>

          <group ref={lidRef} position={[0, 0.1, -1.5]}>
            <group position={[0, 1.5, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[4, 3, 0.1]} />
                    <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} transparent />
                </mesh>
                
                {transitionProgress > 0.1 && transitionProgress < 0.6 && (
                    <mesh position={[0, 0, -0.2]}>
                        <sphereGeometry args={[0.5, 32, 32]} />
                        <meshStandardMaterial 
                            color="#00f2ff" 
                            emissive="#00f2ff" 
                            emissiveIntensity={transitionProgress * 100} 
                            toneMapped={false}
                        />
                    </mesh>
                )}
                
                <mesh ref={screenRef} position={[0, 0, 0.06]}>
                    <planeGeometry args={[3.8, 2.8]} />
                    <meshStandardMaterial 
                        transparent
                        emissive="#00f2ff"
                        emissiveIntensity={0.5}
                        toneMapped={false}
                    >
                        <RenderTexture attach="map">
                            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                            <color attach="background" args={["#050505"]} />
                            <CoreEngine color="#00f2ff" />
                            <Text
                                position={[0, 1.5, 0]}
                                fontSize={0.5}
                                color="#00f2ff"
                                font="https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono/web/woff/JetBrainsMono-Regular.woff"
                            >
                                CRITICAL OVERLOAD
                            </Text>
                        </RenderTexture>
                    </meshStandardMaterial>
                </mesh>
            </group>
          </group>
      </group>
    </group>
  );
}

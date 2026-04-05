import { useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Text, RenderTexture, PerspectiveCamera } from '@react-three/drei';
import { useEngineStore } from '@/store/useEngineStore';
import CoreEngine from './CoreEngine';

interface LaptopProps {
  open?: boolean;
  onBoot?: () => void;
  visible?: boolean;
}

const FRAGMENT_COUNT = 600; // Ultra-high level detail

export default function LaptopModel({ open = false, onBoot, visible = true }: LaptopProps) {
  const lidRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const fragmentRef = useRef<THREE.InstancedMesh>(null);
  
  const { transitionProgress, isTransitioning, scene } = useEngineStore();
  const [booting, setBooting] = useState(false);
  const [opacity, setOpacity] = useState(1);

  // Pre-calculate fragment trajectories for "Vacuum Explosion"
  const fragments = useMemo(() => {
    const data = [];
    for (let i = 0; i < FRAGMENT_COUNT; i++) {
        // Start in screen/body area
        const startX = (Math.random() - 0.5) * 4.5;
        const startY = (Math.random() - 0.5) * 3.5;
        const startZ = (Math.random() - 0.5) * 0.8;

        // Velocity vector that expands OUTWARDS to create a ring tunnel
        const angle = Math.atan2(startY, startX);
        const distFromCenter = Math.sqrt(startX * startX + startY * startY);
        const force = 15 + distFromCenter * 20 + Math.random() * 30;
        
        data.push({
            position: new THREE.Vector3(startX, startY + 1.2, startZ),
            velocity: new THREE.Vector3(
                Math.cos(angle) * force,
                Math.sin(angle) * force,
                (Math.random() - 0.5) * 40 // High Z-chaos
            ),
            rotation: new THREE.Vector3(
                Math.random() * Math.PI * 2, 
                Math.random() * Math.PI * 2, 
                Math.random() * Math.PI * 2
            ),
            rotSpeed: (Math.random() - 0.5) * 20
        });
    }
    return data;
  }, []);

  useFrame((state: any, delta: number) => {
    if (!lidRef.current || !groupRef.current) return;
    
    // 1. STAGE 1: INTENSE CHARGE (0% - 25% | 1.5s)
    if (isTransitioning && scene === 'BOOT' && transitionProgress < 0.25) {
        const intensity = (transitionProgress / 0.25);
        // Electrical shudder
        const jitterX = (Math.random() - 0.5) * 0.2 * intensity;
        const jitterY = (Math.random() - 0.5) * 0.2 * intensity;
        groupRef.current.position.x = jitterX;
        groupRef.current.position.y = -0.5 + jitterY;
        groupRef.current.rotation.z = (Math.random() - 0.5) * 0.08 * intensity;
    } else if (!isTransitioning) {
        groupRef.current.position.set(0, -0.5, 1.5);
        groupRef.current.rotation.z = 0;
    }

    // 2. LID PORTAL LOCK
    if (isTransitioning && scene === 'BOOT') {
        lidRef.current.rotation.x = -Math.PI / 2;
    } else {
        const targetRotation = open ? -Math.PI / 2 : 0;
        lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, delta * 12);
    }

    // 3. STAGE 2: THE BLAST (25% - 58% | 2.0s duration)
    const isShattering = scene === 'BOOT' && transitionProgress > 0.25;
    const localShatter = isShattering ? Math.min(1, (transitionProgress - 0.25) / 0.33) : 0; 
    
    if (fragmentRef.current) {
        const dummy = new THREE.Object3D();
        fragments.forEach((f, i) => {
            const p = f.position.clone();
            
            // Violent Stage 2 Expansion
            const easedShatter = Math.pow(localShatter, 1.5);
            const v = f.velocity.clone().multiplyScalar(45 * easedShatter); 
            p.add(v);
            
            dummy.position.copy(p);
            dummy.rotation.set(
                f.rotation.x + state.clock.elapsedTime * f.rotSpeed,
                f.rotation.y + state.clock.elapsedTime * f.rotSpeed,
                f.rotation.z + state.clock.elapsedTime * f.rotSpeed
            );
            
            // Shards are bigger at the start, then shrink as they fly past
            const scale = Math.max(0, (0.05 + Math.random() * 0.15) * (1 - localShatter * 1.2));
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            fragmentRef.current!.setMatrixAt(i, dummy.matrix);
        });
        fragmentRef.current.instanceMatrix.needsUpdate = true;
        fragmentRef.current.visible = isShattering;
    }

    // Main Mesh Visibility (Immediate hide on shatter)
    const targetOpacity = (visible && !isShattering) ? 1 : 0;
    setOpacity(THREE.MathUtils.lerp(opacity, targetOpacity, delta * 25));
    
    // Hide original geometry
    if (groupRef.current.children[1]) {
        groupRef.current.children[1].visible = opacity > 0.05;
    }

    // Stage 1 Screen Flicker (Critical State)
    if (open && screenRef.current) {
        if (!booting) {
            setBooting(true);
            onBoot?.();
        }
        
        let screenEmissive = 1;
        if (transitionProgress > 0 && transitionProgress < 0.25) {
            // Electrical pulsing
            screenEmissive = Math.random() > 0.8 ? 50 : 2;
        } else if (transitionProgress >= 0.25) {
            screenEmissive = 0; // Destroyed
        }
        
        (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 
            THREE.MathUtils.lerp((screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity, screenEmissive, 0.4);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 1.5]}>
      {/* Fragments for VOID explosion */}
      <instancedMesh ref={fragmentRef} args={[undefined, undefined, FRAGMENT_COUNT]}>
        <boxGeometry args={[1, 1, 1]} /> {/* Base geometry, scale handles the sizing */}
        <meshStandardMaterial 
            color="#222" 
            metalness={1} 
            roughness={0.05} 
            emissive="#00f2ff" 
            emissiveIntensity={4}
        />
      </instancedMesh>

      <group>
          {/* Base / Keyboard Part */}
          <mesh receiveShadow castShadow>
            <boxGeometry args={[4, 0.2, 3]} />
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
          </mesh>
          
          <mesh position={[0, 0.11, 1]} receiveShadow>
            <boxGeometry args={[1.2, 0.01, 0.8]} />
            <meshStandardMaterial color="#111" metalness={1} roughness={0.1} transparent opacity={opacity} />
          </mesh>

          <group ref={lidRef} position={[0, 0.1, -1.5]}>
            <group position={[0, 1.5, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[4, 3, 0.1]} />
                    <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} transparent opacity={opacity} />
                </mesh>
                
                {/* The Core - Visible behind the screen as it "overloads" */}
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
                        opacity={opacity}
                        emissive="#00f2ff"
                        emissiveIntensity={0.5}
                        toneMapped={false}
                    >
                        <RenderTexture attach="map">
                            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                            <color attach="background" args={["#050505"]} />
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
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

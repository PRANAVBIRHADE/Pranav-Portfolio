'use client';

import React, { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  ContactShadows,
  BakeShadows,
  Loader
} from '@react-three/drei';
import { 
  Bloom, 
  ChromaticAberration, 
  EffectComposer, 
  Vignette,
  Noise,
  DepthOfField
} from '@react-three/postprocessing';
import * as THREE from 'three';

import { useEngineStore } from '@/store/useEngineStore';
import LaptopModel from '../models/Laptop';
import CoreEngine from '../models/CoreEngine';
import NavigationNode from '../ui/NavigationNode';
import ProjectPanel from '../ui/ProjectPanel';
import { GridFloor, HUDOverlay } from '../ui/TechComponents';
import { NeuralConnections } from '../ui/NeuralConnections';
import { GlobalParticles } from '../ui/GlobalParticles';
import { PerformanceScaler } from './PerformanceScaler';

// --- Error Boundary Internal ---
class SceneInternalErrorBoundary extends React.Component<{ children: React.ReactNode, onError: () => void }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any) {
    console.error('Inner Scene Crash:', error);
    this.props.onError();
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

// --- Cinematic Effects Isolated ---
const CinematicEffects = React.memo(({ isGLReady, isTransitioning, transitionStartTime }: { isGLReady: boolean, isTransitioning: boolean, transitionStartTime: number }) => {
  if (!isGLReady) return null;

  return (
    <EffectComposer enableNormalPass multisampling={4}>
      <Bloom 
        luminanceThreshold={1.2} 
        mipmapBlur 
        intensity={isTransitioning ? 2.5 : 1.5} 
        radius={0.8} 
      />
      <Vignette offset={0.3} darkness={0.9} />
      <Noise opacity={0.005} premultiply />
    </EffectComposer>
  );
});
CinematicEffects.displayName = 'CinematicEffects';

// --- Camera Rig for Cinematic Movement ---
function CameraRig() {
  const { scene, activeSection, isTransitioning, transitionStartTime, totalTransitionDuration, isReturningHome, setTransitionProgress } = useEngineStore();
  
  const startPos = useRef(new THREE.Vector3(0, 0, 10));
  const startLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  
  // To detect the exact start of a new transition
  const lastActiveRef = useRef(activeSection);
  const lastStartTimeRef = useRef(0);

  useFrame((state: any) => {
    const now = Date.now();
    const elapsed = now - transitionStartTime;
    
    // Capture state at the very start of a NEW transition sequence
    if (isTransitioning && transitionStartTime !== lastStartTimeRef.current) {
        startPos.current.copy(state.camera.position);
        startLookAt.current.copy(currentLookAt.current);
        lastStartTimeRef.current = transitionStartTime;
    }

    const t = Math.min(elapsed / (totalTransitionDuration || 3500), 1);
    
    if (isTransitioning) {
        setTransitionProgress(t);
    }
    
    let targetPos = new THREE.Vector3(0, 0, 12);
    let lookTarget = new THREE.Vector3(0, 0, 0);

    if (scene === 'BOOT' && isTransitioning) {
        // ... (Keep existing boot logic but use unified 't' if possible, or leave as is since it's unique)
        if (t < 0.25) {
            const stageT = t / 0.25;
            targetPos.set(0, 1.1, THREE.MathUtils.lerp(10, 9, stageT));
            lookTarget.set(0, 1.1, 0);
        } else if (t < 0.58) {
            targetPos.set(0, 1.1, 9);
            lookTarget.set(0, 1.1, 0);
        } else if (t < 0.92) {
            const stageT = (t - 0.58) / 0.34;
            targetPos.set(0, 1.1, THREE.MathUtils.lerp(9, -2, Math.pow(stageT, 5)));
            lookTarget.set(0, 1.1, -10);
        } else {
            const stageT = (t - 0.92) / 0.08;
            targetPos.set(0, 0, THREE.MathUtils.lerp(-2, 12, stageT));
            lookTarget.set(0, 0, 0);
        }
    } else if (scene === 'INTERFACE') {
        const sectionPosMap = {
            ABOUT: { pos: [-7.5, 5.0, 10], look: [-5.0, 3.6, 0] },
            PROJECTS: { pos: [7.5, 5.0, 10], look: [5.0, 3.6, 0] },
            SKILLS: { pos: [-7.5, -5.0, 10], look: [-5.0, -3.6, 0] },
            CONTACT: { pos: [7.5, -5.0, 10], look: [5.0, -3.6, 0] },
            HOME: { pos: [0, 0, 12], look: [0, 0, 0] }
        };
        const target = sectionPosMap[activeSection] || sectionPosMap.HOME;
        targetPos.set(...target.pos as [number, number, number]);
        lookTarget.set(...target.look as [number, number, number]);
    }

    if (isTransitioning) {
        // High-Quality Quintic Interpolation for "Liquid" motion
        const easeT = t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
        
        state.camera.position.lerpVectors(startPos.current, targetPos, easeT);
        currentLookAt.current.lerpVectors(startLookAt.current, lookTarget, easeT);
        
        // Cinematic FOV Pushing
        const fovPulse = Math.sin(t * Math.PI);
        state.camera.fov = 75 + (isReturningHome ? -10 : 15) * fovPulse;
    } else {
        // Performance-Optimized Idle (Subtle breathing)
        state.camera.position.lerp(targetPos, 0.05);
        currentLookAt.current.lerp(lookTarget, 0.05);
        state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, 75, 0.05);
        
        const time = state.clock.getElapsedTime();
        state.camera.position.x += Math.sin(time * 0.4) * 0.005;
        state.camera.position.y += Math.cos(time * 0.3) * 0.005;
    }

    state.camera.updateProjectionMatrix();
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}

function Scene({ isGLReady }: { isGLReady: boolean }) {
  const { scene, isInitialized, setScene, activeSection, setActiveSection, isTransitioning, transitionStartTime } = useEngineStore();

  useEffect(() => {
    // Zero-Delay Jump: We no longer use DISMANTLE or REBUILD stages for the entry.
    // The CameraRig handles the 2.5s flight, and we switch to INTERFACE at the end.
  }, [scene, setScene]);

  const colorMap = {
    HOME: '#00f2ff',
    ABOUT: '#00f2ff',
    PROJECTS: '#00ff88',
    SKILLS: '#bc00ff',
    CONTACT: '#ff4400'
  } as const;

  const activeColor = colorMap[activeSection] || '#00f2ff';

  const connectionPoints = useMemo(() => [
    { position: [-5.0, 3.6, 0] as [number, number, number] }, // Max Visibility
    { position: [5.0, 3.6, 0] as [number, number, number] },  // Max Visibility
    { position: [-5.0, -3.6, 0] as [number, number, number] }, // Max Visibility
    { position: [5.0, -3.6, 0] as [number, number, number] },  // Max Visibility
  ], []);

  return (
    <>
      <ambientLight intensity={0.1} />
      <spotLight 
        position={[15, 20, 5]} 
        angle={0.15} 
        penumbra={1} 
        intensity={activeSection === 'CONTACT' ? 60 : 30} 
        color={activeColor}
        castShadow 
      />
      <pointLight position={[-15, -15, -15]} intensity={10} color={activeColor} />
      <directionalLight position={[5, 10, 5]} intensity={3} color="#ffffff" />
      
      {/* RectAreaLights for realistic surface highlight on the core shards */}
      <rectAreaLight
        width={10}
        height={10}
        intensity={15}
        color={activeColor}
        position={[0, 10, 0]}
        lookAt={[0, 0, 0]}
      />
      
      <fog attach="fog" args={['#050505', 2, 18]} />

        <group>
          <LaptopModel 
            open={isInitialized || isTransitioning} 
            visible={scene === 'BOOT'} 
            onBoot={() => {
              if (scene === 'BOOT') {
                setTimeout(() => {
                  setScene('INTERFACE');
                  useEngineStore.getState().setTransitioning(false);
                }, 6000); 
              }
            }} 
          />
          
          {/* Core components now appear during the final stage of the boot sequence */}
          <group visible={scene === 'INTERFACE' || (scene === 'BOOT' && useEngineStore.getState().transitionProgress > 0.75)}>
              <CoreEngine />
              <GridFloor color={activeColor} />
              <GlobalParticles color={activeColor} count={1000} />
              {scene === 'INTERFACE' && (
                <NeuralConnections points={connectionPoints} color={activeColor} />
              )}
          </group>
        </group>

      {scene === 'INTERFACE' && (
        <group position={[0, 0, 0]}>
          <NavigationNode 
            position={connectionPoints[0].position} 
            label="BIOGRAPHY" 
            active={activeSection === 'ABOUT'}
            onClick={() => setActiveSection('ABOUT')}
            color={activeSection === 'ABOUT' ? activeColor : '#00f2ff'}
          />
          <NavigationNode 
            position={connectionPoints[1].position} 
            label="PROJECTS" 
            active={activeSection === 'PROJECTS'}
            onClick={() => setActiveSection('PROJECTS')}
            color={activeSection === 'PROJECTS' ? activeColor : '#00f2ff'}
          />
          <NavigationNode 
            position={connectionPoints[2].position} 
            label="SKILLS" 
            active={activeSection === 'SKILLS'}
            onClick={() => setActiveSection('SKILLS')}
            color={activeSection === 'SKILLS' ? activeColor : '#00f2ff'}
          />
          <NavigationNode 
            position={connectionPoints[3].position} 
            label="CONNECT" 
            active={activeSection === 'CONTACT'}
            onClick={() => setActiveSection('CONTACT')}
            color={activeSection === 'CONTACT' ? activeColor : '#00f2ff'}
          />
        </group>
      )}
      
      <Environment preset="night" />
      <PerformanceScaler />
      <ContactShadows resolution={1024} scale={30} blur={3} opacity={0.6} far={15} color="#000000" />

      <CinematicEffects 
        isGLReady={isGLReady} 
        isTransitioning={isTransitioning} 
        transitionStartTime={transitionStartTime}
      />
      <BakeShadows />
    </>
  );
}

function MainUIOverlay() {
  const { scene } = useEngineStore();
  return (
    <>
      <HUDOverlay />
      {scene === 'INTERFACE' && <ProjectPanel />}
    </>
  );
}

export default function SceneComponent({ onWebGLError }: { onWebGLError: () => void }) {
  const [isGLReady, setIsGLReady] = useState(false);

  return (
    <div className="h-full w-full overflow-hidden bg-[#050505]">
      <SceneInternalErrorBoundary onError={onWebGLError}>
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: false, 
            powerPreference: "high-performance",
            alpha: false,
            stencil: false,
            depth: true 
          }}
          onCreated={({ gl }) => {
            setIsGLReady(true);
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              onWebGLError();
              setIsGLReady(false);
            });
          }}
          onError={(err) => {
            console.error('CRITICAL CANVAS ERROR:', err);
            onWebGLError();
            setIsGLReady(false);
          }}
        >
          <CameraRig />
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          <Suspense fallback={null}>
            <Scene isGLReady={isGLReady} />
          </Suspense>
        </Canvas>
      </SceneInternalErrorBoundary>
      <MainUIOverlay />
      <Loader />
    </div>
  );
}

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

  useFrame((state) => {
    const time = Date.now();
    const elapsed = time - transitionStartTime;
    const progress = Math.min(elapsed / 2500, 1);
    
    // Bell curve for motion effects (peaks at 0.5)
    const pulse = Math.sin(progress * Math.PI);
    
    state.gl.autoClear = true;
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={true}>
      <Bloom 
        luminanceThreshold={1.0} 
        mipmapBlur 
        intensity={isTransitioning ? 2.5 : 1.0} 
        radius={0.7} 
      />
      <ChromaticAberration 
        offset={new THREE.Vector2(isTransitioning ? 0.005 : 0.0008, 0)} 
      />
      <Vignette offset={0.2} darkness={1.1} />
      <Noise opacity={0.04} premultiply />
      <DepthOfField 
        focusDistance={0.015} 
        focalLength={isTransitioning ? 0.1 : 0.05} 
        bokehScale={isTransitioning ? 6 : 2} 
        height={480} 
      />
    </EffectComposer>
  );
});
CinematicEffects.displayName = 'CinematicEffects';

// --- Camera Rig for Cinematic Movement ---
function CameraRig() {
  const { scene, activeSection, isTransitioning, transitionStartTime, isReturningHome, setTransitionProgress } = useEngineStore();
  
  const startPos = useRef(new THREE.Vector3(0, 0, 10));
  const startLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioningRef = useRef(false);

  useFrame((state: any) => {
    const now = Date.now();
    const elapsed = now - transitionStartTime;
    const duration = scene === 'BOOT' ? 6000 : 2500; // 6 Seconds for high-level cinematic boot, 2.5s for navigation
    const rawProgress = Math.min(elapsed / duration, 1);
    
    if (isTransitioning) {
        setTransitionProgress(rawProgress);
    }
    
    // Custom Staged Easing
    let t = rawProgress;
    let targetPos = new THREE.Vector3(0, 0, 12);
    let lookTarget = new THREE.Vector3(0, 0, 0);
    let targetFov = 75;

    if (scene === 'BOOT' && isTransitioning) {
        if (rawProgress < 0.25) {
            // STAGE 1: THE CHARGE (0.0s - 1.5s)
            // Slow cinematic creep towards the laptop
            const stageT = rawProgress / 0.25;
            targetPos.set(0, 1.1, THREE.MathUtils.lerp(10, 9, stageT));
            lookTarget.set(0, 1.1, 0);
            targetFov = 75 - (stageT * 5); // Focus in
        } else if (rawProgress < 0.58) {
            // STAGE 2: THE SHATTER (1.5s - 3.5s)
            // Camera FREEZES to let the user see the laptop explode
            targetPos.set(0, 1.1, 9);
            lookTarget.set(0, 1.1, 0);
            targetFov = 70;
        } else if (rawProgress < 0.92) {
            // STAGE 3: THE VOID PASSAGE (3.5s - 5.5s)
            // Ultra-fast "Singularity" zoom through the debris
            const stageT = (rawProgress - 0.58) / 0.34;
            const easeT = Math.pow(stageT, 4); // Even more aggressive acceleration
            
            targetPos.set(0, 1.1, THREE.MathUtils.lerp(9, -2, easeT));
            lookTarget.set(0, 1.1, -10);
            
            // Dramatic "Warp Speed" FOV stretch
            targetFov = 70 + (Math.sin(stageT * Math.PI) * 40);
        } else {
            // STAGE 4: ARRIVAL (5.5s - 6.0s)
            // Camera stabilizes at core
            targetPos.set(0, 0, 12);
            lookTarget.set(0, 0, 0);
            targetFov = 75;
        }
    } else if (scene === 'INTERFACE') {
        switch(activeSection) {
            case 'ABOUT':
                targetPos.set(-7.5, 5.0, 8);
                lookTarget.set(-5.0, 3.6, 0);
                break;
            case 'PROJECTS':
                targetPos.set(7.5, 5.0, 8);
                lookTarget.set(5.0, 3.6, 0);
                break;
            case 'SKILLS':
                targetPos.set(-7.5, -5.0, 8);
                lookTarget.set(-5.0, -3.6, 0);
                break;
            case 'CONTACT':
                targetPos.set(7.5, -5.0, 8);
                lookTarget.set(5.0, -3.6, 0);
                break;
            case 'HOME':
            default:
                targetPos.set(0, 0, 12);
                lookTarget.set(0, 0, 0);
                break;
        }
    }

    if (isTransitioning) {
        const pathT = scene === 'BOOT' ? Math.pow(t, 2) : t;
        state.camera.position.lerpVectors(startPos.current, targetPos, pathT);
        currentLookAt.current.lerpVectors(startLookAt.current, lookTarget, pathT);
        
        const fovPulse = Math.sin(t * Math.PI);
        targetFov = 75 + (isReturningHome ? -15 : 25) * fovPulse;
    } else {
        state.camera.position.lerp(targetPos, 0.05);
        currentLookAt.current.lerp(lookTarget, 0.05);
        targetFov = 75;
        
        const time = state.clock.getElapsedTime();
        state.camera.position.x += Math.sin(time * 0.4) * 0.002;
        state.camera.position.y += Math.cos(time * 0.3) * 0.002;
    }

    state.camera.fov = THREE.MathUtils.lerp(state.camera.fov, targetFov, 0.1);
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
        position={[20, 20, 20]} 
        angle={0.2} 
        penumbra={1} 
        intensity={activeSection === 'CONTACT' ? 40 : 15} 
        color={activeColor}
        castShadow 
      />
      <pointLight position={[-15, -15, -15]} intensity={5} color={activeColor} />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
      
      {/* RectAreaLights for realistic surface highlight on the core shards */}
      <rectAreaLight
        width={3}
        height={3}
        intensity={10}
        color={activeColor}
        position={[5, 5, 5]}
        lookAt={[0, 0, 0]}
      />
      
      <fog attach="fog" args={['#050505', 2, 15]} />

      <group>
        {(scene === 'BOOT') && (
          <LaptopModel 
            open={isInitialized || isTransitioning} 
            visible={true} 
            onBoot={() => {
              if (scene === 'BOOT') {
                // Extended Cinematic Timeout
                setTimeout(() => {
                  setScene('INTERFACE');
                  useEngineStore.getState().setTransitioning(false);
                }, 6000); 
              }
            }} 
          />
        )}
        
        {(scene === 'BOOT' || scene === 'INTERFACE') && (
          <group visible={scene === 'INTERFACE' || (scene === 'BOOT' && isTransitioning)}>
              <CoreEngine color={activeColor} />
              <GridFloor color={activeColor} />
              <GlobalParticles color={activeColor} count={800} />
              {scene === 'INTERFACE' && (
                <NeuralConnections points={connectionPoints} color={activeColor} />
              )}
          </group>
        )}
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
      
      <Environment preset="city" />
      <PerformanceScaler />
      <ContactShadows resolution={1024} scale={20} blur={2.5} opacity={0.4} far={15} color="#000000" />

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

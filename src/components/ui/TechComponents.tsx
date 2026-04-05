'use client';

import { useFrame } from '@react-three/fiber';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useEngineStore } from '@/store/useEngineStore';

export function GridFloor({ color = "#00f2ff" }: { color?: string }) {
  const gridRef = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.getElapsedTime() * 0.5) % 2;
    }
  });

  return (
    <group position={[0, -4, 0]}>
      <gridHelper 
        args={[100, 50, color, "#111"]} 
        rotation={[0, 0, 0]} 
        onUpdate={(self) => {
            if (self.material instanceof THREE.Material) {
                self.material.transparent = true;
                self.material.opacity = 0.2;
            }
        }}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#000" 
          transparent 
          opacity={0.8} 
          metalness={1} 
          roughness={0} 
        />
      </mesh>
    </group>
  );
}

export function DiagnosticLog({ activeSection }: { activeSection: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const timestamp = Math.random().toString(16).slice(2, 8).toUpperCase();
    const newLog = `[${timestamp}] SYNC_SEC: ${activeSection.toUpperCase()} ... OK`;
    setLogs(prev => [newLog, ...prev].slice(0, 5));
  }, [activeSection]);

  return (
    <div className="absolute bottom-24 left-8 font-mono text-[10px] text-cyan-500/60 flex flex-col gap-1 pointer-events-none select-none">
      {logs.map((log, i) => (
        <div key={i} className={i === 0 ? "text-cyan-400 opacity-100" : "opacity-40"}>
          {log}
        </div>
      ))}
    </div>
  );
}

export function HUDOverlay() {
  const { activeSection } = useEngineStore();
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] select-none">
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

      {/* Dynamic HUD Corners */}
      <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-cyan-500/30">
        <div className="absolute top-0 left-0 w-4 h-4 bg-cyan-500/20 animate-pulse" />
      </div>
      <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-cyan-500/30" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-cyan-500/30" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-cyan-500/30" />

      {/* Diagnostics */}
      <DiagnosticLog activeSection={activeSection} />

      {/* System Status Text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-12 text-[8px] font-mono text-cyan-500/40 tracking-[0.3em] uppercase pointer-events-none">
        <span>sys_status: operational</span>
        <span>buffer: 0.002ms</span>
        <span>node_id: PRNV_0x11</span>
      </div>
    </div>
  );
}

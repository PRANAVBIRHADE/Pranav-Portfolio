'use client';

import { create } from 'zustand';

export type SceneState = 'BOOT' | 'DISMANTLE' | 'REBUILD' | 'INTERFACE';
export type Section = 'HOME' | 'ABOUT' | 'PROJECTS' | 'SKILLS' | 'CONTACT';

interface EngineState {
  scene: SceneState;
  progress: number;
  isInitialized: boolean;
  activeSection: Section;
  lastSection: Section;
  isTransitioning: boolean;
  isReturningHome: boolean;
  transitionStartTime: number;
  transitionProgress: number; // 0 to 1 for precise cinematic syncing
  setScene: (scene: SceneState) => void;
  setProgress: (progress: number) => void;
  setTransitionProgress: (progress: number) => void;
  setActiveSection: (section: Section) => void;
  setTransitioning: (status: boolean) => void;
  initSystem: () => void;
}

export const useEngineStore = create<EngineState>((set) => ({
  scene: 'BOOT',
  progress: 0,
  isInitialized: false,
  activeSection: 'HOME',
  lastSection: 'HOME',
  isTransitioning: false,
  isReturningHome: false,
  transitionStartTime: 0,
  transitionProgress: 0,
  setScene: (scene) => set({ scene }),
  setProgress: (progress) => set({ progress }),
  setTransitionProgress: (transitionProgress) => set({ transitionProgress }),
  setActiveSection: (section) => {
    const currentSection = useEngineStore.getState().activeSection;
    set({ 
      isTransitioning: true, 
      lastSection: currentSection,
      activeSection: section,
      isReturningHome: section === 'HOME',
      transitionStartTime: Date.now(),
      transitionProgress: 0
    });
    setTimeout(() => set({ isTransitioning: false, isReturningHome: false, transitionProgress: 1 }), 2500);
  },
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  initSystem: () => set({ 
    isInitialized: true,
    isTransitioning: true,
    transitionStartTime: Date.now(),
    transitionProgress: 0
  }),
}));

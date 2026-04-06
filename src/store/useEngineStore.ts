'use client';

import { create } from 'zustand';

export type SceneState = 'BOOT' | 'DISMANTLE' | 'REBUILD' | 'INTERFACE';
export type Section = 'HOME' | 'ABOUT' | 'PROJECTS' | 'SKILLS' | 'CONTACT';
export type TransitionPhase = 'IDLE' | 'SCATTERING' | 'REVERSING';

interface EngineState {
  scene: SceneState;
  progress: number;
  isInitialized: boolean;
  activeSection: Section;
  lastSection: Section;
  pendingSection: Section | null;
  transitionPhase: TransitionPhase;
  isTransitioning: boolean;
  isReturningHome: boolean;
  transitionStartTime: number;
  transitionProgress: number; 
  totalTransitionDuration: number;
  setScene: (scene: SceneState) => void;
  setProgress: (progress: number) => void;
  setTransitionProgress: (progress: number) => void;
  setActiveSection: (section: Section) => void;
  completeReverse: () => void;
  setTransitioning: (status: boolean) => void;
  hasSpoken: boolean;
  setHasSpoken: (hasSpoken: boolean) => void;
  initSystem: () => void;
}

export const useEngineStore = create<EngineState>((set, get) => ({
  scene: 'BOOT',
  progress: 0,
  isInitialized: false,
  activeSection: 'HOME',
  lastSection: 'HOME',
  pendingSection: null,
  transitionPhase: 'IDLE',
  isTransitioning: false,
  isReturningHome: false,
  transitionStartTime: 0,
  transitionProgress: 0,
  totalTransitionDuration: 0,
  setScene: (scene) => set({ scene }),
  setProgress: (progress) => set({ progress }),
  setTransitionProgress: (transitionProgress) => set({ transitionProgress }),
  setActiveSection: (section) => {
    const { activeSection } = get();
    
    if (section === activeSection) return;

    // A -> B Transition (Multi-phase)
    if (activeSection !== 'HOME' && section !== 'HOME') {
      set({
        isTransitioning: true,
        transitionPhase: 'REVERSING',
        pendingSection: section,
        transitionStartTime: Date.now(),
        totalTransitionDuration: 4500, // 1.5s reverse + 3.0s scatter
        transitionProgress: 0,
        isReturningHome: false
      });
      return;
    }

    // Section -> Home
    if (activeSection !== 'HOME' && section === 'HOME') {
      set({
        isTransitioning: true,
        transitionPhase: 'REVERSING',
        pendingSection: 'HOME',
        transitionStartTime: Date.now(),
        totalTransitionDuration: 2000,
        transitionProgress: 0,
        isReturningHome: true
      });
      return;
    }

    // Home -> Section
    set({ 
      isTransitioning: true, 
      transitionPhase: 'SCATTERING',
      lastSection: activeSection,
      activeSection: section,
      isReturningHome: false,
      transitionStartTime: Date.now(),
      totalTransitionDuration: 3000,
      transitionProgress: 0
    });
    
    setTimeout(() => {
        const current = get();
        if (current.transitionPhase === 'SCATTERING' && current.activeSection === section) {
            set({ isTransitioning: false, transitionPhase: 'IDLE' });
        }
    }, 3000);
  },
  completeReverse: () => {
    const { pendingSection, activeSection } = get();
    if (pendingSection === null) return;

    if (pendingSection === 'HOME') {
        set({
            activeSection: 'HOME',
            pendingSection: null,
            transitionPhase: 'IDLE',
            isTransitioning: false,
            isReturningHome: false,
            lastSection: activeSection,
            transitionProgress: 1
        });
        return;
    }

    // Continue to Scattering without resetting transitionStartTime
    set({
        activeSection: pendingSection,
        pendingSection: null,
        transitionPhase: 'SCATTERING',
        lastSection: activeSection
    });

    setTimeout(() => {
        const current = get();
        if (current.transitionPhase === 'SCATTERING' && current.activeSection === pendingSection) {
            set({ isTransitioning: false, transitionPhase: 'IDLE' });
        }
    }, 3000);
  },
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  hasSpoken: false,
  setHasSpoken: (hasSpoken) => set({ hasSpoken }),
  initSystem: () => set({ 
    isInitialized: true,
    isTransitioning: true,
    transitionStartTime: Date.now(),
    transitionProgress: 0
  }),
}));

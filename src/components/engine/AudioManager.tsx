'use client';

import { useEffect } from 'react';
import { useEngineStore } from '@/store/useEngineStore';

export default function AudioManager() {
  const { isInitialized } = useEngineStore();

  // AI Voice Synthesis (JARVIS Style)
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    
    const performSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      // JARVIS is calm, British, and composed
      utterance.pitch = 0.8; 
      utterance.rate = 0.9;
      utterance.volume = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      // Prioritize "Google UK English Male" or any "en-GB" male voice for cinematic feel
      const preferredVoice = voices.find(v => 
        (v.name.includes('UK English Male') || v.name.includes('Great Britain')) && v.name.toLowerCase().includes('male')
      ) || voices.find(v => v.lang === 'en-GB') || voices[0];
      
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = performSpeak;
    } else {
      performSpeak();
    }
  };

  useEffect(() => {
    if (isInitialized) {
      // Trigger Initial AI Welcome
      setTimeout(() => {
        speak("Welcome to Pranav O. S.");
      }, 500); // Trigger slightly earlier to match the 6-second boot time cleanly
    }
  }, [isInitialized]);

  return null; // Side-effect only component
}

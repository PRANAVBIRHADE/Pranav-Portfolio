'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEngineStore } from '@/store/useEngineStore';
import { 
  Zap, 
  User, 
  Cpu, 
  ExternalLink,
  Github,
  Instagram,
  MessageCircle,
  Terminal,
  Globe,
  Layers
} from 'lucide-react';
import HolographicPanel from './HolographicPanel';
import { Typewriter } from './Typewriter';
import { useEffect, useState } from 'react';

const SIDE_MAP: Record<string, 'left' | 'right'> = {
  ABOUT: 'left',
  SKILLS: 'left',
  PROJECTS: 'right',
  CONTACT: 'right'
};

const contentMap = {
  ABOUT: {
    title: "BIOGRAPHY_CORE",
    subtitle: "Lead Web Architect & AI Engineer",
    text: "Pranav Birhade is a visionary developer specializing in the intersection of high-fidelity 3D interfaces and scalable AI infrastructure. With a background in structural digital engineering, he builds immersive web ecosystems that transcend traditional 2D boundaries.",
    tags: ["React/Next.js", "Three.js", "Node.js", "AI Integration"],
    icon: User,
    details: [
      { label: "Status", value: "Available for High-Impact Projects" },
      { label: "Location", value: "Global / Remote" },
      { label: "Expertise", value: "Creative Development" }
    ]
  },
  PROJECTS: {
    title: "SYNERGY_PROTOTYPES",
    subtitle: "Deployed Production Systems",
    text: "Exploring the limits of modern web technology through high-performance applications and real-time visualization engines.",
    tags: ["Production", "3D-Warp", "Cloud-Scalable"],
    icon: Layers,
    items: [
      { name: "Neuro-Terminal CMS", desc: "A 3D-driven content management system with real-time neural visualization.", link: "https://github.com" },
      { name: "Quantum Portfolio Engine", desc: "A high-fidelity cinematic framework for showcasing structural engineering data.", link: "https://github.com" },
      { name: "ShatterCore AI", desc: "Vector-based fragmentation engine for real-time physics in web browsers.", link: "https://github.com" }
    ]
  },
  SKILLS: {
    title: "NEURAL_CAPABILITIES",
    subtitle: "Advanced Tech Stack",
    text: "Synchronized skillsets across the full-stack spectrum, optimized for high-performance and cinematic user experiences.",
    tags: ["Full Stack", "Graphic Rendering", "State Control"],
    icon: Cpu,
    skills: [
      { name: "Frontend Mastery", level: 98, tech: "React, Next.js, Framer Motion" },
      { name: "3D Rendering", level: 92, tech: "Three.js, WebGL, GLSL Shaders" },
      { name: "Backend Logic", level: 85, tech: "Node.js, PostgreSQL, AI APIs" },
      { name: "System Design", level: 90, tech: "Scalable Architecture, DevOps" }
    ]
  },
  CONTACT: {
    title: "TERMINAL_UPLINK",
    subtitle: "Neuro-Channel Communication",
    text: "Establish a direct link via encrypted p2p channels. Ready for high-impact collaborations and infrastructure consulting.",
    tags: ["Encrypted", "Direct", "p2p"],
    icon: Zap,
    socials: [
      { name: "GitHub", icon: Github, link: "https://github.com", color: "#ffffff" },
      { name: "Instagram", icon: Instagram, link: "https://instagram.com", color: "#E1306C" },
      { name: "WhatsApp", icon: MessageCircle, link: "https://wa.me/yournumber", color: "#25D366" }
    ]
  }
};

export default function ProjectPanel() {
  const activeSection = useEngineStore((state) => state.activeSection);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (activeSection !== 'HOME') {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [activeSection]);

  if (activeSection === 'HOME' || !isVisible) return null;

  const content = contentMap[activeSection as keyof typeof contentMap];
  if (!content) return null;

  const side = SIDE_MAP[activeSection] || 'left';
  const Icon = content.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection}
        initial={{ 
          opacity: 0, 
          x: side === 'left' ? -150 : 150, 
          rotateY: side === 'left' ? 35 : -35,
          scale: 0.9
        }}
        animate={{ 
          opacity: 1, 
          x: 0, 
          rotateY: 0,
          scale: 1,
          transition: {
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1] // Custom quintic ease out
          }
        }}
        exit={{ 
          opacity: 0, 
          x: side === 'left' ? -100 : 100,
          rotateY: side === 'left' ? -20 : 20,
          scale: 0.95,
          filter: 'blur(20px)',
          transition: { duration: 0.6 }
        }}
        className={`fixed top-1/2 -translate-y-1/2 z-[70] w-full max-w-xl pointer-events-none px-6 ${side === 'left' ? 'left-6' : 'right-6'}`}
        style={{ perspective: '1200px' }}
      >
        <HolographicPanel className="pointer-events-auto overflow-hidden ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Section Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
              >
                <Icon className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <div>
                 <Typewriter 
                  text={content.title} 
                  className="text-3xl font-black tracking-tighter text-white uppercase italic" 
                  delay={40}
                />
                <div className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.4em] mt-1">
                  {content.subtitle}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-sm text-cyan-100/70 py-2 leading-relaxed font-light border-l border-cyan-500/20 pl-4">
               <Typewriter text={content.text} delay={15} />
            </div>

            {/* Dynamic Content Based on Section */}
            {activeSection === 'ABOUT' && 'details' in content && (
                <div className="grid grid-cols-2 gap-6 border-t border-cyan-500/10 pt-8">
                    {content.details.map((d, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          key={i} 
                          className="space-y-1"
                        >
                            <div className="text-[9px] uppercase tracking-widest text-cyan-500/50">{d.label}</div>
                            <div className="text-xs text-white font-mono break-all bg-white/5 p-2 rounded border border-white/5">{d.value}</div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeSection === 'PROJECTS' && 'items' in content && (
                <div className="space-y-4">
                    {content.items.map((item, i) => (
                        <motion.a 
                            key={i}
                            href={item.link}
                            target="_blank"
                            initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.15 }}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                                    <Globe className="w-5 h-5 text-cyan-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{item.name}</div>
                                    <div className="text-[10px] text-cyan-500/60 uppercase tracking-widest">{item.desc}</div>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-cyan-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </motion.a>
                    ))}
                </div>
            )}

            {activeSection === 'SKILLS' && 'skills' in content && (
                <div className="grid gap-6">
                    {content.skills.map((s, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-mono uppercase tracking-tighter">
                                <span className="text-white/80">{s.name} <span className="text-cyan-900 mx-2">//</span> <span className="text-cyan-600">{s.tech}</span></span>
                                <span className="text-cyan-400">{s.level}%</span>
                            </div>
                            <div className="h-1.5 bg-cyan-900/20 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${s.level}%` }}
                                    transition={{ duration: 2, delay: 0.5 + i * 0.1, ease: 'circOut' }}
                                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeSection === 'CONTACT' && 'socials' in content && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {content.socials.map((social, i) => (
                            <motion.a
                                key={i}
                                href={social.link}
                                target="_blank"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-cyan-500/5 hover:border-cyan-500/50 transition-all group"
                            >
                                <social.icon 
                                    className="w-6 h-6 transition-all group-hover:scale-110" 
                                    style={{ color: social.color }} 
                                />
                                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{social.name}</span>
                            </motion.a>
                        ))}
                    </div>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="p-6 border border-dashed border-cyan-500/20 rounded-2xl bg-cyan-500/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -z-10" />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-cyan-400 tracking-[0.3em]">SECURE_SOCKET_LOCKED</span>
                        </div>
                        <div className="text-[11px] font-mono text-white/50 leading-relaxed uppercase space-y-1">
                            <p>{'>'} WAITING FOR TRANSMISSION...</p>
                            <p>{'>'} HANDSHAKE PROTOCOL: V3.0</p>
                            <p>{'>'} ENCRYPTION: 256-BIT NEURAL-RSA</p>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="flex flex-wrap gap-3 pt-6 border-t border-white/5">
              {content.tags.map((tag, i) => (
                <span key={i} className="text-[9px] font-mono bg-cyan-500/5 border border-cyan-500/10 px-3 py-1 text-cyan-500/40 uppercase tracking-[0.2em] rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </HolographicPanel>
      </motion.div>
    </AnimatePresence>
  );
}

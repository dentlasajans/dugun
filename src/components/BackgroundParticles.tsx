import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function BackgroundParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; s: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth <= 430;
    const count = isMobile ? 25 : 40;
    const items = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      s: Math.random() * 3 + 1, // subtle stars
      duration: Math.random() * 10 + 10,
      delay: Math.random() * -20,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-[#fdfbf7]">
      {/* Cinematic glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[500px] h-[500px] bg-[#dcc692]/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[400px] h-[400px] bg-[#ffeed9]/40 blur-[100px] rounded-full" />
      
      {/* Floating particles */}
      {particles.map(p => (
        <motion.div
           key={p.id}
           className="absolute rounded-full bg-[#dcc692] drop-shadow-[0_0_2px_rgba(212,175,55,0.4)]"
           style={{ width: p.s, height: p.s, left: `${p.x}%`, top: `${p.y}%` }}
           animate={{
             opacity: [0.1, 0.8, 0.1],
             scale: [1, 1.5, 1],
           }}
           transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

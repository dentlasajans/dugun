import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import PremiumWelcome from './components/PremiumWelcome';
import BackgroundParticles from './components/BackgroundParticles';
import AdminPanel from './AdminPanel';
import SystemAdminPanel from './SystemAdminPanel';

function Home() {
  const { linkName } = useParams<{ linkName: string }>();
  
  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center w-full selection:bg-[#d4af37]/30">
      {/* 
        Strict Mobile Container 
        Max width simulates mobile view on desktop
        100dvh handles mobile browser chrome correctly 
      */}
      <div className="w-full max-w-[440px] h-[100dvh] relative overflow-hidden flex flex-col preserve-3d">
        <BackgroundParticles />
        <div className="flex-1 w-full relative z-10 overflow-hidden no-scrollbar">
          <PremiumWelcome weddingId={linkName || 'demo'} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<SystemAdminPanel />} />
      <Route path="/d1/:id" element={<AdminPanel />} />
      <Route path="/d1" element={<AdminPanel />} />
      <Route path="/:linkName" element={<Home />} />
    </Routes>
  );
}



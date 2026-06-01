import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import PremiumWelcome from './components/PremiumWelcome';
import BackgroundParticles from './components/BackgroundParticles';
import AdminPanel from './AdminPanel';
import SystemAdminPanel from './SystemAdminPanel';

import PhotoGalleryLogin from './PhotoGalleryLogin';
import LandingPage from './LandingPage';

function Home() {
  const { linkName } = useParams<{ linkName: string }>();
  
  return (
    <div className="min-h-[100dvh] bg-[#f2efe9] flex items-center justify-center w-full selection:bg-[#d4af37]/30">
      {/* 
        Strict Mobile Container 
        Max width simulates mobile view on desktop
      */}
      <div className="w-full max-w-[440px] min-h-[100dvh] relative overflow-hidden flex flex-col preserve-3d shadow-2xl bg-transparent">
        <BackgroundParticles />
        <div className="flex-1 w-full relative z-10 overflow-hidden no-scrollbar flex flex-col">
          <PremiumWelcome weddingId={linkName || 'demo'} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<SystemAdminPanel />} />
      <Route path="/d1/:id" element={<AdminPanel />} />
      <Route path="/d1" element={<AdminPanel />} />
      <Route path="/:linkName/giris" element={<PhotoGalleryLogin />} />
      <Route path="/:linkName" element={<Home />} />
    </Routes>
  );
}



import { motion } from 'motion/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Camera, Video, Sparkles, Star } from 'lucide-react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { db } from '../firebase';
import imageCompression from 'browser-image-compression';

const SakuraPetal = ({ cx, cy, scale, rot }: { cx: number, cy: number, scale: number, rot: number }) => (
  <path transform={`translate(${cx}, ${cy}) scale(${scale}) rotate(${rot})`} d="M 0,0 C -8,-10 -12,-20 -5,-25 Q 0,-22 0,-18 Q 0,-22 5,-25 C 12,-20 8,-10 0,0 Z" fill="#ffb7c5" stroke="#ff8da1" strokeWidth="0.5" />
);

const SakuraFlower = ({ cx, cy, scale = 1, rot = 0 }: { cx: number, cy: number, scale?: number, rot?: number }) => (
  <g transform={`translate(${cx}, ${cy}) scale(${scale}) rotate(${rot})`}>
    {[0, 72, 144, 216, 288].map(angle => (
      <path key={angle} transform={`rotate(${angle})`} d="M 0,0 C -8,-10 -12,-20 -5,-25 Q 0,-22 0,-18 Q 0,-22 5,-25 C 12,-20 8,-10 0,0 Z" fill="#ffb7c5" stroke="#ff8da1" strokeWidth="0.5" />
    ))}
    <circle cx="0" cy="0" r="2.5" fill="#e85d75" />
    {[0, 72, 144, 216, 288].map(angle => (
      <line key={'stamen'+angle} x1="0" y1="0" x2="0" y2="-8" stroke="#ff8da1" strokeWidth="0.8" transform={`rotate(${angle + 36})`} />
    ))}
    <circle cx="0" cy="0" r="1.2" fill="#fff" />
  </g>
);

const AnimeSakuraBranch = () => (
  <svg viewBox="0 0 1000 400" className="w-full h-full drop-shadow-md" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
    <defs>
      <filter id="sakura-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Main branches */}
    <path d="M -50,10 Q 200,120 500,70 T 1100,50" fill="none" stroke="#2c201d" strokeWidth="10" strokeLinecap="round" />
    <path d="M 150,90 Q 250,220 400,250" fill="none" stroke="#2c201d" strokeWidth="6" strokeLinecap="round" />
    <path d="M 300,215 Q 350,300 450,290" fill="none" stroke="#2c201d" strokeWidth="3" strokeLinecap="round" />
    <path d="M 600,65 Q 750,240 900,200" fill="none" stroke="#2c201d" strokeWidth="5" strokeLinecap="round" />
    <path d="M 700,140 Q 800,200 850,180" fill="none" stroke="#2c201d" strokeWidth="3" strokeLinecap="round" />
    <path d="M 50,15 Q 100,70 200,100" fill="none" stroke="#2c201d" strokeWidth="4" strokeLinecap="round" />
    
    <g filter="url(#sakura-glow)">
      {/* Back Flowers */}
      <SakuraFlower cx={120} cy={80} scale={1.2} rot={80} />
      <SakuraFlower cx={240} cy={190} scale={1.4} rot={45} />
      <SakuraFlower cx={380} cy={240} scale={1.3} rot={15} />
      
      {/* Flowers placed along branches */}
      <SakuraFlower cx={150} cy={90} scale={1.8} rot={10} />
      <SakuraFlower cx={300} cy={215} scale={1.5} rot={-20} />
      <SakuraFlower cx={450} cy={290} scale={1.2} rot={110} />
      <SakuraFlower cx={500} cy={70} scale={2.0} rot={40} />
      <SakuraFlower cx={600} cy={65} scale={1.2} rot={-30} />
      <SakuraFlower cx={700} cy={140} scale={1.7} rot={60} />
      <SakuraFlower cx={750} cy={240} scale={1.4} rot={12} />
      <SakuraFlower cx={850} cy={180} scale={1.1} rot={-45} />
      <SakuraFlower cx={900} cy={200} scale={1.5} rot={55} />
      <SakuraFlower cx={950} cy={60} scale={1.6} rot={0} />

      {/* Scattered/flying petals */}
      <SakuraPetal cx={50} cy={170} scale={1.5} rot={45} />
      <SakuraPetal cx={180} cy={270} scale={1.2} rot={110} />
      <SakuraPetal cx={350} cy={120} scale={1} rot={-30} />
      <SakuraPetal cx={550} cy={200} scale={1.4} rot={70} />
      <SakuraPetal cx={780} cy={100} scale={1.2} rot={15} />
      <SakuraPetal cx={820} cy={300} scale={1.3} rot={-80} />
      <SakuraPetal cx={950} cy={140} scale={1.1} rot={40} />
    </g>
  </svg>
);

const FallingSakuraPetals = () => {
  const petals = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animDuration: Math.random() * 10 + 12,
      animDelay: Math.random() * -20,
      size: Math.random() * 0.7 + 0.6,
      startRot: Math.random() * 360,
      rotDirection: Math.random() > 0.5 ? 1 : -1
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[4]">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute drop-shadow-sm opacity-80"
          style={{
            left: `${p.left}%`,
            width: `${16 * p.size}px`,
            height: `${24 * p.size}px`,
          }}
          initial={{ top: -50, rotate: p.startRot, x: 0 }}
          animate={{ 
            top: '120%', 
            rotate: p.startRot + (360 * p.rotDirection),
            x: [0, 40, -40, 0] 
          }}
          transition={{
            top: { duration: p.animDuration, repeat: Infinity, ease: 'linear', delay: p.animDelay },
            rotate: { duration: p.animDuration, repeat: Infinity, ease: 'linear', delay: p.animDelay },
            x: { duration: p.animDuration * 0.7, repeat: Infinity, ease: 'easeInOut', delay: p.animDelay }
          }}
        >
          <svg viewBox="-12 -28 24 30" className="w-full h-full overflow-visible">
             <path d="M 0,0 C -8,-10 -12,-20 -5,-25 Q 0,-22 0,-18 Q 0,-22 5,-25 C 12,-20 8,-10 0,0 Z" fill="#ffb7c5" stroke="#ff8da1" strokeWidth="0.5" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

const GlowingParticles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animDuration: Math.random() * 12 + 10,
      animDelay: Math.random() * -15, // Negative delay to pre-start animation
      size: Math.random() * 4 + 4, // slightly bigger for star icon
      opacity: Math.random() * 0.4 + 0.2, // slightly transparent
      rotation: Math.random() * 360,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute flex items-center justify-center filter drop-shadow-[0_0_4px_rgba(0,0,0,0.6)]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          initial={{ top: -30, rotate: p.rotation }}
          animate={{ top: '100%', rotate: p.rotation + 360 }}
          transition={{
            duration: p.animDuration,
            repeat: Infinity,
            ease: "linear",
            delay: p.animDelay,
          }}
        >
          <Star className="text-black fill-black w-full h-full" />
        </motion.div>
      ))}
    </div>
  );
};

export default function PremiumWelcome({ weddingId }: { weddingId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isInstantClose, setIsInstantClose] = useState(false);
  
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [wedding, setWedding] = useState({
    id: weddingId || 'demo',
    brideName: '...',
    groomName: '...',
    text1: 'Yükleniyor...',
    text2: '...'
  });

  useEffect(() => {
    const fetchWedding = async () => {
       try {
         const searchParam = weddingId || 'demo';
         const q = query(collection(db, 'weddings'), where('linkName', '==', searchParam));
         const querySnapshot = await getDocs(q);
         
         if (!querySnapshot.empty) {
           const docObj = querySnapshot.docs[0];
           setWedding({ id: docObj.id, ...docObj.data() } as any);
         } else {
           // Also try by id if linkName fails
           const q2 = query(collection(db, 'weddings'), where('id', '==', searchParam));
           const querySnapshot2 = await getDocs(q2);
           if (!querySnapshot2.empty) {
             const docObj = querySnapshot2.docs[0];
             setWedding({ id: docObj.id, ...docObj.data() } as any);
           } else {
             setWedding({
               id: 'demo',
               brideName: 'Elif',
               groomName: 'Can',
               text1: 'Hikayemiz Başlıyor...',
               text2: 'Masalsı anılarımıza ve en mutlu günümüze ortak olduğunuz için sonsuz teşekkürler.'
             });
           }
         }
       } catch (err) {
         setWedding({
             id: 'demo',
             brideName: 'Elif',
             groomName: 'Can',
             text1: 'Hikayemiz Başlıyor...',
             text2: 'Masalsı anılarımıza ve en mutlu günümüze ortak olduğunuz için sonsuz teşekkürler.'
         });
       }
    };
    fetchWedding();
  }, [weddingId]);

  const handleClose = () => {
    if (isOpen) {
      setIsInstantClose(true);
      setIsOpen(false);
      setTimeout(() => setIsInstantClose(false), 50);
    }
  };

  // Common animation for the envelope parts
  const envelopeDropAnim = { y: isOpen ? 600 : 0, opacity: isOpen ? 0 : 1 };
  const envelopeDropTrans = { 
    duration: isInstantClose ? 0 : 0.8, 
    delay: isOpen ? 1.0 : 0, 
    ease: isOpen ? "easeIn" : "easeOut" 
  };

  return (
    <div 
      className="relative w-full h-full min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden font-sans cursor-pointer bg-transparent"
      onClick={handleClose}
    >
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#f2efe9]/40 to-[#e6dfd1]/90" />
      <GlowingParticles />
      {/* Anime Sakura Branch Top Decoration */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-[25vh] sm:h-[30vh] pointer-events-none z-[5] flex justify-center origin-top"
        animate={{ 
          y: isOpen ? '-100%' : '-15%', 
          scale: 0.75,
          opacity: isOpen ? 0 : 0.6 
        }}
        transition={{ duration: isInstantClose ? 0 : 0.8, ease: "easeInOut" }}
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
        }}
      >
        <FallingSakuraPetals />
        <AnimeSakuraBranch />
      </motion.div>

      {/* Title above envelope */}
      <motion.div 
         className="absolute top-[16%] sm:top-[18%] flex flex-col items-center pointer-events-none z-10"
         animate={{ opacity: (isOpen || isHovering) ? 0 : 1, y: isHovering ? -10 : 0 }}
         transition={{ duration: isInstantClose ? 0 : 0.5 }}
      >
         <h1 className="font-script text-6xl text-[#3b3427] drop-shadow-sm" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.5)' }}>{wedding.brideName} & {wedding.groomName}</h1>
      </motion.div>

      <div 
         className="relative preserve-3d"
         style={{ perspective: '2000px' }}
         onMouseEnter={() => setIsHovering(true)}
         onMouseLeave={() => setIsHovering(false)}
         onClick={(e) => {
           if (!isOpen) {
             e.stopPropagation();
             setIsOpen(true);
           }
         }}
      >
        <motion.div
          className="relative w-[340px] h-[220px] preserve-3d"
          animate={{
            rotateX: isOpen ? 0 : (isHovering ? 8 : 12),
            rotateY: isOpen ? 0 : (isHovering ? -2 : -6),
            y: isOpen ? 50 : 0
          }}
          transition={{ duration: isInstantClose ? 0 : 1, type: 'spring', damping: 15 }}
        >
           {/* ENVELOPE BACK */}
           <motion.div 
             className="absolute inset-0 bg-[#ffffff] rounded-sm -z-10 shadow-[0_20px_50px_rgba(180,160,120,0.3)] overflow-hidden pointer-events-none border border-[#eaddb6]"
             animate={envelopeDropAnim}
             transition={envelopeDropTrans}
           >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffffff] to-[#faf8f2]" />
           </motion.div>

           {/* INVITATION CARD (SLIDES OUT) - Wrapped in overflow-hidden to hide bottom */}
           <motion.div 
             className="absolute z-20 pointer-events-none overflow-hidden" 
             style={{ top: -800, left: -50, right: -50 }}
             initial={false}
             animate={{ bottom: isOpen ? -800 : 0 }}
             transition={{ duration: isInstantClose ? 0 : 0.1, delay: isInstantClose ? 0 : 0.8 }}
           >
             <motion.div
               className="absolute left-1/2 w-[310px] h-[460px] bg-gradient-to-b from-[#ffffff] to-[#faf8f2] rounded-md shadow-[0_0_20px_rgba(180,160,120,0.2)] flex flex-col items-center text-center p-6 border border-[#eaddb6] pointer-events-auto cursor-default"
               style={{ x: '-50%', top: '805px', transformOrigin: 'top center' }}
               initial={false}
               onClick={(e) => e.stopPropagation()}
               animate={{ 
                 y: isOpen ? -260 : 0, 
                 scale: isOpen ? 1 : 0.9,
                 rotateZ: isOpen ? 0 : -2,
               }}
               transition={{ duration: isInstantClose ? 0 : 1.0, delay: isInstantClose ? 0 : (isOpen ? 0.6 : 0.7), type: 'spring', damping: 20 }}
             >
               {/* Card inner subtle border decoration */}
               <div className="absolute inset-2 border border-[#dcc692]/40 rounded-sm pointer-events-none" />
               <div className="absolute inset-3 border border-[#dcc692]/15 rounded-sm pointer-events-none" />
               
               {/* Card Content */}
               <motion.div 
                 className="w-full flex-1 flex flex-col items-center justify-center opacity-0 px-2 relative z-10"
                 animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : 20 }}
                 transition={{ delay: isInstantClose ? 0 : (isOpen ? 0.9 : 0), duration: isInstantClose ? 0 : 0.8 }}
               >
                  <h1 className="font-script text-7xl text-[#2a2419] mb-4 mt-6 tracking-wide leading-none">{wedding.brideName}<br/>&<br/>{wedding.groomName}</h1>
                  
                  <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-[#bfa46b] to-transparent mb-6" />

                  <p className="font-serif text-[14px] text-[#2a2419] font-medium leading-relaxed px-4 mb-4 text-balance">
                    {wedding.text2}
                  </p>

                  <div className="bg-white px-5 py-5 border border-[#eaddb6] rounded-md w-[112%] mb-2 shadow-[0_20px_40px_rgba(180,160,120,0.25)] relative z-30 transform -translate-y-2">
                     <p className="font-sans text-[12px] font-medium text-[#4a4235] leading-relaxed mb-4 px-2">
                       Bu geceyi ölümsüzleştirmek için çektiğiniz kareleri bizimle paylaşın.
                     </p>
                     
                     {/* The Upload Button */}
                     <input 
                       type="file" 
                       accept="image/*" 
                       id="photo-upload" 
                       className="hidden" 
                       multiple
                       onChange={async (e) => {
                         const files = e.target.files;
setTotalFiles(files ? files.length : 0);
setUploadedFilesCount(0);
setIsUploading(true);
                         if (!files || files.length === 0) return;
                         
                         // Feedback overlay setup
                         setIsOpen(true);
                         const button = document.getElementById('upload-button');
                         const originalText = button?.innerHTML || '';
                         if (button) button.innerHTML = '<span class="relative flex items-center justify-center gap-2"><svg class="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Yüklüyor...</span>';

                         try {
                           const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dejx0brol';
                           if (!cloudName) {
                             alert("Sistem hatası: Cloudinary Cloud Name tanımlı değil.");
                             if (button) button.innerHTML = originalText;
                             setIsOpen(false);
                             return;
                           }
                           const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'atlas_dugunler';
                           
                           const filesArray = Array.from(files);
                           
                           const uploadFile = async (file: File) => {
                             // Compress the image before uploading
                             const options = {
                               maxSizeMB: 0.8, // kaliteyi koruyarak dosya boyutunu biraz daha küçültüyoruz
                               maxWidthOrHeight: 1600, // HD kalitede tutuyoruz, yükleme hızını ciddi oranda artırır
                               useWebWorker: true,
                               fileType: 'image/jpeg'
                             };
                             let compressedFile = file;
                             try {
                               if (file.type.startsWith('image/')) {
                                  compressedFile = await imageCompression(file, options);
                               }
                             } catch (error) {
                               console.warn("Compression failed, uploading original file", error);
                             }

                             const formData = new FormData();
                             formData.append('file', compressedFile);
                             formData.append('upload_preset', uploadPreset);
                             formData.append('folder', `dugunler/${wedding.id}`);
                             
                             try {
                               const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                                 method: 'POST',
                                 body: formData
                               });
                               
                               if (!uploadRes.ok) {
                                 const errText = await uploadRes.text();
                                 console.error('Cloudinary hatası:', errText);
                               } else {
                                 const uploadData = await uploadRes.json();
                                 if (uploadData.secure_url) {
                                   await addDoc(collection(db, 'weddings', wedding.id, 'photos'), {
                                     secure_url: uploadData.secure_url,
                                     public_id: uploadData.public_id,
                                     format: uploadData.format || 'jpg',
                                     created_at: new Date().toISOString()
                                   });
                                 }
                               }
                             } catch (uploadError) {
                               console.error("Single file upload error", uploadError);
                             }
                             
                             // Her yükleme bittiğinde state'i functional olarak güncelle ki anında bar dolsun
                             setUploadedFilesCount(prev => prev + 1);
                           };

                           // 6 fotoğrafı aynı anda işleyen concurrent yükleyici yapı (Tarayıcı sınırlarına uygun maksimum hız)
                           let fileIndex = 0;
                           const workers = Array(6).fill(null).map(async () => {
                             while (fileIndex < filesArray.length) {
                               const currentIndex = fileIndex++;
                               await uploadFile(filesArray[currentIndex]);
                             }
                           });
                           
                           await Promise.all(workers);

                           if (button) button.innerHTML = '<span class="relative flex items-center justify-center gap-2">TEŞEKKÜRLER! ♥️</span>';
                           setTimeout(() => { if (button) button.innerHTML = originalText; setIsUploading(false); }, 3000);
                         } catch (err: any) {
                           console.error(err);
                           alert("Yükleme Sırasında Hata Oluştu:\n" + err.message);
                           if (button) button.innerHTML = '<span class="relative flex items-center justify-center gap-2">HATA!</span>';
                           setTimeout(() => { if (button) button.innerHTML = originalText; setIsUploading(false); }, 3000);
                         }
                       }}
                     />
                      <div className="flex gap-2">
                         <button 
                           id="upload-button"
                           title="Sadece Fotoğraf (\'Resimler Galerisi\')"
                           className="relative flex-1 overflow-hidden group bg-gradient-to-r from-[#d9be75] to-[#cba34a] text-white px-3 py-3 rounded-sm text-[11px] font-semibold tracking-wider shadow-[0_10px_20px_rgba(203,163,74,0.3)] transition-all hover:shadow-[0_10px_25px_rgba(203,163,74,0.5)] hover:from-[#cba34a] hover:to-[#b5903b]"
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             document.getElementById('photo-upload')?.click(); 
                           }}
                         >
                            <div className="absolute inset-0 bg-white/30 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                            <span className="relative flex items-center justify-center gap-1.5 pointer-events-none">
                              <Camera className="w-4 h-4" /> FOTOĞRAF GÖNDER
                             </span>
                          </button>
                          
                          <button 
                           id="video-button"
                           title="Sisteme Video Yükle"
                           className="relative flex-1 overflow-hidden group bg-gradient-to-r from-[#4a4235] to-[#2a2419] text-white px-3 py-3 rounded-sm text-[11px] font-semibold tracking-wider shadow-md transition-all hover:bg-[#1a160f]"
                           onClick={(e) => { 
                             e.stopPropagation(); 
                             document.getElementById('video-upload')?.click(); 
                           }}
                         >
                            <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                            <span className="relative flex items-center justify-center gap-1.5 pointer-events-none">
                              <Video className="w-4 h-4" /> VİDEO SEÇ
                             </span>
                          </button>
                       </div>
                       
                       <input 
                         type="file" 
                         accept="video/*" 
                         id="video-upload" 
                         className="hidden" 
                         multiple
                         onChange={async (e) => {
                           const files = e.target.files;
                           setTotalFiles(files ? files.length : 0);
                           setUploadedFilesCount(0);
                           setIsUploading(true);
                           if (!files || files.length === 0) return;
                           
                           setIsOpen(true);
                           const button = document.getElementById('video-button');
                           const originalText = button?.innerHTML || '<span class="relative flex items-center justify-center gap-1.5"><Video class="w-4 h-4" /> VİDEO SEÇ</span>';
                           if (button) button.innerHTML = '<span class="relative flex items-center justify-center gap-2"><svg class="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Yüklüyor...</span>';

                           try {
                             const filesArray = Array.from(files);
                             
                             for (const file of filesArray) {
                               const form = new FormData();
                               form.append('file', file);
                               form.append('name', `Wedding-Video-${Date.now()}-${file.name}`);

                               const uploadRes = await fetch('/api/upload-video', {
                                 method: 'POST',
                                 body: form
                               });
                               
                               if (!uploadRes.ok) {
                                 const errText = await uploadRes.text();
                                 let errMsg = errText;
                                 try {
                                   const errJson = JSON.parse(errText);
                                   errMsg = errJson.error || errText;
                                 } catch(e) {}
                                 throw new Error("Yükleme başarısız: " + errMsg);
                               }
                               
                               const fileDetails = await uploadRes.json();
                               
                               // Save to Firestore
                               await addDoc(collection(db, 'weddings', wedding.id, 'photos'), {
                                 secure_url: fileDetails.webContentLink || fileDetails.webViewLink,
                                 public_id: fileDetails.id,
                                 format: 'mp4',
                                 created_at: new Date().toISOString(),
                                 type: 'video',
                                 thumbnail_url: fileDetails.thumbnailLink || ''
                               });
                               
                               setUploadedFilesCount(prev => prev + 1);
                             }
                             
                             if (button) button.innerHTML = '<span class="relative flex items-center justify-center gap-2">TEŞEKKÜRLER! ♥️</span>';
                             setTimeout(() => { if (button) button.innerHTML = originalText; setIsUploading(false); }, 3000);
                           } catch (err: any) {
                             console.error("Video Upload Error:", err);
                             alert("Video Yükleme Sırasında Hata Oluştu:\n" + err.message);
                             if (button) button.innerHTML = '<span class="relative flex items-center justify-center gap-2">HATA!</span>';
                             setTimeout(() => { if (button) button.innerHTML = originalText; setIsUploading(false); }, 3000);
                           }
                         }}
                       />
                      {isUploading && (
                        <div className="mt-4 w-full animate-in fade-in duration-300">
                          <div className="flex justify-between items-center text-[10px] font-sans font-bold text-[#8a7a5e] mb-1.5 px-1 tracking-wider uppercase">
                            <span>{totalFiles === uploadedFilesCount ? "TAMAMLANDI!" : "YÜKLENİYOR..."}</span>
                            <span>{uploadedFilesCount} / {totalFiles}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#eaddb6]/60 rounded-full overflow-hidden shadow-inner border border-[#dcc692]/30">
                            <div 
                              className="h-full bg-gradient-to-r from-[#d9be75] to-[#cba34a] rounded-full transition-all duration-300 ease-out"
                              style={{ width: (totalFiles > 0 ? ((uploadedFilesCount / totalFiles) * 100) : 0) + "%" }}
                            />
                          </div>
                          <div className="mt-2 text-[9px] font-sans font-medium text-[#8a7a5e] text-center opacity-80 uppercase tracking-wide animate-pulse">
                            Lütfen bu sayfadan ayrılmayın.
                          </div>
                        </div>
                      )}
                   </div>
                  
                  <span className="text-[11px] font-sans tracking-[0.25em] text-[#8a7a5e] uppercase font-bold">15 Ağustos 2026</span>
               </motion.div>
             </motion.div>
           </motion.div>

           {/* ENVELOPE FRONT COVER (Side and Bottom flaps) */}
           <motion.div 
             className="absolute inset-0 z-30 preserve-3d pointer-events-none drop-shadow-[0_-5px_15px_rgba(180,160,120,0.15)]"
             animate={envelopeDropAnim}
             transition={envelopeDropTrans}
           >
             <svg viewBox="0 0 340 220" className="w-full h-full">
               <defs>
                 <linearGradient id="env-front-grad" x1="0" y1="1" x2="0" y2="0">
                   <stop offset="0%" stopColor="#faf8f2" />
                   <stop offset="100%" stopColor="#ffffff" />
                 </linearGradient>
               </defs>
               {/* Left Flap */}
               <path d="M 0,0 L 170,120 L 0,220 Z" fill="#ffffff" stroke="#eaddb6" strokeWidth="1" strokeLinejoin="round" />
               {/* Right Flap */}
               <path d="M 340,0 L 170,120 L 340,220 Z" fill="#fdfbf7" stroke="#eaddb6" strokeWidth="1" strokeLinejoin="round" />
               {/* Bottom Flap */}
               <path d="M 0,220 L 170,120 L 340,220 Z" fill="url(#env-front-grad)" stroke="#eaddb6" strokeWidth="1.5" strokeLinejoin="round" />
             </svg>
           </motion.div>

           {/* ENVELOPE TOP FLAP */}
           <motion.div
             className="absolute top-0 left-0 w-full h-[140px] origin-top preserve-3d pointer-events-none drop-shadow-[0_10px_10px_rgba(200,180,150,0.2)]"
             initial={false}
             animate={{ 
               rotateX: isOpen ? 180 : 0, 
               zIndex: isOpen ? 10 : 40,
               ...envelopeDropAnim
             }}
             transition={{ 
               rotateX: { duration: isInstantClose ? 0 : (isOpen ? 1.0 : 0.8), delay: isInstantClose ? 0 : (isOpen ? 0 : 1.6), type: 'spring', damping: 15 },
               zIndex: { duration: isInstantClose ? 0 : 0.1, delay: isInstantClose ? 0 : (isOpen ? 0.3 : 1.6) },
               y: envelopeDropTrans,
               opacity: envelopeDropTrans
             }}
           >
             <svg viewBox="0 0 340 140" className="w-full h-full">
                <path d="M 0,0 L 340,0 L 170,140 Z" fill="#ffffff" stroke="#eaddb6" strokeWidth="1.5" strokeLinejoin="round" />
                {/* Decorative border line */}
                <path d="M 12,0 L 328,0 L 170,125 Z" fill="none" stroke="#dcc692" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
             </svg>

             {/* Wax Seal */}
             <motion.div
               className="absolute top-[138px] left-[170px] -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-[#d9be75] to-[#ac8533] rounded-full drop-shadow-[0_5px_10px_rgba(180,150,100,0.4)] border-[1.5px] border-[#dec78b] flex items-center justify-center cursor-pointer pointer-events-auto shadow-[inset_0_2px_5px_rgba(255,255,255,0.4)]"
               style={{ backfaceVisibility: 'hidden' }}
               animate={{ 
                 opacity: isOpen ? 0 : 1, 
                 scale: isOpen ? 1.5 : (isHovering ? 1.05 : 1) 
               }}
               transition={{ duration: isInstantClose ? 0 : 0.3 }}
               onClick={(e) => { 
                 e.stopPropagation(); 
                 if (!isOpen) setIsOpen(true); 
               }}
             >
                {/* Monogram inside seal */}
                <span className="font-script text-[#ffffff] text-3xl absolute opacity-90 drop-shadow-sm" style={{ transform: 'translateY(-2px)' }}>{wedding.brideName.charAt(0)}{wedding.groomName.charAt(0)}</span>
                {/* Subtle wax reflection */}
                <div className="absolute inset-1 rounded-full border-t-[2px] border-[#ffecba] opacity-60 mix-blend-screen" />
                <div className="absolute inset-[3px] rounded-full border border-[#8a6a25]/60" />
             </motion.div>
           </motion.div>
           
        </motion.div>

        {/* Tap to open indicator */}
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center text-[#ab8f4e] pointer-events-auto cursor-pointer drop-shadow-sm font-sans"
          animate={{ opacity: (isOpen || isHovering) ? 0 : 1, y: isHovering ? 5 : 0 }}
          transition={{ duration: isInstantClose ? 0 : 0.3 }}
          onClick={(e) => { 
            e.stopPropagation(); 
            if (!isOpen) setIsOpen(true); 
          }}
        >
           <span className="text-[10px] tracking-[0.4em] font-medium mb-1 drop-shadow-sm text-center">MÜHRÜ KIR</span>
        </motion.div>

      </div>

      {/* Footer Logo */}
      <motion.a 
         href="https://www.dentlasajans.com"
         target="_blank"
         rel="noopener noreferrer"
         className="absolute bottom-[8%] flex flex-col items-center z-10 w-[200px] cursor-pointer"
         onClick={(e) => e.stopPropagation()}
         animate={{ opacity: (isOpen || isHovering) ? 0 : 0.15, y: isHovering ? 10 : 0 }}
         whileHover={{ opacity: (isOpen || isHovering) ? 0 : 0.4 }}
         transition={{ duration: isInstantClose ? 0 : 0.5 }}
      >
         <img 
           src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572428/Ba%C5%9Fl%C4%B1ks%C4%B1z-1_rdjgno.png" 
           alt="Dentlas Ajans Logo" 
           className="w-10 h-auto mb-[2px]"
           style={{ filter: 'brightness(0)' }}
         />
         <span className="text-[8px] tracking-[0.25em] text-[#3b3427] uppercase font-semibold">Dentlas Ajans</span>
      </motion.a>
    </div>
  );
}

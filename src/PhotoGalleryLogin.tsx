import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Lock, Download, Image as ImageIcon, Check, Loader2, ArrowLeft, Play } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type Photo = {
  id: string;
  secure_url: string;
  public_id: string;
  format: string;
  created_at: string;
  type?: string;
  thumbnail_url?: string;
};

export default function PhotoGalleryLogin() {
  const { linkName } = useParams<{ linkName: string }>();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [wedding, setWedding] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [greetingCountdown, setGreetingCountdown] = useState(3);
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAuthenticated && showGreetingModal && greetingCountdown > 0) {
      timer = setTimeout(() => setGreetingCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isAuthenticated, showGreetingModal, greetingCountdown]);

  useEffect(() => {
    // Check if we have the wedding data
    const fetchWedding = async () => {
      try {
        const q = query(collection(db, 'weddings'), where('linkName', '==', linkName));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
           const docObj = querySnapshot.docs[0];
           const data = docObj.data();
           setWedding({ id: docObj.id, ...data });
           
           // Check local storage for session
           const savedPin = localStorage.getItem(`wedding_pin_${linkName}`);
           if (savedPin && savedPin === data.pin) {
             setIsAuthenticated(true);
             setShowGreetingModal(true);
             setGreetingCountdown(3);
             fetchPhotos(docObj.id);
           }
        } else {
           setError('Düğün bulunamadı.');
        }
      } catch (err) {
        console.error(err);
        setError('Sistem hatası oluştu.');
      }
    };
    if (linkName) fetchWedding();
  }, [linkName]);

  const fetchPhotos = async (weddingId: string) => {
    setLoadingPhotos(true);
    try {
      const photosQuery = query(
        collection(db, 'weddings', weddingId, 'photos'),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(photosQuery);
      const fetched: Photo[] = [];
      snapshot.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as Photo);
      });
      setPhotos(fetched);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!wedding) return;
    
    if (pin === wedding.pin) {
      setIsAuthenticated(true);
      setShowGreetingModal(true);
      setGreetingCountdown(3);
      localStorage.setItem(`wedding_pin_${linkName}`, pin);
      fetchPhotos(wedding.id);
    } else {
      setError('Hatalı PIN kodu. Lütfen tekrar deneyin.');
    }
  };

  const handleImageError = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const shareOrDownloadFile = async (url: string, filename: string) => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
      const secureUrl = url.replace("http://", "https://");
      const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(secureUrl)}&filename=${encodeURIComponent(filename)}`;
      
      if (isIOS && navigator.canShare) {
        try {
          const response = await fetch(proxyUrl);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: blob.type });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Düğün Medyası',
            });
            return;
          }
        } catch(e) {
          console.warn("Share API failed", e);
        }
      }
      
      // Fallback/Non-iOS - doğrudan tarayıcı üzerinden indir
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download fallback failed:", err);
      // Son çare
      window.open(url, '_blank');
    }
  };

  const downloadAllAsZip = async () => {
    if (photos.length === 0) return;
    
    setDownloadingZip(true);
    setDownloadProgress(0);
    
    try {
      const zip = new JSZip();
      const folder = zip.folder(`${wedding.brideName}-${wedding.groomName}-Fotograflar`);
      
      let processed = 0;
      
      // Concurrently fetch max 5 photos at a time
      const workers = Array(5).fill(null).map(async () => {
        while (photos.length > 0) {
           // We'll use a local index cursor to fetch
        }
      });
      
      // Let's rewrite concurrent fetch easier
      let cursor = 0;
      const downloadWorker = async () => {
        while (cursor < photos.length) {
          const index = cursor++;
          const photo = photos[index];
          try {
             // To bypass CORS or use optimized URL if needed, we just fetch the secure_url
             const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(photo.secure_url)}`;
             const response = await fetch(proxyUrl);
             const blob = await response.blob();
             if (folder) {
               const isVideo = photo.type === 'video' || photo.format === 'mp4';
               folder.file(isVideo ? `video-${index + 1}.mp4` : `foto-${index + 1}.${photo.format || 'jpg'}`, blob);
             }
          } catch(e) {
             console.error(`Failed to fetch photo ${photo.secure_url}`, e);
          }
          processed++;
          setDownloadProgress(Math.round((processed / photos.length) * 100));
        }
      };
      
      await Promise.all(Array(5).fill(null).map(downloadWorker));
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${wedding.brideName}-${wedding.groomName}-Fotograflari.zip`);
      
    } catch(err) {
      console.error(err);
      alert('Zip dosyası oluşturulurken hata oluştu.');
    } finally {
      setDownloadingZip(false);
      setDownloadProgress(0);
    }
  };

  if (!wedding && !error) {
    return <div className="min-h-[100dvh] bg-[#f2efe9] flex items-center justify-center p-4">
      <Loader2 className="w-8 h-8 text-[#b59551] animate-spin" />
    </div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-[#f2efe9] flex flex-col items-center justify-center p-4 selection:bg-[#d4af37]/30">
        <button 
          onClick={() => navigate(`/${linkName}`)}
          className="absolute top-6 left-6 text-[#8a7a5e] hover:text-[#2a2419] flex items-center justify-center gap-2 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
        
        <div className="w-full max-w-[340px] bg-white rounded-lg shadow-xl p-8 border border-[#eaddb6]">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-[#faf8f2] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#eaddb6]">
                <Lock className="w-8 h-8 text-[#b59551]" />
             </div>
             <h1 className="font-sans text-xl font-bold text-[#2a2419] uppercase tracking-wider mb-2">Fotoğraf Havuzu</h1>
             {wedding && (
                <p className="text-sm font-medium text-[#8a7a5e] mb-4">
                  {wedding.brideName} & {wedding.groomName}
                </p>
             )}
             <p className="text-xs text-[#4a4235]">Erişim için 6 haneli PIN kodunu giriniz.</p>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center p-3 border border-[#dcc692] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b59551] bg-[#fdfbf7] text-2xl tracking-[0.5em] font-mono font-medium text-[#2a2419]"
                  placeholder="******"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}
              <button 
                type="submit" 
                className="w-full bg-[#2a2419] text-white py-3 mt-4 rounded-md font-bold tracking-[0.2em] hover:bg-[#1a160f] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
              >
                GİRİŞ YAP <Check className="w-4 h-4" />
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f4] font-sans selection:bg-[#d4af37]/30">
      
      {showGreetingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060913]/90 backdrop-blur-sm p-4">
          <div className="bg-[#fdfbf7] p-8 rounded-xl shadow-2xl max-w-md w-full border border-[#eaddb6] text-center relative">
            <img 
              src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572428/Ba%C5%9Fl%C4%B1ks%C4%B1z-1_rdjgno.png" 
              alt="Dentlas Ajans" 
              className="w-16 h-16 mx-auto mb-4 object-contain brightness-0"
            />
            <h2 className="text-2xl font-script text-[#2a2419] mb-2">{wedding?.brideName} & {wedding?.groomName}</h2>
            <p className="font-serif text-[#4a4235] text-sm mb-6">Mutluluklar dileriz! Güzel anılarınızı biriktirmek için Fotoğraf Havuzu sistemimize hoş geldiniz.</p>
            
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
              <p className="text-xs font-bold uppercase tracking-wide mb-1">ÖNEMLİ UYARI</p>
              <p className="text-xs">
                Sistemdeki tüm görseller düğün tarihinden <strong>30 gün sonra</strong> otomatik olarak tamamen silinecektir. Lütfen verilerinizi bu süre zarfında yedeklemeyi unutmayınız.
              </p>
            </div>
            
            <button
              onClick={() => setShowGreetingModal(false)}
              disabled={greetingCountdown > 0}
              className={`w-full py-3 rounded-md font-bold tracking-widest uppercase text-sm transition-all ${greetingCountdown > 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#b59551] text-white hover:bg-[#a08242] shadow-lg'}`}
            >
              {greetingCountdown > 0 ? `Lütfen Bekleyin (${greetingCountdown})` : 'DEVAM ET'}
            </button>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-[#eaddb6] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(`/${linkName}`)}
                className="w-10 h-10 rounded-full bg-[#fdfbf7] border border-[#eaddb6] flex items-center justify-center text-[#8a7a5e] hover:text-[#2a2419] hover:bg-[#f6f3ea] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-script tracking-wide text-[#2a2419] leading-none mb-1">
                  {wedding?.brideName} & {wedding?.groomName}
                </h1>
                <p className="text-xs font-medium text-[#8a7a5e] uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> FOTOĞRAF HAVUZU ({photos.length})
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={downloadAllAsZip}
                 disabled={photos.length === 0 || downloadingZip}
                 className="flex items-center justify-center gap-2 bg-[#b59551] text-white px-5 py-2.5 rounded text-sm font-semibold tracking-wider hover:bg-[#a08242] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {downloadingZip ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor... %{downloadProgress}
                   </>
                 ) : (
                   <>
                     <Download className="w-4 h-4" /> TÜMÜNÜ İNDİR (ZIP)
                   </>
                 )}
               </button>
               
               <button 
                  onClick={() => {
                    localStorage.removeItem(`wedding_pin_${linkName}`);
                    setIsAuthenticated(false);
                    setPin('');
                  }}
                  className="text-xs font-bold text-[#8a7a5e] hover:text-[#2a2419] uppercase tracking-wider px-3 py-2"
               >
                  Çıkış
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingPhotos ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#8a7a5e]">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#b59551]" />
            <p className="text-sm font-medium tracking-widest uppercase">Fotoğraflar Yükleniyor...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#eaddb6] rounded-xl p-16 text-center shadow-sm">
            <ImageIcon className="w-16 h-16 text-[#eaddb6] mx-auto mb-4" />
            <h3 className="text-[#2a2419] font-bold text-lg mb-2">Henüz fotoğraf yüklenmemiş</h3>
            <p className="text-[#8a7a5e] text-sm">Misafirlerinizin paylaştığı anılar burada listelenecektir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {photos.map((photo, index) => {
              const isVideo = photo.type === 'video' || photo.format === 'mp4';
              const displayUrl = isVideo && photo.thumbnail_url ? photo.thumbnail_url : photo.secure_url;
              return (
              <div key={photo.id} className="group relative bg-[#fdfbf7] border border-[#eaddb6] rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                 <div className="aspect-[3/4] relative overflow-hidden bg-[#eaddb6]/10 flex items-center justify-center">
                    {isVideo && !photo.thumbnail_url ? (
                      <video 
                         src={displayUrl} 
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         preload="metadata"
                         controls
                         playsInline
                      />
                    ) : (
                      <img 
                         src={displayUrl} 
                         alt="Wedding Moment" 
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         loading="lazy"
                         onError={() => !isVideo && handleImageError(photo.id)}
                      />
                    )}
                    {isVideo && !!photo.thumbnail_url && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                            <Play className="w-5 h-5 text-white ml-1" />
                         </div>
                      </div>
                    )}
                    {(!isVideo || !!photo.thumbnail_url) && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                         <button 
                           onClick={() => shareOrDownloadFile(photo.secure_url, isVideo ? `video-${index + 1}.mp4` : `foto-${index + 1}.${photo.format || 'jpg'}`)}
                           className="pointer-events-auto bg-white text-[#2a2419] p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 hover:bg-[#f6f3ea] shadow-lg"
                           title={isVideo ? "Videoyu Aç / İndir" : "İndir / Paylaş"}
                         >
                            {isVideo ? <Play className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                         </button>
                      </div>
                    )}
                 </div>
                 <div className="pt-2 px-3 pb-3 bg-white border-t border-[#eaddb6]/50 flex justify-between items-center">
                    <span className="text-[10px] font-medium text-[#8a7a5e] uppercase tracking-wider truncate mr-2">
                       {isVideo ? `video-${index + 1}.mp4` : `foto-${index + 1}.${photo.format || 'jpg'}`}
                    </span>
                    <button 
                       onClick={() => shareOrDownloadFile(photo.secure_url, isVideo ? `video-${index + 1}.mp4` : `foto-${index + 1}.${photo.format || 'jpg'}`)}
                       className="text-[#b59551] hover:text-[#8a7a5e] transition-colors p-1"
                       title="İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                 </div>
              </div>
            )})}
          </div>
        )}
      </main>
    </div>
  );
}

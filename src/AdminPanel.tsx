import { useState, useEffect } from 'react';
import { Download, RefreshCw, LogIn, Lock, CheckSquare, Square, DownloadCloud } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useParams } from 'react-router-dom';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Photo = {
  public_id: string;
  secure_url: string;
  format: string;
  created_at: string;
};

export default function AdminPanel() {
  const { id } = useParams();
  const weddingId = id || 'demo';

  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedPin = localStorage.getItem('adminPin');
    if (savedPin) {
      setPin(savedPin);
      verifyPin(savedPin);
    }
  }, [weddingId]);

  const verifyPin = async (pinToVerify: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToVerify })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('adminPin', pinToVerify);
        fetchPhotos(pinToVerify);
      } else {
        setError(data.error || 'Geçersiz PIN');
        localStorage.removeItem('adminPin');
      }
    } catch (err) {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verifyPin(pin);
  };

  const fetchPhotos = async (currentPin: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos/${weddingId}`, {
        headers: { 'x-admin-pin': currentPin }
      });
      if (res.ok) {
         const data = await res.json();
         setPhotos(data.photos || []);
      } else {
         if (res.status === 401) {
           setIsAuthenticated(false);
           localStorage.removeItem('adminPin');
         }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const newSec = new Set(selectedIds);
    if (newSec.has(id)) newSec.delete(id);
    else newSec.add(id);
    setSelectedIds(newSec);
  };

  const selectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map(p => p.public_id)));
    }
  };

  const handleDownload = async (bulkAll: boolean = false) => {
    try {
      setLoading(true);
      const publicIds = bulkAll ? [] : Array.from(selectedIds);
      
      const res = await fetch(`/api/download-zip/${weddingId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': pin 
        },
        body: JSON.stringify({ publicIds })
      });
      
      const data = await res.json();
      if (data.url) {
        // Trigger download
        window.location.href = data.url;
      } else {
        alert('İndirme linki oluşturulamadı.');
      }
    } catch (err) {
      console.error(err);
      alert('İndirme başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4">
        <div className="w-full max-w-[340px] bg-white rounded-lg shadow-xl p-8 border border-[#eaddb6]">
           <div className="text-center mb-8">
             <div className="w-16 h-16 bg-[#faf8f2] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#eaddb6]">
                <Lock className="w-8 h-8 text-[#b59551]" />
             </div>
             <h1 className="font-sans text-2xl font-bold text-[#2a2419]">Fotoğraf Arşivi</h1>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4a4235] mb-2 text-center">Yönetici PIN Kodu</label>
                <input 
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full text-center text-xl tracking-[0.5em] p-3 border border-[#dcc692] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b59551] bg-[#fdfbf7]"
                  placeholder="****"
                  maxLength={6}
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2a2419] text-white py-3 rounded-md font-medium tracking-wider hover:bg-[#1a160f] transition-colors disabled:opacity-50"
              >
                {loading ? 'KONTROL EDILIYOR...' : 'GİRİŞ YAP'}
              </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f8f4] text-[#2a2419] p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
         {/* Header */}
         <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm border border-[#eaddb6]">
             <div>
                <h1 className="text-2xl font-bold tracking-tight">Fotoğraf Arşivi</h1>
                <p className="text-sm text-[#8a7a5e] mt-1">{photos.length} fotoğraf yüklendi</p>
             </div>
             <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => fetchPhotos(pin)}
                  className="p-2 text-[#8a7a5e] hover:text-[#2a2419] hover:bg-[#f9f8f4] rounded-md transition-colors"
                  title="Yenile"
                >
                  <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                </button>
                <button 
                  onClick={() => handleDownload(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#b59551] text-white px-4 py-2 rounded-md font-medium hover:bg-[#a08242] transition-colors shadow-sm"
                >
                  <DownloadCloud className="w-4 h-4" /> Tümünü İndir
                </button>
             </div>
         </div>

         {/* Selection Toolbar */}
         {photos.length > 0 && (
           <div className="flex items-center justify-between mb-4 px-2">
              <button 
                onClick={selectAll}
                className="flex items-center gap-2 text-sm font-medium text-[#4a4235] hover:text-[#2a2419]"
              >
                {selectedIds.size === photos.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                Tümünü Seç
              </button>
              
              {selectedIds.size > 0 && (
                 <button 
                   onClick={() => handleDownload(false)}
                   className="flex items-center gap-2 text-sm font-medium text-[#2a2419] hover:text-black border border-[#2a2419] px-3 py-1.5 rounded-md"
                 >
                   <Download className="w-4 h-4" /> Seçilenleri ({selectedIds.size}) İndir
                 </button>
              )}
           </div>
         )}

         {/* Gallery */}
         {photos.length === 0 && !loading ? (
           <div className="text-center py-20 bg-white rounded-lg border border-[#eaddb6] shadow-sm">
             <Camera className="w-12 h-12 text-[#dcc692] mx-auto mb-4" />
             <p className="text-lg font-medium text-[#4a4235]">Henüz fotoğraf yüklenmedi.</p>
           </div>
         ) : (
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((photo) => (
                <div 
                  key={photo.public_id} 
                  className={cn(
                    "relative aspect-[3/4] rounded-md overflow-hidden group cursor-pointer border-2 transition-all",
                    selectedIds.has(photo.public_id) ? "border-[#2a2419]" : "border-transparent border-gray-200"
                  )}
                  onClick={() => toggleSelection(photo.public_id)}
                >
                   <img 
                     src={photo.secure_url} 
                     alt="Yükleme" 
                     className="w-full h-full object-cover transition-transform group-hover:scale-105"
                     loading="lazy"
                   />
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors pointer-events-none" />
                   <div className="absolute top-2 left-2 z-10 transition-opacity">
                      {selectedIds.has(photo.public_id) ? (
                        <CheckSquare className="w-5 h-5 text-white fill-[#2a2419]" />
                      ) : (
                        <div className="w-5 h-5 bg-white/50 rounded-sm border border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                   </div>
                </div>
              ))}
           </div>
         )}
      </div>
    </div>
  );
}

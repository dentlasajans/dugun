import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, LogIn, Lock, CheckSquare, Square, DownloadCloud, Camera } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useParams } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { auth, db } from './firebase';

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
        setIsAuthenticated(true);
        fetchPhotos(idToken);
      } else {
        setIsAuthenticated(false);
        setToken('');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [weddingId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const fetchPhotos = async (currentToken: string) => {
    setLoading(true);
    try {
      // Find actual wedding doc id by linkName
      let searchId = weddingId;
      const q = query(collection(db, 'weddings'), where('linkName', '==', weddingId));
      const qs = await getDocs(q);
      if (!qs.empty) {
        searchId = qs.docs[0].id;
      }
      
      const photosQuery = query(collection(db, 'weddings', searchId, 'photos'));
      const photoDocs = await getDocs(photosQuery);
      const items: Photo[] = [];
      photoDocs.forEach(doc => {
         items.push({ public_id: doc.id, ...doc.data() } as Photo);
      });
      setPhotos(items);
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
      const publicIds = bulkAll ? photos.map(p => p.public_id) : Array.from(selectedIds);
      const toDownload = photos.filter(p => publicIds.includes(p.public_id));
      
      if (toDownload.length === 0) return;

      const zip = new JSZip();
      const folder = zip.folder(`dugun_fotograflari_${weddingId}`);

      for (const photo of toDownload) {
        const response = await fetch(photo.secure_url);
        const blob = await response.blob();
        folder?.file(photo.public_id, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `dugun_fotograflari_${weddingId}.zip`);

    } catch (err) {
      console.error(err);
      alert('İndirme başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isAuthenticated) {
    return <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4"><p className="text-white">Yükleniyor...</p></div>;
  }

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
                <label className="block text-sm font-medium text-[#4a4235] mb-2 text-center">E-posta</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-center p-3 border border-[#dcc692] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b59551] bg-[#fdfbf7]"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4a4235] mb-2 text-center">Şifre</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-center p-3 border border-[#dcc692] rounded-md focus:outline-none focus:ring-2 focus:ring-[#b59551] bg-[#fdfbf7]"
                  placeholder="••••••"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2a2419] text-white py-3 rounded-md font-medium tracking-wider hover:bg-[#1a160f] transition-colors disabled:opacity-50"
              >
                {loading ? 'KONTROL EDİLİYOR...' : 'GİRİŞ YAP'}
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
                  onClick={handleLogout}
                  className="p-2 text-[#8a7a5e] hover:text-[#2a2419] font-medium text-sm transition-colors"
                >
                  Çıkış Yap
                </button>
                <button 
                  onClick={() => fetchPhotos(token)}
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

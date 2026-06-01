import React, { useState, useEffect } from 'react';
import { LogIn, Lock, Plus, Save, Trash2, Link as LinkIcon, Image, Users } from 'lucide-react';
import { cn } from './AdminPanel';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

type Wedding = {
  id: string;
  linkName: string;
  brideName: string;
  groomName: string;
  text1: string;
  text2: string;
};

export default function SystemAdminPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Wedding>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setToken(idToken);
        setIsAuthenticated(true);
        fetchWeddings(idToken);
      } else {
        setIsAuthenticated(false);
        setToken('');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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

  const fetchWeddings = async (currentToken: string) => {
    try {
      const res = await fetch('/api/weddings', {
        headers: { 'x-admin-pin': currentToken }
      });
      if (res.ok) {
         const data = await res.json();
         setWeddings(data);
      } else if (res.status === 401) {
         signOut(auth);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/weddings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': token 
        },
        body: JSON.stringify({
          brideName: 'Yeni',
          groomName: 'Düğün',
          linkName: 'yeni-dugun-' + Math.floor(Math.random() * 1000),
          text1: 'Hikayemiz Başlıyor...',
          text2: 'Bizi yalnız bırakmadığınız için teşekkürler.'
        })
      });
      if(res.ok) {
        fetchWeddings(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/weddings/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': token 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setEditingId(null);
        fetchWeddings(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu düğünü silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/weddings/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': token }
      });
      if (res.ok) fetchWeddings(token);
    } catch(e) {
      console.error(e);
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
             <h1 className="font-sans text-2xl font-bold text-[#2a2419]">Sistem Girişi</h1>
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-[#eaddb6]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Düğün Yönetim Paneli</h1>
            <p className="text-sm text-[#8a7a5e] mt-1">Sistemdeki aktif bağlantıları ve ayarları buradan yönetin.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
               onClick={handleLogout}
               className="text-[#8a7a5e] hover:text-[#2a2419] font-medium text-sm transition-colors"
            >
              Çıkış Yap
            </button>
            <button 
               onClick={handleAdd}
               className="flex items-center gap-2 bg-[#b59551] text-white px-4 py-2 rounded-md font-medium hover:bg-[#a08242] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Yeni Düğün Ekle
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((w) => (
            <div key={w.id} className="bg-white rounded-lg shadow-sm border border-[#eaddb6] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#eaddb6] bg-[#fdfbf7] flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <Users className="w-4 h-4 text-[#8a7a5e]" />
                  {w.brideName} & {w.groomName}
                </div>
                <button onClick={() => handleDelete(w.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Sil">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5 flex-1 space-y-4">
                {editingId === w.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="col-span-2">
                         <label className="text-xs font-medium text-[#8a7a5e] block mb-1">Link Adı (örn: elif-can)</label>
                         <div className="flex items-center text-sm border border-[#dcc692] rounded overflow-hidden">
                           <span className="px-2 text-gray-500 bg-gray-50 border-r border-[#dcc692]">dugun.dentlasajans.com/#/</span>
                           <input type="text" className="w-full flex-1 p-2 outline-none" value={formData.linkName || ''} onChange={e => setFormData({...formData, linkName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} />
                         </div>
                       </div>
                       <div>
                         <label className="text-xs font-medium text-[#8a7a5e] block mb-1">Gelin Adı</label>
                         <input type="text" className="w-full text-sm p-2 border border-[#dcc692] rounded focus:ring-2 focus:ring-[#b59551] outline-none" value={formData.brideName || ''} onChange={e => setFormData({...formData, brideName: e.target.value})} />
                       </div>
                       <div>
                         <label className="text-xs font-medium text-[#8a7a5e] block mb-1">Damat Adı</label>
                         <input type="text" className="w-full text-sm p-2 border border-[#dcc692] rounded focus:ring-2 focus:ring-[#b59551] outline-none" value={formData.groomName || ''} onChange={e => setFormData({...formData, groomName: e.target.value})} />
                       </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#8a7a5e] block mb-1">Başlık Yazısı</label>
                      <input type="text" className="w-full text-sm p-2 border border-[#dcc692] rounded focus:ring-2 focus:ring-[#b59551] outline-none" value={formData.text1 || ''} onChange={e => setFormData({...formData, text1: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#8a7a5e] block mb-1">Açıklama Metni</label>
                      <textarea className="w-full text-sm p-2 border border-[#dcc692] rounded min-h-[60px] focus:ring-2 focus:ring-[#b59551] outline-none" value={formData.text2 || ''} onChange={e => setFormData({...formData, text2: e.target.value})} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-[#8a7a5e] mb-0.5">Link Adı</p>
                      <p className="text-sm text-[#2a2419] font-mono bg-gray-50 px-2 py-1 rounded inline-block border border-gray-100">/{w.linkName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#8a7a5e] mb-0.5">Başlık Yazısı</p>
                      <p className="text-sm font-medium text-[#2a2419]">{w.text1}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#8a7a5e] mb-0.5">Açıklama</p>
                      <p className="text-sm text-[#4a4235] line-clamp-2">{w.text2}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#f9f8f4] border-t border-[#eaddb6] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[#8a7a5e] mb-1">
                   Bağlantılar
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <a 
                     href={`https://dugun.dentlasajans.com/#/${w.linkName}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center justify-center gap-2 bg-white border border-[#dcc692] py-2 rounded text-xs font-bold text-[#2a2419] hover:bg-[#fdfbf7] transition-colors"
                   >
                     <LinkIcon className="w-3.5 h-3.5" /> Siteyi Gör
                   </a>
                   <Link 
                     to={`/d1/${w.linkName}`}
                     className="flex items-center justify-center gap-2 bg-[#b59551] text-white py-2 rounded text-xs font-bold hover:bg-[#a08242] transition-colors"
                   >
                     <Image className="w-3.5 h-3.5" /> Fotoğraflar
                   </Link>
                </div>
                <div className="pt-2">
                  {editingId === w.id ? (
                     <div className="flex gap-2">
                       <button onClick={() => setEditingId(null)} className="flex-1 py-2 text-sm text-[#8a7a5e] hover:bg-gray-100 rounded border border-transparent">İptal</button>
                       <button onClick={() => handleSave(w.id)} className="flex-1 py-2 bg-[#2a2419] text-white text-sm font-medium rounded hover:bg-black transition-colors flex items-center justify-center gap-2"><Save className="w-4 h-4"/> Kaydet</button>
                     </div>
                  ) : (
                     <button onClick={() => {setEditingId(w.id); setFormData(w);}} className="w-full py-2 bg-white text-sm font-medium text-[#2a2419] border border-[#2a2419] rounded hover:bg-[#2a2419] hover:text-white transition-colors">Düzenle</button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {weddings.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-[#dcc692] p-12 text-center rounded-lg bg-white/50">
               <p className="text-[#8a7a5e] font-medium">Henüz kayıtlı bir düğün bulunmuyor.</p>
               <button onClick={handleAdd} className="mt-4 text-[#b59551] font-bold hover:underline">İlk düğünü oluştur</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, QrCode, Smartphone, Download, ShieldCheck, Heart, Phone, Mail, Instagram, ArrowRight, Star } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: <QrCode className="w-6 h-6 text-[#b59551]" />,
      title: "QR Kod ile Kolay Erişim",
      description: "Misafirleriniz masalarındaki QR kodu okutarak hiçbir uygulama indirmeden sisteme anında erişir."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-[#b59551]" />,
      title: "Tek Tıkla Fotoğraf Yükleme",
      description: "Düğün anında çekilen en güzel kareler saniyeler içinde sizin oluşturduğunuz dijital havuza düşer."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#b59551]" />,
      title: "Özel PIN Koruması",
      description: "Fotoğraf havuzuna sadece sizin belirlediğiniz 6 haneli şifreyi bilen misafirleriniz erişebilir."
    },
    {
      icon: <Download className="w-6 h-6 text-[#b59551]" />,
      title: "Toplu İndirme Seçeneği",
      description: "Düğün sonrasında tüm fotoğrafları tek tuşla, kalitesi bozulmadan ZIP olarak indirebilirsiniz."
    }
  ];

  const steps = [
    {
      num: "01",
      title: "Size Özel Sayfa",
      desc: "İsimleriniz ve mesajınızla size özel bir karşılama ekranı hazırlıyoruz."
    },
    {
      num: "02",
      title: "Davetlileriniz Paylaşsın",
      desc: "QR kod ile bağlanan sevdikleriniz en güzel fotoğrafları yüklesin."
    },
    {
      num: "03",
      title: "Anılarınız Biriksin",
      desc: "Gecenin tüm dijital hatıraları güvenli panelinizde toplansın."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans selection:bg-[#d4af37]/30 flex flex-col items-center overflow-x-hidden">
      {/* HEADER */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-20 relative">
        <div className="hidden sm:block flex-1"></div>
        <div className="flex items-center justify-center flex-1">
           <img src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572428/Ba%C5%9Fl%C4%B1ks%C4%B1z-1_rdjgno.png" alt="Dentlas Ajans Logo" className="w-20 h-20 object-contain brightness-0" />
        </div>
        <div className="flex flex-1 items-center justify-center sm:justify-end gap-6 text-[#8a7a5e] text-sm font-medium tracking-widest uppercase">
           <a href="#nasil-calisir" className="hover:text-[#b59551] transition-colors">Nasıl Çalışır?</a>
           <a href="#ozellikler" className="hover:text-[#b59551] transition-colors">Özellikler</a>
           <a href="#iletisim" className="hover:text-[#b59551] transition-colors border-2 border-[#b59551] px-4 py-2 rounded text-[#b59551]">İletişim</a>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full max-w-6xl mx-auto px-6 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-16 z-10">
        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-[#f6f3ea] border border-[#eaddb6] text-[11px] font-bold text-[#8a7a5e] tracking-widest uppercase mb-6">
              Modern Düğün Asistanınız
            </span>
            <h1 className="font-serif text-5xl lg:text-7xl text-[#2a2419] leading-tight mb-6">
              En özel gününüzün <br/> 
              <span className="text-[#b59551] italic">dijital hatıra defteri.</span>
            </h1>
            <p className="text-[#4a4235] text-lg lg:text-xl font-light mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Misafirlerinizin çektiği o güzel karelerin WhatsApp gruplarında kaybolmasına izin vermeyin. Size özel QR kod ile tüm fotoğraflar anında dijital havuzunuzda toplansın.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <a href="#iletisim" className="bg-[#2a2419] text-white px-8 py-4 rounded font-bold tracking-widest uppercase text-sm hover:bg-[#1a160f] transition-all shadow-lg flex items-center gap-2">
                Sistemi Satın Al <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/demo" target="_blank" className="bg-white border border-[#eaddb6] text-[#8a7a5e] px-8 py-4 rounded font-bold tracking-widest uppercase text-sm hover:bg-[#f6f3ea] hover:text-[#2a2419] transition-all flex items-center gap-2">
                Canlı Demoyu İncele
              </a>
            </div>
          </motion.div>
        </div>
        
        {/* Mockup Showcase */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative w-full max-w-[400px] lg:max-w-none flex justify-center"
        >
          <div className="relative w-[280px] h-[580px] bg-black rounded-[40px] shadow-2xl p-3 transform rotate-3">
            <div className="w-full h-full bg-[#f2efe9] rounded-[30px] overflow-hidden relative">
               <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-[20px] w-32 mx-auto" />
               <div className="w-full h-full bg-gradient-to-b from-[#f2efe9]/40 to-[#e6dfd1]/90 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-[#ffffff] rounded-full shadow-lg mb-6"/>
                  <h2 className="font-script text-5xl text-[#2a2419] mb-4">Gelin<br/>&<br/>Damat</h2>
                  <div className="w-12 h-[1px] bg-[#bfa46b] mb-4" />
                  <p className="font-serif text-[11px] text-[#2a2419] mb-8">Bu geceyi ölümsüzleştirmek için çektiğiniz kareleri bizimle paylaşın.</p>
                  <div className="w-full bg-gradient-to-r from-[#d9be75] to-[#cba34a] text-white py-3 rounded text-[10px] uppercase tracking-widest font-bold">
                    Bize Fotoğraf Gönder
                  </div>
               </div>
            </div>
          </div>
          {/* Floating UI Element */}
          <div className="absolute bottom-20 -left-10 bg-white p-4 rounded-xl shadow-xl border border-[#eaddb6] flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
             <div className="w-12 h-12 bg-[#fdfbf7] rounded-full flex items-center justify-center text-[#b59551]">
               <Heart className="w-6 h-6 fill-current" />
             </div>
             <div>
               <p className="text-xs font-bold text-[#8a7a5e] uppercase tracking-wider">Ahmet Yükledi</p>
               <p className="text-sm font-serif text-[#2a2419]">+4 Harika Fotoğraf</p>
             </div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="nasil-calisir" className="w-full bg-[#f6f3ea] py-24 px-6 border-y border-[#eaddb6]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl text-[#2a2419] mb-4">Nasıl Çalışır?</h2>
            <p className="text-[#8a7a5e] max-w-2xl mx-auto">Sıfır teknik bilgi, maksimum anı. Sadece 3 basit adımda misafirlerinizle fotoğraflarınızı ortak bir havuzda toplayın.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[1px] bg-[#eaddb6] z-0" />
            
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-[#b59551] shadow-lg mb-6">
                  <span className="font-serif text-3xl italic text-[#b59551]">{step.num}</span>
                </div>
                <h3 className="font-sans font-bold text-lg text-[#2a2419] uppercase tracking-widest mb-3">{step.title}</h3>
                <p className="text-[#4a4235] text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="ozellikler" className="w-full max-w-6xl mx-auto py-24 px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl text-[#2a2419] mb-6">Her Şey Kontrolünüz Altında</h2>
            <p className="text-[#8a7a5e] mb-10 leading-relaxed">Özel bir günde dikkatinizi anı yaşamaya verin, geri kalan teknik kısımları bize bırakın. Kesintisiz, güvenli ve şık bir deneyim sunuyoruz.</p>
            <div className="grid sm:grid-cols-2 gap-8">
              {features.map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-[#eaddb6] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-[#fdfbf7] rounded flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-[#2a2419] text-sm uppercase tracking-wider mb-2">{feature.title}</h4>
                  <p className="text-xs text-[#8a7a5e] leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-2 shadow-2xl border border-[#eaddb6] relative">
            <div className="absolute -top-4 -right-4 bg-[#b59551] text-white w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12">
               <Star className="w-5 h-5 fill-current mb-1" />
               <span className="text-[10px] font-bold tracking-widest leading-none">PREMIUM</span>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200" 
              alt="Wedding Details" 
              className="w-full h-[500px] object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* CTA / CONTACT */}
      <section id="iletisim" className="w-full bg-[#2a2419] text-white py-24 px-6 mt-10">
        <div className="max-w-4xl mx-auto text-center">
           <div className="w-24 h-24 bg-[#fdfbf7] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-[#eaddb6]">
              <img src="https://res.cloudinary.com/dejx0brol/image/upload/v1778572428/Ba%C5%9Fl%C4%B1ks%C4%B1z-1_rdjgno.png" alt="Dentlas Ajans Logo" className="w-14 h-14 object-contain brightness-0" />
           </div>
           <h2 className="font-serif text-3xl lg:text-5xl text-white mb-6">Bu Sistemi Düğününüzde<br/>Kullanmak İster Misiniz?</h2>
           <p className="text-[#8a7a5e] text-lg mb-10 max-w-2xl mx-auto">
             Fiyatlandırma, sisteme dahil olan hizmetler ve demo erişimi için hemen bizimle iletişime geçin. Sizin için en uygun paketi birlikte seçelim.
           </p>
           
           <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
             <a href="tel:+905522438468" className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
               <Phone className="w-6 h-6 text-[#b59551] mb-3" />
               <span className="text-sm font-bold uppercase tracking-widest mb-1">Telefon</span>
               <span className="text-xs text-white/50">+90 552 243 84 68</span>
             </a>
             <a href="mailto:info@dentlasajans.com" className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
               <Mail className="w-6 h-6 text-[#b59551] mb-3" />
               <span className="text-sm font-bold uppercase tracking-widest mb-1">E-Posta</span>
               <span className="text-xs text-white/50">info@dentlasajans.com</span>
             </a>
             <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
               <Instagram className="w-6 h-6 text-[#b59551] mb-3" />
               <span className="text-sm font-bold uppercase tracking-widest mb-1">Instagram</span>
               <span className="text-xs text-white/50">@dentlasajans</span>
             </a>
           </div>
           
           <a 
             href="https://wa.me/905522438468" 
             target="_blank" 
             rel="noreferrer"
             className="inline-flex items-center gap-3 bg-[#b59551] text-white px-10 py-4 rounded font-bold tracking-widest uppercase text-sm hover:bg-[#a08242] transition-colors shadow-lg"
           >
             WhatsApp'tan Mesaj Gönder
           </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-black py-8 text-center text-xs text-white/40 uppercase tracking-widest font-sans border-t border-white/10">
        <p>© {new Date().getFullYear()} DENTLAS AJANS. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}

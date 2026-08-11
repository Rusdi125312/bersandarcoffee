"use client";
import { useState } from "react";
// Import langsung ke file ikon untuk menghindari error "Export doesn't exist"
import { MapPin, MessageCircle, Music } from "lucide-react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#111111] text-white relative">
      {/* BACKGROUND IMAGE YANG MEMANJANG SAMPAI BAWAH HERO */}
      <div className="absolute inset-0 z-0">
        <img src="/background-cafe.jpeg" className="w-full h-[600px] object-cover opacity-40" alt="Background" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#111111]/80 to-[#111111]" />
      </div>

      {/* NAVBAR */}
     <header className="absolute top-0 left-0 w-full z-50">
       {/* Hapus div pembungkus tambahan, gunakan satu grid utama */}
       <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
         {/* Logo (Kiri) - Merapat ke kiri */}
         <div className="flex-1 flex justify-star">
             <Link href="/" className="relative ml-4 w-20 h-16 md:w-32 md:h-24 transition-transform hover:scale-105">
                             <Image 
                               src="/logo-bersandar1.png" 
                               alt="Logo Bersandar"
                               fill
                               className="object-contain"
                               priority
                             />
                           </Link>
         </div>
          
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-10 font-medium">
            <a href="/" className="hover:text-[#D4A373] transition">Home</a>
            <a href="/menu" className="hover:text-[#D4A373] transition">Menu</a>
            <a href="/gallery" className="hover:text-[#D4A373] transition">Gallery</a>
            <a href="/contact" className="text-[#D4A373]">Contact</a>
          </nav>

          <a href="https://wa.me/6285280020604?text=Halo%20Admin%20Bersandar,%20saya%20ingin%20reservasi." 
          target="_blank"
          className="hidden md:flex border border-[#D4A373] px-6 py-2 rounded-xl hover:bg-[#D4A373] hover:text-black transition whitespace-nowrap">Reservasi</a>
          
          <button className="md:hidden z-50 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
     

      {/* MOBILE MENU DROPDOWN */}
       {menuOpen && (
          <div className="md:hidden bg-[#111]/95 backdrop-blur-md p-6 flex flex-col items-center gap-6 border-b border-white/10">
            <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/menu" onClick={() => setMenuOpen(false)}>Menu</a>
            <a href="/gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
            <a href="/contact" className="text-[#D4A373]" onClick={() => setMenuOpen(false)}>Contact</a>
            <a href="https://wa.me/6285280020604?text=Halo%20Admin%20Bersandar,%20saya%20ingin%20reservasi." className="bg-[#D4A373] px-6 py-2 rounded-lg text-black font-bold">Reservasi</a>
          </div>
        )}
       </header>
      {/* CONTACT HERO (Dibuat relative agar berada di atas background) */}
      <section className="relative z-10 pt-32 pb-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-6">Hubungi Kami</h1>
        <p className="text-gray-400 max-w-lg mx-auto">Kami selalu terbuka untuk teman-teman baru. Pilih saluran di bawah untuk berinteraksi lebih dekat.</p>
      </section>

     {/* CONTACT GRID */}
<section className="relative z-10 pb-20 px-4 md:px-6 max-w-5xl mx-auto">
  {/* grid-cols-1: Ukuran default (Mobile) 
     gap-4: Jarak antar card lebih kecil di mobile 
     md:gap-6: Jarak normal di desktop
  */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    
    {/* WhatsApp */}
    <a href="https://wa.me/6285280020604?text=Halo%20Admin."
       target="_blank" 
       className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl hover:border-[#25D366] transition group flex items-center gap-4 md:gap-6">
      <div className="p-3 md:p-4 bg-[#25D366]/20 rounded-full text-[#25D366] flex-shrink-0">
        <MessageCircle size={24} className="md:size-8" />
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-semibold">WhatsApp</h3>
        <p className="text-sm md:text-base text-gray-400">Respon cepat untuk reservasi.</p>
      </div>
    </a>

    {/* Instagram */}
    <a href="https://www.instagram.com/bersandarcoffeeandspace" target="_blank" 
       className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl hover:border-[#E1306C] transition group flex items-center gap-4 md:gap-6">
      <div className="p-3 md:p-4 bg-[#E1306C]/20 rounded-full text-[#E1306C] flex-shrink-0">
        <Music size={24} className="md:size-8" /> 
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-semibold">Instagram</h3>
        <p className="text-sm md:text-base text-gray-400">Update konten harian kami.</p>
      </div>
    </a>

    {/* TikTok */}
    <a href="https://www.tiktok.com/@bersandar_id" target="_blank" 
       className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl hover:border-white transition group flex items-center gap-4 md:gap-6">
      <div className="p-3 md:p-4 bg-white/20 rounded-full text-white flex-shrink-0">
        <Music size={24} className="md:size-8" />
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-semibold">TikTok</h3>
        <p className="text-sm md:text-base text-gray-400">Konten seru di Bersandar.</p>
      </div>
    </a>

    {/* Lokasi */}
    <a href="https://tr.ee/89otQgJKyY" target="_blank" 
       className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl hover:border-amber-500 transition group flex items-center gap-4 md:gap-6">
      <div className="p-3 md:p-4 bg-amber-500/20 rounded-full text-amber-500 flex-shrink-0">
        <MapPin size={24} className="md:size-8" />
      </div>
      <div>
        <h3 className="text-lg md:text-xl font-semibold">Lokasi</h3>
        <p className="text-sm md:text-base text-gray-400">Klik untuk navigasi via Maps.</p>
      </div>
    </a>
  </div>
</section>

      <footer className="py-10 text-center border-t border-white/10 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Bersandar Coffee & Space.
      </footer>
    </main>
  );
}
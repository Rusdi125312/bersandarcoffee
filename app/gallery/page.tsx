"use client";
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";

export default function GalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('gallery').select('*');
      setItems(data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      {/* HEADER - Disederhanakan agar logo bisa merapat ke kiri */}
  <header className="absolute top-0 left-0 w-full z-50">
  {/* Hapus div pembungkus tambahan, gunakan satu grid utama */}
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto] items-center gap-6">
           {/* Logo (Kiri) - Merapat ke kiri */}
           <div className="flex items-center gap-3 justify-start">
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

          {/* Nav Desktop */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-10 font-medium">
            <a href="/" className="hover:text-[#D4A373] transition">Home</a>
            <a href="/menu" className="hover:text-[#D4A373] transition">Menu</a>
            <a href="/gallery" className="text-[#D4A373]">Gallery</a>
            <a href="/contact" className="hover:text-[#D4A373] transition">Contact</a>
          </nav>

          {/* Kanan: Hamburger (Mobile) & Reservasi (Desktop) */}
          <div className="flex justify-end items-center">
            <a href="https://wa.me/6285280020604?text=Halo%20Admin%20Bersandar,%20saya%20ingin%20reservasi." className="hidden md:block border border-white/20 hover:border-[#D4A373] px-6 py-2 rounded-xl hover:bg-[#D4A373] transition">
              Reservasi
            </a>

            {/* Tombol Hamburger - Posisinya sudah di paling kanan secara alami oleh flex justify-end */}
            <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#111]/95 backdrop-blur-md p-6 flex flex-col items-center gap-6 border-b border-white/10">
            <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/menu" onClick={() => setMenuOpen(false)}>Menu</a>
            <a href="/gallery" className="text-[#D4A373]" onClick={() => setMenuOpen(false)}>Gallery</a>
            <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
            <a href="https://wa.me/6285280020604?text=Halo%20Admin%20Bersandar,%20saya%20ingin%20reservasi." className="bg-[#D4A373] px-6 py-2 rounded-lg text-black font-bold">Reservasi</a>
          </div>
        )}
      </header>
      {/* HERO SECTION - Background lebih jelas */}
      <section className="relative h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {/* Opasitas gambar ditingkatkan ke 60 agar lebih jelas */}
          <img src="/background-cafe.jpeg" className="w-full h-full object-cover opacity-60" />
          {/* Gradien lebih tipis agar gambar latar tidak terlalu gelap */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#111111]" />
        </div>
        <h1 className="relative z-10 text-4xl md:text-6xl font-serif tracking-[4px] md:tracking-[8px] uppercase text-center mt-12">
          Galeri Bersandar
        </h1>
      </section>

      {/* GALERI CONTENT */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Memuat galeri...</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="relative overflow-hidden rounded-xl bg-white/5 p-1 group">
                <img 
                  src={item.gambar_url} 
                  alt="Galeri"
                  className="w-full h-auto rounded-lg transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* ... footer ... */}
      <footer className="py-10 text-center border-t border-white/10 mt-10">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Bersandar Coffee & Space.</p>
      </footer>
    </main>
  );
}
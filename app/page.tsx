"use client";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Coffee,
  Armchair,
  Wifi,
  Users,
} from "lucide-react";
import { Calendar } from "lucide-react";
import {BookOpen} from "lucide-react";
import { useState } from "react"; // Tambahkan useState
import { Menu, X, } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false); // State untuk buka/tutup menu
  const features = [
    {
      icon: Coffee,
      title: "Kopi Berkualitas",
      desc: "Biji kopi pilihan dengan racikan terbaik untuk setiap cangkir.",
    },
    {
      icon: Armchair,
      title: "Space Nyaman",
      desc: "Ruang yang dirancang untuk kerja, belajar, atau sekadar bersantai.",
    },
    {
      icon: Wifi,
      title: "Fasilitas Lengkap",
      desc: "Wi-Fi cepat, stop kontak tersedia, area indoor & outdoor, dan parkir luas.",
    },
    {
      icon: Users,
      title: "Tempat Berbagi",
      desc: "Ruang untuk komunitas, diskusi, acara, dan kolaborasi.",
    },
  ];

  return (
     <main className="min-h-screen bg-[#111111] text-white">
              {/* HEADER */}
              <header className="absolute top-0 left-0 w-full z-50">
    
               <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
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
          {/* Tombol Hamburger (Hanya muncul di mobile) */}
          <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
                  <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-10 font-medium">
    
                    <a href="/" className="text-[#D4A373]">Home</a>
                    <a href="/menu" className="hover:text-[#D4A373]">Menu</a>
                    <a href="/gallery" className="hover:text-[#D4A373]">Gallery</a>
                    <a href="/contact" className="hover:text-[#D4A373]">Contact</a>
                  </nav>
              
                   <a href="https://maps.app.goo.gl/6XYDm94RiDr1RMSy5" target="_blank" rel="noopener noreferrer"
                    className="bg-[#D4A373]/90 px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 text-sm md:text-base hover:bg-[#D4A373] transition">
                      <MapPin size={16} /> <span className="hidden md:inline">Lokasi Kami</span>
                  </a>
    
                </div>
              
    
      {/* Overlay Menu Mobile */}
        {menuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#111111]/95 backdrop-blur-md border-b border-white/10 flex flex-col items-center py-8 gap-6 z-50 shadow-2xl">
            <a href="/" className="text-[#D4A373]"onClick={() => setMenuOpen(false)}>Home</a>
            <a href="/menu" onClick={() => setMenuOpen(false)}>Menu</a>
            <a href="/gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
            <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
      {/* Lokasi */}
   <a href="https://maps.app.goo.gl/6XYDm94RiDr1RMSy5" target="_blank" rel="noopener noreferrer"
    className="bg-[#D4A373]/90 px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center gap-2 text-sm md:text-base hover:bg-[#D4A373] transition">
      <MapPin size={16} /> <span className="hidden md:inline">Lokasi Kami</span>
  </a>
  </div>
   )}
  </header>
      {/* ================= HERO ================= */}
  <section
      className="relative min-h-screen flex items-center px-6 md:px-16"
      style={{
        backgroundImage: "url('/background-cafe.jpeg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/55" />

  {/* Konten Utama - Menggunakan Grid agar bergeser ke kiri */}
  <div className="relative z-10 max-w-7xl mx-auto w-full pt-30">
    
    {/* Grid dengan 2 kolom pada desktop (md:), 1 kolom pada mobile */}
    <div className="grid md:grid-cols-2 gap-8 items-center">
      
      {/* Kolom Kiri: Tempat konten Anda */}

      <div className="max-w-2xl">
        <p className="uppercase tracking-[4px] text-[#D4A373] text-xs md:text-sm mb-4">
          Bersandar Coffee & Space
        </p>

        <h1 className="text-4xl md:text-7xl font-serif leading-tight">
          Tempat untuk <br />
          <span className="text-[#D4A373]">bersandar,</span><br />
          secangkir demi ketenangan.
        </h1>

        <p className="text-gray-200 text-base md:text-lg mt-6 leading-relaxed">
          Lebih dari sekadar kopi, Bersandar adalah ruang untuk
          beristirahat, bekerja, berbagi, dan menikmati waktu
          dengan cara yang bermakna.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/menu">
            <button className="w-full justify-center flex items-center gap-3 border border-white/30 hover:bg-white/10 px-8 py-4 rounded-xl transition">
              <BookOpen size={20} /> <span>Lihat Menu</span>
            </button>
          </Link>

          <a href="https://wa.me/6285280020604?text=Halo%20Admin%20Bersandar,%20saya%20ingin%20melakukan%20reservasi%20tempat">
            <button className="w-full justify-center flex items-center gap-3 border border-white/30 hover:bg-white/10 px-8 py-4 rounded-xl transition">
              <Calendar size={20} /> <span>Reservasi Space</span>
            </button>
          </a>
        </div>

        {/* Info Box */}
        <div className="mt-12 mb-20 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-3 flex-1">
            <MapPin className="text-[#D4A373]" />
            <span>
              Kp Lebaksiuh 2, Sukamaju,<br />
              Kadudampit, Sukabumi
            </span>
          </div>
          <div className="hidden md:block w-px bg-white/20" />
          <div className="flex items-center gap-3">
            <Clock className="text-[#D4A373]" />
            <span>Setiap Hari <br /> 08.00 - 22.00 WIB</span>
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Dibiarkan kosong sebagai ruang kosong agar konten kiri menonjol */}
      <div className="hidden md:block"></div>
      
    </div>
  </div>
</section>

      {/* ================= FEATURES ================= */}
<section className="bg-[#F5F1EB] py-8">
  <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-24 relative z-30">
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* grid-cols-1 di mobile, md:grid-cols-2, lg:grid-cols-4 di desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
        {features.map((item, index) => (
          <div key={index} className="p-6 md:p-8">
            <item.icon size={40} className="text-[#7A5C46] mb-4" />
            <h3 className="font-semibold text-stone-900 mb-2">{item.title}</h3>
            <p className="text-sm text-stone-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

    </main>
  );
}
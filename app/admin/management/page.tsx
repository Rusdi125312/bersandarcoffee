"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  PackageSearch, 
  TrendingUp, 
  RefreshCcw, 
  UtensilsCrossed, 
  ShoppingBag, 
  Image as ImageIcon,
  ArrowRight,
  Menu,
  X,
  Globe
} from "lucide-react";

export default function ManagementHubPage() {
  // Data menu kartu manajemen (bisa disesuaikan dengan rute yang sudah Anda buat)
  const managementMenus = [
    {
      title: "Monitoring Bahan Baku",
      description: "Pantau stok bahan baku, sisa stok harian, dan peringatan stok menipis.",
      icon: <PackageSearch size={28} className="text-[#D4A373]" />,
      href: "/admin/inventory", // Sesuaikan dengan folder rute Anda nanti
      badge: "Realtime",
    },
    {
      title: "Total Income & Keuangan",
      description: "Analisis pendapatan harian, bulanan, dan rekapitulasi transaksi kasir.",
      icon: <TrendingUp size={28} className="text-emerald-400" />,
      href: "/admin/finance",
      badge: "Financial",
    },
    {
      title: "Restok Bahan & Barang",
      description: "Catat pembelian barang masuk, supplier, dan penambahan inventaris kafe.",
      icon: <RefreshCcw size={28} className="text-blue-400" />,
      href: "/admin/restok",
      badge: "Supply",
    },
    {
      title: "Kelola Menu Kafe",
      description: "Tambah, edit, atau hapus menu makanan dan minuman beserta variannya.",
      icon: <UtensilsCrossed size={28} className="text-amber-400" />,
      href: "/admin/menu",
      badge: "Catalog",
    },
    {
      title: "Live Orders (Kasir)",
      description: "Pantau pesanan masuk dari pelanggan secara langsung dan kelola status pembayaran.",
      icon: <ShoppingBag size={28} className="text-purple-400" />,
      href: "/admin/orders",
      badge: "Active",
    },
    {
      title: "Kelola Gallery",
      description: "Perbarui foto dokumentasi suasana kafe dan galeri kegiatan untuk pengunjung.",
      icon: <ImageIcon size={28} className="text-pink-400" />,
      href: "/admin/gallery",
      badge: "Media",
    },
  ];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#111111] text-white pb-20">
          {/* HEADER NAVBAR */}
          <header className="border-b border-white/10 bg-[#111111] sticky top-0 z-50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <Link href="/" className="relative w-20 h-12 md:w-28 md:h-16 transition-transform hover:scale-105">
                <Image src="/logo-bersandar1.png" alt="Logo Bersandar" fill className="object-contain" priority />
              </Link>
    
              <nav className="hidden md:flex gap-10 font-medium">
                <a href="/admin/dashboard" className="hover:text-[#D4A373]">Katalog</a>
                <a href="/admin/gallery" className="hover:text-[#D4A373]">Gallery</a>
                <a href="/admin/menu" className="hover:text-[#D4A373]">Menu</a>
                <a href="/admin/orders" className="hover:text-[#D4A373]">Pesanan</a>
                <a href="/admin/management" className="text-[#D4A373]">Management</a>
              </nav>
    
              <div className="flex items-center gap-4">
                <Link href="/" className="hidden md:flex px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 items-center gap-2 text-sm">
                  <Globe size={16} /> Kembali
                </Link>
                <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
    
            {menuOpen && (
              <div className="md:hidden bg-[#1a1a1a] p-6 border-b border-white/10 flex flex-col gap-4">
                <a href="/admin/dashboard">Katalog</a>
                <a href="/admin/gallery">Gallery</a>
                <a href="/admin/menu">Menu</a>
                <a href="/admin/orders">Pesanan</a>
                <a href="/admin/management" className="text-[#D4A373]">Management</a>
              </div>
            )}
          </header>

      {/* Konten Utama */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#D4A373]">
            Pusat Manajemen Admin
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Bersandar Café & Space — Pilih menu navigasi di bawah untuk mengontrol seluruh sistem operasional.
          </p>
        </div>

        {/* Grid Kartu Menu Manajemen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managementMenus.map((menu, index) => (
            <Link
              key={index}
              href={menu.href}
              className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 hover:border-[#D4A373]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4A373]/5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Efek Glow Tipis saat Hover */}
              <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#D4A373]/5 rounded-full blur-2xl group-hover:bg-[#D4A373]/10 transition"></div>

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:scale-110 transition duration-300">
                    {menu.icon}
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 uppercase tracking-wider">
                    {menu.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-[#D4A373] transition">
                  {menu.title}
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {menu.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#D4A373]">
                <span>Akses Halaman</span>
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
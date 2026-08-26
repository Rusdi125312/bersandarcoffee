"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Menu, X, AlertTriangle, RefreshCw, Search, CheckCircle2 } from "lucide-react";
import Image from "next/image";

type BahanItem = {
  id: string;
  nama: string;
  stok: number;
  satuan: string;
};

export default function MonitoringStokPage() {
  const [listBahan, setListBahan] = useState<BahanItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby3bA4apWpyBtmGRmmnM1UKqKhTiy47cnpoH6Rg12x0ZWfmg_mMz5G0zBuEb43C8Jd6UQ/exec";

  useEffect(() => {
    fetchBahanBaku();
  }, []);

  async function fetchBahanBaku() {
    setLoading(true);
    try {
      const res = await fetch(`${WEB_APP_URL}?action=getBahan`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setListBahan(data);
      }
    } catch (err) {
      console.error("Gagal memuat data monitoring stok:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter bahan berdasarkan pencarian
  const filteredBahan = listBahan.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
        <main className="min-h-screen bg-[#111111] text-white pb-32">
              <header className="border-b border-white/10 bg-[#111111]/90 sticky top-0 z-50 grid grid-cols-3 items-center py-4 px-6 backdrop-blur-md">
                <Link href="/admin/management" className="text-sm text-gray-400 hover:text-[#D4A373] transition">
                  ← Kembali
                </Link>
                <h1 className="font-serif text-lg font-bold text-[#D4A373] text-center">
                  Monitoring
                </h1>
                <div className="relative ml-auto w-20 h-12 md:w-28 md:h-16">
                  <Image
                    src="/logo-bersandar1.png"
                    alt="Logo Bersandar"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </header>

      {/* KONTEN UTAMA */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#D4A373]">Monitoring Stok Bahan Baku</h1>
            <p className="text-xs text-gray-400 mt-1">Pantau ketersediaan stok barang gudang kafe secara real-time.</p>
          </div>
          <button
            onClick={fetchBahanBaku}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 px-4 py-2.5 rounded-xl text-xs hover:bg-white/5 transition text-gray-300"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#D4A373]" : ""} />
            Muat Ulang Data
          </button>
        </div>

        {/* BAR PENCARIAN & STATISTIK KECIL */}
        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari nama bahan atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black pl-10 pr-3 py-2.5 rounded-xl border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4A373]"
            />
          </div>
          <div className="text-xs text-gray-400">
            Total Jenis Bahan: <span className="text-[#D4A373] font-bold">{listBahan.length} Item</span>
          </div>
        </div>

        {/* TABEL / KARTU MONITORING */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm">Memuat data inventaris...</div>
        ) : filteredBahan.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm bg-[#1a1a1a] rounded-2xl border border-white/10">
            Tidak ada bahan baku yang ditemukan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBahan.map((item) => {
              // Menentukan status stok (misal: jika stok <= 0 habis, <= 10 menipis)
              const isHabis = item.stok <= 0;
              const isMenipis = item.stok > 0 && item.stok <= 10;

              return (
                <div
                  key={item.id}
                  className={`bg-[#1a1a1a] p-5 rounded-2xl border flex flex-col justify-between gap-4 transition shadow-md ${
                    isHabis
                      ? "border-red-500/40 bg-red-950/10"
                      : isMenipis
                      ? "border-amber-500/40 bg-amber-950/10"
                      : "border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-black/40 text-gray-400 border border-white/5">
                        {item.id}
                      </span>
                      <h3 className="font-bold text-lg mt-2 text-white">{item.nama}</h3>
                    </div>
                    {isHabis ? (
                      <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-medium">
                        <AlertTriangle size={12} /> Habis
                      </span>
                    ) : isMenipis ? (
                      <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                        <AlertTriangle size={12} /> Menipis
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                        <CheckCircle2 size={12} /> Aman
                      </span>
                    )}
                  </div>

                  <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-gray-400">Stok Tersedia:</span>
                    <span className={`text-lg font-extrabold ${isHabis ? "text-red-400" : isMenipis ? "text-amber-400" : "text-[#D4A373]"}`}>
                      {item.stok} <span className="text-xs font-normal text-gray-400">{item.satuan}</span>
                    </span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link
                      href="/admin/restok"
                      className="text-xs text-[#D4A373] hover:underline flex items-center gap-1 font-medium"
                    >
                      + Tambah Restok Barang &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
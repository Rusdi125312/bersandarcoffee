"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Globe, Menu, X, DollarSign, ShoppingCart, TrendingUp, Calendar, RefreshCw, Search, Award } from "lucide-react";
import Image from "next/image";

type TransaksiItem = {
  id: string;
  namaPemesan: string;
  noMeja: string;
  totalHarga: string | number;
  metodeBayar: string;
  itemPesanan: string;
  waktuSelesai: string;
  tanggal: string; // Format dari GAS: "M/d/yyyy" atau "MM/DD/YYYY"
};

export default function FinancePage() {
  const [listTransaksi, setListTransaksi] = useState<TransaksiItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriode, setFilterPeriode] = useState<"semua" | "hari_ini" | "bulan_ini">("semua");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby3bA4apWpyBtmGRmmnM1UKqKhTiy47cnpoH6Rg12x0ZWfmg_mMz5G0zBuEb43C8Jd6UQ/exec";

  useEffect(() => {
    fetchTransaksi();
  }, []);

  async function fetchTransaksi() {
    setLoading(true);
    try {
      const res = await fetch(`${WEB_APP_URL}?action=getTransaksi`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setListTransaksi(data);
      }
    } catch (err) {
      console.error("Gagal memuat data keuangan:", err);
    } finally {
      setLoading(false);
    }
  }

  // Helper mengubah string harga "Rp 50.000,00" atau sejenisnya menjadi angka murni
  const parseHarga = (harga: string | number) => {
    if (typeof harga === "number") return harga;
    if (!harga) return 0;
    const numericString = harga.replace(/[^0-9]/g, "");
    return Number(numericString) || 0;
  };

  // Filter transaksi berdasarkan Periode & Kata Kunci Pencarian
  const filteredTransaksi = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    return listTransaksi.filter((item) => {
      // 1. Filter Pencarian Teks
      const matchSearch =
        item.namaPemesan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemPesanan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.metodeBayar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id?.toString().toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      // 2. Filter Periode Waktu
      if (filterPeriode === "hari_ini") {
        // Cocokkan string tanggal atau waktu selesai hari ini
        if (!item.tanggal) return false;
        // Normalisasi format tanggal perbandingan sederhana
        const tglItem = new Date(item.tanggal);
        return (
          tglItem.getDate() === today.getDate() &&
          tglItem.getMonth() === currentMonth &&
          tglItem.getFullYear() === currentYear
        );
      } else if (filterPeriode === "bulan_ini") {
        if (!item.tanggal) return false;
        const tglItem = new Date(item.tanggal);
        return (
          tglItem.getMonth() === currentMonth &&
          tglItem.getFullYear() === currentYear
        );
      }

      return true; // "semua"
    });
  }, [listTransaksi, searchQuery, filterPeriode]);

  // Statistik Keuangan Berdasarkan Data yang Difilter
  const stats = useMemo(() => {
    let totalOmzet = 0;
    const itemCountMap: { [key: string]: number } = {};

    filteredTransaksi.forEach((item) => {
      totalOmzet += parseHarga(item.totalHarga);

      // Analisis Menu Terlaris dari string "Item Pesanan" (Cth: "Americano (Hot) x2, Kentang Goreng x1")
      if (item.itemPesanan) {
        const items = item.itemPesanan.split(",");
        items.forEach((singleItem) => {
          const raw = singleItem.trim();
          const lastX = raw.lastIndexOf("x");
          if (lastX !== -1) {
            const namaMenu = raw.substring(0, lastX).trim();
            const qty = parseInt(raw.substring(lastX + 1).trim()) || 1;
            itemCountMap[namaMenu] = (itemCountMap[namaMenu] || 0) + qty;
          }
        });
      }
    });

    // Cari menu teratas
    let topMenu = "-";
    let maxQty = 0;
    Object.entries(itemCountMap).forEach(([menu, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        topMenu = `${menu} (${qty} porsi)`;
      }
    });

    const totalOrder = filteredTransaksi.length;
    const avgOrderValue = totalOrder > 0 ? Math.round(totalOmzet / totalOrder) : 0;

    return {
      totalOmzet,
      totalOrder,
      avgOrderValue,
      topMenu,
    };
  }, [filteredTransaksi]);

  return (
     <main className="min-h-screen bg-[#111111] text-white pb-32">
          <header className="border-b border-white/10 bg-[#111111]/90 sticky top-0 z-50 grid grid-cols-3 items-center py-4 px-6 backdrop-blur-md">
            <Link href="/menu" className="text-sm text-gray-400 hover:text-[#D4A373] transition">
              ← Kembali
            </Link>
            <h1 className="font-serif text-lg font-bold text-[#D4A373] text-center">
              Finance Dashboard
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
        
        {/* BAGIAN JUDUL & FILTER PERIODE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#D4A373]">Laporan Hasil Keuangan</h1>
            <p className="text-xs text-gray-400 mt-1">Analisis omzet, performa penjualan, dan rekam jejak finansial kafe.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* TOMBOL FILTER PERIODE */}
            <div className="bg-[#1a1a1a] p-1 rounded-xl border border-white/10 flex gap-1 text-xs">
              <button
                onClick={() => setFilterPeriode("semua")}
                className={`px-3 py-1.5 rounded-lg transition ${filterPeriode === "semua" ? "bg-[#D4A373] text-black font-bold" : "text-gray-400 hover:text-white"}`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterPeriode("hari_ini")}
                className={`px-3 py-1.5 rounded-lg transition ${filterPeriode === "hari_ini" ? "bg-[#D4A373] text-black font-bold" : "text-gray-400 hover:text-white"}`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setFilterPeriode("bulan_ini")}
                className={`px-3 py-1.5 rounded-lg transition ${filterPeriode === "bulan_ini" ? "bg-[#D4A373] text-black font-bold" : "text-gray-400 hover:text-white"}`}
              >
                Bulan Ini
              </button>
            </div>

            <button
              onClick={fetchTransaksi}
              className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 p-2.5 rounded-xl hover:bg-white/5 transition text-gray-300"
              title="Muat Ulang"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-[#D4A373]" : ""} />
            </button>
          </div>
        </div>

        {/* KARTU METRIK KEUANGAN UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Omzet */}
          <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/10 shadow-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs">Total Pendapatan (Omzet)</span>
              <DollarSign size={18} className="text-[#D4A373]" />
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Rp {stats.totalOmzet.toLocaleString("id-ID")}
            </h2>
          </div>

          {/* Jumlah Transaksi */}
          <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/10 shadow-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs">Jumlah Pesanan Selesai</span>
              <ShoppingCart size={18} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white">
              {stats.totalOrder} <span className="text-xs font-normal text-gray-400">Transaksi</span>
            </h2>
          </div>

          {/* Rata-rata Nilai Order */}
          <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/10 shadow-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs">Rata-rata / Transaksi</span>
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Rp {stats.avgOrderValue.toLocaleString("id-ID")}
            </h2>
          </div>

          {/* Menu Terlaris */}
          <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/10 shadow-md">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs">Menu Paling Laris</span>
              <Award size={18} className="text-amber-400" />
            </div>
            <h2 className="text-sm font-bold text-[#D4A373] truncate mt-1" title={stats.topMenu}>
              {stats.topMenu}
            </h2>
          </div>
        </div>

        {/* PENCARIAN RIWAYAT */}
        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 mb-6 flex justify-between items-center">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari transaksi berdasarkan nama/menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black pl-10 pr-3 py-2.5 rounded-xl border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4A373]"
            />
          </div>
          <div className="text-xs text-gray-400 hidden md:block">
            Menampilkan <span className="text-white font-bold">{filteredTransaksi.length}</span> catatan
          </div>
        </div>

        {/* TABEL RINCIAN KEUANGAN */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase">
                  <th className="p-4">ID</th>
                  <th className="p-4">Waktu & Tanggal</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Meja</th>
                  <th className="p-4">Item Menu Terjual</th>
                  <th className="p-4">Pembayaran</th>
                  <th className="p-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">Memuat rincian keuangan...</td>
                  </tr>
                ) : filteredTransaksi.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">Tidak ada data keuangan pada filter periode ini.</td>
                  </tr>
                ) : (
                  filteredTransaksi.map((item, index) => (
                    <tr key={index} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 font-mono text-xs text-gray-400">#{item.id}</td>
                      <td className="p-4 text-xs text-gray-300">
                        <div>{item.tanggal || "-"}</div>
                        <div className="text-[10px] text-gray-500">{item.waktuSelesai || ""}</div>
                      </td>
                      <td className="p-4 font-medium">{item.namaPemesan || "-"}</td>
                      <td className="p-4">Meja {item.noMeja || "-"}</td>
                      <td className="p-4 text-xs text-gray-300 max-w-xs truncate">{item.itemPesanan || "-"}</td>
                      <td className="p-4">
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300">
                          {item.metodeBayar || "-"}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-[#D4A373]">{item.totalHarga || "Rp 0"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
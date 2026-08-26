"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Menu, X, DollarSign, TrendingUp, ShoppingCart, RefreshCw, Search } from "lucide-react";
import Image from "next/image";

type TransaksiItem = {
  id: string;
  namaPemesan: string;
  noMeja: string;
  totalHarga: string | number;
  metodeBayar: string;
  itemPesanan: string;
  waktuSelesai: string;
  tanggal: string;
};

export default function FinancePage() {
  const [listTransaksi, setListTransaksi] = useState<TransaksiItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Gunakan Google Apps Script yang sama untuk mengambil data transaksi (atau buat fungsi doGet khusus transaksi)
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

  // Filter transaksi berdasarkan pencarian nama pemesan atau item
  const filteredTransaksi = listTransaksi.filter((item) =>
    item.namaPemesan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.itemPesanan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.metodeBayar?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hitung Total Pendapatan Keseluruhan
  const totalPendapatan = listTransaksi.reduce((acc, curr) => {
    // Membersihkan format string harga (misal: "Rp50.000,00" menjadi angka 50000)
    let cleanPrice = 0;
    if (typeof curr.totalHarga === "string") {
      const numericString = curr.totalHarga.replace(/[^0-9]/g, "");
      cleanPrice = Number(numericString) || 0;
    } else {
      cleanPrice = Number(curr.totalHarga) || 0;
    }
    return acc + cleanPrice;
  }, 0);

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
            <a href="/admin/restok" className="hover:text-[#D4A373]">Restok</a>
            <a href="/admin/monitoring" className="hover:text-[#D4A373]">Monitoring</a>
            <a href="/admin/finance" className="text-[#D4A373]">Finance</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:flex px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 items-center gap-2 text-sm">
              <Globe size={16} /> Website
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
            <a href="/admin/restok">Restok</a>
            <a href="/admin/monitoring">Monitoring</a>
            <a href="/admin/finance" className="text-[#D4A373]">Finance</a>
          </div>
        )}
      </header>

      {/* KONTEN UTAMA */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#D4A373]">Laporan Keuangan & Pendapatan</h1>
            <p className="text-xs text-gray-400 mt-1">Ringkasan transaksi dan omzet penjualan kafe secara real-time.</p>
          </div>
          <button
            onClick={fetchTransaksi}
            className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 px-4 py-2.5 rounded-xl text-xs hover:bg-white/5 transition text-gray-300"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#D4A373]" : ""} />
            Muat Ulang Data
          </button>
        </div>

        {/* KARTU RINGKASAN STATISTIK (CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-md">
            <div className="p-4 rounded-xl bg-amber-500/10 text-[#D4A373] border border-amber-500/20">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Pendapatan (Omzet)</p>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                Rp {totalPendapatan.toLocaleString("id-ID")}
              </h2>
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 flex items-center gap-4 shadow-md">
            <div className="p-4 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShoppingCart size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Transaksi Selesai</p>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {listTransaksi.length} <span className="text-sm font-normal text-gray-400">Pesanan</span>
              </h2>
            </div>
          </div>
        </div>

        {/* BAR PENCARIAN */}
        <div className="bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 mb-6 flex justify-between items-center">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari nama pemesan atau menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black pl-10 pr-3 py-2.5 rounded-xl border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4A373]"
            />
          </div>
        </div>

        {/* TABEL RIWAYAT TRANSAKSI */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase">
                  <th className="p-4">ID</th>
                  <th className="p-4">Waktu / Tanggal</th>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Meja</th>
                  <th className="p-4">Item Pesanan</th>
                  <th className="p-4">Metode</th>
                  <th className="p-4 text-right">Total Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">Memuat riwayat keuangan...</td>
                  </tr>
                ) : filteredTransaksi.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">Belum ada data transaksi yang tercatat.</td>
                  </tr>
                ) : (
                  filteredTransaksi.map((item, index) => (
                    <tr key={index} className="hover:bg-white/[0.02] transition">
                      <td className="p-4 font-mono text-xs text-gray-400">{item.id}</td>
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
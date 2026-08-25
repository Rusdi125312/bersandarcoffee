"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, Menu, X, PlusCircle, Search } from "lucide-react";
import Image from "next/image";

type BahanItem = {
  id: string;
  nama: string;
  stok: number;
  satuan: string;
};

export default function RestokPage() {
  const [listBahan, setListBahan] = useState<BahanItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBahanId, setSelectedBahanId] = useState("");
  
  // State untuk form restok
  const [jumlah, setJumlah] = useState<string>("");
  const [isNewBahan, setIsNewBahan] = useState(false);
  const [newIdBahan, setNewIdBahan] = useState("");
  const [newNamaBahan, setNewNamaBahan] = useState("");
  const [newSatuan, setNewSatuan] = useState("gram");

  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pesan, setPesan] = useState("");

  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby3bA4apWpyBtmGRmmnM1UKqKhTiy47cnpoH6Rg12x0ZWfmg_mMz5G0zBuEb43C8Jd6UQ/exec";

  useEffect(() => {
    fetchBahanBaku();
  }, []);

  async function fetchBahanBaku() {
    try {
      const res = await fetch(`${WEB_APP_URL}?action=getBahan`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setListBahan(data);
      }
    } catch (err) {
      console.error("Gagal memuat data bahan baku:", err);
    }
  }

  // Filter bahan berdasarkan pencarian
  const filteredBahan = listBahan.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestokSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPesan("");

    let payloadId = selectedBahanId;
    let payloadNama = "";
    let payloadSatuan = "pcs";

    if (isNewBahan) {
      payloadId = newIdBahan;
      payloadNama = newNamaBahan;
      payloadSatuan = newSatuan;
    } else {
      const found = listBahan.find((item) => item.id === selectedBahanId);
      if (found) {
        payloadNama = found.nama;
        payloadSatuan = found.satuan;
      }
    }

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restok",
          id_bahan: payloadId,
          nama_bahan: payloadNama,
          jumlah: Number(jumlah),
          satuan: payloadSatuan,
        }),
      });

      setPesan("Berhasil! Stok bahan berhasil diperbarui.");
      setJumlah("");
      setSelectedBahanId("");
      setIsNewBahan(false);
      setNewIdBahan("");
      setNewNamaBahan("");
      fetchBahanBaku(); // Refresh data
    } catch (error) {
      console.error(error);
      setPesan("Terjadi kesalahan saat memperbarui stok.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#111111] text-white pb-32">
          <header className="border-b border-white/10 bg-[#111111]/90 sticky top-0 z-50 grid grid-cols-3 items-center py-4 px-6 backdrop-blur-md">
            <Link href="/admin/management" className="text-sm text-gray-400 hover:text-[#D4A373] transition">
              ← Kembali
            </Link>
            <h1 className="font-serif text-lg font-bold text-[#D4A373] text-center">
              Self-Order
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
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D4A373]">Manajemen Restok Bahan Baku</h1>
          <p className="text-xs text-gray-400 mt-1">Tambah stok barang gudang atau daftarkan bahan baku baru secara real-time.</p>
        </div>

        <form onSubmit={handleRestokSubmit} className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 space-y-6 shadow-md">
          
          {/* PILIHAN MODE: PILIH BARANG ADA / TAMBAH BARU */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-sm font-semibold text-gray-300">Jenis Input Restok:</span>
            <button
              type="button"
              onClick={() => setIsNewBahan(!isNewBahan)}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-[#D4A373] border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              {isNewBahan ? "Pilih dari Daftar yang Ada" : "+ Tambah Bahan Baku Baru"}
            </button>
          </div>

          {!isNewBahan ? (
            <div className="space-y-4">
              {/* KOLOM PENCARIAN BARANG */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Cari Nama Barang / ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Ketik nama bahan yang ingin dicari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black pl-10 pr-3 py-3 rounded-lg border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4A373]"
                  />
                </div>
              </div>

              {/* DROPDOWN PILIH BARANG */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Pilih Barang</label>
                <select
                  className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm focus:outline-none focus:border-[#D4A373]"
                  value={selectedBahanId}
                  onChange={(e) => setSelectedBahanId(e.target.value)}
                  required
                >
                  <option value="">-- Pilih Bahan Baku --</option>
                  {filteredBahan.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama} (Stok Saat Ini: {item.stok} {item.satuan})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ID Bahan Baru (Cth: B099)</label>
                <input
                  type="text"
                  placeholder="ID Unik"
                  value={newIdBahan}
                  onChange={(e) => setNewIdBahan(e.target.value)}
                  required
                  className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Nama Bahan Baru</label>
                <input
                  type="text"
                  placeholder="Nama Bahan"
                  value={newNamaBahan}
                  onChange={(e) => setNewNamaBahan(e.target.value)}
                  required
                  className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Satuan</label>
                <select
                  value={newSatuan}
                  onChange={(e) => setNewSatuan(e.target.value)}
                  className="w-full bg-black p-3 rounded-lg border border-white/10 text-white text-sm"
                >
                  <option value="gram">gram</option>
                  <option value="ml">ml</option>
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                  <option value="pack">pack</option>
                </select>
              </div>
            </div>
          )}

          {/* JUMLAH TAMBAHAN STOK */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Jumlah Tambahan Masuk</label>
            <input
              type="number"
              placeholder="Contoh: 1000"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              required
              className="w-full bg-black p-3 rounded-lg border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#D4A373]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#D4A373] hover:bg-[#c39264] text-black font-bold py-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
          >
            {loading ? "Menyimpan..." : "Simpan Restok Barang"}
          </button>
        </form>

        {pesan && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D4A373] text-center text-sm font-medium">
            {pesan}
          </div>
        )}
      </div>
    </main>
  );
}
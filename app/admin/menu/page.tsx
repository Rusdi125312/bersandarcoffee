"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import Image from "next/image";

type MenuItem = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  gambar: string;
  variant_type?: string;
};

export default function AdminMenu() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "Minuman",
    harga: 0,
    deskripsi: "",
    gambar: "",
    variant_type: "Ice & Hot", // Default awal untuk minuman
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    const { data } = await supabase
      .from("menu_self_order")
      .select("*")
      .order("id", { ascending: true });
    if (data) setMenus(data);
  }

  async function uploadImageAndGetUrl(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("menu-images")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error("Gagal mengunggah gambar: " + uploadError.message);
    }

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Cek apakah kategori termasuk minuman/coffee/kopi
  const isMinuman = 
    formData.kategori.toLowerCase().includes("minuman") || 
    formData.kategori.toLowerCase().includes("coffee") || 
    formData.kategori.toLowerCase().includes("kopi");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.gambar;

      if (imageFile) {
        finalImageUrl = await uploadImageAndGetUrl(imageFile);
      }

      // Jika bukan kategori minuman, varian otomatis diset ke "-"
      const payloadVarian = isMinuman ? formData.variant_type : "-";

      if (editingId !== null) {
        const { error } = await supabase
          .from("menu_self_order")
          .update({
            nama: formData.nama,
            kategori: formData.kategori,
            harga: formData.harga,
            deskripsi: formData.deskripsi,
            gambar: finalImageUrl,
            variant_type: payloadVarian,
          })
          .eq("id", editingId);

        if (error) throw error;
        alert("Menu berhasil diperbarui!");
      } else {
        const { error } = await supabase.from("menu_self_order").insert([
          {
            nama: formData.nama,
            kategori: formData.kategori,
            harga: formData.harga,
            deskripsi: formData.deskripsi,
            gambar: finalImageUrl,
            variant_type: payloadVarian,
          },
        ]);

        if (error) throw error;
        alert("Menu baru berhasil ditambahkan!");
      }

      resetForm();
      fetchMenu();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menyimpan menu.");
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(item: MenuItem) {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga,
      deskripsi: item.deskripsi || "",
      gambar: item.gambar,
      variant_type: item.variant_type && item.variant_type !== "-" ? item.variant_type : "Ice & Hot",
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setFormData({
      nama: "",
      kategori: "Minuman",
      harga: 0,
      deskripsi: "",
      gambar: "",
      variant_type: "Ice & Hot",
    });
    setImageFile(null);
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  async function deleteMenu(id: number) {
    if (confirm("Yakin ingin menghapus menu ini?")) {
      const { error } = await supabase
        .from("menu_self_order")
        .delete()
        .eq("id", id);
      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        fetchMenu();
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white pb-20">
      <header className="border-b border-white/10 bg-[#111111] sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="relative w-20 h-12 md:w-28 md:h-16 transition-transform hover:scale-105"
          >
            <Image
              src="/logo-bersandar1.png"
              alt="Logo Bersandar"
              fill
              className="object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex gap-10 font-medium">
            <a href="/admin/dashboard" className="hover:text-[#D4A373]">
              Katalog
            </a>
            <a href="/admin/gallery" className="hover:text-[#D4A373]">
              Gallery
            </a>
            <a href="/admin/menu" className="text-[#D4A373]">
              Menu
            </a>
            <a href="/admin/orders" className="hover:text-[#D4A373]">
              Pesanan
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden md:flex px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 items-center gap-2 text-sm"
            >
              <Globe size={16} /> Website
            </Link>
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#1a1a1a] p-6 border-b border-white/10 flex flex-col gap-4">
            <a href="/admin/dashboard">Katalog Menu</a>
            <a href="/admin/gallery">Gallery</a>
            <a href="/admin/menu" className="text-[#D4A373]">
              Menu
            </a>
            <a href="/admin/orders">Pesanan</a>
            <hr className="border-white/10" />
            <a href="/">Lihat Website</a>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#D4A373]">
            {editingId !== null ? "Edit Menu Café" : "Kelola Menu"}
          </h1>
          {editingId !== null && (
            <button
              onClick={resetForm}
              className="bg-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-600 transition"
            >
              Batal Edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <input
            placeholder="Nama Menu"
            className="bg-black p-3 rounded-lg border border-white/10 text-white placeholder-gray-500 text-sm"
            required
            onChange={(e) =>
              setFormData({ ...formData, nama: e.target.value })
            }
            value={formData.nama}
          />

          <select
            className="bg-black p-3 rounded-lg border border-white/10 text-white text-sm"
            onChange={(e) =>
              setFormData({ ...formData, kategori: e.target.value })
            }
            value={formData.kategori}
          >
            <option value="Minuman">Minuman</option>
            <option value="Coffee">Coffee</option>
            <option value="Makanan">Makanan</option>
            <option value="Cemilan">Cemilan</option>
          </select>

          <input
            type="number"
            placeholder="Harga (Contoh: 18000)"
            className="bg-black p-3 rounded-lg border border-white/10 text-white placeholder-gray-500 text-sm"
            required
            onChange={(e) =>
              setFormData({
                ...formData,
                harga: parseInt(e.target.value) || 0,
              })
            }
            value={formData.harga || ""}
          />

          <select
            className={`bg-black p-3 rounded-lg border border-white/10 text-white text-sm ${
              !isMinuman ? "opacity-45 cursor-not-allowed bg-neutral-900" : ""
            }`}
            disabled={!isMinuman}
            onChange={(e) =>
              setFormData({ ...formData, variant_type: e.target.value })
            }
            value={isMinuman ? formData.variant_type : "-"}
          >
            {isMinuman ? (
              <>
                <option value="Ice & Hot">Pilihan Varian: Ice / Hot (Bisa Pilih)</option>
                <option value="-">Tanpa Pilihan Varian (Fixed / Kosong)</option>
              </>
            ) : (
              <option value="-">Tidak Ada Varian (Khusus Makanan/Cemilan)</option>
            )}
          </select>

          <input
            placeholder="Deskripsi Singkat Menu"
            className="bg-black p-3 rounded-lg border border-white/10 text-white placeholder-gray-500 text-sm"
            onChange={(e) =>
              setFormData({ ...formData, deskripsi: e.target.value })
            }
            value={formData.deskripsi}
          />

          <div className="flex flex-col justify-center">
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="bg-black p-2 rounded-lg border border-white/10 text-xs text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#D4A373] file:text-black hover:file:bg-[#c39264]"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            <span className="text-[10px] text-gray-500 mt-1">
              Biarkan kosong jika tidak mengubah gambar.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`font-bold py-3 rounded-lg col-span-full transition text-sm ${
              editingId !== null
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-[#D4A373] hover:bg-[#c39264] text-black"
            }`}
          >
            {loading
              ? "Memproses..."
              : editingId !== null
              ? "Simpan Perubahan Menu"
              : "+ Tambah Menu Baru"}
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menus.map((m) => (
            <div
              key={m.id}
              className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 flex flex-col justify-between gap-4 relative overflow-hidden shadow-md"
            >
              <div>
                {m.gambar ? (
                  <img
                    src={m.gambar}
                    alt={m.nama}
                    className="w-full h-36 object-cover rounded-lg mb-3 border border-white/10"
                  />
                ) : (
                  <div className="w-full h-36 bg-black/40 rounded-lg mb-3 flex items-center justify-center text-gray-500 text-xs">
                    Tidak ada gambar
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 capitalize">
                    {m.kategori}
                  </span>
                  {m.variant_type && m.variant_type !== "-" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-[#D4A373] border border-amber-500/30">
                      {m.variant_type}
                    </span>
                  )}
                </div>

                <p className="font-bold text-lg mt-1">{m.nama}</p>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{m.deskripsi}</p>
                <p className="text-[#D4A373] font-bold mt-2">
                  Rp {m.harga.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleEditClick(m)}
                  className="bg-blue-950/40 text-blue-400 border border-blue-900/50 py-2 rounded-lg text-sm hover:bg-blue-900 hover:text-white transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteMenu(m.id)}
                  className="bg-red-950/40 text-red-400 border border-red-900/50 py-2 rounded-lg text-sm hover:bg-red-900 hover:text-white transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
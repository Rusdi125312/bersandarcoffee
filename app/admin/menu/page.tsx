"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import Image from "next/image";

type MenuItem = { id: number; nama: string; kategori: string; harga: number; gambar: string; };

export default function AdminMenu() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState({ nama: "", kategori: "Minuman", harga: 0, gambar: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // State untuk melacak ID menu yang sedang diedit (null jika sedang mode tambah)
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { fetchMenu(); }, []);

  async function fetchMenu() {
    const { data } = await supabase.from("menu_self_order").select("*").order("id", { ascending: true });
    if (data) setMenus(data);
  }

  // Fungsi untuk Upload File ke Supabase Storage
  async function uploadImageAndGetUrl(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
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

  // Fungsi Simpan (Bisa untuk Tambah Baru atau Update)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.gambar;

      // Jika user memilih file gambar baru, upload dulu ke storage
      if (imageFile) {
        finalImageUrl = await uploadImageAndGetUrl(imageFile);
      }

      if (editingId !== null) {
        // MODE EDIT / UPDATE
        const { error } = await supabase
          .from("menu_self_order")
          .update({
            nama: formData.nama,
            kategori: formData.kategori,
            harga: formData.harga,
            gambar: finalImageUrl
          })
          .eq("id", editingId);

        if (error) throw error;
        alert("Menu berhasil diperbarui!");
      } else {
        // MODE TAMBAH BARU
        const { error } = await supabase
          .from("menu_self_order")
          .insert([{
            nama: formData.nama,
            kategori: formData.kategori,
            harga: formData.harga,
            gambar: finalImageUrl
          }]);
        
        if (error) throw error;
        alert("Menu baru berhasil ditambahkan!");
      }

      // Reset Form & State
      resetForm();
      fetchMenu();
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menyimpan menu.");
    } finally {
      setLoading(false);
    }
  }

  // Fungsi untuk memasukkan data menu ke dalam form saat tombol "Edit" diklik
  function handleEditClick(item: MenuItem) {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      kategori: item.kategori,
      harga: item.harga,
      gambar: item.gambar
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Gulir ke atas ke arah form
  }

  // Fungsi Batal Edit
  function resetForm() {
    setEditingId(null);
    setFormData({ nama: "", kategori: "Minuman", harga: 0, gambar: "" });
    setImageFile(null);
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  }

  async function deleteMenu(id: number) {
    if (confirm("Yakin ingin menghapus menu ini?")) {
      const { error } = await supabase.from("menu_self_order").delete().eq("id", id);
      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        fetchMenu();
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      {/* Header Admin */}
      <header className="border-b border-white/10 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="relative ml-4 w-20 h-16 md:w-32 md:h-24 transition-transform hover:scale-105">
             <Image src="/logo-bersandar1.png" alt="Logo Bersandar" fill className="object-contain" priority/>
          </Link>
          
          <nav className="hidden md:flex gap-10 font-medium">
            <a href="/admin/dashboard" className="hover:text-[#D4A373]">Katalog Menu</a>
            <a href="/admin/gallery" className="hover:text-[#D4A373]">Gallery</a>
            <a href="/admin/menu" className="text-[#D4A373]">Menu</a>
            <a href="/admin/orders" className="hover:text-[#D4A373]">Pesanan</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:flex px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 items-center gap-2">
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
            <a href="/admin/menu" className="text-[#D4A373]">Menu</a>
            <a href="/admin/orders">Pesanan</a>
            <hr className="border-white/10" />
            <a href="/">Lihat Website</a>
          </div>
        )}
      </header>

      {/* Konten Utama */}
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
        
        {/* Form Tambah / Edit Menu */}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input 
            placeholder="Nama Menu" 
            className="bg-black p-3 rounded-lg border border-white/10 text-white placeholder-gray-500" 
            required 
            onChange={(e) => setFormData({...formData, nama: e.target.value})} 
            value={formData.nama} 
          />
          
          <select 
            className="bg-black p-3 rounded-lg border border-white/10 text-white" 
            onChange={(e) => setFormData({...formData, kategori: e.target.value})} 
            value={formData.kategori}
          >
            <option value="Minuman">Minuman</option>
            <option value="Makanan">Makanan</option>
            <option value="Cemilan">Cemilan</option>
          </select>

          <input 
            type="number" 
            placeholder="Harga (Contoh: 18000)" 
            className="bg-black p-3 rounded-lg border border-white/10 text-white placeholder-gray-500" 
            required 
            onChange={(e) => setFormData({...formData, harga: parseInt(e.target.value) || 0})} 
            value={formData.harga || ""} 
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
            <span className="text-[10px] text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengubah gambar saat edit.</span>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`font-bold py-3 rounded-lg col-span-full transition ${
              editingId !== null 
                ? "bg-blue-600 hover:bg-blue-500 text-white" 
                : "bg-[#D4A373] hover:bg-[#c39264] text-black"
            }`}
          >
            {loading ? "Memproses..." : editingId !== null ? "Simpan Perubahan Menu" : "+ Tambah Menu Baru"}
          </button>
        </form>

        {/* List Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menus.map((m) => (
            <div key={m.id} className="bg-[#1a1a1a] p-4 rounded-xl border border-white/10 flex flex-col justify-between gap-4">
              <div>
                {m.gambar ? (
                  <img src={m.gambar} alt={m.nama} className="w-full h-36 object-cover rounded-lg mb-3 border border-white/10" />
                ) : (
                  <div className="w-full h-36 bg-black/40 rounded-lg mb-3 flex items-center justify-center text-gray-500 text-xs">
                    Tidak ada gambar
                  </div>
                )}
                <p className="font-bold text-lg">{m.nama}</p>
                <p className="text-xs text-gray-400 capitalize">{m.kategori}</p>
                <p className="text-[#D4A373] font-bold mt-1">Rp {m.harga.toLocaleString()}</p>
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
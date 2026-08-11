"use client";

import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Globe, Menu, X, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [nama, setNama] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    const { data, error } = await supabase.from('gallery').select('*').order('id', { ascending: false });
    if (error) console.error("Error fetching:", error.message);
    else setItems(data || []);
  }

  async function handleUpload() {
    if (!file || !nama) return alert("Pilih file dan isi nama!");
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('gallery').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(fileName);
      const { error: insertError } = await supabase.from('gallery').insert([{ nama, gambar_url: publicUrl, file_name: fileName }]);
      
      if (insertError) throw insertError;
      alert("Berhasil!");
      setNama(''); setFile(null); fetchGallery();
    } catch (err: any) { alert("Error: " + err.message); } finally { setLoading(false); }
  }

  async function handleDelete(id: number, fileName: string) {
    if (!confirm("Yakin ingin hapus?")) return;
    setDeletingId(id);
    try {
      // 1. Hapus file dari Storage
      const { error: storageError } = await supabase.storage.from('gallery').remove([fileName]);
      if (storageError) throw storageError;

      // 2. Hapus record dari Database
      const { error: dbError } = await supabase.from('gallery').delete().eq('id', id);
      if (dbError) throw dbError;

      // 3. Refresh data
      await fetchGallery();
    } catch (err: any) { 
      alert("Gagal: " + err.message); 
    } finally { 
      setDeletingId(null); 
    }
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white">
      {/* NAVBAR */}
     <header className="border-b border-white/10 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link href="/" className="relative ml-4 w-20 h-16 md:w-32 md:h-24 transition-transform hover:scale-105">
                            <Image 
                              src="/logo-bersandar1.png" 
                              alt="Logo Bersandar"
                              fill
                              className="object-contain"
                              priority
                            />
                          </Link>

          <nav className="hidden md:flex gap-10 font-medium">
            <a href="/admin/dashboard" className="hover:text-[#D4A373]">Menu</a>
            <a href="/admin/gallery" className="text-[#D4A373]">Gallery</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:flex px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 items-center gap-2 text-sm">
              <Globe size={16} /> Lihat Website
            </Link>
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#111] p-6 border-b border-white/10 flex flex-col gap-4">
            <a href="/admin/dashboard" onClick={() => setMenuOpen(false)}>Menu</a>
            <a href="/admin/gallery" className="text-[#D4A373]" onClick={() => setMenuOpen(false)}>Gallery</a>
            <a href="/" onClick={() => setMenuOpen(false)}>Lihat Website</a>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8 text-[#D4A373]">Admin Galeri</h2>

        {/* FORM UPLOAD */}
        <div className="bg-white/5 p-6 rounded-2xl mb-10 border border-white/10 max-w-lg">
          <h2 className="text-xl mb-4 font-semibold">Upload Foto</h2>
          <input type="text" placeholder="Nama Foto" value={nama} className="w-full p-3 bg-black/20 rounded-xl mb-3 border border-white/10 outline-none" onChange={e => setNama(e.target.value)} />
          <input type="file" accept="image/*" className="w-full p-3 bg-black/20 rounded-xl mb-4 border border-white/10" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button onClick={handleUpload} disabled={loading} className="w-full bg-[#D4A373] text-black font-bold py-3 rounded-xl hover:bg-[#c99767] transition">
            {loading ? "Memproses..." : "Upload Foto"}
          </button>
        </div>

        {/* GRID GAMBAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/10">
              {/* Tambahkan query parameter 't' agar gambar tidak cache */}
              <img 
                src={`${item.gambar_url}?t=${new Date().getTime()}`} 
                alt={item.nama} 
                className="w-full h-32 md:h-40 object-cover rounded-xl mb-3" 
              />
              <p className="font-medium mb-3 truncate text-sm">{item.nama}</p>
              <button 
                onClick={() => handleDelete(item.id, item.file_name)} 
                disabled={deletingId === item.id}
                className="w-full flex items-center justify-center gap-2 text-red-400 border border-red-400 py-2 rounded-xl hover:bg-red-400 hover:text-white transition text-sm"
              >
                {deletingId === item.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {deletingId === item.id ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu} from "lucide-react";
import {
  Coffee,
  Globe,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type MenuItem = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  gambar: string;
};

export default function DashboardPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(
    null
  );

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [harga, setHarga] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const [gambarFile, setGambarFile] =
    useState<File | null>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    setLoading(true);

    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setMenus(data);
    }

    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setNama("");
    setKategori("");
    setHarga("");
    setDeskripsi("");
    setGambarFile(null);
  }
    async function uploadImage() {
    if (!gambarFile) return "";

    const fileName =
      Date.now() + "-" + gambarFile.name;

    const { error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, gambarFile);

    if (error) {
      console.error(error);
      alert("Upload gambar gagal");
      return "";
    }

    const { data } = supabase.storage
      .from("menu-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function simpanMenu() {
    let gambarUrl = "";

    if (gambarFile) {
      gambarUrl = await uploadImage();
    }

    const { error } = await supabase
      .from("menu_items")
      .insert([
        {
          nama,
          kategori,
          harga: Number(harga),
          deskripsi,
          gambar: gambarUrl,
        },
      ]);

    if (error) {
      console.error(error);
      alert("Gagal menyimpan menu");
      return;
    }

    alert("Menu berhasil ditambahkan");

    fetchMenu();
    resetForm();
    setShowForm(false);
  }

  function editMenu(item: MenuItem) {
    setEditingId(item.id);

    setNama(item.nama);
    setKategori(item.kategori);
    setHarga(item.harga.toString());
    setDeskripsi(item.deskripsi || "");

    setShowForm(true);
  }

  async function updateMenu() {
    const { error } = await supabase
      .from("menu_items")
      .update({
        nama,
        kategori,
        harga: Number(harga),
        deskripsi,
      })
      .eq("id", editingId);

    if (error) {
      console.error(error);
      alert("Gagal update menu");
      return;
    }

    alert("Menu berhasil diupdate");

    fetchMenu();
    resetForm();
    setShowForm(false);
  }

  async function hapusMenu(id: number) {
    const konfirmasi = confirm(
      "Yakin ingin menghapus menu ini?"
    );

    if (!konfirmasi) return;

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Gagal menghapus");
      return;
    }

    fetchMenu();
  }

  return (
    <main className="min-h-screen bg-[#111111] text-white">

  {/* HEADER */}
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

    {/* Menu Desktop */}
    <nav className="hidden md:flex gap-10 font-medium">
      <a href="/admin/dashboard" className="text-[#D4A373]">Menu</a>
      <a href="/admin/gallery" className="hover:text-[#D4A373]">Gallery</a>
    </nav>

{/* Tombol Hamburger & Lihat Website */}
    <div className="flex items-center gap-4">
      <Link href="/" className="hidden md:flex px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 items-center gap-2">
        <Globe size={16} /> Website
      </Link>
      <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </div>
  </div>

  {/* Mobile Menu */}
  {menuOpen && (
    <div className="md:hidden bg-[#1a1a1a] p-6 border-b border-white/10 flex flex-col gap-4">
      <a href="/admin/dashboard" className="text-[#D4A373]">Menu</a>
      <a href="/admin/gallery">Gallery</a>
      <hr className="border-white/10" />
      <a href="/">Lihat Website</a>
    </div>
  )}
</header>

  {/* HERO */}
  <section className="max-w-7xl mx-auto px-6 pt-10">

    <div className="rounded-3xl bg-gradient-to-r from-[#1b1b1b] to-[#222] border border-white/10 p-10">

      <p className="uppercase tracking-[4px] text-[#D4A373] text-sm">
        Dashboard Admin
      </p>

      <h2 className="text-5xl font-bold mt-3">
        Kelola Menu
        <br />
        Bersandar Coffee & Space
      </h2>

      <button
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
        className="
          mt-8
          bg-[#D4A373]
          hover:bg-[#c99767]
          px-6
          py-4
          rounded-xl
          flex
          items-center
          gap-2
        "
      >
        <Plus size={20} />
        Tambah Menu
      </button>

    </div>

  </section>

  {/* STATISTIK */}
  <section className="max-w-7xl mx-auto px-6 mt-8">

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <p className="text-gray-400">
          Total Menu
        </p>

        <h3 className="text-4xl font-bold mt-2">
          {menus.length}
        </h3>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <p className="text-gray-400">
          Kategori
        </p>

        <h3 className="text-4xl font-bold mt-2">
          {
            new Set(
              menus.map(
                (item) => item.kategori
              )
            ).size
          }
        </h3>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <p className="text-gray-400">
          Gambar
        </p>

        <h3 className="text-4xl font-bold mt-2">
          {
            menus.filter(
              (item) => item.gambar
            ).length
          }
        </h3>
      </div>

    </div>

  </section>

  {/* DAFTAR MENU */}
  <section className="max-w-7xl mx-auto px-6 py-10">

    <h2 className="text-2xl font-bold mb-6">
      Daftar Menu
    </h2>

    {loading ? (

      <div className="text-center py-10">
        Memuat data...
      </div>

    ) : menus.length === 0 ? (

      <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">

        <Coffee
          size={60}
          className="mx-auto text-[#D4A373]"
        />

        <h3 className="mt-4 text-xl">
          Belum Ada Menu
        </h3>

      </div>

    ) : (

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {menus.map((item) => (

          <div
            key={item.id}
            className="
              bg-white/5
              border
              border-white/10
              rounded-3xl
              overflow-hidden
            "
          >

            {item.gambar && (

              <div className="relative h-56">

                <Image
                  src={item.gambar}
                  alt={item.nama}
                  fill
                  className="w-full h-56 object-cover"
                />

              </div>

            )}

            <div className="p-5">

              <p className="text-[#D4A373] text-sm">
                {item.kategori}
              </p>

              <h3 className="text-xl font-bold mt-2">
                {item.nama}
              </h3>

              <p className="text-gray-400 mt-2">
                {item.deskripsi}
              </p>

              <p className="mt-4 text-lg font-semibold">
                Rp{" "}
                {item.harga.toLocaleString(
                  "id-ID"
                )}
              </p>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() =>
                    editMenu(item)
                  }
                  className="
                    flex-1
                    bg-blue-600
                    py-3
                    rounded-xl
                    flex
                    justify-center
                    items-center
                    gap-2
                  "
                >
                  <Pencil size={18} />
                  Edit
                </button>

                <button
                  onClick={() =>
                    hapusMenu(item.id)
                  }
                  className="
                    flex-1
                    bg-red-600
                    py-3
                    rounded-xl
                    flex
                    justify-center
                    items-center
                    gap-2
                  "
                >
                  <Trash2 size={18} />
                  Hapus
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    )}

  </section>

        {/* MODAL TAMBAH / EDIT MENU */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">

          <div className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-3xl p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                {editingId
                  ? "Edit Menu"
                  : "Tambah Menu Baru"}
              </h2>

              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <X size={22} />
              </button>

            </div>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Nama Menu"
                value={nama}
                onChange={(e) =>
                  setNama(e.target.value)
                }
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-black/20
                  border
                  border-white/10
                  outline-none
                "
              />

              <input
                type="text"
                placeholder="Kategori"
                value={kategori}
                onChange={(e) =>
                  setKategori(e.target.value)
                }
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-black/20
                  border
                  border-white/10
                  outline-none
                "
              />

              <input
                type="number"
                placeholder="Harga"
                value={harga}
                onChange={(e) =>
                  setHarga(e.target.value)
                }
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-black/20
                  border
                  border-white/10
                  outline-none
                "
              />

              <textarea
                rows={4}
                placeholder="Deskripsi"
                value={deskripsi}
                onChange={(e) =>
                  setDeskripsi(e.target.value)
                }
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-black/20
                  border
                  border-white/10
                  outline-none
                "
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setGambarFile(
                    e.target.files?.[0] || null
                  )
                }
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-black/20
                  border
                  border-white/10
                "
              />

              <button
                onClick={
                  editingId
                    ? updateMenu
                    : simpanMenu
                }
                className="
                  w-full
                  bg-[#D4A373]
                  hover:bg-[#c99767]
                  py-4
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                {editingId
                  ? "Update Menu"
                  : "Simpan Menu"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}
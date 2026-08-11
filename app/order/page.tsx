"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

type MenuItem = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  gambar: string;
};

type CartItem = MenuItem & {
  quantity: number;
};

export default function OrderPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  
  // State untuk Keranjang & Data Pelanggan
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("kategori");

    if (!error && data) {
      setMenus(data);
    }
    setLoading(false);
  }

  // Fungsi Tambah ke Keranjang
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // Fungsi Kurang / Hapus dari Keranjang
  const decreaseQuantity = (id: number) => {
    setCart((prev) => {
      return prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
    });
  };

  const groupedMenus = menus.reduce((groups: Record<string, MenuItem[]>, menu) => {
    const category = menu.kategori;
    if (!groups[category]) groups[category] = [];
    groups[category].push(menu);
    return groups;
  }, {});

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.harga * item.quantity, 0);

  // Kirim Pesanan ke Backend / Database
  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert("Mohon masukkan nama pemesan terlebih dahulu!");
      return;
    }
    if (cart.length === 0) {
      alert("Keranjang masih kosong, pilih menu dulu ya!");
      return;
    }

    setIsSubmitting(true);
    const orderData = {
      customer_name: customerName,
      table_number: parseInt(tableNumber),
      items: cart,
      total_price: totalPrice,
      status: "pending",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        alert("Pesanan berhasil dikirim ke kasir! Mohon tunggu sebentar.");
        setCart([]);
        setCustomerName("");
      } else {
        alert("Gagal mengirim pesanan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#111111] text-white pb-32">
      {/* HEADER RINGKAS */}
      <header className="border-b border-white/10 py-4 px-6 flex justify-between items-center bg-[#111111]/90 sticky top-0 z-40 backdrop-blur-md">
        <Link href="/menu" className="text-sm text-gray-400 hover:text-[#D4A373] transition">
          ← Kembali ke Lihat Menu
        </Link>
        <h1 className="font-serif text-lg font-bold text-[#D4A373]">Self-Order VBkopi</h1>
        <div className="w-20" /> {/* Spacer */}
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI & TENGAH: KATALOG MENU PEMESANAN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-3">Informasi Meja</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Pemesan</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#D4A373] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nomor Meja</label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#D4A373] outline-none"
                  min={1}
                />
              </div>
            </div>
          </div>

          {/* Filter Kategori */}
          <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-3 py-2">
            {["Semua", ...Object.keys(groupedMenus)].map((kat) => (
              <button
                key={kat}
                onClick={() => setKategoriAktif(kat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap border ${
                  kategoriAktif === kat
                    ? "bg-[#D4A373] text-black border-[#D4A373]"
                    : "bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-white/20"
                }`}
              >
                {kat}
              </button>
            ))}
          </div>

          {/* Daftar Produk untuk Dipilih */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">Memuat Menu...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(groupedMenus)
                .filter(([kategori]) => kategoriAktif === "Semua" || kategori === kategoriAktif)
                .map(([kategori, items]) => (
                  <div key={kategori} className="col-span-full">
                    <h3 className="text-2xl font-serif font-bold text-[#D4A373] mb-4 mt-2">{kategori}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex gap-4 items-center justify-between shadow-md"
                        >
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-base">{item.nama}</h4>
                            <p className="text-[#D4A373] font-semibold text-sm mt-1">
                              Rp {item.harga.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-[#D4A373] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#c39264] transition"
                          >
                            + Piliha
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* KOLOM KANAN: RINGKASAN KERANJANG & CHECKOUT */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 sticky top-24 shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-4 text-[#D4A373]">Keranjang Pesanan</h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">Belum ada menu yang dipilih.</p>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-white/10 max-h-[40vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold">{item.nama}</p>
                        <p className="text-xs text-gray-400">Rp {item.harga.toLocaleString()} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseQuantity(item.id)}
                          className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center font-bold hover:bg-white/20"
                        >
                          -
                        </button>
                        <span className="w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 bg-[#D4A373] text-black rounded-lg flex items-center justify-center font-bold hover:bg-[#c39264]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Total Item:</span>
                    <span>{totalItems} Porsi</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-white">
                    <span>Total Bayar:</span>
                    <span className="text-[#D4A373]">Rp {totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-[#D4A373] text-black font-bold py-4 rounded-xl hover:bg-[#c39264] transition disabled:opacity-50 mt-4 shadow-lg"
                >
                  {isSubmitting ? "Mengirim Pesanan..." : "Pesan Sekarang & Bayar"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
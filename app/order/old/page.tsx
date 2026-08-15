"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, X, CheckCircle2 } from "lucide-react";

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
  const [paymentMethod, setPaymentMethod] = useState("kasir"); // 'kasir' atau 'mandiri'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // State baru untuk menampilkan modal sukses & QRIS mandiri
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    const { data, error } = await supabase
      .from("menu_self_order")
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
      payment_method: paymentMethod,
      status: "panding",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const result = await res.json();
        
        // Simpan data untuk ditampilkan di modal sukses/QRIS
        setOrderSuccessData({
          customerName,
          tableNumber,
          totalPrice,
          paymentMethod,
          items: [...cart],
        });

        setCart([]);
        setCustomerName("");
        setIsMobileCartOpen(false);
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
      <header className="border-b border-white/10 bg-[#111111]/90 sticky top-0 z-50 grid grid-cols-3 items-center py-4 px-6 backdrop-blur-md">
        <Link href="/menu" className="text-sm text-gray-400 hover:text-[#D4A373] transition">
          ← Kembali
        </Link>
        <h1 className="font-serif text-lg font-bold text-[#D4A373] text-center">
          Self-Order
        </h1>
        <Link href="/" className="relative ml-auto w-20 h-12 md:w-28 md:h-16 transition-transform hover:scale-105">
          <Image 
            src="/logo-bersandar1.png"
            alt="Logo Bersandar"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI & TENGAH: INFORMASI MEJA & KATALOG MENU */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 shadow-lg">
            <h2 className="text-xl font-bold mb-3 text-[#D4A373]">Informasi Meja</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nama Pemesan</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#D4A373] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nomor Meja</label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#D4A373] outline-none transition"
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
            <div className="space-y-8">
              {Object.entries(groupedMenus)
                .filter(([kategori]) => kategoriAktif === "Semua" || kategori === kategoriAktif)
                .map(([kategori, items]) => (
                  <div key={kategori}>
                    <h3 className="text-2xl font-serif font-bold text-[#D4A373] mb-4">{kategori}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex gap-4 items-center justify-between shadow-md hover:border-white/20 transition"
                        >
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black/50">
                            <img src={item.gambar} alt={item.nama} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-base truncate">{item.nama}</h4>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.deskripsi}</p>
                            <p className="text-[#D4A373] font-semibold text-sm mt-1">
                              Rp {item.harga.toLocaleString()}
                            </p>
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-[#D4A373] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#c39264] transition flex-shrink-0"
                          >
                            + Pilih
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* KOLOM KANAN: RINGKASAN KERANJANG (DESKTOP) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 sticky top-24 shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-4 text-[#D4A373]">Keranjang Pesanan</h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">Belum ada menu yang dipilih.</p>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-white/10 max-h-[35vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                      <div className="pr-2">
                        <p className="font-semibold">{item.nama}</p>
                        <p className="text-xs text-gray-400">Rp {item.harga.toLocaleString()} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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

                {/* Pilihan Metode Pembayaran */}
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <label className="block text-xs text-gray-400">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("kasir")}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        paymentMethod === "kasir"
                          ? "bg-[#D4A373] text-black border-[#D4A373]"
                          : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20"
                      }`}
                    >
                      Bayar di Kasir
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mandiri")}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        paymentMethod === "mandiri"
                          ? "bg-[#D4A373] text-black border-[#D4A373]"
                          : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20"
                      }`}
                    >
                      Mandiri (QRIS/Transfer)
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 space-y-1">
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
                  className="w-full bg-[#D4A373] text-black font-bold py-4 rounded-xl hover:bg-[#c39264] transition disabled:opacity-50 mt-2 shadow-lg"
                >
                  {isSubmitting ? "Mengirim Pesanan..." : "Pesan Sekarang"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FLOATING CART BAR (KHUSUS MOBILE) */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 border-t border-white/10 p-4 lg:hidden backdrop-blur-md z-40 flex items-center justify-between shadow-2xl">
          <div>
            <p className="text-xs text-gray-400">{totalItems} Item dipilih</p>
            <p className="font-bold text-[#D4A373] text-lg">Rp {totalPrice.toLocaleString()}</p>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="bg-[#D4A373] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm shadow-lg"
          >
            <ShoppingBag size={18} /> Lihat Keranjang
          </button>
        </div>
      )}

      {/* MODAL KERANJANG MOBILE */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end lg:hidden backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h3 className="text-xl font-serif font-bold text-[#D4A373]">Keranjang Pesanan</h3>
              <button 
                onClick={() => setIsMobileCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X size={18} />
              </button>
            </div>

            <div className="divide-y divide-white/10 overflow-y-auto flex-1 pr-1 space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                  <div className="pr-2">
                    <p className="font-semibold">{item.nama}</p>
                    <p className="text-xs text-gray-400">Rp {item.harga.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 bg-[#D4A373] text-black rounded-lg flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pilihan Metode Pembayaran Mobile */}
            <div className="border-t border-white/10 pt-4 space-y-2 mb-4">
              <label className="block text-xs text-gray-400">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("kasir")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    paymentMethod === "kasir"
                      ? "bg-[#D4A373] text-black border-[#D4A373]"
                      : "bg-black/40 text-gray-400 border-white/10"
                  }`}
                >
                  Bayar di Kasir
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mandiri")}
                  className={`py-2 text-xs font-semibold rounded-xl border transition ${
                    paymentMethod === "mandiri"
                      ? "bg-[#D4A373] text-black border-[#D4A373]"
                      : "bg-black/40 text-gray-400 border-white/10"
                  }`}
                >
                  Mandiri (QRIS/Transfer)
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 space-y-1 mb-4">
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
              className="w-full bg-[#D4A373] text-black font-bold py-4 rounded-xl hover:bg-[#c39264] transition disabled:opacity-50 shadow-lg"
            >
              {isSubmitting ? "Mengirim Pesanan..." : "Pesan Sekarang"}
            </button>
          </div>
        </div>
      )}

      {/* --- MODAL / POPUP SETELAH BERHASIL PESAN (QRIS / KASIR) --- */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl relative">
            
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-2xl font-serif font-bold text-white mb-1">Pesanan Berhasil!</h2>
            <p className="text-sm text-gray-400 mb-6">
              Terima kasih, <span className="text-[#D4A373] font-semibold">{orderSuccessData.customerName}</span>. Pesanan untuk Meja #{orderSuccessData.tableNumber} telah dikirim ke dapur.
            </p>

            {/* JIKA MEMILIH PEMBAYARAN MANDIRI (QRIS) */}
            {orderSuccessData.paymentMethod === "mandiri" ? (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-6">
                <p className="text-xs text-gray-300 font-semibold mb-2">Scan QRIS di bawah untuk membayar:</p>
                
                {/* Tampilkan Gambar QRIS */}
                <div className="relative w-48 h-48 mx-auto bg-white rounded-xl p-2 mb-3 shadow-inner">
                  <Image 
                    src="/qris-payment.png" 
                    alt="QRIS Pembayaran" 
                    fill 
                    className="object-contain p-2" 
                  />
                </div>

                <p className="text-xs text-[#D4A373] font-bold">
                  Total Tagihan: Rp {orderSuccessData.totalPrice.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Mohon tunjukkan bukti transfer/scan kepada kasir jika diperlukan.
                </p>
              </div>
            ) : (
              /* JIKA MEMILIH BAYAR DI KASIR */
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-6 text-sm text-gray-300">
                <p>Silakan lakukan pembayaran langsung di <span className="text-[#D4A373] font-bold">Kasir</span> dengan menyebutkan nama Anda.</p>
              </div>
            )}

            <button
              onClick={() => setOrderSuccessData(null)}
              className="w-full bg-[#D4A373] text-black font-bold py-3 rounded-xl hover:bg-[#c39264] transition shadow-lg"
            >
              Tutup & Buat Pesanan Baru
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
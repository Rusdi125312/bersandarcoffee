"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Flame, Snowflake, X, Printer } from "lucide-react";

type MenuItem = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  tersedia: boolean;
  gambar: string | null;
  variant_type: string;
};

type CartItem = {
  id: number;
  nama: string;
  harga: number;
  quantity: number;
  variant: string;
};

export default function ManualCashierPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  
  // State Transaksi
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("1");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [cashPaid, setCashPaid] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  // State Modal Pilih Varian (Ice / Hot)
  const [selectedMenuForVariant, setSelectedMenuForVariant] = useState<MenuItem | null>(null);

  // URL Web App Google Apps Script Anda
  const GOOGLE_SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxdJC7V92Yx3XY1jgnvmR8RWwxoR0QfFTcLtga1jONqUbJWzll4gmOLjxGFf5qwB1k4/exec";

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    setLoadingMenu(true);
    const { data, error } = await supabase
      .from("menu_self_order")
      .select("*")
      .eq("tersedia", true)
      .order("nama", { ascending: true });

    if (error) {
      console.error("Gagal mengambil menu:", error.message);
    } else {
      setMenuItems(data || []);
    }
    setLoadingMenu(false);
  }

  const handleMenuClick = (item: MenuItem) => {
    if (item.variant_type && item.variant_type.toLowerCase() === "ice & hot") {
      setSelectedMenuForVariant(item);
    } else {
      addItemToCart(item, "-");
    }
  };

  const addItemToCart = (item: MenuItem, variant: string) => {
    const existingIndex = cart.findIndex(
      (c) => c.id === item.id && c.variant === variant
    );

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          id: item.id,
          nama: item.nama,
          harga: item.harga,
          quantity: 1,
          variant: variant,
        },
      ]);
    }
    setSelectedMenuForVariant(null);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  const changeAmount = Number(cashPaid) - totalPrice;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Proses Simpan Transaksi ke Supabase & Google Sheets
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }
    if (!customerName.trim()) {
      alert("Harap masukkan nama pelanggan!");
      return;
    }

    if (paymentMethod === "cash" && Number(cashPaid) < totalPrice) {
      alert("Jumlah uang tunai kurang dari total belanja!");
      return;
    }

    setIsSubmitting(true);

    const transactionData = {
      customer_name: customerName,
      table_number: parseInt(tableNumber) || 1,
      items: cart,
      total_price: totalPrice,
      payment_method: paymentMethod,
      payment_proof: null,
      status: "selesai",
    };

    // 1. Simpan ke Supabase
    const { error } = await supabase.from("transactions").insert([transactionData]);

    if (error) {
      setIsSubmitting(false);
      alert(`Gagal menyimpan transaksi: ${error.message}`);
      return;
    }

    // 2. Kirim data ke Google Sheets via Apps Script Web App
    try {
      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors", // Diperlukan untuk Apps Script Web App sederhana
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });
    } catch (sheetErr) {
      console.error("Gagal sinkronisasi:", sheetErr);
    }

    setIsSubmitting(false);
    setLastTransaction({ ...transactionData, date: new Date().toLocaleString() });
    setSuccessModal(true);
  };

  // Fungsi Cetak Struk (Menggunakan window.print() dengan elemen khusus cetak)
  const handlePrintReceipt = () => {
    window.print();
  };

  const resetForm = () => {
    setCart([]);
    setCustomerName("");
    setCashPaid("");
    setSuccessModal(false);
    setLastTransaction(null);
  };

  return (
    <main className="min-h-screen bg-[#111111] text-white pb-20">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#111111]/90 sticky top-0 z-50 grid grid-cols-3 items-center py-4 px-6 backdrop-blur-md print:hidden">
        <Link href="/admin/kasir" className="text-sm text-gray-400 hover:text-[#D4A373] transition">
          ← Dashboard Kasir
        </Link>
        <h1 className="font-serif text-lg font-bold text-[#D4A373] text-center">
          Input Transaksi Kasir
        </h1>
        <div className="relative ml-auto w-20 h-12 md:w-28 md:h-16">
          <Image
            src="/logo-bersandar1.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        {/* Kolom Kiri: Daftar Menu */}
        <div className="lg:col-span-7 space-y-4 print:hidden">
          <h2 className="text-base font-semibold text-gray-200">Pilih Menu Produk</h2>
          
          {loadingMenu ? (
            <div className="text-center py-12 text-gray-500">Memuat menu...</div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-12 bg-[#1a1a1a] border border-white/10 rounded-3xl text-gray-500">
              Belum ada menu tersedia.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className="bg-[#1a1a1a] border border-white/10 hover:border-[#D4A373] p-4 rounded-2xl text-left flex flex-col justify-between transition group space-y-2 relative"
                >
                  {item.variant_type && item.variant_type.toLowerCase() === "ice & hot" && (
                    <span className="absolute top-3 right-3 text-[9px] bg-[#D4A373]/20 text-[#D4A373] px-2 py-0.5 rounded-full font-semibold border border-[#D4A373]/30">
                      Ice/Hot
                    </span>
                  )}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#D4A373] tracking-wider">
                      {item.kategori}
                    </span>
                    <h3 className="font-semibold text-white text-sm group-hover:text-[#D4A373] transition line-clamp-2 mt-0.5">
                      {item.nama}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center w-full pt-2 border-t border-white/5">
                    <span className="text-xs font-bold text-gray-300">
                      {formatPrice(item.harga)}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#D4A373] group-hover:text-black transition">
                      <Plus size={14} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan: Keranjang & Form Pembayaran */}
        <div className="lg:col-span-5 bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xl h-fit sticky top-24 print:hidden">
          <div>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <ShoppingCart className="text-[#D4A373]" size={20} />
              <h2 className="font-serif font-bold text-lg text-white">Keranjang Pesanan</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nama pembeli..."
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A373]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">No. Meja</label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A373]"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-white/5">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500">
                  Keranjang masih kosong. Pilih menu di samping.
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="pt-3 flex items-center justify-between text-xs">
                    <div className="pr-2">
                      <p className="font-medium text-gray-200">
                        {item.nama}{" "}
                        {item.variant !== "-" && (
                          <span className="text-[#D4A373] font-semibold">({item.variant})</span>
                        )}
                      </p>
                      <p className="text-gray-400">{formatPrice(item.harga)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-red-400 hover:text-red-300 ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between font-bold text-base text-white">
              <span>Total Pembayaran:</span>
              <span className="text-[#D4A373]">{formatPrice(totalPrice)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  paymentMethod === "cash"
                    ? "bg-[#D4A373] text-black border-[#D4A373]"
                    : "bg-[#111111] text-gray-400 border-white/10"
                }`}
              >
                Tunai (Cash)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  paymentMethod === "transfer"
                    ? "bg-[#D4A373] text-black border-[#D4A373]"
                    : "bg-[#111111] text-gray-400 border-white/10"
                }`}
              >
                Transfer / QRIS
              </button>
            </div>

            {paymentMethod === "cash" && (
              <div className="space-y-1">
                <label className="block text-xs text-gray-400">Uang Tunai Diterima</label>
                <input
                  type="number"
                  value={cashPaid}
                  onChange={(e) => setCashPaid(e.target.value)}
                  placeholder="Masukkan jumlah uang..."
                  className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4A373]"
                />
                {Number(cashPaid) >= totalPrice && totalPrice > 0 && (
                  <p className="text-xs text-green-400 pt-1 font-medium">
                    Uang Kembalian: {formatPrice(changeAmount)}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isSubmitting || cart.length === 0}
              className="w-full bg-[#D4A373] hover:bg-[#c39264] text-black font-bold py-3 rounded-xl text-xs transition disabled:opacity-50"
            >
              {isSubmitting ? "Memproses..." : "Selesaikan Transaksi"}
            </button>
          </div>
        </div>
      </div>

      {/* Area Struk Khusus Cetak (Hidden di layar biasa, muncul saat window.print()) */}
      {lastTransaction && (
        <div className="hidden print:block text-black bg-white p-6 max-w-xs mx-auto font-mono text-xs space-y-3">
          <div className="text-center space-y-1 border-b border-black pb-3">
            <h2 className="font-bold text-sm">Bersandar Coffee and Space</h2>
            <p>Struk Pembayaran Kasir</p>
            <p className="text-[10px]">{lastTransaction.date}</p>
          </div>
          <div className="space-y-1 border-b border-black pb-3">
            <p>Pelanggan: {lastTransaction.customer_name}</p>
            <p>No. Meja: {lastTransaction.table_number}</p>
            <p>Kasir</p>
          </div>
          <div className="space-y-2 border-b border-black pb-3">
            {lastTransaction.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <div>
                  <p>{item.quantity}x {item.nama} {item.variant !== "-" ? `(${item.variant})` : ""}</p>
                </div>
                <p>{formatPrice(item.harga * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{formatPrice(lastTransaction.total_price)}</span>
            </div>
            <div className="flex justify-between uppercase">
              <span>Metode:</span>
              <span>{lastTransaction.payment_method}</span>
            </div>
          </div>
          <div className="text-center pt-4 border-t border-dashed border-black text-[10px]">
            <p>Terima Kasih Atas Kunjungan Anda!</p>
          </div>
        </div>
      )}

      {/* Modal Pilihan Varian (Ice / Hot) */}
      {selectedMenuForVariant && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedMenuForVariant(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <div>
              <span className="text-[10px] text-[#D4A373] uppercase font-bold tracking-wider">Pilih Varian</span>
              <h3 className="text-lg font-serif font-bold text-white mt-1">
                {selectedMenuForVariant.nama}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Silakan pilih suhu penyajian:</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => addItemToCart(selectedMenuForVariant, "Ice")}
                className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition group"
              >
                <Snowflake size={24} className="group-hover:scale-110 transition" />
                <span className="font-bold text-sm">ICE (Dingin)</span>
              </button>

              <button
                onClick={() => addItemToCart(selectedMenuForVariant, "Hot")}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition group"
              >
                <Flame size={24} className="group-hover:scale-110 transition" />
                <span className="font-bold text-sm">HOT (Panas)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses & Aksi Cetak Struk */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md print:hidden">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Transaksi Berhasil!</h3>
            <p className="text-xs text-gray-400">
              Data tersimpan
            </p>
            
            <div className="space-y-2 pt-2">
              <button
                onClick={handlePrintReceipt}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Printer size={16} /> Cetak Struk
              </button>
              <button
                onClick={resetForm}
                className="w-full bg-[#D4A373] text-black font-bold py-2.5 rounded-xl text-xs hover:bg-[#c39264] transition"
              >
                Input Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
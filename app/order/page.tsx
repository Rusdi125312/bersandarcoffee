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
  variant_type?: string;
};

type CartItem = MenuItem & {
  quantity: number;
  variant: "Ice" | "Hot" | "-";
};

export default function OrderPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("kasir");
  
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [paymentStep, setPaymentStep] = useState<"cart" | "instruction">("cart");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<any>(null);

  const [itemToVariant, setItemToVariant] = useState<MenuItem | null>(null);
  
  const [selectedVariant, setSelectedVariant] = useState<"Ice" | "Hot">("Ice");

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


  const formatPrice = (price: number) => {
    if (price >= 1000 && price % 1000 === 0) {
      return `${price / 1000}k`;
    }
    return `${(price / 1000).toFixed(1)}k`;
  };

  // Handler saat tombol "+ Pilih" diklik
  const handleOpenVariantModal = (item: MenuItem) => {
    const hasIceHotVariant = item.variant_type && item.variant_type !== "-";
    
    if (hasIceHotVariant) {
      setItemToVariant(item);
      setSelectedVariant("Ice"); // Default pilihan pertama
    } else {
      addToCartDirect(item, "-");
    }
  };

  const addToCartDirect = (item: MenuItem, variant: "Ice" | "Hot" | "-") => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id && i.variant === variant
      );

      if (existingIndex > -1) {
        return prev.map((i, index) =>
          index === existingIndex ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1, variant }];
    });
    setItemToVariant(null);
  };

  const updateCartQuantity = (id: number, variant: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.id === id && i.variant === variant) {
            return { ...i, quantity: i.quantity + delta };
          }
          return i;
        })
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

    try {
      const orderData = {
        customer_name: customerName,
        table_number: parseInt(tableNumber),
        items: cart,
        total_price: totalPrice,
        payment_method: paymentMethod,
        payment_proof: null,
        status: "pending",
      };

      const { data, error } = await supabase
        .from("menu_order")
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error("Supabase Insert Error:", error);
        alert(`Gagal mengirim pesanan: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      if (data) {
        setCurrentOrderId(data.id);
        setPaymentStep("instruction");
        setIsMobileCartOpen(false);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadProof = async () => {
    if (!paymentProof) {
      alert("Silakan pilih file bukti transfer terlebih dahulu.");
      return;
    }

    setIsUploadingProof(true);
    try {
      const fileExt = paymentProof.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("payment_proof")
        .upload(fileName, paymentProof);

      if (uploadError) {
        console.error("Supabase Storage Error:", uploadError);
        alert(`Gagal mengunggah bukti: ${uploadError.message}`);
        setIsUploadingProof(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("payment_proof")
        .getPublicUrl(fileName);

      const proofUrl = publicUrlData.publicUrl;

      if (currentOrderId) {
        await supabase
          .from("menu_order")
          .update({ payment_proof: proofUrl })
          .eq("id", currentOrderId);
      }

      finalizeOrderSuccess();
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengunggah bukti pembayaran.");
    } finally {
      setIsUploadingProof(false);
    }
  };

  const finalizeOrderSuccess = () => {
    setOrderSuccessData({
      customerName,
      tableNumber,
      totalPrice,
      paymentMethod,
      items: [...cart],
    });

    setCart([]);
    setCustomerName("");
    setPaymentProof(null);
    setPaymentStep("cart");
    setCurrentOrderId(null);
  };

  return (
    <main className="min-h-screen bg-[#111111] text-white pb-32">
      <header className="border-b border-white/10 bg-[#111111]/90 sticky top-0 z-50 grid grid-cols-3 items-center py-4 px-6 backdrop-blur-md">
        <Link href="/menu" className="text-sm text-gray-400 hover:text-[#D4A373] transition">
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
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

          {loading ? (
            <div className="text-center py-20 text-gray-400">Memuat Menu...</div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedMenus)
                .filter(([kategori]) => kategoriAktif === "Semua" || kategori === kategoriAktif)
                .map(([kategori, items]) => {
                  return (
                    <div key={kategori}>
                      <h3 className="text-2xl font-serif font-bold text-[#D4A373] mb-4">{kategori}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {items.map((item) => {
                          return (
                            <div
                              key={item.id}
                              className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-white/20 transition"
                            >
                              <div className="flex gap-4 items-center">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black/50">
                                  <img
                                    src={item.gambar || "/placeholder.png"}
                                    alt={item.nama}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-base truncate">{item.nama}</h4>
                                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.deskripsi}</p>
                                  <p className="text-[#D4A373] font-semibold text-sm mt-1">
                                    {formatPrice(item.harga)}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleOpenVariantModal(item)}
                                className="w-full mt-4 bg-[#D4A373] text-black font-bold py-2 rounded-xl text-sm hover:bg-[#c39264] transition"
                              >
                                + Pilih
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Desktop Cart */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 sticky top-24 shadow-xl space-y-4">
            <h3 className="text-xl font-serif font-bold text-[#D4A373]">Keranjang Pesanan</h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">Belum ada menu yang dipilih.</p>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-white/10 max-h-[35vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.variant}`} className="py-3 flex justify-between items-center text-sm">
                      <div className="pr-2 flex-1">
                        <p className="font-semibold">
                          {item.nama} {item.variant !== "-" && <span className="text-xs text-[#D4A373] font-normal">({item.variant})</span>}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.harga)} x {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.variant, -1)}
                          className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center font-bold hover:bg-white/20"
                        >
                          -
                        </button>
                        <span className="w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.variant, 1)}
                          className="w-7 h-7 bg-[#D4A373] text-black rounded-lg flex items-center justify-center font-bold hover:bg-[#c39264]"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-3">
                  <label className="block text-xs text-gray-400 mb-1">Metode Pembayaran</label>
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
                      onClick={() => setPaymentMethod("transfer")}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        paymentMethod === "transfer"
                          ? "bg-[#D4A373] text-black border-[#D4A373]"
                          : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20"
                      }`}
                    >
                      Transfer / QRIS
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
                    <span className="text-[#D4A373]">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full bg-[#D4A373] text-black font-bold py-3.5 rounded-xl hover:bg-[#c39264] transition disabled:opacity-50 shadow-lg text-sm"
                >
                  {isSubmitting ? "Mengirim Pesanan..." : "Pesan & Bayar Sekarang"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Sticky Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 border-t border-white/10 p-4 lg:hidden backdrop-blur-md z-40 flex items-center justify-between shadow-2xl">
          <div>
            <p className="text-xs text-gray-400">{totalItems} Item dipilih</p>
            <p className="font-bold text-[#D4A373] text-lg">{formatPrice(totalPrice)}</p>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="bg-[#D4A373] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm shadow-lg"
          >
            <ShoppingBag size={18} /> Lihat Keranjang
          </button>
        </div>
      )}

      {/* Mobile Cart Modal */}
      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col justify-end lg:hidden backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border-t border-white/10 rounded-t-3xl p-6 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h3 className="text-xl font-serif font-bold text-[#D4A373]">Keranjang Pesanan</h3>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="divide-y divide-white/10 overflow-y-auto flex-1 pr-1 space-y-2 mb-4">
              {cart.map((item) => (
                <div key={`${item.id}-${item.variant}`} className="py-3 flex justify-between items-center text-sm">
                  <div className="pr-2 flex-1">
                    <p className="font-semibold">
                      {item.nama} {item.variant !== "-" && <span className="text-xs text-[#D4A373] font-normal">({item.variant})</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatPrice(item.harga)} x {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.variant, -1)}
                      className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.variant, 1)}
                      className="w-7 h-7 bg-[#D4A373] text-black rounded-lg flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3 space-y-2 mb-3">
              <label className="block text-xs text-gray-400">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("kasir")}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    paymentMethod === "kasir" ? "bg-[#D4A373] text-black border-[#D4A373]" : "bg-black/40 text-gray-400 border-white/10"
                  }`}
                >
                  Bayar di Kasir
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("transfer")}
                  className={`py-2 text-xs font-semibold rounded-xl border ${
                    paymentMethod === "transfer" ? "bg-[#D4A373] text-black border-[#D4A373]" : "bg-black/40 text-gray-400 border-white/10"
                  }`}
                >
                  Transfer / QRIS
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2 space-y-1 mb-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Total Item:</span>
                <span>{totalItems} Porsi</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-white">
                <span>Total Bayar:</span>
                <span className="text-[#D4A373]">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full bg-[#D4A373] text-black font-bold py-3.5 rounded-xl hover:bg-[#c39264] transition disabled:opacity-50 shadow-lg text-sm"
            >
              {isSubmitting ? "Mengirim Pesanan..." : "Pesan & Bayar Sekarang"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Pilih Varian (Hanya Ice / Hot) */}
      {itemToVariant && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative">
            <h3 className="text-xl font-serif font-bold text-[#D4A373] mb-1">Pilih Varian</h3>
            <p className="text-sm text-gray-400 mb-4">{itemToVariant.nama}</p>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {(["Ice", "Hot"] as const).map((variant) => (
                <button
                  key={variant}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  className={`py-3 text-xs font-bold rounded-xl border transition ${
                    selectedVariant === variant
                      ? "bg-[#D4A373] text-black border-[#D4A373]"
                      : "bg-black/40 text-gray-400 border-white/10 hover:border-white/20"
                  }`}
                >
                  {variant}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setItemToVariant(null)}
                className="flex-1 bg-white/10 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-white/20 transition"
              >
                Batal
              </button>
              <button
                onClick={() => addToCartDirect(itemToVariant, selectedVariant)}
                className="flex-1 bg-[#D4A373] text-black font-bold py-2.5 rounded-xl text-sm hover:bg-[#c39264] transition"
              >
                Masukkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Instruction Modal */}
      {paymentStep === "instruction" && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-left">
            <h3 className="text-xl font-serif font-bold text-[#D4A373] mb-2">Instruksi Pembayaran</h3>
            
            {paymentMethod === "transfer" ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  Silakan lakukan pembayaran sejumlah <strong className="text-[#D4A373]">{formatPrice(totalPrice)}</strong> melalui Transfer / QRIS ke rekening berikut:
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-xs text-gray-300 space-y-1">
                  <p>Bank Mandiri: <strong>1234-5678-9012</strong></p>
                  <p>Atas Nama: <strong>Kafe Bersandar</strong></p>
                  <div className="mt-3 flex justify-center">
                    <img
                      src="/path-ke-gambar-qris-anda.jpg"
                      alt="QRIS Pembayaran"
                      className="w-32 h-32 rounded-lg border border-white/20 object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-gray-300 font-semibold">Upload Bukti Transfer Anda:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#D4A373] file:text-black hover:file:bg-[#c39264] cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleUploadProof}
                  disabled={isUploadingProof}
                  className="w-full mt-2 bg-[#D4A373] text-black font-bold py-3 rounded-xl hover:bg-[#c39264] transition shadow-lg text-sm disabled:opacity-50"
                >
                  {isUploadingProof ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-300 text-sm leading-relaxed">
                  Silakan segera mendatangi kasir untuk menyelesaikan pembayaran pesanan Meja <strong>#{tableNumber}</strong> atas nama <strong className="text-white">{customerName}</strong> senilai <span className="font-bold">{formatPrice(totalPrice)}</span>.
                </div>

                <button
                  onClick={finalizeOrderSuccess}
                  className="w-full bg-[#D4A373] text-black font-bold py-3 rounded-xl hover:bg-[#c39264] transition shadow-lg text-sm">
                  Selesai & Tunggu Pesanan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderSuccessData && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl relative">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-2xl font-serif font-bold text-white mb-1">Pesanan Berhasil!</h2>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Terima kasih, <span className="text-[#D4A373] font-semibold">{orderSuccessData.customerName}</span>. Pesanan untuk Meja <strong className="text-white">#{orderSuccessData.tableNumber}</strong> telah dikirim ke dapur. Mohon menunggu, pesanan Anda akan segera diantarkan ke meja Anda.
            </p>

            <button
              onClick={() => setOrderSuccessData(null)}
              className="w-full bg-[#D4A373] text-black font-bold py-3 rounded-xl hover:bg-[#c39264] transition shadow-lg text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
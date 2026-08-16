"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Printer, 
  Eye, 
  Clock, 
  ShoppingBag, 
  DollarSign, 
  Banknote,
  X,
  Globe,
  Menu,
  CheckCheck,
  ArrowRight
} from "lucide-react";

type OrderItem = {
  id: number;
  nama: string;
  harga: number;
  quantity: number;
  variant?: "Hot" | "Ice";
};

type Order = {
  id: number;
  customer_name: string;
  table_number: number;
  items: OrderItem[];
  total_price: number;
  payment_method: string;
  payment_proof?: string | null;
  status: "pending" | "proses" | "selesai" | "batal";
  created_at?: string;
};

export default function DashboardKasirPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [menuOpen, setMenuOpen] = useState(false);

  // State Modal Bukti Transfer
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // State Modal Pembayaran Tunai & Kembalian (Lebih Keren)
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [activeCashOrder, setActiveCashOrder] = useState<Order | null>(null);
  const [cashGiven, setCashGiven] = useState<string>("");

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel("menu_order_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_order" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_order")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  }

  // Fungsi Kirim Data ke Google Sheets (Google Apps Script Web App URL)
  const sendToGoogleSheets = async (order: Order) => {
    try {
      // Ganti URL di bawah ini dengan Web App URL dari Google Apps Script Anda
      const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby3bA4apWpyBtmGRmmnM1UKqKhTiy47cnpoH6Rg12x0ZWfmg_mMz5G0zBuEb43C8Jd6UQ/exec"; 
      if (WEB_APP_URL.includes("ANDA_DI_SINI")) return;

      const payload = {
        id: order.id,
        customer_name: order.customer_name,
        table_number: order.table_number,
        total_price: order.total_price,
        payment_method: order.payment_method,
        items: order.items.map(i => `${i.nama} (${i.variant || '-'}) x${i.quantity}`).join(", "),
        created_at: order.created_at || new Date().toISOString()
      };

      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("Gagal sinkron ke Google Sheets:", err);
    }
  };

  // Update Status Pesanan
  const updateOrderStatus = async (id: number, newStatus: "pending" | "proses" | "selesai" | "batal") => {
    // Cari data order saat ini
    const currentOrder = orders.find(o => o.id === id);
    if (currentOrder && currentOrder.status === "selesai") {
      alert("Pesanan yang sudah selesai tidak dapat diubah kembali!");
      return;
    }

    const { error } = await supabase
      .from("menu_order")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert(`Gagal memperbarui status: ${error.message}`);
    } else {
      // Jika status diubah menjadi selesai, kirim ke Google Sheets
      if (newStatus === "selesai" && currentOrder) {
        sendToGoogleSheets(currentOrder);
      }
      fetchOrders();
    }
  };

  // Hapus Pesanan
  const deleteOrder = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesanan ini secara permanen?")) return;

    const { error } = await supabase
      .from("menu_order")
      .delete()
      .eq("id", id);

    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
    } else {
      fetchOrders();
    }
  };

  const formatPrice = (price: number) => {
    return `Rp ${price.toLocaleString("id-ID")}`;
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "semua") return true;
    return order.status === filterStatus;
  });

  const cashNumber = parseInt(cashGiven) || 0;
  const changeAmount = activeCashOrder ? cashNumber - activeCashOrder.total_price : 0;

  const handleProcessCashSubmit = async () => {
    if (!activeCashOrder) return;
    if (cashNumber < activeCashOrder.total_price) {
      alert("Uang tunai kurang dari total bayar!");
      return;
    }

    await updateOrderStatus(activeCashOrder.id, "proses");
    setCashModalOpen(false);
    setActiveCashOrder(null);
    setCashGiven("");
  };

  const printReceipt = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <html>
        <head>
          <title>Struk Pesanan - Meja #${order.table_number}</title>
          <style>
            body { font-family: monospace; width: 300px; padding: 10px; color: #000; }
            h2, p { text-align: center; margin: 0 0 5px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; margin-top: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>Bersandar Café & Space</h2>
          <p>Live Orders Receipt</p>
          <div class="divider"></div>
          <p style="text-align: left;">No Meja: #${order.table_number}</p>
          <p style="text-align: left;">Pemesan: ${order.customer_name}</p>
          <p style="text-align: left;">Tanggal: ${new Date().toLocaleString("id-ID")}</p>
          <div class="divider"></div>
          <div>
            ${order.items
              .map(
                (item) => `
              <div class="item-row">
                <span>${item.nama} ${item.variant ? `(${item.variant})` : ""} x${item.quantity}</span>
                <span>${formatPrice(item.harga * item.quantity)}</span>
              </div>
            `
              )
              .join("")}
          </div>
          <div class="divider"></div>
          <div class="total-row">
            <span>TOTAL:</span>
            <span>${formatPrice(order.total_price)}</span>
          </div>
          <p style="margin-top: 15px; font-size: 11px;">Metode: ${order.payment_method.toUpperCase()}</p>
          <p style="margin-top: 20px; text-align: center; font-size: 12px;">Terima Kasih Telah Berkunjung!</p>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

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
                <a href="/admin/menu" className="hover:text-[#D4A373]">
                  Menu
                </a>
                <a href="/admin/orders" className="text-[#D4A373]">
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
                <a href="/admin/dashboard">Katalog</a>
                <a href="/admin/gallery">Gallery</a>
                <a href="/admin/menu">Menu</a>
                <a href="/admin/orders" className="text-[#D4A373]">Pesanan</a>
                <hr className="border-white/10" />
                <a href="/">Lihat Website</a>
              </div>
            )}
          </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4A373]">Dashboard Kasir</h1>
          <p className="text-sm text-gray-400 mt-1">Bersandar Café & Space — Live Orders</p>
        </div>

        <div className="flex flex-wrap gap-2 bg-[#1a1a1a] p-1.5 rounded-2xl border border-white/10">
          {[
            { key: "pending", label: "Pending" },
            { key: "proses", label: "Proses" },
            { key: "selesai", label: "Selesai" },
            { key: "batal", label: "Batal" },
            { key: "semua", label: "Semua" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                filterStatus === tab.key
                  ? "bg-[#D4A373] text-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-gray-500">Memuat data pesanan...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-24 bg-[#1a1a1a] border border-white/10 rounded-3xl">
          <ShoppingBag size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm">Tidak ada pesanan dengan status "{filterStatus}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const isTransfer = order.payment_method === "transfer";
            const isPending = order.status === "pending";
            const isProses = order.status === "proses";
            const isSelesai = order.status === "selesai";

            return (
              <div
                key={order.id}
                className={`bg-[#1a1a1a] border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition relative ${
                  isSelesai ? "border-green-500/30 bg-gradient-to-b from-[#1a1a1a] to-green-950/10" : "border-white/10 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white">Meja {order.table_number}</h3>
                      <p className="text-xs text-[#D4A373] font-medium mt-0.5">Pemesan: {order.customer_name}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        order.status === "pending"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : order.status === "proses"
                          ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          : order.status === "selesai"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                        isTransfer
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {isTransfer ? <Banknote size={13} /> : <DollarSign size={13} />}
                      {isTransfer ? "TRANSFER MANDIRI / QRIS" : "BAYAR DI KASIR"}
                    </span>

                    {isTransfer && order.payment_proof && (
                      <button
                        onClick={() => setSelectedProof(order.payment_proof || null)}
                        className="mt-2 ml-2 inline-flex items-center gap-1 text-[11px] text-[#D4A373] hover:underline"
                      >
                        <Eye size={12} /> Lihat Bukti Transfer
                      </button>
                    )}
                  </div>

                  <div className="border-t border-b border-white/10 py-3 my-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">
                          {item.nama} {item.variant && <span className="text-xs text-[#D4A373]">({item.variant})</span>}{" "}
                          <strong className="text-white">x{item.quantity}</strong>
                        </span>
                        <span className="text-gray-400 text-xs">{formatPrice(item.harga * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center font-bold text-base mb-6">
                    <span className="text-gray-400 text-sm">Total:</span>
                    <span className="text-[#D4A373] text-lg">{formatPrice(order.total_price)}</span>
                  </div>
                </div>

                {/* TOMBOL AKSI BERDASARKAN STATUS */}
                <div className="space-y-2">
                  {/* STATUS PENDING */}
                  {isPending && (
                    <>
                      {isTransfer ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, "proses")}
                          className="w-full bg-[#D4A373] text-black font-bold py-2.5 rounded-xl text-xs hover:bg-[#c39264] transition shadow-md"
                        >
                          Terima & Proses Pesanan
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveCashOrder(order);
                            setCashGiven("");
                            setCashModalOpen(true);
                          }}
                          className="w-full bg-[#D4A373] text-black font-bold py-2.5 rounded-xl text-xs hover:bg-[#c39264] transition shadow-md flex items-center justify-center gap-1.5"
                        >
                          <DollarSign size={14} /> Proses Tunai & Kembalian
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, "batal")}
                          className="bg-red-950/40 border border-red-500/30 text-red-400 font-semibold py-2 rounded-xl text-xs hover:bg-red-900/40 transition"
                        >
                          Batalkan
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="bg-black/40 border border-white/10 text-gray-400 font-semibold py-2 rounded-xl text-xs hover:text-red-400 hover:border-red-500/30 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    </>
                  )}

                  {/* STATUS PROSES */}
                  {isProses && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, "selesai")}
                          className="bg-green-500/20 border border-green-500/30 text-green-400 font-semibold py-2 rounded-xl text-xs hover:bg-green-500/30 transition flex items-center justify-center gap-1"
                        >
                          <CheckCheck size={14} /> Tandai Selesai
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="bg-black/40 border border-white/10 text-gray-400 font-semibold py-2 rounded-xl text-xs hover:text-red-400 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>

                      <button
                        onClick={() => printReceipt(order)}
                        className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2"
                      >
                        <Printer size={14} /> Cetak Struk
                      </button>
                    </div>
                  )}

                  {/* STATUS SELESAI (DIKUNCI / LOCKED) */}
                  {isSelesai && (
                    <div className="space-y-2">
                      <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 py-2 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                        <CheckCircle size={14} /> Pesanan Selesai (Terkunci)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => printReceipt(order)}
                          className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Printer size={13} /> Cetak Struk
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="bg-black/40 border border-white/10 text-gray-400 font-semibold py-2 rounded-xl text-xs hover:text-red-400 transition flex items-center justify-center gap-1"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STATUS BATAL */}
                  {order.status === "batal" && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, "pending")}
                        className="bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold py-2 rounded-xl text-xs"
                      >
                        Pulihkan Pending
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="bg-red-950/40 border border-red-500/30 text-red-400 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                      >
                        <Trash2 size={13} /> Hapus Permanen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL BUKTI TRANSFER */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 max-w-lg w-full text-center relative shadow-2xl">
            <h3 className="text-lg font-bold text-[#D4A373] mb-4">Bukti Transfer Pembeli</h3>
            <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-white/10 bg-black/50 mb-4">
              <img src={selectedProof} alt="Bukti Transfer" className="w-full h-full object-contain" />
            </div>
            <button
              onClick={() => setSelectedProof(null)}
              className="w-full bg-[#D4A373] text-black font-bold py-3 rounded-xl hover:bg-[#c39264] transition text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL PEMBAYARAN TUNAI PREMIUM & KEREN (GLASSMORPHISM) */}
      {cashModalOpen && activeCashOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in">
          <div className="bg-[#161616] border border-[#D4A373]/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-left overflow-hidden">
            
            {/* Aksen Glow di Background Modal */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex justify-between items-center mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-[#D4A373]/10 border border-[#D4A373]/20 rounded-2xl text-[#D4A373]">
                  <Banknote size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">Kasir Tunai</h3>
                  <p className="text-xs text-gray-400">Meja #{activeCashOrder.table_number} — {activeCashOrder.customer_name}</p>
                </div>
              </div>
              <button 
                onClick={() => setCashModalOpen(false)} 
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 relative z-10">
              {/* Tagihan Box */}
              <div className="bg-black/50 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                <span className="text-xs text-gray-400 font-medium">Total Tagihan</span>
                <span className="text-xl font-bold text-[#D4A373]">{formatPrice(activeCashOrder.total_price)}</span>
              </div>

              {/* Input Uang Tunai */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Uang Diterima dari Pelanggan (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">Rp</span>
                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    placeholder="0"
                    className="w-full bg-black/60 border border-white/15 rounded-2xl py-3.5 pl-12 pr-4 text-white font-bold text-lg focus:border-[#D4A373] outline-none transition shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              {/* Tombol Nominal Cepat (Quick Cash Buttons) */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  activeCashOrder.total_price,
                  20000,
                  50000,
                  100000,
                ].map((nominal, idx) => {
                  const val = nominal <= activeCashOrder.total_price ? activeCashOrder.total_price : nominal;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCashGiven(val.toString())}
                      className="bg-white/5 border border-white/10 hover:border-[#D4A373]/50 hover:bg-[#D4A373]/10 text-xs py-2 rounded-xl text-gray-300 font-medium transition"
                    >
                      {nominal === activeCashOrder.total_price ? "Pas" : `${nominal / 1000}rb`}
                    </button>
                  );
                })}
              </div>

              {/* Informasi Kembalian */}
              {cashNumber > 0 && (
                <div className={`p-4 rounded-2xl border transition-all ${changeAmount >= 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"}`}>
                  {changeAmount >= 0 ? (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium uppercase tracking-wider">Uang Kembalian:</span>
                      <span className="text-lg font-extrabold">{formatPrice(changeAmount)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium uppercase tracking-wider">Kurang Bayar:</span>
                      <span className="text-base font-bold">{formatPrice(Math.abs(changeAmount))}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tombol Aksi Konfirmasi */}
              <button
                onClick={handleProcessCashSubmit}
                disabled={cashNumber < activeCashOrder.total_price}
                className="w-full bg-[#D4A373] text-black font-bold py-3.5 rounded-2xl hover:bg-[#c39264] transition disabled:opacity-40 disabled:cursor-not-allowed text-sm shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <span>Konfirmasi Pembayaran</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
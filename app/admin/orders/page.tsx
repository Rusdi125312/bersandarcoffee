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
  Menu
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
  const [menuOpen, setMenuOpen] = useState(false); // <-- Perbaikan: State menuOpen ditambahkan di sini

  // State Modal Bukti Transfer
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // State Modal Pembayaran Tunai & Kembalian
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [activeCashOrder, setActiveCashOrder] = useState<Order | null>(null);
  const [cashGiven, setCashGiven] = useState<string>("");

  useEffect(() => {
    fetchOrders();

    // Realtime subscription untuk mendengarkan pesanan baru/perubahan
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

  // Update Status Pesanan
  const updateOrderStatus = async (id: number, newStatus: "pending" | "proses" | "selesai" | "batal") => {
    const { error } = await supabase
      .from("menu_order")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert(`Gagal memperbarui status: ${error.message}`);
    } else {
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

  // Filter Data Sesuai Tab Aktif
  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "semua") return true;
    return order.status === filterStatus;
  });

  // Hitung Kembalian Tunai
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
    alert(`Pembayaran tunai berhasil diproses. Kembalian: ${formatPrice(changeAmount)}`);
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
    <main className="min-h-screen bg-[#111111] text-white pb-20 px-4 md:px-10">
      <header className="border-b border-white/10 bg-[#111111] sticky top-0 z-50 backdrop-blur-md -mx-4 md:-mx-10 px-4 md:px-10 mb-8">
        <div className="max-w-7xl mx-auto py-4 flex justify-between items-center">
          <Link href="/" className="relative w-20 h-12 md:w-28 md:h-16 transition-transform hover:scale-105">
            <Image src="/logo-bersandar1.png" alt="Logo Bersandar" fill className="object-contain" priority/>
          </Link>
          
          <nav className="hidden md:flex gap-10 font-medium text-sm">
            <a href="/admin/dashboard" className="hover:text-[#D4A373]">Katalog</a>
            <a href="/admin/gallery" className="hover:text-[#D4A373]">Gallery</a>
            <a href="/admin/menu" className="hover:text-[#D4A373]">Menu</a>
            <a href="/admin/orders" className="text-[#D4A373]">Pesanan</a>
          </nav>
        
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:flex px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 items-center gap-2 text-sm">
              <Globe size={16} /> Website
            </Link>
            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        
        {menuOpen && (
          <div className="md:hidden bg-[#1a1a1a] p-6 border-b border-white/10 flex flex-col gap-4 text-sm">
            <a href="/admin/dashboard" className="hover:text-[#D4A373]">Katalog Menu</a>
            <a href="/admin/gallery" className="hover:text-[#D4A373]">Gallery</a>
            <a href="/admin/menu" className="hover:text-[#D4A373]">Menu</a>
            <a href="/admin/orders" className="text-[#D4A373]">Pesanan</a>
            <hr className="border-white/10" />
            <a href="/" className="flex items-center gap-2 text-gray-300"><Globe size={16} /> Lihat Website</a>
          </div>
        )}
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4A373]">Dashboard Kasir</h1>
          <p className="text-sm text-gray-400 mt-1">Bersandar Café & Space — Live Orders</p>
        </div>

        {/* FILTER STATUS TABS */}
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

      {/* DAFTAR CARD PESANAN */}
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
            const isProsesOrSelesai = order.status === "proses" || order.status === "selesai";

            return (
              <div
                key={order.id}
                className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-white/20 transition relative"
              >
                {/* BAGIAN ATAS CARD: MEJA & NAMA & STATUS BADGE */}
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

                  {/* LABEL METODE BAYAR */}
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

                    {/* Tombol Lihat Bukti Transfer */}
                    {isTransfer && order.payment_proof && (
                      <button
                        onClick={() => setSelectedProof(order.payment_proof || null)}
                        className="mt-2 ml-2 inline-flex items-center gap-1 text-[11px] text-[#D4A373] hover:underline"
                      >
                        <Eye size={12} /> Lihat Bukti Transfer
                      </button>
                    )}
                  </div>

                  {/* DAFTAR ITEM PESANAN */}
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

                  {/* TOTAL BAYAR */}
                  <div className="flex justify-between items-center font-bold text-base mb-6">
                    <span className="text-gray-400 text-sm">Total:</span>
                    <span className="text-[#D4A373] text-lg">{formatPrice(order.total_price)}</span>
                  </div>
                </div>

                {/* TOMBOL AKSI DI BAWAH CARD */}
                <div className="space-y-2">
                  {/* JIKA STATUS MASIH PENDING */}
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

                  {/* JIKA STATUS SUDAH DIPROSES / SELESAI */}
                  {isProsesOrSelesai && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, order.status === "proses" ? "selesai" : "proses")}
                          className="bg-green-500/20 border border-green-500/30 text-green-400 font-semibold py-2 rounded-xl text-xs hover:bg-green-500/30 transition"
                        >
                          {order.status === "proses" ? "Tandai Selesai" : "Status: Selesai"}
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

                  {/* JIKA STATUS BATAL */}
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

      {/* MODAL LIHAT BUKTI TRANSFER */}
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

      {/* MODAL PROSES PEMBAYARAN TUNAI & KEMBALIAN */}
      {cashModalOpen && activeCashOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative text-left">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-[#D4A373]">Proses Pembayaran Tunai</h3>
              <button onClick={() => setCashModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-xs space-y-1.5 text-gray-300">
                <p>Meja: <strong>#{activeCashOrder.table_number}</strong></p>
                <p>Pemesan: <strong>{activeCashOrder.customer_name}</strong></p>
                <p className="text-sm font-bold text-[#D4A373] pt-1">
                  Total Tagihan: {formatPrice(activeCashOrder.total_price)}
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Jumlah Uang Tunai Diterima (Rp)</label>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#D4A373] outline-none text-sm"
                  autoFocus
                />
              </div>

              {cashNumber > 0 && (
                <div className={`p-4 rounded-xl border text-sm ${changeAmount >= 0 ? "bg-green-500/10 border-green-500/20 text-green-300" : "bg-red-500/10 border-red-500/20 text-red-300"}`}>
                  {changeAmount >= 0 ? (
                    <>
                      <span>Uang Kembalian:</span>
                      <p className="text-lg font-bold">{formatPrice(changeAmount)}</p>
                    </>
                  ) : (
                    <span>Uang tunai kurang {formatPrice(Math.abs(changeAmount))}</span>
                  )}
                </div>
              )}

              <button
                onClick={handleProcessCashSubmit}
                disabled={cashNumber < activeCashOrder.total_price}
                className="w-full bg-[#D4A373] text-black font-bold py-3 rounded-xl hover:bg-[#c39264] transition disabled:opacity-50 text-sm shadow-lg"
              >
                Konfirmasi & Proses Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
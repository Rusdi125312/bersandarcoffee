"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Globe, Menu, X } from "lucide-react";
import Image from "next/image";

type Order = {
  id: number;
  customer_name: string;
  table_number: number;
  items: any[];
  total_price: number;
  status: string;
  created_at: string;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("pending");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchOrders();

    // SETUP REALTIME SUBSCRIPTION
    const channel = supabase
      .channel("menu_order_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu_order" },
        (payload) => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from("menu_order")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
  }

  const updateStatus = async (id: number, newStatus: string) => {
    await supabase.from("menu_order").update({ status: newStatus }).eq("id", id);
    fetchOrders();
  };

  // Fungsi Cetak Struk
  const printReceipt = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk - Bercandar Café & Space</title>
          <style>
            body { font-family: monospace; padding: 15px; width: 280px; color: #000; }
            h2 { text-align: center; margin-bottom: 2px; font-size: 16px; }
            p { text-align: center; font-size: 11px; margin-top: 0; }
            .info { font-size: 12px; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
            .item { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
            .total { border-top: 1px dashed #000; font-weight: bold; margin-top: 10px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 13px; }
            .footer { text-align: center; font-size: 10px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <h2>Bercandar Café & Space</h2>
          <p>Jl. Area Café & Space</p>
          <div class="info">
            <span>No. Meja: <b>${order.table_number}</b></span><br>
            <span>Pelanggan: <b>${order.customer_name}</b></span><br>
            <span>Waktu: ${new Date(order.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div>
            ${order.items.map(i => `
              <div class="item">
                <span>${i.nama} x${i.quantity}</span>
                <span>Rp ${(i.harga * i.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          <div class="total">
            <span>TOTAL:</span>
            <span>Rp ${order.total_price.toLocaleString()}</span>
          </div>
          <div class="footer">
            <p>Terima kasih sudah berkunjung!<br>-- Bercandar Café & Space --</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const filteredOrders = orders.filter((o) => 
    filter === "semua" ? true : o.status === filter
  );

  return (
   <main className="min-h-screen bg-[#111111] text-white pb-20">
    <header className="border-b border-white/10 bg-[#111111] sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="relative w-20 h-12 md:w-28 md:h-16 transition-transform hover:scale-105">
            <Image src="/logo-bersandar1.png" alt="Logo Bersandar" fill className="object-contain" priority/>
        </Link>
        
        {/* Menu Desktop */}
        <nav className="hidden md:flex gap-10 font-medium">
          <a href="/admin/dashboard" className="hover:text-[#D4A373]">Katalog Menu</a>
          <a href="/admin/gallery" className="hover:text-[#D4A373]">Gallery</a>
          <a href="/admin/menu" className="hover:text-[#D4A373]">Menu</a>
          <a href="/admin/orders" className="text-[#D4A373]">Pesanan</a>
        </nav>
      
        {/* Tombol Hamburger & Lihat Website */}
        <div className="flex items-center gap-4">
          <Link href="/" className="hidden md:flex px-4 py-2 border border-white/10 rounded-xl hover:bg-white/10 items-center gap-2 text-sm">
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
          <a href="/admin/dashboard">Katalog Menu</a>
          <a href="/admin/gallery">Gallery</a>
          <a href="/admin/menu">Menu</a>
          <a href="/admin/orders" className="text-[#D4A373]">Pesanan</a>
          <hr className="border-white/10" />
          <a href="/">Lihat Website</a>
        </div>
      )}
    </header>

    {/* KONTENT UTAMA */}
    <section className="max-w-7xl mx-auto px-6 pt-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#D4A373]">Dashboard Kasir</h1>
          <p className="text-sm text-gray-400 mt-1">Bercandar Café & Space — Live Orders</p>
        </div>
        
        {/* Filter Status */}
        <div className="bg-[#1a1a1a] p-1 rounded-xl border border-white/10 flex flex-wrap gap-1">
          {["pending", "proses", "selesai", "batal", "semua"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm capitalize transition ${
                filter === f ? "bg-[#D4A373] text-black font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      {/* GRID KARTU PESANAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500 bg-[#1a1a1a] rounded-3xl border border-white/10">
            Belum ada pesanan dengan status "{filter}".
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#1a1a1a] p-6 rounded-3xl border border-white/10 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold">Meja {order.table_number}</h2>
                    <p className="text-[#D4A373] font-medium text-sm">{order.customer_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.status === 'selesai' ? 'bg-green-900/50 text-green-300 border border-green-500/30' : 
                    order.status === 'proses' ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' : 
                    order.status === 'batal' ? 'bg-red-900/50 text-red-300 border border-red-500/30' : 
                    'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6 divide-y divide-white/5">
                  {order.items.map((i: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-300 pt-2 first:pt-0">
                      <span>{i.nama} <span className="text-[#D4A373] font-semibold">x{i.quantity}</span></span>
                      <span>Rp {(i.harga * i.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-[#D4A373]">Rp {order.total_price.toLocaleString()}</span>
                </div>
                
                {/* Tombol Aksi Kasir */}
                <div className="grid grid-cols-2 gap-2">
                  {order.status === "pending" && (
                    <button onClick={() => updateStatus(order.id, "proses")} className="bg-[#D4A373] text-black py-2.5 rounded-xl text-sm font-bold hover:bg-[#c39264] transition">Terima</button>
                  )}
                  {order.status === "proses" && (
                    <button onClick={() => updateStatus(order.id, "selesai")} className="bg-green-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-500 transition">Selesai</button>
                  )}
                  
                  {order.status !== "batal" && order.status !== "selesai" && (
                    <button onClick={() => updateStatus(order.id, "batal")} className="bg-red-900/40 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-sm hover:bg-red-900 transition">Batal</button>
                  )}
                  
                  <button 
                    onClick={() => printReceipt(order)} 
                    className="bg-white/10 border border-white/10 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition col-span-2 flex items-center justify-center gap-2"
                  >
                    🖨️ Cetak Struk
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
   </main>
  );
}
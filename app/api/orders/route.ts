import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, table_number, items, total_price, payment_method, status } = body;

    if (!customer_name || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Data pesanan tidak lengkap." },
        { status: 400 }
      );
    }

    // Ubah dari "orders" menjadi "menu_order" sesuai tabel Anda
    const { data, error } = await supabase
      .from("menu_order")
      .insert([
        {
          customer_name,
          table_number,
          items,
          total_price,
          payment_method: payment_method || "kasir",
          status: status || "pending",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Pesanan berhasil dibuat", data },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Listener Realtime Supabase secara global untuk semua halaman admin
    const channel = supabase
      .channel("global_menu_order_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "menu_order" },
        (payload) => {
          // Putar audio notifikasi
          const audio = new Audio("/notification.mpeg");
          audio.play().catch((err) => console.log("Audio diblokir browser:", err));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <>{children}</>;
}
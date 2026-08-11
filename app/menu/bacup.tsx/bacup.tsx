"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type MenuItem = {
  id: number;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  gambar: string;
};

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const groupedMenus = menus.reduce(
    (groups: Record<string, MenuItem[]>, menu) => {
      const category = menu.kategori;

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(menu);

      return groups;
    },
    {}
  );
  function formatHarga(harga: number) {
  return `${harga / 1000}K`;
}

  return (
    <main className="min-h-screen bg-[#111111] text-white">

              {/* HERO */}
        {/* HEADER */}
        <header className="absolute top-0 left-0 w-full z-50">

          <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold tracking-[4px]">
                BERSANDAR
              </h2>

              <p className="text-sm tracking-[4px] text-gray-300">
                coffee and space
              </p>
            </div>

            <nav className="hidden md:flex gap-10">

              <a href="/" className="hover:text-[#D4A373]">
                Home
              </a>

              <a href="/menu" className="text-[#D4A373]">
              Menu
              </a>

              <a href="/gallery" className="hover:text-[#D4A373]">
                Gallery
              </a>

              <a href="/contact" className="hover:text-[#D4A373]">
                Contact
              </a>

            </nav>

            <a
              href="/reservasi"
              className="
                border
                border-[#D4A373]
                px-6
                py-3
                rounded-xl
                  flex
                  items-center
                  gap-2
                hover:bg-[#D4A373]
                transition
              "
            >
              Reservasi
            </a>

          </div>

        </header>

        {/* HERO MENU */}
        <section
          className="
            min-h-screen
            relative
            flex
            items-center
            overflow-hidden
          "
        >

          <div className="absolute inset-0">

            <img
              src="/background-cafe.jpeg"
              alt="Bersandar Coffee"
              className="
                w-full
                h-full
                object-cover
              "
            />

            <div className="absolute inset-0 bg-black/70" />

          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">

            <div>

              <p className="text-[#D4A373] tracking-[6px] uppercase">
                Bersandar Coffee & Space
              </p>

              <h1 className="
                text-6xl
                md:text-8xl
                font-serif
                leading-none
                mt-4
              ">
                MENU
              </h1>

              <p className="
                text-gray-300
                mt-6
                max-w-md
              ">
                Temukan kopi terbaik,
                minuman spesial,
                dan hidangan pilihan
                dari Bersandar Coffee & Space.
              </p>

              <button
                className="
                  mt-8
                  border
                  border-[#D4A373]
                  px-8
                  py-4
                  rounded-full
                  hover:bg-[#D4A373]
                  transition
                "
              >
                Lihat Semua Menu
              </button>

            </div>

          </div>

        </section>

              {loading ? (
                <div className="text-center py-20">
                  Memuat Menu...
                </div> ) :
                (
                <section className="max-w-7xl mx-auto px-6 pb-20">

                  {Object.entries(groupedMenus).map(
                    ([kategori, items]) => (
                      <div
                        key={kategori}
                        className="mb-16"
                      >

                        <h2 className="text-3xl font-bold mb-8 text-[#D4A373]">
                          {kategori}
                        </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"> 

                        {items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="
                                      relative
                                      h-[500px]
                                      overflow-hidden
                                      rounded-[30px]
                                      group
                                      cursor-pointer
                                    "
                                  >

                                    <img
                                      src={item.gambar}
                                      alt={item.nama}
                                      className="
                                        w-full
                                        h-full
                                        object-cover
                                        transition-all
                                        duration-700
                                        group-hover:scale-110
                                      "
                                    />

                                    <div className="
                                      absolute
                                      inset-0
                                      bg-gradient-to-t
                                      from-black
                                      via-black/40
                                      to-transparent
                                    " />

                                    <div className="
                                      absolute
                                      top-5
                                      left-5
                                      bg-[#D4A373]
                                      text-black
                                      px-4
                                      py-2
                                      rounded-full
                                      text-xs
                                      font-semibold
                                      uppercase
                                    ">
                                      {item.kategori}
                                    </div>

                                    <div className="
                                      absolute
                                      bottom-0
                                      left-0
                                      right-0
                                      p-8
                                    ">

                                      <h3 className="
                                        text-4xl
                                        font-bold
                                        mb-3
                                      ">
                                        {item.nama}
                                      </h3>

                                      <p className="
                                        text-white/80
                                        mb-4
                                        leading-relaxed
                                      ">
                                        {item.deskripsi}
                                      </p>

                                      <div className="
                                        flex
                                        justify-between
                                        items-center
                                      ">

                                        <p className="
                                        text-[#D4A373]
                                        text-2xl
                                        font-bold
                                        ">
                                        {Math.floor(item.harga / 1000)}K
                                        </p>
                                    
                                      </div>

                                    </div>

                                  </div>
                                )
                                )
                                }
                                          

                </div>

              </div>
            )
          )}

        </section>
      )}
    </main>
  );
}
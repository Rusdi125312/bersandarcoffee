  "use client";

  import { useEffect, useState } from "react";
  import { supabase } from "@/lib/supabase";
  import Link from "next/link";
  import { Menu, X } from "lucide-react"; // Import ikon
  import Image from "next/image"; // Import Image untuk logo
  import { Coffee, Armchair, Wifi, Users } from "lucide-react"; // Import ikon untuk fitur

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
    const [kategoriAktif, setKategoriAktif] = useState("Semua");
    const [menuOpen, setMenuOpen] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [isFilterVisible, setIsFilterVisible] = useState(true);

    useEffect(() => {
      fetchMenu();
      // 2. Tambahkan listener scroll untuk hide/show header
      const handleScroll = () => {
        const currentScrollPos = window.scrollY;
        // Header & Filter menghilang jika scroll > 100px dan scroll ke bawah
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 100;
      
      setIsHeaderVisible(isVisible);
      setIsFilterVisible(isVisible); // Tambahkan ini
      setPrevScrollPos(currentScrollPos);
    };
      window.addEventListener("scroll", handleScroll);
      
      // 3. Cleanup listener saat komponen di-unmount
      return () => window.removeEventListener("scroll", handleScroll);
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
          {/* HEADER */}
          <header className="absolute top-0 left-0 w-full z-50">

           <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3 justify-start">
            <Link href="/" className="relative ml-4 w-20 h-16 md:w-32 md:h-24 transition-transform hover:scale-105">
                  <Image 
                    src="/logo-bersandar1.png" 
                    alt="Logo Bersandar"
                    fill
                    className="object-contain"
                    priority
                  />
                </Link>
          </div>
  {/* Tombol Hamburger (Hanya muncul di mobile) */}
      <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={32} /> : <Menu size={32} />}
      </button>
              <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-10 font-medium">

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
                href="https://wa.me/6285280020604?text=Halo%20Admin%20Bersandar,%20saya%20ingin%20melakukan%20reservasi%20tempat." 
                target="_blank"
                className="
                 hidden md:flex border border-white/20 hover:border-[#D4A373] px-6 py-2 rounded-xl hover:bg-[#D4A373] transition whitespace-nowrap"
              >
                Reservasi
              </a>

            </div>
          

  {/* Overlay Menu Mobile */}
    {menuOpen && (
      <div className="md:hidden absolute top-full left-0 w-full bg-[#111111]/95 backdrop-blur-md border-b border-white/10 flex flex-col items-center py-8 gap-6 z-50 shadow-2xl">
        <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="/menu" className="text-[#D4A373]" onClick={() => setMenuOpen(false)}>Menu</a>
        <a href="/gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
        <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
        {/* Tombol Reservasi masuk ke sini */}
        <a href="https://wa.me/6285280020604?text=Halo%20Admin%20Bersandar,%20saya%20ingin%20reservasi." className="border border-[#D4A373] px-8 py-3 rounded-xl bg-[#D4A373] text-black font-bold" target="_blank" rel="noopener noreferrer">
          Reservasi
        </a>
      </div>
    )}
  </header>

          {/* HERO MENU */}
          <section className="h-[60vh] md:h-screen relative flex items-center ">
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
            <div className="relative z-10 max-w-7xl mx-auto px-8 pt-32 grid md:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl text-left">
              <div>
                <p className="text-[#D4A373] tracking-[6px] uppercase">
                  Bersandar Coffee & Space
                </p>
                <h1 className="
                  text-4xl
                  md:text-6xl
                  lg:text-8xl
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

              </div>
              </div>
            </div>

          </section>

          
  {/* Navigasi Filter: Dibuat menyatu (relative) bukan sticky */}
{/* Navigasi Filter: Scrollable di mobile, rapi di desktop */}
<div className="relative w-full bg-[#111111] py-8 border-b border-white/10">
  {/* 
    mx-auto: membuat konten ke tengah
    px-4: padding samping di mobile
    md:px-0: menghilangkan padding di desktop agar lebih lebar
  */}
  <div className="max-w-3xl mx-auto px-4 md:px-0"> 
    
    {/* 
      flex-nowrap: memastikan item tidak turun ke bawah
      overflow-x-auto: mengaktifkan scroll horizontal
      scrollbar-hide: menyembunyikan scrollbar
      md:justify-center: di desktop, tombol akan berada di tengah secara rapi
      md:overflow-x-visible: di desktop, scroll dimatikan agar tombol tampil semua
    */}
    <div className="flex flex-nowrap md:justify-center overflow-x-auto scrollbar-hide gap-3 pb-2 md:overflow-x-visible items-center">
      {["Semua", ...Object.keys(groupedMenus)].map((kat) => (
        <button
          key={kat}
          onClick={() => setKategoriAktif(kat)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
            kategoriAktif === kat 
              ? "bg-[#D4A373] text-black border-[#D4A373]"
              : "bg-[#1a1a1a] text-gray-400 border-white/10 hover:border-white/20"
          }`}
        >
          {kat}
        </button>
      ))}
    </div>
  </div>
</div>
        {loading ? (
    <div className="text-center py-20">Memuat Menu...</div>
  ) : (
    <section className="max-w-7xl mx-auto px-6 py-6 mt-0">
      {Object.entries(groupedMenus)
        // TAMBAHKAN FILTER DI SINI:
        .filter(([kategori]) => kategoriAktif === "Semua" || kategori === kategoriAktif)
        .map(([kategori, items]) => (
          <div key={kategori} className="mb-10">
            {/* Judul Kategori */}
         <h2 
            id={kategori}
            className="text-4xl font-serif font-bold mb-10 text-white border-l-4 border-[#D4A373] pl-6 mt-8"
          >
            {kategori}
          </h2>

        {/* Grid Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-12">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative h-[500px] md:h-[500px] w-full rounded-[30px] bg-[#1a1a1a] group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-[#D4A373]/20 transition-all duration-500 overflow-visible"
            >
              {/* Gambar */}
              <div className="absolute inset-0 w-full h-full rounded-[30px] overflow-hidden transition-all duration-500 group-hover:-translate-y-8 group-hover:scale-110 group-hover:shadow-2xl">
              <img
                src={item.gambar}
                alt={item.nama}
                className="w-full h-full object-cover brightness-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              {/* Informasi Menu */}
              <div className="absolute bottom-6 left-8 right-8 z-10">
                <div className="flex justify-between items-end ">
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider group-hover:text-[#D4A373] transition-colors">
                    {item.nama}
                  </h3>
                              {item.harga > 0 ? (
                  <span className="bg-[#D4A373] text-black font-bold px-3 py-1 rounded-md text-sm">
                    {Math.floor(item.harga / 1000)}K
                  </span>
                ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </section>
        )}
      <footer className="w-full py-10 bg-[#0a0a0a] text-center border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-gray-500 text-sm tracking-widest">
            &copy; {new Date().getFullYear()} Bersandar Coffee & Space. All rights reserved.
          </p>
          {/* Tombol Tersembunyi (Login Admin) */}
          {/* Tombol ini hampir tidak terlihat (opacity-0) dan hanya muncul saat di-hover */}
          <div className="mt-4">
            <Link 
              href="/admin/login" 
              className="text-[10px] text-gray-800 hover:text-gray-400 transition-opacity opacity-0 hover:opacity-100 cursor-pointer"
            >
              Admin Access
            </Link>
          </div>
        </div>
      </footer>

      </main>

    );
  }

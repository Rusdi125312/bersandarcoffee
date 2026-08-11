"use client";

import { useEffect, useState } from "react";
import { Coffee, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      router.push("/admin/login");
    }
  }

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.user) {
        setError("User tidak ditemukan");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();

    } catch (err) {
      console.error(err);
      setError(
        "Terjadi kesalahan saat login"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        relative
        min-h-screen
        flex
        items-center
        justify-center
        px-6
      "
      style={{
        backgroundImage:
          "url('/background-cafe.jpeg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/80" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">

        <div
          className="
            bg-white/10
            backdrop-blur-xl
            border
            border-white/10
            rounded-3xl
            shadow-2xl
            p-8
          "
        >
          {/* Logo */}
          <div className="text-center mb-8">

            <div
              className="
                w-20
                h-20
                mx-auto
                rounded-2xl
                bg-[#D4A373]/20
                border
                border-[#D4A373]/30
                flex
                items-center
                justify-center
                mb-5
              "
            >
              <Coffee
                size={36}
                className="text-[#D4A373]"
              />
            </div>

            <h1
              className="
                text-white
                text-3xl
                font-bold
                tracking-[5px]
              "
            >
              BERSANDAR
            </h1>

            <p
              className="
                text-gray-300
                tracking-[3px]
                mt-2
              "
            >
              coffee and space
            </p>

            <p className="text-gray-400 text-sm mt-4">
              Login Administrator
            </p>

          </div>

          {/* Error */}
          {error && (
            <div
              className="
                mb-4
                rounded-xl
                bg-red-500/20
                border
                border-red-500/30
                p-3
                text-sm
                text-red-200
              "
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="admin@bersandar.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/10
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-[#D4A373]
                "
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="********"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-white/10
                    px-4
                    py-3
                    pr-12
                    text-white
                    outline-none
                    focus:border-[#D4A373]
                  "
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                  "
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                rounded-xl
                bg-[#D4A373]
                py-3
                font-medium
                text-white
                transition
                hover:bg-[#C58E58]
                disabled:opacity-60
              "
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Memproses...
                </span>
              ) : (
                "Masuk Dashboard"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Bersandar Coffee & Space
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
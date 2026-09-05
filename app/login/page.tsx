"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  LogIn,
  AlertCircle,
  KeyRound,
  User,
  ShieldCheck,
  DoorClosed,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  MessageCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuestGuard } from "@/components/auth/guest-guard";
import { useAuthStore } from "@/lib/store/use-auth-store";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { quickLogin, loginWithPassword, loginWithGoogle } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  // Status error dari redirect callback Google OAuth
  const errorQuery = searchParams.get("error");
  const emailQuery = searchParams.get("email") || "";
  const [dismissedUnregistered, setDismissedUnregistered] = useState(false);

  const [errorMsg, setErrorMsg] = useState(() => {
    if (errorQuery === "auth_failed") {
      return "Gagal mengautentikasi akun Google. Silakan coba kembali.";
    }
    if (errorQuery === "owner_oauth_unsupported") {
      return "Akun Pemilik Kost wajib masuk menggunakan formulir Email & Kata Sandi di bawah.";
    }
    return "";
  });

  const unregisteredEmail =
    !dismissedUnregistered &&
    (errorQuery === "unregistered" ||
      errorQuery === "no_room" ||
      errorQuery === "inactive")
      ? emailQuery || "akun Anda"
      : null;

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setDismissedUnregistered(true);
    setIsLoadingGoogle(true);

    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setErrorMsg(res.error || "Gagal membuka login Google.");
        setIsLoadingGoogle(false);
      }
      // Jika berhasil, peramban akan diarahkan ke Google OAuth URL
    } catch {
      setErrorMsg("Terjadi kesalahan saat memulai autentikasi Google.");
      setIsLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setDismissedUnregistered(true);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Username & sandi wajib diisi.");
      return;
    }

    setIsLoading(true);

    // Coba login Supabase / Mock hybrid
    const result = await loginWithPassword(username.trim(), password.trim());
    setIsLoading(false);

    if (result.success) {
      toast.success("Berhasil masuk!", {
        description: "Mengarahkan ke dashboard...",
      });
      router.replace("/dashboard");
    } else {
      setErrorMsg(result.error || "Gagal masuk.");
    }
  };

  const handleQuickLogin = (userKey: string) => {
    setErrorMsg("");
    setDismissedUnregistered(true);
    setIsLoading(true);
    const result = quickLogin(userKey);
    setIsLoading(false);

    if (result.success) {
      toast.success(
        `Berhasil masuk sebagai ${
          userKey === "pemilik" ? "Pemilik Kost" : `Kamar ${userKey}`
        }!`,
        {
          description: "Mengarahkan ke dashboard...",
        }
      );
      router.replace("/dashboard");
    } else {
      setErrorMsg(result.error || "Gagal memuat akun demo.");
    }
  };

  const demoKamar = ["101", "102", "103", "104", "105", "106", "107", "108"];

  const waHref = `https://wa.me/6281234567890?text=${encodeURIComponent(
    `Halo Ibu Hj. Syantika (Pemilik Kost), saya ingin mendaftarkan email Google saya (${unregisteredEmail}) untuk kamar kost di Kost Syantika.`
  )}`;

  return (
    <div className="w-full max-w-md flex flex-col space-y-4">
      {/* Main Card with Real Kost Syantika Facade Hero & Login Form */}
      <Card className="card-shadow border-zinc-200 bg-white overflow-hidden rounded-xl">
        {/* Architectural Facade Image Frame */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-100 border-b border-zinc-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/kost-syantika.jpg"
            alt="Fasad Bangunan Kost Syantika"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950/60 via-transparent to-black/10 pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950/80 text-xs font-medium tracking-wide backdrop-blur-xs border border-white/15">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Kost Syantika • 8 Kamar
            </span>
            <span className="text-xs text-zinc-200 font-medium">
              Jl. Melati No. 15
            </span>
          </div>
        </div>

        {/* Header Brand & Section Title */}
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-950">
                Masuk ke Akun
              </h1>
              <CardDescription className="text-xs text-zinc-500 mt-0.5">
                Masuk 1-klik dengan Google atau gunakan kredensial Pemilik
              </CardDescription>
            </div>
            <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="p-4 sm:p-5 pt-4 space-y-4">
          {/* Friendly Alert for Unregistered Google Account */}
          {unregisteredEmail && (
            <div
              data-testid="unregistered-alert"
              className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-3 animate-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-950">
                      Akun Google Belum Terdaftar
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      Email Google <strong className="font-semibold text-amber-950">{unregisteredEmail}</strong> belum terdaftar pada kamar Kost Syantika manapun. Silakan hubungi Pemilik Kost untuk mendaftarkan kamar Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDismissedUnregistered(true)}
                  className="text-amber-500 hover:text-amber-800 p-0.5 rounded cursor-pointer transition-colors"
                  aria-label="Tutup notifikasi"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-all shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hubungi Pemilik Kost via WhatsApp</span>
              </a>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 justify-center py-2 px-3 text-rose-600 bg-rose-50 border border-rose-100 rounded-md animate-in slide-in-from-top-1 fade-in duration-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Penghuni Kost 1-Click Google OAuth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900">
                Akses Penghuni Kost
              </span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                1-Klik Otomatis
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoadingGoogle}
              className="w-full h-10.5 gap-2.5 font-semibold text-xs rounded-lg border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 shadow-2xs hover:border-zinc-400 active:scale-[0.99] transition-all cursor-pointer"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>
                {isLoadingGoogle ? "Menghubungkan..." : "Lanjutkan dengan Google"}
              </span>
            </Button>
            <p className="text-[11px] text-zinc-500 text-center">
              Masuk instan menggunakan email Google yang didaftarkan ke Pemilik.
            </p>
          </div>

          {/* Clean Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2.5 text-zinc-400 font-medium text-[11px]">
                atau masuk sebagai Pemilik Kost
              </span>
            </div>
          </div>

          {/* Section 2: Form Login Pemilik Kost */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-zinc-500" />
                <span>Email atau Username Pemilik Kost</span>
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoCapitalize="none"
                placeholder="Contoh: pemilik@kostsyantika.com atau pemilik"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                className="h-10 rounded-md text-xs border-zinc-200 bg-white text-zinc-900 focus-visible:ring-emerald-600 focus-visible:border-emerald-600"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                <span>Kata Sandi</span>
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi (demo: 123456)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  className="h-10 pr-10 rounded-md text-xs border-zinc-200 bg-white text-zinc-900 focus-visible:ring-emerald-600 focus-visible:border-emerald-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 gap-2 font-semibold text-xs rounded-md bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs active:scale-[0.99] transition-all cursor-pointer mt-1"
              disabled={isLoading}
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
              </span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Demo Credentials Guide Card */}
      <Card className="card-shadow border-zinc-200 bg-white overflow-hidden rounded-xl">
        <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <p className="text-sm font-bold text-zinc-900">
                Panduan Kredensial Demo
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-xs font-medium text-zinc-600 border-zinc-200 bg-zinc-50"
            >
              Masuk Instan
            </Badge>
          </div>
          <CardDescription className="text-xs text-zinc-500 mt-1">
            Pilih peran di bawah untuk login instan atau gunakan kata sandi:{" "}
            <code className="bg-zinc-100 text-zinc-900 border border-zinc-200 px-1.5 py-0.5 rounded font-bold text-xs">
              123456
            </code>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-3.5 space-y-3.5">
          {/* Pemilik Demo Button */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Akses Pemilik Kost:</span>
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full p-3 h-auto min-h-[50px] justify-between border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 rounded-lg group transition-colors cursor-pointer"
              onClick={() => handleQuickLogin("pemilik")}
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-7 h-7 rounded bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  P
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-950">
                    Ibu Hj. Syantika (Pemilik)
                  </p>
                  <p className="text-xs text-zinc-500">
                    Username:{" "}
                    <code className="font-semibold text-zinc-800">
                      pemilik
                    </code>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-800 font-semibold text-xs bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <span>Masuk</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Button>
          </div>

          {/* Penghuni Demo Chips */}
          <div className="space-y-1.5 pt-3 border-t border-zinc-100">
            <p className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <DoorClosed className="w-3.5 h-3.5 text-zinc-600" />
              <span>Akses Penghuni Kamar (101 - 108):</span>
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {demoKamar.map((kamar) => (
                <Button
                  key={kamar}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold tabular-nums h-9 rounded-md border-zinc-200 bg-zinc-50 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 text-zinc-900 transition-colors cursor-pointer shadow-2xs"
                  onClick={() => handleQuickLogin(kamar)}
                >
                  {kamar}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-3 text-center justify-center border-t border-zinc-100 bg-zinc-50/50">
          <p className="text-xs text-zinc-500">
            Klik salah satu nomor kamar untuk langsung menguji tampilan
            penghuni.
          </p>
        </CardFooter>
      </Card>

      {/* Footer */}
      <footer className="text-center py-2 text-xs text-zinc-400">
        <p>Kost Syantika PWA • Autentikasi Mandiri</p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 py-8 sm:py-12 safe-top safe-bottom">
        <Suspense
          fallback={
            <div className="w-full max-w-md p-8 text-center text-xs text-zinc-500">
              Memuat formulir masuk...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </GuestGuard>
  );
}

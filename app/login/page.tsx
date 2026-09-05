"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GuestGuard } from "@/components/auth/guest-guard";
import { useAuthStore } from "@/lib/store/use-auth-store";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Harap masukkan username/nomor kamar dan kata sandi.");
      return;
    }

    setIsLoading(true);
    const result = login(username.trim(), password.trim());
    setIsLoading(false);

    if (result.success) {
      toast.success("Berhasil masuk!", {
        description: "Mengarahkan ke dashboard Kost Syantika...",
      });
      router.replace("/dashboard");
    } else {
      setErrorMsg(result.error || "Gagal masuk. Periksa kembali data Anda.");
    }
  };

  const handleQuickLogin = (userKey: string) => {
    setErrorMsg("");
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
      setErrorMsg(result.error || "Gagal masuk dengan akun demo.");
    }
  };

  const demoRooms = ["101", "102", "103", "104", "105", "106", "107", "108"];

  return (
    <GuestGuard>
      <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 py-8 sm:py-12 safe-top safe-bottom">
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
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-950/80 text-[10px] font-mono font-medium tracking-wide backdrop-blur-xs border border-white/15">
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  Kost Syantika • 8 Unit Kamar
                </span>
                <span className="text-[10px] font-mono text-zinc-200">
                  Jl. Melati No. 15
                </span>
              </div>
            </div>

            {/* Header Brand & Section Title */}
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base font-bold tracking-tight text-zinc-950">
                    Masuk ke Akun
                  </h1>
                  <CardDescription className="text-xs text-zinc-500 mt-0.5">
                    Gunakan username Pemilik atau Nomor Kamar Anda untuk masuk
                  </CardDescription>
                </div>
                <div className="w-8 h-8 rounded bg-zinc-950 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </CardHeader>

            {/* Form Fields */}
            <CardContent className="p-4 sm:p-5 pt-4">
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {errorMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label
                    htmlFor="username"
                    className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Username atau Nomor Kamar</span>
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoCapitalize="none"
                    placeholder="Contoh: pemilik atau 101"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    className="h-10 rounded-md text-xs border-zinc-200 bg-white text-zinc-900 focus-visible:ring-emerald-600 focus-visible:border-emerald-600"
                    required
                  />
                </div>

                <div className="space-y-1">
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
                  <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
                    Panduan Kredensial Demo
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono text-zinc-700 border-zinc-200 bg-zinc-50"
                >
                  Satu Klik Masuk
                </Badge>
              </div>
              <CardDescription className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Pilih peran di bawah untuk login instan atau gunakan kata sandi:{" "}
                <code className="bg-zinc-100 text-zinc-900 border border-zinc-200 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">
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
                    <div className="w-7 h-7 rounded bg-zinc-900 text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">
                        Ibu Hj. Syantika (Pemilik)
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
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
                  {demoRooms.map((room) => (
                    <Button
                      key={room}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs font-mono font-bold h-9 rounded-md border-zinc-200 bg-zinc-50 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 text-zinc-900 transition-colors cursor-pointer shadow-2xs"
                      onClick={() => handleQuickLogin(room)}
                    >
                      {room}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 text-center justify-center border-t border-zinc-100 bg-zinc-50/50">
              <p className="text-[11px] font-mono text-zinc-500">
                Klik salah satu nomor kamar untuk langsung menguji tampilan
                penghuni.
              </p>
            </CardFooter>
          </Card>

          {/* Footer */}
          <footer className="text-center py-2 text-[11px] font-mono text-zinc-400">
            <p>Kost Syantika PWA • Demo Fase 1</p>
          </footer>
        </div>
      </main>
    </GuestGuard>
  );
}

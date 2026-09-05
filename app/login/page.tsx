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
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4.5 py-8 sm:py-12 safe-top safe-bottom">
        <div className="w-full max-w-md flex flex-col space-y-6">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center space-y-3 mb-1">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25 ring-4 ring-emerald-500/15">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Kost Syantika
              </h1>
              <p className="text-xs font-semibold text-emerald-700 mt-0.5 tracking-wide">
                Manajemen Pembayaran & Sewa Kamar
              </p>
            </div>
          </div>

          {/* Form Login Card */}
          <Card className="card-shadow border-slate-200/80 bg-white">
            <CardHeader className="p-5 pb-4 space-y-1">
              <CardTitle className="text-lg font-bold text-slate-900">
                Masuk ke Akun
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Gunakan username Pemilik atau Nomor Kamar Anda untuk masuk
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="username"
                    className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
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
                    className="h-11 rounded-xl text-sm border-slate-200 focus-visible:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
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
                      className="h-11 pr-11 rounded-xl text-sm border-slate-200 focus-visible:ring-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
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
                  variant="emerald"
                  className="w-full h-11 gap-2 font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
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
          <Card className="border-emerald-200/80 bg-linear-to-b from-emerald-50/40 via-white to-emerald-50/20 card-shadow overflow-hidden">
            <CardHeader className="p-5 pb-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Panduan Kredensial Demo
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold border-emerald-300 text-emerald-800 bg-white"
                >
                  Satu Klik Masuk
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Pilih peran di bawah untuk login instan atau gunakan kata sandi:{" "}
                <code className="bg-emerald-100/80 text-emerald-900 px-1.5 py-0.5 rounded-md font-mono font-bold text-xs">
                  123456
                </code>
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              {/* Pemilik Demo Button */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Akses Pemilik Kost:</span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full p-3.5 h-auto min-h-[54px] justify-between border-emerald-200 bg-white hover:bg-emerald-50/90 hover:border-emerald-300 rounded-xl group transition-all cursor-pointer active:scale-[0.98]"
                  onClick={() => handleQuickLogin("pemilik")}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                        Ibu Hj. Syantika (Pemilik)
                      </p>
                      <p className="text-xs text-slate-500 font-normal">
                        Username:{" "}
                        <code className="font-semibold text-emerald-700">
                          pemilik
                        </code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 group-hover:text-emerald-800 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                    <span>Masuk</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Button>
              </div>

              {/* Penghuni Demo Chips */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <DoorClosed className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Akses Penghuni Kamar (101 - 108):</span>
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {demoRooms.map((room) => (
                    <Button
                      key={room}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold h-10 rounded-xl border-emerald-200/70 bg-white hover:bg-emerald-600 hover:text-white hover:border-emerald-600 text-emerald-950 active:scale-[0.96] transition-all cursor-pointer shadow-2xs"
                      onClick={() => handleQuickLogin(room)}
                    >
                      {room}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 pb-4 text-center justify-center">
              <p className="text-xs text-slate-500 font-medium">
                Klik salah satu nomor kamar untuk langsung menguji tampilan
                penghuni.
              </p>
            </CardFooter>
          </Card>

          {/* Footer */}
          <footer className="text-center py-4 text-xs text-slate-400">
            <p>Kost Syantika PWA • Demo Fase 1</p>
          </footer>
        </div>
      </main>
    </GuestGuard>
  );
}

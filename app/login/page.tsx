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
      toast.success(`Berhasil masuk sebagai ${userKey === "pemilik" ? "Pemilik Kost" : `Kamar ${userKey}`}!`, {
        description: "Mengarahkan ke dashboard...",
      });
      router.replace("/dashboard");
    } else {
      setErrorMsg(result.error || "Gagal masuk dengan akun demo.");
    }
  };

  const demoRooms = ["101", "102", "103", "104", "105", "106", "107", "108"];

  return (
    <GuestGuard>
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 safe-top safe-bottom">
        <div className="w-full max-w-md flex flex-col space-y-5">
          {/* Header Brand */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Kost Syantika
              </h1>
              <p className="text-xs font-medium text-emerald-700">
                Manajemen Pembayaran & Sewa Kamar
              </p>
            </div>
          </div>

          {/* Form Login Card */}
          <Card className="card-shadow border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-slate-900">
                Masuk ke Akun
              </CardTitle>
              <CardDescription className="text-xs">
                Gunakan username Pemilik atau Nomor Kamar Anda untuk masuk
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="username"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Username atau Nomor Kamar
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
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    Kata Sandi
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Masukkan kata sandi (demo: 123456)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="emerald"
                  className="w-full gap-2 font-semibold shadow-md shadow-emerald-600/20"
                  disabled={isLoading}
                >
                  <LogIn className="w-4 h-4" />
                  {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials Guide Card */}
          <Card className="border-emerald-100 bg-linear-to-br from-emerald-500/5 via-white to-emerald-50/50 card-shadow">
            <CardHeader className="pb-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Panduan Kredensial Demo
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700">
                  Satu Klik Masuk
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-600">
                Pilih peran di bawah untuk login instan atau gunakan kata sandi:{" "}
                <code className="bg-emerald-100/70 text-emerald-800 px-1 py-0.5 rounded font-mono font-bold">
                  123456
                </code>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-1">
              {/* Pemilik Demo Button */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Akses Pemilik Kost:
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                  onClick={() => handleQuickLogin("pemilik")}
                >
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      P
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Ibu Hj. Syantika (Pemilik)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Username: <code className="font-semibold text-emerald-700">pemilik</code>
                      </p>
                    </div>
                  </div>
                  <Badge variant="lunas" className="text-[10px]">
                    Masuk
                  </Badge>
                </Button>
              </div>

              {/* Penghuni Demo Chips */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                  <DoorClosed className="w-3.5 h-3.5 text-emerald-600" />
                  Akses Penghuni Kamar (101 - 108):
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {demoRooms.map((room) => (
                    <Button
                      key={room}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold py-1.5 h-auto border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-700"
                      onClick={() => handleQuickLogin(room)}
                    >
                      {room}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-3 text-center justify-center">
              <span className="text-[10px] text-slate-400">
                Klik salah satu nomor kamar untuk langsung menguji tampilan penghuni.
              </span>
            </CardFooter>
          </Card>

          {/* Footer */}
          <footer className="text-center py-2 text-xs text-slate-400">
            <p>Kost Syantika PWA • Demo Fase 1</p>
          </footer>
        </div>
      </main>
    </GuestGuard>
  );
}

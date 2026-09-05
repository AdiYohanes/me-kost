"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  DoorClosed,
  RotateCcw,
  LogOut,
  CreditCard,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { UserSession } from "@/types/auth";
import { formatRupiah } from "./pemilik-summary-cards";

interface PengaturanProfilViewProps {
  user: UserSession;
}

export function PengaturanProfilView({ user }: PengaturanProfilViewProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { resetPayments } = usePaymentStore();

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const isPemilik = user.role === "PEMILIK";

  const handleLogout = () => {
    logout();
    toast.info("Anda telah keluar.", {
      description: "Sesi berhasil dibersihkan.",
    });
    router.replace("/login");
  };

  const handleConfirmReset = () => {
    resetPayments();
    setIsResetDialogOpen(false);
    toast.success("Data demo berhasil direset ke kondisi awal!", {
      description:
        "Seluruh transaksi, antrean verifikasi, dan status tagihan telah dipulihkan ke data seed bawaan.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Profil Header Card */}
      <Card className="border-emerald-100 bg-linear-to-br from-emerald-500/10 via-white to-emerald-50/50 card-shadow overflow-hidden">
        <CardHeader className="p-5 pb-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              Profil Akun
            </span>
            {isPemilik ? (
              <Badge variant="lunas" className="text-[10px] gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Pemilik Kost</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] border-emerald-300 text-emerald-800 font-semibold gap-1"
              >
                <DoorClosed className="w-3 h-3" />
                <span>Kamar {user.nomorKamar}</span>
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg font-black text-slate-900 mt-1">
            {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Username: @{user.username} • Kost Syantika
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-3 text-xs">
          {isPemilik ? (
            <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-100/80 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Total Properti:</span>
                <span className="font-bold text-slate-900">8 Unit Kamar</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Lokasi:</span>
                <span className="font-semibold text-slate-800">
                  Ruang Pengelola, Lantai 1
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Jam Layanan:</span>
                <span className="font-semibold text-slate-800">
                  08:00 - 20:00 WIB
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-white/90 border border-emerald-100/80 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Unit Kamar:</span>
                <span className="font-bold text-slate-900">
                  Kamar {user.nomorKamar}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Fasilitas Tipe:</span>
                <span className="font-semibold text-slate-800">
                  {user.tipeKamar || "Kamar AC, Kamar Mandi Dalam"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Tarif Sewa Bulanan:</span>
                <span className="font-bold text-emerald-700">
                  {formatRupiah(user.tarifBulanan || 1500000)} / bln
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Rekening Kost Card */}
      <Card className="card-shadow">
        <CardHeader className="p-5 pb-3.5">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Rekening Resmi Kost Syantika</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Bank BCA</p>
              <p className="font-mono font-bold text-sm text-slate-900 tracking-wider mt-0.5">
                8830-192-881
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">a.n. Ibu Hj. Syantika</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
              Terkonfirmasi
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Utilitas & Simulasi Demo */}
      <Card className="card-shadow border-amber-200/80 bg-amber-50/20">
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Utilitas & Simulasi Demo</span>
            </CardTitle>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
              Demo Tool
            </span>
          </div>
          <CardDescription className="text-xs text-slate-600 leading-relaxed mt-1">
            Kembalikan seluruh data transaksi, unggahan bukti, verifikasi, dan status tagihan ke kondisi awal data benih (seed).
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsResetDialogOpen(true)}
            className="w-full h-10 text-xs font-bold text-amber-800 border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 gap-2 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>Reset Mock Data ke Kondisi Awal</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="w-full h-10 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar dari Akun (Logout)</span>
          </Button>
        </CardContent>
      </Card>

      {/* Modal Dialog Konfirmasi Reset Mock Data */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="max-w-md p-5 sm:p-6">
          <DialogHeader className="text-left pb-3 space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-slate-900">
                  Reset Data Demo ke Kondisi Awal?
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Konfirmasi pengembalian seluruh status simulasi lokal
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 text-xs text-slate-600 pt-1">
            <p className="leading-relaxed">
              Tindakan ini akan mengembalikan seluruh perubahan, persetujuan pembayaran, bukti transfer baru, dan pelunasan uang tunai ke <strong>data benih bawaan Kost Syantika</strong>.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5 text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kondisi Awal Setelah Reset:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600 pt-0.5">
                <li>Kamar 102 & 107: Menunggu Verifikasi Bukti</li>
                <li>Kamar 103, 106, 108: Lunas</li>
                <li>Kamar 104: Ditolak (Perlu Unggah Ulang)</li>
                <li>Kamar 101 & 105: Belum Bayar</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetDialogOpen(false)}
              className="flex-1 h-10 text-xs font-semibold border-slate-200 text-slate-700 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReset}
              className="flex-1 h-10 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
            >
              Ya, Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

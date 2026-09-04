"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Smartphone,
  Sparkles,
  ShieldCheck,
  Building2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function HomePage() {
  const [testInput, setTestInput] = useState("");

  const handleTriggerToast = () => {
    toast.success("Sistem PWA & Desain Kost Syantika Aktif!", {
      description: "Fondasi mobile-first dan komponen siap digunakan.",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-start py-6 px-4 safe-bottom safe-top">
      {/* Mobile container constraint */}
      <div className="w-full max-w-md flex flex-col space-y-5">
        {/* Top App Bar / Brand Header */}
        <header className="flex items-center justify-between pb-2 border-b border-emerald-100">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-tight">
                Kost Syantika
              </h1>
              <p className="text-xs font-medium text-emerald-700">
                Manajemen Pembayaran Kost
              </p>
            </div>
          </div>
          <Badge variant="lunas" className="gap-1 py-1 px-2.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            PWA Ready
          </Badge>
        </header>

        {/* Hero Card - Duolingo/Mamikos Fresh Aesthetic */}
        <Card className="border-emerald-100 bg-linear-to-br from-emerald-500/10 via-white to-emerald-50 card-shadow overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Fondasi Desain Fase 1
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <CardTitle className="text-xl font-black text-slate-900">
              Antarmuka Mobile-First PWA
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs sm:text-sm">
              Sistem visual hijau segar terinspirasi Mamikos & Duolingo,
              komponen sentuh responsif, dan konfigurasi Web App Manifest aktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-white/80 rounded-xl border border-emerald-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs text-slate-700">
                Mendukung <strong>Add to Home Screen</strong>, navigasi instan, dan
                standarisasi status pembayaran sewa kamar.
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="emerald"
              className="w-full gap-2 font-semibold shadow-md shadow-emerald-600/20"
              onClick={handleTriggerToast}
            >
              <Sparkles className="w-4 h-4" />
              Tes Interaksi Sonner Toast
            </Button>
          </CardFooter>
        </Card>

        {/* Section: Status Badges Showcase */}
        <Card className="card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Status Pembayaran Tagihan
            </CardTitle>
            <CardDescription className="text-xs">
              Empat status standar sesuai kamus domain `CONTEXT.md`
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Kamar 101</span>
                <Badge variant="belumbayar">Belum Bayar</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Kamar 102</span>
                <Badge variant="pending">Menunggu Verifikasi</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Kamar 103</span>
                <Badge variant="lunas">Lunas</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">Kamar 104</span>
                <Badge variant="ditolak">Ditolak</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section: Primitives Demo (Input, Button Variants, Modal) */}
        <Card className="card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Komponen Primitif Reusable
            </CardTitle>
            <CardDescription className="text-xs">
              Uji responsivitas sentuhan pada form input dan dialog modal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Cari Nomor Kamar / Penghuni
              </label>
              <Input
                placeholder="Contoh: 101 atau Budi..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>Pratinjau Komponen Dialog Modal</span>
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pratinjau Modal Responsif</DialogTitle>
                    <DialogDescription>
                      Dialog modal terpasang dengan backdrop blur dan transisi ramah
                      perangkat bergerak (touch-friendly).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      101
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        Tagihan Sewa Kamar 101
                      </p>
                      <p className="text-xs text-emerald-700">
                        Rp 1.500.000 (Bulan September 2026)
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="emerald" className="w-full sm:w-auto">
                        Tutup Pratinjau
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-0 border-t border-slate-100">
            <Button variant="secondary" size="sm" className="w-full">
              Tombol Sekunder
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Tombol Garis Luar
            </Button>
          </CardFooter>
        </Card>

        {/* Footer Note */}
        <footer className="text-center py-4 text-xs text-slate-400">
          <p>Kost Syantika PWA © 2026 • Dirancang untuk Penghuni & Pemilik Kost</p>
        </footer>
      </div>
    </main>
  );
}

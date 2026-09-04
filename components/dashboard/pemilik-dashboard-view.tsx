"use client";

import React from "react";
import { ShieldCheck, TrendingUp, Sparkles, Building2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserSession } from "@/types/auth";
import { PemilikSummaryCards } from "./pemilik-summary-cards";
import { PemilikVerifikasiAntrean } from "./pemilik-verifikasi-antrean";
import { PemilikDaftarKamar } from "./pemilik-daftar-kamar";

interface PemilikDashboardViewProps {
  user: UserSession;
}

export function PemilikDashboardView({ user }: PemilikDashboardViewProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Welcome Banner Card */}
      <Card className="border-emerald-100 bg-linear-to-br from-emerald-500/10 via-white to-emerald-50/50 card-shadow overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-3 -mr-3 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        <CardHeader className="pb-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Panel Pengelola Properti
            </span>
            <Badge variant="lunas" className="text-[10px]">
              Sesi Aktif
            </Badge>
          </div>
          <CardTitle className="text-lg font-black text-slate-900">
            Selamat Datang, {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-slate-600">
            Pantau ringkasan keuangan dan verifikasi bukti pembayaran sewa 8 kamar Kost Syantika untuk periode September 2026.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-3">
          <div className="p-2.5 bg-white/90 rounded-xl border border-emerald-100/80 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-slate-800">
                8 Unit Kamar Aktif (101 - 108)
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              Sep 2026
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 1. Ringkasan Metrik Keuangan */}
      <PemilikSummaryCards />

      {/* 2. Antrean Verifikasi Bukti Pembayaran */}
      <PemilikVerifikasiAntrean />

      {/* 3. Daftar Seluruh Kamar & Filter Status */}
      <PemilikDaftarKamar />
    </div>
  );
}

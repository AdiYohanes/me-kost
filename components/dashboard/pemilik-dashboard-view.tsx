"use client";

import React from "react";
import { ShieldCheck, Building2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserSession } from "@/types/auth";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { PemilikSummaryCards } from "./pemilik-summary-cards";
import { PemilikVerifikasiAntrean } from "./pemilik-verifikasi-antrean";
import { PemilikDaftarKamar } from "./pemilik-daftar-kamar";
import { PengaturanProfilView } from "./pengaturan-profil-view";
import { useSupabaseRealtime } from "@/lib/hooks/use-supabase-realtime";

interface PemilikDashboardViewProps {
  user: UserSession;
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export function PemilikDashboardView({
  user,
  activeTab = "ringkasan",
}: PemilikDashboardViewProps) {
  const { activePeriode } = usePaymentStore();
  const currentPeriodeLabel = activePeriode?.periodeBulan || "September 2026";

  // Langganan pembaruan Supabase Realtime via WebSocket
  useSupabaseRealtime({ role: "PEMILIK" });

  if (activeTab === "pengaturan") {
    return <PengaturanProfilView user={user} />;
  }

  if (activeTab === "kamar") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PemilikDaftarKamar />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner Card */}
      <Card className="card-shadow border-zinc-200 bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
              Panel Pengelola Properti
            </span>
            <Badge variant="lunas" className="text-xs font-medium">
              Sesi Aktif
            </Badge>
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-zinc-950 mt-1">
            Selamat Datang, {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-600 mt-0.5">
            Pantau ringkasan keuangan dan verifikasi bukti pembayaran sewa periode {currentPeriodeLabel}.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-3">
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between gap-2 text-xs text-zinc-700">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-md bg-zinc-900 text-white flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-zinc-900 truncate">
                8 Unit Kamar Aktif (101 - 108)
              </span>
            </div>
            <span className="text-xs font-semibold text-zinc-700 bg-white px-2.5 py-0.5 rounded-md border border-zinc-200 tabular-nums shrink-0 whitespace-nowrap">
              {currentPeriodeLabel}
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

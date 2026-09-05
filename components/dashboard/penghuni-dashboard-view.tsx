"use client";

import React from "react";
import { DoorClosed, Calendar } from "lucide-react";
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
import { PenghuniTagihanCard } from "@/components/dashboard/penghuni-tagihan-card";
import { PenghuniRiwayatPembayaran } from "@/components/dashboard/penghuni-riwayat-pembayaran";
import { PengaturanProfilView } from "@/components/dashboard/pengaturan-profil-view";

interface PenghuniDashboardViewProps {
  user: UserSession;
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export function PenghuniDashboardView({
  user,
  activeTab = "tagihan",
}: PenghuniDashboardViewProps) {
  const { activePeriode } = usePaymentStore();
  const currentPeriodeLabel = activePeriode?.periodeBulan || "September 2026";

  if (activeTab === "pengaturan") {
    return <PengaturanProfilView user={user} />;
  }

  if (activeTab === "riwayat") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PenghuniRiwayatPembayaran user={user} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Greeting & Room Card */}
      <Card className="border-emerald-100 bg-linear-to-br from-emerald-500/10 via-white to-emerald-50/50 card-shadow overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-emerald-500/10 rounded-full blur-lg pointer-events-none" />
        <CardHeader className="p-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <DoorClosed className="w-3.5 h-3.5" />
              Kamar {user.nomorKamar}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] border-emerald-300 text-emerald-800 font-semibold"
            >
              Penghuni Aktif
            </Badge>
          </div>
          <CardTitle className="text-lg font-black text-slate-900 mt-1">
            Halo, {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-slate-600 mt-1">
            {user.tipeKamar || "Kamar Kost Syantika"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="flex items-center gap-2.5 p-3.5 bg-white/90 rounded-xl border border-emerald-100/80 text-xs text-slate-700 shadow-2xs">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Periode Sewa Aktif: <strong>{currentPeriodeLabel}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Bill Card */}
      <PenghuniTagihanCard user={user} />

      {/* Historical Payments Section */}
      <PenghuniRiwayatPembayaran user={user} />
    </div>
  );
}

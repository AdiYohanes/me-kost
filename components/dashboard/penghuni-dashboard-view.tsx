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
      <Card className="card-shadow border-zinc-200 bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <DoorClosed className="w-3.5 h-3.5 text-zinc-700" />
              Kamar {user.nomorKamar}
            </span>
            <Badge
              variant="outline"
              className="text-xs border-zinc-200 text-zinc-800 font-medium"
            >
              Penghuni Aktif
            </Badge>
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-zinc-950 mt-1">
            Halo, {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-600 mt-0.5">
            {user.tipeKamar || "Kamar Me Kost"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-3">
          <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-700">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs text-zinc-700">
              Periode Sewa Aktif: <strong className="text-zinc-950 font-semibold">{currentPeriodeLabel}</strong>
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

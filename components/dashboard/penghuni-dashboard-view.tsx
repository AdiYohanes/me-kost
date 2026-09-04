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
import { PenghuniTagihanCard } from "@/components/dashboard/penghuni-tagihan-card";
import { PenghuniRiwayatPembayaran } from "@/components/dashboard/penghuni-riwayat-pembayaran";

interface PenghuniDashboardViewProps {
  user: UserSession;
}

export function PenghuniDashboardView({ user }: PenghuniDashboardViewProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Greeting & Room Card */}
      <Card className="border-emerald-100 bg-linear-to-br from-emerald-500/10 via-white to-emerald-50/50 card-shadow overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-emerald-500/10 rounded-full blur-lg pointer-events-none" />
        <CardHeader className="pb-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <DoorClosed className="w-3.5 h-3.5" />
              Kamar {user.nomorKamar}
            </span>
            <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-800">
              Penghuni Aktif
            </Badge>
          </div>
          <CardTitle className="text-lg font-black text-slate-900">
            Halo, {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-slate-600">
            {user.tipeKamar || "Kamar Kost Syantika"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 p-2.5 bg-white/90 rounded-xl border border-emerald-100/80 text-xs text-slate-700">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Periode Sewa Aktif: <strong>September 2026</strong>
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

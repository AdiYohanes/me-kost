"use client";

import React from "react";
import { CheckCircle2, Clock, XCircle, Wallet, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePaymentStore } from "@/lib/store/use-payment-store";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PemilikSummaryCards() {
  const { tagihanList, activePeriode } = usePaymentStore();

  const currentBulan = activePeriode?.bulan ?? 9;
  const currentTahun = activePeriode?.tahun ?? 2026;
  const currentLabel = activePeriode?.periodeBulan ?? "Sep 2026";

  // Filter tagihan aktif periode terpilih
  const tagihanAktif = tagihanList.filter(
    (t) => t.bulan === currentBulan && t.tahun === currentTahun
  );

  const kamarLunas = tagihanAktif.filter((t) => t.status === "LUNAS").length;
  const kamarBelumLunas = tagihanAktif.filter((t) => t.status !== "LUNAS").length;
  const perluVerifikasi = tagihanAktif.filter(
    (t) => t.status === "MENUNGGU_VERIFIKASI"
  ).length;

  const totalPenerimaan = tagihanAktif
    .filter((t) => t.status === "LUNAS")
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPotensi = tagihanAktif.reduce(
    (acc, curr) => acc + curr.nominal,
    0
  );

  return (
    <div className="space-y-4">
      {/* Kartu Utama: Penerimaan Terkumpul & Estimasi Potensi */}
      <Card className="border-emerald-200/80 bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md shadow-emerald-900/10 overflow-hidden relative">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100">
              <Wallet className="w-4 h-4 text-emerald-200" />
              <span>Penerimaan Terkumpul</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/40 text-emerald-100">
              {currentLabel}
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {formatRupiah(totalPenerimaan)}
            </h2>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-100/90 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                Dari potensi {formatRupiah(totalPotensi)} ({Math.round((totalPenerimaan / (totalPotensi || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid 3 Metrik: Lunas, Belum Lunas, Perlu Verifikasi */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-lg sm:text-xl font-black text-emerald-600 leading-tight">
            {kamarLunas}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Kamar Lunas
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-0.5">
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <span className="text-lg sm:text-xl font-black text-slate-800 leading-tight">
            {kamarBelumLunas}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            Belum Lunas
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-amber-200/80 bg-amber-50/40 shadow-xs flex flex-col items-center justify-center text-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <span className="text-lg sm:text-xl font-black text-amber-600 leading-tight">
            {perluVerifikasi}
          </span>
          <span className="text-[11px] font-semibold text-amber-800">
            Perlu Verifikasi
          </span>
        </div>
      </div>
    </div>
  );
}

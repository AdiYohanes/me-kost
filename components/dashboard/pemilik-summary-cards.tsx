"use client";

import React from "react";
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

  const percentage = Math.round((totalPenerimaan / (totalPotensi || 1)) * 100);

  return (
    <div className="space-y-3">
      {/* High-Density Ledger Card: Penerimaan Terkumpul */}
      <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 card-shadow">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Penerimaan Terkumpul
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 tabular-nums">
            {currentLabel}
          </span>
        </div>

        <div className="mt-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 tabular-nums">
              {formatRupiah(totalPenerimaan)}
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 shrink-0 tabular-nums">
              {percentage}% Lunas
            </span>
          </div>

          <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-zinc-500 font-medium">
            <span>Target: {formatRupiah(totalPotensi)}</span>
            <span>Total 8 Kamar</span>
          </div>
        </div>

        {/* 3-Column Structured Ledger Row */}
        <div className="grid grid-cols-3 gap-0 mt-4 pt-3.5 border-t border-zinc-100 text-center divide-x divide-zinc-100">
          <div className="px-2 py-1">
            <span className="text-lg sm:text-xl font-black text-emerald-600 block tabular-nums leading-tight">
              {kamarLunas}
            </span>
            <span className="text-xs font-medium text-zinc-500 mt-0.5 block">
              Kamar Lunas
            </span>
          </div>

          <div className="px-2 py-1">
            <span className="text-lg sm:text-xl font-black text-zinc-800 block tabular-nums leading-tight">
              {kamarBelumLunas}
            </span>
            <span className="text-xs font-medium text-zinc-500 mt-0.5 block">
              Belum Lunas
            </span>
          </div>

          <div className="px-2 py-1">
            <span className="text-lg sm:text-xl font-black text-amber-600 block tabular-nums leading-tight">
              {perluVerifikasi}
            </span>
            <span className="text-xs font-bold text-amber-800 mt-0.5 block">
              Perlu Verifikasi
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

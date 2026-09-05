"use client";

import React from "react";
import {
  LayoutDashboard,
  Building2,
  Settings,
  Receipt,
  History,
} from "lucide-react";
import { usePaymentStore } from "@/lib/store/use-payment-store";

interface BottomNavProps {
  role: "PEMILIK" | "PENGHUNI";
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function BottomNav({ role, activeTab, onTabChange }: BottomNavProps) {
  const { tagihanList, activePeriode } = usePaymentStore();

  const currentBulan = activePeriode?.bulan ?? 9;
  const currentTahun = activePeriode?.tahun ?? 2026;

  // Hitung jumlah verifikasi antrean untuk lencana Pemilik
  const pendingCount = tagihanList.filter(
    (t) =>
      t.status === "MENUNGGU_VERIFIKASI" &&
      t.bulan === currentBulan &&
      t.tahun === currentTahun
  ).length;

  const pemilikTabs = [
    {
      id: "ringkasan",
      label: "Ringkasan",
      icon: LayoutDashboard,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: "kamar",
      label: "Daftar Kamar",
      icon: Building2,
      badge: null,
    },
    {
      id: "pengaturan",
      label: "Pengaturan",
      icon: Settings,
      badge: null,
    },
  ];

  const penghuniTabs = [
    {
      id: "tagihan",
      label: "Tagihan",
      icon: Receipt,
      badge: null,
    },
    {
      id: "riwayat",
      label: "Riwayat",
      icon: History,
      badge: null,
    },
    {
      id: "pengaturan",
      label: "Pengaturan",
      icon: Settings,
      badge: null,
    },
  ];

  const tabs = role === "PEMILIK" ? pemilikTabs : penghuniTabs;

  return (
    <nav
      aria-label="Navigasi Utama Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-zinc-200 safe-bottom"
    >
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors select-none cursor-pointer touch-manipulation group ${
                isActive
                  ? "text-zinc-950 font-semibold"
                  : "text-zinc-400 hover:text-zinc-700 font-medium"
              }`}
            >
              {/* Active top hairline indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-600 rounded-full" />
              )}
              <div className="relative flex items-center justify-center w-8 h-6 transition-transform">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-emerald-600 stroke-[2.2]" : "text-zinc-400 group-hover:text-zinc-600 stroke-[1.75]"
                  }`}
                />
                {tab.badge !== null && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[15px] h-3.5 rounded-full bg-amber-500 text-[10px] font-bold text-white font-mono tabular-nums flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 ${
                  isActive ? "text-zinc-950 font-semibold" : "text-zinc-400 group-hover:text-zinc-600"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

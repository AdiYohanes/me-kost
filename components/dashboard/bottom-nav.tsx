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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] safe-bottom"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all select-none cursor-pointer touch-manipulation group ${
                isActive
                  ? "text-emerald-700 font-bold"
                  : "text-slate-600 hover:text-slate-800 font-medium"
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-12 h-7.5 rounded-full transition-all ${
                  isActive
                    ? "bg-emerald-100/80 text-emerald-700 scale-105"
                    : "text-slate-600 group-hover:bg-slate-100/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.badge !== null && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[16px] h-4 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center shadow-xs animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

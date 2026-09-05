"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PemilikDashboardView } from "@/components/dashboard/pemilik-dashboard-view";
import { PenghuniDashboardView } from "@/components/dashboard/penghuni-dashboard-view";
import { BottomNav } from "@/components/dashboard/bottom-nav";

function DashboardContent() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>(
    user?.role === "PEMILIK" ? "ringkasan" : "tagihan"
  );

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 pb-32 sm:px-6 safe-top">
      <div className="w-full max-w-md flex flex-col space-y-6">
        {/* Top App Bar & Profile Header */}
        <DashboardHeader user={user} />

        {/* Dynamic Role View */}
        {user.role === "PEMILIK" ? (
          <PemilikDashboardView
            user={user}
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
          />
        ) : (
          <PenghuniDashboardView
            user={user}
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Footer info */}
        <footer className="text-center py-6 text-[11px] text-slate-400">
          <p>Kost Syantika PWA © 2026 • Terkoneksi Sesi Lokal</p>
        </footer>

        {/* Mobile-first Bottom Navigation */}
        <BottomNav
          role={user.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

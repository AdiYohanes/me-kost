"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PemilikDashboardView } from "@/components/dashboard/pemilik-dashboard-view";
import { PenghuniDashboardView } from "@/components/dashboard/penghuni-dashboard-view";

function DashboardContent() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-start p-4 safe-top safe-bottom">
      <div className="w-full max-w-md flex flex-col space-y-4">
        {/* Top App Bar & Profile Header */}
        <DashboardHeader user={user} />

        {/* Dynamic Role View */}
        {user.role === "PEMILIK" ? (
          <PemilikDashboardView user={user} />
        ) : (
          <PenghuniDashboardView user={user} />
        )}

        {/* Footer info */}
        <footer className="text-center py-4 text-[11px] text-slate-400">
          <p>Kost Syantika PWA © 2026 • Terkoneksi Sesi Lokal</p>
        </footer>
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

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, LogOut, ShieldCheck, DoorClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { UserSession } from "@/types/auth";

interface DashboardHeaderProps {
  user: UserSession;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info("Anda telah keluar.", {
      description: "Sesi berhasil dibersihkan.",
    });
    router.replace("/login");
  };

  const isPemilik = user.role === "PEMILIK";

  return (
    <header className="flex items-center justify-between pt-1 sm:pt-1.5 pb-3.5 mb-2 border-b border-zinc-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shrink-0 shadow-2xs">
          <Building2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h1 className="text-sm font-black tracking-tight text-zinc-950 leading-none">
              Me Kost
            </h1>
            {isPemilik ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Pemilik Kost</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                <DoorClosed className="w-3 h-3 text-zinc-600" />
                <span>Kamar {user.nomorKamar}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-normal truncate max-w-[170px] sm:max-w-[220px]">
            {user.name}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="text-xs text-zinc-700 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950 gap-1.5 h-8 px-2.5 font-medium rounded-md cursor-pointer transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Keluar</span>
      </Button>
    </header>
  );
}

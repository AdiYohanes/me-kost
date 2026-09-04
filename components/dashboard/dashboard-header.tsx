"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, LogOut, ShieldCheck, DoorClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <header className="flex items-center justify-between pb-3 border-b border-slate-200/80">
      <div className="flex items-center space-x-2.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
              Kost Syantika
            </h1>
            {isPemilik ? (
              <Badge variant="lunas" className="text-[10px] py-0 px-1.5 h-4 gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                Pemilik Kost
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-emerald-300 text-emerald-800 font-semibold gap-0.5">
                <DoorClosed className="w-2.5 h-2.5" />
                Kamar {user.nomorKamar}
              </Badge>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-500 truncate max-w-[170px] sm:max-w-[220px]">
            {user.name}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 gap-1.5 h-8 px-2.5"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Keluar</span>
      </Button>
    </header>
  );
}

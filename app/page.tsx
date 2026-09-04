"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { Building2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 safe-top safe-bottom">
      <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 animate-pulse">
        <Building2 className="w-6 h-6" />
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-500 animate-pulse">
        Mengarahkan ke Kost Syantika...
      </p>
    </main>
  );
}

"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { Building2 } from "lucide-react";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const isMounted = useIsMounted();

  const isAuth = isMounted && isAuthenticated && !!user;

  useEffect(() => {
    if (isMounted && (!isAuthenticated || !user)) {
      router.replace("/login");
    }
  }, [isMounted, isAuthenticated, user, router]);

  if (!isAuth) {
    return (
      <div
        data-testid="auth-loading"
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 safe-top safe-bottom"
      >
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 animate-pulse">
          <Building2 className="w-6 h-6" />
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-500 animate-pulse">
          Memeriksa sesi pengguna...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

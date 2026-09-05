"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
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
  const { isAuthenticated, user, syncSupabaseSession } = useAuthStore();
  const isMounted = useIsMounted();
  const [isSyncing, setIsSyncing] = useState(false);

  const isAuth = isMounted && isAuthenticated && !!user;

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!isMounted) return;

      if (!isAuthenticated || !user) {
        setIsSyncing(true);
        try {
          const syncedUser = await syncSupabaseSession();
          if (cancelled) return;
          if (!syncedUser) {
            router.replace("/login");
          }
        } catch {
          if (!cancelled) {
            router.replace("/login");
          }
        } finally {
          if (!cancelled) {
            setIsSyncing(false);
          }
        }
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [isMounted, isAuthenticated, user, syncSupabaseSession, router]);

  if (!isAuth || isSyncing) {
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

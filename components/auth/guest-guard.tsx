"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/use-auth-store";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const isMounted = useIsMounted();

  useEffect(() => {
    if (isMounted && isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isMounted, isAuthenticated, user, router]);

  if (!isMounted) {
    return null;
  }

  if (isAuthenticated && user) {
    return null;
  }

  return <>{children}</>;
}

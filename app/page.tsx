"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { AnimatedKostLoader } from "@/components/ui/animated-kost-loader";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Jika sesi login aktif sudah ada, otomatis arahkan ke dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleGoToLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/login");
    }, 750);
  };

  return (
    <main className="min-h-screen bg-zinc-950 flex justify-center text-white safe-top safe-bottom relative overflow-hidden select-none">
      {/* Loading Overlay Transition ke Login with Animated SVG Kost */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-zinc-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="bg-zinc-900/95 border border-zinc-700/80 p-6 sm:p-7 rounded-3xl shadow-2xl flex flex-col items-center space-y-3.5 max-w-xs w-full text-center"
            >
              <AnimatedKostLoader />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white tracking-tight">
                  Membuka Pintu Kost...
                </p>
                <p className="text-xs text-zinc-400">
                  Menyiapkan sesi login Me Kost...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-first Immersive Container: All content anchored at bottom for expansive background display */}
      <div className="w-full max-w-md min-h-screen relative flex flex-col justify-end p-5 sm:p-6 pb-8 sm:pb-10 z-10">
        {/* Background Building Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/images/me-kost-building.jpg"
            alt="Gedung Me Kost Modern Tropis"
            fill
            priority
            className="object-cover object-top sm:object-center"
          />
          {/* Smooth gradient from bottom so top 60-70% of building remains clear and grand */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 via-45% to-transparent to-75%" />
        </div>

        {/* Bottom Hero & Modern CTA Section */}
        <div className="relative z-10 flex flex-col space-y-4">
          {/* Brand Identity & Title */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-xl border border-white/20 flex items-center justify-center shrink-0">
                <Image
                  src="/images/me-kost-logo.png"
                  alt="Logo Me Kost"
                  width={44}
                  height={44}
                  priority
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                  Syantika Kost
                </h1>
                <p className="text-xs font-semibold text-emerald-400 tracking-wide mt-1">
                  Kost Eksklusif • Jl. Melati No. 15
                </p>
              </div>
            </div>

            <p className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              Kelola & Bayar Sewa <span className="text-emerald-400">Lebih Praktis.</span>
            </p>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-sm">
              Portal pembayaran digital dan verifikasi sewa bulanan antara Pemilik Kost dan Penghuni Kamar 101 – 108.
            </p>
          </div>

          {/* Modern Full-Width Thumb-Friendly CTA */}
          <div className="space-y-2.5 pt-1">
            <Button
              type="button"
              onClick={handleGoToLogin}
              disabled={isTransitioning}
              className="w-full h-12 sm:h-13 text-sm font-bold bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              {isTransitioning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Membuka pintu...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Akses Khusus Pemilik & Penghuni Syantika Kost</span>
            </div>
          </div>

          {/* Minimalist Footer */}
          <footer className="text-center text-xs text-zinc-500 pt-1">
            <p>Syantika Kost • Powered by Me Kost PWA</p>
          </footer>
        </div>
      </div>
    </main>
  );
}

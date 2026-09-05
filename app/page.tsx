"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Wifi,
  ShieldCheck,
  Sparkles,
  Receipt,
  Loader2,
  MapPin,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/use-auth-store";

interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  category: string;
  description: string;
  highlight: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "facade",
    image: "/images/kost-syantika.jpg",
    title: "Fasad Modern Tropis",
    category: "Gedung Utama",
    description:
      "Desain dua lantai arsitektural asri dengan sirkulasi udara optimal dan pencahayaan alami.",
    highlight: "8 Unit Kamar Terawat",
  },
  {
    id: "room",
    image: "/images/kost-syantika-room.jpg",
    title: "Kamar Deluxe Nyaman",
    category: "Interior Kamar",
    description:
      "Ranjang jati minimalis, meja kerja ergonomis, lemari pakaian, dan pendingin ruangan AC.",
    highlight: "Kamar Mandi Dalam & AC",
  },
  {
    id: "lounge",
    image: "/images/kost-syantika-lounge.jpg",
    title: "Pantry & Dapur Bersih",
    category: "Fasilitas Bersama",
    description:
      "Dapur bersama higienis dengan dispenser air minum, kulkas bersama, dan meja makan Skandinavia.",
    highlight: "Area Bersama 24 Jam",
  },
];

const HIGHLIGHTS = [
  {
    icon: Wifi,
    title: "WiFi 100 Mbps",
    desc: "Koneksi stabil di seluruh area",
  },
  {
    icon: ShieldCheck,
    title: "Keamanan 24 Jam",
    desc: "CCTV & akses gerbang tertata",
  },
  {
    icon: Sparkles,
    title: "Kebersihan Rutin",
    desc: "Area komunal terawat bersih",
  },
  {
    icon: Receipt,
    title: "Catatan Digital",
    desc: "Bukti bayar & status transparan",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Jika sesi login aktif sudah ada, otomatis arahkan ke dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide(
      (prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length
    );
  }, []);

  // Auto-advance carousel setiap 5 detik saat tidak di-hover
  useEffect(() => {
    if (isPaused) return;

    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPaused, handleNext]);

  const handleGoToLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/login");
    }, 450);
  };

  const activeSlideData = CAROUSEL_SLIDES[currentSlide];

  return (
    <main className="min-h-screen bg-zinc-50 flex flex-col items-center justify-start px-4 py-6 sm:py-10 safe-top safe-bottom">
      {/* Loading Overlay Transition ke Login */}
      {isTransitioning && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex flex-col items-center justify-center animate-in fade-in duration-200"
        >
          <div className="bg-white p-5 rounded-xl border border-zinc-200 card-shadow flex flex-col items-center space-y-3 max-w-xs mx-4 text-center">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 text-emerald-400 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950">
                Membuka Portal Kost
              </p>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                Menyiapkan sesi login Kost Syantika...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col space-y-4">
        {/* Top Header Identity Bar */}
        <header className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-tight text-zinc-950 leading-none">
                  Kost Syantika
                </h1>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Resmi
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                <span>Jl. Melati No. 15</span>
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGoToLogin}
            disabled={isTransitioning}
            className="h-8 px-2.5 text-xs font-medium text-zinc-800 border-zinc-200 hover:bg-zinc-100 gap-1.5 rounded-md cursor-pointer transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-zinc-600" />
            <span>Masuk</span>
          </Button>
        </header>

        {/* Interactive Architectural Carousel Card */}
        <Card
          className="card-shadow border-zinc-200 bg-white overflow-hidden rounded-xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative aspect-16/9 w-full overflow-hidden bg-zinc-100 border-b border-zinc-200 select-none">
            {/* Slide Images */}
            {CAROUSEL_SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-linear-to-t from-zinc-950/70 via-transparent to-black/10" />
              </div>
            ))}

            {/* Overlaid Badges on Image */}
            <div className="absolute top-3 left-3 z-20">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-950/80 text-white font-mono text-[10px] tracking-wide backdrop-blur-xs border border-white/15">
                {activeSlideData.category}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-mono text-[10px] font-medium tracking-wide backdrop-blur-xs border border-emerald-400/20">
                {activeSlideData.highlight}
              </span>
            </div>

            {/* Previous & Next Navigation Buttons */}
            <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Slide sebelumnya"
                className="pointer-events-auto w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Slide berikutnya"
                className="pointer-events-auto w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-xs flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Indicators on Image */}
            <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5">
                {CAROUSEL_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Pilih slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide
                        ? "w-6 bg-emerald-400"
                        : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-zinc-200">
                0{currentSlide + 1} / 0{CAROUSEL_SLIDES.length}
              </span>
            </div>
          </div>

          {/* Slide Description Content */}
          <CardContent className="p-4 sm:p-5 space-y-1.5">
            <h2 className="text-sm font-bold text-zinc-950">
              {activeSlideData.title}
            </h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {activeSlideData.description}
            </p>
          </CardContent>
        </Card>

        {/* Feature Highlights Ledger Grid */}
        <div className="grid grid-cols-2 gap-2">
          {HIGHLIGHTS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-3 bg-white rounded-lg border border-zinc-200 card-shadow space-y-1"
              >
                <div className="flex items-center gap-1.5 text-zinc-900">
                  <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold truncate">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-500 leading-tight">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Polished Modern Simple CTA Section */}
        <Card className="card-shadow border-zinc-200 bg-white overflow-hidden rounded-xl">
          <CardContent className="p-4 sm:p-5 space-y-3.5 text-center">
            <div>
              <h3 className="text-sm font-bold text-zinc-950">
                Masuk ke Portal Sewa
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Akses khusus Pemilik Kost dan Penghuni Kamar 101 – 108 untuk verifikasi bukti transfer dan pelunasan.
              </p>
            </div>

            <Button
              type="button"
              onClick={handleGoToLogin}
              disabled={isTransitioning}
              className="w-full h-11 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
            >
              {isTransitioning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Menyiapkan sesi login...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Akun Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-400 pt-0.5">
              <span>Sistem Pembayaran PWA</span>
              <span>•</span>
              <span>Kost Syantika</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center py-2 text-[11px] font-mono text-zinc-400">
          <p>Kost Syantika PWA • Demo Fase 1</p>
        </footer>
      </div>
    </main>
  );
}

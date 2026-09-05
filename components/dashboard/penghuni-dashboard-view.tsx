"use client";

import React, { useEffect, useState } from "react";
import { DoorClosed, Calendar, AlertTriangle, Bell } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserSession } from "@/types/auth";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { hitungStatusTagihan } from "@/lib/siklus-tagihan";
import { formatNominalRupiah } from "@/lib/whatsapp";
import {
  registerServiceWorker,
  requestNotificationPermission,
  kirimNotifikasiLokal,
} from "@/lib/web-push";
import { PenghuniTagihanCard } from "@/components/dashboard/penghuni-tagihan-card";
import { PenghuniRiwayatPembayaran } from "@/components/dashboard/penghuni-riwayat-pembayaran";
import { PengaturanProfilView } from "@/components/dashboard/pengaturan-profil-view";
import { useSupabaseRealtime } from "@/lib/hooks/use-supabase-realtime";

interface PenghuniDashboardViewProps {
  user: UserSession;
  activeTab?: string;
  onNavigateTab?: (tab: string) => void;
}

export function PenghuniDashboardView({
  user,
  activeTab = "tagihan",
}: PenghuniDashboardViewProps) {
  const { activePeriode, sinkronisasiTagihanOtomatis, getTagihanAktifByKamar } =
    usePaymentStore();
  const currentPeriodeLabel = activePeriode?.periodeBulan || "September 2026";

  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );

  const nomorKamar = user.nomorKamar || user.kamarId || "101";

  // Langganan pembaruan Supabase Realtime untuk status tagihan penghuni
  useSupabaseRealtime({
    role: "PENGHUNI",
    nomorKamar,
    kamarId: user.kamarId,
  });

  const tagihanAktif = getTagihanAktifByKamar(nomorKamar);
  const evaluasi = tagihanAktif ? hitungStatusTagihan(tagihanAktif) : null;
  const isH3Aktif = Boolean(
    evaluasi?.isH3 &&
      tagihanAktif?.status !== "LUNAS" &&
      tagihanAktif?.status !== "MENUNGGU_VERIFIKASI"
  );

  useEffect(() => {
    sinkronisasiTagihanOtomatis();
  }, [sinkronisasiTagihanOtomatis]);

  // Daftarkan service worker dan kirim notifikasi lokal pengingat H-3 jika izin telah diberikan
  useEffect(() => {
    registerServiceWorker();

    if (isH3Aktif && tagihanAktif && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        kirimNotifikasiLokal({
          title: "Pengingat Jatuh Tempo Kost Syantika",
          body: `Tagihan Kamar ${nomorKamar} sebesar ${formatNominalRupiah(
            tagihanAktif.nominal
          )} akan jatuh tempo pada ${tagihanAktif.batasBayar}.`,
          tag: `h3-${tagihanAktif.id}`,
        });
      }
    }
  }, [isH3Aktif, tagihanAktif, nomorKamar, notificationPermission]);

  const handleRequestNotification = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      toast.success("Izin Notifikasi Diaktifkan!", {
        description: "Anda akan menerima pemberitahuan otomatis menjelang jatuh tempo.",
      });
      if (isH3Aktif && tagihanAktif) {
        kirimNotifikasiLokal({
          title: "Pengingat Jatuh Tempo Kost Syantika",
          body: `Tagihan Kamar ${nomorKamar} sebesar ${formatNominalRupiah(
            tagihanAktif.nominal
          )} akan jatuh tempo pada ${tagihanAktif.batasBayar}.`,
          tag: `h3-${tagihanAktif.id}`,
        });
      } else {
        kirimNotifikasiLokal({
          title: "Notifikasi Pengingat Aktif",
          body: `Pengingat otomatis aktif untuk Kamar ${nomorKamar}.`,
        });
      }
    } else {
      toast.info("Izin notifikasi tidak diberikan atau ditolak.");
    }
  };

  if (activeTab === "pengaturan") {
    return <PengaturanProfilView user={user} />;
  }

  if (activeTab === "riwayat") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PenghuniRiwayatPembayaran user={user} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Greeting & Room Card */}
      <Card className="card-shadow border-zinc-200 bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
              <DoorClosed className="w-3.5 h-3.5 text-zinc-700" />
              Kamar {user.nomorKamar}
            </span>
            <Badge
              variant="outline"
              className="text-xs border-zinc-200 text-zinc-800 font-medium"
            >
              Penghuni Aktif
            </Badge>
          </div>
          <CardTitle className="text-base sm:text-lg font-bold text-zinc-950 mt-1">
            Halo, {user.name}
          </CardTitle>
          <CardDescription className="text-xs text-zinc-600 mt-0.5">
            {user.tipeKamar || "Kamar Me Kost"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-3">
          <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs text-zinc-700">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs text-zinc-700">
              Periode Sewa Aktif:{" "}
              <strong className="text-zinc-950 font-semibold">
                {currentPeriodeLabel}
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Banner Pengingat Amber Mencolok (H-3 Jatuh Tempo) */}
      {isH3Aktif && tagihanAktif && evaluasi && (
        <div
          data-testid="banner-pengingat-h3"
          className="p-4 sm:p-4.5 rounded-xl bg-amber-50 border-2 border-amber-300/90 text-amber-950 space-y-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <span>Pengingat Jatuh Tempo (H-3)</span>
            </div>
            <Badge
              variant="pending"
              className="bg-amber-200/90 text-amber-900 border-amber-300 text-xs font-bold shrink-0"
            >
              {evaluasi.sisaHari === 0
                ? "Hari Ini"
                : `${evaluasi.sisaHari} Hari Lagi`}
            </Badge>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed font-normal">
            Tagihan sewa kamar Anda sebesar{" "}
            <strong className="font-bold text-amber-950">
              {formatNominalRupiah(tagihanAktif.nominal)}
            </strong>{" "}
            akan jatuh tempo pada{" "}
            <strong className="font-bold text-amber-950">
              {tagihanAktif.batasBayar}
            </strong>
            . Mohon segera lakukan pembayaran sebelum tanggal jatuh tempo.
          </p>

          {notificationPermission !== "granted" && (
            <div className="pt-1 flex items-center justify-between border-t border-amber-200/80">
              <span className="text-xs text-amber-800">
                Aktifkan notifikasi pengingat di HP Anda
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRequestNotification}
                className="h-7 px-2.5 text-xs font-semibold bg-white text-amber-900 border-amber-300 hover:bg-amber-100 gap-1 rounded-md cursor-pointer"
              >
                <Bell className="w-3 h-3 text-amber-700" />
                <span>Aktifkan Notifikasi</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Kartu Tagihan Aktif */}
      <PenghuniTagihanCard user={user} />

      {/* Historical Payments Section */}
      <PenghuniRiwayatPembayaran user={user} />
    </div>
  );
}

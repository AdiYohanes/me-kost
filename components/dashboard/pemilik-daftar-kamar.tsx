"use client";

import React, { useState } from "react";
import {
  Users,
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  CalendarPlus,
  Filter,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { Tagihan, StatusPembayaran } from "@/types/payment";
import { BuktiLightboxDialog } from "./bukti-lightbox-dialog";
import { TolakBuktiDialog } from "./tolak-bukti-dialog";
import { TandaiCashDialog } from "./tandai-cash-dialog";
import {
  BuatPeriodeTagihanDialog,
  UbahTarifKamarDialog,
} from "./kelola-tagihan-dialog";
import { formatRupiah } from "./pemilik-summary-cards";

type FilterType = "SEMUA" | StatusPembayaran;

export function PemilikDaftarKamar() {
  const {
    tagihanList,
    activePeriode,
    markCashTagihan,
    approveTagihan,
    rejectTagihan,
    updateNominalTagihan,
    buatTagihanPeriodeBaru,
  } = usePaymentStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("SEMUA");
  const [selectedTagihanForLightbox, setSelectedTagihanForLightbox] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForReject, setSelectedTagihanForReject] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForCash, setSelectedTagihanForCash] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForTarif, setSelectedTagihanForTarif] =
    useState<Tagihan | null>(null);
  const [isBuatPeriodeOpen, setIsBuatPeriodeOpen] = useState(false);

  const currentBulan = activePeriode?.bulan ?? 9;
  const currentTahun = activePeriode?.tahun ?? 2026;
  const currentPeriodeLabel = activePeriode?.periodeBulan ?? "September 2026";

  // Ambil tagihan aktif periode terpilih dan urutkan berdasarkan nomor kamar 101 - 108
  const tagihanAktif = tagihanList
    .filter((t) => t.bulan === currentBulan && t.tahun === currentTahun)
    .sort((a, b) => parseInt(a.nomorKamar, 10) - parseInt(b.nomorKamar, 10));

  // Hitung jumlah tiap kategori untuk badge tab filter
  const countLunas = tagihanAktif.filter((t) => t.status === "LUNAS").length;
  const countBelumBayar = tagihanAktif.filter(
    (t) => t.status === "BELUM_BAYAR"
  ).length;
  const countPending = tagihanAktif.filter(
    (t) => t.status === "MENUNGGU_VERIFIKASI"
  ).length;
  const countDitolak = tagihanAktif.filter((t) => t.status === "DITOLAK").length;

  const filteredList = tagihanAktif.filter((t) => {
    if (activeFilter === "SEMUA") return true;
    return t.status === activeFilter;
  });

  const handleConfirmCash = (tagihanId: string, catatan?: string) => {
    const target = tagihanList.find((t) => t.id === tagihanId);
    markCashTagihan(tagihanId, catatan);
    toast.success(
      `Pembayaran Tunai Kamar ${target?.nomorKamar || ""} Tercatat!`,
      {
        description: `Tagihan ${target?.penghuniNama || ""} berhasil ditandai Lunas (Cash).`,
      }
    );
    setSelectedTagihanForCash(null);
  };

  const handleConfirmUpdateTarif = (tagihanId: string, nominalBaru: number) => {
    const target = tagihanList.find((t) => t.id === tagihanId);
    updateNominalTagihan(tagihanId, nominalBaru);
    toast.success(
      `Tarif Kamar ${target?.nomorKamar || ""} Berhasil Diperbarui!`,
      {
        description: `Nominal sewa kini ${formatRupiah(nominalBaru)}.`,
      }
    );
    setSelectedTagihanForTarif(null);
  };

  const handleConfirmCreatePeriode = (data: {
    bulan: number;
    tahun: number;
    periodeBulan: string;
    batasBayar: string;
  }) => {
    buatTagihanPeriodeBaru(
      data.bulan,
      data.tahun,
      data.periodeBulan,
      data.batasBayar
    );
    toast.success(`Tagihan Periode ${data.periodeBulan} Berhasil Diterbitkan!`, {
      description: "Tagihan baru untuk 8 kamar siap ditagihkan kepada penghuni.",
    });
    setIsBuatPeriodeOpen(false);
  };

  const handleApprove = (tagihan: Tagihan) => {
    approveTagihan(tagihan.id);
    toast.success(`Pembayaran Kamar ${tagihan.nomorKamar} Berhasil Disetujui!`, {
      description: `Status tagihan ${tagihan.penghuniNama} telah diubah menjadi LUNAS.`,
    });
    if (selectedTagihanForLightbox?.id === tagihan.id) {
      setSelectedTagihanForLightbox(null);
    }
  };

  const handleConfirmReject = (alasan: string) => {
    if (!selectedTagihanForReject) return;
    const { id, nomorKamar, penghuniNama } = selectedTagihanForReject;
    rejectTagihan(id, alasan);
    toast.error(`Bukti Pembayaran Kamar ${nomorKamar} Ditolak`, {
      description: `Catatan penolakan telah dikirimkan ke ${penghuniNama}.`,
    });
    setSelectedTagihanForReject(null);
    if (selectedTagihanForLightbox?.id === id) {
      setSelectedTagihanForLightbox(null);
    }
  };

  const renderBadgeStatus = (tagihan: Tagihan) => {
    switch (tagihan.status) {
      case "LUNAS":
        return (
          <Badge variant="lunas" className="text-[10px] gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>
              Lunas {tagihan.metodePembayaran === "CASH" ? "(Tunai)" : "(Transfer)"}
            </span>
          </Badge>
        );
      case "MENUNGGU_VERIFIKASI":
        return (
          <Badge variant="pending" className="text-[10px] gap-1">
            <Clock className="w-3 h-3" />
            <span>Menunggu Verifikasi</span>
          </Badge>
        );
      case "DITOLAK":
        return (
          <Badge variant="ditolak" className="text-[10px]">
            Ditolak
          </Badge>
        );
      case "BELUM_BAYAR":
      default:
        return (
          <Badge variant="belumbayar" className="text-[10px]">
            Belum Bayar
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <Card className="card-shadow border-zinc-200 bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-zinc-100">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-700" />
                <span>Daftar Unit Kamar</span>
              </CardTitle>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                Unit 101 - 108 Kost Syantika • Periode {currentPeriodeLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBuatPeriodeOpen(true)}
                className="h-8 px-2.5 text-xs font-medium text-zinc-800 border-zinc-200 hover:bg-zinc-50 gap-1.5 rounded-md cursor-pointer"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Periode Baru</span>
              </Button>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                {filteredList.length} Kamar
              </span>
            </div>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-3 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter("SEMUA")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                activeFilter === "SEMUA"
                  ? "bg-zinc-900 text-white border-zinc-900 font-semibold"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border-zinc-200/80"
              }`}
            >
              Semua ({tagihanAktif.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("LUNAS")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                activeFilter === "LUNAS"
                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-200"
              }`}
            >
              Lunas ({countLunas})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("BELUM_BAYAR")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                activeFilter === "BELUM_BAYAR"
                  ? "bg-zinc-700 text-white border-zinc-700 font-semibold"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-200"
              }`}
            >
              Belum Bayar ({countBelumBayar})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("MENUNGGU_VERIFIKASI")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                activeFilter === "MENUNGGU_VERIFIKASI"
                  ? "bg-amber-600 text-white border-amber-600 font-semibold"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-200"
              }`}
            >
              Menunggu Verifikasi ({countPending})
            </button>

            {countDitolak > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("DITOLAK")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  activeFilter === "DITOLAK"
                    ? "bg-rose-600 text-white border-rose-600 font-semibold"
                    : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-200"
                }`}
              >
                Ditolak ({countDitolak})
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5 p-4 sm:p-5 pt-4">
          {filteredList.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs rounded-lg bg-zinc-50 border border-zinc-200">
              <Filter className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
              <p>Tidak ada kamar dengan filter status ini.</p>
            </div>
          ) : (
            filteredList.map((tagihan) => (
              <div
                key={tagihan.id}
                className="p-3 sm:p-3.5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {tagihan.nomorKamar}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950 leading-tight">
                        {tagihan.penghuniNama}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                        <span className="font-mono tabular-nums">{formatRupiah(tagihan.nominal)} / bln</span>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setSelectedTagihanForTarif(tagihan)}
                          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                          aria-label={`Ubah Tarif Kamar ${tagihan.nomorKamar}`}
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Ubah Tarif</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {renderBadgeStatus(tagihan)}
                  </div>
                </div>

                {/* Baris Aksi Kontekstual */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px]">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Jatuh tempo: {tagihan.batasBayar}
                  </span>

                  <div className="flex items-center gap-2">
                    {tagihan.status === "MENUNGGU_VERIFIKASI" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedTagihanForLightbox(tagihan)}
                        className="h-7.5 px-2.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1 rounded-md cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Periksa Bukti</span>
                      </Button>
                    )}

                    {(tagihan.status === "BELUM_BAYAR" ||
                      tagihan.status === "DITOLAK") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTagihanForCash(tagihan)}
                        className="h-7.5 px-2.5 text-xs font-medium text-zinc-800 border-zinc-200 hover:bg-zinc-50 gap-1.5 rounded-md cursor-pointer"
                      >
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tandai Lunas (Cash)</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal Tandai Lunas (Cash) */}
      <TandaiCashDialog
        isOpen={!!selectedTagihanForCash}
        onClose={() => setSelectedTagihanForCash(null)}
        tagihan={selectedTagihanForCash}
        onConfirmCash={handleConfirmCash}
      />

      {/* Modal Ubah Tarif Kamar */}
      <UbahTarifKamarDialog
        isOpen={!!selectedTagihanForTarif}
        onClose={() => setSelectedTagihanForTarif(null)}
        tagihan={selectedTagihanForTarif}
        onConfirmUpdate={handleConfirmUpdateTarif}
      />

      {/* Modal Buat Periode Tagihan Baru */}
      <BuatPeriodeTagihanDialog
        isOpen={isBuatPeriodeOpen}
        onClose={() => setIsBuatPeriodeOpen(false)}
        onConfirmCreate={handleConfirmCreatePeriode}
      />

      {/* Modal Lightbox saat dibuka dari daftar kamar */}
      <BuktiLightboxDialog
        isOpen={!!selectedTagihanForLightbox}
        onClose={() => setSelectedTagihanForLightbox(null)}
        tagihan={selectedTagihanForLightbox}
        onApprove={
          selectedTagihanForLightbox
            ? () => handleApprove(selectedTagihanForLightbox)
            : undefined
        }
        onReject={
          selectedTagihanForLightbox
            ? () => {
                const target = selectedTagihanForLightbox;
                setSelectedTagihanForLightbox(null);
                setSelectedTagihanForReject(target);
              }
            : undefined
        }
      />

      {/* Modal Tolak Bukti */}
      <TolakBuktiDialog
        isOpen={!!selectedTagihanForReject}
        onClose={() => setSelectedTagihanForReject(null)}
        tagihan={selectedTagihanForReject}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}

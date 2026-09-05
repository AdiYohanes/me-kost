"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { Tagihan } from "@/types/payment";
import { BuktiLightboxDialog } from "./bukti-lightbox-dialog";
import { TolakBuktiDialog } from "./tolak-bukti-dialog";
import { formatRupiah } from "./pemilik-summary-cards";

export function PemilikVerifikasiAntrean() {
  const { tagihanList, activePeriode, approveTagihan, rejectTagihan } =
    usePaymentStore();

  const [selectedTagihanForLightbox, setSelectedTagihanForLightbox] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForReject, setSelectedTagihanForReject] =
    useState<Tagihan | null>(null);

  const currentBulan = activePeriode?.bulan ?? 9;
  const currentTahun = activePeriode?.tahun ?? 2026;

  // Ambil seluruh tagihan aktif yang berstatus MENUNGGU_VERIFIKASI
  const antreanVerifikasi = tagihanList.filter(
    (t) =>
      t.status === "MENUNGGU_VERIFIKASI" &&
      t.bulan === currentBulan &&
      t.tahun === currentTahun
  );

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

  return (
    <div className="space-y-3">
      <Card className="card-shadow border-amber-200/80 bg-linear-to-b from-amber-50/30 to-white overflow-hidden">
        <CardHeader className="p-5 pb-3.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Antrean Verifikasi Bukti</span>
            </CardTitle>
            <Badge
              variant={antreanVerifikasi.length > 0 ? "pending" : "outline"}
              className="text-[10px] px-2.5 py-0.5"
            >
              {antreanVerifikasi.length > 0
                ? `${antreanVerifikasi.length} Menunggu`
                : "Kosong"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 space-y-3.5">
          {antreanVerifikasi.length === 0 ? (
            /* Empty State */
            <div className="py-8 px-5 text-center rounded-2xl bg-white border border-dashed border-emerald-200 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Semua Bukti Telah Diverifikasi
              </p>
              <p className="text-[11px] text-slate-500 max-w-[240px] mt-1">
                Tidak ada bukti transfer baru yang menunggu persetujuan Anda saat ini.
              </p>
            </div>
          ) : (
            /* List Antrean */
            <div className="space-y-3">
              {antreanVerifikasi.map((tagihan) => {
                const formattedUploadTime = tagihan.buktiPembayaran?.uploadedAt
                  ? new Date(tagihan.buktiPembayaran.uploadedAt).toLocaleString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : "-";

                return (
                  <div
                    key={tagihan.id}
                    className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-3 hover:border-amber-300 transition-colors"
                  >
                    {/* Header Item: Kamar, Nama, Waktu, Nominal */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
                          Kamar {tagihan.nomorKamar}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                            {tagihan.penghuniNama}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>Unggah: {formattedUploadTime}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-base font-black text-slate-900 block">
                          {formatRupiah(tagihan.nominal)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Sewa Bulanan
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail & Tenant Note */}
                    <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
                      {tagihan.buktiPembayaran && (
                        <div
                          onClick={() => setSelectedTagihanForLightbox(tagihan)}
                          className="w-14 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative group shadow-xs"
                          title="Klik untuk memperbesar bukti transfer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tagihan.buktiPembayaran.imageUrl}
                            alt={`Thumbnail bukti kamar ${tagihan.nomorKamar}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute right-1 bottom-1 bg-black/60 text-white rounded-full p-1 backdrop-blur-xs flex items-center justify-center">
                            <Eye className="w-3 h-3" />
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-slate-600 flex-1 min-w-0">
                        {tagihan.buktiPembayaran?.catatanPenghuni ? (
                          <p className="line-clamp-2 italic text-slate-700 font-medium leading-relaxed">
                            &ldquo;{tagihan.buktiPembayaran.catatanPenghuni}&rdquo;
                          </p>
                        ) : (
                          <p className="text-slate-400 text-[11px] italic">
                            Tidak ada catatan tambahan dari penghuni.
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setSelectedTagihanForLightbox(tagihan)}
                          className="h-auto p-0 text-[11px] text-emerald-600 font-bold hover:text-emerald-700 gap-1.5 mt-1.5 cursor-pointer inline-flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Bukti Ukuran Penuh</span>
                        </Button>
                      </div>
                    </div>

                    {/* Actions: Tolak vs Setujui */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100/80">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTagihanForReject(tagihan)}
                        className="flex-1 h-10 text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border-rose-200/90 gap-2 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Tolak</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApprove(tagihan)}
                        className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white gap-2 rounded-xl shadow-sm shadow-emerald-600/25 hover:shadow-md hover:shadow-emerald-600/30 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Setujui</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
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

      {/* Reject Modal */}
      <TolakBuktiDialog
        isOpen={!!selectedTagihanForReject}
        onClose={() => setSelectedTagihanForReject(null)}
        tagihan={selectedTagihanForReject}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}

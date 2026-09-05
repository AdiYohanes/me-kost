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
                    {/* Header Item: Kamar, Nama, Nominal */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                          <span className="text-[8px] uppercase tracking-wider font-semibold opacity-90 leading-tight">
                            Kamar
                          </span>
                          <span className="text-xs font-black leading-none">
                            {tagihan.nomorKamar}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-900 leading-tight">
                              Kamar {tagihan.nomorKamar} • {tagihan.penghuniNama}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Unggah: {formattedUploadTime}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 block">
                          {formatRupiah(tagihan.nominal)}
                        </span>
                        <Badge variant="pending" className="text-[9px] py-0 px-1.5 h-4 mt-0.5">
                          Perlu Verifikasi
                        </Badge>
                      </div>
                    </div>

                    {/* Thumbnail & Tenant Note */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50/90 rounded-xl border border-slate-100">
                      {tagihan.buktiPembayaran && (
                        <div
                          onClick={() => setSelectedTagihanForLightbox(tagihan)}
                          className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-900/5 shrink-0 cursor-pointer relative group"
                          title="Klik untuk memperbesar bukti transfer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tagihan.buktiPembayaran.imageUrl}
                            alt={`Thumbnail bukti kamar ${tagihan.nomorKamar}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-600 flex-1 min-w-0">
                        {tagihan.buktiPembayaran?.catatanPenghuni ? (
                          <p className="line-clamp-2 italic text-slate-700">
                            &ldquo;{tagihan.buktiPembayaran.catatanPenghuni}&rdquo;
                          </p>
                        ) : (
                          <p className="text-slate-400">
                            Tidak ada catatan tambahan dari penghuni.
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setSelectedTagihanForLightbox(tagihan)}
                          className="h-auto p-0 text-[10px] text-emerald-600 font-semibold gap-1 mt-1.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Bukti Ukuran Penuh</span>
                        </Button>
                      </div>
                    </div>

                    {/* Actions: Tolak vs Setujui */}
                    <div className="flex items-center gap-2.5 pt-2.5 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTagihanForReject(tagihan)}
                        className="flex-1 h-9 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApprove(tagihan)}
                        className="flex-1 h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
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

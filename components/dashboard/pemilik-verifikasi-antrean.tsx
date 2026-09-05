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
import { useOptimisticTagihanMutations } from "@/lib/hooks/use-payment-query";

export function PemilikVerifikasiAntrean() {
  const { tagihanList, approveTagihan, rejectTagihan } = usePaymentStore();
  const { verifikasiMutation, tolakMutation } = useOptimisticTagihanMutations();

  const [selectedTagihanForLightbox, setSelectedTagihanForLightbox] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForReject, setSelectedTagihanForReject] =
    useState<Tagihan | null>(null);

  // Ambil seluruh tagihan yang berstatus MENUNGGU_VERIFIKASI lintas siklus mandiri
  const antreanVerifikasi = tagihanList.filter(
    (t) => t.status === "MENUNGGU_VERIFIKASI"
  );

  const handleApprove = (tagihan: Tagihan) => {
    approveTagihan(tagihan.id);

    verifikasiMutation.mutate({
      tagihanId: tagihan.id,
      nomorKamar: tagihan.nomorKamar,
      penghuniNama: tagihan.penghuniNama,
    });

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

    tolakMutation.mutate({
      tagihanId: id,
      alasan,
      nomorKamar,
      penghuniNama,
    });

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
      <Card className="card-shadow border-zinc-200 bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Antrean Verifikasi Bukti</span>
            </CardTitle>
            <Badge
              variant={antreanVerifikasi.length > 0 ? "pending" : "outline"}
              className="text-xs font-medium tabular-nums px-2.5 py-0.5"
            >
              {antreanVerifikasi.length > 0
                ? `${antreanVerifikasi.length} Menunggu`
                : "Kosong"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-4 space-y-3">
          {antreanVerifikasi.length === 0 ? (
            /* Empty State */
            <div className="py-8 px-4 text-center rounded-lg bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-zinc-900">
                Semua Bukti Telah Diverifikasi
              </p>
              <p className="text-xs text-zinc-500 max-w-[240px] mt-1">
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
                    className="p-3.5 sm:p-4 bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors space-y-3"
                  >
                    {/* Header Item: Kamar, Nama, Waktu, Nominal */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-zinc-100 text-zinc-900 border border-zinc-200 shrink-0 tabular-nums">
                          Kamar {tagihan.nomorKamar}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-zinc-950 leading-snug truncate">
                            {tagihan.penghuniNama}
                          </h4>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                            <span>Unggah: {formattedUploadTime}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-zinc-950 block tabular-nums">
                          {formatRupiah(tagihan.nominal)}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          Sewa Bulanan
                        </span>
                      </div>
                    </div>

                    {/* Thumbnail & Catatan Penghuni */}
                    <div className="flex items-center gap-3 p-3 bg-zinc-50/80 rounded-lg border border-zinc-200/80 hover:bg-zinc-50 transition-colors">
                      {tagihan.buktiPembayaran && (
                        <div
                          onClick={() => setSelectedTagihanForLightbox(tagihan)}
                          className="w-12 h-14 rounded border border-zinc-200 overflow-hidden bg-zinc-100 shrink-0 cursor-pointer relative group"
                          title="Klik untuk memperbesar bukti transfer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={tagihan.buktiPembayaran.imageUrl}
                            alt={`Thumbnail bukti kamar ${tagihan.nomorKamar}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute right-1 bottom-1 bg-zinc-950/70 text-white rounded p-0.5 flex items-center justify-center">
                            <Eye className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-zinc-600 flex-1 min-w-0">
                        {tagihan.buktiPembayaran?.catatanPenghuni ? (
                          <p className="line-clamp-2 italic text-zinc-700 font-normal leading-relaxed text-xs">
                            &ldquo;{tagihan.buktiPembayaran.catatanPenghuni}&rdquo;
                          </p>
                        ) : (
                          <p className="text-zinc-400 text-xs italic">
                            Tidak ada catatan tambahan dari penghuni.
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setSelectedTagihanForLightbox(tagihan)}
                          className="h-auto p-0 text-xs text-emerald-700 font-medium hover:text-emerald-800 gap-1 mt-1 cursor-pointer inline-flex items-center"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Bukti Ukuran Penuh</span>
                        </Button>
                      </div>
                    </div>

                    {/* Actions: Tolak vs Setujui */}
                    <div className="flex items-center gap-2.5 pt-2.5 border-t border-zinc-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTagihanForReject(tagihan)}
                        className="flex-1 h-9 text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 border-zinc-200 hover:border-rose-200 gap-1.5 rounded-md active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Tolak</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleApprove(tagihan)}
                        className="flex-1 h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white gap-1.5 rounded-md shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
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

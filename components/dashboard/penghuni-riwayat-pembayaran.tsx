"use client";

import React, { useState } from "react";
import { History, Eye, CheckCircle2, Banknote } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { UserSession } from "@/types/auth";
import { Tagihan } from "@/types/payment";

interface PenghuniRiwayatPembayaranProps {
  user: UserSession;
}

export function PenghuniRiwayatPembayaran({ user }: PenghuniRiwayatPembayaranProps) {
  const kamarIdentifier = user.nomorKamar || user.kamarId || "101";
  const { getRiwayatTagihanByKamar } = usePaymentStore();
  const riwayatList = getRiwayatTagihanByKamar(kamarIdentifier);

  const [selectedTagihan, setSelectedTagihan] = useState<Tagihan | null>(null);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <>
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-600" />
              Riwayat Pembayaran
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200">
              {riwayatList.length} Bulan Terdahulu
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Catatan pelunasan sewa bulanan kamar Anda di Kost Syantika
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {riwayatList.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
              Belum ada riwayat pembayaran sebelumnya.
            </div>
          ) : (
            riwayatList.map((tagihan) => {
              const formattedDate = tagihan.paidAt
                ? new Date(tagihan.paidAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Terverifikasi";

              return (
                <div
                  key={tagihan.id}
                  className="p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-100 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {tagihan.periodeBulan}
                      </span>
                      <Badge variant="lunas" className="text-[10px] py-0 px-1.5 h-4">
                        Lunas
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {formatIDR(tagihan.nominal)}
                      </span>
                      <span>•</span>
                      <span>
                        {tagihan.metodePembayaran === "CASH" ? "Tunai (Cash)" : "Transfer"}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Lunas pada {formattedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {tagihan.buktiPembayaran?.imageUrl ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTagihan(tagihan)}
                        className="h-8 text-xs font-medium gap-1.5 px-2.5 border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Bukti</span>
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                        <Banknote className="w-3 h-3 text-slate-400" />
                        Tunai
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Modal Lightbox Bukti Riwayat */}
      <Dialog
        open={Boolean(selectedTagihan)}
        onOpenChange={(open) => !open && setSelectedTagihan(null)}
      >
        <DialogContent className="max-w-md p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-bold text-slate-900">
              Bukti Pembayaran - {selectedTagihan?.periodeBulan}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kamar {user.nomorKamar} • {formatIDR(selectedTagihan?.nominal || 0)}
            </DialogDescription>
          </DialogHeader>

          {selectedTagihan?.buktiPembayaran?.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-3/4 max-h-[65vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedTagihan.buktiPembayaran.imageUrl}
                alt="Bukti Transfer Riwayat"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Status Verifikasi</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lunas & Terverifikasi
              </span>
            </div>
            {selectedTagihan?.paidAt && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Waktu Pembayaran</span>
                <span className="text-slate-700">
                  {new Date(selectedTagihan.paidAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

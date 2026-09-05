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
      <Card className="card-shadow border-zinc-200 bg-white overflow-hidden">
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-zinc-700" />
              <span>Riwayat Pembayaran</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs font-medium text-zinc-600 border-zinc-200">
              {riwayatList.length} Bulan Terdahulu
            </Badge>
          </div>
          <CardDescription className="text-xs text-zinc-500 mt-1">
            Catatan pelunasan sewa bulanan kamar Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-4 space-y-2.5">
          {riwayatList.length === 0 ? (
            <div className="p-8 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500">
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
                  className="p-3 sm:p-3.5 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 truncate">
                        {tagihan.periodeBulan}
                      </span>
                      <Badge variant="lunas" className="text-xs font-medium py-0 px-2 h-5">
                        Lunas
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-semibold text-zinc-800 tabular-nums">
                        {formatIDR(tagihan.nominal)}
                      </span>
                      <span>•</span>
                      <span>
                        {tagihan.metodePembayaran === "CASH" ? "Tunai (Cash)" : "Transfer"}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400">
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
                        className="h-7 text-xs font-medium gap-1 px-2 border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-md cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat Bukti</span>
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200">
                        <Banknote className="w-3 h-3 text-zinc-400" />
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
        <DialogContent className="max-w-md p-5 sm:p-6">
          <DialogHeader className="pb-3 space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900">
              Bukti Pembayaran - {selectedTagihan?.periodeBulan}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kamar {user.nomorKamar} • {formatIDR(selectedTagihan?.nominal || 0)}
            </DialogDescription>
          </DialogHeader>

          {selectedTagihan?.buktiPembayaran?.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-3/4 max-h-[65vh] flex items-center justify-center my-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedTagihan.buktiPembayaran.imageUrl}
                alt="Bukti Transfer Riwayat"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Status Verifikasi</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lunas & Terverifikasi
              </span>
            </div>
            {selectedTagihan?.paidAt && (
              <div className="flex items-center justify-between text-xs">
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

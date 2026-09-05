"use client";

import React from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  DoorClosed,
  ZoomIn,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tagihan } from "@/types/payment";
import { formatRupiah } from "./pemilik-summary-cards";

interface BuktiLightboxDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tagihan: Tagihan | null;
  onApprove?: () => void;
  onReject?: () => void;
}

export function BuktiLightboxDialog({
  isOpen,
  onClose,
  tagihan,
  onApprove,
  onReject,
}: BuktiLightboxDialogProps) {
  if (!tagihan || !tagihan.buktiPembayaran) {
    return null;
  }

  const { buktiPembayaran } = tagihan;

  const formattedUploadDate = buktiPembayaran.uploadedAt
    ? new Date(buktiPembayaran.uploadedAt).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="text-left pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ZoomIn className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                Detail Bukti Transfer
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Pemeriksaan bukti pembayaran transfer bank/e-wallet
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable / Flexible content area */}
        <div className="space-y-3.5 overflow-y-auto pr-1">
          {/* Metadata Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <DoorClosed className="w-4 h-4 text-emerald-600" />
                <span>Kamar {tagihan.nomorKamar}</span>
              </div>
              <span className="text-xs font-black text-emerald-700">
                {formatRupiah(tagihan.nominal)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
              <div className="flex items-center gap-1 text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{tagihan.penghuniNama}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 justify-end">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formattedUploadDate}</span>
              </div>
            </div>

            {buktiPembayaran.catatanPenghuni && (
              <div className="p-2.5 bg-white rounded-lg border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="italic">
                  &ldquo;{buktiPembayaran.catatanPenghuni}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Full Photo Preview Frame */}
          <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5 flex items-center justify-center min-h-[220px] max-h-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={buktiPembayaran.imageUrl}
              alt="Foto Bukti Transfer"
              className="w-full h-auto max-h-[360px] object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Action Buttons Footer */}
        {(onApprove || onReject) && (
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2.5 shrink-0">
            {onReject && (
              <Button
                type="button"
                variant="outline"
                onClick={onReject}
                className="flex-1 h-10 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak Bukti</span>
              </Button>
            )}
            {onApprove && (
              <Button
                type="button"
                onClick={onApprove}
                className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui Pembayaran</span>
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

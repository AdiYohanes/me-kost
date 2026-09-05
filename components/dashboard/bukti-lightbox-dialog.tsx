"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  DoorClosed,
  ZoomIn,
  ZoomOut,
  RotateCcw,
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

function BuktiLightboxModalContent({
  tagihan,
  onApprove,
  onReject,
}: {
  tagihan: Tagihan;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const [zoomScale, setZoomScale] = useState<number>(1);

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

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(3, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  const handleToggleZoom = () => {
    setZoomScale((prev) => (prev > 1 ? 1 : 2));
  };

  return (
    <DialogContent className="max-w-md p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col">
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
        <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
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

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
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
              <div className="p-2.5 bg-white rounded-lg border border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="italic">
                  &ldquo;{buktiPembayaran.catatanPenghuni}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Zoom Controls Toolbar */}
          <div className="flex items-center justify-between px-1 py-0.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Perbesaran:</span>
              <span
                data-testid="zoom-scale-indicator"
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
              >
                {Math.round(zoomScale * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                aria-label="Perkecil foto"
                className="h-7 w-7 p-0 text-slate-700 border-slate-200 hover:bg-slate-100 rounded-md cursor-pointer disabled:opacity-40"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomScale >= 3}
                aria-label="Perbesar foto"
                className="h-7 w-7 p-0 text-slate-700 border-slate-200 hover:bg-slate-100 rounded-md cursor-pointer disabled:opacity-40"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                disabled={zoomScale === 1}
                aria-label="Reset zoom"
                className="h-7 text-xs px-2 text-slate-700 border-slate-200 hover:bg-slate-100 rounded-md cursor-pointer disabled:opacity-40 gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </Button>
            </div>
          </div>

          {/* Full Photo Preview Frame with Zoom & Pan */}
          <div
            data-testid="lightbox-image-container"
            className="relative rounded-xl border border-slate-200 overflow-auto bg-slate-900/5 flex items-center justify-center min-h-[240px] max-h-[380px] p-2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={buktiPembayaran.imageUrl}
              alt="Foto Bukti Transfer"
              onClick={handleToggleZoom}
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: "center center",
                transition: "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
              }}
              title="Klik untuk memperbesar / reset"
              className={`max-w-full h-auto max-h-[360px] object-contain rounded-lg select-none ${
                zoomScale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
            />
          </div>
          <p className="text-[11px] text-center text-slate-400 italic">
            {zoomScale > 1
              ? "Geser gambar untuk memeriksa nominal dan rekening tujuan"
              : "Klik foto atau gunakan tombol di atas untuk memeriksa bukti transfer secara jelas"}
          </p>
        </div>

        {/* Action Buttons Footer */}
        {(onApprove || onReject) && (
          <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2.5 shrink-0">
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
  );
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {isOpen && (
        <BuktiLightboxModalContent
          key={tagihan.id}
          tagihan={tagihan}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </Dialog>
  );
}


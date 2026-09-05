"use client";

import React, { useState } from "react";
import { AlertTriangle, DoorClosed, User, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tagihan } from "@/types/payment";

interface TolakBuktiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tagihan: Tagihan | null;
  onConfirmReject: (alasan: string) => void;
}

const TEMPLATE_ALASAN = [
  "Foto bukti transfer buram atau nominal terpotong.",
  "Nominal transfer tidak sesuai dengan tarif sewa.",
  "Nama rekening pengirim tidak tertera atau tidak jelas.",
  "Tanggal transfer pada bukti tidak sesuai periode.",
];

function TolakBuktiForm({
  tagihan,
  onClose,
  onConfirmReject,
}: {
  tagihan: Tagihan;
  onClose: () => void;
  onConfirmReject: (alasan: string) => void;
}) {
  const [alasan, setAlasan] = useState("");

  const isReasonValid = alasan.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReasonValid) return;
    onConfirmReject(alasan.trim());
  };

  const handleSelectTemplate = (template: string) => {
    setAlasan(template);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
      {/* Info Penghuni & Kamar */}
      <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-zinc-900">
          <DoorClosed className="w-4 h-4 text-emerald-600" />
          <span>Kamar {tagihan.nomorKamar}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
          <User className="w-3.5 h-3.5 text-zinc-400" />
          <span>{tagihan.penghuniNama}</span>
        </div>
      </div>

      {/* Quick Template Chips */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono font-medium text-zinc-600 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Pilihan Alasan Cepat:</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATE_ALASAN.map((tpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectTemplate(tpl)}
              className="text-[10px] font-mono px-2.5 py-1 rounded-md border border-zinc-200 bg-white hover:bg-zinc-100 hover:border-zinc-300 hover:text-zinc-950 transition-colors text-zinc-700 text-left cursor-pointer"
            >
              {tpl}
            </button>
          ))}
        </div>
      </div>

      {/* Textarea Input Alasan Penolakan */}
      <div className="space-y-1">
        <label
          htmlFor="alasan-penolakan-input"
          className="text-xs font-semibold text-zinc-800 flex items-center justify-between"
        >
          <span>Alasan Penolakan (Wajib)</span>
          <span className="text-[10px] font-mono text-zinc-400 font-normal">
            {alasan.length} karakter
          </span>
        </label>
        <textarea
          id="alasan-penolakan-input"
          rows={3}
          value={alasan}
          onChange={(e) => setAlasan(e.target.value)}
          placeholder="Tuliskan alasan penolakan agar penghuni memahami perbaikan yang perlu dilakukan..."
          className="w-full text-xs p-3 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none placeholder:text-zinc-400 text-zinc-900 bg-white"
        />
        <p className="text-[10px] text-zinc-500 leading-tight">
          Catatan ini akan tampil di layar tagihan Penghuni beserta form untuk unggah ulang bukti transfer.
        </p>
      </div>

      <DialogFooter className="pt-3 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-9 text-xs font-medium border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-md cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={!isReasonValid}
          className="flex-1 h-9 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-md shadow-xs cursor-pointer"
        >
          Konfirmasi Tolak
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TolakBuktiDialog({
  isOpen,
  onClose,
  tagihan,
  onConfirmReject,
}: TolakBuktiDialogProps) {
  if (!tagihan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-3 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                Tolak Bukti Pembayaran
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Kirim catatan perbaikan bukti transfer kepada Penghuni
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <TolakBuktiForm
            key={tagihan.id}
            tagihan={tagihan}
            onClose={onClose}
            onConfirmReject={onConfirmReject}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

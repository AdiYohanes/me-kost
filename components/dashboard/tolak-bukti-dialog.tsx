"use client";

import React, { useState, useEffect } from "react";
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

export function TolakBuktiDialog({
  isOpen,
  onClose,
  tagihan,
  onConfirmReject,
}: TolakBuktiDialogProps) {
  const [alasan, setAlasan] = useState("");

  // Reset form state saat dialog dibuka / berganti tagihan
  useEffect(() => {
    if (isOpen) {
      setAlasan("");
    }
  }, [isOpen, tagihan]);

  if (!tagihan) {
    return null;
  }

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
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

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Info Penghuni & Kamar */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <DoorClosed className="w-4 h-4 text-emerald-600" />
              <span>Kamar {tagihan.nomorKamar}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{tagihan.penghuniNama}</span>
            </div>
          </div>

          {/* Quick Template Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Pilihan Alasan Cepat:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_ALASAN.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors text-slate-600 text-left cursor-pointer"
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
              className="text-xs font-semibold text-slate-800 flex items-center justify-between"
            >
              <span>Alasan Penolakan (Wajib)</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {alasan.length} karakter
              </span>
            </label>
            <textarea
              id="alasan-penolakan-input"
              rows={3}
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Tuliskan alasan penolakan agar penghuni memahami perbaikan yang perlu dilakukan..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all resize-none placeholder:text-slate-400 text-slate-800 bg-white"
            />
            <p className="text-[10px] text-slate-400 leading-tight">
              Catatan ini akan tampil di layar tagihan Penghuni beserta form untuk unggah ulang bukti transfer.
            </p>
          </div>

          <DialogFooter className="pt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-9 text-xs font-semibold border-slate-200 text-slate-700"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!isReasonValid}
              className="flex-1 h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Konfirmasi Tolak
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

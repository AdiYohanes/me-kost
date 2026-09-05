"use client";

import React, { useState } from "react";
import { Banknote, DoorClosed, User, Calendar, Receipt } from "lucide-react";
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
import { formatRupiah } from "./pemilik-summary-cards";

interface TandaiCashDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tagihan: Tagihan | null;
  onConfirmCash: (tagihanId: string, catatan?: string) => void;
}

function TandaiCashForm({
  tagihan,
  onClose,
  onConfirmCash,
}: {
  tagihan: Tagihan;
  onClose: () => void;
  onConfirmCash: (tagihanId: string, catatan?: string) => void;
}) {
  const [catatan, setCatatan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCash(tagihan.id, catatan.trim() ? catatan.trim() : undefined);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* Card Info Kamar, Penghuni, Nominal */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <DoorClosed className="w-4 h-4 text-emerald-600" />
            <span>Kamar {tagihan.nomorKamar}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>{tagihan.penghuniNama}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Periode:</span>
          </div>
          <span className="font-semibold text-slate-800">
            {tagihan.periodeBulan}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nominal Tagihan:</span>
          </div>
          <span className="text-base font-black text-emerald-700">
            {formatRupiah(tagihan.nominal)}
          </span>
        </div>
      </div>

      {/* Input Catatan Opsional Penerimaan Tunai */}
      <div className="space-y-1.5">
        <label
          htmlFor="catatan-cash-input"
          className="text-xs font-semibold text-slate-800 flex items-center justify-between"
        >
          <span>Catatan Penerimaan Uang Tunai (Opsional)</span>
          <span className="text-[10px] text-slate-400 font-normal">
            {catatan.length} karakter
          </span>
        </label>
        <textarea
          id="catatan-cash-input"
          rows={2}
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: Diterima uang pas di ruang pengelola kost"
          className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none placeholder:text-slate-400 text-slate-800 bg-white"
        />
        <p className="text-[10px] text-slate-400 leading-tight">
          Metode pembayaran akan disimpan sebagai CASH dan waktu pelunasan otomatis dicatat.
        </p>
      </div>

      <DialogFooter className="pt-4 flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-10 text-xs font-semibold border-slate-200 text-slate-700 cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
        >
          Konfirmasi Lunas (Cash)
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TandaiCashDialog({
  isOpen,
  onClose,
  tagihan,
  onConfirmCash,
}: TandaiCashDialogProps) {
  if (!tagihan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-3 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                Tandai Lunas (Cash)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Konfirmasi pelunasan sewa kamar secara tunai langsung
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <TandaiCashForm
            key={tagihan.id}
            tagihan={tagihan}
            onClose={onClose}
            onConfirmCash={onConfirmCash}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import { UserMinus, DoorClosed, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Kamar } from "@/types/kamar";
import { Tagihan } from "@/types/payment";

interface KeluarkanPenghuniDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kamar: Kamar | null;
  tagihanAktif?: Tagihan | null;
  onConfirm: (kamarId: string, batalkanTagihanAktif: boolean) => void;
}

function KeluarkanPenghuniForm({
  kamar,
  tagihanAktif,
  onClose,
  onConfirm,
}: {
  kamar: Kamar;
  tagihanAktif?: Tagihan | null;
  onClose: () => void;
  onConfirm: (kamarId: string, batalkanTagihanAktif: boolean) => void;
}) {
  const [batalkanTagihan, setBatalkanTagihan] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(kamar.id, batalkanTagihan);
    onClose();
  };

  const hasActiveUnpaid = tagihanAktif && tagihanAktif.status !== "LUNAS";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* Box Profil Anak Kost & Kamar */}
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900">
            <DoorClosed className="w-4 h-4 text-zinc-700" />
            <span>Kamar {kamar.nomorKamar}</span>
          </div>
          <span className="font-bold text-zinc-900">
            {kamar.penghuni?.nama || "Penghuni"}
          </span>
        </div>

        <div className="flex items-center justify-between text-zinc-500">
          <span>Email Google:</span>
          <span className="font-medium text-zinc-700">
            {kamar.penghuni?.email || "-"}
          </span>
        </div>
      </div>

      {/* Pilihan Penanganan Tagihan Aktif Bulan Berjalan */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-800 block">
          Penanganan Tagihan Aktif Bulan Berjalan:
        </label>

        <div className="space-y-2">
          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              batalkanTagihan
                ? "bg-emerald-50/50 border-emerald-500 ring-1 ring-emerald-500"
                : "bg-white border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <input
              type="radio"
              name="opsi-tagihan"
              checked={batalkanTagihan}
              onChange={() => setBatalkanTagihan(true)}
              className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-zinc-900 block">
                Batalkan tagihan aktif bulan berjalan
              </span>
              <p className="text-zinc-500 leading-relaxed">
                {hasActiveUnpaid
                  ? "Kewajiban tagihan bulan ini akan dibatalkan/dihapus karena anak kost keluar sebelum menyelesaikan pembayaran."
                  : "Tagihan bulan ini dihapus dari daftar penagihan kamar."}
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              !batalkanTagihan
                ? "bg-amber-50/50 border-amber-500 ring-1 ring-amber-500"
                : "bg-white border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            <input
              type="radio"
              name="opsi-tagihan"
              checked={!batalkanTagihan}
              onChange={() => setBatalkanTagihan(false)}
              className="mt-0.5 text-amber-600 focus:ring-amber-500"
            />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-zinc-900 block">
                Pertahankan sebagai arsip catatan tunggakan
              </span>
              <p className="text-zinc-500 leading-relaxed">
                Tagihan bulan berjalan tetap tercatat di pembukuan sebagai arsip tunggakan dengan identitas anak kost ini.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Info Soft Disconnect & Integritas Riwayat */}
      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Integritas Pembukuan Terjamin (Soft Disconnect)</span>
        </div>
        <p className="text-blue-800 leading-relaxed pl-5.5">
          Akun anak kost akan dilepaskan dari kamar dan status kamar kembali menjadi <strong>KOSONG</strong>. Seluruh riwayat pembayaran dan bukti transfer bulan-bulan sebelumnya tetap aman tersimpan.
        </p>
      </div>

      <DialogFooter className="pt-3 flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 h-10 text-xs font-semibold border-zinc-200 text-zinc-700 cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="flex-1 h-10 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer gap-1.5"
        >
          <UserMinus className="w-3.5 h-3.5" />
          <span>Keluarkan Penghuni</span>
        </Button>
      </DialogFooter>
    </form>
  );
}

export function KeluarkanPenghuniDialog({
  isOpen,
  onClose,
  kamar,
  tagihanAktif,
  onConfirm,
}: KeluarkanPenghuniDialogProps) {
  if (!kamar) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-2 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
              <UserMinus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-zinc-900">
                Keluarkan Penghuni Kamar {kamar.nomorKamar}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Konfirmasi pelepasan anak kost ({kamar.penghuni?.nama || "Penghuni"})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <KeluarkanPenghuniForm
            key={kamar.id}
            kamar={kamar}
            tagihanAktif={tagihanAktif}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

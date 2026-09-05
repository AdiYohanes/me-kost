"use client";

import React, { useState } from "react";
import {
  CalendarPlus,
  Coins,
  DoorClosed,
  User,
  Building2,
} from "lucide-react";
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

interface BuatPeriodeTagihanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCreate: (data: {
    bulan: number;
    tahun: number;
    periodeBulan: string;
    batasBayar: string;
  }) => void;
}

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const BULAN_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function BuatPeriodeForm({
  onClose,
  onConfirmCreate,
}: {
  onClose: () => void;
  onConfirmCreate: (data: {
    bulan: number;
    tahun: number;
    periodeBulan: string;
    batasBayar: string;
  }) => void;
}) {
  const [bulan, setBulan] = useState(10);
  const [tahun, setTahun] = useState(2026);
  const [batasBayar, setBatasBayar] = useState("10 Okt 2026");

  const handleBulanChange = (newBulan: number) => {
    setBulan(newBulan);
    const shortName = BULAN_SHORT[newBulan - 1];
    setBatasBayar(`10 ${shortName} ${tahun}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const namaBulan = BULAN_NAMES[bulan - 1];
    const periodeBulan = `${namaBulan} ${tahun}`;

    onConfirmCreate({
      bulan,
      tahun,
      periodeBulan,
      batasBayar: batasBayar.trim() || `10 ${BULAN_SHORT[bulan - 1]} ${tahun}`,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor="pilih-bulan"
            className="text-xs font-semibold text-slate-700"
          >
            Pilih Bulan
          </label>
          <select
            id="pilih-bulan"
            value={bulan}
            onChange={(e) => handleBulanChange(parseInt(e.target.value, 10))}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {BULAN_NAMES.map((name, idx) => (
              <option key={idx} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="pilih-tahun"
            className="text-xs font-semibold text-slate-700"
          >
            Tahun
          </label>
          <input
            id="pilih-tahun"
            type="number"
            value={tahun}
            onChange={(e) => setTahun(parseInt(e.target.value, 10) || 2026)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="batas-bayar-input"
          className="text-xs font-semibold text-slate-700"
        >
          Batas Jatuh Tempo
        </label>
        <input
          id="batas-bayar-input"
          type="text"
          value={batasBayar}
          onChange={(e) => setBatasBayar(e.target.value)}
          placeholder="Contoh: 10 Okt 2026"
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100/80 flex items-start gap-2 text-xs text-emerald-900">
        <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          Tagihan baru akan otomatis digenerate untuk <strong>8 unit kamar aktif</strong> (Kamar 101 - 108) dengan status awal <strong>Belum Bayar</strong> menggunakan tarif sewa terkini.
        </div>
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
          Terbitkan Tagihan Baru
        </Button>
      </DialogFooter>
    </form>
  );
}

export function BuatPeriodeTagihanDialog({
  isOpen,
  onClose,
  onConfirmCreate,
}: BuatPeriodeTagihanDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-3 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                Buat Tagihan Periode Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Terbitkan tagihan sewa bulanan baru untuk seluruh kamar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <BuatPeriodeForm
            onClose={onClose}
            onConfirmCreate={onConfirmCreate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface UbahTarifKamarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tagihan: Tagihan | null;
  onConfirmUpdate: (tagihanId: string, nominalBaru: number) => void;
}

function UbahTarifForm({
  tagihan,
  onClose,
  onConfirmUpdate,
}: {
  tagihan: Tagihan;
  onClose: () => void;
  onConfirmUpdate: (tagihanId: string, nominalBaru: number) => void;
}) {
  const [nominalStr, setNominalStr] = useState(tagihan.nominal.toString());

  const parsedNominal = parseInt(nominalStr.replace(/\D/g, ""), 10) || 0;
  const isValid = parsedNominal > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onConfirmUpdate(tagihan.id, parsedNominal);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <DoorClosed className="w-4 h-4 text-emerald-600" />
          <span>Unit {tagihan.nomorKamar}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{tagihan.penghuniNama}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="nominal-baru-input"
          className="text-xs font-semibold text-slate-800 flex items-center justify-between"
        >
          <span>Nominal Tagihan Baru (Rp)</span>
          {isValid && (
            <span className="text-[11px] font-bold text-emerald-700">
              {formatRupiah(parsedNominal)}
            </span>
          )}
        </label>
        <input
          id="nominal-baru-input"
          aria-label="Nominal Tagihan Baru"
          type="number"
          step="50000"
          value={nominalStr}
          onChange={(e) => setNominalStr(e.target.value)}
          placeholder="Contoh: 1600000"
          className="w-full text-xs h-10 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-semibold text-slate-800 bg-white"
        />
        <p className="text-[10px] text-slate-400 leading-tight">
          Nominal ini akan memperbarui tagihan periode berjalan dan periode tagihan berikutnya.
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
          disabled={!isValid}
          className="flex-1 h-10 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs cursor-pointer"
        >
          Simpan Perubahan
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UbahTarifKamarDialog({
  isOpen,
  onClose,
  tagihan,
  onConfirmUpdate,
}: UbahTarifKamarDialogProps) {
  if (!tagihan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-3 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-slate-900">
                Ubah Tarif Kamar {tagihan.nomorKamar}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Penyesuaian nominal sewa bulanan untuk {tagihan.penghuniNama}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <UbahTarifForm
            key={tagihan.id}
            tagihan={tagihan}
            onClose={onClose}
            onConfirmUpdate={onConfirmUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

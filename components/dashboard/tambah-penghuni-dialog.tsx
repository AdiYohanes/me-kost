"use client";

import React, { useState } from "react";
import { UserPlus, DoorClosed, Calendar, Mail, Phone, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kamar, TambahPenghuniInput } from "@/types/kamar";
import { formatRupiah } from "./pemilik-summary-cards";

interface TambahPenghuniDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kamar: Kamar | null;
  onConfirm: (data: TambahPenghuniInput) => void;
}

function TambahPenghuniForm({
  kamar,
  onClose,
  onConfirm,
}: {
  kamar: Kamar;
  onClose: () => void;
  onConfirm: (data: TambahPenghuniInput) => void;
}) {
  const todayString = new Date().toISOString().split("T")[0];
  const todayDay = new Date().getDate();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [tanggalMasuk, setTanggalMasuk] = useState(todayString);
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState<number>(todayDay);
  const [hasCustomJatuhTempo, setHasCustomJatuhTempo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTanggalMasukChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTanggalMasuk(val);
    if (!hasCustomJatuhTempo && val) {
      const parsed = new Date(val);
      if (!isNaN(parsed.getDate())) {
        setTanggalJatuhTempo(parsed.getDate());
      }
    }
  };

  const handleJatuhTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasCustomJatuhTempo(true);
    const num = parseInt(e.target.value, 10);
    if (isNaN(num)) {
      setTanggalJatuhTempo(1);
    } else {
      setTanggalJatuhTempo(Math.min(31, Math.max(1, num)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setErrorMsg("Nama lengkap penghuni wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Email Google tidak valid.");
      return;
    }
    if (!tanggalMasuk) {
      setErrorMsg("Tanggal masuk wajib dipilih.");
      return;
    }

    setErrorMsg("");
    onConfirm({
      kamarId: kamar.id,
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      telepon: telepon.trim() || undefined,
      tanggalMasuk,
      tanggalJatuhTempo,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
      {/* Unit Info Box */}
      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <DoorClosed className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-emerald-950 text-sm block">
              Kamar {kamar.nomorKamar}
            </span>
            <span className="text-emerald-700 font-medium">
              {kamar.tipeKamar}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-emerald-600 font-medium block">Tarif Sewa</span>
          <span className="text-sm font-black text-emerald-900">
            {formatRupiah(kamar.tarifBulanan)}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Input Nama Lengkap */}
      <div className="space-y-1.5">
        <label
          htmlFor="nama-penghuni-input"
          className="text-xs font-bold text-zinc-800 flex items-center gap-1.5"
        >
          <span>Nama Lengkap Penghuni</span>
          <span className="text-rose-500">*</span>
        </label>
        <Input
          id="nama-penghuni-input"
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Muhammad Rizky"
          className="h-10 text-xs rounded-xl"
          required
        />
      </div>

      {/* Input Email Google */}
      <div className="space-y-1.5">
        <label
          htmlFor="email-google-input"
          className="text-xs font-bold text-zinc-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-zinc-500" />
            <span>Email Akun Google</span>
            <span className="text-rose-500">*</span>
          </div>
          <span className="text-xs text-zinc-400 font-normal">Untuk Google 1-Klik</span>
        </label>
        <Input
          id="email-google-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="penghuni@gmail.com"
          className="h-10 text-xs rounded-xl"
          required
        />
        <p className="text-xs text-zinc-500">
          Digunakan anak kost untuk masuk ke sistem menggunakan tombol &apos;Lanjutkan dengan Google&apos;.
        </p>
      </div>

      {/* Input Nomor WhatsApp / Telepon */}
      <div className="space-y-1.5">
        <label
          htmlFor="telepon-penghuni-input"
          className="text-xs font-bold text-zinc-800 flex items-center gap-1.5"
        >
          <Phone className="w-3.5 h-3.5 text-zinc-500" />
          <span>Nomor WhatsApp / HP</span>
          <span className="text-zinc-400 font-normal text-xs">(Opsional)</span>
        </label>
        <Input
          id="telepon-penghuni-input"
          type="tel"
          value={telepon}
          onChange={(e) => setTelepon(e.target.value)}
          placeholder="0812-3456-7890"
          className="h-10 text-xs rounded-xl"
        />
      </div>

      {/* Row: Tanggal Masuk & Tanggal Jatuh Tempo */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <label
            htmlFor="tanggal-masuk-input"
            className="text-xs font-bold text-zinc-800 flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Tanggal Masuk</span>
            <span className="text-rose-500">*</span>
          </label>
          <Input
            id="tanggal-masuk-input"
            type="date"
            value={tanggalMasuk}
            onChange={handleTanggalMasukChange}
            className="h-10 text-xs rounded-xl"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="tanggal-jatuh-tempo-input"
            className="text-xs font-bold text-zinc-800 flex items-center justify-between"
          >
            <span>Jatuh Tempo (Tgl)</span>
            <span className="text-xs text-emerald-600 font-semibold">Tgl 1 - 31</span>
          </label>
          <Input
            id="tanggal-jatuh-tempo-input"
            type="number"
            min={1}
            max={31}
            value={tanggalJatuhTempo}
            onChange={handleJatuhTempoChange}
            className="h-10 text-xs rounded-xl"
            required
          />
        </div>
      </div>

      <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
        <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
        <span>
          Tanggal Jatuh Tempo disetel otomatis mengikuti tanggal masuk. Anda dapat menyesuaikan angkanya jika ada kesepakatan penagihan khusus.
        </span>
      </div>

      <DialogFooter className="pt-4 flex items-center gap-2.5">
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
          className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer"
        >
          Daftarkan Penghuni
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TambahPenghuniDialog({
  isOpen,
  onClose,
  kamar,
  onConfirm,
}: TambahPenghuniDialogProps) {
  if (!kamar) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-2 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-zinc-900">
                Tambah Penghuni Baru
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Daftarkan anak kost pada unit kamar {kamar.nomorKamar}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <TambahPenghuniForm
            key={kamar.id}
            kamar={kamar}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

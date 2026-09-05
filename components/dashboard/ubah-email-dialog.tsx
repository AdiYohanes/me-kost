"use client";

import React, { useState } from "react";
import { Mail, DoorClosed, User, Check } from "lucide-react";
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
import { Kamar } from "@/types/kamar";

interface UbahEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  kamar: Kamar | null;
  onConfirm: (kamarId: string, emailBaru: string) => void;
}

function UbahEmailForm({
  kamar,
  onClose,
  onConfirm,
}: {
  kamar: Kamar;
  onClose: () => void;
  onConfirm: (kamarId: string, emailBaru: string) => void;
}) {
  const currentEmail = kamar.penghuni?.email || "";
  const [email, setEmail] = useState(currentEmail);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Format email Google tidak valid.");
      return;
    }

    setErrorMsg("");
    onConfirm(kamar.id, trimmed);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
      {/* Box Info Kamar & Penghuni */}
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <div className="flex items-center gap-1.5 font-bold text-zinc-900">
            <DoorClosed className="w-4 h-4 text-emerald-600" />
            <span>Kamar {kamar.nomorKamar}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-700 font-medium">
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>{kamar.penghuni?.nama || "Penghuni"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-zinc-500">
          <span>Email Terdaftar Saat Ini:</span>
          <span className="font-semibold text-zinc-800">{currentEmail || "-"}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Input Email Google Baru */}
      <div className="space-y-1.5">
        <label
          htmlFor="email-baru-input"
          className="text-xs font-bold text-zinc-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-zinc-500" />
            <span>Email Akun Google Baru</span>
            <span className="text-rose-500">*</span>
          </div>
          <span className="text-xs text-zinc-400 font-normal">Wajib @</span>
        </label>
        <Input
          id="email-baru-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama.baru@gmail.com"
          className="h-10 text-xs rounded-xl"
          required
        />
        <p className="text-xs text-zinc-500 leading-relaxed">
          Gunakan opsi ini jika Penghuni salah memasukkan email saat pendaftaran atau mengganti akun Google aktif.
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
          className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Simpan Email Baru</span>
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UbahEmailDialog({
  isOpen,
  onClose,
  kamar,
  onConfirm,
}: UbahEmailDialogProps) {
  if (!kamar) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-2 space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-zinc-900">
                Ubah Email Google Terdaftar
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Kamar {kamar.nomorKamar} • {kamar.penghuni?.nama}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <UbahEmailForm
            key={kamar.id + (kamar.penghuni?.email || "")}
            kamar={kamar}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import React, { useState } from "react";
import {
  Banknote,
  Phone,
  MessageCircle,
  Copy,
  Check,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BayarTunaiDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function BayarTunaiDialog({
  trigger,
  open,
  onOpenChange,
}: BayarTunaiDialogProps) {
  const [copied, setCopied] = useState(false);
  const phoneNumber = "0812-3456-7890";
  const rawPhoneNumber = "081234567890";

  const handleCopyPhone = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(rawPhoneNumber);
      }
      setCopied(true);
      toast.success("Nomor telepon Pemilik Kost berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin nomor telepon.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md p-5 sm:p-6">
        <DialogHeader className="text-left pb-3 space-y-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
            <Banknote className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-black text-slate-900">
            Panduan Pembayaran Tunai (Cash)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-0.5">
            Tata cara pembayaran sewa langsung kepada Pemilik Kost Syantika.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs text-slate-700 pt-1">
          {/* Info Pemilik Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pemilik Kost
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Kost Syantika</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Ibu Hj. Syantika</p>
              <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-800">{phoneNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPhone}
                className="h-9 text-xs font-semibold gap-1.5 flex-1 border-slate-300 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                )}
                <span>{copied ? "Tersalin" : "Salin Nomor"}</span>
              </Button>

              <a
                href={`https://wa.me/62${rawPhoneNumber.substring(1)}?text=${encodeURIComponent(
                  "Halo Ibu Hj. Syantika, saya ingin konfirmasi janji temu untuk pembayaran sewa kamar kost secara tunai."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 gap-1.5 flex-1 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Lokasi & Jam */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Lokasi</span>
              </div>
              <p className="font-semibold text-slate-800">Ruang Pengelola Kost</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Lantai 1, samping Ruang Tamu</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1 text-slate-500 font-medium mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Jam Layanan</span>
              </div>
              <p className="font-semibold text-slate-800">08:00 - 20:00 WIB</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Setiap hari</p>
            </div>
          </div>

          {/* Langkah Pembayaran */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100/80 space-y-2">
            <p className="font-bold text-emerald-950 text-xs">Langkah Pembayaran Tunai:</p>
            <ol className="space-y-1.5 list-decimal list-inside text-emerald-900 text-[11px] leading-relaxed">
              <li>Siapkan uang tunai pas sesuai nominal sewa kamar Anda.</li>
              <li>Temui Ibu Hj. Syantika di Ruang Pengelola Kost atau kirim pesan WhatsApp terlebih dahulu.</li>
              <li>Setelah uang tunai diserahkan, Pemilik Kost akan menandai status tagihan Anda menjadi <strong>Lunas (Cash)</strong> di sistem.</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

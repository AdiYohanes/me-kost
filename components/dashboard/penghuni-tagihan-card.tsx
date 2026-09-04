"use client";

import React, { useState, useRef } from "react";
import {
  CreditCard,
  UploadCloud,
  Banknote,
  AlertCircle,
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { BayarTunaiDialog } from "@/components/dashboard/bayar-tunai-dialog";
import { UserSession } from "@/types/auth";
import { StatusPembayaran } from "@/types/payment";

interface PenghuniTagihanCardProps {
  user: UserSession;
}

export function PenghuniTagihanCard({ user }: PenghuniTagihanCardProps) {
  const kamarIdentifier = user.nomorKamar || user.kamarId || "101";
  const { getTagihanAktifByKamar, uploadBuktiTransfer } = usePaymentStore();
  const tagihan = getTagihanAktifByKamar(kamarIdentifier);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [catatan, setCatatan] = useState<string>("");
  const [showFormUpload, setShowFormUpload] = useState<boolean>(false);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);
  const [isTunaiDialogOpen, setIsTunaiDialogOpen] = useState<boolean>(false);

  const nominal = tagihan?.nominal || user.tarifBulanan || 1500000;
  const formattedNominal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(nominal);

  const status: StatusPembayaran = tagihan?.status || "BELUM_BAYAR";

  const getBadgeConfig = (st: StatusPembayaran) => {
    switch (st) {
      case "LUNAS":
        return { variant: "lunas" as const, label: "Lunas" };
      case "MENUNGGU_VERIFIKASI":
        return { variant: "pending" as const, label: "Menunggu Verifikasi" };
      case "DITOLAK":
        return { variant: "ditolak" as const, label: "Ditolak" };
      case "BELUM_BAYAR":
      default:
        return { variant: "belumbayar" as const, label: "Belum Bayar" };
    }
  };

  const badgeConfig = getBadgeConfig(status);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Hanya berkas gambar (JPG, PNG, WebP) yang diperbolehkan.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPreviewUrl(reader.result);
        setShowFormUpload(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    setShowFormUpload(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleSubmitProof = () => {
    if (!tagihan || !previewUrl) {
      toast.error("Silakan pilih gambar bukti pembayaran terlebih dahulu.");
      return;
    }

    uploadBuktiTransfer(tagihan.id, previewUrl, catatan.trim() || undefined);
    toast.success("Bukti transfer berhasil dikirim. Menunggu verifikasi Pemilik Kost.");
    setPreviewUrl(null);
    setCatatan("");
    setShowFormUpload(false);
  };

  const handleCancelUpload = () => {
    setPreviewUrl(null);
    setCatatan("");
    setShowFormUpload(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Card className="card-shadow overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Tagihan Kamar Anda
            </CardTitle>
            <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
          </div>
          <CardDescription className="text-xs">
            Periode: <strong>{tagihan?.periodeBulan || "September 2026"}</strong> • Batas Bayar:{" "}
            <strong>{tagihan?.batasBayar || "10 Sep 2026"}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3.5">
          {/* Nominal Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Nominal Sewa Bulanan</p>
              <p className="text-xl font-black text-slate-900">{formattedNominal}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">Jatuh Tempo</p>
              <p className="text-xs font-semibold text-rose-600">
                {tagihan?.batasBayar || "10 Sep 2026"}
              </p>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="bukti-transfer-file-input"
          />

          {/* Alert jika Ditolak */}
          {status === "DITOLAK" && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Alasan Penolakan dari Pemilik Kost:</span>
              </div>
              <p className="text-rose-700 bg-white/70 p-2 rounded-lg border border-rose-100 leading-relaxed font-medium">
                &ldquo;{tagihan?.alasanPenolakan || "Bukti transfer tidak sesuai. Silakan unggah ulang."}&rdquo;
              </p>
            </div>
          )}

          {/* Mode Upload Preview */}
          {showFormUpload && previewUrl && (
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  Pratinjau Bukti Pembayaran
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleTriggerUpload}
                  className="h-7 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/60 gap-1 px-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Ganti Foto
                </Button>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-black/5 aspect-4/3 flex items-center justify-center max-h-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Pratinjau Bukti Pembayaran"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600">
                  Catatan Tambahan (Opsional)
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: Transfer lewat BCA a.n. Nama Anda"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="text-xs h-9 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelUpload}
                  className="text-xs h-9 flex-1 border-slate-300"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="emerald"
                  size="sm"
                  onClick={handleSubmitProof}
                  className="text-xs h-9 flex-1 gap-1.5 font-semibold"
                >
                  <Check className="w-4 h-4" />
                  Kirim Bukti Pembayaran
                </Button>
              </div>
            </div>
          )}

          {/* Status: Menunggu Verifikasi */}
          {status === "MENUNGGU_VERIFIKASI" && !showFormUpload && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Sedang Ditinjau Pemilik Kost</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                Bukti transfer Anda telah diterima dan sedang menunggu verifikasi oleh Ibu Hj. Syantika.
              </p>

              {tagihan?.buktiPembayaran?.imageUrl && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-amber-100 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tagihan.buktiPembayaran.imageUrl}
                        alt="Thumbnail Bukti"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-[11px]">Bukti Transfer Terkirim</p>
                      <p className="text-[10px] text-slate-400">
                        {tagihan.buktiPembayaran.catatanPenghuni || "Tidak ada catatan"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLightbox(true)}
                    className="h-7 text-[11px] gap-1 px-2 border-slate-200 text-slate-700"
                  >
                    <Eye className="w-3 h-3" />
                    Lihat
                  </Button>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTriggerUpload}
                className="w-full h-8 text-[11px] font-semibold border-amber-300 text-amber-900 hover:bg-amber-100/60 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                Unggah Ulang Bukti Transfer
              </Button>
            </div>
          )}

          {/* Status: Lunas */}
          {status === "LUNAS" && (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tagihan Periode Ini Telah Lunas</span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                Terima kasih atas pembayaran tepat waktu! Pembayaran telah diverifikasi oleh Pemilik Kost.
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-950 font-medium">
                <span>Metode: {tagihan?.metodePembayaran === "CASH" ? "Tunai (Cash)" : "Transfer Bank"}</span>
                {tagihan?.paidAt && (
                  <span className="text-emerald-700 text-[10px]">
                    Lunas: {new Date(tagihan.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons jika Belum Bayar atau Ditolak (dan form belum aktif) */}
          {(status === "BELUM_BAYAR" || status === "DITOLAK") && !showFormUpload && (
            <div className="space-y-2 pt-1">
              <Button
                type="button"
                variant="emerald"
                onClick={handleTriggerUpload}
                className="w-full gap-2 text-xs font-semibold"
              >
                <UploadCloud className="w-4 h-4" />
                {status === "DITOLAK"
                  ? "Unggah Ulang Bukti Transfer"
                  : "Unggah Bukti Transfer"}
              </Button>

              <BayarTunaiDialog
                open={isTunaiDialogOpen}
                onOpenChange={setIsTunaiDialogOpen}
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 text-xs font-semibold border-slate-200"
                  >
                    <Banknote className="w-4 h-4 text-slate-600" />
                    Informasi Bayar Tunai (Cash)
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <div className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Metode Tersedia:</span>
            <span className="font-semibold text-slate-800">Transfer Bank & Tunai</span>
          </div>
        </CardFooter>
      </Card>

      {/* Modal Lightbox Bukti Transfer */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-md p-4">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-bold text-slate-900">
              Bukti Pembayaran Transfer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kamar {user.nomorKamar} • Periode {tagihan?.periodeBulan || "September 2026"}
            </DialogDescription>
          </DialogHeader>

          {tagihan?.buktiPembayaran?.imageUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-3/4 max-h-[70vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tagihan.buktiPembayaran.imageUrl}
                alt="Bukti Transfer Penuh"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {tagihan?.buktiPembayaran?.catatanPenghuni && (
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <strong>Catatan:</strong> {tagihan.buktiPembayaran.catatanPenghuni}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

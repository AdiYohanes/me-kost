"use client";

import React, { useState } from "react";
import {
  Users,
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  Building,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { Tagihan, StatusPembayaran } from "@/types/payment";
import { BuktiLightboxDialog } from "./bukti-lightbox-dialog";
import { TolakBuktiDialog } from "./tolak-bukti-dialog";
import { formatRupiah } from "./pemilik-summary-cards";

type FilterType = "SEMUA" | StatusPembayaran;

export function PemilikDaftarKamar() {
  const { tagihanList, markCashTagihan, approveTagihan, rejectTagihan } =
    usePaymentStore();

  const [activeFilter, setActiveFilter] = useState<FilterType>("SEMUA");
  const [selectedTagihanForLightbox, setSelectedTagihanForLightbox] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForReject, setSelectedTagihanForReject] =
    useState<Tagihan | null>(null);

  // Ambil tagihan aktif bulan berjalan (September 2026) dan urutkan berdasarkan nomor kamar 101 - 108
  const tagihanAktif = tagihanList
    .filter((t) => t.bulan === 9 && t.tahun === 2026)
    .sort((a, b) => parseInt(a.nomorKamar, 10) - parseInt(b.nomorKamar, 10));

  // Hitung jumlah tiap kategori untuk badge tab filter
  const countLunas = tagihanAktif.filter((t) => t.status === "LUNAS").length;
  const countBelumBayar = tagihanAktif.filter(
    (t) => t.status === "BELUM_BAYAR"
  ).length;
  const countPending = tagihanAktif.filter(
    (t) => t.status === "MENUNGGU_VERIFIKASI"
  ).length;
  const countDitolak = tagihanAktif.filter((t) => t.status === "DITOLAK").length;

  const filteredList = tagihanAktif.filter((t) => {
    if (activeFilter === "SEMUA") return true;
    return t.status === activeFilter;
  });

  const handleMarkCash = (tagihan: Tagihan) => {
    markCashTagihan(tagihan.id);
    toast.success(`Pembayaran Tunai Kamar ${tagihan.nomorKamar} Tercatat!`, {
      description: `Tagihan ${tagihan.penghuniNama} berhasil ditandai Lunas (Cash).`,
    });
  };

  const handleApprove = (tagihan: Tagihan) => {
    approveTagihan(tagihan.id);
    toast.success(`Pembayaran Kamar ${tagihan.nomorKamar} Berhasil Disetujui!`, {
      description: `Status tagihan ${tagihan.penghuniNama} telah diubah menjadi LUNAS.`,
    });
    if (selectedTagihanForLightbox?.id === tagihan.id) {
      setSelectedTagihanForLightbox(null);
    }
  };

  const handleConfirmReject = (alasan: string) => {
    if (!selectedTagihanForReject) return;
    const { id, nomorKamar, penghuniNama } = selectedTagihanForReject;
    rejectTagihan(id, alasan);
    toast.error(`Bukti Pembayaran Kamar ${nomorKamar} Ditolak`, {
      description: `Catatan penolakan telah dikirimkan ke ${penghuniNama}.`,
    });
    setSelectedTagihanForReject(null);
    if (selectedTagihanForLightbox?.id === id) {
      setSelectedTagihanForLightbox(null);
    }
  };

  const renderBadgeStatus = (tagihan: Tagihan) => {
    switch (tagihan.status) {
      case "LUNAS":
        return (
          <Badge variant="lunas" className="text-[10px] gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Lunas {tagihan.metodePembayaran === "CASH" ? "(Tunai)" : "(Transfer)"}</span>
          </Badge>
        );
      case "MENUNGGU_VERIFIKASI":
        return (
          <Badge variant="pending" className="text-[10px] gap-1">
            <Clock className="w-3 h-3" />
            <span>Menunggu Verifikasi</span>
          </Badge>
        );
      case "DITOLAK":
        return (
          <Badge variant="ditolak" className="text-[10px]">
            Ditolak
          </Badge>
        );
      case "BELUM_BAYAR":
      default:
        return <Badge variant="belumbayar" className="text-[10px]">Belum Bayar</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <Card className="card-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Daftar Unit Kamar</span>
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Unit 101 - 108 Kost Syantika • Periode September 2026
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredList.length} Kamar
            </span>
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter("SEMUA")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "SEMUA"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              Semua ({tagihanAktif.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("LUNAS")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "LUNAS"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              Lunas ({countLunas})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("BELUM_BAYAR")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "BELUM_BAYAR"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              Belum Bayar ({countBelumBayar})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("MENUNGGU_VERIFIKASI")}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === "MENUNGGU_VERIFIKASI"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              Menunggu Verifikasi ({countPending})
            </button>

            {countDitolak > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("DITOLAK")}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === "DITOLAK"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                Ditolak ({countDitolak})
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5 pt-0">
          {filteredList.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs rounded-xl bg-slate-50 border border-slate-100">
              <Filter className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              <p>Tidak ada kamar dengan filter status ini.</p>
            </div>
          ) : (
            filteredList.map((tagihan) => (
              <div
                key={tagihan.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {tagihan.nomorKamar}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">
                        {tagihan.penghuniNama}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatRupiah(tagihan.nominal)} / bln
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {renderBadgeStatus(tagihan)}
                  </div>
                </div>

                {/* Baris Aksi Kontekstual */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[11px]">
                  <span className="text-[10px] text-slate-400">
                    Jatuh tempo: {tagihan.batasBayar}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {tagihan.status === "MENUNGGU_VERIFIKASI" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedTagihanForLightbox(tagihan)}
                        className="h-7 px-2.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Periksa Bukti</span>
                      </Button>
                    )}

                    {(tagihan.status === "BELUM_BAYAR" ||
                      tagihan.status === "DITOLAK") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkCash(tagihan)}
                        className="h-7 px-2 text-[11px] font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1"
                      >
                        <Banknote className="w-3 h-3 text-emerald-600" />
                        <span>Tandai Tunai</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal Lightbox saat dibuka dari daftar kamar */}
      <BuktiLightboxDialog
        isOpen={!!selectedTagihanForLightbox}
        onClose={() => setSelectedTagihanForLightbox(null)}
        tagihan={selectedTagihanForLightbox}
        onApprove={
          selectedTagihanForLightbox
            ? () => handleApprove(selectedTagihanForLightbox)
            : undefined
        }
        onReject={
          selectedTagihanForLightbox
            ? () => {
                const target = selectedTagihanForLightbox;
                setSelectedTagihanForLightbox(null);
                setSelectedTagihanForReject(target);
              }
            : undefined
        }
      />

      {/* Modal Tolak Bukti */}
      <TolakBuktiDialog
        isOpen={!!selectedTagihanForReject}
        onClose={() => setSelectedTagihanForReject(null)}
        tagihan={selectedTagihanForReject}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}

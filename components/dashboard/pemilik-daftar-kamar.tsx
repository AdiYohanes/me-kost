"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Banknote,
  CheckCircle2,
  Clock,
  Eye,
  CalendarPlus,
  Filter,
  ChevronDown,
  Edit3,
  UserPlus,
  UserMinus,
  Mail,
  AlertTriangle,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { Tagihan, StatusPembayaran } from "@/types/payment";
import { Kamar, TambahPenghuniInput } from "@/types/kamar";
import { hitungStatusTagihan } from "@/lib/siklus-tagihan";
import { buatTautanWhatsApp } from "@/lib/whatsapp";
import { MOCK_USERS } from "@/lib/mock-data";
import { BuktiLightboxDialog } from "./bukti-lightbox-dialog";
import { TolakBuktiDialog } from "./tolak-bukti-dialog";
import { TandaiCashDialog } from "./tandai-cash-dialog";
import {
  BuatPeriodeTagihanDialog,
  UbahTarifKamarDialog,
} from "./kelola-tagihan-dialog";
import { TambahPenghuniDialog } from "./tambah-penghuni-dialog";
import { UbahEmailDialog } from "./ubah-email-dialog";
import { KeluarkanPenghuniDialog } from "./keluarkan-penghuni-dialog";
import { formatRupiah } from "./pemilik-summary-cards";
import { useOptimisticTagihanMutations } from "@/lib/hooks/use-payment-query";

type FilterType =
  | "SEMUA"
  | "BUTUH_VERIFIKASI"
  | "H3"
  | "MENUNGGAK"
  | "KOSONG"
  | "LUNAS"
  | StatusPembayaran;

export function PemilikDaftarKamar() {
  const {
    kamarList,
    tagihanList,
    activePeriode,
    markCashTagihan,
    approveTagihan,
    rejectTagihan,
    updateNominalTagihan,
    buatTagihanPeriodeBaru,
    tambahPenghuni,
    ubahEmailPenghuni,
    keluarkanPenghuni,
    sinkronisasiTagihanOtomatis,
  } = usePaymentStore();
  const { tandaiCashMutation, verifikasiMutation, tolakMutation } =
    useOptimisticTagihanMutations();

  useEffect(() => {
    sinkronisasiTagihanOtomatis();
  }, [sinkronisasiTagihanOtomatis]);

  const [activeFilter, setActiveFilter] = useState<FilterType>("SEMUA");
  const [selectedTagihanForLightbox, setSelectedTagihanForLightbox] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForReject, setSelectedTagihanForReject] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForCash, setSelectedTagihanForCash] =
    useState<Tagihan | null>(null);
  const [selectedTagihanForTarif, setSelectedTagihanForTarif] =
    useState<Tagihan | null>(null);
  const [isBuatPeriodeOpen, setIsBuatPeriodeOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    if (isFilterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  // Modal State untuk Manajemen Kamar (Issue 03)
  const [selectedKamarForTambah, setSelectedKamarForTambah] =
    useState<Kamar | null>(null);
  const [selectedKamarForEmail, setSelectedKamarForEmail] =
    useState<Kamar | null>(null);
  const [selectedKamarForKeluarkan, setSelectedKamarForKeluarkan] =
    useState<Kamar | null>(null);

  const currentBulan = activePeriode?.bulan ?? 9;
  const currentTahun = activePeriode?.tahun ?? 2026;
  const currentPeriodeLabel = activePeriode?.periodeBulan ?? "September 2026";

  // Urutkan kamar fisik secara numerik (101, 102, dst.)
  const sortedKamarList = [...(kamarList || [])].sort(
    (a, b) => parseInt(a.nomorKamar, 10) - parseInt(b.nomorKamar, 10)
  );

  // Map tagihan aktif bulan berjalan per nomor kamar
  const tagihanAktifMap = new Map<string, Tagihan>();
  tagihanList
    .filter((t) => t.bulan === currentBulan && t.tahun === currentTahun)
    .forEach((t) => tagihanAktifMap.set(t.nomorKamar, t));

  // Hitung jumlah tiap kategori untuk badge tab filter
  let countLunas = 0;
  let countPending = 0;
  let countKosong = 0;
  let countMenunggak = 0;
  let countH3 = 0;

  sortedKamarList.forEach((kamar) => {
    if (kamar.statusHunian === "KOSONG") {
      countKosong++;
    } else {
      const tagihan = tagihanAktifMap.get(kamar.nomorKamar);
      if (tagihan) {
        const evaluasi = hitungStatusTagihan(tagihan);
        if (evaluasi.isMenunggak || tagihan.status === "MENUNGGAK") {
          countMenunggak++;
        } else if (tagihan.status === "LUNAS") {
          countLunas++;
        } else if (tagihan.status === "MENUNGGU_VERIFIKASI") {
          countPending++;
        } else if (tagihan.status === "BELUM_BAYAR" && evaluasi.isH3) {
          countH3++;
        }
      }
    }
  });

  const filterOptions = [
    {
      id: "SEMUA" as const,
      label: "Semua",
      count: sortedKamarList.length,
      color: "bg-zinc-900",
      ariaLabel: `Semua (${sortedKamarList.length})`,
    },
    {
      id: "BUTUH_VERIFIKASI" as const,
      label: "Butuh Verifikasi",
      count: countPending,
      color: "bg-amber-500",
      ariaLabel: `Butuh Verifikasi (${countPending})`,
    },
    {
      id: "H3" as const,
      label: "Mendekati Jatuh Tempo (H-3)",
      count: countH3,
      color: "bg-amber-500",
      ariaLabel: `Mendekati Jatuh Tempo (H-3) (${countH3})`,
    },
    {
      id: "MENUNGGAK" as const,
      label: "Menunggak",
      count: countMenunggak,
      color: "bg-rose-500",
      ariaLabel: `Menunggak (${countMenunggak})`,
    },
    {
      id: "LUNAS" as const,
      label: "Lunas",
      count: countLunas,
      color: "bg-emerald-500",
      ariaLabel: `Lunas (${countLunas})`,
    },
    {
      id: "KOSONG" as const,
      label: "Kamar Kosong",
      count: countKosong,
      color: "bg-slate-500",
      ariaLabel: `Kamar Kosong (${countKosong})`,
    },
  ];

  const currentOption =
    filterOptions.find(
      (opt) =>
        opt.id === activeFilter ||
        (opt.id === "BUTUH_VERIFIKASI" &&
          activeFilter === "MENUNGGU_VERIFIKASI")
    ) || filterOptions[0];

  const filteredList = sortedKamarList.filter((kamar) => {
    if (activeFilter === "SEMUA") return true;
    if (activeFilter === "KOSONG") return kamar.statusHunian === "KOSONG";
    if (kamar.statusHunian === "KOSONG") return false;

    const tagihan = tagihanAktifMap.get(kamar.nomorKamar);
    if (!tagihan) return false;

    const evaluasi = hitungStatusTagihan(tagihan);

    if (
      activeFilter === "BUTUH_VERIFIKASI" ||
      activeFilter === "MENUNGGU_VERIFIKASI"
    ) {
      return tagihan.status === "MENUNGGU_VERIFIKASI";
    }
    if (activeFilter === "H3") {
      return (
        tagihan.status === "BELUM_BAYAR" &&
        evaluasi.isH3 &&
        !evaluasi.isMenunggak
      );
    }
    if (activeFilter === "MENUNGGAK") {
      return evaluasi.isMenunggak || tagihan.status === "MENUNGGAK";
    }
    if (activeFilter === "LUNAS") {
      return tagihan.status === "LUNAS";
    }
    if (activeFilter === "BELUM_BAYAR") {
      return tagihan.status === "BELUM_BAYAR" && !evaluasi.isMenunggak;
    }
    if (activeFilter === "DITOLAK") {
      return tagihan.status === "DITOLAK";
    }
    return tagihan.status === activeFilter;
  });

  const handleConfirmCash = (tagihanId: string, catatan?: string) => {
    const target = tagihanList.find((t) => t.id === tagihanId);
    markCashTagihan(tagihanId, catatan);

    tandaiCashMutation.mutate({
      tagihanId,
      catatan,
      nomorKamar: target?.nomorKamar,
      penghuniNama: target?.penghuniNama,
    });

    toast.success(
      `Pembayaran Tunai Kamar ${target?.nomorKamar || ""} Tercatat!`,
      {
        description: `Tagihan ${target?.penghuniNama || ""} berhasil ditandai Lunas (Cash).`,
      }
    );
    setSelectedTagihanForCash(null);
  };

  const handleConfirmUpdateTarif = (tagihanId: string, nominalBaru: number) => {
    const target = tagihanList.find((t) => t.id === tagihanId);
    updateNominalTagihan(tagihanId, nominalBaru);
    toast.success(
      `Tarif Kamar ${target?.nomorKamar || ""} Berhasil Diperbarui!`,
      {
        description: `Nominal sewa kini ${formatRupiah(nominalBaru)}.`,
      }
    );
    setSelectedTagihanForTarif(null);
  };

  const handleConfirmCreatePeriode = (data: {
    bulan: number;
    tahun: number;
    periodeBulan: string;
    batasBayar: string;
  }) => {
    buatTagihanPeriodeBaru(
      data.bulan,
      data.tahun,
      data.periodeBulan,
      data.batasBayar
    );
    toast.success(`Tagihan Periode ${data.periodeBulan} Berhasil Diterbitkan!`, {
      description: "Tagihan baru untuk seluruh kamar siap ditagihkan.",
    });
    setIsBuatPeriodeOpen(false);
  };

  const handleApprove = (tagihan: Tagihan) => {
    approveTagihan(tagihan.id);

    verifikasiMutation.mutate({
      tagihanId: tagihan.id,
      nomorKamar: tagihan.nomorKamar,
      penghuniNama: tagihan.penghuniNama,
    });

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

    tolakMutation.mutate({
      tagihanId: id,
      alasan,
      nomorKamar,
      penghuniNama,
    });

    toast.error(`Bukti Pembayaran Kamar ${nomorKamar} Ditolak`, {
      description: `Catatan penolakan telah dikirimkan ke ${penghuniNama}.`,
    });
    setSelectedTagihanForReject(null);
    if (selectedTagihanForLightbox?.id === id) {
      setSelectedTagihanForLightbox(null);
    }
  };

  // Handlers Manajemen Kamar
  const handleConfirmTambahPenghuni = (data: TambahPenghuniInput) => {
    tambahPenghuni(data);
    const target = sortedKamarList.find((k) => k.id === data.kamarId);
    toast.success(
      `Penghuni Kamar ${target?.nomorKamar || ""} Berhasil Didaftarkan!`,
      {
        description: `${data.nama} telah ditautkan dan tagihan periode berjalan diterbitkan.`,
      }
    );
    setSelectedKamarForTambah(null);
  };

  const handleConfirmUbahEmail = (kamarId: string, emailBaru: string) => {
    ubahEmailPenghuni(kamarId, emailBaru);
    const target = sortedKamarList.find((k) => k.id === kamarId);
    toast.success(
      `Email Google Kamar ${target?.nomorKamar || ""} Berhasil Diperbarui!`,
      {
        description: `Akun Penghuni kini terhubung dengan email: ${emailBaru}`,
      }
    );
    setSelectedKamarForEmail(null);
  };

  const handleConfirmKeluarkan = (
    kamarId: string,
    batalkanTagihanAktif: boolean
  ) => {
    const target = sortedKamarList.find((k) => k.id === kamarId);
    keluarkanPenghuni({ kamarId, batalkanTagihanAktif });
    toast.success(
      `Penghuni Kamar ${target?.nomorKamar || ""} Berhasil Dikeluarkan`,
      {
        description:
          "Status kamar kini Kosong (Soft Disconnect). Seluruh riwayat pembukuan masa lalu tetap aman.",
      }
    );
    setSelectedKamarForKeluarkan(null);
  };

  const renderBadgeStatus = (tagihan?: Tagihan) => {
    if (!tagihan) {
      return (
        <Badge variant="outline" className="text-xs font-medium text-zinc-500">
          Belum Ada Tagihan
        </Badge>
      );
    }

    const evaluasi = hitungStatusTagihan(tagihan);

    if (evaluasi.isMenunggak || tagihan.status === "MENUNGGAK") {
      return (
        <Badge
          variant="menunggak"
          className="text-xs font-semibold gap-1 bg-red-100 text-red-700 border border-red-300"
        >
          <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
          <span>{evaluasi.isMenunggak ? evaluasi.labelStatus : "MENUNGGAK"}</span>
        </Badge>
      );
    }

    switch (tagihan.status) {
      case "LUNAS":
        return (
          <Badge variant="lunas" className="text-xs font-medium gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>
              Lunas {tagihan.metodePembayaran === "CASH" ? "(Tunai)" : "(Transfer)"}
            </span>
          </Badge>
        );
      case "MENUNGGU_VERIFIKASI":
        return (
          <Badge variant="pending" className="text-xs font-medium gap-1">
            <Clock className="w-3 h-3" />
            <span>Menunggu Verifikasi</span>
          </Badge>
        );
      case "DITOLAK":
        return (
          <Badge variant="ditolak" className="text-xs font-medium">
            Ditolak
          </Badge>
        );
      case "BELUM_BAYAR":
      default:
        if (evaluasi.isH3) {
          return (
            <Badge
              variant="pending"
              className="text-xs font-semibold gap-1 bg-amber-100 text-amber-800 border border-amber-300"
            >
              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
              <span>H-3 Jatuh Tempo</span>
            </Badge>
          );
        }
        return (
          <Badge variant="belumbayar" className="text-xs font-medium">
            Belum Bayar
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <Card className="card-shadow border-zinc-200 bg-white">
        <CardHeader className="p-4 sm:p-5 pb-3.5 border-b border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2">
            <div className="flex items-center justify-between sm:justify-start sm:gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-zinc-700 shrink-0" />
                  <span className="whitespace-nowrap">Daftar Unit Kamar</span>
                </CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5 whitespace-nowrap">
                  Periode {currentPeriodeLabel}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 tabular-nums shrink-0">
                {filteredList.length} Kamar
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBuatPeriodeOpen(true)}
              className="w-full sm:w-auto h-8 px-2.5 text-xs font-medium text-zinc-800 border-zinc-200 hover:bg-zinc-50 gap-1.5 rounded-md cursor-pointer justify-center shrink-0"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Periode Baru</span>
            </Button>
          </div>

          {/* Filter Status Dropdown */}
          <div className="relative pt-3" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              aria-label={`Filter Status: ${currentOption.label} (${currentOption.count})`}
              aria-expanded={isFilterDropdownOpen}
              aria-haspopup="true"
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50/80 hover:bg-zinc-100 text-xs font-medium text-zinc-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-zinc-500 font-normal shrink-0">Filter Status:</span>
                <span className="font-semibold text-zinc-900 truncate">
                  {currentOption.label} ({currentOption.count})
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform duration-200 shrink-0 ${
                  isFilterDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu Popover */}
            <div
              className={`absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-zinc-200 rounded-xl shadow-lg p-1.5 transition-all duration-150 origin-top space-y-1 ${
                isFilterDropdownOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              {filterOptions.map((opt) => {
                const isSelected =
                  opt.id === activeFilter ||
                  (opt.id === "BUTUH_VERIFIKASI" &&
                    activeFilter === "MENUNGGU_VERIFIKASI");

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setActiveFilter(opt.id);
                      setIsFilterDropdownOpen(false);
                    }}
                    aria-label={opt.ariaLabel}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isSelected
                        ? "bg-zinc-100 text-zinc-900 font-semibold"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${opt.color}`}
                      />
                      <span>{opt.label}</span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded tabular-nums ${
                        isSelected
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {opt.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5 p-4 sm:p-5 pt-4">
          {filteredList.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 text-xs rounded-lg bg-zinc-50 border border-zinc-200">
              <Filter className="w-4 h-4 mx-auto mb-1 text-zinc-400" />
              <p>Tidak ada kamar dengan filter status ini.</p>
            </div>
          ) : (
            filteredList.map((kamar) => {
              const tagihan = tagihanAktifMap.get(kamar.nomorKamar);
              const isTerisi = kamar.statusHunian === "TERISI";

              // Tampilan Kamar KOSONG
              if (!isTerisi) {
                return (
                  <div
                    key={kamar.id}
                    className="p-3 sm:p-3.5 rounded-lg bg-zinc-50/70 border border-dashed border-zinc-300 hover:border-zinc-400 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                          {kamar.nomorKamar}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-zinc-800 leading-tight">
                            Kamar {kamar.nomorKamar} (Kosong)
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-0.5">
                            <span>{kamar.tipeKamar}</span>
                            <span>•</span>
                            <span className="tabular-nums font-medium">
                              {formatRupiah(kamar.tarifBulanan)} / bln
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold text-zinc-600 bg-zinc-200/80 border border-zinc-300"
                        >
                          Kosong
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 text-xs">
                      <span className="text-xs text-zinc-500 font-normal">
                        Kamar siap disewakan
                      </span>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedKamarForTambah(kamar)}
                        aria-label={`Tambah Penghuni Kamar ${kamar.nomorKamar}`}
                        className="h-7.5 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-md cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Tambah Penghuni</span>
                      </Button>
                    </div>
                  </div>
                );
              }

              // Tampilan Kamar TERISI
              const penghuniNama =
                kamar.penghuni?.nama || tagihan?.penghuniNama || "Penghuni";
              const penghuniEmail = kamar.penghuni?.email;
              const nominalSewa = tagihan?.nominal || kamar.tarifBulanan;
              const batasBayarText =
                tagihan?.batasBayar ||
                `${kamar.tanggalJatuhTempo} ${currentPeriodeLabel}`;

              const evaluasi = tagihan ? hitungStatusTagihan(tagihan) : null;
              const isMenunggak = Boolean(
                evaluasi?.isMenunggak || tagihan?.status === "MENUNGGAK"
              );
              const isH3 = Boolean(
                tagihan?.status === "BELUM_BAYAR" &&
                  evaluasi?.isH3 &&
                  !isMenunggak
              );

              const teleponPenghuni =
                kamar.penghuni?.telepon ||
                MOCK_USERS.find((u) => u.nomorKamar === kamar.nomorKamar)?.phone ||
                "";

              const waUrl =
                (isH3 || isMenunggak) && teleponPenghuni
                  ? buatTautanWhatsApp({
                      telepon: teleponPenghuni,
                      penghuniNama,
                      nomorKamar: kamar.nomorKamar,
                      nominal: nominalSewa,
                      batasBayar: batasBayarText,
                      tipe: isMenunggak ? "MENUNGGAK" : "H3",
                    })
                  : null;

              return (
                <div
                  key={kamar.id}
                  className="p-3 sm:p-3.5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 transition-colors space-y-2.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                          {kamar.nomorKamar}
                        </span>
                        <p className="text-sm font-bold text-zinc-950 leading-tight truncate">
                          {penghuniNama}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium text-emerald-700 bg-emerald-50 border-emerald-200"
                        >
                          Terisi
                        </Badge>
                        {renderBadgeStatus(tagihan)}
                      </div>
                    </div>

                    {/* Tarif & Ubah Tarif */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 pl-10.5">
                      <span className="tabular-nums font-medium text-zinc-700">
                        {formatRupiah(nominalSewa)} / bln
                      </span>
                      <span className="text-zinc-300">•</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTagihanForTarif(
                            tagihan || {
                              id: `tagihan-${kamar.nomorKamar}`,
                              kamarId: kamar.id,
                              nomorKamar: kamar.nomorKamar,
                              penghuniId: kamar.penghuni?.id || "",
                              penghuniNama,
                              periodeBulan: currentPeriodeLabel,
                              tahun: currentTahun,
                              bulan: currentBulan,
                              nominal: nominalSewa,
                              batasBayar: batasBayarText,
                              status: "BELUM_BAYAR",
                            }
                          )
                        }
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                        aria-label={`Ubah Tarif Kamar ${kamar.nomorKamar}`}
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                        <span>Ubah Tarif</span>
                      </button>
                    </div>
                  </div>

                  {/* Info Email Google & Aksi Cepat Ubah Email */}
                  <div className="flex items-center justify-between text-xs text-zinc-600 bg-zinc-50/80 px-2.5 py-1.5 rounded-md border border-zinc-100">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate text-zinc-600">
                        {penghuniEmail || "Belum ada email Google"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedKamarForEmail(kamar)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline shrink-0 ml-2 cursor-pointer"
                      aria-label={`Ubah Email Kamar ${kamar.nomorKamar}`}
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>Ubah Email</span>
                    </button>
                  </div>

                  {/* Baris Jatuh Tempo & Pengingat WA */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
                    <span className="text-xs text-zinc-500 font-medium">
                      Jatuh tempo: {batasBayarText}
                    </span>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Hubungi Kamar ${kamar.nomorKamar} via WhatsApp`}
                        className="inline-flex items-center justify-center whitespace-nowrap transition-all h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white gap-1 rounded-md cursor-pointer shadow-xs shrink-0"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isMenunggak ? "Tegur WA" : "Pengingat WA"}</span>
                      </a>
                    )}
                  </div>

                  {/* Tombol Aksi di Bawah (Flex Row) */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {tagihan?.status === "MENUNGGU_VERIFIKASI" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedTagihanForLightbox(tagihan)}
                        className="flex-1 h-8 px-2.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 rounded-md cursor-pointer justify-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Periksa Bukti</span>
                      </Button>
                    )}

                    {(!tagihan ||
                      tagihan.status === "BELUM_BAYAR" ||
                      tagihan.status === "DITOLAK") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedTagihanForCash(
                            tagihan || {
                              id: `tagihan-${kamar.nomorKamar}`,
                              kamarId: kamar.id,
                              nomorKamar: kamar.nomorKamar,
                              penghuniId: kamar.penghuni?.id || "",
                              penghuniNama,
                              periodeBulan: currentPeriodeLabel,
                              tahun: currentTahun,
                              bulan: currentBulan,
                              nominal: nominalSewa,
                              batasBayar: batasBayarText,
                              status: "BELUM_BAYAR",
                            }
                          )
                        }
                        className="flex-1 h-8 px-2.5 text-xs font-medium text-zinc-800 border-zinc-200 hover:bg-zinc-50 gap-1.5 rounded-md cursor-pointer justify-center"
                      >
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tandai Lunas (Cash)</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedKamarForKeluarkan(kamar)}
                      className={`${
                        tagihan?.status === "LUNAS" ? "w-full" : "flex-1"
                      } h-8 px-2 text-xs font-medium text-rose-600 bg-rose-50/50 hover:bg-rose-100/70 hover:text-rose-700 border border-rose-100 hover:border-rose-200 gap-1.5 rounded-md cursor-pointer justify-center`}
                      aria-label={`Keluarkan Penghuni Kamar ${kamar.nomorKamar}`}
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>Keluarkan Penghuni</span>
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Modal Tambah Penghuni Baru */}
      <TambahPenghuniDialog
        isOpen={!!selectedKamarForTambah}
        onClose={() => setSelectedKamarForTambah(null)}
        kamar={selectedKamarForTambah}
        onConfirm={handleConfirmTambahPenghuni}
      />

      {/* Modal Ubah Email Google Penghuni */}
      <UbahEmailDialog
        isOpen={!!selectedKamarForEmail}
        onClose={() => setSelectedKamarForEmail(null)}
        kamar={selectedKamarForEmail}
        onConfirm={handleConfirmUbahEmail}
      />

      {/* Modal Konfirmasi Keluarkan Penghuni (Soft Disconnect) */}
      <KeluarkanPenghuniDialog
        isOpen={!!selectedKamarForKeluarkan}
        onClose={() => setSelectedKamarForKeluarkan(null)}
        kamar={selectedKamarForKeluarkan}
        tagihanAktif={
          selectedKamarForKeluarkan
            ? tagihanAktifMap.get(selectedKamarForKeluarkan.nomorKamar)
            : null
        }
        onConfirm={handleConfirmKeluarkan}
      />

      {/* Modal Tandai Lunas (Cash) */}
      <TandaiCashDialog
        isOpen={!!selectedTagihanForCash}
        onClose={() => setSelectedTagihanForCash(null)}
        tagihan={selectedTagihanForCash}
        onConfirmCash={handleConfirmCash}
      />

      {/* Modal Ubah Tarif Kamar */}
      <UbahTarifKamarDialog
        isOpen={!!selectedTagihanForTarif}
        onClose={() => setSelectedTagihanForTarif(null)}
        tagihan={selectedTagihanForTarif}
        onConfirmUpdate={handleConfirmUpdateTarif}
      />

      {/* Modal Buat Periode Tagihan Baru */}
      <BuatPeriodeTagihanDialog
        isOpen={isBuatPeriodeOpen}
        onClose={() => setIsBuatPeriodeOpen(false)}
        onConfirmCreate={handleConfirmCreatePeriode}
      />

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

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Tagihan, PaymentState, BuktiPembayaran } from "@/types/payment";
import {
  Kamar,
  TambahPenghuniInput,
  KeluarkanPenghuniInput,
} from "@/types/kamar";
import { MOCK_USERS } from "@/lib/mock-data";
import {
  evaluasiPenerbitanH7,
  hitungStatusTagihan,
} from "@/lib/siklus-tagihan";

export function generateInitialKamar(): Kamar[] {
  const penghuniAccounts = MOCK_USERS.filter((u) => u.role === "PENGHUNI");
  return penghuniAccounts.map((acc) => {
    const nomorKamar = acc.nomorKamar || "101";
    return {
      id: nomorKamar,
      nomorKamar,
      tipeKamar: acc.tipeKamar || "Kamar Standard",
      tarifBulanan: acc.tarifBulanan || 1500000,
      statusHunian: "TERISI" as const,
      tanggalMasuk: "2026-09-01",
      tanggalJatuhTempo: 10,
      penghuni: {
        id: acc.id,
        nama: acc.name,
        email: acc.email || `kamar${nomorKamar}@kostsyantika.com`,
        telepon: acc.phone,
      },
    };
  });
}

export const MOCK_RECEIPT_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'><rect width='400' height='600' fill='%23f8fafc'/><rect x='20' y='20' width='360' height='560' rx='16' fill='white' stroke='%23e2e8f0' stroke-width='2'/><circle cx='200' cy='90' r='36' fill='%2310b981'/><path d='M188 90l8 8 16-16' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='200' y='160' font-family='sans-serif' font-size='18' font-weight='bold' fill='%230f172a' text-anchor='middle'>TRANSFER BERHASIL</text><text x='200' y='190' font-family='sans-serif' font-size='13' fill='%2364748b' text-anchor='middle'>Me Kost</text><line x1='50' y1='220' x2='350' y2='220' stroke='%23e2e8f0' stroke-dasharray='4 4'/><text x='50' y='260' font-family='sans-serif' font-size='12' fill='%2364748b'>Penerima</text><text x='350' y='260' font-family='sans-serif' font-size='13' font-weight='bold' fill='%230f172a' text-anchor='end'>Adi Yohanes</text><text x='50' y='300' font-family='sans-serif' font-size='12' fill='%2364748b'>Bank Tujuan</text><text x='350' y='300' font-family='sans-serif' font-size='13' font-weight='bold' fill='%230f172a' text-anchor='end'>BCA 8830-192-881</text><rect x='50' y='360' width='300' height='60' rx='8' fill='%23f1f5f9'/><text x='200' y='395' font-family='sans-serif' font-size='11' fill='%23475569' text-anchor='middle'>Bukti Pembayaran Terverifikasi</text></svg>";

export function generateInitialTagihan(): Tagihan[] {
  const list: Tagihan[] = [];

  const penghuniAccounts = MOCK_USERS.filter((u) => u.role === "PENGHUNI");

  penghuniAccounts.forEach((acc) => {
    const nomorKamar = acc.nomorKamar || "101";
    const nominal = acc.tarifBulanan || 1500000;

    // 1. Tagihan Aktif: September 2026
    let statusAktif: Tagihan["status"] = "BELUM_BAYAR";
    let buktiAktif: BuktiPembayaran | undefined = undefined;
    let alasanAktif: string | undefined = undefined;
    let metodeAktif: Tagihan["metodePembayaran"] = undefined;
    let paidAtAktif: string | undefined = undefined;
    let verifiedAtAktif: string | undefined = undefined;

    if (nomorKamar === "102" || nomorKamar === "107") {
      statusAktif = "MENUNGGU_VERIFIKASI";
      buktiAktif = {
        id: `bukti-${nomorKamar}-2026-09`,
        tagihanId: `tagihan-${nomorKamar}-2026-09`,
        kamarId: nomorKamar,
        nomorKamar: nomorKamar,
        penghuniId: acc.id,
        penghuniNama: acc.name,
        imageUrl: MOCK_RECEIPT_IMAGE,
        uploadedAt: "2026-09-03T09:15:00Z",
        catatanPenghuni: "Transfer via BCA Mobile a.n. Siti Nurhaliza",
      };
    } else if (nomorKamar === "103" || nomorKamar === "108") {
      statusAktif = "LUNAS";
      metodeAktif = "TRANSFER";
      paidAtAktif = "2026-09-02T10:30:00Z";
      verifiedAtAktif = "2026-09-02T11:00:00Z";
      buktiAktif = {
        id: `bukti-${nomorKamar}-2026-09`,
        tagihanId: `tagihan-${nomorKamar}-2026-09`,
        kamarId: nomorKamar,
        nomorKamar: nomorKamar,
        penghuniId: acc.id,
        penghuniNama: acc.name,
        imageUrl: MOCK_RECEIPT_IMAGE,
        uploadedAt: "2026-09-02T10:15:00Z",
        catatanPenghuni: "Transfer sewa September",
      };
    } else if (nomorKamar === "104") {
      statusAktif = "DITOLAK";
      alasanAktif =
        "Foto bukti transfer buram dan nominal terpotong. Mohon unggah ulang bukti transfer yang jelas.";
      buktiAktif = {
        id: `bukti-${nomorKamar}-2026-09`,
        tagihanId: `tagihan-${nomorKamar}-2026-09`,
        kamarId: nomorKamar,
        nomorKamar: nomorKamar,
        penghuniId: acc.id,
        penghuniNama: acc.name,
        imageUrl: MOCK_RECEIPT_IMAGE,
        uploadedAt: "2026-09-01T11:00:00Z",
        catatanPenghuni: "Transfer via ATM",
      };
    } else if (nomorKamar === "106") {
      statusAktif = "LUNAS";
      metodeAktif = "CASH";
      paidAtAktif = "2026-09-01T14:00:00Z";
      verifiedAtAktif = "2026-09-01T14:05:00Z";
    }

    list.push({
      id: `tagihan-${nomorKamar}-2026-09`,
      kamarId: nomorKamar,
      nomorKamar: nomorKamar,
      penghuniId: acc.id,
      penghuniNama: acc.name,
      periodeBulan: "September 2026",
      tahun: 2026,
      bulan: 9,
      nominal: nominal,
      batasBayar: "10 Sep 2026",
      status: statusAktif,
      metodePembayaran: metodeAktif,
      buktiPembayaran: buktiAktif,
      alasanPenolakan: alasanAktif,
      paidAt: paidAtAktif,
      verifiedAt: verifiedAtAktif,
    });

    // 2. Riwayat: Agustus 2026 (Lunas)
    list.push({
      id: `tagihan-${nomorKamar}-2026-08`,
      kamarId: nomorKamar,
      nomorKamar: nomorKamar,
      penghuniId: acc.id,
      penghuniNama: acc.name,
      periodeBulan: "Agustus 2026",
      tahun: 2026,
      bulan: 8,
      nominal: nominal,
      batasBayar: "10 Agu 2026",
      status: "LUNAS",
      metodePembayaran: "TRANSFER",
      paidAt: "2026-08-05T10:00:00Z",
      verifiedAt: "2026-08-05T10:30:00Z",
      buktiPembayaran: {
        id: `bukti-${nomorKamar}-2026-08`,
        tagihanId: `tagihan-${nomorKamar}-2026-08`,
        kamarId: nomorKamar,
        nomorKamar: nomorKamar,
        penghuniId: acc.id,
        penghuniNama: acc.name,
        imageUrl: MOCK_RECEIPT_IMAGE,
        uploadedAt: "2026-08-05T09:30:00Z",
      },
    });

    // 3. Riwayat: Juli 2026 (Lunas)
    const isCashJuly = parseInt(nomorKamar, 10) % 2 === 0;
    list.push({
      id: `tagihan-${nomorKamar}-2026-07`,
      kamarId: nomorKamar,
      nomorKamar: nomorKamar,
      penghuniId: acc.id,
      penghuniNama: acc.name,
      periodeBulan: "Juli 2026",
      tahun: 2026,
      bulan: 7,
      nominal: nominal,
      batasBayar: "10 Jul 2026",
      status: "LUNAS",
      metodePembayaran: isCashJuly ? "CASH" : "TRANSFER",
      paidAt: "2026-07-06T11:30:00Z",
      verifiedAt: "2026-07-06T11:45:00Z",
      buktiPembayaran: isCashJuly
        ? undefined
        : {
            id: `bukti-${nomorKamar}-2026-07`,
            tagihanId: `tagihan-${nomorKamar}-2026-07`,
            kamarId: nomorKamar,
            nomorKamar: nomorKamar,
            penghuniId: acc.id,
            penghuniNama: acc.name,
            imageUrl: MOCK_RECEIPT_IMAGE,
            uploadedAt: "2026-07-06T11:00:00Z",
          },
    });
  });

  return list;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, get) => ({
      tagihanList: generateInitialTagihan(),
      kamarList: generateInitialKamar(),
      activePeriode: {
        bulan: 9,
        tahun: 2026,
        periodeBulan: "September 2026",
      },

      setActivePeriode: (periode) => {
        set({ activePeriode: periode });
      },

      getTagihanAktifByKamar: (kamarId: string) => {
        const { tagihanList, activePeriode } = get();
        const kamarBills = tagihanList.filter(
          (t) => t.kamarId === kamarId || t.nomorKamar === kamarId,
        );
        if (kamarBills.length === 0) return undefined;

        // 1. Prioritaskan tagihan belum lunas terbaru (termasuk tagihan baru H-7 atau menunggak)
        const unfinalized = kamarBills
          .filter((t) => t.status !== "LUNAS")
          .sort((a, b) =>
            b.tahun !== a.tahun ? b.tahun - a.tahun : b.bulan - a.bulan,
          );

        if (unfinalized.length > 0) {
          return unfinalized[0];
        }

        // 2. Jika semua lunas, ambil tagihan periode aktif berjalan
        return kamarBills.find(
          (t) =>
            t.bulan === activePeriode.bulan && t.tahun === activePeriode.tahun,
        );
      },

      getRiwayatTagihanByKamar: (kamarId: string) => {
        const { tagihanList, activePeriode } = get();
        return tagihanList
          .filter(
            (t) =>
              (t.kamarId === kamarId || t.nomorKamar === kamarId) &&
              (t.tahun < activePeriode.tahun ||
                (t.tahun === activePeriode.tahun &&
                  t.bulan < activePeriode.bulan)),
          )
          .sort((a, b) =>
            b.tahun !== a.tahun ? b.tahun - a.tahun : b.bulan - a.bulan,
          );
      },

      uploadBuktiTransfer: (
        tagihanId: string,
        imageUrl: string,
        catatanPenghuni?: string,
      ) => {
        set((state) => {
          const updatedList = state.tagihanList.map((t) => {
            if (t.id !== tagihanId) return t;

            const bukti: BuktiPembayaran = {
              id: `bukti-${t.nomorKamar}-${Date.now()}`,
              tagihanId: t.id,
              kamarId: t.kamarId,
              nomorKamar: t.nomorKamar,
              penghuniId: t.penghuniId,
              penghuniNama: t.penghuniNama,
              imageUrl,
              uploadedAt: new Date().toISOString(),
              catatanPenghuni,
            };

            return {
              ...t,
              status: "MENUNGGU_VERIFIKASI" as const,
              metodePembayaran: "TRANSFER" as const,
              buktiPembayaran: bukti,
              alasanPenolakan: undefined,
            };
          });

          return { tagihanList: updatedList };
        });
      },

      approveTagihan: (tagihanId: string) => {
        set((state) => ({
          tagihanList: state.tagihanList.map((t) =>
            t.id === tagihanId
              ? {
                  ...t,
                  status: "LUNAS",
                  metodePembayaran: "TRANSFER",
                  verifiedAt: new Date().toISOString(),
                  paidAt: t.paidAt || new Date().toISOString(),
                }
              : t,
          ),
        }));
      },

      rejectTagihan: (tagihanId: string, alasan: string) => {
        set((state) => ({
          tagihanList: state.tagihanList.map((t) =>
            t.id === tagihanId
              ? {
                  ...t,
                  status: "DITOLAK",
                  alasanPenolakan: alasan,
                }
              : t,
          ),
        }));
      },

      markCashTagihan: (tagihanId: string, catatan?: string) => {
        set((state) => ({
          tagihanList: state.tagihanList.map((t) =>
            t.id === tagihanId
              ? {
                  ...t,
                  status: "LUNAS",
                  metodePembayaran: "CASH",
                  paidAt: new Date().toISOString(),
                  verifiedAt: new Date().toISOString(),
                  catatanPemilik: catatan,
                  alasanPenolakan: undefined,
                  buktiPembayaran: undefined,
                }
              : t,
          ),
        }));
      },

      updateNominalTagihan: (tagihanId: string, nominalBaru: number) => {
        set((state) => {
          const existingIndex = state.tagihanList.findIndex(
            (t) => t.id === tagihanId,
          );
          let targetNomorKamar = "";

          let updatedTagihanList = state.tagihanList;
          if (existingIndex >= 0) {
            targetNomorKamar = state.tagihanList[existingIndex].nomorKamar;
            updatedTagihanList = state.tagihanList.map((t) =>
              t.id === tagihanId ? { ...t, nominal: nominalBaru } : t,
            );
          } else {
            const match = tagihanId.match(/^tagihan-([^-]+)/);
            if (match) {
              targetNomorKamar = match[1];
            }
          }

          // Perbarui juga tarif dasar kamar di kamarList
          const updatedKamarList = targetNomorKamar
            ? state.kamarList.map((k) =>
                k.nomorKamar === targetNomorKamar || k.id === targetNomorKamar
                  ? { ...k, tarifBulanan: nominalBaru }
                  : k,
              )
            : state.kamarList;

          return {
            tagihanList: updatedTagihanList,
            kamarList: updatedKamarList,
          };
        });
      },

      buatTagihanPeriodeBaru: (
        bulan: number,
        tahun: number,
        periodeBulan: string,
        batasBayar: string,
      ) => {
        set((state) => {
          const penghuniAccounts = MOCK_USERS.filter(
            (u) => u.role === "PENGHUNI",
          );
          const newTagihan: Tagihan[] = penghuniAccounts.map((acc) => {
            const nomorKamar = acc.nomorKamar || "101";
            const prevTagihan = state.tagihanList.find(
              (t) => t.nomorKamar === nomorKamar,
            );
            const nominal = prevTagihan?.nominal || acc.tarifBulanan || 1500000;

            return {
              id: `tagihan-${nomorKamar}-${tahun}-${String(bulan).padStart(2, "0")}`,
              kamarId: nomorKamar,
              nomorKamar,
              penghuniId: acc.id,
              penghuniNama: acc.name,
              periodeBulan,
              tahun,
              bulan,
              nominal,
              batasBayar,
              status: "BELUM_BAYAR" as const,
            };
          });

          return {
            tagihanList: [...state.tagihanList, ...newTagihan],
            activePeriode: { bulan, tahun, periodeBulan },
          };
        });
      },

      tambahPenghuni: (input: TambahPenghuniInput) => {
        set((state) => {
          const targetKamar = state.kamarList.find(
            (k) => k.id === input.kamarId || k.nomorKamar === input.kamarId,
          );
          if (!targetKamar) return state;

          let tglJatuhTempo = input.tanggalJatuhTempo;
          if (!tglJatuhTempo || tglJatuhTempo < 1 || tglJatuhTempo > 31) {
            const d = new Date(input.tanggalMasuk);
            tglJatuhTempo = isNaN(d.getDate()) ? 1 : d.getDate();
          }

          const penghuniId = `usr-${targetKamar.nomorKamar}-${Date.now().toString().slice(-4)}`;
          const updatedKamarList = state.kamarList.map((k) =>
            k.id === input.kamarId || k.nomorKamar === input.kamarId
              ? {
                  ...k,
                  statusHunian: "TERISI" as const,
                  tanggalMasuk: input.tanggalMasuk,
                  tanggalJatuhTempo: tglJatuhTempo!,
                  penghuni: {
                    id: penghuniId,
                    nama: input.nama.trim(),
                    email: input.email.trim().toLowerCase(),
                    telepon: input.telepon?.trim(),
                  },
                }
              : k,
          );

          // Cek apakah sudah ada tagihan pada periode aktif berjalan
          const activeIndex = state.tagihanList.findIndex(
            (t) =>
              (t.kamarId === targetKamar.id ||
                t.nomorKamar === targetKamar.nomorKamar) &&
              t.bulan === state.activePeriode.bulan &&
              t.tahun === state.activePeriode.tahun,
          );

          const monthShort = state.activePeriode.periodeBulan
            .split(" ")[0]
            .slice(0, 3);
          const batasBayar = `${tglJatuhTempo} ${monthShort} ${state.activePeriode.tahun}`;

          const updatedTagihanList = [...state.tagihanList];
          const existingTagihan =
            activeIndex >= 0 ? state.tagihanList[activeIndex] : null;
          // Jika kamar sebelumnya KOSONG, tagihan yang ada adalah arsip tunggakan penghuni lama yang tidak boleh ditimpa
          const isArchivedOldTenantBill =
            existingTagihan && targetKamar.statusHunian === "KOSONG";

          if (existingTagihan && !isArchivedOldTenantBill) {
            updatedTagihanList[activeIndex] = {
              ...updatedTagihanList[activeIndex],
              penghuniId,
              penghuniNama: input.nama.trim(),
              batasBayar,
            };
          } else {
            const newTagihan: Tagihan = {
              id: `tagihan-${targetKamar.nomorKamar}-${state.activePeriode.tahun}-${String(state.activePeriode.bulan).padStart(2, "0")}${isArchivedOldTenantBill ? `-${penghuniId}` : ""}`,
              kamarId: targetKamar.id,
              nomorKamar: targetKamar.nomorKamar,
              penghuniId,
              penghuniNama: input.nama.trim(),
              periodeBulan: state.activePeriode.periodeBulan,
              tahun: state.activePeriode.tahun,
              bulan: state.activePeriode.bulan,
              nominal: targetKamar.tarifBulanan,
              batasBayar,
              status: "BELUM_BAYAR",
            };
            updatedTagihanList.push(newTagihan);
          }

          return {
            kamarList: updatedKamarList,
            tagihanList: updatedTagihanList,
          };
        });
      },

      ubahEmailPenghuni: (kamarId: string, emailBaru: string) => {
        set((state) => ({
          kamarList: state.kamarList.map((k) =>
            k.id === kamarId || k.nomorKamar === kamarId
              ? {
                  ...k,
                  penghuni: k.penghuni
                    ? { ...k.penghuni, email: emailBaru.trim().toLowerCase() }
                    : null,
                }
              : k,
          ),
        }));
      },

      keluarkanPenghuni: (input: KeluarkanPenghuniInput) => {
        set((state) => {
          const targetKamar = state.kamarList.find(
            (k) => k.id === input.kamarId || k.nomorKamar === input.kamarId,
          );
          if (!targetKamar) return state;

          const updatedKamarList = state.kamarList.map((k) =>
            k.id === input.kamarId || k.nomorKamar === input.kamarId
              ? {
                  ...k,
                  statusHunian: "KOSONG" as const,
                  tanggalMasuk: undefined,
                  penghuni: null,
                }
              : k,
          );

          let updatedTagihanList = state.tagihanList;
          if (input.batalkanTagihanAktif) {
            updatedTagihanList = state.tagihanList.filter((t) => {
              const isTarget =
                t.kamarId === input.kamarId ||
                t.nomorKamar === targetKamar.nomorKamar;
              const isCurrent =
                t.bulan === state.activePeriode.bulan &&
                t.tahun === state.activePeriode.tahun;
              if (isTarget && isCurrent && t.status !== "LUNAS") {
                return false;
              }
              return true;
            });
          }

          return {
            kamarList: updatedKamarList,
            tagihanList: updatedTagihanList,
          };
        });
      },

      sinkronisasiTagihanOtomatis: (referenceDate?: Date) => {
        const ref = referenceDate || new Date();
        set((state) => {
          // 1. Evaluasi dan perbarui status tagihan aktif yang melewati batas bayar menjadi MENUNGGAK
          const updatedTagihanList = state.tagihanList.map((tagihan) => {
            const evaluasi = hitungStatusTagihan(tagihan, ref);
            if (
              evaluasi.isMenunggak &&
              (tagihan.status === "BELUM_BAYAR" || tagihan.status === "DITOLAK")
            ) {
              return { ...tagihan, status: "MENUNGGAK" as const };
            }
            return tagihan;
          });

          // 2. Evaluasi apakah ada kamar terisi yang mencapai H-7 sebelum jatuh tempo berikutnya
          const newTagihanToAdd: Tagihan[] = [];
          state.kamarList.forEach((kamar) => {
            if (kamar.statusHunian === "TERISI" && kamar.penghuni) {
              const h7Check = evaluasiPenerbitanH7(
                kamar,
                updatedTagihanList,
                ref,
              );
              if (h7Check.perluTerbit && h7Check.newTagihanData) {
                const candBulan = h7Check.newTagihanData.bulan!;
                const candTahun = h7Check.newTagihanData.tahun!;
                const newTagihan: Tagihan = {
                  id:
                    h7Check.newTagihanData.id ||
                    `tagihan-${kamar.nomorKamar}-${candTahun}-${String(candBulan).padStart(2, "0")}`,
                  kamarId: kamar.id,
                  nomorKamar: kamar.nomorKamar,
                  penghuniId: kamar.penghuni.id,
                  penghuniNama: kamar.penghuni.nama,
                  periodeBulan: h7Check.newTagihanData.periodeBulan || "",
                  periodeLabel: h7Check.newTagihanData.periodeLabel,
                  periodeMulai: h7Check.newTagihanData.periodeMulai,
                  periodeSelesai: h7Check.newTagihanData.periodeSelesai,
                  tanggalJatuhTempo: h7Check.newTagihanData.tanggalJatuhTempo,
                  tahun: candTahun,
                  bulan: candBulan,
                  nominal: h7Check.newTagihanData.nominal || kamar.tarifBulanan,
                  batasBayar: h7Check.newTagihanData.batasBayar || "",
                  status: "BELUM_BAYAR",
                };
                newTagihanToAdd.push(newTagihan);
              }
            }
          });

          if (newTagihanToAdd.length > 0) {
            return { tagihanList: [...updatedTagihanList, ...newTagihanToAdd] };
          }

          return { tagihanList: updatedTagihanList };
        });
      },

      resetPayments: () => {
        set({
          tagihanList: generateInitialTagihan(),
          kamarList: generateInitialKamar(),
          activePeriode: {
            bulan: 9,
            tahun: 2026,
            periodeBulan: "September 2026",
          },
        });
      },
    }),
    {
      name: "kost-syantika-payments",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

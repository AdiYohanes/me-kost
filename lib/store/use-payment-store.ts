import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Tagihan, PaymentState, BuktiPembayaran } from "@/types/payment";
import { MOCK_USERS } from "@/lib/mock-data";

export const MOCK_RECEIPT_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'><rect width='400' height='600' fill='%23f8fafc'/><rect x='20' y='20' width='360' height='560' rx='16' fill='white' stroke='%23e2e8f0' stroke-width='2'/><circle cx='200' cy='90' r='36' fill='%2310b981'/><path d='M188 90l8 8 16-16' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'/><text x='200' y='160' font-family='sans-serif' font-size='18' font-weight='bold' fill='%230f172a' text-anchor='middle'>TRANSFER BERHASIL</text><text x='200' y='190' font-family='sans-serif' font-size='13' fill='%2364748b' text-anchor='middle'>Kost Syantika</text><line x1='50' y1='220' x2='350' y2='220' stroke='%23e2e8f0' stroke-dasharray='4 4'/><text x='50' y='260' font-family='sans-serif' font-size='12' fill='%2364748b'>Penerima</text><text x='350' y='260' font-family='sans-serif' font-size='13' font-weight='bold' fill='%230f172a' text-anchor='end'>Ibu Hj. Syantika</text><text x='50' y='300' font-family='sans-serif' font-size='12' fill='%2364748b'>Bank Tujuan</text><text x='350' y='300' font-family='sans-serif' font-size='13' font-weight='bold' fill='%230f172a' text-anchor='end'>BCA 8830-192-881</text><rect x='50' y='360' width='300' height='60' rx='8' fill='%23f1f5f9'/><text x='200' y='395' font-family='sans-serif' font-size='11' fill='%23475569' text-anchor='middle'>Bukti Pembayaran Terverifikasi</text></svg>";

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

      getTagihanAktifByKamar: (kamarId: string) => {
        const { tagihanList } = get();
        // Tagihan aktif adalah September 2026 (bulan 9, tahun 2026)
        return tagihanList.find(
          (t) => (t.kamarId === kamarId || t.nomorKamar === kamarId) && t.bulan === 9 && t.tahun === 2026
        );
      },

      getRiwayatTagihanByKamar: (kamarId: string) => {
        const { tagihanList } = get();
        // Riwayat adalah tagihan sebelum bulan berjalan (bulan < 9, tahun <= 2026), diurutkan terbaru ke terlama
        return tagihanList
          .filter(
            (t) =>
              (t.kamarId === kamarId || t.nomorKamar === kamarId) &&
              (t.tahun < 2026 || (t.tahun === 2026 && t.bulan < 9))
          )
          .sort((a, b) => b.bulan - a.bulan);
      },

      uploadBuktiTransfer: (tagihanId: string, imageUrl: string, catatanPenghuni?: string) => {
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
              alasanPenolakan: undefined, // Bersihkan alasan penolakan saat upload ulang
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
              : t
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
              : t
          ),
        }));
      },

      markCashTagihan: (tagihanId: string) => {
        set((state) => ({
          tagihanList: state.tagihanList.map((t) =>
            t.id === tagihanId
              ? {
                  ...t,
                  status: "LUNAS",
                  metodePembayaran: "CASH",
                  paidAt: new Date().toISOString(),
                  verifiedAt: new Date().toISOString(),
                  alasanPenolakan: undefined,
                  buktiPembayaran: undefined,
                }
              : t
          ),
        }));
      },

      resetPayments: () => {
        set({ tagihanList: generateInitialTagihan() });
      },
    }),
    {
      name: "kost-syantika-payments",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

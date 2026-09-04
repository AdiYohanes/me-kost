export type StatusPembayaran =
  | "BELUM_BAYAR"
  | "MENUNGGU_VERIFIKASI"
  | "LUNAS"
  | "DITOLAK";

export type MetodePembayaran = "TRANSFER" | "CASH";

export interface BuktiPembayaran {
  id: string;
  tagihanId: string;
  kamarId: string;
  nomorKamar: string;
  penghuniId: string;
  penghuniNama: string;
  imageUrl: string;
  uploadedAt: string;
  catatanPenghuni?: string;
}

export interface Tagihan {
  id: string;
  kamarId: string;
  nomorKamar: string;
  penghuniId: string;
  penghuniNama: string;
  periodeBulan: string;
  tahun: number;
  bulan: number;
  nominal: number;
  batasBayar: string;
  status: StatusPembayaran;
  metodePembayaran?: MetodePembayaran;
  buktiPembayaran?: BuktiPembayaran;
  alasanPenolakan?: string;
  catatanPemilik?: string;
  paidAt?: string;
  verifiedAt?: string;
}

export interface PaymentState {
  tagihanList: Tagihan[];
  activePeriode: { bulan: number; tahun: number; periodeBulan: string };
  setActivePeriode: (periode: { bulan: number; tahun: number; periodeBulan: string }) => void;
  uploadBuktiTransfer: (
    tagihanId: string,
    imageUrl: string,
    catatanPenghuni?: string
  ) => void;
  getTagihanAktifByKamar: (kamarId: string) => Tagihan | undefined;
  getRiwayatTagihanByKamar: (kamarId: string) => Tagihan[];
  approveTagihan: (tagihanId: string) => void;
  rejectTagihan: (tagihanId: string, alasan: string) => void;
  markCashTagihan: (tagihanId: string, catatan?: string) => void;
  updateNominalTagihan: (tagihanId: string, nominalBaru: number) => void;
  buatTagihanPeriodeBaru: (
    bulan: number,
    tahun: number,
    periodeBulan: string,
    batasBayar: string
  ) => void;
  resetPayments: () => void;
}

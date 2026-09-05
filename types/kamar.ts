export type StatusHunian = "TERISI" | "KOSONG";

export interface PenghuniKamar {
  id: string;
  nama: string;
  email: string;
  telepon?: string;
}

export interface Kamar {
  id: string;
  nomorKamar: string;
  tipeKamar: string;
  tarifBulanan: number;
  statusHunian: StatusHunian;
  tanggalMasuk?: string; // Format ISO string / YYYY-MM-DD
  tanggalJatuhTempo: number; // 1 - 31
  penghuni?: PenghuniKamar | null;
}

export interface TambahPenghuniInput {
  kamarId: string;
  nama: string;
  email: string;
  telepon?: string;
  tanggalMasuk: string;
  tanggalJatuhTempo?: number;
}

export interface UbahEmailPenghuniInput {
  penghuniId?: string;
  userId?: string; // alias backward compatibility
  kamarId?: string;
  emailBaru: string;
}

export interface KeluarkanPenghuniInput {
  kamarId: string;
  penghuniId?: string;
  batalkanTagihanAktif: boolean;
}

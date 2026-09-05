import { Kamar } from "@/types/kamar";
import { Tagihan, StatusPembayaran } from "@/types/payment";

export const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const BULAN_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const ENGLISH_MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/**
 * Format angka 2 digit (leading zero)
 */
export const formatDuaDigit = (angka: number): string => String(angka).padStart(2, "0");

/**
 * Mem-parsing string batas bayar / tanggal jatuh tempo menjadi objek Date.
 * Mendukung format:
 * - "10 Sep 2026"
 * - "15 Oktober 2026"
 * - "2026-09-10"
 * - Tanggal ISO standar
 */
export function parseBatasBayar(batasBayar: string): Date | null {
  if (!batasBayar || typeof batasBayar !== "string") {
    return null;
  }

  const trimmed = batasBayar.trim();
  if (!trimmed) return null;

  // Format ISO / YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const tahun = parseInt(isoMatch[1], 10);
    const bulanIndex = parseInt(isoMatch[2], 10) - 1;
    const hari = parseInt(isoMatch[3], 10);
    return new Date(tahun, bulanIndex, hari, 23, 59, 59, 999);
  }

  // Format Indonesia atau teks: "10 Sep 2026" atau "15 Oktober 2026"
  const bagian = trimmed.split(/\s+/);
  if (bagian.length >= 3) {
    const hari = parseInt(bagian[0], 10);
    const teksBulan = bagian[1].toLowerCase();
    const tahun = parseInt(bagian[2], 10);

    if (!isNaN(hari) && !isNaN(tahun)) {
      let bulanIndex = BULAN_SHORT.findIndex(
        (m) => m.toLowerCase() === teksBulan
      );
      if (bulanIndex === -1) {
        bulanIndex = BULAN_NAMES.findIndex(
          (m) => m.toLowerCase() === teksBulan
        );
      }
      if (bulanIndex === -1 && ENGLISH_MONTHS[teksBulan.slice(0, 3)] !== undefined) {
        bulanIndex = ENGLISH_MONTHS[teksBulan.slice(0, 3)];
      }

      if (bulanIndex >= 0) {
        return new Date(tahun, bulanIndex, hari, 23, 59, 59, 999);
      }
    }
  }

  const hasilParse = new Date(trimmed);
  if (!isNaN(hasilParse.getTime())) {
    return new Date(
      hasilParse.getFullYear(),
      hasilParse.getMonth(),
      hasilParse.getDate(),
      23,
      59,
      59,
      999
    );
  }

  return null;
}

/**
 * Format label periode sewa dari dua tanggal, contoh: "15 Sep - 14 Okt 2026"
 */
export function formatPeriodeLabel(tanggalAwal: Date, tanggalAkhir: Date): string {
  const hariAwal = tanggalAwal.getDate();
  const hariAkhir = tanggalAkhir.getDate();
  const bulanAwal = BULAN_SHORT[tanggalAwal.getMonth()];
  const bulanAkhir = BULAN_SHORT[tanggalAkhir.getMonth()];
  const tahunAwal = tanggalAwal.getFullYear();
  const tahunAkhir = tanggalAkhir.getFullYear();

  if (tahunAwal === tahunAkhir) {
    return `${hariAwal} ${bulanAwal} - ${hariAkhir} ${bulanAkhir} ${tahunAwal}`;
  }
  return `${hariAwal} ${bulanAwal} ${tahunAwal} - ${hariAkhir} ${bulanAkhir} ${tahunAkhir}`;
}

/**
 * Menghitung periode sewa mandiri bulanan berdasarkan tanggal masuk penghuni dan tanggal jatuh tempo.
 */
export function hitungPeriodeSewa(
  tanggalMasuk: string,
  tanggalJatuhTempo: number,
  tanggalAcuan: Date = new Date()
): {
  periodeMulai: string;
  periodeSelesai: string;
  periodeLabel: string;
  batasBayar: string;
  bulan: number;
  tahun: number;
} {
  const masuk = new Date(tanggalMasuk);
  const validMasuk = !isNaN(masuk.getTime()) ? masuk : tanggalAcuan;

  const acuan = new Date(tanggalAcuan);
  const tahunAcuan = acuan.getFullYear();
  const bulanAcuan = acuan.getMonth();

  let awalSiklus = new Date(tahunAcuan, bulanAcuan, tanggalJatuhTempo);
  if (acuan < awalSiklus && validMasuk < awalSiklus) {
    awalSiklus = new Date(tahunAcuan, bulanAcuan - 1, tanggalJatuhTempo);
  }

  // Jika siklus dimulai sebelum tanggal masuk, sesuaikan
  if (awalSiklus < validMasuk) {
    awalSiklus = new Date(validMasuk);
  }

  const akhirSiklus = new Date(
    awalSiklus.getFullYear(),
    awalSiklus.getMonth() + 1,
    awalSiklus.getDate() - 1
  );

  const namaBulanSingkat = BULAN_SHORT[awalSiklus.getMonth()];
  const batasBayar = `${tanggalJatuhTempo} ${namaBulanSingkat} ${awalSiklus.getFullYear()}`;
  const periodeLabel = formatPeriodeLabel(awalSiklus, akhirSiklus);

  const formatTanggalIso = (d: Date) =>
    `${d.getFullYear()}-${formatDuaDigit(d.getMonth() + 1)}-${formatDuaDigit(d.getDate())}`;

  return {
    periodeMulai: formatTanggalIso(awalSiklus),
    periodeSelesai: formatTanggalIso(akhirSiklus),
    periodeLabel,
    batasBayar,
    bulan: awalSiklus.getMonth() + 1,
    tahun: awalSiklus.getFullYear(),
  };
}

export interface EvaluasiTagihanResult {
  statusVisual: StatusPembayaran;
  labelStatus: string;
  isMenunggak: boolean;
  telatHari: number;
  isH3: boolean;
  sisaHari: number;
}

/**
 * Mengevaluasi status pembayaran tagihan:
 * - Lunas & Menunggu Verifikasi tidak menunggak
 * - Belum Bayar & Ditolak:
 *   - Jika telah melampaui tanggal jatuh tempo: MENUNGGAK (Telat X Hari)
 *   - Jika dalam rentang 3 hari sebelum jatuh tempo: isH3 = true
 */
export function hitungStatusTagihan(
  tagihan: Tagihan,
  tanggalAcuan: Date = new Date()
): EvaluasiTagihanResult {
  if (tagihan.status === "LUNAS") {
    return {
      statusVisual: "LUNAS",
      labelStatus: "Lunas",
      isMenunggak: false,
      telatHari: 0,
      isH3: false,
      sisaHari: 0,
    };
  }

  if (tagihan.status === "MENUNGGU_VERIFIKASI") {
    return {
      statusVisual: "MENUNGGU_VERIFIKASI",
      labelStatus: "Menunggu Verifikasi",
      isMenunggak: false,
      telatHari: 0,
      isH3: false,
      sisaHari: 0,
    };
  }

  const tanggalBatasBayar = parseBatasBayar(
    tagihan.batasBayar || tagihan.tanggalJatuhTempo || ""
  );
  if (!tanggalBatasBayar) {
    const isDitolak = tagihan.status === "DITOLAK";
    return {
      statusVisual: tagihan.status,
      labelStatus: isDitolak ? "Ditolak" : "Belum Bayar",
      isMenunggak: false,
      telatHari: 0,
      isH3: false,
      sisaHari: 0,
    };
  }

  const acuan = new Date(tanggalAcuan);

  if (acuan.getTime() > tanggalBatasBayar.getTime()) {
    const selisihMs = acuan.getTime() - tanggalBatasBayar.getTime();
    const telatHari = Math.max(1, Math.ceil(selisihMs / (1000 * 60 * 60 * 24)));
    return {
      statusVisual: "MENUNGGAK",
      labelStatus: `MENUNGGAK (Telat ${telatHari} Hari)`,
      isMenunggak: true,
      telatHari,
      isH3: false,
      sisaHari: 0,
    };
  }

  const selisihMs = tanggalBatasBayar.getTime() - acuan.getTime();
  const sisaHari = Math.max(0, Math.floor(selisihMs / (1000 * 60 * 60 * 24)));
  const isH3 = sisaHari <= 3 && sisaHari >= 0;

  return {
    statusVisual: tagihan.status,
    labelStatus: tagihan.status === "DITOLAK" ? "Ditolak" : "Belum Bayar",
    isMenunggak: false,
    telatHari: 0,
    isH3,
    sisaHari,
  };
}

export interface EvaluasiH7Result {
  perluTerbit: boolean;
  newTagihanData?: Omit<Tagihan, "id"> & { id?: string };
}

/**
 * Mengevaluasi apakah kamar terisi telah mencapai batas H-7 sebelum tanggal jatuh tempo berikutnya
 * dan belum memiliki tagihan terbit untuk periode tersebut.
 */
export function evaluasiPenerbitanH7(
  kamar: Kamar,
  existingTagihanList: Tagihan[],
  tanggalAcuan: Date = new Date()
): EvaluasiH7Result {
  if (kamar.statusHunian !== "TERISI" || !kamar.penghuni) {
    return { perluTerbit: false };
  }

  const acuan = new Date(tanggalAcuan);
  const tahunAcuan = acuan.getFullYear();
  const bulanAcuan = acuan.getMonth(); // 0-11

  // Periksa kandidat periode: siklus bulan ini dan siklus bulan depan
  const kandidatPeriodeList = [
    { tahun: tahunAcuan, bulan: bulanAcuan + 1 },
    {
      tahun: bulanAcuan === 11 ? tahunAcuan + 1 : tahunAcuan,
      bulan: bulanAcuan === 11 ? 1 : bulanAcuan + 2,
    },
  ];

  for (const kandidat of kandidatPeriodeList) {
    const jumlahHariBulan = new Date(kandidat.tahun, kandidat.bulan, 0).getDate();
    const hariJatuhTempo = Math.min(kamar.tanggalJatuhTempo, jumlahHariBulan);
    const tanggalJatuhTempoDate = new Date(
      kandidat.tahun,
      kandidat.bulan - 1,
      hariJatuhTempo,
      23,
      59,
      59,
      999
    );

    // Batas H-7 dimulai 7 hari kalender sebelum tanggal jatuh tempo pada pukul 00:00
    const tanggalMulaiH7 = new Date(
      tanggalJatuhTempoDate.getFullYear(),
      tanggalJatuhTempoDate.getMonth(),
      tanggalJatuhTempoDate.getDate() - 7,
      0,
      0,
      0,
      0
    );

    if (acuan >= tanggalMulaiH7) {
      // Cek apakah sudah ada tagihan untuk kamar ini di bulan & tahun ini
      const sudahAdaTagihan = existingTagihanList.some(
        (t) =>
          (t.kamarId === kamar.id || t.nomorKamar === kamar.nomorKamar) &&
          t.bulan === kandidat.bulan &&
          t.tahun === kandidat.tahun
      );

      if (!sudahAdaTagihan) {
        // Hitung rentang siklus mandiri (misal: 15 Okt - 14 Nov 2026)
        const tanggalMulaiSiklus = new Date(
          kandidat.tahun,
          kandidat.bulan - 1,
          hariJatuhTempo
        );
        const tanggalSelesaiSiklus = new Date(
          tanggalMulaiSiklus.getFullYear(),
          tanggalMulaiSiklus.getMonth() + 1,
          tanggalMulaiSiklus.getDate() - 1
        );

        const formatIso = (d: Date) =>
          `${d.getFullYear()}-${formatDuaDigit(d.getMonth() + 1)}-${formatDuaDigit(d.getDate())}`;

        const namaBulanSingkat = BULAN_SHORT[kandidat.bulan - 1];
        const batasBayar = `${hariJatuhTempo} ${namaBulanSingkat} ${kandidat.tahun}`;
        const periodeLabel = formatPeriodeLabel(tanggalMulaiSiklus, tanggalSelesaiSiklus);
        const periodeBulan = `${BULAN_NAMES[kandidat.bulan - 1]} ${kandidat.tahun}`;
        const id = `tagihan-${kamar.nomorKamar}-${kandidat.tahun}-${formatDuaDigit(kandidat.bulan)}`;

        return {
          perluTerbit: true,
          newTagihanData: {
            id,
            kamarId: kamar.id,
            nomorKamar: kamar.nomorKamar,
            penghuniId: kamar.penghuni.id,
            penghuniNama: kamar.penghuni.nama,
            periodeBulan,
            periodeLabel,
            periodeMulai: formatIso(tanggalMulaiSiklus),
            periodeSelesai: formatIso(tanggalSelesaiSiklus),
            tanggalJatuhTempo: formatIso(tanggalMulaiSiklus),
            tahun: kandidat.tahun,
            bulan: kandidat.bulan,
            nominal: kamar.tarifBulanan,
            batasBayar,
            status: "BELUM_BAYAR",
          },
        };
      }
    }
  }

  return { perluTerbit: false };
}

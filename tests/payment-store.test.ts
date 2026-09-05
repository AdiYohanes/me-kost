import { describe, it, expect, beforeEach } from "vitest";
import { usePaymentStore } from "@/lib/store/use-payment-store";

describe("usePaymentStore", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("menginisialisasi seed tagihan untuk kamar 101-108 beserta riwayat pembayaran", () => {
    const { tagihanList } = usePaymentStore.getState();
    expect(tagihanList.length).toBeGreaterThanOrEqual(8);

    // Memastikan kamar 101 memiliki tagihan aktif bulan September 2026
    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihan101).toBeDefined();
    expect(tagihan101?.nomorKamar).toBe("101");
    expect(tagihan101?.periodeBulan).toBe("September 2026");
    expect(tagihan101?.status).toBe("BELUM_BAYAR");
    expect(tagihan101?.nominal).toBe(1500000);
  });

  it("mengambil riwayat tagihan bulan sebelumnya untuk kamar", () => {
    const riwayat = usePaymentStore.getState().getRiwayatTagihanByKamar("101");
    expect(riwayat.length).toBeGreaterThanOrEqual(2);
    expect(riwayat[0].periodeBulan).toBe("Agustus 2026");
    expect(riwayat[0].status).toBe("LUNAS");
    expect(riwayat[1].periodeBulan).toBe("Juli 2026");
    expect(riwayat[1].status).toBe("LUNAS");
  });

  it("dapat mengunggah bukti transfer dan mengubah status dari BELUM_BAYAR menjadi MENUNGGU_VERIFIKASI", () => {
    const tagihanAktif = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihanAktif).toBeDefined();

    const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    usePaymentStore.getState().uploadBuktiTransfer(tagihanAktif!.id, mockBase64, "Sudah transfer via BCA");

    const updated = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(updated?.status).toBe("MENUNGGU_VERIFIKASI");
    expect(updated?.buktiPembayaran).toBeDefined();
    expect(updated?.buktiPembayaran?.imageUrl).toBe(mockBase64);
    expect(updated?.buktiPembayaran?.catatanPenghuni).toBe("Sudah transfer via BCA");
    expect(updated?.buktiPembayaran?.uploadedAt).toBeDefined();
  });

  it("menghapus alasan penolakan dan mengubah status ke MENUNGGU_VERIFIKASI saat mengunggah ulang tagihan DITOLAK", () => {
    // Kamar 104 disiapkan dengan status awal DITOLAK
    const tagihan104 = usePaymentStore.getState().getTagihanAktifByKamar("104");
    expect(tagihan104?.status).toBe("DITOLAK");
    expect(tagihan104?.alasanPenolakan).toBeTruthy();

    const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...";
    usePaymentStore.getState().uploadBuktiTransfer(tagihan104!.id, mockBase64, "Ini bukti transfer baru yang jelas");

    const updated = usePaymentStore.getState().getTagihanAktifByKamar("104");
    expect(updated?.status).toBe("MENUNGGU_VERIFIKASI");
    expect(updated?.alasanPenolakan).toBeUndefined();
    expect(updated?.buktiPembayaran?.imageUrl).toBe(mockBase64);
  });

  it("dapat menandai lunas tunai (markCashTagihan) dengan metode CASH, waktu pelunasan, dan catatan pemilik", () => {
    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihan101?.status).toBe("BELUM_BAYAR");

    usePaymentStore
      .getState()
      .markCashTagihan(tagihan101!.id, "Diterima tunai di ruang pengelola");

    const updated = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(updated?.status).toBe("LUNAS");
    expect(updated?.metodePembayaran).toBe("CASH");
    expect(updated?.paidAt).toBeDefined();
    expect(updated?.verifiedAt).toBeDefined();
    expect(updated?.catatanPemilik).toBe("Diterima tunai di ruang pengelola");
  });

  it("dapat mengubah nominal tagihan kamar tertentu (updateNominalTagihan)", () => {
    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihan101?.nominal).toBe(1500000);

    usePaymentStore.getState().updateNominalTagihan(tagihan101!.id, 1650000);

    const updated = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(updated?.nominal).toBe(1650000);
  });

  it("dapat membuat tagihan periode bulan baru untuk seluruh kamar (buatTagihanPeriodeBaru)", () => {
    usePaymentStore
      .getState()
      .buatTagihanPeriodeBaru(10, 2026, "Oktober 2026", "10 Okt 2026");

    const { tagihanList } = usePaymentStore.getState();
    const tagihanOktober = tagihanList.filter(
      (t) => t.bulan === 10 && t.tahun === 2026
    );

    // Harus terbuat untuk seluruh 8 kamar
    expect(tagihanOktober.length).toBe(8);
    tagihanOktober.forEach((t) => {
      expect(t.status).toBe("BELUM_BAYAR");
      expect(t.periodeBulan).toBe("Oktober 2026");
      expect(t.batasBayar).toBe("10 Okt 2026");
    });
  });

  it("dapat mengembalikan seluruh state ke kondisi seed awal melalui resetPayments", () => {
    // Ubah status dan nominal
    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    usePaymentStore.getState().markCashTagihan(tagihan101!.id, "Catatan test");
    usePaymentStore.getState().updateNominalTagihan(tagihan101!.id, 2000000);

    expect(usePaymentStore.getState().getTagihanAktifByKamar("101")?.status).toBe("LUNAS");

    // Lakukan reset
    usePaymentStore.getState().resetPayments();

    const reset101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(reset101?.status).toBe("BELUM_BAYAR");
    expect(reset101?.nominal).toBe(1500000);
    expect(reset101?.catatanPemilik).toBeUndefined();
  });

  describe("Manajemen Kamar & Siklus Hidup Penghuni (Issue 03)", () => {
    it("menginisialisasi 8 kamar fisik dengan status hunian default TERISI", () => {
      const { kamarList } = usePaymentStore.getState();
      expect(kamarList.length).toBe(8);
      expect(kamarList[0].nomorKamar).toBe("101");
      expect(kamarList[0].statusHunian).toBe("TERISI");
      expect(kamarList[0].penghuni?.nama).toBe("Rizky Ramadhan");
      expect(kamarList[7].nomorKamar).toBe("108");
    });

    it("dapat melepaskan penghuni keluar kost (keluarkanPenghuni - soft disconnect) dengan membatalkan tagihan aktif", () => {
      // Kamar 101 awalnya terisi dan memiliki tagihan aktif September 2026
      expect(usePaymentStore.getState().getTagihanAktifByKamar("101")).toBeDefined();

      usePaymentStore.getState().keluarkanPenghuni({
        kamarId: "101",
        batalkanTagihanAktif: true,
      });

      const { kamarList, tagihanList } = usePaymentStore.getState();
      const kamar101 = kamarList.find((k) => k.nomorKamar === "101");

      // Status kamar menjadi KOSONG dan data penghuni dikosongkan
      expect(kamar101?.statusHunian).toBe("KOSONG");
      expect(kamar101?.penghuni).toBeNull();
      expect(kamar101?.tanggalMasuk).toBeUndefined();

      // Tagihan aktif September (Belum Bayar) dihapus
      const tagihanAktif101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
      expect(tagihanAktif101).toBeUndefined();

      // Riwayat tagihan Agustus 2026 yang LUNAS tetap utuh dengan nama penghuni tersimpan
      const riwayatAgustus = tagihanList.find(
        (t) => t.nomorKamar === "101" && t.bulan === 8 && t.tahun === 2026
      );
      expect(riwayatAgustus).toBeDefined();
      expect(riwayatAgustus?.penghuniNama).toBe("Rizky Ramadhan");
      expect(riwayatAgustus?.status).toBe("LUNAS");
    });

    it("dapat melepaskan penghuni keluar kost dengan mempertahankan tagihan aktif sebagai arsip tunggakan", () => {
      usePaymentStore.getState().keluarkanPenghuni({
        kamarId: "101",
        batalkanTagihanAktif: false, // Pertahankan arsip
      });

      const { kamarList } = usePaymentStore.getState();
      const kamar101 = kamarList.find((k) => k.nomorKamar === "101");
      expect(kamar101?.statusHunian).toBe("KOSONG");

      // Tagihan September tetap ada sebagai arsip
      const tagihanAktif101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
      expect(tagihanAktif101).toBeDefined();
      expect(tagihanAktif101?.penghuniNama).toBe("Rizky Ramadhan");
    });

    it("dapat mendaftarkan anak kost baru pada kamar kosong (+ Tambah Penghuni) dan otomatis menyetel tanggal jatuh tempo", () => {
      // 1. Kosongkan kamar 105 terlebih dahulu
      usePaymentStore.getState().keluarkanPenghuni({
        kamarId: "105",
        batalkanTagihanAktif: true,
      });

      expect(
        usePaymentStore.getState().kamarList.find((k) => k.nomorKamar === "105")
          ?.statusHunian
      ).toBe("KOSONG");

      // 2. Tambah penghuni baru dengan tanggal masuk 18 September 2026
      usePaymentStore.getState().tambahPenghuni({
        kamarId: "105",
        nama: "Dewi Putri S.",
        email: "dewi.putri@gmail.com",
        telepon: "0812-9988-7766",
        tanggalMasuk: "2026-09-18",
      });

      const { kamarList } = usePaymentStore.getState();
      const kamar105 = kamarList.find((k) => k.nomorKamar === "105");

      // Kamar menjadi TERISI
      expect(kamar105?.statusHunian).toBe("TERISI");
      expect(kamar105?.penghuni?.nama).toBe("Dewi Putri S.");
      expect(kamar105?.penghuni?.email).toBe("dewi.putri@gmail.com");
      expect(kamar105?.penghuni?.telepon).toBe("0812-9988-7766");
      expect(kamar105?.tanggalMasuk).toBe("2026-09-18");

      // Tanggal jatuh tempo otomatis mengikuti tanggal masuk (18)
      expect(kamar105?.tanggalJatuhTempo).toBe(18);

      // Tagihan aktif otomatis diterbitkan untuk penghuni baru
      const tagihanAktif105 = usePaymentStore.getState().getTagihanAktifByKamar("105");
      expect(tagihanAktif105).toBeDefined();
      expect(tagihanAktif105?.penghuniNama).toBe("Dewi Putri S.");
      expect(tagihanAktif105?.status).toBe("BELUM_BAYAR");
      expect(tagihanAktif105?.batasBayar).toContain("18");
    });

    it("dapat memperbarui email Google terdaftar penghuni pada kartu kamar (ubahEmailPenghuni)", () => {
      usePaymentStore.getState().ubahEmailPenghuni("102", "siti.baru@gmail.com");

      const kamar102 = usePaymentStore
        .getState()
        .kamarList.find((k) => k.nomorKamar === "102");

      expect(kamar102?.penghuni?.email).toBe("siti.baru@gmail.com");
    });

    it("mempertahankan arsip tagihan penghuni lama saat penghuni baru didaftarkan di kamar yang sama", () => {
      // 1. Keluarkan penghuni kamar 103 dengan mempertahankan tagihan aktif sebagai arsip tunggakan
      const namaPenghuniLama = usePaymentStore
        .getState()
        .kamarList.find((k) => k.nomorKamar === "103")?.penghuni?.nama;
      expect(namaPenghuniLama).toBeTruthy();

      usePaymentStore.getState().keluarkanPenghuni({
        kamarId: "103",
        batalkanTagihanAktif: false,
      });

      // Kamar 103 sekarang KOSONG
      expect(
        usePaymentStore.getState().kamarList.find((k) => k.nomorKamar === "103")?.statusHunian
      ).toBe("KOSONG");

      // Tagihan lama tetap ada dengan nama penghuni lama
      const tagihanArsipLama = usePaymentStore
        .getState()
        .tagihanList.find((t) => t.nomorKamar === "103" && t.penghuniNama === namaPenghuniLama);
      expect(tagihanArsipLama).toBeDefined();

      // 2. Daftarkan penghuni baru pada kamar 103 di bulan yang sama
      usePaymentStore.getState().tambahPenghuni({
        kamarId: "103",
        nama: "Rizky Ramadhan",
        email: "rizky.ramadhan@gmail.com",
        tanggalMasuk: "2026-09-20",
      });

      // Tagihan arsip milik penghuni lama tetap utuh dengan nama penghuni lama
      const tagihanArsipSetelahnya = usePaymentStore
        .getState()
        .tagihanList.find((t) => t.nomorKamar === "103" && t.penghuniNama === namaPenghuniLama);
      expect(tagihanArsipSetelahnya).toBeDefined();
      expect(tagihanArsipSetelahnya?.penghuniNama).toBe(namaPenghuniLama);

      // Tagihan baru dibuatkan khusus untuk penghuni baru
      const tagihanPenghuniBaru = usePaymentStore
        .getState()
        .tagihanList.find((t) => t.nomorKamar === "103" && t.penghuniNama === "Rizky Ramadhan");
      expect(tagihanPenghuniBaru).toBeDefined();
      expect(tagihanPenghuniBaru?.penghuniNama).toBe("Rizky Ramadhan");
      expect(tagihanPenghuniBaru?.status).toBe("BELUM_BAYAR");
    });
  });

  describe("Siklus Tagihan Mandiri, Terbit H-7, & Deteksi Menunggak (Issue 04)", () => {
    it("menerbitkan tagihan periode berikutnya secara otomatis saat mencapai H-7", () => {
      // Kamar 103 lunas di September 2026. Tanggal jatuh tempo: 10.
      // Untuk Oktober 2026, tanggal jatuh tempo adalah 10 Oktober. H-7 adalah 3 Oktober.
      // Jalankan sinkronisasi pada tanggal 4 Oktober 2026 (H-6)
      const refDate = new Date(2026, 9, 4);
      usePaymentStore.getState().sinkronisasiTagihanOtomatis(refDate);

      const tagihanOktober103 = usePaymentStore
        .getState()
        .tagihanList.find((t) => t.nomorKamar === "103" && t.bulan === 10 && t.tahun === 2026);

      expect(tagihanOktober103).toBeDefined();
      expect(tagihanOktober103?.status).toBe("BELUM_BAYAR");
      expect(tagihanOktober103?.penghuniNama).toBe("Budi Santoso");
      expect(tagihanOktober103?.nominal).toBe(1500000);
      expect(tagihanOktober103?.batasBayar).toContain("10 Okt 2026");
    });

    it("mengubah status tagihan belum bayar menjadi MENUNGGAK jika telah melewati batas bayar", () => {
      // Kamar 101 memiliki tagihan September 2026 dengan batas bayar 10 Sep 2026 (BELUM_BAYAR)
      const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
      expect(tagihan101?.status).toBe("BELUM_BAYAR");

      // Simulasikan tanggal 14 September 2026 (terlambat 4 hari)
      const refDate = new Date(2026, 8, 14);
      usePaymentStore.getState().sinkronisasiTagihanOtomatis(refDate);

      const updated101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
      expect(updated101?.status).toBe("MENUNGGAK");
    });

    it("tidak mengubah status tagihan LUNAS atau MENUNGGU_VERIFIKASI menjadi MENUNGGAK", () => {
      // Kamar 102 (MENUNGGU_VERIFIKASI) dan Kamar 103 (LUNAS)
      const refDate = new Date(2026, 8, 14); // Melewati batas bayar 10 Sep
      usePaymentStore.getState().sinkronisasiTagihanOtomatis(refDate);

      const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
      const tagihan103 = usePaymentStore.getState().getTagihanAktifByKamar("103");

      expect(tagihan102?.status).toBe("MENUNGGU_VERIFIKASI");
      expect(tagihan103?.status).toBe("LUNAS");
    });
  });
});




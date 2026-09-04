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
});

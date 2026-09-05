import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { PenghuniDashboardView } from "@/components/dashboard/penghuni-dashboard-view";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { UserSession } from "@/types/auth";

const mockPenghuni101: UserSession = {
  id: "usr-101",
  username: "101",
  name: "Rizky Ramadhan",
  role: "PENGHUNI",
  nomorKamar: "101",
  tipeKamar: "Kamar Deluxe Lt. 1",
  tarifBulanan: 1500000,
  phone: "0812-9876-101",
};

const mockPenghuni104: UserSession = {
  id: "usr-104",
  username: "104",
  name: "Dimas Anggara",
  role: "PENGHUNI",
  nomorKamar: "104",
  tipeKamar: "Kamar Standard Lt. 1",
  tarifBulanan: 1300000,
  phone: "0812-9876-104",
};

describe("PenghuniDashboardView - Tiket #03 Kriteria Lengkap", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("1. Header Penghuni menampilkan nomor Kamar, nama Penghuni, dan tipe kamar", () => {
    render(<PenghuniDashboardView user={mockPenghuni101} />);

    expect(screen.getByText(/Kamar 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Halo, Rizky Ramadhan/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamar Deluxe Lt\. 1/i)).toBeInTheDocument();
  });

  it("2. Kartu Tagihan aktif menampilkan periode, nominal sewa terformat, batas bayar, dan badge Status Pembayaran", () => {
    render(<PenghuniDashboardView user={mockPenghuni101} />);

    expect(screen.getAllByText(/September 2026/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Rp 1\.500\.000/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/10 Sep 2026/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Belum Bayar")).toBeInTheDocument();
  });

  it("3 & 4. Pengunggahan bukti transfer mengonversi Base64, menyimpan ke state lokal persisten, dan mengubah status ke Menunggu Verifikasi", async () => {
    render(<PenghuniDashboardView user={mockPenghuni101} />);

    // Buka upload
    const uploadBtn = screen.getByRole("button", { name: /Unggah Bukti Transfer/i });
    fireEvent.click(uploadBtn);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const file = new File(["dummy transfer"], "bukti-transfer.png", { type: "image/png" });
    const mockBase64 = "data:image/png;base64,mockValidBase64TransferReceipt";

    const originalFileReader = window.FileReader;
    class MockFileReader {
      result: string = "";
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL() {
        this.result = mockBase64;
        if (this.onload) {
          this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
        }
      }
    }
    window.FileReader = MockFileReader as unknown as typeof FileReader;

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Pratinjau instan muncul
    await waitFor(() => {
      const previewImg = screen.getByAltText(/Pratinjau Bukti Pembayaran/i);
      expect(previewImg).toBeInTheDocument();
      expect(previewImg).toHaveAttribute("src", mockBase64);
    });

    // Kirim bukti transfer
    const submitBtn = screen.getByRole("button", { name: /Kirim Bukti Pembayaran/i });
    fireEvent.click(submitBtn);

    // Verifikasi perubahan status di tampilan & di store Zustand
    await waitFor(() => {
      expect(screen.getByText("Menunggu Verifikasi")).toBeInTheDocument();
      expect(screen.getByText(/Sedang Ditinjau Pemilik Kost/i)).toBeInTheDocument();
    });

    const storedTagihan = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(storedTagihan?.status).toBe("MENUNGGU_VERIFIKASI");
    expect(storedTagihan?.buktiPembayaran?.imageUrl).toBe(mockBase64);

    window.FileReader = originalFileReader;
  });

  it("5. Tombol Bayar Tunai membuka dialog panduan pembayaran tunai dan kontak langsung ke Pemilik Kost", () => {
    render(<PenghuniDashboardView user={mockPenghuni101} />);

    const tunaiBtn = screen.getByRole("button", { name: /Informasi Bayar Tunai/i });
    fireEvent.click(tunaiBtn);

    expect(screen.getByText(/Panduan Pembayaran Tunai/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ibu Hj\. Syantika/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/0812-3456-7890/i)).toBeInTheDocument();
  });

  it("6. Jika status Ditolak, Penghuni melihat kartu peringatan berisi Alasan Penolakan dan tombol unggah ulang", () => {
    render(<PenghuniDashboardView user={mockPenghuni104} />);

    expect(screen.getByText("Ditolak")).toBeInTheDocument();
    expect(screen.getByText(/Alasan Penolakan dari Pemilik Kost/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Foto bukti transfer buram dan nominal terpotong/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Unggah Ulang Bukti Transfer/i })).toBeInTheDocument();
  });

  it("7. Bagian riwayat pembayaran menampilkan daftar tagihan bulan-bulan sebelumnya beserta status dan thumbnail bukti", () => {
    render(<PenghuniDashboardView user={mockPenghuni101} />);

    expect(screen.getByText(/Riwayat Pembayaran/i)).toBeInTheDocument();
    expect(screen.getByText("Agustus 2026")).toBeInTheDocument();
    expect(screen.getByText("Juli 2026")).toBeInTheDocument();

    const badges = screen.getAllByText("Lunas");
    expect(badges.length).toBeGreaterThanOrEqual(2);

    const viewReceiptButtons = screen.getAllByRole("button", { name: /Lihat Bukti/i });
    expect(viewReceiptButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("8. Perubahan status dari aksi Pemilik Kost (Approve atau Reject) langsung tercermin secara reaktif di dashboard Penghuni", async () => {
    // Kamar 102 awalnya Menunggu Verifikasi
    const mockPenghuni102: UserSession = {
      id: "usr-102",
      username: "102",
      name: "Siti Nurhaliza",
      role: "PENGHUNI",
      nomorKamar: "102",
      tipeKamar: "Kamar Standard Lt. 1",
      tarifBulanan: 1300000,
    };

    const { unmount } = render(<PenghuniDashboardView user={mockPenghuni102} />);
    expect(screen.getByText("Menunggu Verifikasi")).toBeInTheDocument();

    // Pemilik Kost menyetujui tagihan kamar 102
    const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
    act(() => {
      usePaymentStore.getState().approveTagihan(tagihan102!.id);
    });

    // Di tampilan Penghuni langsung berubah menjadi Lunas
    await waitFor(() => {
      expect(screen.getAllByText("Lunas").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Tagihan Periode Ini Telah Lunas/i)).toBeInTheDocument();
    });

    unmount();

    // Uji skenario Reject: Kamar 107 ditolak Pemilik Kost
    const mockPenghuni107: UserSession = {
      id: "usr-107",
      username: "107",
      name: "Dewi Lestari",
      role: "PENGHUNI",
      nomorKamar: "107",
      tipeKamar: "Kamar Deluxe Lt. 2",
      tarifBulanan: 1500000,
    };

    render(<PenghuniDashboardView user={mockPenghuni107} />);
    expect(screen.getByText("Menunggu Verifikasi")).toBeInTheDocument();

    const tagihan107 = usePaymentStore.getState().getTagihanAktifByKamar("107");
    act(() => {
      usePaymentStore.getState().rejectTagihan(tagihan107!.id, "Bukti pembayaran tidak valid dan terpotong.");
    });

    await waitFor(() => {
      expect(screen.getByText("Ditolak")).toBeInTheDocument();
      expect(screen.getByText(/Bukti pembayaran tidak valid dan terpotong\./i)).toBeInTheDocument();
    });
  });

  it("9. Menampilkan banner pengingat amber mencolok pada H-3 sebelum tanggal jatuh tempo dengan informasi nominal dan tanggal batas bayar", () => {
    const in2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const batasBayarH3 = `${in2Days.getDate()} ${bulanPendek[in2Days.getMonth()]} ${in2Days.getFullYear()}`;

    usePaymentStore.setState((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.nomorKamar === "101"
          ? { ...t, batasBayar: batasBayarH3, status: "BELUM_BAYAR" as const }
          : t
      ),
    }));

    render(<PenghuniDashboardView user={mockPenghuni101} />);

    const banner = screen.getByTestId("banner-pengingat-h3");
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveTextContent(/Pengingat Jatuh Tempo \(H-3\)/i);
    expect(banner).toHaveTextContent(/Rp 1\.500\.000/i);
    expect(banner).toHaveTextContent(batasBayarH3);
  });

  it("10. Banner pengingat H-3 tidak ditampilkan jika tagihan sudah Lunas", () => {
    const in2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const batasBayarH3 = `${in2Days.getDate()} ${bulanPendek[in2Days.getMonth()]} ${in2Days.getFullYear()}`;

    usePaymentStore.setState((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.nomorKamar === "101"
          ? { ...t, batasBayar: batasBayarH3, status: "LUNAS" as const }
          : t
      ),
    }));

    render(<PenghuniDashboardView user={mockPenghuni101} />);

    expect(screen.queryByTestId("banner-pengingat-h3")).not.toBeInTheDocument();
  });

  it("11. Meminta izin notifikasi peramban saat tombol aktifkan diklik", async () => {
    const in2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const batasBayarH3 = `${in2Days.getDate()} ${bulanPendek[in2Days.getMonth()]} ${in2Days.getFullYear()}`;

    usePaymentStore.setState((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.nomorKamar === "101"
          ? { ...t, batasBayar: batasBayarH3, status: "BELUM_BAYAR" as const }
          : t
      ),
    }));

    const mockRequestPermission = vi.fn().mockResolvedValue("granted");
    // @ts-expect-error Mocking Notification
    globalThis.Notification = {
      requestPermission: mockRequestPermission,
      permission: "default",
    };

    render(<PenghuniDashboardView user={mockPenghuni101} />);

    const aktifkanBtn = screen.getByRole("button", { name: /Aktifkan Notifikasi/i });
    fireEvent.click(aktifkanBtn);

    await waitFor(() => {
      expect(mockRequestPermission).toHaveBeenCalled();
    });
  });
});

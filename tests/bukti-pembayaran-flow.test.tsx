import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PenghuniTagihanCard } from "@/components/dashboard/penghuni-tagihan-card";
import { PemilikVerifikasiAntrean } from "@/components/dashboard/pemilik-verifikasi-antrean";
import { TandaiCashDialog } from "@/components/dashboard/tandai-cash-dialog";
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

describe("Alur Terintegrasi Bukti Transfer & Verifikasi Tagihan (Issue 06)", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("1. Alur Penghuni mengunggah bukti transfer terkompresi dengan catatan opsional -> status MENUNGGU_VERIFIKASI", async () => {
    render(<PenghuniTagihanCard user={mockPenghuni101} />);

    // Buka pemilihan berkas
    const uploadBtn = screen.getByRole("button", { name: /Unggah Bukti Transfer/i });
    fireEvent.click(uploadBtn);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const dummyFile = new File(["dummy bank receipt"], "bukti-transfer-bca.jpg", {
      type: "image/jpeg",
    });

    const mockDataUrl = "data:image/webp;base64,mockWebpTransferReceiptData";
    const originalFileReader = window.FileReader;
    class MockFileReader {
      result: string = "";
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL() {
        this.result = mockDataUrl;
        if (this.onload) {
          this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
        }
      }
    }
    window.FileReader = MockFileReader as unknown as typeof FileReader;

    fireEvent.change(fileInput, { target: { files: [dummyFile] } });

    // Pratinjau muncul
    await waitFor(() => {
      const previewImg = screen.getByAltText(/Pratinjau Bukti Pembayaran/i);
      expect(previewImg).toBeInTheDocument();
    });

    // Isi catatan opsional
    const catatanInput = screen.getByPlaceholderText(/Contoh: Transfer lewat BCA/i);
    fireEvent.change(catatanInput, {
      target: { value: "Transfer via BCA Mobile a.n. Rizky Ramadhan" },
    });

    // Kirim bukti pembayaran
    const submitBtn = screen.getByRole("button", { name: /Kirim Bukti Pembayaran/i });
    fireEvent.click(submitBtn);

    // Verifikasi transisi status tampilan
    await waitFor(() => {
      expect(screen.getByText("Menunggu Verifikasi")).toBeInTheDocument();
      expect(screen.getByText(/Sedang Ditinjau Pemilik Kost/i)).toBeInTheDocument();
    });

    // Verifikasi di persistent store
    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihan101?.status).toBe("MENUNGGU_VERIFIKASI");
    expect(tagihan101?.buktiPembayaran?.catatanPenghuni).toBe(
      "Transfer via BCA Mobile a.n. Rizky Ramadhan"
    );

    window.FileReader = originalFileReader;
  });

  it("2. Pemilik Kost melihat antrean verifikasi, membuka Lightbox zoomable, dan menyetujui pembayaran -> LUNAS", async () => {
    // Kamar 102 pada mock default berstatus MENUNGGU_VERIFIKASI
    render(<PemilikVerifikasiAntrean />);

    expect(screen.getByText(/Antrean Verifikasi Bukti/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamar 102/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Siti Nurhaliza/i).length).toBeGreaterThanOrEqual(1);

    // Buka Lightbox pembesaran foto
    const lihatButtons = screen.getAllByRole("button", { name: /Lihat Bukti/i });
    fireEvent.click(lihatButtons[0]);

    // Lightbox modal terbuka
    expect(screen.getByText(/Detail Bukti Transfer/i)).toBeInTheDocument();
    expect(screen.getByTestId("zoom-scale-indicator")).toHaveTextContent("100%");

    // Uji kontrol zoom di Lightbox
    const zoomInBtn = screen.getByRole("button", { name: /Perbesar foto/i });
    fireEvent.click(zoomInBtn);
    expect(screen.getByTestId("zoom-scale-indicator")).toHaveTextContent("150%");

    const resetBtn = screen.getByRole("button", { name: /Reset zoom/i });
    fireEvent.click(resetBtn);
    expect(screen.getByTestId("zoom-scale-indicator")).toHaveTextContent("100%");

    // Setujui pembayaran langsung dari antrean
    const setujuiBtn = screen.getAllByRole("button", { name: /Setujui/i })[0];
    fireEvent.click(setujuiBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Kamar 102/i)).not.toBeInTheDocument();
    });

    const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
    expect(tagihan102?.status).toBe("LUNAS");
    expect(tagihan102?.metodePembayaran).toBe("TRANSFER");
    expect(tagihan102?.verifiedAt).toBeDefined();
  });

  it("3. Pemilik Kost menolak bukti dengan alasan penolakan wajib -> Penghuni melihat alasan & tombol unggah ulang", async () => {
    // 1. Pemilik menolak bukti transfer kamar 107
    const { unmount } = render(<PemilikVerifikasiAntrean />);

    const tolakButtons = screen.getAllByRole("button", { name: /Tolak/i });
    // Klik tolak pada item kamar 107 (index 1)
    fireEvent.click(tolakButtons[1]);

    // Modal penolakan muncul
    expect(screen.getByText(/Tolak Bukti Pembayaran/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Kamar 107/i).length).toBeGreaterThanOrEqual(1);

    const submitTolak = screen.getByRole("button", { name: /Konfirmasi Tolak/i });
    expect(submitTolak).toBeDisabled();

    // Pilih quick template alasan
    const templateChip = screen.getByText(/Nominal transfer tidak sesuai dengan tarif sewa/i);
    fireEvent.click(templateChip);

    expect(submitTolak).not.toBeDisabled();
    fireEvent.click(submitTolak);

    await waitFor(() => {
      expect(screen.queryByText(/Kamar 107/i)).not.toBeInTheDocument();
    });

    const tagihan107 = usePaymentStore.getState().getTagihanAktifByKamar("107");
    expect(tagihan107?.status).toBe("DITOLAK");
    expect(tagihan107?.alasanPenolakan).toContain("Nominal transfer tidak sesuai");

    unmount();

    // 2. Sekarang Penghuni Kamar 107 membuka dashboard
    const user107: UserSession = {
      id: "usr-107",
      username: "107",
      name: "Dewi Lestari",
      role: "PENGHUNI",
      nomorKamar: "107",
      tipeKamar: "Kamar Deluxe Lt. 2",
      tarifBulanan: 1500000,
    };

    render(<PenghuniTagihanCard user={user107} />);

    // Tampil badge Ditolak & alasan penolakan
    expect(screen.getByText("Ditolak")).toBeInTheDocument();
    expect(screen.getByText(/Alasan Penolakan dari Pemilik Kost/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Nominal transfer tidak sesuai dengan tarif sewa/i)
    ).toBeInTheDocument();

    // Tombol Unggah Ulang Bukti Transfer tersedia
    expect(
      screen.getByRole("button", { name: /Unggah Ulang Bukti Transfer/i })
    ).toBeInTheDocument();
  });

  it("4. Pemilik Kost mencatat pelunasan tunai melalui Tandai Lunas (Cash) dengan catatan opsional", () => {
    const handleConfirmCash = vi.fn((tagihanId: string, catatan?: string) => {
      usePaymentStore.getState().markCashTagihan(tagihanId, catatan);
    });

    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihan101?.status).toBe("BELUM_BAYAR");

    render(
      <TandaiCashDialog
        isOpen={true}
        onClose={vi.fn()}
        tagihan={tagihan101!}
        onConfirmCash={handleConfirmCash}
      />
    );

    expect(screen.getByText(/Tandai Lunas \(Cash\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamar 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Rizky Ramadhan/i)).toBeInTheDocument();

    const noteInput = screen.getByPlaceholderText(/Contoh: Diterima uang pas/i);
    fireEvent.change(noteInput, {
      target: { value: "Uang tunai Rp 1.500.000 diterima langsung di kost" },
    });

    const confirmBtn = screen.getByRole("button", { name: /Konfirmasi Lunas \(Cash\)/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirmCash).toHaveBeenCalledWith(
      tagihan101?.id,
      "Uang tunai Rp 1.500.000 diterima langsung di kost"
    );

    const updated = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(updated?.status).toBe("LUNAS");
    expect(updated?.metodePembayaran).toBe("CASH");
    expect(updated?.catatanPemilik).toBe("Uang tunai Rp 1.500.000 diterima langsung di kost");
  });
});

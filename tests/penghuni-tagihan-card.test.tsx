import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PenghuniTagihanCard } from "@/components/dashboard/penghuni-tagihan-card";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { UserSession } from "@/types/auth";

const mockUser101: UserSession = {
  id: "usr-101",
  username: "101",
  name: "Rizky Ramadhan",
  role: "PENGHUNI",
  nomorKamar: "101",
  tipeKamar: "Kamar Deluxe Lt. 1",
  tarifBulanan: 1500000,
};

const mockUser104: UserSession = {
  id: "usr-104",
  username: "104",
  name: "Dimas Anggara",
  role: "PENGHUNI",
  nomorKamar: "104",
  tipeKamar: "Kamar Standard Lt. 1",
  tarifBulanan: 1300000,
};

describe("PenghuniTagihanCard", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("merender informasi tagihan aktif Belum Bayar dengan benar", () => {
    render(<PenghuniTagihanCard user={mockUser101} />);

    expect(screen.getByText(/Tagihan Kamar Anda/i)).toBeInTheDocument();
    expect(screen.getByText("Belum Bayar")).toBeInTheDocument();
    expect(screen.getByText(/Rp 1\.500\.000/i)).toBeInTheDocument();
    expect(screen.getAllByText(/10 Sep 2026/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Unggah Bukti Transfer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Informasi Bayar Tunai/i })).toBeInTheDocument();
  });

  it("menangani pemilihan gambar, pratinjau instan, dan pengiriman bukti transfer", async () => {
    render(<PenghuniTagihanCard user={mockUser101} />);

    const uploadBtn = screen.getByRole("button", { name: /Unggah Bukti Transfer/i });
    fireEvent.click(uploadBtn);

    // Input file muncul
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    // Mock file upload
    const file = new File(["dummy image content"], "bukti-transfer.png", { type: "image/png" });

    // Mock FileReader
    const mockBase64 = "data:image/png;base64,mockFileDataUrl123";
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

    // Pratinjau instan gambar muncul
    await waitFor(() => {
      const previewImg = screen.getByAltText(/Pratinjau Bukti Pembayaran/i);
      expect(previewImg).toBeInTheDocument();
      expect(previewImg).toHaveAttribute("src", mockBase64);
    });

    // Kirim bukti transfer
    const submitBtn = screen.getByRole("button", { name: /Kirim Bukti Pembayaran/i });
    fireEvent.click(submitBtn);

    // Status berubah menjadi Menunggu Verifikasi
    await waitFor(() => {
      expect(screen.getByText("Menunggu Verifikasi")).toBeInTheDocument();
      expect(screen.getByText(/Sedang Ditinjau Pemilik Kost/i)).toBeInTheDocument();
    });

    // Restore FileReader
    window.FileReader = originalFileReader;
  });

  it("menampilkan alasan penolakan dan form unggah ulang saat status tagihan Ditolak", () => {
    render(<PenghuniTagihanCard user={mockUser104} />);

    expect(screen.getByText("Ditolak")).toBeInTheDocument();
    expect(screen.getByText(/Alasan Penolakan dari Pemilik Kost/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Foto bukti transfer buram dan nominal terpotong/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Unggah Ulang Bukti Transfer/i })).toBeInTheDocument();
  });
});

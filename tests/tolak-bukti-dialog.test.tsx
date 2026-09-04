import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TolakBuktiDialog } from "@/components/dashboard/tolak-bukti-dialog";
import { Tagihan } from "@/types/payment";

const mockTagihan: Tagihan = {
  id: "tagihan-107-2026-09",
  kamarId: "107",
  nomorKamar: "107",
  penghuniId: "usr-107",
  penghuniNama: "Dewi Lestari",
  periodeBulan: "September 2026",
  tahun: 2026,
  bulan: 9,
  nominal: 1500000,
  batasBayar: "10 Sep 2026",
  status: "MENUNGGU_VERIFIKASI",
};

describe("TolakBuktiDialog", () => {
  it("merender modal penolakan dengan input alasan wajib dan menonaktifkan tombol submit jika kosong", () => {
    render(
      <TolakBuktiDialog
        isOpen={true}
        onClose={() => {}}
        tagihan={mockTagihan}
        onConfirmReject={() => {}}
      />
    );

    expect(screen.getByText(/Tolak Bukti Pembayaran/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamar 107/i)).toBeInTheDocument();
    expect(screen.getByText(/Dewi Lestari/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /Konfirmasi Tolak/i });
    expect(submitBtn).toBeDisabled();

    // Input textarea alasan penolakan
    const textarea = screen.getByPlaceholderText(/Tuliskan alasan penolakan/i);
    expect(textarea).toBeInTheDocument();
  });

  it("dapat memilih quick template chip atau mengetik alasan dan memanggil onConfirmReject", () => {
    let capturedReason = "";

    render(
      <TolakBuktiDialog
        isOpen={true}
        onClose={() => {}}
        tagihan={mockTagihan}
        onConfirmReject={(alasan) => {
          capturedReason = alasan;
        }}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /Konfirmasi Tolak/i });
    expect(submitBtn).toBeDisabled();

    // Klik salah satu quick suggestion chip
    const chip = screen.getByText(/Foto bukti transfer buram/i);
    fireEvent.click(chip);

    // Tombol submit menjadi aktif
    expect(submitBtn).not.toBeDisabled();

    // Klik submit
    fireEvent.click(submitBtn);
    expect(capturedReason).toContain("buram");
  });
});

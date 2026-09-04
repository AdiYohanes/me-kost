import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TandaiCashDialog } from "@/components/dashboard/tandai-cash-dialog";
import { Tagihan } from "@/types/payment";

const mockTagihan: Tagihan = {
  id: "tagihan-101-2026-09",
  kamarId: "101",
  nomorKamar: "101",
  penghuniId: "penghuni-1",
  penghuniNama: "Ahmad Fauzi",
  periodeBulan: "September 2026",
  tahun: 2026,
  bulan: 9,
  nominal: 1500000,
  batasBayar: "10 Sep 2026",
  status: "BELUM_BAYAR",
};

describe("TandaiCashDialog", () => {
  it("merender modal konfirmasi dengan identitas Kamar, Penghuni, nominal, dan input catatan opsional", () => {
    render(
      <TandaiCashDialog
        isOpen={true}
        onClose={vi.fn()}
        tagihan={mockTagihan}
        onConfirmCash={vi.fn()}
      />
    );

    expect(screen.getByText(/Tandai Lunas \(Cash\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamar 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Ahmad Fauzi/i)).toBeInTheDocument();
    expect(screen.getByText(/Rp 1\.500\.000/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Contoh: Diterima uang pas di ruang pengelola/i)
    ).toBeInTheDocument();
  });

  it("memanggil onConfirmCash dengan tagihanId dan catatan penerimaan tunai saat disubmit", () => {
    const handleConfirm = vi.fn();
    const handleClose = vi.fn();

    render(
      <TandaiCashDialog
        isOpen={true}
        onClose={handleClose}
        tagihan={mockTagihan}
        onConfirmCash={handleConfirm}
      />
    );

    const noteInput = screen.getByPlaceholderText(
      /Contoh: Diterima uang pas di ruang pengelola/i
    );
    fireEvent.change(noteInput, {
      target: { value: "Uang tunai Rp 1.500.000 pas diterima di kantor" },
    });

    const confirmBtn = screen.getByRole("button", {
      name: /Konfirmasi Lunas \(Cash\)/i,
    });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledWith(
      "tagihan-101-2026-09",
      "Uang tunai Rp 1.500.000 pas diterima di kantor"
    );
  });

  it("memanggil onClose saat tombol Batal ditekan", () => {
    const handleClose = vi.fn();

    render(
      <TandaiCashDialog
        isOpen={true}
        onClose={handleClose}
        tagihan={mockTagihan}
        onConfirmCash={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: /Batal/i });
    fireEvent.click(cancelBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});

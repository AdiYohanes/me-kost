import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  BuatPeriodeTagihanDialog,
  UbahTarifKamarDialog,
} from "@/components/dashboard/kelola-tagihan-dialog";
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

describe("BuatPeriodeTagihanDialog", () => {
  it("merender form periode tagihan baru dan memanggil onConfirmCreate saat submit", () => {
    const handleCreate = vi.fn();
    const handleClose = vi.fn();

    render(
      <BuatPeriodeTagihanDialog
        isOpen={true}
        onClose={handleClose}
        onConfirmCreate={handleCreate}
      />
    );

    expect(screen.getByText(/Buat Tagihan Periode Baru/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", {
      name: /Terbitkan Tagihan Baru/i,
    });
    fireEvent.click(submitBtn);

    expect(handleCreate).toHaveBeenCalledTimes(1);
    expect(handleCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        bulan: expect.any(Number),
        tahun: expect.any(Number),
        periodeBulan: expect.any(String),
        batasBayar: expect.any(String),
      })
    );
  });
});

describe("UbahTarifKamarDialog", () => {
  it("merender info kamar dan input nominal baru lalu memanggil onConfirmUpdate", () => {
    const handleUpdate = vi.fn();
    const handleClose = vi.fn();

    render(
      <UbahTarifKamarDialog
        isOpen={true}
        onClose={handleClose}
        tagihan={mockTagihan}
        onConfirmUpdate={handleUpdate}
      />
    );

    expect(screen.getByText(/Ubah Tarif Kamar 101/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ahmad Fauzi/i).length).toBeGreaterThanOrEqual(1);

    const inputNominal = screen.getByLabelText(/Nominal Tagihan Baru/i);
    fireEvent.change(inputNominal, { target: { value: "1750000" } });

    const submitBtn = screen.getByRole("button", {
      name: /Simpan Perubahan/i,
    });
    fireEvent.click(submitBtn);

    expect(handleUpdate).toHaveBeenCalledWith("tagihan-101-2026-09", 1750000);
  });
});

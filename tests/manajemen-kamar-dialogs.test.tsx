import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TambahPenghuniDialog } from "@/components/dashboard/tambah-penghuni-dialog";
import { UbahEmailDialog } from "@/components/dashboard/ubah-email-dialog";
import { KeluarkanPenghuniDialog } from "@/components/dashboard/keluarkan-penghuni-dialog";
import { Kamar } from "@/types/kamar";

const mockKamarKosong: Kamar = {
  id: "k-105",
  nomorKamar: "105",
  tipeKamar: "Kamar VIP Lt. 2",
  tarifBulanan: 1800000,
  statusHunian: "KOSONG",
  tanggalJatuhTempo: 1,
  penghuni: null,
};

const mockKamarTerisi: Kamar = {
  id: "k-102",
  nomorKamar: "102",
  tipeKamar: "Kamar Standard Lt. 1",
  tarifBulanan: 1300000,
  statusHunian: "TERISI",
  tanggalMasuk: "2026-09-01",
  tanggalJatuhTempo: 10,
  penghuni: {
    id: "usr-102",
    nama: "Siti Nurhaliza",
    email: "siti@gmail.com",
    telepon: "0812-9876-102",
  },
};

describe("Manajemen Kamar Dialog Components", () => {
  describe("1. TambahPenghuniDialog", () => {
    it("merender informasi kamar, input nama, email, whatsapp, dan tanggal masuk", () => {
      render(
        <TambahPenghuniDialog
          isOpen={true}
          onClose={vi.fn()}
          kamar={mockKamarKosong}
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByText(/Tambah Penghuni Baru/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Kamar 105/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Kamar VIP Lt\. 2/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Nama Lengkap Penghuni/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Akun Google/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tanggal Masuk/i)).toBeInTheDocument();
    });

    it("memvalidasi nama kosong dan format email yang tidak valid", () => {
      const handleConfirm = vi.fn();
      render(
        <TambahPenghuniDialog
          isOpen={true}
          onClose={vi.fn()}
          kamar={mockKamarKosong}
          onConfirm={handleConfirm}
        />
      );

      const submitBtn = screen.getByRole("button", {
        name: /Daftarkan Penghuni/i,
      });

      // Submit tanpa nama
      fireEvent.click(submitBtn);
      expect(handleConfirm).not.toHaveBeenCalled();
      expect(
        screen.getByText(/Nama lengkap penghuni wajib diisi/i)
      ).toBeInTheDocument();

      // Isi nama, tapi email invalid
      const namaInput = screen.getByLabelText(/Nama Lengkap Penghuni/i);
      fireEvent.change(namaInput, { target: { value: "Budi Santoso" } });
      const emailInput = screen.getByLabelText(/Email Akun Google/i);
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });

      fireEvent.click(submitBtn);
      expect(handleConfirm).not.toHaveBeenCalled();
      expect(screen.getByText(/Email Google tidak valid/i)).toBeInTheDocument();
    });

    it("memanggil onConfirm dengan data lengkap dan tanggal jatuh tempo yang tersinkronisasi", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <TambahPenghuniDialog
          isOpen={true}
          onClose={handleClose}
          kamar={mockKamarKosong}
          onConfirm={handleConfirm}
        />
      );

      fireEvent.change(screen.getByLabelText(/Nama Lengkap Penghuni/i), {
        target: { value: "Dewi Putri" },
      });
      fireEvent.change(screen.getByLabelText(/Email Akun Google/i), {
        target: { value: "dewi.putri@gmail.com" },
      });
      fireEvent.change(screen.getByLabelText(/Tanggal Masuk/i), {
        target: { value: "2026-09-19" },
      });

      // Jatuh tempo otomatis 19
      const jatuhTempoInput = screen.getByLabelText(
        /Jatuh Tempo \(Tgl\)/i
      ) as HTMLInputElement;
      expect(jatuhTempoInput.value).toBe("19");

      fireEvent.click(
        screen.getByRole("button", { name: /Daftarkan Penghuni/i })
      );

      expect(handleConfirm).toHaveBeenCalledWith({
        kamarId: "k-105",
        nama: "Dewi Putri",
        email: "dewi.putri@gmail.com",
        telepon: undefined,
        tanggalMasuk: "2026-09-19",
        tanggalJatuhTempo: 19,
      });
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("2. UbahEmailDialog", () => {
    it("merender modal dengan email terdaftar saat ini", () => {
      render(
        <UbahEmailDialog
          isOpen={true}
          onClose={vi.fn()}
          kamar={mockKamarTerisi}
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByText(/Ubah Email Google Terdaftar/i)).toBeInTheDocument();
      expect(screen.getByText(/Kamar 102 • Siti Nurhaliza/i)).toBeInTheDocument();

      const emailInput = screen.getByLabelText(
        /Email Akun Google Baru/i
      ) as HTMLInputElement;
      expect(emailInput.value).toBe("siti@gmail.com");
    });

    it("memvalidasi email dan memanggil onConfirm saat input valid", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <UbahEmailDialog
          isOpen={true}
          onClose={handleClose}
          kamar={mockKamarTerisi}
          onConfirm={handleConfirm}
        />
      );

      const emailInput = screen.getByLabelText(/Email Akun Google Baru/i);
      const submitBtn = screen.getByRole("button", { name: /Simpan Email Baru/i });

      // Coba email tidak valid
      fireEvent.change(emailInput, { target: { value: "bukanemail" } });
      fireEvent.click(submitBtn);
      expect(handleConfirm).not.toHaveBeenCalled();
      expect(screen.getByText(/Format email Google tidak valid/i)).toBeInTheDocument();

      // Isi email valid
      fireEvent.change(emailInput, { target: { value: "siti.baru@gmail.com" } });
      fireEvent.click(submitBtn);

      expect(handleConfirm).toHaveBeenCalledWith("k-102", "siti.baru@gmail.com");
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe("3. KeluarkanPenghuniDialog", () => {
    it("merender opsi batalkan tagihan aktif dan opsi pertahankan arsip", () => {
      render(
        <KeluarkanPenghuniDialog
          isOpen={true}
          onClose={vi.fn()}
          kamar={mockKamarTerisi}
          onConfirm={vi.fn()}
        />
      );

      expect(
        screen.getByText(/Keluarkan Penghuni Kamar 102/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Batalkan tagihan aktif bulan berjalan/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Pertahankan sebagai arsip catatan tunggakan/i)
      ).toBeInTheDocument();
    });

    it("memanggil onConfirm dengan batalkanTagihanAktif = true secara default", () => {
      const handleConfirm = vi.fn();
      const handleClose = vi.fn();

      render(
        <KeluarkanPenghuniDialog
          isOpen={true}
          onClose={handleClose}
          kamar={mockKamarTerisi}
          onConfirm={handleConfirm}
        />
      );

      const submitBtn = screen.getByRole("button", {
        name: /^Keluarkan Penghuni$/i,
      });
      fireEvent.click(submitBtn);

      expect(handleConfirm).toHaveBeenCalledWith("k-102", true);
      expect(handleClose).toHaveBeenCalled();
    });

    it("memanggil onConfirm dengan batalkanTagihanAktif = false saat memilih opsi pertahankan arsip", () => {
      const handleConfirm = vi.fn();

      render(
        <KeluarkanPenghuniDialog
          isOpen={true}
          onClose={vi.fn()}
          kamar={mockKamarTerisi}
          onConfirm={handleConfirm}
        />
      );

      const arsipRadio = screen.getByRole("radio", {
        name: /Pertahankan sebagai arsip catatan tunggakan/i,
      });
      fireEvent.click(arsipRadio);

      const submitBtn = screen.getByRole("button", {
        name: /^Keluarkan Penghuni$/i,
      });
      fireEvent.click(submitBtn);

      expect(handleConfirm).toHaveBeenCalledWith("k-102", false);
    });
  });
});

import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PemilikDaftarKamar } from "@/components/dashboard/pemilik-daftar-kamar";
import { usePaymentStore } from "@/lib/store/use-payment-store";

describe("PemilikDaftarKamar", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("merender seluruh 8 unit Kamar (101 hingga 108) pada filter default 'Semua'", () => {
    render(<PemilikDaftarKamar />);

    expect(screen.getByText(/Daftar Unit Kamar/i)).toBeInTheDocument();

    // 8 kamar lengkap
    for (let i = 101; i <= 108; i++) {
      expect(screen.getAllByText(new RegExp(i.toString())).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("memfilter daftar kamar berdasarkan status: Lunas, Belum Bayar, dan Menunggu Verifikasi", () => {
    render(<PemilikDaftarKamar />);

    // Filter "Lunas"
    const lunasFilterBtn = screen.getByRole("button", { name: /^Lunas/i });
    fireEvent.click(lunasFilterBtn);

    // Di seed data awal, kamar Lunas adalah 103, 106, 108
    expect(screen.getByText(/Budi Santoso/i)).toBeInTheDocument(); // Kamar 103
    expect(screen.getByText(/Fajar Pratama/i)).toBeInTheDocument(); // Kamar 106
    expect(screen.getByText(/Hendra Wijaya/i)).toBeInTheDocument(); // Kamar 108
    // Kamar 101 (Belum Bayar) tidak boleh tampil
    expect(screen.queryByText(/Rizky Ramadhan/i)).not.toBeInTheDocument();

    // Filter "Belum Bayar"
    const belumBayarFilterBtn = screen.getByRole("button", { name: /^Belum Bayar/i });
    fireEvent.click(belumBayarFilterBtn);
    // Kamar 101 & 105 Belum Bayar
    expect(screen.getByText(/Rizky Ramadhan/i)).toBeInTheDocument();
    expect(screen.getByText(/Anisa Rahma/i)).toBeInTheDocument();
    expect(screen.queryByText(/Budi Santoso/i)).not.toBeInTheDocument();

    // Filter "Menunggu Verifikasi"
    const pendingFilterBtn = screen.getByRole("button", { name: /^Menunggu Verifikasi/i });
    fireEvent.click(pendingFilterBtn);
    // Kamar 102 & 107 Menunggu Verifikasi
    expect(screen.getAllByText(/Siti Nurhaliza/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dewi Lestari/i)).toBeInTheDocument();
  });

  it("dapat menandai pembayaran tunai (Cash) pada kamar yang Belum Bayar", () => {
    render(<PemilikDaftarKamar />);

    // Kamar 101 awalnya Belum Bayar
    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihan101?.status).toBe("BELUM_BAYAR");

    // Tombol "Tandai Tunai" pada kamar 101
    const cashButtons = screen.getAllByRole("button", { name: /Tandai Tunai/i });
    expect(cashButtons.length).toBeGreaterThanOrEqual(1);

    // Klik tombol Tandai Tunai pertama (milik kamar 101)
    fireEvent.click(cashButtons[0]);

    // Status kamar 101 di store sekarang menjadi LUNAS dengan metode CASH
    const updated101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(updated101?.status).toBe("LUNAS");
    expect(updated101?.metodePembayaran).toBe("CASH");
  });
});

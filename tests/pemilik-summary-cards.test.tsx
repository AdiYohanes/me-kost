import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { PemilikSummaryCards } from "@/components/dashboard/pemilik-summary-cards";
import { usePaymentStore } from "@/lib/store/use-payment-store";

describe("PemilikSummaryCards", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("menampilkan metrik kamar lunas, belum lunas, dan total penerimaan sewa bulan berjalan", () => {
    render(<PemilikSummaryCards />);

    // Total penerimaan sewa berjalan (LUNAS: 103 = 1.5M, 106 = 1.3M, 108 = 1.8M -> total Rp 4.600.000)
    expect(screen.getByText(/Rp\s*4\.600\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/Penerimaan Terkumpul/i)).toBeInTheDocument();

    // Kamar Lunas: 3
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/Kamar Lunas/i)).toBeInTheDocument();

    // Kamar Belum Lunas: 5
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/Belum Lunas/i)).toBeInTheDocument();

    // Antrean Menunggu Verifikasi: 2 (Kamar 102 & 107)
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/Perlu Verifikasi/i)).toBeInTheDocument();
  });

  it("memperbarui metrik secara reaktif saat tagihan disetujui", async () => {
    render(<PemilikSummaryCards />);

    // Sebelum approve: Lunas 3, Belum Lunas 5, Menunggu Verifikasi 2
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Jalankan approveTagihan untuk kamar 102
    const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
    expect(tagihan102).toBeDefined();

    act(() => {
      usePaymentStore.getState().approveTagihan(tagihan102!.id);
    });

    // Setelah approve: Lunas 4 dan Belum Lunas 4, Menunggu Verifikasi berkurang jadi 1
    await waitFor(() => {
      expect(screen.getAllByText("4").length).toBe(2);
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText(/Rp\s*5\.900\.000/i)).toBeInTheDocument();
    });
  });
});

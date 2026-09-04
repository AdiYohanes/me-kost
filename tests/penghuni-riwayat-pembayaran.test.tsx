import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PenghuniRiwayatPembayaran } from "@/components/dashboard/penghuni-riwayat-pembayaran";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { UserSession } from "@/types/auth";

const mockUser: UserSession = {
  id: "usr-101",
  username: "101",
  name: "Rizky Ramadhan",
  role: "PENGHUNI",
  nomorKamar: "101",
  tipeKamar: "Kamar Deluxe Lt. 1",
  tarifBulanan: 1500000,
};

describe("PenghuniRiwayatPembayaran", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("menampilkan daftar tagihan bulan sebelumnya beserta status lunas dan thumbnail", () => {
    render(<PenghuniRiwayatPembayaran user={mockUser} />);

    expect(screen.getByText(/Riwayat Pembayaran/i)).toBeInTheDocument();
    expect(screen.getByText("Agustus 2026")).toBeInTheDocument();
    expect(screen.getByText("Juli 2026")).toBeInTheDocument();

    // Memastikan status Lunas tampil pada bulan-bulan sebelumnya
    const badges = screen.getAllByText("Lunas");
    expect(badges.length).toBeGreaterThanOrEqual(2);

    // Memastikan tombol atau thumbnail untuk melihat bukti transfer ada
    const lihatButtons = screen.getAllByRole("button", { name: /Lihat Bukti/i });
    expect(lihatButtons.length).toBeGreaterThanOrEqual(1);

    // Mengklik lihat bukti membuka modal lightbox
    fireEvent.click(lihatButtons[0]);
    expect(screen.getByText(/Bukti Pembayaran - Agustus 2026/i)).toBeInTheDocument();
  });
});

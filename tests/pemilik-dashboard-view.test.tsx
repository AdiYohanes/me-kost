import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PemilikDashboardView } from "@/components/dashboard/pemilik-dashboard-view";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { UserSession } from "@/types/auth";

const mockPemilik: UserSession = {
  id: "usr-pemilik",
  username: "pemilik",
  name: "Adi Yohanes",
  role: "PEMILIK",
  phone: "0812-3456-7890",
};

describe("PemilikDashboardView Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("merender banner pengelola, kartu ringkasan metrik, antrean verifikasi, dan daftar unit kamar", () => {
    render(<PemilikDashboardView user={mockPemilik} />);

    // Header & Banner
    expect(screen.getByText(/Panel Pengelola Properti/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Selamat Datang, Ibu Hj\. Syantika/i),
    ).toBeInTheDocument();

    // Ringkasan Keuangan
    expect(screen.getByText(/Penerimaan Terkumpul/i)).toBeInTheDocument();
    expect(screen.getByText(/Rp\s*4\.600\.000/i)).toBeInTheDocument();

    // Antrean Verifikasi
    expect(screen.getByText(/Antrean Verifikasi Bukti/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Menunggu/i)).toBeInTheDocument();

    // Daftar Kamar
    expect(screen.getByText(/Daftar Unit Kamar/i)).toBeInTheDocument();
    expect(screen.getByText(/Semua \(8\)/i)).toBeInTheDocument();
  });

  it("melakukan verifikasi persetujuan (Approve) secara terintegrasi dan memperbarui metrik serta antrean", async () => {
    render(<PemilikDashboardView user={mockPemilik} />);

    // Antrean awal 2 (Kamar 102 & 107)
    expect(screen.getByText(/2 Menunggu/i)).toBeInTheDocument();

    // Setujui kamar pertama di antrean (Kamar 102)
    const approveButtons = screen.getAllByRole("button", { name: /Setujui/i });
    fireEvent.click(approveButtons[0]);

    // Antrean tersisa 1
    await waitFor(() => {
      expect(screen.getByText(/1 Menunggu/i)).toBeInTheDocument();
      // Total pendapatan bertambah dari 4.6M + 1.3M = 5.9M
      expect(screen.getByText(/Rp\s*5\.900\.000/i)).toBeInTheDocument();
    });

    // Cek store tagihan 102
    const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
    expect(tagihan102?.status).toBe("LUNAS");
    expect(tagihan102?.metodePembayaran).toBe("TRANSFER");
  });

  it("melakukan penolakan (Reject) dengan alasan penolakan secara terintegrasi", async () => {
    render(<PemilikDashboardView user={mockPemilik} />);

    // Klik tombol Tolak pada antrean
    const rejectButtons = screen.getAllByRole("button", { name: /Tolak/i });
    fireEvent.click(rejectButtons[0]);

    // Modal tolak terbuka
    expect(screen.getByText(/Tolak Bukti Pembayaran/i)).toBeInTheDocument();

    // Masukkan alasan
    const textarea = screen.getByPlaceholderText(/Tuliskan alasan penolakan/i);
    fireEvent.change(textarea, {
      target: { value: "Foto bukti buram dan nominal tidak terbaca." },
    });

    const confirmBtn = screen.getByRole("button", {
      name: /Konfirmasi Tolak/i,
    });
    fireEvent.click(confirmBtn);

    // Antrean berkurang menjadi 1
    await waitFor(() => {
      expect(screen.getByText(/1 Menunggu/i)).toBeInTheDocument();
    });

    // Cek store tagihan 102
    const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
    expect(tagihan102?.status).toBe("DITOLAK");
    expect(tagihan102?.alasanPenolakan).toBe(
      "Foto bukti buram dan nominal tidak terbaca.",
    );
  });
});

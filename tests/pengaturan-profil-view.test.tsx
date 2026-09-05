import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PengaturanProfilView } from "@/components/dashboard/pengaturan-profil-view";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { UserSession } from "@/types/auth";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockPemilik: UserSession = {
  id: "user-pemilik",
  username: "pemilik",
  name: "Adi Yohanes",
  role: "PEMILIK",
};

const mockPenghuni: UserSession = {
  id: "penghuni-2",
  username: "102",
  name: "Siti Nurhaliza",
  role: "PENGHUNI",
  nomorKamar: "102",
  tipeKamar: "Kamar AC, Kamar Mandi Dalam",
  tarifBulanan: 1500000,
};

describe("PengaturanProfilView", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("merender info profil pengguna dan utilitas simulasi demo", () => {
    render(<PengaturanProfilView user={mockPemilik} />);

    expect(
      screen.getAllByText(/Adi Yohanes/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Pemilik Kost/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/Reset Mock Data/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("merender info kamar untuk akun penghuni", () => {
    render(<PengaturanProfilView user={mockPenghuni} />);

    expect(screen.getByText(/Siti Nurhaliza/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Kamar 102/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Reset Mock Data/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("membuka konfirmasi dan mengeksekusi resetPayments saat tombol Reset Mock Data ditekan", () => {
    // Ubah status terlebih dahulu
    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    usePaymentStore.getState().markCashTagihan(tagihan101!.id, "Catatan demo");
    expect(
      usePaymentStore.getState().getTagihanAktifByKamar("101")?.status,
    ).toBe("LUNAS");

    render(<PengaturanProfilView user={mockPemilik} />);

    const resetBtn = screen.getByRole("button", { name: /Reset Mock Data/i });
    fireEvent.click(resetBtn);

    // Dialog konfirmasi terbuka
    expect(
      screen.getByText(/Reset Data Demo ke Kondisi Awal/i),
    ).toBeInTheDocument();

    const confirmResetBtn = screen.getByRole("button", {
      name: /Ya, Reset Data/i,
    });
    fireEvent.click(confirmResetBtn);

    // Memastikan tagihan 101 kembali ke BELUM_BAYAR
    expect(
      usePaymentStore.getState().getTagihanAktifByKamar("101")?.status,
    ).toBe("BELUM_BAYAR");
    expect(
      usePaymentStore.getState().getTagihanAktifByKamar("101")?.catatanPemilik,
    ).toBeUndefined();
  });
});

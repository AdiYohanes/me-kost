import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PemilikVerifikasiAntrean } from "@/components/dashboard/pemilik-verifikasi-antrean";
import { usePaymentStore } from "@/lib/store/use-payment-store";

describe("PemilikVerifikasiAntrean", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("merender antrean bukti transfer yang berstatus Menunggu Verifikasi (Kamar 102 dan 107)", () => {
    render(<PemilikVerifikasiAntrean />);

    expect(screen.getByText(/Antrean Verifikasi Bukti/i)).toBeInTheDocument();
    // Kamar 102 & 107 ada dalam antrean
    expect(screen.getByText(/Kamar 102/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Siti Nurhaliza/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Kamar 107/i)).toBeInTheDocument();
    expect(screen.getByText(/Dewi Lestari/i)).toBeInTheDocument();

    // Tombol Setujui dan Tolak tersedia untuk masing-masing
    expect(screen.getAllByRole("button", { name: /Setujui/i }).length).toBe(2);
    expect(screen.getAllByRole("button", { name: /Tolak/i }).length).toBe(2);
  });

  it("dapat menyetujui pembayaran dan mengubah status menjadi Lunas serta menghapus dari antrean", async () => {
    render(<PemilikVerifikasiAntrean />);

    const approveButtons = screen.getAllByRole("button", { name: /Setujui/i });
    // Setujui kamar 102
    fireEvent.click(approveButtons[0]);

    // Kamar 102 hilang dari antrean verifikasi
    await waitFor(() => {
      expect(screen.queryByText(/Kamar 102/i)).not.toBeInTheDocument();
    });

    // Cek store: kamar 102 statusnya sekarang LUNAS
    const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
    expect(tagihan102?.status).toBe("LUNAS");
    expect(tagihan102?.metodePembayaran).toBe("TRANSFER");
    expect(tagihan102?.verifiedAt).toBeDefined();
  });

  it("dapat menolak bukti transfer dengan alasan penolakan wajib", async () => {
    render(<PemilikVerifikasiAntrean />);

    const tolakButtons = screen.getAllByRole("button", { name: /Tolak/i });
    // Tolak kamar 102
    fireEvent.click(tolakButtons[0]);

    // Modal penolakan muncul
    expect(screen.getByText(/Tolak Bukti Pembayaran/i)).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText(/Tuliskan alasan penolakan/i);

    fireEvent.change(textarea, {
      target: { value: "Foto bukti transfer buram dan tidak terbaca." },
    });

    const confirmBtn = screen.getByRole("button", { name: /Konfirmasi Tolak/i });
    fireEvent.click(confirmBtn);

    // Kamar 102 hilang dari antrean verifikasi
    await waitFor(() => {
      expect(screen.queryByText(/Kamar 102/i)).not.toBeInTheDocument();
    });

    // Cek store: status kamar 102 sekarang DITOLAK
    const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
    expect(tagihan102?.status).toBe("DITOLAK");
    expect(tagihan102?.alasanPenolakan).toBe("Foto bukti transfer buram dan tidak terbaca.");
  });

  it("dapat membuka modal zoom lightbox saat tombol Lihat Bukti diklik", () => {
    render(<PemilikVerifikasiAntrean />);

    const lihatButtons = screen.getAllByRole("button", { name: /Lihat Bukti/i });
    fireEvent.click(lihatButtons[0]);

    // Modal Lightbox terbuka
    expect(screen.getByText(/Detail Bukti Transfer/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Foto Bukti Transfer/i)).toBeInTheDocument();
  });
});

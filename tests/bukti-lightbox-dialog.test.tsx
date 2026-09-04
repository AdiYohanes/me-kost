import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BuktiLightboxDialog } from "@/components/dashboard/bukti-lightbox-dialog";
import { Tagihan } from "@/types/payment";

const mockTagihanWithBukti: Tagihan = {
  id: "tagihan-102-2026-09",
  kamarId: "102",
  nomorKamar: "102",
  penghuniId: "usr-102",
  penghuniNama: "Siti Nurhaliza",
  periodeBulan: "September 2026",
  tahun: 2026,
  bulan: 9,
  nominal: 1300000,
  batasBayar: "10 Sep 2026",
  status: "MENUNGGU_VERIFIKASI",
  buktiPembayaran: {
    id: "bukti-102-2026-09",
    tagihanId: "tagihan-102-2026-09",
    kamarId: "102",
    nomorKamar: "102",
    penghuniId: "usr-102",
    penghuniNama: "Siti Nurhaliza",
    imageUrl: "data:image/svg+xml;utf8,<svg>test</svg>",
    uploadedAt: "2026-09-03T09:15:00Z",
    catatanPenghuni: "Transfer via BCA Mobile a.n. Siti Nurhaliza",
  },
};

describe("BuktiLightboxDialog", () => {
  it("merender foto bukti pembayaran ukuran penuh dan detail informasi", () => {
    render(
      <BuktiLightboxDialog
        isOpen={true}
        onClose={() => {}}
        tagihan={mockTagihanWithBukti}
      />
    );

    // Header informasi
    expect(screen.getByText(/Detail Bukti Transfer/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamar 102/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Siti Nurhaliza/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Rp\s*1\.300\.000/i)).toBeInTheDocument();

    // Foto bukti transfer
    const img = screen.getByAltText(/Foto Bukti Transfer/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockTagihanWithBukti.buktiPembayaran?.imageUrl);

    // Catatan penghuni
    expect(
      screen.getByText(/Transfer via BCA Mobile a\.n\. Siti Nurhaliza/i)
    ).toBeInTheDocument();
  });

  it("memanggil callback onApprove dan onReject jika disediakan", () => {
    let approved = false;
    let rejected = false;

    render(
      <BuktiLightboxDialog
        isOpen={true}
        onClose={() => {}}
        tagihan={mockTagihanWithBukti}
        onApprove={() => {
          approved = true;
        }}
        onReject={() => {
          rejected = true;
        }}
      />
    );

    const approveBtn = screen.getByRole("button", { name: /Setujui Pembayaran/i });
    fireEvent.click(approveBtn);
    expect(approved).toBe(true);

    const rejectBtn = screen.getByRole("button", { name: /Tolak Bukti/i });
    fireEvent.click(rejectBtn);
    expect(rejected).toBe(true);
  });
});

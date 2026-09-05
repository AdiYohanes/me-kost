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

  it("memfilter daftar kamar berdasarkan tab filter: Butuh Verifikasi, Lunas, Menunggak, Mendekati Jatuh Tempo (H-3), dan Kamar Kosong", () => {
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

    // Filter "Butuh Verifikasi"
    const pendingFilterBtn = screen.getByRole("button", { name: /^Butuh Verifikasi/i });
    fireEvent.click(pendingFilterBtn);
    // Kamar 102 & 107 Menunggu Verifikasi
    expect(screen.getAllByText(/Siti Nurhaliza/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dewi Lestari/i)).toBeInTheDocument();
    expect(screen.queryByText(/Budi Santoso/i)).not.toBeInTheDocument();
  });

  it("menampilkan badge visual MENUNGGAK (Telat X Hari) dengan aksen merah dan memfilter tab Menunggak", () => {
    // Siapkan tagihan kamar 101 telah melewati jatuh tempo (batasBayar 1 Sep 2026, telat 4 hari dari 5 Sep 2026)
    usePaymentStore.setState((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.nomorKamar === "101" ? { ...t, batasBayar: "1 Sep 2026" } : t
      ),
    }));

    render(<PemilikDaftarKamar />);

    // Kamar 101 menampilkan badge MENUNGGAK
    expect(screen.getByText(/MENUNGGAK \(Telat \d+ Hari\)/i)).toBeInTheDocument();

    // Klik tab filter Menunggak
    const menunggakBtn = screen.getByRole("button", { name: /^Menunggak/i });
    fireEvent.click(menunggakBtn);

    // Kamar 101 muncul
    expect(screen.getByText(/Rizky Ramadhan/i)).toBeInTheDocument();
    // Kamar 103 (Lunas) tidak muncul
    expect(screen.queryByText(/Budi Santoso/i)).not.toBeInTheDocument();
  });

  it("menampilkan badge H-3 Jatuh Tempo dan memfilter tab Mendekati Jatuh Tempo (H-3)", () => {
    // Siapkan tagihan kamar 104 berada di rentang H-3 (2 hari lagi)
    const in2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const batasBayarH3 = `${in2Days.getDate()} ${bulanPendek[in2Days.getMonth()]} ${in2Days.getFullYear()}`;

    usePaymentStore.setState((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.nomorKamar === "104"
          ? { ...t, batasBayar: batasBayarH3, status: "BELUM_BAYAR" as const }
          : t
      ),
    }));

    render(<PemilikDaftarKamar />);

    // Kamar 104 menampilkan badge H-X Jatuh Tempo
    expect(screen.getByText(/H-\d+ Jatuh Tempo/i)).toBeInTheDocument();

    // Klik tab filter Mendekati Jatuh Tempo (H-3)
    const h3Btn = screen.getByRole("button", { name: /Mendekati Jatuh Tempo \(H-3\)/i });
    fireEvent.click(h3Btn);

    // Kamar 104 (Dimas Anggara) muncul
    expect(screen.getByText(/Dimas Anggara/i)).toBeInTheDocument();
    // Kamar 103 (Lunas) tidak muncul
    expect(screen.queryByText(/Budi Santoso/i)).not.toBeInTheDocument();
  });

  it("dapat membuka modal konfirmasi 'Tandai Lunas (Cash)' dan menandai pembayaran tunai dengan catatan opsional", () => {
    render(<PemilikDaftarKamar />);

    // Kamar 101 awalnya Belum Bayar
    const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihan101?.status).toBe("BELUM_BAYAR");

    // Tombol "Tandai Lunas (Cash)" pada kamar yang belum lunas
    const cashButtons = screen.getAllByRole("button", {
      name: /Tandai Lunas \(Cash\)/i,
    });
    expect(cashButtons.length).toBeGreaterThanOrEqual(1);

    // Klik tombol Tandai Lunas (Cash) pertama (milik kamar 101)
    fireEvent.click(cashButtons[0]);

    // Modal konfirmasi terbuka menampilkan identitas Kamar 101 dan nama Penghuni
    expect(screen.getAllByText(/Kamar 101/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Rizky Ramadhan/i).length).toBeGreaterThanOrEqual(2);

    // Isi catatan opsional penerimaan tunai
    const catatanInput = screen.getByPlaceholderText(
      /Contoh: Diterima uang pas di ruang pengelola/i
    );
    fireEvent.change(catatanInput, {
      target: { value: "Dibayar tunai pas di pos pengelola" },
    });

    // Konfirmasi pembayaran tunai
    const confirmBtn = screen.getByRole("button", {
      name: /Konfirmasi Lunas \(Cash\)/i,
    });
    fireEvent.click(confirmBtn);

    // Status kamar 101 di store sekarang menjadi LUNAS dengan metode CASH dan catatan tersimpan
    const updated101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(updated101?.status).toBe("LUNAS");
    expect(updated101?.metodePembayaran).toBe("CASH");
    expect(updated101?.catatanPemilik).toBe("Dibayar tunai pas di pos pengelola");
    expect(updated101?.paidAt).toBeDefined();
  });

  it("dapat membuka dialog ubah tarif dan mengubah nominal tagihan kamar tertentu", () => {
    render(<PemilikDaftarKamar />);

    // Klik tombol ubah tarif kamar pertama (Kamar 101)
    const ubahTarifButtons = screen.getAllByRole("button", {
      name: /Ubah Tarif/i,
    });
    expect(ubahTarifButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(ubahTarifButtons[0]);

    expect(screen.getByText(/Ubah Tarif Kamar 101/i)).toBeInTheDocument();

    const inputNominal = screen.getByLabelText(/Nominal Tagihan Baru/i);
    fireEvent.change(inputNominal, { target: { value: "1800000" } });

    const submitBtn = screen.getByRole("button", {
      name: /Simpan Perubahan/i,
    });
    fireEvent.click(submitBtn);

    const updated101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(updated101?.nominal).toBe(1800000);
  });

  it("dapat membuat tagihan periode bulan baru melalui tombol di header daftar kamar", () => {
    render(<PemilikDaftarKamar />);

    const buatPeriodeBtn = screen.getByRole("button", {
      name: /Periode Baru/i,
    });
    fireEvent.click(buatPeriodeBtn);

    expect(screen.getByText(/Buat Tagihan Periode Baru/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", {
      name: /Terbitkan Tagihan Baru/i,
    });
    fireEvent.click(submitBtn);

    const { tagihanList, activePeriode } = usePaymentStore.getState();
    expect(activePeriode.periodeBulan).toBe("Oktober 2026");
    const tagihanOktober = tagihanList.filter((t) => t.bulan === 10);
    expect(tagihanOktober.length).toBe(8);
  });

  it("menampilkan tombol hijau 1-klik WhatsApp pada kamar H-3 dengan tautan wa.me dan pesan ramah terformat", () => {
    const in2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const bulanPendek = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const batasBayarH3 = `${in2Days.getDate()} ${bulanPendek[in2Days.getMonth()]} ${in2Days.getFullYear()}`;

    usePaymentStore.setState((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.nomorKamar === "104"
          ? { ...t, batasBayar: batasBayarH3, status: "BELUM_BAYAR" as const }
          : t
      ),
    }));

    render(<PemilikDaftarKamar />);

    const waLink = screen.getByRole("link", {
      name: /Hubungi Kamar 104 via WhatsApp/i,
    });
    expect(waLink).toBeInTheDocument();
    expect(waLink).toHaveAttribute("target", "_blank");

    const href = waLink.getAttribute("href") || "";
    expect(href).toMatch(/^https:\/\/wa\.me\/628129876104\?text=/);
    const decoded = decodeURIComponent(href);
    expect(decoded).toContain("Dimas Anggara");
    expect(decoded).toContain("104");
    expect(decoded).toContain("Rp 1.300.000");
    expect(decoded).toContain(batasBayarH3);
    expect(decoded).toContain("jatuh tempo");
  });

  it("menampilkan tombol hijau 1-klik WhatsApp pada kamar Menunggak dengan tautan wa.me dan teks teguran ramah", () => {
    usePaymentStore.setState((state) => ({
      tagihanList: state.tagihanList.map((t) =>
        t.nomorKamar === "101" ? { ...t, batasBayar: "1 Sep 2026" } : t
      ),
    }));

    render(<PemilikDaftarKamar />);

    const waLink = screen.getByRole("link", {
      name: /Hubungi Kamar 101 via WhatsApp/i,
    });
    expect(waLink).toBeInTheDocument();

    const href = waLink.getAttribute("href") || "";
    expect(href).toMatch(/^https:\/\/wa\.me\/628129876101\?text=/);
    const decoded = decodeURIComponent(href);
    expect(decoded).toContain("Rizky Ramadhan");
    expect(decoded).toContain("101");
    expect(decoded).toContain("melewati tanggal jatuh tempo");
  });

  it("tidak menampilkan tombol WhatsApp pada kamar yang sudah Lunas", () => {
    render(<PemilikDaftarKamar />);

    expect(
      screen.queryByRole("link", {
        name: /Hubungi Kamar 103 via WhatsApp/i,
      })
    ).not.toBeInTheDocument();
  });
});

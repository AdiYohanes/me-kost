import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PemilikDaftarKamar } from "@/components/dashboard/pemilik-daftar-kamar";
import { usePaymentStore } from "@/lib/store/use-payment-store";

describe("PemilikManajemenKamar Integration (Issue 03)", () => {
  beforeEach(() => {
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
  });

  it("1. Seluruh unit kamar berurutan secara fisik dan menampilkan indikator status hunian TERISI / KOSONG", () => {
    render(<PemilikDaftarKamar />);

    // Seluruh kamar 101 - 108 berurutan secara fisik
    for (let i = 101; i <= 108; i++) {
      expect(screen.getAllByText(new RegExp(i.toString())).length).toBeGreaterThanOrEqual(1);
    }

    // Awalnya seluruh kamar terisi
    const terisiBadges = screen.getAllByText(/^Terisi$/i);
    expect(terisiBadges.length).toBe(8);

    // Filter Kosong memiliki badge count 0 awalnya, atau filter Semua 8
    expect(screen.getByText(/^Semua \(8\)$/i)).toBeInTheDocument();
  });

  it("2. Alur Keluarkan Penghuni (Soft Disconnect) dengan pilihan batalkan tagihan aktif", async () => {
    render(<PemilikDaftarKamar />);

    // Cek Kamar 105 awalnya berstatus Terisi dengan penghuni Anisa Rahma
    expect(screen.getByText(/Anisa Rahma/i)).toBeInTheDocument();

    // Klik tombol 'Keluarkan Penghuni' pada Kamar 105
    const keluarkanBtn105 = screen.getByRole("button", {
      name: /Keluarkan Penghuni Kamar 105/i,
    });
    fireEvent.click(keluarkanBtn105);

    // Modal dialog konfirmasi terbuka
    expect(
      screen.getByText(/Keluarkan Penghuni Kamar 105/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Integritas Pembukuan Terjamin/i)).toBeInTheDocument();

    // Opsi default: 'Batalkan tagihan aktif bulan berjalan' terpilih
    const batalkanRadio = screen.getByRole("radio", {
      name: /Batalkan tagihan aktif bulan berjalan/i,
    });
    expect(batalkanRadio).toBeChecked();

    // Klik tombol konfirmasi Keluarkan Penghuni
    const confirmBtn = screen.getByRole("button", {
      name: /^Keluarkan Penghuni$/i,
    });
    fireEvent.click(confirmBtn);

    // Status Kamar 105 sekarang berubah menjadi KOSONG
    await waitFor(() => {
      expect(screen.getByText(/Kamar 105 \(Kosong\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Kamar siap disewakan/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Tambah Penghuni Kamar 105/i })
      ).toBeInTheDocument();
    });

    // Tagihan aktif September Kamar 105 dihapus dari store
    const tagihanAktif105 = usePaymentStore.getState().getTagihanAktifByKamar("105");
    expect(tagihanAktif105).toBeUndefined();

    // Riwayat masa lalu (Agustus 2026) tetap utuh menyimpan nama Anisa Rahma
    const riwayatAgustus = usePaymentStore
      .getState()
      .tagihanList.find((t) => t.nomorKamar === "105" && t.bulan === 8);
    expect(riwayatAgustus).toBeDefined();
    expect(riwayatAgustus?.penghuniNama).toBe("Anisa Rahma");
    expect(riwayatAgustus?.status).toBe("LUNAS");
  });

  it("3. Alur Keluarkan Penghuni dengan mempertahankan tagihan aktif sebagai arsip tunggakan", async () => {
    render(<PemilikDaftarKamar />);

    // Buka dialog keluarkan penghuni Kamar 101
    const keluarkanBtn101 = screen.getByRole("button", {
      name: /Keluarkan Penghuni Kamar 101/i,
    });
    fireEvent.click(keluarkanBtn101);

    // Pilih opsi: 'Pertahankan sebagai arsip catatan tunggakan'
    const arsipRadio = screen.getByRole("radio", {
      name: /Pertahankan sebagai arsip catatan tunggakan/i,
    });
    fireEvent.click(arsipRadio);
    expect(arsipRadio).toBeChecked();

    // Konfirmasi
    const confirmBtn = screen.getByRole("button", {
      name: /^Keluarkan Penghuni$/i,
    });
    fireEvent.click(confirmBtn);

    // Kamar 101 menjadi KOSONG
    await waitFor(() => {
      expect(screen.getByText(/Kamar 101 \(Kosong\)/i)).toBeInTheDocument();
    });

    // Tagihan September Kamar 101 tetap dipertahankan sebagai arsip dengan nama Rizky Ramadhan
    const tagihanAktif101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
    expect(tagihanAktif101).toBeDefined();
    expect(tagihanAktif101?.penghuniNama).toBe("Rizky Ramadhan");
  });

  it("4. Unit kamar KOSONG dapat mendaftarkan penghuni baru (+ Tambah Penghuni) dan menyinkronkan tanggal jatuh tempo", async () => {
    // 1. Kosongkan kamar 105 dulu via store
    usePaymentStore.getState().keluarkanPenghuni({
      kamarId: "105",
      batalkanTagihanAktif: true,
    });

    render(<PemilikDaftarKamar />);

    // Kamar 105 berstatus Kosong
    expect(screen.getByText(/Kamar 105 \(Kosong\)/i)).toBeInTheDocument();

    // Klik tombol '+ Tambah Penghuni' pada Kamar 105
    const tambahBtn = screen.getByRole("button", {
      name: /Tambah Penghuni Kamar 105/i,
    });
    fireEvent.click(tambahBtn);

    // Modal pendaftaran penghuni baru terbuka
    expect(screen.getByText(/Tambah Penghuni Baru/i)).toBeInTheDocument();
    expect(screen.getByText(/unit kamar 105/i)).toBeInTheDocument();

    // Isi formulir
    const namaInput = screen.getByLabelText(/Nama Lengkap Penghuni/i);
    fireEvent.change(namaInput, { target: { value: "Dewi Putri Maharani" } });

    const emailInput = screen.getByLabelText(/Email Akun Google/i);
    fireEvent.change(emailInput, { target: { value: "dewiputri@gmail.com" } });

    const teleponInput = screen.getByLabelText(/Nomor WhatsApp \/ HP/i);
    fireEvent.change(teleponInput, { target: { value: "0812-9988-7766" } });

    // Ubah tanggal masuk ke 2026-09-22
    const tanggalMasukInput = screen.getByLabelText(/Tanggal Masuk/i);
    fireEvent.change(tanggalMasukInput, { target: { value: "2026-09-22" } });

    // Verifikasi Tanggal Jatuh Tempo otomatis tersinkronisasi menjadi 22
    const jatuhTempoInput = screen.getByLabelText(/Jatuh Tempo \(Tgl\)/i) as HTMLInputElement;
    expect(jatuhTempoInput.value).toBe("22");

    // Pemilik dapat menyesuaikan secara manual jika disepakati (misal tgl 25)
    fireEvent.change(jatuhTempoInput, { target: { value: "25" } });
    expect(jatuhTempoInput.value).toBe("25");

    // Submit form pendaftaran
    const submitBtn = screen.getByRole("button", {
      name: /Daftarkan Penghuni/i,
    });
    fireEvent.click(submitBtn);

    // Kamar 105 kini kembali TERISI dengan nama penghuni baru
    await waitFor(() => {
      expect(screen.getByText(/Dewi Putri Maharani/i)).toBeInTheDocument();
      expect(screen.getByText(/dewiputri@gmail.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Jatuh tempo: 25 Sep 2026/i)).toBeInTheDocument();
    });

    // Verifikasi di store
    const kamar105 = usePaymentStore
      .getState()
      .kamarList.find((k) => k.nomorKamar === "105");
    expect(kamar105?.statusHunian).toBe("TERISI");
    expect(kamar105?.tanggalJatuhTempo).toBe(25);
    expect(kamar105?.penghuni?.email).toBe("dewiputri@gmail.com");

    const tagihan105 = usePaymentStore.getState().getTagihanAktifByKamar("105");
    expect(tagihan105).toBeDefined();
    expect(tagihan105?.penghuniNama).toBe("Dewi Putri Maharani");
    expect(tagihan105?.status).toBe("BELUM_BAYAR");
  });

  it("5. Kartu kamar TERISI menyediakan aksi cepat untuk mengubah email Google terdaftar (Ubah Email)", async () => {
    render(<PemilikDaftarKamar />);

    // Kamar 102 (Siti Nurhaliza) memiliki email awal kamar102@kostsyantika.com
    expect(screen.getByText(/kamar102@kostsyantika\.com/i)).toBeInTheDocument();

    // Klik tombol Ubah Email pada Kamar 102
    const ubahEmailBtn102 = screen.getByRole("button", {
      name: /Ubah Email Kamar 102/i,
    });
    fireEvent.click(ubahEmailBtn102);

    // Modal Ubah Email terbuka
    expect(screen.getByText(/Ubah Email Google Terdaftar/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamar 102 • Siti Nurhaliza/i)).toBeInTheDocument();

    // Masukkan email baru
    const emailBaruInput = screen.getByLabelText(/Email Akun Google Baru/i);
    fireEvent.change(emailBaruInput, { target: { value: "siti.resmi@gmail.com" } });

    // Simpan email baru
    const simpanBtn = screen.getByRole("button", { name: /Simpan Email Baru/i });
    fireEvent.click(simpanBtn);

    // Email pada kartu kamar terbarui secara reaktif
    await waitFor(() => {
      expect(screen.getByText(/siti\.resmi@gmail\.com/i)).toBeInTheDocument();
    });

    // Verifikasi di store
    const kamar102 = usePaymentStore
      .getState()
      .kamarList.find((k) => k.nomorKamar === "102");
    expect(kamar102?.penghuni?.email).toBe("siti.resmi@gmail.com");
  });

  it("6. Tab filter 'Kosong' berfungsi menyaring hanya unit kamar yang belum berpenghuni", async () => {
    // Kosongkan 2 kamar: 104 dan 107
    usePaymentStore.getState().keluarkanPenghuni({ kamarId: "104", batalkanTagihanAktif: true });
    usePaymentStore.getState().keluarkanPenghuni({ kamarId: "107", batalkanTagihanAktif: true });

    render(<PemilikDaftarKamar />);

    // Tab filter Kosong (2) muncul
    const kosongFilterBtn = screen.getByRole("button", { name: /^Kosong \(2\)$/i });
    expect(kosongFilterBtn).toBeInTheDocument();

    // Klik tab filter Kosong
    fireEvent.click(kosongFilterBtn);

    // Hanya Kamar 104 dan 107 (Kosong) yang ditampilkan
    expect(screen.getByText(/Kamar 104 \(Kosong\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Kamar 107 \(Kosong\)/i)).toBeInTheDocument();

    // Kamar 101 (Terisi) tidak muncul
    expect(screen.queryByText(/Rizky Ramadhan/i)).not.toBeInTheDocument();
  });
});

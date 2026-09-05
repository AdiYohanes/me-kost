# 07: Optimasi Kecepatan UI "Super Smooth" & Sinkronisasi Supabase Realtime

**What to build:** Lapisan performa antarmuka yang mengintegrasikan caching data, pembaruan optimistik (Optimistic UI), dan langganan Supabase Realtime agar seluruh interaksi di ponsel terasa instan (<50ms) dan data tagihan/verifikasi tersinkronisasi otomatis antar-perangkat tanpa perlu refresh.

**Blocked by:** 05: Pengingat Jatuh Tempo H-3 & Tombol 1-Klik WhatsApp, 06: Kompresi Foto Bukti Transfer di Klien & Verifikasi / Penolakan Tagihan

**Status:** completed

- [x] TanStack Query diintegrasikan untuk mengelola caching data kamar, tagihan, dan bukti pembayaran di sisi klien.
- [x] Optimistic UI diterapkan pada aksi-aksi utama (Verifikasi Lunas, Tolak Bukti, Tandai Cash) sehingga tampilan kartu tagihan berubah seketika (<50ms) tanpa jeda loading.
- [x] Supabase Realtime aktif berlangganan perubahan pada tabel `tagihan` dan `bukti_pembayaran`.
- [x] Ketika Penghuni mengunggah bukti transfer baru di ponselnya, antrean verifikasi di ponsel Pemilik Kost otomatis terbarui secara langsung via WebSocket tanpa memuat ulang browser.
- [x] Penanganan kesalahan jaringan (rollback optimistik dan toast notifikasi) berjalan mulus jika transaksi gagal terkirim ke Supabase.
- [x] Pengujian integrasi memverifikasi respon optimistik dan penanganan kesalahan mutasi.

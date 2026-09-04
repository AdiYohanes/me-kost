# 03: Tampilan Penghuni Tagihan dan Upload Bukti

**What to build:** Antarmuka Penghuni di `/dashboard` yang menampilkan informasi Kamar aktif, kartu Tagihan sewa bulan berjalan dengan indikator Status Pembayaran yang jelas, form pengunggahan foto Bukti Pembayaran transfer (Base64) dengan pratinjau langsung yang mengubah status menjadi Menunggu Verifikasi, tombol informasi Bayar Tunai, serta daftar riwayat pembayaran bulanan.

**Blocked by:** 02: Autentikasi Mock dan Unified Dashboard Guard

**Status:** resolved

- [x] Header Penghuni menampilkan nomor Kamar, nama Penghuni, dan tipe kamar
- [x] Kartu Tagihan aktif menampilkan periode bulan berjalan, nominal sewa, batas bayar, dan badge Status Pembayaran dengan kode warna konsisten
- [x] Jika status Belum Bayar atau Ditolak, Penghuni dapat mengunggah foto Bukti Pembayaran dari perangkat dengan pratinjau gambar instan
- [x] Pengunggahan bukti mengonversi gambar ke Base64, menyimpannya ke state lokal persisten, dan mengubah Status Pembayaran menjadi Menunggu Verifikasi
- [x] Tersedia tombol Bayar Tunai yang membuka dialog panduan pembayaran tunai dan kontak langsung ke Pemilik Kost
- [x] Jika status Ditolak, Penghuni dapat melihat kartu peringatan berisi Alasan Penolakan dari Pemilik Kost serta tombol untuk mengunggah ulang bukti pembayaran
- [x] Tab/bagian riwayat pembayaran menampilkan daftar tagihan bulan-bulan sebelumnya beserta status dan thumbnail bukti pembayaran

## Answer

Implementasi selesai sesuai seluruh kriteria:
1. Model domain didefinisikan di `types/payment.ts`.
2. Store persistent Zustand (`usePaymentStore`) di `lib/store/use-payment-store.ts` mengelola status `BELUM_BAYAR`, `MENUNGGU_VERIFIKASI`, `LUNAS`, dan `DITOLAK`.
3. Komponen `PenghuniTagihanCard` mendukung konversi berkas gambar ke Base64 via `FileReader`, pratinjau instan, status penolakan beserta alasan penolakan dari pemilik, dan tombol bayar tunai.
4. Komponen `BayarTunaiDialog` menyajikan panduan pembayaran uang tunai, alamat lokasi pengelola kost, nomor telepon pemilik, dan tombol salin nomor / WhatsApp.
5. Komponen `PenghuniRiwayatPembayaran` menyajikan riwayat tagihan bulanan terdahulu lengkap dengan status lunas dan lightbox bukti transfer.
6. Seluruh pengujian otomatis TDD (11 test files, 41 tests) lulus 100% dan lolos pemeriksaan tipe TypeScript serta ESLint.

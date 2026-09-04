# 03: Tampilan Penghuni Tagihan dan Upload Bukti

**What to build:** Antarmuka Penghuni di `/dashboard` yang menampilkan informasi Kamar aktif, kartu Tagihan sewa bulan berjalan dengan indikator Status Pembayaran yang jelas, form pengunggahan foto Bukti Pembayaran transfer (Base64) dengan pratinjau langsung yang mengubah status menjadi Menunggu Verifikasi, tombol informasi Bayar Tunai, serta daftar riwayat pembayaran bulanan.

**Blocked by:** 02: Autentikasi Mock dan Unified Dashboard Guard

**Status:** ready-for-agent

- [ ] Header Penghuni menampilkan nomor Kamar, nama Penghuni, dan tipe kamar
- [ ] Kartu Tagihan aktif menampilkan periode bulan berjalan, nominal sewa, batas bayar, dan badge Status Pembayaran dengan kode warna konsisten
- [ ] Jika status Belum Bayar atau Ditolak, Penghuni dapat mengunggah foto Bukti Pembayaran dari perangkat dengan pratinjau gambar instan
- [ ] Pengunggahan bukti mengonversi gambar ke Base64, menyimpannya ke state lokal persisten, dan mengubah Status Pembayaran menjadi Menunggu Verifikasi
- [ ] Tersedia tombol Bayar Tunai yang membuka dialog panduan pembayaran tunai dan kontak langsung ke Pemilik Kost
- [ ] Jika status Ditolak, Penghuni dapat melihat kartu peringatan berisi Alasan Penolakan dari Pemilik Kost serta tombol untuk mengunggah ulang bukti pembayaran
- [ ] Tab/bagian riwayat pembayaran menampilkan daftar tagihan bulan-bulan sebelumnya beserta status dan thumbnail bukti pembayaran

# 03: Manajemen Kamar, Pendaftaran Penghuni Baru, & Alur Keluar Kost (Soft Disconnect)

**What to build:** Antarmuka dan operasi manajemen kamar pada dashboard Pemilik Kost untuk memantau status hunian seluruh unit fisik, mendaftarkan anak kost baru pada kamar kosong, serta melepaskan anak kost yang masa sewanya selesai tanpa merusak riwayat pembukuan masa lalu.

**Blocked by:** 01: Setup Supabase Foundation, Skema Basis Data SQL, & Konfigurasi Klien, 02: Autentikasi Pengguna & Penaut Kamar Otomatis (Google OAuth & Manual)

**Status:** resolved

- [x] Seluruh unit kamar ditampilkan berurutan secara fisik (101, 102, dst.) pada dashboard Pemilik Kost dengan indikator status hunian `TERISI` atau `KOSONG`.
- [x] Unit kamar `KOSONG` menampilkan tombol `+ Tambah Penghuni` yang membuka modal input: nama lengkap, email Google, nomor WhatsApp, dan tanggal masuk.
- [x] Tanggal Jatuh Tempo kamar secara otomatis disetel mengikuti tanggal masuk penghuni, dengan opsi penyesuaian tanggal jika disepakati.
- [x] Kartu kamar `TERISI` menyediakan aksi cepat untuk mengubah email Google terdaftar jika terjadi kesalahan input atau penggantian akun oleh anak kost.
- [x] Aksi "Keluarkan Penghuni" menampilkan dialog konfirmasi yang menawarkan pilihan: batalkan tagihan aktif bulan berjalan atau pertahankan sebagai arsip catatan tunggakan.
- [x] Eksekusi "Keluarkan Penghuni" menjalankan *soft disconnect*: akun anak kost dilepas dari kamar (`kamar_id = NULL`), status kamar kembali menjadi `KOSONG`, sementara nama penghuni lama pada tagihan dan bukti transfer bulan-bulan sebelumnya tetap utuh tersimpan.
- [x] Pengujian integrasi memverifikasi alur pendaftaran penghuni baru dan alur pelepasan penghuni keluar kost.


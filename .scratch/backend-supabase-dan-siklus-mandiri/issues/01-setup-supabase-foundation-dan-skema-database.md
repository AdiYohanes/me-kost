# 01: Setup Supabase Foundation, Skema Basis Data SQL, & Konfigurasi Klien

**What to build:** Fondasi koneksi basis data cloud Supabase yang menyediakan skema database lengkap untuk operasional kost, penyimpanan berkas foto bukti transfer, serta modul klien Supabase di Next.js yang aman dan siap digunakan oleh seluruh fitur aplikasi.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Skrip SQL pembuatan tabel `kamar`, `users`, `tagihan`, dan `bukti_pembayaran` tersedia di repositori dan siap dieksekusi di Supabase SQL Editor.
- [x] Aturan keamanan database Row Level Security (RLS) dikonfigurasi untuk membatasi hak akses Penghuni hanya ke data kamar dan tagihan miliknya sendiri, sementara Pemilik Kost memiliki akses penuh ke seluruh tabel.
- [x] Bucket Supabase Storage `bukti-pembayaran` dibuat dengan izin unggah untuk pengguna terautentikasi.
- [x] Klien Supabase (browser client dan server client) terkonfigurasi dengan variabel lingkungan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [x] Unit/integration test dasar memverifikasi inisialisasi klien Supabase dan pembacaan konfigurasi berjalan dengan benar.


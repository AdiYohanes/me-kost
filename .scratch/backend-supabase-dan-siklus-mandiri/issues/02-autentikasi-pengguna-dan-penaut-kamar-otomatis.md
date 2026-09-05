# 02: Autentikasi Pengguna & Penaut Kamar Otomatis (Google OAuth & Manual)

**What to build:** Sistem autentikasi hibrida yang memungkinkan Pemilik Kost masuk dengan Email & Password manual, serta Penghuni masuk dengan Google OAuth 1-klik yang otomatis dicocokkan dengan kamar terdaftar berdasarkan email Google mereka.

**Blocked by:** 01: Setup Supabase Foundation, Skema Basis Data SQL, & Konfigurasi Klien

**Status:** resolved

- [x] Halaman login menyediakan tombol "Lanjutkan dengan Google" untuk Penghuni dan formulir Email/Password untuk Pemilik Kost.
- [x] Pengguna dengan peran Pemilik Kost yang login berhasil dialihkan ke tampilan dashboard Pemilik.
- [x] Penghuni yang masuk dengan Google diverifikasi terhadap email yang terdaftar pada tabel `users`; jika cocok, sesi Penghuni otomatis tertaut ke kamar terkait dan dialihkan ke dashboard Penghuni.
- [x] Pengguna luar yang mencoba masuk dengan akun Google yang belum terdaftar di kamar manapun ditolak secara ramah dengan pesan instruksi untuk menghubungi Pemilik Kost.
- [x] Sesi pengguna persisten saat aplikasi dibuka kembali atau diluncurkan sebagai PWA standalone.
- [x] Opsi keluar (Logout) berfungsi dengan aman menghapus sesi aktif.
- [x] Pengujian integrasi memverifikasi kedua alur login dan penanganan email tak terdaftar.


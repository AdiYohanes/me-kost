# 02: Autentikasi Mock dan Unified Dashboard Guard

**What to build:** Sistem autentikasi mock berbasis form login standar dan sesi lokal yang mengarahkan semua pengguna terautentikasi ke rute tunggal terpadu `/dashboard`. Di `/dashboard`, sistem secara dinamis me-render antarmuka Penghuni atau Pemilik Kost sesuai peran aktif. Pengguna tanpa sesi dialihkan ke `/login`, sedangkan halaman root `/` otomatis mengarahkan ke `/dashboard` jika sudah login.

**Blocked by:** 01: Fondasi Desain PWA Setup

**Status:** ready-for-agent

- [ ] Halaman `/login` menyediakan form input username dan password standar dengan pesan error jika kredensial salah
- [ ] Tersedia kartu panduan kredensial demo di halaman login (Pemilik Kost: `pemilik`/`123456`, Penghuni: nomor kamar `101`-`108`/`123456`)
- [ ] State sesi autentikasi dikelola di store lokal dengan persistensi sehingga sesi tidak hilang saat halaman di-refresh
- [ ] Rute tunggal `/dashboard` menampilkan kerangka antarmuka dinamis: menampilkan tampilan Pemilik Kost jika login sebagai pemilik, atau tampilan Penghuni kamar bersangkutan jika login sebagai penghuni
- [ ] Akses langsung ke `/dashboard` tanpa sesi otomatis dialihkan ke `/login`
- [ ] Tersedia tombol Logout yang membersihkan sesi dan mengarahkan kembali ke `/login`

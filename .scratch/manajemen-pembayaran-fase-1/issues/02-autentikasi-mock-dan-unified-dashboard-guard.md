# 02: Autentikasi Mock dan Unified Dashboard Guard

**What to build:** Sistem autentikasi mock berbasis form login standar dan sesi lokal yang mengarahkan semua pengguna terautentikasi ke rute tunggal terpadu `/dashboard`. Di `/dashboard`, sistem secara dinamis me-render antarmuka Penghuni atau Pemilik Kost sesuai peran aktif. Pengguna tanpa sesi dialihkan ke `/login`, sedangkan halaman root `/` otomatis mengarahkan ke `/dashboard` jika sudah login.

**Blocked by:** 01: Fondasi Desain PWA Setup

**Status:** resolved

- [x] Halaman `/login` menyediakan form input username dan password standar dengan pesan error jika kredensial salah
- [x] Tersedia kartu panduan kredensial demo di halaman login (Pemilik Kost: `pemilik`/`123456`, Penghuni: nomor kamar `101`-`108`/`123456`)
- [x] State sesi autentikasi dikelola di store lokal dengan persistensi sehingga sesi tidak hilang saat halaman di-refresh
- [x] Rute tunggal `/dashboard` menampilkan kerangka antarmuka dinamis: menampilkan tampilan Pemilik Kost jika login sebagai pemilik, atau tampilan Penghuni kamar bersangkutan jika login sebagai penghuni
- [x] Akses langsung ke `/dashboard` tanpa sesi otomatis dialihkan ke `/login`
- [x] Tersedia tombol Logout yang membersihkan sesi dan mengarahkan kembali ke `/login`

## Answer

Sistem autentikasi mock dan unified dashboard guard berhasil diimplementasikan secara penuh:
1. **Model & Mock Database**: Definisi types `UserRole`, `UserSession`, `AuthState` di `types/auth.ts` serta database akun mock di `lib/mock-data.ts` untuk akun Pemilik Kost (`pemilik`) dan Penghuni kamar 101 s.d. 108 dengan kata sandi `123456`.
2. **State Sesi Lokal (Zustand Persist)**: Store `useAuthStore` di `lib/store/use-auth-store.ts` menggunakan middleware `persist` LocalStorage (`kost-syantika-auth`) yang tahan refresh browser.
3. **Proteksi Rute (Guards)**: Komponen `AuthGuard` di `components/auth/auth-guard.tsx` mengalihkan akses tanpa sesi ke `/login`, dan `GuestGuard` di `components/auth/guest-guard.tsx` mengalihkan pengguna terautentikasi dari `/login` ke `/dashboard`. Halaman root `/` mengarahkan otomatis sesuai status sesi.
4. **Halaman Login & Kartu Panduan Demo**: Form login di `app/login/page.tsx` dengan validasi kredensial, pesan error interaktif, serta kartu demo satu-klik masuk untuk Pemilik Kost dan Penghuni (chip 101–108).
5. **Unified Dashboard & Dynamic Role Views**: Rute tunggal `app/dashboard/page.tsx` me-render `PemilikDashboardView` untuk Pemilik Kost atau `PenghuniDashboardView` untuk Penghuni bersangkutan, dilengkapi `DashboardHeader` dan tombol Logout yang membersihkan sesi.
6. **Pengujian Menyeluruh (TDD)**: 18 unit test baru (total 26 test di test suite) untuk auth store, login page, root page, dan dashboard guard berhasil lolos 100%, disertai validasi `tsc` dan `eslint` tanpa peringatan.

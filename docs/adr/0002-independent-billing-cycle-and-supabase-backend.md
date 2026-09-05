# ADR 0002: Arsitektur Backend Supabase BaaS dan Siklus Tagihan Mandiri per Kamar

* **Status**: Diterima (Accepted)
* **Tanggal**: 2026-09-05
* **Konteks Terkait**: [ADR 0001](file:///c:/Users/USER/Documents/ai-native/kost-syantika/docs/adr/0001-client-side-mock-state-zustand.md), [CONTEXT.md](file:///c:/Users/USER/Documents/ai-native/kost-syantika/CONTEXT.md), [Spesifikasi Desain](file:///c:/Users/USER/Documents/ai-native/kost-syantika/docs/superpowers/specs/2026-09-05-supabase-backend-design.md)

---

## Konteks

Pada Fase 1, Kost Syantika dibangun sebagai aplikasi PWA frontend dengan mock store sisi klien (Zustand + LocalStorage). Namun untuk penggunaan operasional nyata (< 30 kamar kost), Pemilik Kost dan Penghuni menggunakan perangkat HP fisik yang berbeda, sehingga dibutuhkan media penyimpanan terpusat di awan agar bukti pembayaran dan status verifikasi tersinkronisasi secara langsung.

Selain itu, pada kenyataan operasional kost, setiap penghuni masuk pada tanggal yang berbeda-beda sehingga sistem penagihan serentak tanggal 1 kalender tidak mencerminkan kebutuhan bisnis nyata.

---

## Keputusan

1. **Backend-as-a-Service (BaaS) Supabase + Hosting Vercel**:
   - Menggunakan Supabase (PostgreSQL, Supabase Storage, Supabase Auth) untuk menggantikan server backend kustom.
   - Hosting frontend PWA di Vercel (Hobby Tier), memastikan biaya operasional tetap **Rp 0 / bulan** (100% Free Tier untuk < 30 kamar).

2. **Siklus Tagihan Mandiri per Kamar**:
   - Tanggal Jatuh Tempo dihitung secara mandiri berdasarkan Tanggal Masuk masing-masing Penghuni (misal: masuk tanggal 15, maka jatuh tempo tanggal 15 setiap bulan), dengan fleksibilitas kustomisasi tanggal oleh Pemilik Kost.
   - Tagihan periode berikutnya diterbitkan secara otomatis 7 hari sebelum tanggal jatuh tempo (**H-7**) melalui mekanisme hybrid on-open.
   - Pengingat Jatuh Tempo aktif 3 hari sebelum jatuh tempo (**H-3**) melalui In-App Banner di aplikasi Penghuni, tombol 1-klik WhatsApp di aplikasi Pemilik Kost, dan Web Push Notification.
   - Tagihan yang melampaui tanggal jatuh tempo tanpa pelunasan otomatis berstatus `MENUNGGAK`.

3. **Autentikasi & Siklus Hidup Penghuni**:
   - Pemilik Kost masuk secara manual dengan Email/Password.
   - Penghuni masuk menggunakan Google OAuth, dicocokkan dengan email yang didaftarkan Pemilik Kost pada kamar terkait.
   - Pada saat penghuni keluar kost, sistem menerapkan *soft disconnect* (`kamar_id = NULL`), mengubah status kamar menjadi `KOSONG`, dan mempertahankan riwayat tagihan serta nama penghuni untuk integritas pembukuan masa lalu.

4. **Kinerja & Kehalusan UI (Smoothness)**:
   - Menerapkan TanStack Query dengan *Optimistic Updates* (respon UI < 50ms) dan *Supabase Realtime* (sinkronisasi instan bukti transfer baru tanpa refresh halaman).
   - Kompresi gambar client-side WebP (~150 KB/bukti) sebelum diunggah ke Supabase Storage.

---

## Konsekuensi

* **Positif**:
  - Nol biaya server fisik dan database.
  - Sesuai dengan realitas operasional kamar kost di lapangan.
  - Pengalaman pengguna mobile-first sangat cepat dan reaktif layaknya aplikasi native.
  - Data historis keuangan tetap aman dan akurat meskipun terjadi pergantian anak kost.
* **Tantangan**:
  - Membutuhkan setup awal skema tabel dan kebijakan keamanan (Row Level Security) di Supabase.
  - Frontend perlu menangani state hybrid (caching lokal + sinkronisasi online) secara rapi.

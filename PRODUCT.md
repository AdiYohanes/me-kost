# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Pemilik Kost**: Pengelola properti yang menetapkan tagihan bulanan, memverifikasi bukti pembayaran transfer bank/e-wallet, serta mencatat pelunasan tunai (cash).
- **Penghuni**: Penyewa kamar kost yang terdaftar pada unit kamar tertentu, memiliki kewajiban membayar sewa setiap periode bulanan, mengunggah bukti pembayaran transfer, atau meminta konfirmasi pelunasan tunai.

## Product Purpose
Aplikasi PWA manajemen pembayaran sewa kamar kost bulanan (mobile-first) yang menyederhanakan alur penagihan sewa, konfirmasi pembayaran, dan verifikasi bukti transfer antara Penghuni dan Pemilik Kost secara instan, transparan, dan bebas repot tanpa ketergantungan backend eksternal pada tahap saat ini.

## Positioning
Berbeda dari aplikasi manajemen properti umum yang rumit, kaku, dan lambat, Kost Syantika menghadirkan pengalaman secepat aplikasi chat dengan UI Modern Clean Fintech yang teroptimasi untuk perangkat mobile, fokus murni pada lifecycle penagihan dan verifikasi bukti sewa bulanan berbasis client-side persist store.

## Operating Context
- Digunakan melalui smartphone (PWA standalone di browser mobile) oleh Penghuni sesaat setelah mentransfer uang sewa untuk melampirkan tangkapan layar bukti transfer dan catatan opsional.
- Digunakan oleh Pemilik Kost secara mobile untuk memeriksa antrean verifikasi bukti transfer, mengecek keabsahan foto struk melalui lightbox zoom, menyetujui pelunasan, atau menolak dengan mencantumkan alasan penolakan.
- Digunakan oleh Pemilik Kost saat bertransaksi langsung (tunai) dengan aksi cepat "Tandai Lunas (Cash)".

## Capabilities and Constraints
- **Client-Side Mock Store**: Seluruh data (`Kamar`, `Penghuni`, `Tagihan`, `Bukti Pembayaran`, Sesi Autentikasi) dikelola di sisi klien menggunakan Zustand persist (LocalStorage) tanpa database eksternal.
- **Unggah & Pratinjau Bukti**: Foto bukti transfer diubah menjadi Base64 melalui `FileReader` agar langsung dapat dipratinjau dalam rasio dokumen dan modal perbesaran layar penuh (*lightbox zoom*).
- **Rute Polimorfik**: Rute `/dashboard` secara otomatis merender antarmuka Pemilik Kost atau Penghuni sesuai sesi login; pengguna tanpa sesi dialihkan ke `/login`.
- **Domain Language Ketat**: Wajib mematuhi `CONTEXT.md` (`Pemilik Kost`, `Penghuni`, `Kamar`, `Tagihan`, `Bukti Pembayaran`, `Status Pembayaran`, `Metode Pembayaran`, `Alasan Penolakan`). Dilarang menggunakan sinonim asing/generik (Admin, Tenant, Room, Invoice, Receipt, dsb.).

## Brand Commitments
- **Identitas Produk**: Kost Syantika.
- **Estetika Visual**: Modern Clean Fintech, palet primer emerald (`#04A552`), latar slate lembut (`bg-slate-50`), aksen amber untuk nomor kamar dan antrean, rose untuk penolakan, serta tipografi Plus Jakarta Sans.
- **Ergonomi**: Mobile-first, kontrol ramah jempol (*thumb-friendly* minimal tinggi 40px / `h-10`), soft badges, dan navigasi bawah (bottom navigation) yang ringkas.

## Evidence on Hand
- `CONTEXT.md`: Dokumen resmi terminologi domain dan aturan batas sinonim.
- `docs/adr/0001-client-side-mock-state-zustand.md`: Rekaman keputusan arsitektur client-side mock store.
- `app/layout.tsx`: Konfigurasi PWA viewport, font Google Plus Jakarta Sans, toaster sonner, dan tema emerald.
- `lib/store/use-payment-store.ts` & `lib/store/use-auth-store.ts`: Mock store dan data awal kamar 101–108.
- `tests/`: Suite pengujian integrasi Vitest lengkap untuk verifikasi komponen dan alur pengguna.

## Product Principles
1. **Zero-Backend Friction**: Sistem bekerja 100% reaktif dan persisten di sisi klien tanpa hambatan setup server atau latensi database.
2. **Tactile & Scannable Hierarchy**: Informasi kunci (nomor kamar, nama penghuni, nominal rupiah, dan status) dapat dipindai dalam hitungan detik dengan tombol aksi yang ergonomis.
3. **Strict Domain Integrity**: Bahasa antarmuka dan basis kode konsisten 100% dengan istilah domain lokal tanpa terminologi ambigu.
4. **Verifiable Reliability**: Setiap penyempurnaan desain wajib mempertahankan kelulusan suite pengujian otomatis (Vitest) dan kompatibilitas build Next.js.

## Accessibility & Inclusion
- Target sentuh ergonomis minimal 40px (`h-10`) untuk tombol aksi verifikasi dan interaksi formulir.
- Kontras warna teks memenuhi pedoman WCAG untuk keterbacaan di layar ponsel luar ruangan.
- Aksesibilitas visual untuk bukti transfer dengan thumbnail interaktif dan modal zoom yang mudah ditutup.

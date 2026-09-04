Status: ready-for-agent

# Spesifikasi: Aplikasi Manajemen Pembayaran Kost Syantika (Fase 1)

## Problem Statement

Pemilik kost sering mengalami kendala pencatatan manual pembayaran sewa kamar bulanan, pelacakan bukti transfer yang tercecer di chat pribadi, serta verifikasi penghuni yang membayar secara tunai vs transfer bank. Di sisi lain, penghuni kost kesulitan memantau status tagihan bulanannya, riwayat pembayaran masa lalu, dan kepastian apakah bukti transfer yang dikirimkan sudah diverifikasi atau ditolak oleh pemilik kost. 

Untuk Fase 1, dibutuhkan antarmuka pengguna (Frontend UI) mobile-first yang siap dipasang sebagai PWA (Add to Home Screen) dengan mock data interaktif dan persisten tanpa membebani proses pengembangan awal dengan konfigurasi database atau cloud storage sungguhan.

## Solution

Aplikasi web mobile-first berbasis Next.js (App Router, Tailwind CSS, TypeScript, Zustand, dan Shadcn UI) dengan desain ramah dan bersih terinspirasi gaya Mamikos & Duolingo (aksen hijau segar, sudut membulat, bayangan lembut).

Aplikasi menyediakan:
1. Autentikasi mock sederhana untuk Pemilik Kost dan Penghuni dengan satu rute terpadu (`/dashboard`).
2. Dashboard Penghuni: Informasi Tagihan aktif, form unggah Bukti Pembayaran transfer (mock Base64) dengan pratinjau, petunjuk bayar tunai, dan riwayat pembayaran bulanan.
3. Dashboard Pemilik Kost: Ringkasan metrik keuangan bulanan, daftar seluruh Kamar dan statusnya, antrean verifikasi Bukti Pembayaran dengan modal lightbox zoom dan aksi Approve/Reject (disertai alasan penolakan), serta aksi 'Tandai Lunas (Cash)'.
4. Penyimpanan data berbasis Zustand dengan middleware persistensi lokal (LocalStorage) agar data tetap tersimpan saat aplikasi di-refresh atau dibuka via PWA di smartphone.
5. Konfigurasi PWA lengkap (`manifest.json` dan icons) agar dapat ditambahkan ke Home Screen perangkat bergerak.

## User Stories

1. As a Penghuni, I want to log in using my room number and password, so that I can access my specific room bill and payment records.
2. As a Pemilik Kost, I want to log in using my owner credentials, so that I can manage payments and verify tenant transactions.
3. As an unauthenticated user, I want demo credential hints visible on the login screen, so that I can easily test and evaluate both roles without guessing credentials.
4. As an authenticated user (Penghuni or Pemilik Kost), I want to be redirected to a single `/dashboard` route that automatically renders my role's interface, so that my navigation URL is simple and consistent.
5. As an unauthenticated user attempting to access `/dashboard`, I want to be redirected to `/login`, so that protected information is safeguarded.
6. As a Penghuni, I want to see my current month's Tagihan amount, due date, and Status Pembayaran on my dashboard, so that I clearly know my financial obligation.
7. As a Penghuni with an unpaid Tagihan, I want to upload a photo of my transfer proof (Bukti Pembayaran) with an instant preview, so that I can submit it for verification.
8. As a Penghuni, I want my Tagihan status to change to 'Menunggu Verifikasi' immediately after uploading my transfer proof, so that I know my submission has been received.
9. As a Penghuni, I want to see a 'Bayar Tunai' action with clear instructions and a contact button, so that I can arrange physical cash payment directly with the Pemilik Kost.
10. As a Penghuni, I want to view my monthly payment history with status badges, so that I have a reliable archive of past settlements.
11. As a Penghuni whose payment proof was rejected, I want to see the specific reason for rejection and a prompt to re-upload proof, so that I can quickly rectify the issue.
12. As a Pemilik Kost, I want a summary card on my dashboard showing total paid rooms, unpaid rooms, and total monthly income, so that I have immediate visibility over monthly cashflow.
13. As a Pemilik Kost, I want to view a list of all Kamar with their current occupant and payment status, so that I can monitor occupancy and payment health.
14. As a Pemilik Kost, I want to filter rooms by status (All, Lunas, Belum Bayar), so that I can quickly target occupants who have overdue bills.
15. As a Pemilik Kost, I want a dedicated verification queue showing all submitted Bukti Pembayaran awaiting approval, so that I can review pending transactions efficiently.
16. As a Pemilik Kost, I want to open a zoomable lightbox preview of a tenant's uploaded Bukti Pembayaran, so that I can inspect the nominal, timestamp, and account details closely.
17. As a Pemilik Kost, I want to approve a valid Bukti Pembayaran with one click, so that the Tagihan transitions to 'Lunas' and records the approval timestamp.
18. As a Pemilik Kost, I want to reject an invalid Bukti Pembayaran with a mandatory rejection note, so that the Penghuni understands why their submission was declined.
19. As a Pemilik Kost, I want to mark a Tagihan as 'Lunas (Cash)' via a confirmation dialog when receiving physical money, so that cash transactions are properly accounted for.
20. As a Pemilik Kost, I want to generate or adjust bills for the upcoming monthly period, so that billing schedules stay up-to-date.
21. As a mobile user, I want a thumb-friendly Bottom Navigation bar, so that navigating between views feels like a native mobile app.
22. As a mobile user, I want the web app to have a PWA manifest and icons, so that I can 'Add to Home Screen' and launch it in standalone mode on my smartphone.
23. As a tester/evaluator, I want mock state and uploaded images to persist in local browser storage, so that page refreshes and PWA restarts do not wipe out demo progress.
24. As a user, I want to easily log out or reset mock data to its initial baseline, so that I can restart demo scenarios cleanly.

## Implementation Decisions

1. **Rute Terpadu & Guard Navigasi**:
   - `/login`: Form autentikasi standar dengan verifikasi terhadap store Zustand dan kartu panduan cepat demo.
   - `/dashboard`: Halaman tunggal yang secara dinamis me-render tampilan `PemilikDashboardView` atau `PenghuniDashboardView` bergantung pada `authSession.role`. Pengguna tanpa sesi otomatis dialihkan ke `/login`. Root `/` otomatis mengarahkan ke `/dashboard` (atau `/login`).
   - Sesuai keputusan ADR-0001, arsitektur berbasis client-side mock store menggunakan Zustand dengan persistensi `localStorage`.

2. **State Machine Status Pembayaran**:
   - Transisi status:
     - `BELUM_BAYAR` ➡️ (Penghuni unggah Bukti Pembayaran) ➡️ `MENUNGGU_VERIFIKASI`
     - `MENUNGGU_VERIFIKASI` ➡️ (Pemilik Kost klik Approve) ➡️ `LUNAS` (Metode: `TRANSFER`)
     - `MENUNGGU_VERIFIKASI` ➡️ (Pemilik Kost klik Reject + Alasan) ➡️ `DITOLAK`
     - `DITOLAK` ➡️ (Penghuni unggah ulang Bukti Pembayaran) ➡️ `MENUNGGU_VERIFIKASI`
     - `BELUM_BAYAR` atau `DITOLAK` ➡️ (Pemilik Kost klik 'Tandai Lunas Cash') ➡️ `LUNAS` (Metode: `CASH`)

3. **Representasi & Penyimpanan Bukti Pembayaran**:
   - Berkas foto bukti transfer dikonversi menjadi data string Base64 (`FileReader.readAsDataURL`) agar dapat langsung di-preview di sisi penghuni dan dibuka kembali oleh pemilik kost dari state lokal tanpa backend storage.

4. **Struktur Data Domain (Type Contracts)**:
   ```typescript
   export type RoomType = 'STANDAR' | 'VIP_AC';
   export type PaymentStatus = 'BELUM_BAYAR' | 'MENUNGGU_VERIFIKASI' | 'LUNAS' | 'DITOLAK';
   export type PaymentMethod = 'TRANSFER' | 'CASH';

   export interface Room {
     id: string;
     number: string;
     type: RoomType;
     priceMonthly: number;
     tenantName: string;
     tenantPhone: string;
   }

   export interface Bill {
     id: string;
     roomId: string;
     periodMonth: string;
     amount: number;
     status: PaymentStatus;
     method?: PaymentMethod;
     proofImageUrl?: string;
     uploadedAt?: string;
     verifiedAt?: string;
     rejectionReason?: string;
     notes?: string;
   }

   export interface AuthSession {
     role: 'PEMILIK' | 'PENGHUNI';
     roomId?: string;
     name: string;
   }
   ```

5. **Gaya Desain & Komponen UI (Mamikos / Duolingo Inspired)**:
   - Warna primer hijau segar (emerald `#04A552` / `#059669`), kontras teks tinggi, sudut melengkung `rounded-2xl`, serta efek bayangan lembut.
   - Komponen Shadcn UI yang digunakan: Button, Card, Badge, Dialog, Input, Label, Tabs, Avatar, Sonner (Toast), Separator, Textarea.
   - Komponen reusable khusus: `<StatusBadge />`, `<ReceiptPreviewModal />`, `<RejectReasonModal />`, `<CashConfirmModal />`, `<BottomNav />`.

6. **PWA Manifest & Mobile Standalone**:
   - `public/manifest.json` dengan konfigurasi `display: standalone`, nama "Kost Syantika", short name "Syantika", dan tema warna `#04A552`.

## Testing Decisions

1. **Definisi Pengujian Berkualitas**:
   - Pengujian berfokus pada perilaku eksternal (observable behavior) dan transisi status pembayaran, bukan detail implementasi internal.
   - Skenario mencakup: autentikasi kredensial, perubahan status tagihan saat bukti diunggah, approval/rejection bukti transfer, pembayaran cash, serta persistensi storage.

2. **Seam Pengujian**:
   - **Primary Seam**: **Domain Store API (`useKostStore`)**. Ini adalah *highest common seam* yang mengorkestrasi seluruh aturan bisnis, validasi auth, mutasi tagihan, dan state machine pembayaran tanpa ketergantungan pada browser headless.
   - **Secondary Seam**: **Component Integration Seam** pada halaman `/dashboard` dan `/login` untuk memverifikasi interaksi klik, pratinjau modal, dan responsivitas layout navigasi mobile.

## Out of Scope

- Koneksi basis data riil (PostgreSQL, MySQL, MongoDB, dsb.).
- Layanan otentikasi eksternal (OAuth, Supabase Auth, NextAuth dengan database session).
- Cloud storage pihak ketiga (AWS S3, Cloudinary, Firebase Storage).
- Payment Gateway otomatis (Midtrans, Xendit, BCA Snap API).
- Pengiriman pesan WhatsApp riil via WhatsApp Business API (hanya menggunakan URL scheme `wa.me` deep link).

## Further Notes

- Kredensial default untuk pengujian:
  - Pemilik Kost: `pemilik` / `123456`
  - Penghuni Kamar: `101`, `102`, `103`, `104`, `105`, `106`, `107`, `108` / `123456`
- Disediakan tombol utilitas di pengaturan akun untuk *"Reset Mock Data"* ke kondisi awal guna memudahkan pengulangan skenario demo.

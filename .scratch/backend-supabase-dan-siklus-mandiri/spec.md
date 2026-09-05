Status: ready-for-agent

# Spesifikasi: Backend Supabase Serverless & Siklus Tagihan Mandiri (Kost Syantika)

## Problem Statement

Aplikasi Kost Syantika saat ini beroperasi menggunakan mock store sisi klien (Zustand + LocalStorage) yang terisolasi di masing-masing peramban perangkat. Pada penggunaan operasional nyata, Pemilik Kost dan Penghuni menggunakan perangkat ponsel pintar fisik yang berbeda. Akibatnya, Bukti Pembayaran yang diunggah Penghuni di ponselnya tidak dapat diterima atau diverifikasi oleh Pemilik Kost tanpa basis data awan bersama.

Selain itu, setiap Penghuni kost memiliki tanggal masuk yang berbeda-beda sehingga siklus penagihan serentak tanggal 1 kalender tidak sesuai dengan kenyataan lapangan. Pemilik Kost membutuhkan sistem penagihan mandiri per kamar yang otomatis menerbitkan tagihan sebelum jatuh tempo, memberikan pengingat dini, mendeteksi keterlambatan pembayaran secara visual, serta memudahkan pendaftaran maupun pelepasan anak kost tanpa merusak riwayat pembukuan masa lalu.

## Solution

Mengintegrasikan backend berbasis cloud menggunakan Backend-as-a-Service (BaaS) Supabase (PostgreSQL, Supabase Storage, Supabase Auth) yang terhubung ke frontend Next.js yang dihosting pada platform Vercel tanpa membebani biaya operasional (100% Free Tier untuk kapasitas < 30 kamar).

Solusi mencakup:
1. **Autentikasi Peran**:
   - Pemilik Kost masuk secara manual dengan Email dan Password.
   - Penghuni masuk secara instan menggunakan Google OAuth (1-klik), yang secara otomatis dicocokkan dengan email yang telah didaftarkan oleh Pemilik Kost pada kamar tertentu.
2. **Siklus Tagihan Mandiri per Kamar**:
   - Setiap kamar memiliki Tanggal Jatuh Tempo bulanan yang dihitung berdasarkan tanggal masuk masing-masing Penghuni.
   - Penerbitan Tagihan otomatis 7 hari sebelum jatuh tempo (H-7) agar Penghuni dapat menyelesaikan pembayaran lebih awal.
   - Pengingat Jatuh Tempo aktif 3 hari sebelum jatuh tempo (H-3) berupa banner peringatan di ponsel Penghuni, tombol 1-klik WhatsApp di ponsel Pemilik Kost, dan Web Push Notification.
   - Deteksi otomatis status `MENUNGGAK` dengan penanda visual merah jika melewati tanggal jatuh tempo tanpa pelunasan.
3. **Manajemen Kamar & Siklus Hidup Penghuni**:
   - Kamar berstatus `KOSONG` menampilkan opsi cepat untuk menambah data Penghuni baru (nama, email Google, nomor WhatsApp, tanggal masuk).
   - Kamar berstatus `TERISI` memiliki fitur pelepasan Penghuni ("Keluar Kost") dengan metode *soft disconnect*, sehingga status kamar kembali kosong namun nama dan riwayat pembayaran masa lalu tetap utuh tersimpan di pembukuan Pemilik Kost.
4. **Performa "Super Smooth" & Kompresi Foto**:
   - Respon antarmuka instan (<50 ms) menggunakan manajemen cache query data dan pembaruan optimistik (Optimistic UI).
   - Sinkronisasi instan dua arah berbasis Supabase Realtime (layar Pemilik Kost otomatis memperbarui antrean verifikasi saat Penghuni mengunggah Bukti Pembayaran tanpa perlu memuat ulang halaman).
   - Kompresi foto Bukti Pembayaran otomatis di sisi klien (WebP ~150 KB) sebelum diunggah ke Supabase Storage, menjaga kuota penyimpanan awan tetap awet untuk ribuan transaksi.

## User Stories

### Autentikasi & Akses Peran
1. As a Pemilik Kost, I want to log in using my email and password credentials, so that I can securely access all administrative and financial features of the property.
2. As a Penghuni, I want to log in with a single click using my Google account, so that I don't have to create or remember a separate password on my smartphone.
3. As a Penghuni attempting to sign in with an unregistered Google account, I want to see a friendly notification stating that my email is not registered and prompting me to contact the Pemilik Kost, so that I understand why access was denied without being confused.
4. As an authenticated user, I want the system to preserve my login session across browser refreshes and standalone PWA launches, so that I don't have to repeatedly log in every time I open the app.
5. As a user, I want a reliable logout option in my profile settings, so that I can securely terminate my active session on shared devices.

### Manajemen Kamar & Penghuni (Pemilik Kost)
6. As a Pemilik Kost, I want to see all physical Kamar listed in numerical order on my dashboard, so that I can easily locate and inspect any room corresponding to its physical layout.
7. As a Pemilik Kost, I want to clearly distinguish between rooms that are `TERISI` and rooms that are `KOSONG` via status badges, so that I have instant visibility over occupancy rate.
8. As a Pemilik Kost, I want to click an add button on an empty room to register a new Penghuni with their name, Google email, WhatsApp number, and move-in date, so that the room becomes occupied and linked to the correct tenant.
9. As a Pemilik Kost, I want the room's Tanggal Jatuh Tempo to automatically match the Penghuni's move-in date by default with an option to adjust it, so that the billing cycle reflects our mutual agreement.
10. As a Pemilik Kost, I want a quick edit option to change a Penghuni's registered Google email, so that I can resolve typos or alternate email addresses within seconds if a tenant cannot log in.
11. As a Pemilik Kost, I want a "Keluarkan Penghuni" action with a confirmation dialog when a tenant moves out, so that the room returns to `KOSONG` and is immediately ready for a new occupant.
12. As a Pemilik Kost confirming a tenant's departure, I want the option to either cancel the ongoing month's unpaid bill or retain it as an overdue archive, so that my accounting records remain accurate according to the departure settlement.
13. As a Pemilik Kost, I want all past payment records and bills of a departed tenant to retain the tenant's historical name, so that financial archives remain completely intact even after the tenant leaves.

### Penagihan Mandiri & Pengingat (Pemilik Kost & Penghuni)
14. As a Penghuni, I want my next month's Tagihan to appear automatically 7 days before its Tanggal Jatuh Tempo (H-7), so that I can transfer my rent right after payday without waiting for the exact due date.
15. As a Penghuni, I want to see a prominent amber warning banner on my dashboard 3 days before due date (H-3), so that I am gently reminded to settle my rent on time.
16. As a Pemilik Kost, I want rooms approaching due date (H-3) to display a dedicated badge and a 1-click WhatsApp reminder button, so that I can send a polite, pre-formatted reminder to the tenant with zero manual typing.
17. As a Pemilik Kost, I want rooms with unpaid bills past their due date to automatically reflect a prominent red `MENUNGGAK` status with overdue days count, so that I immediately know which tenants require follow-up.
18. As a Pemilik Kost, I want a 1-click WhatsApp follow-up button on overdue rooms, so that I can contact overdue tenants directly from my phone.
19. As a Pemilik Kost, I want quick filter tabs on my room list (Semua, Butuh Verifikasi, H-3, Menunggak, Kosong), so that I can instantly isolate rooms that require urgent attention.
20. As a Pemilik Kost, I want to edit the nominal amount of an individual Tagihan, so that I can apply agreed discounts, late fees, or utility adjustments when necessary.

### Pembayaran & Verifikasi Bukti Transfer
21. As a Penghuni with an unpaid or overdue Tagihan, I want to select a photo of my bank transfer receipt on my phone and have it automatically compressed before upload, so that upload is blazing fast and consumes minimal mobile data.
22. As a Penghuni, I want to provide an optional note with my transfer submission (e.g., bank account name used), so that the Pemilik Kost can easily identify the bank transaction.
23. As a Penghuni, I want my Tagihan status to instantly transition to `MENUNGGU_VERIFIKASI` upon upload, so that I have immediate confirmation that my submission was registered.
24. As a Pemilik Kost, I want new transfer submissions to appear immediately in my verification queue in real time without refreshing the page, so that I can verify payments promptly.
25. As a Pemilik Kost, I want to tap on an uploaded Bukti Pembayaran thumbnail to open a full-screen zoomable lightbox modal, so that I can clearly read account details, timestamps, and transfer amounts.
26. As a Pemilik Kost, I want to approve a valid Bukti Pembayaran with a single tap, so that the Tagihan updates to `LUNAS` with method `TRANSFER` and records the verification timestamp.
27. As a Pemilik Kost inspecting an invalid or unclear receipt, I want to reject it while providing a mandatory Alasan Penolakan, so that the Penghuni knows exactly why the submission was rejected and how to fix it.
28. As a Penghuni whose payment proof was rejected, I want to see the specific Alasan Penolakan prominently displayed with a prompt to re-upload a clear receipt, so that I can rectify my submission without confusion.
29. As a Pemilik Kost receiving physical cash, I want a "Tandai Lunas (Cash)" action with an optional note, so that hand-delivered rent payments are accurately recorded without requiring photo uploads.
30. As a Penghuni, I want a cash payment instruction guide with direct contact to the Pemilik Kost, so that I know where and how to settle my rent in cash.
31. As a Penghuni, I want to view my historical paid bills with settlement dates and payment methods, so that I have proof of all my past rent payments.

### Responsivitas & Keamanan Data
32. As a mobile user, I want UI state changes (such as approving or rejecting a bill) to respond immediately on my screen within 50 milliseconds, so that the app feels as responsive as a native smartphone application.
33. As a Penghuni, I want strict data security ensuring that I can only view and interact with my own room and bill records, so that my personal payment information is private from other tenants.
34. As a Pemilik Kost, I want complete data access to view, update, and manage all rooms, tenants, bills, and payment proofs across the entire property.

## Implementation Decisions

### 1. Architectural Foundation & Cloud BaaS
- The application migrates its data persistence from the client-side Zustand LocalStorage mock store to Supabase BaaS (PostgreSQL database, Supabase Auth, and Supabase Storage).
- The frontend Next.js App Router remains a standalone PWA hosted on Vercel Hobby Tier, maintaining a total infrastructure cost of Rp 0 / month.
- Client-side data management is upgraded to use an asynchronous query and caching layer with optimistic UI mutations, ensuring sub-50ms screen response times on user clicks.
- Live updates are powered by Supabase Realtime subscriptions on PostgreSQL tables, updating verification badges and room statuses on connected devices without page refreshes.

### 2. Database Schema (Supabase PostgreSQL)
- **`kamar` Table**: Primary entity for physical room units.
  - Contains identifiers, room type description, monthly rent rate, occupancy status (`status_hunian`: `'TERISI'` or `'KOSONG'`), active tenant move-in date (`tanggal_masuk`), and monthly due day integer (`tanggal_jatuh_tempo` between 1 and 31).
- **`users` Table**: Extended profile entity linked directly to Supabase Auth (`auth.users`).
  - Contains full name, verified email, role (`'PEMILIK'` or `'PENGHUNI'`), optional contact phone number, assigned room identifier (`kamar_id`), and active status (`'AKTIF'` or `'NONAKTIF'`).
- **`tagihan` Table**: Core financial obligation entity.
  - Represents individual billing cycles per room.
  - Stores room reference, tenant reference, historical tenant name snapshot (`penghuni_nama_snapshot`), period label, period start date, period end date, due date (`batas_bayar`), nominal amount, payment status (`status`: `'BELUM_BAYAR'`, `'MENUNGGU_VERIFIKASI'`, `'LUNAS'`, `'DITOLAK'`, `'MENUNGGAK'`), payment method (`'TRANSFER'` or `'CASH'`), rejection explanation (`alasan_penolakan`), owner notes (`catatan_pemilik`), payment timestamp, and verification timestamp.
- **`bukti_pembayaran` Table**: Proof of transfer entity.
  - References the corresponding bill, stores the public storage URL of the receipt image, optional tenant notes, and upload timestamp.

### 3. Billing & Notification Lifecycle Engine
- **Independent Billing Cycle**: Due dates are determined per room rather than property-wide on the 1st of the calendar month.
- **H-7 Auto-Generation**: A lightweight hybrid routine triggers on application access to check whether an occupied room has reached 7 days before its due date without an active upcoming bill; if so, the new bill is provisioned with status `BELUM_BAYAR`.
- **H-3 Reminder**: Triggers amber warning visual cues on tenant dashboards and activates the 1-click WhatsApp deep-link button on owner dashboards.
- **Overdue Detection**: Any bill whose due date has passed without reaching `LUNAS` or `MENUNGGU_VERIFIKASI` automatically evaluates to `MENUNGGAK`.

### 4. Tenant Departure ("Keluar Kost") Mechanics
- When an owner executes tenant checkout on an occupied room, the system performs a *soft disconnect*:
  - The tenant record has its room link cleared (`kamar_id = NULL`) and status updated to `NONAKTIF`.
  - The room's occupancy status is updated to `KOSONG` and tenant information is cleared.
  - The owner confirms whether the active unpaid bill of the departing month should be archived or canceled.
  - Historical bills and payment proofs retain the tenant's name in `penghuni_nama_snapshot`, preserving complete auditing integrity.

### 5. Client-Side Image Compression & Storage Bucket
- Uploaded receipt images are downscaled and compressed in the browser using HTML5 Canvas before network transmission, targeting WebP format at quality 0.8 and max dimension 1280px.
- Compressed images (~100-200 KB) are transmitted to the dedicated Supabase Storage bucket `bukti-pembayaran` using structured object paths (`kamar-[nomor]/[tahun]-[bulan]-[uuid].webp`).

### 6. Row Level Security (RLS) Policy
- Security rules enforced at the database layer:
  - Users with role `PEMILIK` have full privileges (`ALL`) across all records.
  - Users with role `PENGHUNI` are restricted to `SELECT` their own assigned room and bills matching their room identifier.
  - Tenants can only `INSERT` payment proofs targeting their own unpaid or rejected bills.

## Testing Decisions

### Testing Philosophy & Seams
- Tests must verify observable user behavior through public component and view interfaces, avoiding assertions against internal state details or mock store internals.
- **Primary Testing Seam: Component Integration Seam (User Interaction Seam)**
  - Tests render high-level view components (`PemilikDashboardView`, `PenghuniDashboardView`, `LoginPage`, `PemilikDaftarKamar`, `PenghuniTagihanCard`) using React Testing Library and Vitest.
  - Data fetching and mutator services are driven through standardized service client interfaces, allowing tests to simulate authentic network and database responses (successful queries, realtime events, network failures).
- **Secondary Testing Seam: Domain Calculation & Business Logic Seam**
  - Pure unit tests for due date calculations, H-7 bill generation criteria, H-3 reminder status evaluations, and overdue (`MENUNGGAK`) status determination.

### Modules Under Test
- Authentication and polymorphic routing transitions between Pemilik Kost and Penghuni.
- Room list rendering, occupancy state toggling, and quick filter tab behavior.
- Add new tenant modal validation and Google email assignment.
- Tenant checkout ("Keluar Kost") confirmation dialog and soft disconnect verification.
- Bill generation (H-7), status transitions (`BELUM_BAYAR` ➔ `MENUNGGU_VERIFIKASI` ➔ `LUNAS` / `DITOLAK` / `MENUNGGAK`).
- Receipt upload validation and rejection note enforcement.
- 1-click WhatsApp deep-link generation with formatted message encoding.

### Prior Art
- Existing test suite with 21 integration test files in `tests/` covering role-based dashboard rendering, dialogs (`tolak-bukti-dialog.test.tsx`, `tandai-cash-dialog.test.tsx`, `bukti-lightbox-dialog.test.tsx`), and room list interactions (`pemilik-daftar-kamar.test.tsx`).

## Out of Scope

- Automated payment gateway integrations (e.g. Midtrans, Xendit, or QRIS dynamic generation); all payments remain manual bank transfer verification or cash.
- Multi-property / multi-kost management; the system is dedicated specifically to the Kost Syantika property (< 30 rooms).
- Advanced general ledger accounting, tax computations, or export to external accounting software.
- Hardware IoT integration (smart door locks, digital electricity token meters).

## Further Notes

- Architecture decisions are recorded in [ADR 0001](file:///c:/Users/USER/Documents/ai-native/kost-syantika/docs/adr/0001-client-side-mock-state-zustand.md) and [ADR 0002](file:///c:/Users/USER/Documents/ai-native/kost-syantika/docs/adr/0002-independent-billing-cycle-and-supabase-backend.md).
- Strict domain vocabulary guidelines are cataloged in [CONTEXT.md](file:///c:/Users/USER/Documents/ai-native/kost-syantika/CONTEXT.md). All code, variable names, and UI copy must adhere to these conventions.

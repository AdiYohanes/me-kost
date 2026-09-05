# 06: Kompresi Foto Bukti Transfer di Klien & Verifikasi / Penolakan Tagihan

**What to build:** Alur pengunggahan bukti transfer bank oleh Penghuni dengan kompresi gambar otomatis di peramban, serta antarmuka verifikasi bagi Pemilik Kost dengan pratinjau pembesaran layar penuh (lightbox), persetujuan lunas, penolakan dengan alasan wajib, dan pencatatan lunas tunai.

**Blocked by:** 01: Setup Supabase Foundation, Skema Basis Data SQL, & Konfigurasi Klien, 04: Siklus Tagihan Mandiri per Kamar, Terbit Otomatis H-7, & Deteksi Menunggak

**Status:** ready-for-agent

- [ ] Penghuni dapat memilih berkas foto bukti transfer dari ponsel, yang secara otomatis diproses melalui Canvas klien menjadi format WebP berukuran ~100-200 KB sebelum diunggah ke bucket Supabase Storage.
- [ ] Formulir pengunggahan menyediakan kolom catatan opsional (misal nama rekening pengirim).
- [ ] Pengunggahan bukti pembayaran yang berhasil mengubah status tagihan menjadi `MENUNGGU_VERIFIKASI`.
- [ ] Antrean verifikasi di dashboard Pemilik Kost menampilkan daftar bukti transfer yang menunggu persetujuan.
- [ ] Pemilik Kost dapat membuka foto bukti transfer dalam modal lightbox zoomable untuk membaca nominal dan rekening tujuan dengan jelas.
- [ ] Aksi "Verifikasi Lunas" memperbarui status tagihan menjadi `LUNAS` dengan metode `TRANSFER` dan mencatat waktu verifikasi.
- [ ] Aksi "Tolak" mewajibkan pengisian Alasan Penolakan; tagihan bertransisi menjadi `DITOLAK` dan Penghuni melihat alasan tersebut beserta tombol unggah ulang bukti transfer.
- [ ] Aksi "Tandai Lunas (Cash)" memungkinkan Pemilik Kost melunasi tagihan tunai secara langsung dengan catatan opsional.
- [ ] Pengujian integrasi memverifikasi alur unggah bukti terkompresi, persetujuan, penolakan berpenjelasan, dan pelunasan kas.

# 05: Pengingat Jatuh Tempo H-3 & Tombol 1-Klik WhatsApp

**What to build:** Sistem pengingat dini yang memberi peringatan ramah di ponsel Penghuni 3 hari sebelum jatuh tempo, serta menyediakan tombol 1-klik WhatsApp di ponsel Pemilik Kost untuk mengirimkan teguran ramah dengan pesan siap kirim.

**Blocked by:** 04: Siklus Tagihan Mandiri per Kamar, Terbit Otomatis H-7, & Deteksi Menunggak

**Status:** ready-for-agent

- [x] Dashboard Penghuni menampilkan banner pengingat amber mencolok pada H-3 sebelum tanggal jatuh tempo dengan informasi nominal dan tanggal batas bayar.
- [x] Kartu kamar di dashboard Pemilik Kost yang berada dalam rentang H-3 atau berstatus Menunggak memunculkan tombol hijau 1-klik WhatsApp.
- [x] Klik pada tombol WhatsApp membuka tautan deep-link `https://wa.me/...` dengan teks pesan sopan terformat otomatis mencantumkan nama penghuni, nomor kamar, nominal tagihan, dan batas bayar.
- [x] Pengiriman notifikasi Web Push lokal/service worker terdaftar jika izin peramban diaktifkan oleh Penghuni.
- [x] Pengujian integrasi memverifikasi kemunculan banner H-3 dan format teks tautan WhatsApp.

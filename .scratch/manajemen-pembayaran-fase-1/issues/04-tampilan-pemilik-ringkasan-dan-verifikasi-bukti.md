# 04: Tampilan Pemilik Ringkasan dan Verifikasi Bukti

**What to build:** Antarmuka Pemilik Kost di `/dashboard` yang menampilkan kartu ringkasan metrik keuangan bulanan (kamar lunas vs belum lunas serta estimasi pendapatan), daftar seluruh unit Kamar beserta status penghuni dan tagihannya, antrean Bukti Pembayaran masuk berstatus Menunggu Verifikasi, modal zoom lightbox untuk memeriksa foto bukti transfer secara detail, serta aksi persetujuan (Approve ➡️ Lunas) dan penolakan (Reject ➡️ Ditolak dengan input catatan Alasan Penolakan).

**Blocked by:** 03: Tampilan Penghuni Tagihan dan Upload Bukti

**Status:** ready-for-agent

- [ ] Kartu ringkasan metrik menampilkan total kamar lunas, total kamar belum lunas, dan total penerimaan sewa bulan berjalan
- [ ] Daftar kamar menampilkan seluruh unit Kamar (101-108) dengan filter status (Semua, Lunas, Belum Bayar, Menunggu Verifikasi)
- [ ] Antrean verifikasi bukti transfer menampilkan kartu Bukti Pembayaran yang masuk dari penghuni yang berstatus Menunggu Verifikasi
- [ ] Tersedia modal lightbox untuk memperbesar dan melihat foto Bukti Pembayaran dalam ukuran penuh beserta detail nominal dan waktu unggah
- [ ] Tombol Setujui (Approve) mengubah Status Pembayaran menjadi Lunas (metode TRANSFER) dan mencatat waktu verifikasi
- [ ] Tombol Tolak (Reject) membuka modal konfirmasi yang mewajibkan input Alasan Penolakan dan mengubah Status Pembayaran menjadi Ditolak
- [ ] Perubahan status langsung tercermin secara reaktif di dashboard Penghuni

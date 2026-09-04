# Manajemen Pembayaran Kost

Konteks pengelolaan pembayaran sewa kamar kost bulanan, pelaporan bukti transfer oleh penghuni, dan verifikasi oleh pemilik kost.

## Language

**Pemilik Kost**:
Pengelola atau pemilik properti kost yang menetapkan tagihan bulanan, memverifikasi bukti pembayaran transfer, dan menandai pembayaran tunai.
_Avoid_: Admin, Host, Manajer

**Penghuni**:
Penyewa kamar kost yang terdaftar pada kamar tertentu dan berkewajiban membayar sewa bulanan.
_Avoid_: User, Klien, Tenant, Customer

**Kamar**:
Unit kamar kost beridentitas (nomor kamar) yang dihuni oleh Penghuni dan memiliki tarif sewa tertentu.
_Avoid_: Room, Unit

**Tagihan**:
Kewajiban pembayaran sewa kamar untuk periode bulanan tertentu yang ditetapkan oleh Pemilik Kost.
_Avoid_: Invoice, Bill, Order

**Bukti Pembayaran**:
Gambar foto atau tangkapan layar transfer bank/e-wallet yang diunggah oleh Penghuni sebagai klaim pembayaran.
_Avoid_: Struk, Resi, Receipt, Slip

**Status Pembayaran**:
Status tahapan tagihan: Belum Bayar, Menunggu Verifikasi, Lunas, dan Ditolak.
_Avoid_: Payment State, Kondisi Tagihan

**Metode Pembayaran**:
Cara penyelesaian tagihan, yaitu Transfer Bank (membutuhkan unggah Bukti Pembayaran) atau Tunai (Cash) yang ditandai langsung oleh Pemilik Kost.
_Avoid_: Channel Bayar, Cara Bayar

**Alasan Penolakan**:
Catatan penjelasan dari Pemilik Kost saat menolak Bukti Pembayaran yang tidak valid agar Penghuni dapat memperbaiki bukti transfer.
_Avoid_: Reject Note, Komentar Error

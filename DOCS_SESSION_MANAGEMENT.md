# Sweet Connect - Session Management & Cloud-Only Architecture

## 1. Startup Flow
Aplikasi menggunakan state `gameState === 'STARTUP'` untuk merender `StartupScreen`.
1. Aplikasi dimuat dengan tema default (`sweets`).
2. Mode sinkronisasi dimulai (hanya menggunakan Cloud/Supabase, tidak ada fallback lokal).
3. Jika tidak ada koneksi internet, proses dihentikan dan user dikembalikan ke halaman login dengan pesan error offline.
4. Jika profil cloud ditemukan, memori akan disiapkan. Jika tidak, profil baru akan dibuat secara otomatis.
5. `finishStartup` dieksekusi: Profil dimuat ke dalam *game state*, dan barulah `activeTheme` di-update sesuai pilihan user. Ini memastikan user langsung melihat tema kustom mereka (splash animation) di akhir fase loading, tanpa *state leakage*.

## 2. Login Flow (Cloud-Only)
- User memasukkan `playerName`.
- `runStartup` dijalankan. UI Login mengunci tombol dan menampilkan indikator loading berputar.
- Aplikasi *strictly* mengambil data dari backend Cloud (`/api/profile`). 
- Mekanisme sinkronisasi membatalkan segala fallback ke data lokal lama untuk menghindari konflik versi antar *device*. Local storage hanya digunakan untuk caching profil aktif saat bermain.
- Pesan error divisualisasikan dengan rapi (Banner UI) dan status button berubah menjadi "Coba Lagi" saat gagal memuat.

## 3. Logout Flow (Session Isolation)
Proses logout sekarang sangat ketat untuk memastikan tidak ada *state leakage* atau *asset leaking*:
- BGM & Audio System dihentikan (`AudioEngine.stopBgm()`).
- Sistem notifikasi di-reset (`NotificationManager.reset()`).
- Nama pemain dihapus dari memori.
- Segala *React State* game (`profile`, `board`, `level`, dll) dikembalikan ke nilai awal/kosong.
- Tema aktif secara paksa di-reset kembali ke `'sweets'`.
- Tag `<link rel="preload">` yang disuntikkan secara dinamis oleh tema kustom sebelumnya akan dihapus dari DOM untuk mencegah *cache ghosting*.
- User dikembalikan ke `gameState === 'LOGIN'` dengan tampilan bersih (tema standar).

## 4. Theme & Asset Management
- Tema tidak pernah dimuat lebih awal sebelum profil diunduh dengan sempurna.
- Halaman Login (saat `gameState === 'LOGIN'`) sekarang 100% menggunakan latar belakang statis warna gradient solid dan/atau default tema `sweets`. Tidak ada pengambilan dari `THEMES[activeThemeRef.current]` yang dapat memicu bocornya gambar latar akun sebelumnya.
- Jika profil gagal dimuat dari cloud, tidak ada asset lama yang akan tampil ke layar login.

## 5. Error Handling
Desain UI Login telah diperbarui dari *debug text* menjadi status modular:
- Offline Banner (kuning/abu-abu).
- Fetch Error Banner (merah muda lembut).
- Teks dinamis di tombol utama.
- Hirarki status mematuhi panduan desain Sweet Connect yang *sleek* dan modern.

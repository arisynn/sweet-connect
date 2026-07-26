# Sweet Connect - Theme Engine Developer Documentation

Dokumentasi ini adalah panduan resmi dan komprehensif untuk pembuatan tema kustom pada game HTML5 **Sweet Connect**. Panduan ini dirancang untuk membantu developer dan technical artist dalam menciptakan tema berkualitas tinggi yang ringan, konsisten, dan mematuhi standar desain Sweet Connect.

---

## 1. Overview & Architecture

Theme Engine Sweet Connect didesain untuk menjadi sangat dinamis, memungkinkan perubahan aset secara modular (hanya mengganti background, atau mengganti tiles, atau keseluruhan) dan mendukung resolusi otomatis melalui file `theme.json`.

**Source of Truth**
Sumber kebenaran untuk Theme Engine terletak pada:
1. Struktur folder di dalam `public/assets/themes/{id_tema}`.
2. File konfigurasi `theme.json` yang berada di dalam folder tersebut.
3. Generator skrip `scripts/generateThemes.js` yang memindai folder dan menghasilkan `public/themes.json`.

---

## 2. Struktur Folder & Naming Convention

Setiap tema harus diisolasi dalam folder tersendiri di dalam `public/assets/themes/`.

Berikut adalah *exact folder tree* dan *file naming* yang didukung dan menjadi standar resmi dari sistem ini:

```text
public/assets/themes/{nama_tema}/
├── theme.json            (WAJIB) Konfigurasi utama tema.
├── preview.png           (WAJIB) Pratinjau tema (muncul di toko/gacha).
├── background.png        (OPSIONAL) Latar belakang papan game.
├── splash.png            (OPSIONAL) Artwork untuk splash screen saat memuat tema.
│
├── tiles/                (WAJIB) Folder berisi gambar tile/blok (minimal 12 gambar).
│   ├── kucing1.png       (Penamaan di dalam `tiles` bebas, namun format harus valid: .png/.jpg/.svg/.webp)
│   ├── kucing2.png
│   └── ...
│
├── menu/                 (OPSIONAL) MENU ICON ASSETS. HANYA untuk ikon menu navigasi.
│   ├── tema.png
│   ├── gacha.png
│   ├── toko.png
│   ├── misi.png
│   ├── prestasi.png
│   └── statistik.png
│
├── card/                 (OPSIONAL) MAIN MENU CARD ASSETS. HANYA untuk artwork pada kartu di Main Menu.
│   ├── continue.png      (Artwork pada Kartu Lanjutkan Main / Single Player)
│   └── multiplayer.png   (Artwork pada Kartu Multiplayer)
│
├── background/           (OPSIONAL) MENU BACKGROUND ASSETS. HANYA untuk latar belakang ketika halaman/menu dibuka.
│   ├── home.png          (Latar Menu Utama)
│   ├── shop.png          (Latar Toko)
│   ├── gacha.png         (Latar Gacha)
│   ├── mission.png       (Latar Misi)
│   ├── achievement.png   (Latar Prestasi)
│   ├── statistics.png    (Latar Statistik)
│   └── theme.png         (Latar Pemilihan Tema)
│
├── ui/                   (OPSIONAL) Aset UI modular.
├── icons/                (OPSIONAL) Aset ikon modular (seperti koin, gem).
├── effects/              (OPSIONAL) Efek visual modular (particle).
├── sfx/                  (OPSIONAL) Audio efek suara modular (match.mp3).
└── bgm/                  (OPSIONAL) Musik latar modular.
```

> **CATATAN**: Penamaan file sangat sensitif. `continue.png` harus ditulis menggunakan huruf kecil semua dan tanpa spasi.

---

## 3. Asset Resolution & Engine Script

Skrip pembangun (`scripts/generateThemes.js`) secara otomatis akan:
- Mendeteksi aset di luar folder (seperti `background.png`, `preview.png`, `splash.png`, `logo.png`).
- Memindai isi folder `tiles/` (atau direktori yang didefinisikan dalam properti `tilesDir`) dan memetakan `data` (Array aset tile).
- Memindai direktori opsional (`menu`, `card`, `ui`, `icons`, `effects`, `sfx`, `bgm`) dan memasukkannya ke dalam konfigurasi (Contoh: `menuIcons`, `cards`).
- Memindai direktori `background/` (atau `menuBgDir`). Skrip akan memetakan semua file gambar di dalamnya ke properti `menuBackgrounds` pada output `themes.json`.

Di-generate menjadi JSON dengan format properti yang tegas:
- `themeData.cards` = Artwork dari folder `card/`
- `themeData.menuBackgrounds` = Artwork dari folder `background/`
- `themeData.menuIcons` = Artwork dari folder `menu/`

---

## 4. Main Menu Card Assets (`card/`)

Di dalam Main Menu (layar beranda), terdapat dua *Card* navigasi besar yang mendukung *custom theme artwork*:
1. **Single Player Card** (Lanjutkan Main): Menggunakan file `card/continue.png`.
2. **Multiplayer Card** (Match/Mulai Game): Menggunakan file `card/multiplayer.png`.

**Sifat Card Assets**:
- Rendered sebagai *background artwork* secara eksklusif hanya untuk *Card* berukuran kecil/sedang di tengah layar.
- Keduanya mendukung *Panorama Background* jika menggunakan komponen yang mensupport `motion` (seperti *loop*, *pingpong*).
- Jika `continue.png` atau `multiplayer.png` tidak ditemukan, Card tidak akan rusak / *blank*, melainkan mengandalkan pewarnaan gradien default bawaan sistem, dengan opasitas dan efek khusus yang mendasar.

---

## 5. Konfigurasi `theme.json`

Berikut adalah semua properti JSON yang didukung oleh Engine saat ini:

### Properti Utama

| Nama Field | Tipe | Wajib | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id` | String | Ya | ID unik dari tema (biasanya akan diganti otomatis dengan nama folder). |
| `name` | String | Ya | Nama tampilan tema. |
| `desc` | String | Tidak | Deskripsi tema. |
| `type` | String | Ya | Kategori tema (misal: `standar`, `premium`, `gacha`). Engine juga membaca `category` jika `type` tidak ada. |
| `price` | Number | Tidak | Harga tema (default 0). |
| `currency` | String | Tidak | Mata uang yang digunakan (contoh: `coins`, `gems`, `candy`). |
| `tilesDir` | String | Tidak | Nama folder kustom untuk tiles (default: `tiles`). |
| `menuBgDir`| String | Tidak | Nama folder kustom untuk menu background (default: otomatis `background`). |

### Properti Warna (Colors)

Blok `colors` mendefinisikan warna elemen UI untuk tema. Semua parameter disarankan ada.

| Nama Field | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `bg` | String (HEX) | Background utama aplikasi (Layar, Menu). |
| `border` | String (HEX) | Warna batas/outline elegan. |
| `text` | String (HEX) | Warna teks dominan (harus kontras dengan `bg`). |
| `accent` | String (HEX) | Warna aksi / sorotan primer (contoh untuk ikon atau tombol). |
| `buttonActive` | String (HEX) | Warna tombol saat sedang ditekan (Active state). |

### Properti Splash / Animasi

| Nama Field | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `splashFrames` | Number | Jumlah frame total pada `splash.png` jika menggunakan spritesheet (default: 1). |
| `splashColumns` | Number | Jumlah kolom pada spritesheet splash. |
| `splashRows` | Number | Jumlah baris pada spritesheet splash. |
| `splashFps` | Number | Kecepatan animasi splash (Frame per Second). |
| `splashLoop` | Boolean | Apakah animasi splash berulang otomatis. |

### Properti Card (Panorama)
| Nama Field | Tipe | Deskripsi |
| :--- | :--- | :--- |
| `continueCard.motion` | String | Memaksa perilaku pergerakan *Panorama* pada `continue.png` atau `multiplayer.png` (contoh: `"loop"`, `"pingpong"`, `"static"`). Secara otomatis di-detect jika tidak ada. |

---

## 6. Konfigurasi Tema (JSON Examples)

### Minimal Configuration

Ini adalah bentuk `theme.json` yang paling kecil yang sepenuhnya valid (tanpa properti non-esensial):

```json
{
  "name": "Kucing Standar",
  "type": "standar",
  "colors": {
    "bg": "#ffffff",
    "border": "#eeeeee",
    "text": "#333333",
    "accent": "#ff9900",
    "buttonActive": "#cc7a00"
  }
}
```

### Full Configuration

Konfigurasi yang mendukung spritesheet untuk layar splash, konfigurasi *Panorama Card*, serta properti khusus.

```json
{
  "id": "space_premium",
  "name": "Kosmos Luar Angkasa",
  "desc": "Tema luar angkasa penuh dengan rasi bintang dan planet-planet misterius.",
  "type": "premium",
  "price": 500,
  "currency": "gems",
  "tilesDir": "space_tiles",
  "menuBgDir": "bgs",
  "splashFrames": 12,  "splashColumns": 4,  "splashRows": 3,
  "splashFps": 12,
  "splashLoop": true,
  "continueCard": {
    "motion": "loop"
  },
  "colors": {
    "bg": "#0f172a",
    "border": "#334155",
    "text": "#f8fafc",
    "accent": "#8b5cf6",
    "buttonActive": "#7c3aed"
  }
}
```

---

## 7. Splash & Sprite Animation

Layar *Startup* akan otomatis merender tema aktif dari akun yang login (jika tersedia). Jika `splash.png` pada tema adalah spritesheet, engine merendernya dalam bentuk animasi (membutuhkan properti konfigurasi grid dan frame). 

**Aturan Splash Account Switching:**
Saat mengganti akun atau pengguna _logout_, layar *Startup* akan kembali merender splash dari tema fallback / default (biasanya `sweets`). Setelah akun baru termuat dengan sempurna, splash / tema dari akun tersebut akan diterapkan, guna mencegah visual *account leak*.

---

## 8. Cloud-Only Account System (Isolation)

Proyek Sweet Connect ini dibangun dengan arsitektur **Cloud-Only Persistence**. Semua pengaturan tema pemain tidak lagi disimpan dalam `localStorage`.
- Kepemilikan tema terdaftar dan tersimpan di database backend (via Supabase).
- Tema aktif hanya ditarik setelah akun terverifikasi.
- Sistem ini memastikan 100% isolasi akun, tema akun A tidak dapat diakses atau "bocor" ke akun B pada sesi klien (browser) yang sama. 

---

## 9. Theme Fallback Chain

Engine dikonfigurasi untuk mencegah tampilan kosong (_blank UI_) saat sebuah aset dalam tema gagal dimuat atau tidak tersedia.

Urutan rantai fallback untuk aset dan tampilan:
1. **Theme Custom Asset**: Jika ditemukan, engine menggunakan aset modular yang disediakan tema (contoh: ikon gacha khusus dari `menu/gacha.png` atau `card/continue.png`). Untuk card asset, jika `card/continue.png` belum dipisah secara aktual, sistem secara perlahan masih membaca `background/continue.png` (sebagai backward compatibility) namun folder `card/` tetap menjadi standar resmi.
2. **Theme Built-In Vector / UI Styles**: Apabila ikon image modular kosong, engine menggunakan komponen ikon vector Lucide (SVG bawaan) namun tetap mempertahankan palet warna (`accent`) dari `theme.json`. Card juga kembali ke warna default.
3. **Default Theme (sweets)**: Bila sebuah profil dimuat tetapi informasi `activeTheme` tidak ditemukan atau invalid, game menggunakan fallback tema default `sweets`.
4. **General Global Asset**: Background, musik, efek dasar dari resource root.

---

## 10. Multiplayer + Theme Integration

Pada mode Multiplayer:
- **Lobby**: Lobby akan menggunakan warna (serta border & accent) sesuai tema pemain masing-masing (Host dan Guest memegang sesi lokalnya).
- **Layar Pertandingan (Background / Board)**: Game board serta tiles dalam arena ditentukan sepenuhnya oleh tema milik Host (`host` room) untuk menjamin keselarasan permainan (seed identik dan tile set sama).
- **Layar Sinkronisasi**: Layar *Menyiapkan Pertandingan* menampilkan palet tema dan spinner berdasarkan warna sinkronisasi dari tema aktif klien lokal.
- **Theme Representation**: Jika pemain telah membeli dan mengaktifkan tema berbayar, `preview.png` dari tema tersebut bisa terlihat oleh lawan sebagai _card representation_ di Lobby.

---

## 11. Checklist Pembuatan Tema

Jika Anda ingin membuat tema baru untuk Sweet Connect, gunakan ceklis berikut:

- [ ] **Buat folder tema** (`public/assets/themes/{id_tema}`).
- [ ] **Buat `theme.json`** di root folder tema.
- [ ] **Tentukan minimal `colors` & `type`** pada konfigurasi JSON.
- [ ] **Tambahkan tile ke dalam `tiles/`** (Pastikan ukurannya pas, format `.png` / `.svg`, *background transparent*).
- [ ] **Tambahkan `preview.png`**.
- [ ] (Opsional) Tambahkan aset ICON ke `menu/`.
- [ ] (Opsional) Tambahkan aset CARD ke `card/` (misal `continue.png`, `multiplayer.png`).
- [ ] (Opsional) Tambahkan aset MENU BACKGROUND ke `background/` (misal `home.png`, `shop.png`).
- [ ] (Opsional) Tambahkan aset `splash.png` (dan config spritesheet jika dianimasikan).
- [ ] Jalankan ulang **Build & Sync** (`npm run build` atau `node scripts/generateThemes.js`) agar `public/themes.json` ter-update.
- [ ] Lakukan **Test Single Player** dan pastikan tema tampil konsisten.
- [ ] Lakukan **Test Multiplayer** dan pastikan avatar preview / board Host tampil normal.
- [ ] Lakukan **Test Account Switching** (Logout & Login ke akun berbeda) memastikan tema tidak tercampur.

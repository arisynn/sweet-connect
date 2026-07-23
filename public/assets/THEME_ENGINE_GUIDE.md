# Sweet Connect - Theme Engine Developer Documentation

Dokumentasi ini adalah panduan resmi dan komprehensif untuk pembuatan tema kustom pada game HTML5 **Sweet Connect**. Panduan ini dirancang untuk membantu developer dan technical artist dalam menciptakan tema berkualitas tinggi yang ringan, konsisten, dan mematuhi standar desain Sweet Connect.

---

## 1. Struktur Folder
Setiap tema harus diisolasi dalam satu folder tersendiri untuk menjaga kerapian struktur proyek. Folder tema diletakkan di dalam direktori `public/assets/themes/`.

### Susunan Folder Lengkap:
```text
public/assets/themes/nama_tema/
│
├── theme.json            (WAJIB) - File konfigurasi utama tema.
├── preview.png           (WAJIB) - Gambar pratinjau tema di menu Shop/Gacha.
├── background.png        (OPSIONAL) - Gambar latar belakang papan game.
├── splash.png            (OPSIONAL) - Artwork dekoratif untuk Splash Screen.
│
├── tiles/                (WAJIB) - Folder berisi gambar blok/tile yang akan dicocokkan.
│   ├── tile_1.png
│   ├── tile_2.png
│   └── ...
│
├── menu/                 (OPSIONAL) - Folder ikon kustom untuk tombol menu.
│   ├── gacha.png
│   ├── toko.png
│   └── ...
│
├── background/           (OPSIONAL) - Folder artwork full background untuk menu.
│   ├── home.png
│   ├── shop.png
│   ├── gacha.png
│   └── ...
│
├── ui/                   (OPSIONAL) - Folder aset UI modular (panel, button, frame).
│   ├── button_primary.png
│   ├── panel_main.png
│   └── ...
│
├── icons/                (OPSIONAL) - Folder aset ikon modular (currency, chest, gacha item).
│   ├── coin.png
│   ├── gem.png
│   └── ...
│
├── effects/              (OPSIONAL) - Folder efek visual modular (particle, dll).
│   ├── sparkle.png
│   └── ...
│
├── sfx/                  (OPSIONAL) - Folder audio efek suara modular (match, win, click).
│   ├── match.mp3
│   └── ...
│
└── bgm/                  (OPSIONAL) - Folder audio latar musik.
    ├── lobby.mp3
    └── ...
```

### Penjelasan Fungsi & Status:
*   **Wajib**: Tema tidak akan dapat dimuat (berpotensi error) jika file/folder ini tidak ada.
*   **Opsional**: Engine akan menggunakan fallback (aset default game) jika file/folder ini tidak disediakan.

---

## 2. Seluruh Asset
Berikut adalah penjelasan detail fungsi setiap aset di dalam folder tema:

*   **`theme.json`**: File sentral yang berisi metadata tema (nama, harga, tipe) dan palet warna. **HANYA** tulis metadata (id, name, desc, price, currency, type, colors). Anda **TIDAK PERLU** menulis path array aset secara manual, engine akan memindai (scan) direktori secara otomatis.
*   **`preview.png`**: Thumbnail tema beresolusi sedang yang ditampilkan di menu Toko Tema, layar Gacha, dan Menu Tema.
*   **`splash.png`**: Gambar artwork dekoratif (seperti maskot atau elemen tema) untuk ditampilkan di Splash Screen.
*   **`background.png`**: Latar belakang papan permainan utama. Jika tidak diatur, game menggunakan warna solid dari `theme.json`.
*   **`tiles/`**: Kumpulan gambar item yang menjadi inti permainan (objek yang akan di-link/di-match oleh pemain). Harus berisi minimal beberapa pasang.
*   **`menu/`**: Ikon kustom untuk tombol navigasi UI (seperti `tema.png`, `gacha.png`, `statistik.png`).
*   **`background/`**: Gambar ilustrasi penuh (*full background artwork*) yang menjadi background dan identitas masing-masing menu.
*   **`ui/`, `icons/`, `effects/`, `sfx/`, `bgm/`**: Engine terbaru telah mendukung automasi _Asset Mapping_. Semua gambar/audio dalam folder ini otomatis dipetakan ke property objek tema (contoh: `THEMES['nama'].sfx['match']`).

**Fitur Smart Asset Scanning:**
Anda tidak perlu mendeklarasikan aset modular di dalam JSON. Saat proses build, _generateThemes.js_ secara cerdas memindai (`scan`) semua folder modular tersebut.

---

## 3. Spesifikasi Asset
Agar tema berjalan optimal di perangkat seluler kelas bawah hingga atas tanpa pecah atau menyebabkan Memory Leak:

| Asset | Ukuran Pixel (Rekomendasi) | Aspect Ratio | Format | Ukuran Maksimal | Transparan? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **preview.png** | 512x512 px | 1:1 (Square) | PNG/WebP | 150 KB | Tidak |
| **splash.png** | 512x512 px | Bebas | PNG/WebP | 200 KB | **Ya** |
| **background.png** | 1080x1920 px | 9:16 (Portrait) | JPG/WebP | 400 KB | Tidak |
| **tiles (semua)** | 128x128 px | 1:1 (Square) | PNG/WebP | 30 KB/tile | **Ya** |
| **menu icons** | 96x96 px | 1:1 (Square) | PNG/WebP | 20 KB/icon | **Ya** |
| **menu backgrounds** | 1024x1024 px | 1:1 (Square) | PNG/WebP/JPG | 350 KB/image | Tidak Wajib |

---

## 4. Tiles

Ini adalah komponen visual paling kritis karena pemain akan menatap dan memproses gambar ini terus menerus dengan cepat.

*   **Jumlah**: Wajib menyiapkan **12 tile** berbeda untuk memastikan variasi yang cukup pada level tinggi.
*   **Style Ilustrasi**: Ikonografi yang jelas (jelas bentuk siluetnya). Hindari ilustrasi lanskap/suasana. Fokus pada *satu objek* per tile.
*   **Ketebalan Outline**: Jika menggunakan gaya kartun/vektor, gunakan ketebalan outline yang konsisten (misal: rata-rata 3-4px pada kanvas 128px).
*   **Proporsi Objek**: Seluruh objek dalam satu tema harus memiliki skala proporsi yang mirip. (Contoh: jangan ada satu apel yang digambar sangat kecil di tengah kanvas, lalu stroberi besar memenuhi kanvas).
*   **Warna & Pencahayaan**: Gunakan spektrum warna yang berani dan bervariasi antar tile. Pemain membedakan tile berdasarkan warna dominan. Jangan membuat 10 tile berwarna dominan merah semua karena akan membingungkan pemain.
*   **Shadow & Glow**: Diperbolehkan _inner shadow_ atau _highlight_ kecil (untuk kesan 3D/gel), namun **HINDARI _drop shadow_ besar ke arah background** agar tidak tabrakan dengan background _tile-board_ game.
*   **Gradient**: Boleh digunakan, tetapi pastikan gradasi terlihat mulus _(smooth)_.
*   **Konsistensi**: Wajib 100% konsisten. Jika tile 1 menggunakan gaya _flat-design_, tile 2 hingga 12 juga harus _flat-design_. Jangan mencampur gaya pixel art dengan vektor 3D.

---

## 5. Background

Background papan permainan bertugas memberikan atmosfir tanpa mengganggu _readability_ (keterbacaan) tile game.

*   **Resolusi**: 1080x1920 (Portrait).
*   **Area yang tertutup UI**:
    *   **Atas (20% tinggi)**: Tertutup Header (Skor, Pause, HP).
    *   **Tengah (60% tinggi)**: Tertutup penuh oleh papan/board game.
    *   **Bawah (20% tinggi)**: Tertutup oleh panel Hint/Shuffle/Power-up.
*   **Area yang harus kosong**: Jangan letakkan detail karakter penting di tengah layar, karena pasti tertutup tile. Fokuskan detail _background art_ pada pinggiran layar atau area atas/bawah.
*   **Warna & Kontras**: Wajib berukuran kontras rendah _(low-contrast)_ atau pastel redup. Hindari warna super pekat _(vibrant)_ atau pola _(pattern)_ yang sangat rapat karena akan membuat mata sakit saat mencari tile.
*   **Animasi**: Tidak didukung via GIF/APNG (memakan memori).

---

## 6. Preview (preview.png)

*   **Ukuran**: 512x512 px.
*   **Style**: Dapat berupa kolase/komposisi dari beberapa tile andalan, maskot tema, atau pola cantik.
*   **Yang harus ditampilkan**: Atmosfir utama tema dan 3-4 contoh bentuk tile. *   **Yang tidak boleh ditampilkan**: Jangan memasang tulisan nama tema atau harga (UI engine sudah melakukannya otomatis). Jangan menggunakan tangkapan layar _(screenshot)_ HP.
*   **Posisi Objek**: Pusatkan objek di tengah kanvas (center-aligned).

---

## 7. Splash Artwork (splash.png)

*   **Ukuran**: Fleksibel, proporsi 1:1 direkomendasikan (misal 512x512 px).
*   **Transparansi**: Latar belakang **wajib 100% transparan**.
*   **Posisi**: Ditampilkan di layar Splash (loading awal) menggantikan ilustrasi emoji default.
*   **Isi Konten**: Gambar dekoratif seperti karakter tema, maskot, makanan, atau objek utama tema. Ini bukan logo judul game, melainkan artwork estetis.
*   **Animasi**: Dapat dianimasikan sebagai *horizontal sprite sheet*. Tambahkan konfigurasi di `theme.json` jika berwujud sprite:
    ```json
    {
      "splashFrames": 6, // Jumlah frame
      "splashFps": 8, // Kecepatan
      "splashLoop": true // Apakah looping
    }
    ```

---

## 8. Menu Backgrounds (background/)

Menu kini menggunakan sistem **Full Menu Backgrounds** bergaya game mobile profesional (seperti Supercell, Candy Crush, Royal Match). Artwork bukan sekadar gambar kecil di pojok, melainkan sebuah ilustrasi penuh yang menjadi identitas menu tersebut.

Engine secara otomatis akan menggambar artwork sebagai layer paling bawah (`z-0`) dan melakukan penyesuaian ukuran (`object-fit: cover`) serta pemotongan batas (`border-radius: inherit`).

*   **Konsep Utama**: Setiap file di folder `background/` (`home.png`, `shop.png`, `gacha.png`, dll) adalah ilustrasi background lengkap yang mengisi SELURUH area layar.
*   **Elemen UI**: Engine akan otomatis merender background icon menu, icon menu, nama menu, badge notifikasi, dan semua UI interaktif **di atas artwork**. Artist atau AI **TIDAK PERLU** menggambar ikon menu, teks judul, atau UI apapun pada gambar. Artwork murni berfokus pada ilustrasi yang indah.
*   **Safe Area & Komposisi Layout**:
    *   **Kiri Atas**: Harus dibiarkan kosong (ruang udara/langit/warna polos) sebagai tempat icon menu.
    *   **Kiri Bawah**: Harus dibiarkan kosong atau kontras rendah sebagai tempat nama menu.
    *   **Kanan atau Tengah Kanan**: Tempat ideal untuk meletakkan **karakter utama / maskot / focal point**.
    *   **Pemotongan (Clipping)**: Karakter atau properti boleh keluar sedikit dari area frame (misal menyentuh tepi kanvas) karena nantinya ujung gambar otomatis dipotong secara rapi oleh `border-radius` kontainer dari CSS.
    *   **Seluruh Background**: Bunga, pohon, rumput, awan, atau elemen dekoratif pendukung boleh (dan disarankan) memenuhi seluruh area background untuk menghidupkan _environment_.
*   **Kualitas Visual (Premium Mobile Game Style)**:
    *   Harus memiliki **Focal point** yang jelas.
    *   Memiliki **Depth / Layering** (Latar belakang, objek tengah, objek depan / Background, Middle ground, Foreground).
    *   Gunakan **pencahayaan yang lembut** dan palet warna **pastel** yang _eye-pleasing_.
    *   Komposisi harus nyaman dilihat namun tetap menyisakan **ruang kosong (negative space)** untuk elemen UI yang akan ditumpuk di atasnya.

**Contoh Penamaan File untuk Tiap Menu:**
*   `home.png`
*   `shop.png`
*   `gacha.png`
*   `mission.png`
*   `achievement.png`
*   `statistics.png`
*   `theme.png`
*   `continue.png` (Artwork untuk background tombol Lanjutkan Main di layar beranda)
*   `game.png` (Artwork untuk background utama papan permainan, menggantikan background.png di luar folder)

**Best Practice**:
Gunakan standar kanvas 1024x1024. Engine akan melakukan `object-fit: cover`, jadi pastikan poin of interest tetap utuh meski gambar terpotong 15-20% pada proporsi HP yang berbeda.

---

## 9. Menu Icons (menu/)

Jika Anda ingin mengganti ikon UI default (ikon gerigi untuk setting, piala untuk leaderboard, toko, dll).

*   **Ukuran**: 96x96 px.
*   **Style**: Flat, minimalis, dan mudah dikenali fungsinya.
*   **Konsistensi**: _Line weight_ (ketebalan garis) antar ikon harus identik.
*   **Warna & Transparansi**: Wajib menggunakan _solid color_ (1 atau 2 warna saja) dengan _background_ transparan sepenuhnya. Ikon akan diberi efek _hover/active_ oleh engine CSS. Hindari outline yang terlalu tipis karena akan hilang saat skala dikecilkan.

---

## 10. Warna Tema (Konfigurasi `theme.json`)

Engine membaca set warna untuk membangun UI. Warna yang buruk akan membuat tombol tidak terbaca.

Kunci JSON yang harus didefinisikan:
*   `bg`: Background layar (misal: `#fdf4ff`) - Warna dominan paling muda.
*   `border`: Garis batas elemen (misal: `#fbcfe8`) - Sedikit lebih gelap dari `bg`.
*   `text`: Warna teks standar (misal: `#831843`) - Harus kontras tinggi terhadap `bg`.
*   `accent`: Warna tombol atau _highlight_ (misal: `#ec4899`).
*   `buttonActive`: Warna saat tombol ditekan (misal: `#be185d`) - Lebih gelap dari `accent`.

**Panduan:**
*   **Kombinasi Pastel**: Sangat disarankan untuk UI game match-3 agar mata rileks (contoh: Light Pink, Mint, Baby Blue, Peach).
*   **Kombinasi Gelap (Dark Mode)**: Boleh digunakan, pastikan `bg` adalah abu-abu sangat tua/hitam, dan `text` adalah putih/abu muda. Kurangi saturasi `accent` agar tidak menyilaukan mata (neon pastel).
*   **Accessibility (A11y)**: Pastikan _contrast ratio_ antara `text` dan `bg` lulus standar minimal (4.5:1).

---

## 11. Style Guide (Visual & Karakter)

Game ini menyasar _casual gamers_. Tema visual harus memancarkan nuansa bahagia, rileks, dan menyenangkan.

*   **Genre Rekomendasi**: Kawaii, Pastel, Flat-Vector, Semi-flat (dengan _cel-shading_ tipis), atau Voxel/3D _cute_.
*   **Pencahayaan & Saturasi**: Terang (Well-lit), hindari suasana _gritty/dark-fantasy_ yang _surreal_. Warna saturasi menengah-tinggi yang ceria.
*   **Proporsi Karakter (Jika ada)**: Chibi, kepala besar dengan mata ekspresif yang ramah. Mata besar, senyum lebar.
*   **Ekspresi**: Positif (tersenyum, tertawa, atau imut/bingung). Jangan menggunakan ekspresi marah/seram.

---

## 12. Naming Convention (Sangat Penting)

Untuk memastikan sistem *Smart Asset Scanning* bekerja dengan sempurna dan menghindari konflik aset, **penamaan file di luar folder `tiles/` bersifat STRICT (wajib persis sama)**. 

### Aturan Umum:
*   Semua nama file dan folder **harus huruf kecil** (lowercase).
*   **Tanpa spasi**.
*   Ekstensi huruf kecil (`.png`, `.mp3` BUKAN `.PNG`).

### Daftar Penamaan File Baku (STRICT):

**1. Root Folder Tema:**
*   `theme.json` (Konfigurasi wajib)
*   `preview.png` (Thumbnail di shop)
*   `background.png` (Background papan game)
*   `logo.png` (Logo game utama - **Tidak digunakan lagi untuk tema**, abaikan. Logo aplikasi bersifat global).
*   `splash.png` (**BARU**: Artwork Splash Screen. Jika berupa sprite animasi, tambahkan properti `"splashFrames": 6`, `"splashFps": 8`, `"splashLoop": true` di `theme.json`)

**2. Folder `background/` (Menu Backgrounds):**
*   `home.png` (Layar utama)
*   `shop.png` (Toko)
*   `gacha.png` (Gacha mesin)
*   `mission.png` (Misi)
*   `achievement.png` (Prestasi)
*   `statistics.png` (Statistik)
*   `theme.png` (Pemilihan tema)
*   `continue.png` (Layar popup lanjutkan main)

**3. Folder `menu/` (Menu Icons):**
*   `tema.png`
*   `gacha.png`
*   `toko.png`
*   `misi.png`
*   `prestasi.png`
*   `statistik.png`

**4. Folder `tiles/` (Bebas):**
**Hanya** di dalam folder `tiles/` Anda **bebas** memberikan nama file apapun (contoh: `kucing_1.png`, `beruang.png`, dll). Engine otomatis mendeteksi semua file di dalam folder ini terlepas dari namanya.

---

## 13. Checklist (Pre-Flight)

Sebelum _deploy_ atau rilis tema, periksa hal-hal berikut:

- [ ] Folder dan file menggunakan `lowercase` dan tanpa spasi.
- [ ] File konfigurasi `theme.json` berisi JSON yang valid (tidak ada _syntax error_ atau koma berlebih).
- [ ] Terdapat **tepat 12 tile** dengan nama dan path yang sesuai di JSON.
- [ ] Rasio kontras `text` dengan `bg` cukup tinggi sehingga teks UI dapat terbaca.
- [ ] `preview.png` berbentuk kotak (1:1).
- [ ] Semua `tiles/` menggunakan _background transparan_ dan bukan kotak berlatar putih solid.
- [ ] Memori: Total _size_ keseluruhan folder tema tidak lebih dari 3 MB.

---

## 14. Best Practice & Optimasi

1.  **Sprite Atlas (Jika didukung Engine Lanjutan)**: Daripada memanggil 12 gambar kecil `tile_1.png` - `tile_12.png` di _network tab_, kedepannya gunakan teknik _spritesheet_ jika engine sudah siap. Namun untuk saat ini, kompresi PNG melalui TinyPNG/ImageOptim sangat wajib.
2.  **SVGO**: Jika menggunakan SVG, bersihkan kode SVG _(sanitize)_ menggunakan alat SVGO untuk menghapus `<metadata>` Illustrator yang memberatkan.
3.  **Warna Konsisten**: Ekstrak palet warna dari 5 tile utama Anda, dan gunakan palet itu untuk mendefinisikan warna UI (`theme.json`), sehingga tema terasa "menyatu" dengan game.

---

## 15. Contoh Implementasi

### Contoh Folder `public/assets/themes/space_kawaii/`
```text
space_kawaii/
├── theme.json
├── preview.png
├── tiles/
│   ├── planet1.png
│   ├── planet2.png
│   ├── rocket.png
│   ├── star.png
│   └── ... (sampai 12 file)
└── background/
    ├── home.png           (Ilustrasi penuh markas luar angkasa dengan karakter astronot)
    ├── shop.png           (Ilustrasi penuh toko kosmik)
    ├── gacha.png          (Ilustrasi portal galaksi penuh kejutan)
    └── theme.png          (Ilustrasi lemari pajangan planet)
```

### Contoh Isi `theme.json` (Minimal yang perlu Anda tulis)
```json
{
  "id": "space_kawaii",
  "name": "Space Kawaii",
  "desc": "Jelajahi luar angkasa dengan nuansa imut dan pastel!",
  "price": 2500,
  "currency": "coins",
  "type": "premium",
  "colors": {
    "bg": "#1e1b4b",
    "border": "#312e81",
    "text": "#e0e7ff",
    "accent": "#a855f7",
    "buttonActive": "#9333ea"
  }
}
```
*Catatan: Saat Anda menjalankan build (atau saat mendeploy), script otomatis akan memindai folder dan menambahkan array "data" untuk tiles, "menuBackgrounds" untuk background menu (di folder background/), "menuIcons", logo, dan background ke dalam file `public/themes.json` utama.*
*Dokumentasi ini terus diperbarui seiring dengan perkembangan Game Engine Sweet Connect. Harap selalu merujuk pada panduan terbaru sebelum merilis tema kustom Anda.*

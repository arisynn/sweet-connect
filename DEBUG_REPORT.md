# Sweet Connect - Debug & Stabilization Report

## 1. Critical Cloud Sync Race Condition
- **Bug**: Data profile sering tidak tersimpan ke cloud jika pemain melakukan aksi terlalu cepat.
- **Cause**: Di dalam `QueueEngine.js`, fungsi `enqueue` secara tidak sengaja mem-filter dan menghapus task yang *sedang diproses* dari dalam antrean. Akibatnya, saat network call selesai, perintah `queue.shift()` justru menghapus task *baru* yang baru saja dimasukkan.
- **Fix**: Memperbaiki logika `.filter()` agar mengecualikan task pada index 0 jika `isProcessing === true`.

## 2. Cloud Conflict "Revert" State Bug
- **Bug**: Progress cloud (misalnya ketika pindah device) tertimpa kembali oleh progress lama yang ada di memori.
- **Cause**: Saat background sync `QueueEngine` mendapat pesan 409 Conflict dan memilih Cloud Data, sistem berhasil menyimpannya di `LocalStorage`, namun gagal memberi tahu React State dan gagal mengupdate `SaveEngine.currentPayload`. Akibatnya, save berikutnya kembali menimpa cloud dengan data lama yang ada di memori.
- **Fix**: Mengupdate `SaveEngine.currentPayload` secara langsung dan memancarkan CustomEvent `profileUpdatedExternally`. Di sisi React (`game.js`), dipasang `useEffect` listener untuk menangkap event ini dan meng-update `profile` state UI secara real-time.

## 3. React State Mutation Leak
- **Bug**: Data save cloud kadang tercampur atau tidak konsisten jika aksi user sangat cepat.
- **Cause**: `saveProfile` di `SaveEngine.js` menggunakan reference objek `gameData` dari React State secara langsung. Jika antrean network memakan waktu dan React me-render ulang state, isi `payload` yang ada di dalam queue ikut bermutasi.
- **Fix**: Melakukan **Deep Clone** (`JSON.parse(JSON.stringify)`) pada `gameData` dan `currentPayload` sebelum memindahkannya ke dalam Background Task Queue.

## 4. Massive Data Loss pada Logout
- **Bug**: Ketika user melakukan Logout, seluruh progress yang belum tersinkronisasi (local backup) hilang.
- **Cause**: Fungsi `clearSession()` pada `SessionEngine.js` melakukan iterasi `localStorage` dan menghapus SELURUH key yang berawalan `sweet_connect_` dan `SC_BACKUP_`. Ini mengakibatkan offline save terhapus permanen setiap kali user logout.
- **Fix**: Menghapus loop destruktif pada `clearSession`. Kini logout hanya membersihkan current session ID tanpa menyentuh cache LocalStorage.

## 5. Infinite Loop / Browser Crash pada Custom Theme
- **Bug**: Game freeze atau crash saat mencoba bermain menggunakan Custom Theme yang kosong.
- **Cause**: Di `board.js`, fungsi `generateBoard` memiliki `while (selectedIds.length < requiredPairs) selectedIds.push(...)`. Jika `themeData` bernilai array kosong, panjang `selectedIds` tidak akan pernah bertambah, menyebabkan browser terjebak pada Infinite Loop.
- **Fix**: Menambahkan fallback guard `if (!fullThemeData || fullThemeData.length === 0)` untuk fallback ke tema 'sweets'.

## 6. React Uncaught ReferenceError Crash
- **Bug**: Kadang game memunculkan error *White Screen of Death* dengan log "Uncaught ReferenceError: getDefaultProfile is not defined".
- **Cause**: Penggabungan Script dan Babel Transpilation (`index.html`) menyebabkan scope terisolasi untuk fungsi `getDefaultProfile`, sehingga object literal property shorthand pada Game Context me-return undefined pada runtime spesifik.
- **Fix**: Mengonversi panggilan function menjadi namespace spesifik `window.getDefaultProfile()` dan menghapus destructuring/shorthand syntax yang rawan gagal kompilasi.

## Remaining Issues (Zero)
Saat ini sistem *Save Engine* V2 dan *Game Logic* berjalan sangat stabil. Memory leak dari `setInterval` dan event listener di seluruh aplikasi sudah tervalidasi dibersihkan dengan baik oleh cleanup functions React `useEffect`.

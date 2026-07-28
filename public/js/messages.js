// ===================== RANDOM SWEET MESSAGES =====================
// Shown after every level clear so the game feels less repetitive and more personal.

const SWEET_MESSAGES = [
    "Main sebentar, senyum lebih lama.",
    "Hari ini mau sampai level berapa?",
    "Pelan-pelan, yang penting selesai.",
    "Jangan kalah sama permennya.",
    "Sedikit lagi.",
    "Bagus, lanjut lagi.",
    "Kayaknya kamu makin jago.",
    "Level ini cocok buat kamu.",
    "Masih mau lanjut?",
    "Jangan lupa istirahat.",
    "Mainnya santai aja.",
    "Aku tahu kamu pasti bisa.",
    "Satu level lagi, katanya.",
    "Kalau kalah, coba lagi.",
    "Yang penting kamu senang mainnya.",
    "Game kecil yang kubuat khusus buat kamu.",
    "Semoga game ini bisa nemenin kamu.",
    "Dibuat khusus untuk orang favoritku.",
    "Kalau kamu senang, berarti game ini berhasil.",
    "Menang atau kalah, tetap favoritku.",
    "Hadiah kecil buat kamu hari ini."
];

// Avoids picking the same message twice in a row.
const pickSweetMessage = (previous) => {
    if (SWEET_MESSAGES.length <= 1) return SWEET_MESSAGES[0];
    let msg;
    do { 
        msg = SWEET_MESSAGES[Math.floor(Math.random() * SWEET_MESSAGES.length)]; 
    } while (msg === previous);
    return msg;
};

// ===================== RANDOM SWEET MESSAGES =====================
// Shown after every level clear so the game feels less repetitive and more personal.
const SWEET_MESSAGES = [
    "Hebat banget pacarku!",
    "Keren cintaku!",
    "Lanjut terus sayang!",
    "Wah bangga banget sama kamu, jago banget!",
    "Semangat terus cintaku, jangan menyerah!",
    "Pacarku memang paling jago mainnya.",
    "Kamu keren banget hari ini sayang.",
    "Senyum dong sayang, kan udah menang level ini.",
    "Lancar banget mainnya, hebat cintaku!",
    "Jangan lupa minum air ya sayang!",
    "Tuh kan bisa, kamu emang hebat banget!",
    "Aku bangga punya pacar jago kaya kamu.",
    "Lanjut level berikutnya ya cintaku!",
    "Fokus banget mukanya sayang, gemes deh.",
    "Selangkah lagi jadi pro nih cintaku.",

    "Aku seneng lihat kamu main.",
    "Hari ini kamu makin jago aja.",
    "Aku bakal nemenin kamu sampai level terakhir.",
    "Pelan-pelan aja, yang penting nikmatin mainnya.",
    "Main sama kamu selalu bikin aku senyum.",
    "Kamu pasti bisa lewatin level ini juga.",
    "Jangan buru-buru ya sayang, santai aja.",
    "Kalau capek istirahat dulu, nanti lanjut lagi.",
    "Aku percaya sama kemampuan kamu.",
    "Kemenangan kecil tetap layak dirayakan.",
    "Semoga hari kamu seindah permainan ini.",
    "Makasih ya masih mau main di sini.",
    "Aku selalu nunggu kamu balik main lagi.",
    "Semoga game ini bisa nemenin harimu.",
    "Main sebentar juga gapapa, yang penting seneng.",
    "Aku seneng setiap kali lihat progress kamu.",
    "Level demi level, kamu keren banget.",
    "Ayo lanjut, aku yakin kamu bisa.",
    "Terima kasih udah meluangkan waktu buat main.",
    "Hari ini juga jangan lupa istirahat ya.",

    "Dulu kamu semangat gara-gara ada hadiah saldo, sekarang hadiahnya cuma aku.",
    "Sejak gacha saldo dihapus, kok kamu jadi jarang main ya.",
    "Aku kangen waktu kamu rajin buka game ini tiap hari.",
    "Semoga bukan karena saldo udah hilang kamu jadi ninggalin aku.",
    "Sekarang hadiahnya cuma keseruan main bareng aku.",
    "Walaupun nggak ada saldo lagi, semoga kamu tetap betah di sini.",
    "Aku masih nunggu kamu nyelesain level-level berikutnya.",
    "Kalau bukan karena saldo, semoga karena aku ya.",
    "Aku harap game ini tetap jadi tempat favorit kamu.",
    "Jangan bilang kamu datang cuma waktu ada hadiah saldo ya.",
    "Aku lebih senang lihat kamu main daripada lihat game ini sepi.",
    "Walaupun hadiahnya berubah, semoga semangatmu nggak ikut berubah.",
    "Aku masih nyimpen banyak level seru buat kamu.",
    "Ayo main lagi, aku udah nunggu dari tadi.",
    "Game ini rasanya lebih hidup kalau kamu yang main.",
    "Kalau kamu balik lagi, itu udah jadi hadiah buat aku.",
    "Aku harap kamu tetap betah walaupun sekarang nggak ada saldo lagi.",
    "Main sebentar aja juga bikin aku seneng.",
    "Terima kasih karena masih setia main di sini.",
    "Sampai ketemu di level berikutnya ya sayang."
];

// Avoids picking the same message twice in a row.
const pickSweetMessage = (previous) => {
    if (SWEET_MESSAGES.length <= 1) return SWEET_MESSAGES[0];
    let msg;
    do { msg = SWEET_MESSAGES[Math.floor(Math.random() * SWEET_MESSAGES.length)]; } while (msg === previous);
    return msg;
};

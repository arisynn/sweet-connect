// ===================== RANDOM SWEET MESSAGES =====================
// Shown after every level clear so the game feels less repetitive and more personal.

const SWEET_MESSAGES = [
    "Pinter banget sih pacarku, bangga deh!",
    "Yeay, kamu berhasil! Hebat banget cintaku.",
    "Fokus banget mukanya pas main, gemes.",
    "Lanjut terus sayang, aku selalu dukung kamu!",
    "Jangan lupa senyum hari ini ya, kesayanganku.",
    "Pelan-pelan aja sayang, kamu pasti bisa lewatin level ini.",
    "Menang atau kalah, kamu tetep juaranya di hatiku.",
    "Jago banget sih! Coba tebak siapa yang makin sayang?",
    "Capek gak? Kalau capek istirahat dulu ya sayang, jangan dipaksain.",
    "Tiap liat kamu main, bawaannya pengen peluk.",
    "Keren cintaku! Selangkah lagi nih, ayo semangat!",
    "Aku seneng banget bisa nemenin kamu main hari ini.",
    "Sambil main jangan lupa minum air putih ya sayangku.",
    "Apapun hasilnya, kamu udah ngelakuin yang terbaik. Aku bangga!",
    "Semangat cintaku! Aku di sini nemenin kamu terus.",
    "Udah jago, lucu lagi. Paket komplit banget pacarku ini.",
    "Kamu ngerasa susah ya level ini? Gak apa-apa, santai aja sayang.",
    "Hari ini kamu keren banget, makasih ya udah nyempetin waktu buat main.",
    "Seneng deh liat progress kamu, pinter banget kesayanganku.",
    "Kalau lagi main gini kelihatan banget pesonanya, luv banyak-banyak!"
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

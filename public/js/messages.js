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
    "Selangkah lagi jadi pro nih cintaku."
];

// Avoids picking the same message twice in a row.
const pickSweetMessage = (previous) => {
    if (SWEET_MESSAGES.length <= 1) return SWEET_MESSAGES[0];
    let msg;
    do { msg = SWEET_MESSAGES[Math.floor(Math.random() * SWEET_MESSAGES.length)]; } while (msg === previous);
    return msg;
};

window.WEEKLY_MISSIONS_POOL = [
    { id: "w_clear_20", type: "clear", title: "Maraton Mingguan", desc: "Selesaikan 20 level.", target: 20, difficulty: "Menengah", rewardType: "gems", rewardAmount: 15 },
    { id: "w_clear_40", type: "clear", title: "Pejuang Tiada Henti", desc: "Selesaikan 40 level.", target: 40, difficulty: "Sulit", rewardType: "gems", rewardAmount: 25 },
    { id: "w_clear_60", type: "clear", title: "Penguasa Papan", desc: "Selesaikan 60 level.", target: 60, difficulty: "Sangat Sulit", rewardType: "gacha_vouchers", rewardAmount: 3 },
    { id: "w_score_30000", type: "score", title: "Tumpukan Skor", desc: "Kumpulkan 30.000 skor.", target: 30000, difficulty: "Menengah", rewardType: "coins", rewardAmount: 1500 },
    { id: "w_score_60000", type: "score", title: "Mesin Pencetak Skor", desc: "Kumpulkan 60.000 skor.", target: 60000, difficulty: "Sulit", rewardType: "gems", rewardAmount: 20 },
    { id: "w_score_100000", type: "score", title: "Skor Tak Terbatas", desc: "Kumpulkan 100.000 skor.", target: 100000, difficulty: "Sangat Sulit", rewardType: "gacha_vouchers", rewardAmount: 4 },
    { id: "w_combo_30", type: "combo", title: "Rantai Sempurna", desc: "Capai Combo x30.", target: 30, difficulty: "Menengah", rewardType: "coins", rewardAmount: 1000 },
    { id: "w_combo_50", type: "combo", title: "Kombinasi Maut", desc: "Capai Combo x50.", target: 50, difficulty: "Sulit", rewardType: "gems", rewardAmount: 10 },
    { id: "w_combo_80", type: "combo", title: "Dewa Kombinasi", desc: "Capai Combo x80.", target: 80, difficulty: "Sangat Sulit", rewardType: "gacha_vouchers", rewardAmount: 3 },
    { id: "w_match_500", type: "match", title: "Penghapus Balok", desc: "Hancurkan 500 pasang blok.", target: 500, difficulty: "Menengah", rewardType: "coins", rewardAmount: 2000 },
    { id: "w_match_1000", type: "match", title: "Pembersih Papan", desc: "Hancurkan 1.000 pasang blok.", target: 1000, difficulty: "Sulit", rewardType: "gems", rewardAmount: 25 },
    { id: "w_match_2000", type: "match", title: "Penghancur Sejati", desc: "Hancurkan 2.000 pasang blok.", target: 2000, difficulty: "Sangat Sulit", rewardType: "gacha_vouchers", rewardAmount: 5 },
    { id: "w_openChest_10", type: "openChest", title: "Pencari Harta Karun", desc: "Buka 10 Peti.", target: 10, difficulty: "Menengah", rewardType: "coins", rewardAmount: 2500 },
    { id: "w_openChest_20", type: "openChest", title: "Raja Harta", desc: "Buka 20 Peti.", target: 20, difficulty: "Sulit", rewardType: "gems", rewardAmount: 25 },
    { id: "w_useHint_15", type: "useHint", title: "Pemerhati Detail", desc: "Gunakan Hint 15 kali.", target: 15, difficulty: "Menengah", rewardType: "coins", rewardAmount: 1500 },
    { id: "w_useHint_30", type: "useHint", title: "Visi Tajam", desc: "Gunakan Hint 30 kali.", target: 30, difficulty: "Sulit", rewardType: "gems", rewardAmount: 15 },
    { id: "w_useShuffle_15", type: "useShuffle", title: "Ahli Acak", desc: "Gunakan Shuffle 15 kali.", target: 15, difficulty: "Menengah", rewardType: "coins", rewardAmount: 1500 },
    { id: "w_useShuffle_30", type: "useShuffle", title: "Taktik Bebas", desc: "Gunakan Shuffle 30 kali.", target: 30, difficulty: "Sulit", rewardType: "gems", rewardAmount: 15 },
    { id: "w_openMystery_5", type: "openMystery", title: "Penggemar Gacha", desc: "Mainkan 5 Gacha Hoki (Item/Tema).", target: 5, difficulty: "Menengah", rewardType: "gems", rewardAmount: 10 },
    { id: "w_openMystery_10", type: "openMystery", title: "Kolektor Gacha", desc: "Mainkan 10 Gacha Hoki (Item/Tema).", target: 10, difficulty: "Sulit", rewardType: "gacha_vouchers", rewardAmount: 3 },
    { id: "w_flawless_5", type: "flawless", title: "Minggu Sempurna", desc: "Selesaikan 5 level tanpa salah (Flawless).", target: 5, difficulty: "Menengah", rewardType: "gems", rewardAmount: 10 },
    { id: "w_flawless_15", type: "flawless", title: "Dewa Presisi", desc: "Selesaikan 15 level tanpa salah (Flawless).", target: 15, difficulty: "Sulit", rewardType: "gacha_vouchers", rewardAmount: 2 },
];

window.getWeekNumber = function(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return d.getUTCFullYear() + "-W" + weekNo;
};

window.generateWeeklyMissions = function() {
    const weekStr = window.getWeekNumber(new Date());
    let hash = 0;
    for (let i = 0; i < weekStr.length; i++) {
        hash = Math.imul(31, hash) + weekStr.charCodeAt(i) | 0;
    }
    const rng = () => {
        hash = Math.imul(hash ^ (hash >>> 15), 1 | hash);
        hash ^= hash + Math.imul(hash ^ (hash >>> 7), 61 | hash);
        return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
    }
    const shuffled = [...window.WEEKLY_MISSIONS_POOL].sort(() => rng() - 0.5);
    const selected = [];
    const usedTypes = new Set();
    
    for (const m of shuffled) {
        if (!usedTypes.has(m.type) && selected.length < 5) {
            selected.push(m);
            usedTypes.add(m.type);
        }
    }
    for (const m of shuffled) {
        if (selected.length < 5 && !selected.includes(m)) {
            selected.push(m);
        }
    }
    return selected;
};

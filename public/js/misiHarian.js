window.DAILY_MISSIONS_POOL = [
    // Progress - Clear
    { id: "d_clear_easy", type: "clear", category: "progress", title: "Pemanasan", desc: "Selesaikan 2 level.", target: 2, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_clear_med", type: "clear", category: "progress", title: "Makin Jago", desc: "Selesaikan 4 level.", target: 4, difficulty: "Menengah", rewardType: "coins", rewardAmount: 1500 },
    { id: "d_clear_hard", type: "clear", category: "progress", title: "Hebat Banget Sayang", desc: "Selesaikan 7 level.", target: 7, difficulty: "Sulit", rewardType: "gems", rewardAmount: 15 },
    
    // Progress - Match
    { id: "d_match_easy", type: "match", category: "progress", title: "Mulai Fokus", desc: "Hancurkan 40 pasang blok.", target: 40, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_match_med", type: "match", category: "progress", title: "Rajin Bersihin Papan", desc: "Hancurkan 80 pasang blok.", target: 80, difficulty: "Menengah", rewardType: "coins", rewardAmount: 1500 },
    { id: "d_match_hard", type: "match", category: "progress", title: "Nggak Ada yang Sisa", desc: "Hancurkan 150 pasang blok.", target: 150, difficulty: "Sulit", rewardType: "gems", rewardAmount: 15 },

    // Progress - Score
    { id: "d_score_easy", type: "score", category: "progress", title: "Dikit-dikit Lama-lama Bukit", desc: "Kumpulkan 3.000 skor.", target: 3000, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_score_med", type: "score", category: "progress", title: "Poinnya Banyak", desc: "Kumpulkan 8.000 skor.", target: 8000, difficulty: "Menengah", rewardType: "coins", rewardAmount: 1500 },
    { id: "d_score_hard", type: "score", category: "progress", title: "Jago Kumpulin Poin", desc: "Kumpulkan 15.000 skor.", target: 15000, difficulty: "Sulit", rewardType: "gems", rewardAmount: 15 },

    // Skill - Combo
    { id: "d_combo_easy", type: "combo", category: "skill", title: "Kombo Santai", desc: "Capai Combo x4.", target: 4, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_combo_med", type: "combo", category: "skill", title: "Makin Lincah", desc: "Capai Combo x7.", target: 7, difficulty: "Menengah", rewardType: "gems", rewardAmount: 5 },
    { id: "d_combo_hard", type: "combo", category: "skill", title: "Nggak Ada Matinya", desc: "Capai Combo x12.", target: 12, difficulty: "Sulit", rewardType: "gems", rewardAmount: 15 },

    // Skill - Flawless
    { id: "d_flawless_easy", type: "flawless", category: "skill", title: "Pelan Tapi Pasti", desc: "Selesaikan 1 level tanpa salah (Flawless).", target: 1, difficulty: "Mudah", rewardType: "gems", rewardAmount: 3 },
    { id: "d_flawless_med", type: "flawless", category: "skill", title: "Fokus Banget", desc: "Selesaikan 2 level tanpa salah (Flawless).", target: 2, difficulty: "Menengah", rewardType: "gems", rewardAmount: 10 },
    { id: "d_flawless_hard", type: "flawless", category: "skill", title: "Sempurna!", desc: "Selesaikan 4 level tanpa salah (Flawless).", target: 4, difficulty: "Sulit", rewardType: "gacha_vouchers", rewardAmount: 3 },

    // Speed - Survivor
    { id: "d_survivor_easy", type: "survivor", category: "speed", title: "Santai Aja", desc: "Selesaikan 1 level dengan sisa waktu > 50%.", target: 1, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_survivor_med", type: "survivor", category: "speed", title: "Tenang", desc: "Selesaikan 2 level dengan sisa waktu > 50%.", target: 2, difficulty: "Menengah", rewardType: "coins", rewardAmount: 1500 },
    { id: "d_survivor_hard", type: "survivor", category: "speed", title: "Sisa Waktu Banyak", desc: "Selesaikan 4 level dengan sisa waktu > 50%.", target: 4, difficulty: "Sulit", rewardType: "gems", rewardAmount: 15 },

    // Speed - Fast Clear
    { id: "d_fastclear_easy", type: "fast_clear", category: "speed", title: "Sat Set", desc: "Selesaikan 1 level di bawah 45 detik.", target: 1, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_fastclear_med", type: "fast_clear", category: "speed", title: "Cepet Juga", desc: "Selesaikan 2 level di bawah 45 detik.", target: 2, difficulty: "Menengah", rewardType: "gems", rewardAmount: 5 },
    { id: "d_fastclear_hard", type: "fast_clear", category: "speed", title: "Kenceng Banget", desc: "Selesaikan 4 level di bawah 45 detik.", target: 4, difficulty: "Sulit", rewardType: "gacha_vouchers", rewardAmount: 3 },

    // Economy - Chest
    { id: "d_chest_easy", type: "openChest", category: "economy", title: "Pembuka Peti", desc: "Buka 1 Peti.", target: 1, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_chest_med", type: "openChest", category: "economy", title: "Kolektor Peti", desc: "Buka 2 Peti.", target: 2, difficulty: "Menengah", rewardType: "gems", rewardAmount: 5 },
    { id: "d_chest_hard", type: "openChest", category: "economy", title: "Pecinta Harta Karun", desc: "Buka 4 Peti.", target: 4, difficulty: "Sulit", rewardType: "gems", rewardAmount: 15 },

    // Feature (Wildcard) - Gacha, Hint, Shuffle
    { id: "d_gacha_easy", type: "openMystery", category: "feature", title: "Coba Keberuntungan", desc: "Mainkan 1 Gacha Hoki.", target: 1, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_gacha_med", type: "openMystery", category: "feature", title: "Semoga Hoki Ya", desc: "Mainkan 2 Gacha Hoki.", target: 2, difficulty: "Menengah", rewardType: "gems", rewardAmount: 5 },
    { id: "d_hint_easy", type: "useHint", category: "feature", title: "Boleh Pake Bantuan Kok", desc: "Gunakan Hint 1 kali.", target: 1, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
    { id: "d_shuffle_easy", type: "useShuffle", category: "feature", title: "Acak-acak Dulu", desc: "Gunakan Shuffle 1 kali.", target: 1, difficulty: "Mudah", rewardType: "coins", rewardAmount: 500 },
];

window.generateDailyMissions = function(profile) {
    const highestLevel = profile?.highestLevel || 1;
    let playerDiff = "Mudah";
    if (highestLevel >= 15) playerDiff = "Sulit";
    else if (highestLevel >= 5) playerDiff = "Menengah";

    const dateStr = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        hash = Math.imul(31, hash) + dateStr.charCodeAt(i) | 0;
    }
    const rng = () => {
        hash = Math.imul(hash ^ (hash >>> 15), 1 | hash);
        hash ^= hash + Math.imul(hash ^ (hash >>> 7), 61 | hash);
        return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
    }

    const slots = [
        ['progress'], // Slot 1: clear, match, score
        ['skill'],    // Slot 2: combo, flawless
        ['speed'],    // Slot 3: survivor, fast_clear
        ['economy'],  // Slot 4: openChest
        ['progress', 'skill', 'speed', 'feature'] // Slot 5: Wildcard (anything)
    ];

    const selected = [];
    const usedTypes = new Set();
    
    const diffRanks = { "Mudah": 1, "Menengah": 2, "Sulit": 3 };
    const playerDiffRank = diffRanks[playerDiff];

    const bestMissionsByType = {};
    for (const m of window.DAILY_MISSIONS_POOL) {
        if (diffRanks[m.difficulty] <= playerDiffRank) {
            if (!bestMissionsByType[m.type] || diffRanks[m.difficulty] > diffRanks[bestMissionsByType[m.type].difficulty]) {
                bestMissionsByType[m.type] = m;
            }
        }
    }
    const validMissions = Object.values(bestMissionsByType);

    for (const slotCategories of slots) {
        let candidates = validMissions.filter(m => slotCategories.includes(m.category) && !usedTypes.has(m.type));
        candidates.sort(() => rng() - 0.5);
        
        if (candidates.length > 0) {
            let picked = candidates[0];
            selected.push(picked);
            usedTypes.add(picked.type);
        } else {
            // Fallback: pick any unused
            let fallbacks = validMissions.filter(m => !usedTypes.has(m.type)).sort(() => rng() - 0.5);
            if(fallbacks.length > 0) {
                let picked = fallbacks[0];
                selected.push(picked);
                usedTypes.add(picked.type);
            }
        }
    }
    
    return selected;
};

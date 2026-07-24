window.ACHIEVEMENTS_DATA = [
    {
        id: 'levels_cleared',
        category: 'progression',
        title: 'Penjelajah Dunia',
        desc: (target) => `Selesaikan ${target} level.`,
        tiers: [
            { target: 10, reward: { gems: 5 } },
            { target: 50, reward: { gems: 15 } },
            { target: 200, reward: { gems: 30 } },
            { target: 500, reward: { gems: 100 } },
            { target: 1000, reward: { gems: 300, theme: 'mythic' } }
        ],
        getProgress: (p) => p.highestLevel - 1
    },
    {
        id: 'daily_missions',
        category: 'progression',
        title: 'Pekerja Keras',
        desc: (target) => `Selesaikan ${target} Misi Harian.`,
        tiers: [
            { target: 50, reward: { gacha_vouchers: 1 } },
            { target: 200, reward: { gacha_vouchers: 3 } },
            { target: 500, reward: { gacha_vouchers: 5 } },
            { target: 1500, reward: { gacha_vouchers: 10 } },
            { target: 3000, reward: { gacha_vouchers: 25, theme: 'neon' } }
        ],
        getProgress: (p) => p.statistics?.totalDailyMissionsCompleted || 0
    },
    {
        id: 'loyalty',
        category: 'progression',
        title: 'Pelanggan Setia',
        desc: (target) => `Login selama ${target} hari.`,
        tiers: [
            { target: 3, reward: { gems: 5 } },
            { target: 7, reward: { gems: 10 } },
            { target: 30, reward: { gacha_vouchers: 3 } },
            { target: 100, reward: { gems: 50 } },
            { target: 365, reward: { gems: 250 } }
        ],
        getProgress: (p) => p.statistics?.totalLoginDays || 0
    },
    {
        id: 'blocks_cleared',
        category: 'progression',
        title: 'Penghancur Masal',
        desc: (target) => `Hancurkan total ${target} blok.`,
        tiers: [
            { target: 5000, reward: { gems: 5 } },
            { target: 20000, reward: { gems: 10 } },
            { target: 50000, reward: { gacha_vouchers: 2 } },
            { target: 150000, reward: { gems: 25 } },
            { target: 500000, reward: { gems: 150 } }
        ],
        getProgress: (p) => p.statistics?.totalBlocksCleared || 0
    },
    {
        id: 'flawless_victory',
        category: 'mastery',
        title: 'Dewa Presisi',
        desc: (target) => `Selesaikan ${target} level tanpa melakukan kesalahan (Flawless).`,
        tiers: [
            { target: 5, reward: { gems: 10 } },
            { target: 25, reward: { gems: 25 } },
            { target: 100, reward: { gems: 50 } },
            { target: 250, reward: { gems: 150 } },
            { target: 500, reward: { gems: 400 } }
        ],
        getProgress: (p) => p.statistics?.totalFlawless || 0
    },
    {
        id: 'highest_combo',
        category: 'mastery',
        title: 'Rantai Maut',
        desc: (target) => `Capai Combo x${target}.`,
        tiers: [
            { target: 10, reward: { gems: 5 } },
            { target: 20, reward: { gems: 15 } },
            { target: 35, reward: { gems: 40 } },
            { target: 50, reward: { gems: 100 } },
            { target: 80, reward: { gems: 250 } }
        ],
        getProgress: (p) => p.statistics?.highestCombo || 0
    },
    {
        id: 'speedrun',
        category: 'mastery',
        title: 'Lari Dari Waktu',
        desc: (target) => `Selesaikan ${target} level di bawah 45 detik.`,
        tiers: [
            { target: 10, reward: { coins: 1000 } },
            { target: 50, reward: { coins: 5000 } },
            { target: 150, reward: { coins: 15000 } },
            { target: 300, reward: { coins: 30000 } },
            { target: 600, reward: { coins: 75000 } }
        ],
        getProgress: (p) => p.statistics?.speedrunLevels || 0
    },
    {
        id: 'survivor',
        category: 'mastery',
        title: 'Master Bertahan',
        desc: (target) => `Selesaikan ${target} level dengan sisa Bar Waktu lebih dari 50%.`,
        tiers: [
            { target: 5, reward: { gems: 5 } },
            { target: 15, reward: { gems: 10 } },
            { target: 30, reward: { gacha_vouchers: 2 } },
            { target: 60, reward: { gems: 25 } },
            { target: 100, reward: { gems: 75 } }
        ],
        getProgress: (p) => p.statistics?.survivorLevels || 0
    },
    {
        id: 'theme_purchases',
        category: 'collection',
        title: 'Kolektor Estetika',
        desc: (target) => `Buka dan kumpulkan ${target} Tema.`,
        tiers: [
            { target: 3, reward: { gems: 10 } },
            { target: 8, reward: { gems: 20 } },
            { target: 15, reward: { gems: 50 } },
            { target: 25, reward: { gems: 100 } },
            { target: 40, reward: { gems: 200 } }
        ],
        getProgress: (p) => p.statistics?.totalThemesBought || 0
    },
    {
        id: 'mystery_lucky',
        category: 'collection',
        title: 'Ahli Gacha',
        desc: (target) => `Tarik tuas Gacha ${target} kali.`,
        tiers: [
            { target: 10, reward: { coins: 2000 } },
            { target: 50, reward: { coins: 10000 } },
            { target: 150, reward: { coins: 30000 } },
            { target: 400, reward: { coins: 80000 } },
            { target: 1000, reward: { coins: 200000 } }
        ],
        getProgress: (p) => p.statistics?.totalGachaPulls || 0
    },
    {
        id: 'chests_opened',
        category: 'collection',
        title: 'Kolektor Peti',
        desc: (target) => `Buka ${target} Peti.`,
        tiers: [
            { target: 10, reward: { gems: 5 } },
            { target: 50, reward: { gems: 10 } },
            { target: 150, reward: { gacha_vouchers: 2 } },
            { target: 500, reward: { gems: 40 } },
            { target: 2000, reward: { gems: 150 } }
        ],
        getProgress: (p) => p.statistics?.totalChestsOpened || 0
    },
    {
        id: 'overthinker',
        category: 'secret',
        title: 'Pecinta Jalan Buntu',
        desc: (target) => `Gunakan Shuffle saat tidak ada pasangan yang bisa dimatch sebanyak ${target} kali.`,
        tiers: [
            { target: 10, reward: { gems: 50 } }
        ],
        getProgress: (p) => p.statistics?.shuffleOnNoMoves || 0
    },
    {
        id: 'unlucky_streak',
        category: 'secret',
        title: 'Kolektor Sampah',
        desc: (target) => `Mendapatkan "Zonk" atau hadiah kecil dari Gacha sebanyak ${target}x berturut-turut.`,
        tiers: [
            { target: 10, reward: { gacha_vouchers: 5 } }
        ],
        getProgress: (p) => p.statistics?.unluckyGachaStreak || 0
    },
    {
        id: 'near_death',
        category: 'secret',
        title: 'Lolos Dari Kematian',
        desc: (target) => `Selesaikan level saat sisa waktu kurang dari 1 detik.`,
        tiers: [
            { target: 1, reward: { gems: 100 } }
        ],
        getProgress: (p) => p.statistics?.nearDeathEscapes || 0
    }
];

window.getCurrentTier = (profile, achId) => {
    return profile.achievements?.[achId] || 0;
};

window.getClaimableAchievements = (profile) => {
    const claimable = [];
    window.ACHIEVEMENTS_DATA.forEach(a => {
        const tierIdx = window.getCurrentTier(profile, a.id);
        if (tierIdx < a.tiers.length) {
            const tier = a.tiers[tierIdx];
            let isCompleted = a.getProgress(profile) >= tier.target;
            if (isCompleted) claimable.push({ ...a, tierIdx, tier });
        }
    });
    return claimable;
};

window.applyAchievementReward = (profile, achievementItem) => {
    const { id, tierIdx, tier } = achievementItem;
    const newProfile = { ...profile, achievements: { ...(profile.achievements||{}), [id]: tierIdx + 1 } };
    if (!newProfile.statistics) newProfile.statistics = {};
    if (tier.reward.coins) newProfile.coins = (newProfile.coins || 0) + tier.reward.coins;
    if (tier.reward.gems) newProfile.gems = (newProfile.gems || 0) + tier.reward.gems;
    if (tier.reward.gacha_vouchers) newProfile.gacha_vouchers = (newProfile.gacha_vouchers || 0) + tier.reward.gacha_vouchers;
    if (tier.reward.hints) newProfile.hints = Math.min(99, (newProfile.hints || 0) + tier.reward.hints);
    if (tier.reward.shuffles) newProfile.shuffles = Math.min(99, (newProfile.shuffles || 0) + tier.reward.shuffles);
    if (tier.reward.theme && !newProfile.unlockedThemes?.includes(tier.reward.theme)) {
        newProfile.unlockedThemes = [...(newProfile.unlockedThemes || []), tier.reward.theme];
        newProfile.newThemes = [...(newProfile.newThemes || []), tier.reward.theme];
    }
    return newProfile;
};

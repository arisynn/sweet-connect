window.ACHIEVEMENTS_DATA = [
    {
        id: 'levels_cleared',
        title: 'Penjelajah Tangguh',
        desc: (target) => `Selesaikan ${target} level.`,
        tiers: [
            { target: 10, reward: { gems: 5 } },
            { target: 50, reward: { gems: 10 } },
            { target: 150, reward: { gacha_vouchers: 3 } },
            { target: 500, reward: { gems: 30, theme: 'neon' } },
            { target: 1000, reward: { gems: 100, theme: 'mythic' } }
        ],
        getProgress: (p) => p.highestLevel - 1
    },
    {
        id: 'daily_missions',
        title: 'Pekerja Keras',
        desc: (target) => `Selesaikan ${target} Misi Harian.`,
        tiers: [
            { target: 10, reward: { gems: 3 } },
            { target: 50, reward: { gacha_vouchers: 2 } },
            { target: 150, reward: { gems: 15 } },
            { target: 500, reward: { gacha_vouchers: 5 } },
            { target: 1000, reward: { gems: 50 } }
        ],
        getProgress: (p) => p.statistics?.totalDailyMissionsCompleted || 0
    },
    {
        id: 'weekly_missions',
        title: 'Pejuang Konsisten',
        desc: (target) => `Selesaikan ${target} Misi Mingguan.`,
        tiers: [
            { target: 5, reward: { gems: 5 } },
            { target: 20, reward: { gems: 10 } },
            { target: 50, reward: { gacha_vouchers: 3 } },
            { target: 100, reward: { gems: 40 } },
            { target: 300, reward: { gems: 100 } }
        ],
        getProgress: (p) => p.statistics?.totalWeeklyMissionsCompleted || 0
    },
    {
        id: 'mystery_lucky',
        title: 'Penuh Kejutan',
        desc: (target) => `Mainkan Gacha Hoki ${target} kali.`,
        tiers: [
            { target: 1, reward: { gems: 2 } },
            { target: 5, reward: { gems: 5 } },
            { target: 20, reward: { gacha_vouchers: 2 } },
            { target: 50, reward: { gems: 20 } },
            { target: 150, reward: { gems: 50 } }
        ],
        getProgress: (p) => p.statistics?.mysteryBoxJackpots || 0
    },
    {
        id: 'revive_used',
        title: 'Pantang Menyerah',
        desc: (target) => `Gunakan HP ${target} kali.`,
        tiers: [
            { target: 5, reward: { gems: 3 } },
            { target: 20, reward: { gems: 10 } },
            { target: 50, reward: { gems: 5 } },
            { target: 150, reward: { gacha_vouchers: 2 } },
            { target: 500, reward: { gems: 25 } }
        ],
        getProgress: (p) => p.statistics?.totalRevivesUsed || 0
    },
    {
        id: 'survivor',
        title: 'Master Bertahan',
        desc: (target) => `Selesaikan level dengan sisa Bar Waktu minimal ${target}%.`,
        tiers: [
            { target: 20, reward: { coins: 500 } },
            { target: 40, reward: { gems: 5 } },
            { target: 60, reward: { gacha_vouchers: 2 } },
            { target: 80, reward: { gems: 15 } },
            { target: 90, reward: { gems: 50 } }
        ],
        getProgress: (p) => p.statistics?.highestRemainingProgress || 0
    },
    {
        id: 'flawless_victory',
        title: 'Sempurna',
        desc: (target) => `Selesaikan ${target} level tanpa melakukan kesalahan (Flawless).`,
        tiers: [
            { target: 1, reward: { gems: 5 } },
            { target: 5, reward: { gems: 10 } },
            { target: 10, reward: { gacha_vouchers: 2 } },
            { target: 25, reward: { gems: 25 } },
            { target: 50, reward: { gacha_vouchers: 5 } }
        ],
        getProgress: (p) => p.statistics?.totalFlawless || 0
    },
    {
        id: 'highest_combo',
        title: 'Pakar Strategi',
        desc: (target) => `Capai Combo x${target}.`,
        tiers: [
            { target: 10, reward: { gems: 3 } },
            { target: 20, reward: { gems: 10 } },
            { target: 35, reward: { gems: 5 } },
            { target: 50, reward: { gacha_vouchers: 2 } },
            { target: 80, reward: { gems: 40 } }
        ],
        getProgress: (p) => p.statistics?.highestCombo || 0
    },
    {
        id: 'loyalty',
        title: 'Pelanggan Setia',
        desc: (target) => `Login selama ${target} hari.`,
        tiers: [
            { target: 3, reward: { gems: 3 } },
            { target: 7, reward: { gems: 5 } },
            { target: 30, reward: { gacha_vouchers: 3 } },
            { target: 100, reward: { gems: 30 } },
            { target: 365, reward: { gems: 200 } }
        ],
        getProgress: (p) => p.statistics?.totalLoginDays || 0
    },
    {
        id: 'blocks_cleared',
        title: 'Penghancur Masal',
        desc: (target) => `Hancurkan total ${target} blok.`,
        tiers: [
            { target: 5000, reward: { gems: 5 } },
            { target: 20000, reward: { gems: 5 } },
            { target: 50000, reward: { gacha_vouchers: 2 } },
            { target: 150000, reward: { gems: 20 } },
            { target: 500000, reward: { gems: 100 } }
        ],
        getProgress: (p) => p.statistics?.totalBlocksCleared || 0
    },
    {
        id: 'theme_purchases',
        title: 'Desainer Interior',
        desc: (target) => `Koleksi ${target} Tema.`,
        tiers: [
            { target: 1, reward: { gems: 3 } },
            { target: 3, reward: { gacha_vouchers: 1 } },
            { target: 5, reward: { gems: 10 } },
            { target: 10, reward: { gacha_vouchers: 3 } },
            { target: 20, reward: { gems: 50 } }
        ],
        getProgress: (p) => p.statistics?.totalThemesBought || 0
    },
    {
        id: 'powerup_purchases',
        title: 'Pembeli Alat',
        desc: (target) => `Beli ${target} Powerup.`,
        tiers: [
            { target: 10, reward: { gems: 3 } },
            { target: 50, reward: { gems: 5 } },
            { target: 200, reward: { gems: 5 } },
            { target: 500, reward: { gacha_vouchers: 2 } },
            { target: 2000, reward: { gems: 30 } }
        ],
        getProgress: (p) => p.statistics?.totalPowerupsBought || 0
    },
    {
        id: 'chests_opened',
        title: 'Kolektor Peti',
        desc: (target) => `Buka ${target} Peti.`,
        tiers: [
            { target: 10, reward: { gems: 5 } },
            { target: 50, reward: { gems: 5 } },
            { target: 150, reward: { gacha_vouchers: 2 } },
            { target: 500, reward: { gems: 30 } },
            { target: 2000, reward: { gems: 100 } }
        ],
        getProgress: (p) => p.statistics?.totalChestsOpened || 0
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

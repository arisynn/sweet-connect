window.EconomyEngine = {
    addCoins: (profile, amount) => {
        if (amount < 0 && profile.coins < Math.abs(amount)) return false;
        profile.coins += amount;
        if (amount > 0) {
            profile.statistics.totalCoinsEarned += amount;
        }
        return true;
    },
    addGems: (profile, amount) => {
        if (amount < 0 && profile.gems < Math.abs(amount)) return false;
        profile.gems += amount;
        return true;
    },
    addHp: (profile, amount, maxHp = 5) => {
        if (amount > 0 && profile.hp >= maxHp) return false;
        if (amount < 0 && profile.hp < Math.abs(amount)) return false;
        profile.hp = Math.min(profile.hp + amount, maxHp);
        return true;
    },
    addHints: (profile, amount) => {
        if (amount < 0 && profile.hints < Math.abs(amount)) return false;
        profile.hints += amount;
        return true;
    },
    addShuffles: (profile, amount) => {
        if (amount < 0 && profile.shuffles < Math.abs(amount)) return false;
        profile.shuffles += amount;
        return true;
    }
};

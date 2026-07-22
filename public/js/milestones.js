window.MILESTONES = Array.from({ length: 50 }, (_, i) => {
    const level = (i + 1) * 10;
    
    let coins = 1000 + (Math.floor(level / 10) * 100);
    let gems = 2 + Math.floor(level / 50);
    let vouchers = 1;
    
    if (level % 100 === 0) {
        coins = 5000 + (Math.floor(level / 100) * 1000);
        gems = 20 + Math.floor(level / 100) * 5;
        vouchers = 5 + Math.floor(level / 100);
    } else if (level % 50 === 0) {
        coins = 2000 + (Math.floor(level / 50) * 500);
        gems = 10 + Math.floor(level / 50) * 2;
        vouchers = 3;
    }
    
    return { level, reward: { coins, gems, gacha_vouchers: vouchers } };
});

window.getClaimableMilestones = (profile) => window.MILESTONES.filter(m => !(profile.milestones && profile.milestones[m.level]) && profile.highestLevel >= m.level);

window.applyMilestoneReward = (profile, milestone) => {
    const newProfile = { ...profile, milestones: { ...(profile.milestones || {}), [milestone.level]: true } };
    
    if (!newProfile.statistics) newProfile.statistics = {};
    if (milestone.reward.coins) newProfile.coins = (newProfile.coins || 0) + milestone.reward.coins;
    if (milestone.reward.gems) newProfile.gems = (newProfile.gems || 0) + milestone.reward.gems;
    if (milestone.reward.gacha_vouchers) newProfile.gacha_vouchers = (newProfile.gacha_vouchers || 0) + milestone.reward.gacha_vouchers;
    if (milestone.reward.theme && !newProfile.unlockedThemes.includes(milestone.reward.theme)) {
        newProfile.unlockedThemes = [...(newProfile.unlockedThemes || []), milestone.reward.theme];
        newProfile.newThemes = [...(newProfile.newThemes || []), milestone.reward.theme];
    }
    return newProfile;
};

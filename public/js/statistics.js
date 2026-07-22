const updateStatistics = (profile, patch) => {
    const stats = { ...profile.statistics };
    if (patch.incrementGames) stats.totalGames += 1;
    if (patch.scoreAchieved !== undefined) stats.totalScore = (stats.totalScore || 0) + patch.scoreAchieved;
    if (patch.flawlessDelta) stats.totalFlawless = (stats.totalFlawless || 0) + 1;
    if (patch.scoreAchieved !== undefined) stats.highestScore = Math.max(stats.highestScore || 0, patch.scoreAchieved);
    if (patch.mysteryBoxOpenedDelta) stats.totalMysteryBoxOpened = (stats.totalMysteryBoxOpened || 0) + patch.mysteryBoxOpenedDelta;
    if (patch.matchesDelta) {
        stats.totalMatches = (stats.totalMatches || 0) + patch.matchesDelta;
        stats.totalBlocksCleared = (stats.totalBlocksCleared || 0) + (patch.matchesDelta * 2);
    }
    if (patch.playTimeDeltaMs) stats.totalPlayTimeMs = (stats.totalPlayTimeMs || 0) + patch.playTimeDeltaMs;
    if (patch.hintsUsedDelta) stats.totalHintsUsed = (stats.totalHintsUsed || 0) + patch.hintsUsedDelta;
    if (patch.shufflesUsedDelta) stats.totalShufflesUsed = (stats.totalShufflesUsed || 0) + patch.shufflesUsedDelta;
    if (patch.wrongDelta) stats.totalWrong = (stats.totalWrong || 0) + patch.wrongDelta;
    if (patch.chestOpenedDelta) stats.totalChestsOpened = (stats.totalChestsOpened || 0) + patch.chestOpenedDelta;
    if (patch.highestCombo !== undefined) stats.highestCombo = Math.max((stats.highestCombo || 0), patch.highestCombo);
    if (patch.timeElapsedMs !== undefined) {
        if (!stats.fastestLevelTimeMs || stats.fastestLevelTimeMs === 0) {
            stats.fastestLevelTimeMs = patch.timeElapsedMs;
        } else {
            stats.fastestLevelTimeMs = Math.min(stats.fastestLevelTimeMs, patch.timeElapsedMs);
        }
    }
    if (patch.remainingProgress !== undefined) {
        stats.highestRemainingProgress = Math.max(stats.highestRemainingProgress || 0, Math.floor(patch.remainingProgress));
    }
    
    // New stats
    if (patch.revivesUsedDelta) stats.totalRevivesUsed = (stats.totalRevivesUsed || 0) + patch.revivesUsedDelta;
    if (patch.themesBoughtDelta) stats.totalThemesBought = (stats.totalThemesBought || 0) + patch.themesBoughtDelta;
    if (patch.powerupsBoughtDelta) stats.totalPowerupsBought = (stats.totalPowerupsBought || 0) + patch.powerupsBoughtDelta;
    
    const newProfile = { ...profile, statistics: stats };
    if (patch.activeSession !== undefined) newProfile.activeSession = patch.activeSession;
    return newProfile;
};

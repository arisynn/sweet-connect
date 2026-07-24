window.ProfileEngine = {
    getDefaultProfile: () => ({
        coins: 0, gems: 0, gacha_vouchers: 0,
        chestSlots: [null, null, null], chestProgress: 0,
        flexCrown: false, hp: 3, hints: 3, shuffles: 3,
        currentLevel: 1, highestLevel: 1, activeSession: null, currentScore: 0,
        unlockedThemes: ['sweets'], activeTheme: 'sweets', customEmojis: [],
        settings: { isMuted: false, audio: { music: 0.5, sfx: 1 } },
        dailyReward: { lastClaimDate: null }, achievements: {}, milestones: {}, rewardProgress: 0,
        statistics: { totalGames: 0, highestScore: 0, totalCoinsEarned: 0, totalMysteryBoxOpened: 0, totalMatches: 0, totalPlayTimeMs: 0 },
        dailyMissions: { date: null, login: false, play1: false, clear3: false, progressPlay: 0, progressClear: 0 },
        weeklyMissions: { week: null, activeIds: [], progress: {}, claimed: {}, allClaimed: false, forceResetV2: true },
        profileVersion: 6, lastUpdated: Date.now()
    }),

    migrateGameData: (gameData) => {
        if (gameData.profileVersion === undefined || gameData.profileVersion < 2) {
            if (gameData.highestLevel === undefined) gameData.highestLevel = gameData.currentLevel || 1;
            if (!gameData.dailyReward) gameData.dailyReward = { lastClaimDate: null };
            if (!gameData.achievements) gameData.achievements = {};
            if (!gameData.milestones) gameData.milestones = {};
            if (gameData.rewardProgress === undefined) gameData.rewardProgress = 0;
            if (!gameData.statistics) gameData.statistics = { totalGames: 0, highestScore: gameData.currentScore || 0, totalCoinsEarned: 0, totalMysteryBoxOpened: 0, totalMatches: 0, totalPlayTimeMs: 0 };
            gameData.profileVersion = 2;
        }
        if (gameData.profileVersion < 3) {
            if (!gameData.dailyMissions) gameData.dailyMissions = { date: null, login: false, play1: false, clear3: false, progressPlay: 0, progressClear: 0 };
            gameData.profileVersion = 3;
        }
        if (gameData.profileVersion < 4) {
            if (!gameData.lastUpdated) gameData.lastUpdated = Date.now();
            gameData.profileVersion = 4;
        }
        if (gameData.profileVersion < 5) {
            if (!gameData.weeklyMissions) gameData.weeklyMissions = { week: null, activeIds: [], progress: {}, claimed: {}, allClaimed: false, forceResetV2: true };
            gameData.profileVersion = 5;
        }
        if (gameData.profileVersion < 6) {
            if (!gameData.activeTheme) gameData.activeTheme = 'sweets';
            if (!gameData.settings) gameData.settings = { isMuted: false, audio: { music: 0.5, sfx: 1 } };
            gameData.profileVersion = 6;
        }
        if (Array.isArray(gameData)) throw new Error("GameData is an array instead of object. Fatal corruption.");
        return gameData;
    },

    migrateFromV1: (oldProfile) => {
        window.EngineUtils.log('Migration', 'Migrating legacy profile to V2 Engine format.');
        const payload = {
            _engine: {
                version: 2, revision: 1, updatedAt: Date.now(),
                deviceId: window.SessionEngine.currentDeviceId,
                sessionId: window.SessionEngine.currentSessionId,
                saveHash: null
            },
            gameData: oldProfile
        };
        payload._engine.saveHash = window.EngineUtils.calculateHash(payload.gameData);
        return payload;
    }
};
window.getDefaultProfile = window.ProfileEngine.getDefaultProfile;

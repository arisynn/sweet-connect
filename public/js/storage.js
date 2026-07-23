// ===================== PROFILE STORAGE & SYNC =====================
const LOCAL_STORAGE_PREFIX = 'sc_prof_local_';

const getDefaultProfile = () => ({
    profileVersion: 6,
    lastUpdated: Date.now(),
    gems: 0,
    hints: 3,
    shuffles: 3,
    hp: 3,
    coins: 0,
    flexCrown: false,
    unlockedThemes: ['sweets'],
    activeTheme: 'sweets',
    settings: {
        isMuted: false,
        audio: { music: 0.5, sfx: 1 }
    },
    currentLevel: 1,
    activeSession: null,
    currentScore: 0,
    highestLevel: 1,
    rainbow_candy: 0,
    gacha_vouchers: 0,
    chestSlots: [null, null, null],
    chestProgress: 0,
    dailyReward: { lastClaimDate: null },
    dailyMissions: {
        date: null,
        activeIds: [],
        progress: {},
        claimed: {},
        repeatable: { typeIndex: 0, progress: 0, readyCount: 0 },
        allClaimed: false,
        forceResetV2: true
    },
    weeklyMissions: {
        week: null,
        activeIds: [],
        progress: {},
        claimed: {},
        allClaimed: false,
        forceResetV2: true
    },
    achievements: {},
    milestones: {},
    rewardProgress: 0,
    statistics: {
        totalGames: 0,
        highestScore: 0,
        totalCoinsEarned: 0,
        totalMysteryBoxOpened: 0,
        totalMatches: 0,
        totalPlayTimeMs: 0,
        highestCombo: 0,
        totalHintsUsed: 0,
        totalShufflesUsed: 0
    }
});

const validateAndMigrateProfile = (parsed) => {
    if (!parsed || typeof parsed !== 'object') return null;
    
    if(!parsed.unlockedThemes) parsed.unlockedThemes = ['sweets'];
    if (parsed.statistics) {
        if (parsed.statistics.highestCombo === undefined) parsed.statistics.highestCombo = 0;
        if (parsed.statistics.totalHintsUsed === undefined) parsed.statistics.totalHintsUsed = 0;
        if (parsed.statistics.totalShufflesUsed === undefined) parsed.statistics.totalShufflesUsed = 0;
    }
    if(parsed.coins === undefined) parsed.coins = 0;
    if(parsed.gems === undefined) parsed.gems = 0;
    if(parsed.rainbow_candy === undefined) parsed.rainbow_candy = 0;
    if(parsed.gacha_vouchers === undefined) parsed.gacha_vouchers = 0;
    if(parsed.chestSlots === undefined) parsed.chestSlots = [null, null, null];
    if(parsed.chestProgress === undefined) parsed.chestProgress = 0;
    if(parsed.flexCrown === undefined) parsed.flexCrown = false;
    if(parsed.hp === undefined) parsed.hp = Math.min(9, 3 + (parsed.bonusHP || 0));
    if(parsed.hints === undefined) parsed.hints = Math.min(99, 3 + (parsed.bonusHints || 0));
    if(parsed.shuffles === undefined) parsed.shuffles = Math.min(99, 3 + (parsed.bonusShuffles || 0));
    
    if(parsed.currentLevel === undefined) parsed.currentLevel = 1;
    if(parsed.activeSession === undefined) parsed.activeSession = null;
    if(parsed.currentScore === undefined) parsed.currentScore = 0;

    if (parsed.profileVersion === undefined || parsed.profileVersion < 2) {
        if (parsed.highestLevel === undefined) parsed.highestLevel = parsed.currentLevel || 1;
        if (!parsed.dailyReward) parsed.dailyReward = { lastClaimDate: null };
        if (!parsed.achievements) parsed.achievements = {};
        if (!parsed.milestones) parsed.milestones = {};
        if (parsed.rewardProgress === undefined) parsed.rewardProgress = 0;
        if (!parsed.statistics) parsed.statistics = {
            totalGames: 0,
            highestScore: parsed.currentScore || 0,
            totalCoinsEarned: 0,
            totalMysteryBoxOpened: 0,
            totalMatches: 0,
            totalPlayTimeMs: 0
        };
        parsed.profileVersion = 2;
    }
    if (parsed.profileVersion < 3) {
        if (!parsed.dailyMissions) parsed.dailyMissions = {
            date: null, login: false, play1: false, clear3: false, progressPlay: 0, progressClear: 0
        };
        parsed.profileVersion = 3;
    }
    if (parsed.profileVersion < 4) {
        if (!parsed.lastUpdated) parsed.lastUpdated = Date.now();
        parsed.profileVersion = 4;
    }
    if (parsed.profileVersion < 5) {
        if (!parsed.weeklyMissions) parsed.weeklyMissions = {
            week: null, activeIds: [], progress: {}, claimed: {}, allClaimed: false, forceResetV2: true
        };
        if (parsed.dailyMissions && !parsed.dailyMissions.repeatable) {
            parsed.dailyMissions.repeatable = { typeIndex: 0, progress: 0, readyCount: 0 };
        }
        parsed.profileVersion = 5;
    }
    if (parsed.profileVersion < 6) {
        if (!parsed.activeTheme) parsed.activeTheme = 'sweets';
        if (!parsed.settings) parsed.settings = { isMuted: false, audio: { music: 0.5, sfx: 1 } };
        parsed.profileVersion = 6;
    }
    
    return parsed;
};

const getLocalProfile = (name) => {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_PREFIX + name);
        if (raw) return JSON.parse(raw);
    } catch(e) {
        console.error("Local storage read error", e);
    }
    return null;
};

const setLocalProfile = (name, profile) => {
    // CLOUD-ONLY: Local storage write is disabled to prevent conflicts.
};

const emitSyncLog = (status, action, result) => {
    window.dispatchEvent(new CustomEvent('syncLog', { detail: { status, action, result } }));
};

const fetchCloudProfile = async (name) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${PROFILE_API_URL}?name=${encodeURIComponent(name)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            let errMsg = `HTTP error! status: ${res.status}`;
            try {
                const errData = await res.json();
                if (errData.error) errMsg = errData.error;
            } catch(e) {}
            throw new Error(errMsg);
        }
        const data = await res.json();
        
        if (data.result) {
            const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
            return validateAndMigrateProfile(parsed);
        }
        return null;
    } catch (error) {
        console.warn("Cloud fetch failed:", error.message);
        throw error;
    }
};

const saveCloudProfile = async (name, profile) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${PROFILE_API_URL}?name=${encodeURIComponent(name)}`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(profile),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
            let errMsg = `HTTP error! status: ${res.status}`;
            try {
                const errData = await res.json();
                if (errData.error) errMsg = errData.error;
            } catch(e) {}
            throw new Error(errMsg);
        }
        return true;
    } catch(error) {
        console.warn("Cloud save failed:", error.message);
        throw error;
    }
};

let isStartupComplete = false;
let saveQueueTimeout = null;
let pendingSaveProfile = null;
let pendingSaveName = null;

const setStartupComplete = (complete) => {
    isStartupComplete = complete;
    if (complete && pendingSaveProfile) {
        triggerSave();
    }
};

const triggerSave = async () => {
    if (!isStartupComplete || !pendingSaveProfile || !pendingSaveName) return;
    
    const profileToSave = pendingSaveProfile;
    const nameToSave = pendingSaveName;
    pendingSaveProfile = null; // Clear queue

    // Validation
    if (!profileToSave || typeof profileToSave !== 'object') return;
    if (!profileToSave.profileVersion || 
        profileToSave.currentLevel === undefined || 
        profileToSave.coins === undefined || 
        profileToSave.hp === undefined) {
        console.warn('SaveManager: Invalid profile structure, aborting upload');
        return;
    }

    try {
        if (!profileToSave.timezone) {
            profileToSave.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
    } catch(e) {}

    profileToSave.lastUpdated = Date.now();
    
    try {
        await saveCloudProfile(nameToSave, profileToSave);
        emitSyncLog('Connected', 'Upload Cloud Save', 'Sync Complete');
    } catch (e) {
        emitSyncLog('Offline', 'Upload failed', e.message || 'Timeout');
        // Retry logic: if nothing new was queued, put this back in the queue and retry later
        if (!pendingSaveProfile) {
            pendingSaveName = nameToSave;
            pendingSaveProfile = profileToSave;
            if (saveQueueTimeout) clearTimeout(saveQueueTimeout);
            saveQueueTimeout = setTimeout(() => { triggerSave(); }, 10000); // retry in 10s
        }
    }
};

const saveProfile = (name, profile) => {
    if (!name || !profile) return;
    
    // Deep clone to avoid mutating the queue
    pendingSaveName = name;
    pendingSaveProfile = JSON.parse(JSON.stringify(profile)); 
    
    if (saveQueueTimeout) {
        clearTimeout(saveQueueTimeout);
    }
    
    if (!isStartupComplete) {
        console.log("SaveManager: Startup not complete, queueing save");
        return;
    }

    // Debounce save by 2.5 seconds
    saveQueueTimeout = setTimeout(() => {
        triggerSave();
    }, 2500);
};

// Immediate save bypassing debounce (useful for critical points if needed, though debouncing is usually fine)
const forceSaveProfileNow = async (name, profile) => {
    if (!name || !profile || !isStartupComplete) return;
    pendingSaveName = name;
    pendingSaveProfile = JSON.parse(JSON.stringify(profile));
    if (saveQueueTimeout) clearTimeout(saveQueueTimeout);
    await triggerSave();
};

const saveProfileKeepalive = (name, profile) => {
    if (!name || !profile || !isStartupComplete) return;
    try {
        const p = JSON.parse(JSON.stringify(profile));
        p.lastUpdated = Date.now();
        fetch(`${PROFILE_API_URL}?name=${encodeURIComponent(name)}`, { 
            method: 'POST', 
            keepalive: true, 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(p) 
        }).catch(() => {});
    } catch(e) {}
};

window.saveCloudProfile = saveCloudProfile;
window.forceSaveProfileNow = forceSaveProfileNow;
window.saveProfileKeepalive = saveProfileKeepalive;
window.setStartupComplete = setStartupComplete;

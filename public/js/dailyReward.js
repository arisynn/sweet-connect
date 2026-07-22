// ===================== DAILY MISSIONS =====================
const getLocalDateString = (date) => {
    const d = date || new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getLocalWeekString = (date) => {
    const d = date || new Date();
    const dCopy = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = dCopy.getUTCDay() || 7;
    dCopy.setUTCDate(dCopy.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(dCopy.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((dCopy - yearStart) / 86400000) + 1)/7);
    return `${dCopy.getUTCFullYear()}-W${weekNo}`;
};







const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

const getDailyMissions = (profile) => {
    const today = getLocalDateString();
    let dm = profile.dailyMissions || {};
    
    const hasInvalidIds = dm.activeIds ? dm.activeIds.some(id => !window.DAILY_MISSIONS_POOL.find(m => m.id === id)) : false;
    const needsForceReset = dm.activeIds ? (dm.activeIds.length !== 5) : true;

    if (dm.date !== today || !dm.activeIds || hasInvalidIds || needsForceReset) {
        const generated = window.generateDailyMissions();
        const selectedMissions = generated.map(m => m.id);
        
        let repType = Math.floor(Math.random() * window.REPEATABLE_MISSIONS_CONFIG.length);
        if (dm.repeatable && dm.repeatable.progress > 0) { 
            repType = dm.repeatable.typeIndex % window.REPEATABLE_MISSIONS_CONFIG.length;
        }
        let repProg = dm.repeatable ? dm.repeatable.progress : 0;
        let readyCount = dm.repeatable ? dm.repeatable.readyCount : 0;

        dm = {
            date: today,
            activeIds: selectedMissions,
            progress: {},
            claimed: {},
            repeatable: { typeIndex: repType, progress: repProg, readyCount: readyCount },
            allClaimed: false,
            forceResetV2: true
        };
    }
    return dm;
};

const getWeeklyMissions = (profile) => {
    const currentWeek = getLocalWeekString();
    let wm = profile.weeklyMissions || {};
    
    const hasInvalidIds = wm.activeIds ? wm.activeIds.some(id => !window.WEEKLY_MISSIONS_POOL.find(m => m.id === id)) : false;
    const needsForceReset = wm.activeIds ? (wm.activeIds.length !== 5) : true;

    if (wm.date !== currentWeek || !wm.activeIds || hasInvalidIds || needsForceReset) {
        const generated = window.generateWeeklyMissions();
        const selectedMissions = generated.map(m => m.id);
        
        wm = {
            date: currentWeek,
            activeIds: selectedMissions,
            progress: {},
            claimed: {},
            allClaimed: false,
            forceResetV2: true
        };
    }
    return wm;
};

const getActiveDailyMissionsConfig = (profile) => {
    const dm = getDailyMissions(profile);
    return dm.activeIds.map(id => window.DAILY_MISSIONS_POOL.find(m => m.id === id)).filter(Boolean);
};

const getActiveWeeklyMissionsConfig = (profile) => {
    const wm = getWeeklyMissions(profile);
    return wm.activeIds.map(id => window.WEEKLY_MISSIONS_POOL.find(m => m.id === id)).filter(Boolean);
};

const updateMissions = (profile, action, amount = 1) => {
    const dm = getDailyMissions(profile);
    const wm = getWeeklyMissions(profile);
    const newDm = { ...dm, progress: { ...dm.progress }, claimed: { ...dm.claimed }, repeatable: { ...dm.repeatable } };
    const newWm = { ...wm, progress: { ...wm.progress }, claimed: { ...wm.claimed } };
    let updatedDm = false;
    let updatedWm = false;

    const addDmProgress = (actionType, maxVal, amt) => {
        newDm.activeIds.forEach(id => {
            const mission = window.DAILY_MISSIONS_POOL.find(m => m.id === id);
            if (mission && mission.type === actionType) {
                const current = newDm.progress[id] || 0;
                if (current < mission.target) {
                    newDm.progress[id] = Math.min(maxVal !== null ? Math.max(current, maxVal) : current + amt, mission.target);
                    updatedDm = true;
                }
            }
        });
    };

    const addWmProgress = (actionType, maxVal, amt) => {
        newWm.activeIds.forEach(id => {
            const mission = window.WEEKLY_MISSIONS_POOL.find(m => m.id === id);
            if (mission && mission.type === actionType) {
                const current = newWm.progress[id] || 0;
                if (current < mission.target) {
                    newWm.progress[id] = Math.min(maxVal !== null ? Math.max(current, maxVal) : current + amt, mission.target);
                    updatedWm = true;
                }
            }
        });
    };

    const handleRepeatable = (actionType, maxVal, amt) => {
        if (newDm.repeatable) {
            const repType = window.REPEATABLE_MISSIONS_CONFIG[newDm.repeatable.typeIndex];
            if (repType && repType.type === actionType) {
                const current = newDm.repeatable.progress || 0;
                let next = maxVal !== null ? Math.max(current, maxVal) : current + amt;
                if (next >= repType.target) {
                    const claims = Math.floor(next / repType.target);
                    newDm.repeatable.readyCount += claims;
                    next %= repType.target;
                }
                newDm.repeatable.progress = next;
                updatedDm = true;
            }
        }
    };

    const processAction = (actionType, maxVal, amt) => {
        addDmProgress(actionType, maxVal, amt);
        addWmProgress(actionType, maxVal, amt);
        handleRepeatable(actionType, maxVal, amt);
    };

    if (action === 'winLevel') {
        processAction('clear', null, amount);
    } else if (action === 'score') {
        processAction('score', null, amount);
    } else if (action === 'combo') {
        processAction('combo', amount, 0);
    } else if (action === 'addCombo') { 
        processAction('addCombo', null, amount);
    } else if (action === 'match') {
        processAction('match', null, amount);
    } else if (action === 'useHint') {
        processAction('useHint', null, amount);
    } else if (action === 'useShuffle') {
        processAction('useShuffle', null, amount);
    } else if (action === 'openMystery') {
        processAction('openMystery', null, amount);
    } else if (action === 'openChest') {
        processAction('openChest', null, amount);
    } else if (action === 'flawless') {
        processAction('flawless', null, amount);
    } else if (action === 'play') {
        processAction('play', null, amount);
    }

    if (updatedDm || updatedWm) {
        return { ...profile, dailyMissions: newDm, weeklyMissions: newWm };
    }
    return profile;
};

const getDailyMissionsCompletedCount = (profile) => {
    const dm = getDailyMissions(profile);
    return dm.activeIds.filter(id => dm.claimed[id]).length;
};

const getWeeklyMissionsCompletedCount = (profile) => {
    const wm = getWeeklyMissions(profile);
    return wm.activeIds.filter(id => wm.claimed[id]).length;
};

const canClaimAnyMissionReward = (profile) => {
    const dm = getDailyMissions(profile);
    const activeConfig = getActiveDailyMissionsConfig(profile);
    for (const mission of activeConfig) {
        const current = dm.progress[mission.id] || 0;
        const claimed = dm.claimed[mission.id] || false;
        if (!claimed && current >= mission.target) return true;
    }
    
    if (getDailyMissionsCompletedCount(profile) >= dm.activeIds.length && !dm.allClaimed) {
        return true;
    }
    
    const wm = getWeeklyMissions(profile);
    const activeWmConfig = getActiveWeeklyMissionsConfig(profile);
    for (const mission of activeWmConfig) {
        const current = wm.progress[mission.id] || 0;
        const claimed = wm.claimed[mission.id] || false;
        if (!claimed && current >= mission.target) return true;
    }
    
    if (getWeeklyMissionsCompletedCount(profile) >= wm.activeIds.length && !wm.allClaimed) {
        return true;
    }
    
    if (dm.repeatable.readyCount > 0) return true;
    
    return false;
};

const claimMissionReward = (profile, missionId, isWeekly = false) => {
    const newProfile = { ...profile };
    let rewardLabel = "";

    if (missionId === 'daily_all') {
        const dm = getDailyMissions(profile);
        const newDm = { ...dm };
        if (!newDm.allClaimed) {
            newDm.allClaimed = true;
            if (!newProfile.statistics) newProfile.statistics = {};
            newProfile.gacha_vouchers = (newProfile.gacha_vouchers || 0) + 1;
            newProfile.gems = (newProfile.gems || 0) + 5;
            rewardLabel = "Bonus Harian!";
        }
        newProfile.dailyMissions = newDm;
    } else if (missionId === 'weekly_all') {
        const wm = getWeeklyMissions(profile);
        const newWm = { ...wm };
        if (!newWm.allClaimed) {
            newWm.allClaimed = true;
            if (!newProfile.statistics) newProfile.statistics = {};
            newProfile.gacha_vouchers = (newProfile.gacha_vouchers || 0) + 10;
            newProfile.gems = (newProfile.gems || 0) + 20;
            rewardLabel = "Bonus Mingguan!";
        }
        newProfile.weeklyMissions = newWm;
    } else if (missionId === 'repeatable') {
        const dm = getDailyMissions(profile);
        const newDm = { ...dm, progress: { ...dm.progress }, claimed: { ...dm.claimed }, repeatable: { ...dm.repeatable } };
        
        if (newDm.repeatable.readyCount > 0) {
            newDm.repeatable.readyCount -= 1;
            const repType = window.REPEATABLE_MISSIONS_CONFIG[newDm.repeatable.typeIndex];
            if (!newProfile.statistics) newProfile.statistics = {};
            if (repType.rewardType === 'gems') {
                newProfile.gems = (newProfile.gems || 0) + repType.rewardAmount;
            } else if (repType.rewardType === 'gacha_vouchers') {
                newProfile.gacha_vouchers = (newProfile.gacha_vouchers || 0) + repType.rewardAmount;
            } else if (repType.rewardType === 'coins') {
                newProfile.coins = (newProfile.coins || 0) + repType.rewardAmount;
            }
            rewardLabel = repType.rewardLabel;
            
            if (newDm.repeatable.readyCount === 0) {
                newDm.repeatable.typeIndex = Math.floor(Math.random() * window.REPEATABLE_MISSIONS_CONFIG.length);
                newDm.repeatable.progress = 0;
            }
        }
        newProfile.dailyMissions = newDm;
    } else if (isWeekly) {
        const wm = getWeeklyMissions(profile);
        const newWm = { ...wm, progress: { ...wm.progress }, claimed: { ...wm.claimed } };
        const mission = window.WEEKLY_MISSIONS_POOL.find(m => m.id === missionId);
        if (mission && newWm.activeIds.includes(missionId)) {
            const current = newWm.progress[missionId] || 0;
            const claimed = newWm.claimed[missionId] || false;
            if (!claimed && current >= mission.target) {
                newWm.claimed[missionId] = true;
                if (!newProfile.statistics) newProfile.statistics = {};
                if (mission.rewardType === 'gems') {
                    newProfile.gems = (newProfile.gems || 0) + mission.rewardAmount;
                } else if (mission.rewardType === 'gacha_vouchers') {
                    newProfile.gacha_vouchers = (newProfile.gacha_vouchers || 0) + mission.rewardAmount;
                } else if (mission.rewardType === 'coins') {
                    newProfile.coins = (newProfile.coins || 0) + mission.rewardAmount;
                }
                newProfile.statistics.totalWeeklyMissionsCompleted = (newProfile.statistics.totalWeeklyMissionsCompleted || 0) + 1; rewardLabel = mission.rewardLabel;
            }
        }
        newProfile.weeklyMissions = newWm;
    } else {
        const dm = getDailyMissions(profile);
        const newDm = { ...dm, progress: { ...dm.progress }, claimed: { ...dm.claimed }, repeatable: { ...dm.repeatable } };
        const mission = window.DAILY_MISSIONS_POOL.find(m => m.id === missionId);
        if (mission && newDm.activeIds.includes(missionId)) {
            const current = newDm.progress[missionId] || 0;
            const claimed = newDm.claimed[missionId] || false;
            
            if (!claimed && current >= mission.target) {
                newDm.claimed[missionId] = true;
                if (!newProfile.statistics) newProfile.statistics = {};
                if (mission.rewardType === 'gems') {
                    newProfile.gems = (newProfile.gems || 0) + mission.rewardAmount;
                } else if (mission.rewardType === 'gacha_vouchers') {
                    newProfile.gacha_vouchers = (newProfile.gacha_vouchers || 0) + mission.rewardAmount;
                } else if (mission.rewardType === 'coins') {
                    newProfile.coins = (newProfile.coins || 0) + mission.rewardAmount;
                }
                newProfile.statistics.totalDailyMissionsCompleted = (newProfile.statistics.totalDailyMissionsCompleted || 0) + 1; rewardLabel = mission.rewardLabel;
            }
        }
        newProfile.dailyMissions = newDm;
    }

    return { profile: newProfile, rewardLabel };
};

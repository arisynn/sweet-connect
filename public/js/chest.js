const CHEST_TYPES = {
    common: { name: 'Peti Biasa', durationMs: 30 * 60 * 1000, speedUpCost: 5, imgClose: '/assets/chest/closecommon.png', imgOpen: '/assets/chest/opencommon.png' },
    rare: { name: 'Peti Langka', durationMs: 4 * 60 * 60 * 1000, speedUpCost: 40, imgClose: '/assets/chest/closerare.png', imgOpen: '/assets/chest/openrare.png' },
    epic: { name: 'Peti Epik', durationMs: 24 * 60 * 60 * 1000, speedUpCost: 240, imgClose: '/assets/chest/closeepic.png', imgOpen: '/assets/chest/openepic.png' },
};

const getRandomChestType = () => {
    const r = Math.random();
    if (r < 0.1) return 'epic';
    if (r < 0.4) return 'rare';
    return 'common';
};

const initChestProfile = (profile) => {
    let p = { ...profile };
    if (!p.chestSlots) p.chestSlots = [null, null, null];
    else p.chestSlots = [...p.chestSlots];
    if (p.chestProgress === undefined) p.chestProgress = 0;
    return p;
};

const addChestProgress = (profile, points = 1) => {
    let p = initChestProfile(profile);
    
    // Add points
    p.chestProgress += points;
    
    // Process chest earning
    while (p.chestProgress >= 5) {
        const emptyIndex = p.chestSlots.findIndex(slot => slot === null);
        if (emptyIndex !== -1) {
            p.chestSlots[emptyIndex] = {
                id: Date.now().toString() + emptyIndex + Math.random().toString(),
                type: getRandomChestType(),
                startTime: Date.now()
            };
            p.chestProgress -= 5;
        } else {
            // No empty slot, cap at 5 so it's ready when a slot opens
            p.chestProgress = 5;
            break;
        }
    }
    
    // Defensive cap
    if (p.chestProgress > 5) p.chestProgress = 5;
    
    return p;
};

const openChestAction = (profile, slotIndex) => {
    let p = { ...profile };
    p.chestSlots = [...(p.chestSlots || [null, null, null])];
    const chest = p.chestSlots[slotIndex];
    if (!chest) return { profile: p, rewards: {} };

    const typeConfig = CHEST_TYPES[chest.type];
    const now = Date.now();
    if (now - chest.startTime < typeConfig.durationMs) {
        // Not ready yet
        return { profile: p, rewards: null };
    }

    const type = chest.type;
    const rewards = { chestType: type };
    
    if (type === 'common') {
        rewards.coins = Math.floor(Math.random() * (500 - 300 + 1)) + 300;
        rewards.hints = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        rewards.gacha_vouchers = 1;
    } else if (type === 'rare') {
        rewards.coins = Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000;
        rewards.hints = Math.floor(Math.random() * (3 - 2 + 1)) + 2;
        rewards.gems = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        rewards.gacha_vouchers = 3;
    } else if (type === 'epic') {
        rewards.coins = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
        rewards.hints = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
        rewards.gems = Math.floor(Math.random() * (5 - 3 + 1)) + 3;
        rewards.gacha_vouchers = 10;
    }

    if (rewards.coins) p.coins = (p.coins || 0) + rewards.coins;
    if (rewards.gems) p.gems = (p.gems || 0) + rewards.gems;
    if (rewards.hints) p.hints = (p.hints || 0) + rewards.hints;
    if (rewards.gacha_vouchers) p.gacha_vouchers = (p.gacha_vouchers || 0) + rewards.gacha_vouchers;

    p.chestSlots[slotIndex] = null;

    // slot fill if pending
    if (p.chestProgress >= 5) {
        p.chestSlots[slotIndex] = {
            id: Date.now().toString() + slotIndex,
            type: getRandomChestType(),
            startTime: Date.now()
        };
        p.chestProgress -= 5;
    }

    return { profile: p, rewards };
};

window.calculateDynamicSpeedUpCost = (chestType, startTime) => {
    const config = CHEST_TYPES[chestType];
    const passed = Date.now() - startTime;
    const remaining = Math.max(0, config.durationMs - passed);
    if (remaining <= 0) return 0;
    
    const proportion = remaining / config.durationMs;
    const dynamicCost = Math.ceil(config.speedUpCost * proportion);
    
    return Math.max(1, dynamicCost);
};

const calculateDynamicSpeedUpCost = window.calculateDynamicSpeedUpCost;

const speedUpChestAction = (profile, slotIndex) => {
    let p = { ...profile };
    p.chestSlots = [...(p.chestSlots || [null, null, null])];
    const chest = p.chestSlots[slotIndex];
    if (!chest) return { profile: p, success: false };

    const typeConfig = CHEST_TYPES[chest.type];
    const cost = calculateDynamicSpeedUpCost(chest.type, chest.startTime);
    
    if (cost === 0 || (p.gems || 0) >= cost) {
        p.gems -= cost;
        // Make the start time way in the past so it's ready
        p.chestSlots[slotIndex] = {
            ...chest,
            startTime: Date.now() - typeConfig.durationMs - 1000 
        };
        return { profile: p, success: true };
    }
    
    return { profile: p, success: false };
};

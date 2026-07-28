// ===================== SCORE / COIN REWARD =====================

// A. BASE MATCH SCORE
const SCORE_PER_MATCH = 50;

// B. SPEED BONUS
const calculateSpeedBonusMultiplier = (timeSinceLastMatchMs) => {
    if (timeSinceLastMatchMs <= 1000) return 2.5;
    if (timeSinceLastMatchMs <= 2000) return 2.0;
    if (timeSinceLastMatchMs <= 3000) return 1.5;
    if (timeSinceLastMatchMs <= 4500) return 1.2;
    return 1.0;
};

// C. COMBO MULTIPLIER
const calculateComboMultiplier = (comboCount) => {
    if (comboCount <= 1) return 1.0;
    if (comboCount === 2) return 1.5;
    if (comboCount === 3) return 2.0;
    if (comboCount === 4) return 2.5;
    if (comboCount === 5) return 3.0;
    if (comboCount === 6) return 3.5;
    return 4.0; // Max 4.0
};

// D. TIME REMAINING BONUS
const TIME_BONUS_PER_SECOND = 10;
const calculateTimeBonus = (remainingSeconds) => {
    return Math.floor(Math.max(0, remainingSeconds) * TIME_BONUS_PER_SECOND);
};

// E. FLAWLESS BONUS
const FLAWLESS_BONUS_MULTIPLIER = 1.2; // +20%
const calculateFlawlessBonus = (currentScore) => {
    return Math.floor(currentScore * (FLAWLESS_BONUS_MULTIPLIER - 1.0));
};

const applyMatchScore = (currentLevelScore, timeSinceLastMatchMs, comboCount, currentHighestLevelScore) => {
    const speedMult = calculateSpeedBonusMultiplier(timeSinceLastMatchMs);
    const comboMult = calculateComboMultiplier(comboCount);
    
    const gained = Math.floor(SCORE_PER_MATCH * speedMult * comboMult);
    const newScore = currentLevelScore + gained;
    const isNewRecord = newScore > (currentHighestLevelScore || 0);
    
    return { newScore, gained, speedMult, comboMult, isNewRecord };
};

const calculateCoinReward = (score) => Math.floor(score * 0.1);

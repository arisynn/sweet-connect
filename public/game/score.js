// ===================== SCORE / COIN REWARD =====================
const SCORE_PER_MATCH = 10;

// Mirrors the original inline game-over coin reward calculation (Math.floor(score * 0.1)).
const calculateCoinReward = (score) => Math.floor(score * 0.1);

const applyMatchScore = (currentScore, comboBonus, currentBest) => {
    const newScore = currentScore + SCORE_PER_MATCH + (comboBonus || 0);
    const isNewRecord = newScore > (currentBest || 0);
    return { newScore, isNewRecord };
};

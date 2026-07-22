// ===================== SCORE / COIN REWARD =====================
const SCORE_PER_MATCH = 10;
const BEST_SCORE_STORAGE_KEY = 'pkmnBestScore';

// Mirrors the original inline game-over coin reward calculation (Math.floor(score * 0.1)).
const calculateCoinReward = (score) => Math.floor(score * 0.1);

// Mirrors the exact inline logic that used to live inside handleTileClick's
// setScore callback: adds one match's worth of score (plus any combo bonus) and
// checks/updates the best score kept in localStorage.
const applyMatchScore = (currentScore, comboBonus) => {
    const newScore = currentScore + SCORE_PER_MATCH + (comboBonus || 0);
    const best = parseInt(localStorage.getItem(BEST_SCORE_STORAGE_KEY) || '0');
    const isNewRecord = newScore > best;
    if (isNewRecord) localStorage.setItem(BEST_SCORE_STORAGE_KEY, newScore);
    return { newScore, isNewRecord };
};

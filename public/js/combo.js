// ===================== COMBO SYSTEM =====================
// Matches made within this window of each other count toward the same combo streak.
const COMBO_WINDOW_MS = 3500;
const COMBO_BONUS = { 2: 5, 3: 10, 4: 20 };

const getComboBonus = (comboCount) => {
    if (comboCount >= 4) return COMBO_BONUS[4];
    if (comboCount === 3) return COMBO_BONUS[3];
    if (comboCount === 2) return COMBO_BONUS[2];
    return 0;
};

window.RewardEngine = {
    processWin: (profile, { isMultiplayer, isFlawless, timeElapsed, progress, highestCombo, isWinner }) => {
        let p = { ...profile };

        // 1. Progress Peti
        if (typeof addChestProgress === 'function') {
            let chestPoints = isMultiplayer ? (isWinner ? 4 : 1) : 2; // Base points
            if (isFlawless) chestPoints += 1;
            
            if (highestCombo >= 15) chestPoints += 2;
            else if (highestCombo >= 8) chestPoints += 1;
            
            if (timeElapsed && timeElapsed < 45000) chestPoints += 1; // Under 45 seconds
            
            p = addChestProgress(p, chestPoints);
        }

        // 2. Daily Mission & Achievements
        if (typeof updateMissions === 'function') {
            p = updateMissions(p, 'winLevel', 1);
            if (isFlawless) p = updateMissions(p, 'flawless', 1);
            if (progress >= 50) p = updateMissions(p, 'survivor', 1);
            if (timeElapsed && timeElapsed < 45000) p = updateMissions(p, 'fast_clear', 1);
            
            if (isMultiplayer) {
                // If there are specific multiplayer missions, they can be added here
                p = updateMissions(p, 'play_multiplayer', 1);
                if (isWinner) p = updateMissions(p, 'win_multiplayer', 1);
            }
        }

        return p;
    }
};

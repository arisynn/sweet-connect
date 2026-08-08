window.RewardEngine = {
    processWin: (profile, { isMultiplayer, isFlawless, timeElapsed, progress, highestCombo, isWinner }) => {
        let p = { ...profile };

        // 1. Progress Peti
        if (typeof window.addChestProgress === 'function') {
            let chestPoints = isMultiplayer ? (isWinner ? 4 : 1) : 2; // Base points
            if (isFlawless) chestPoints += 1;
            
            if (highestCombo >= 15) chestPoints += 2;
            else if (highestCombo >= 8) chestPoints += 1;
            
            if (timeElapsed && timeElapsed < 45000) chestPoints += 1; // Under 45 seconds
            
            p = window.addChestProgress(p, chestPoints);
        }

        // 2. Daily Mission & Achievements
        if (typeof window.updateMissions === 'function') {
            p = window.updateMissions(p, 'winLevel', 1);
            if (isFlawless) p = window.updateMissions(p, 'flawless', 1);
            if (progress >= 50) p = window.updateMissions(p, 'survivor', 1);
            if (timeElapsed && timeElapsed < 45000) p = window.updateMissions(p, 'fast_clear', 1);
            
            if (isMultiplayer) {
                // If there are specific multiplayer missions, they can be added here
                p = window.updateMissions(p, 'play_multiplayer', 1);
                if (isWinner) p = window.updateMissions(p, 'win_multiplayer', 1);
            }
        }

        return p;
    }
};

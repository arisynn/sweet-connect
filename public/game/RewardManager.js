window.useRewardManager = ({ profile, setProfile, playerName, setSweetMessage }) => {
    const handleClaimDaily = async (missionId, isWeekly) => {
        const { profile: newProfile, rewardLabel } = window.claimMissionReward(profile, missionId, isWeekly);
        setProfile(newProfile); await window.saveProfile(playerName, newProfile);
        window.AudioEngine.winPrize();
        setSweetMessage(`+ ${rewardLabel}`);
    };

    const handleClaimAchievement = async (achievement) => {
        const newProfile = window.applyAchievementReward(profile, achievement);
        setProfile(newProfile); await window.saveProfile(playerName, newProfile);
        setSweetMessage(`Klaim: ${achievement.title}`);
    };

    const handleClaimMilestone = async (milestone) => {
        const newProfile = window.applyMilestoneReward(profile, milestone);
        setProfile(newProfile); await window.saveProfile(playerName, newProfile);
        setSweetMessage(`Klaim Level ${milestone.level}`);
    };

    const handleMysteryGiftComplete = async (p, boxesOpened = 1) => {
        let newProfile = window.updateStatistics(p, { mysteryBoxOpenedDelta: boxesOpened });
        newProfile = window.updateMissions(newProfile, 'openMystery', boxesOpened);
        setProfile(newProfile); await window.saveProfile(playerName, newProfile);
    };

    return { handleClaimDaily, handleClaimAchievement, handleClaimMilestone, handleMysteryGiftComplete };
};

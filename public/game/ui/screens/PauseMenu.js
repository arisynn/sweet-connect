const PauseMenu = () => {
    const ctx = React.useContext(GameContext);
    const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError, hints, shuffles, handleLeaveRoom, flushStats, setProfile, saveProfile } = ctx;
    return (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100] px-6">
                        <h2 className="text-2xl font-black theme-text mb-8 tracking-widest uppercase">Dijeda</h2>
                        <button onClick={() => { window.history.back(); }} className="btn-modern bg-gray-900 text-white w-full max-w-[260px] py-4 rounded-xl font-bold mb-4 shadow-md">Lanjutkan</button>
                        <button onClick={() => {
                            if (window.isMultiplayerMatch) {
                                handleLeaveRoom();
                            } else {
                                const statsProfile = flushStats(profile, { scoreAchieved: score, activeSession: null });
                                const newProfile = { ...statsProfile, hp, hints, shuffles, currentLevel: level, currentScore: score };
                                setProfile(newProfile); saveProfile(playerName, newProfile);
                            }
                            AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN');
                        }} className="btn-modern bg-gray-100 text-gray-600 w-full max-w-[260px] py-4 rounded-xl font-bold">Keluar ke Menu</button>
                    </div>
    );
};

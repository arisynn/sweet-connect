const LoadingOverlay = () => {
    const ctx = React.useContext(GameContext);
    const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError } = ctx;
    return (
        <div className="absolute inset-0 theme-bg flex flex-col items-center justify-center z-[100]">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-pink-500 rounded-full animate-spin mb-6"></div>
                        <h2 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest">Menyiapkan Meja</h2>
                        <div className="w-3/4 max-w-[200px] bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
    );
};

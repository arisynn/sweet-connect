const CountdownOverlay = () => {
    const ctx = React.useContext(GameContext);
    const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError, countdown } = ctx;
    return (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
                        <div key={countdown} style={{ animation: 'countdownPop 0.5s ease-out forwards', fontSize: countdown === 'GO!' ? '4rem' : '6rem', color: countdown === 'GO!' ? '#10b981' : 'white', fontWeight: 900, display: 'inline-block' }}>
                            {countdown}
                        </div>
                    </div>
    );
};

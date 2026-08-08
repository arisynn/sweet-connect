// ===================== MAIN APP =====================

const App = () => {
    const { isStandalone, setIsStandalone, deferredPrompt } = window.usePWAManager();
    const { 
        gameState, setGameState, setGameStateInternal, gameStateRef,
        showSettings, setShowSettings, showSettingsRef,
        showCustomThemeEditor, setShowCustomThemeEditor, showCustomThemeEditorRef,
        showCloudRecovery, setShowCloudRecovery, showCloudRecoveryRef,
        showSyncLog, setShowSyncLog, showSyncLogRef,
        historyDepthRef, backPressTimeRef, isProgrammaticBackRef,
        lobbyBadgeText, splashText, setSplashText
    } = window.useGameStateManager();
    
    const [playerName, setPlayerName] = React.useState(() => window.AuthEngine?.getLoggedInUser() || '');
    const [loginError, setLoginError] = React.useState('');
    const [isLoadingProfile, setIsLoadingProfile] = React.useState(false);
    
    // Cloud Sync State
    const [syncStatus, setSyncStatus] = React.useState('Connected');
    const [syncLogs, setSyncLogs] = React.useState([]);
    const [localRecoveryProfile, setLocalRecoveryProfile] = React.useState(null);
    
    React.useEffect(() => {
        const handler = (e) => {
            const { status, action, result } = e.detail;
            const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setSyncLogs(prev => [`${time} - ${action}: ${result}`, ...prev].slice(0, 20));
            if (status) setSyncStatus(status);
        };
        const engineHandler = (e) => {
            const { module, message, data } = e.detail;
            const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            let logMsg = `${time} - [${module}] ${message}`;
            if (data) {
                 if (typeof data === 'string') logMsg += ' ' + data;
                 else logMsg += ' ' + JSON.stringify(data);
            }
            setSyncLogs(prev => [logMsg, ...prev].slice(0, 20));
        };
        window.addEventListener('syncLog', handler);
        window.addEventListener('engineLog', engineHandler);
        const clearHandler = () => setSyncLogs([]);
        window.addEventListener('clearLogs', clearHandler);
        return () => {
             window.removeEventListener('syncLog', handler);
             window.removeEventListener('engineLog', engineHandler);
             window.removeEventListener('clearLogs', clearHandler);
        };
    }, []);
    
    const [profile, setProfile] = React.useState(() => window.getDefaultProfile());
    const profileRef = React.useRef(profile);
    React.useEffect(() => { profileRef.current = profile; }, [profile]);
    
    const [activeTheme, setActiveTheme] = React.useState(() => window.getInitialTheme());
    const activeThemeRef = React.useRef(activeTheme);
    React.useEffect(() => { activeThemeRef.current = activeTheme; }, [activeTheme]);

    const core = window.useGameCore({ profile, setProfile, profileRef, playerName, gameState, gameStateRef });
    const matchEngine = window.useMatchEngine({
        profile, setProfile, profileRef, playerName,
        gameState, setGameState, gameStateRef,
        activeThemeRef, core
    });
    
    const { 
        startupStep, startupMessage, startupProgress,
        runStartup, finishStartup, handleLoginSubmit, handleLogout, handleClaimLoginReward 
    } = window.useStartupManager({ 
        profile, setProfile, playerName, setPlayerName, setLoginError,
        gameState, setGameState, setGameStateInternal,
        setActiveTheme, setScore: core.setScore, setLevel: core.setLevel, setHp: core.setHp, setHints: core.setHints, setShuffles: core.setShuffles, setBoard: core.setBoard, setShowSettings, historyDepthRef
    });

    const { handleBuyHpInGame, handleBuyStore, handleSellStore } = window.useShopManager({ profile, setProfile, playerName, hp: core.hp, setHp: core.setHp });
    const { handleClaimDaily, handleClaimAchievement, handleClaimMilestone, handleMysteryGiftComplete } = window.useRewardManager({ profile, setProfile, playerName, setSweetMessage: core.setSweetMessage });

    // ===================== PWA GUARD =====================
    if (!isStandalone) {
        return <InstallPrompt deferredPrompt={deferredPrompt} onSkip={() => setIsStandalone(true)} />;
    }
    
    const ctxValue = {
        gameState, setGameState, activeTheme, activeThemeRef, gameStateRef, isMuted: core.isMuted, setIsMuted: core.setIsMuted, isStandalone, deferredPrompt, playerName, setPlayerName, loginError, setLoginError, lobbyBadgeText, isLoadingProfile, syncStatus, showSyncLog, setShowSyncLog, syncLogs, startupStep, startupMessage, startupProgress, showCloudRecovery, localRecoveryProfile, setShowCloudRecovery, setActiveTheme, finishStartup, getDefaultProfile: window.getDefaultProfile, profile, setProfile, showSettings, setShowSettings, showCustomThemeEditor, setShowCustomThemeEditor, splashText, handleLoginSubmit, handleLogout, handleBuyHpInGame, handleBuyStore, handleSellStore, handleClaimDaily, handleClaimAchievement, handleClaimMilestone, handleMysteryGiftComplete, handleClaimLoginReward, THEMES: window.THEMES, formatNumber: window.formatNumber, calculateCoinReward: window.calculateCoinReward, AudioEngine: window.AudioEngine, saveProfile: window.saveProfile, getSecondsLeft: window.getSecondsLeft, window, ...core, ...matchEngine
    };

    return (
        <GameContext.Provider value={ctxValue}>
            <GameUI />
            <DialogManager />
            <ToastManager />
        </GameContext.Provider>
    );
};

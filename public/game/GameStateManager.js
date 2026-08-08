window.useGameStateManager = () => {
    const { useState, useEffect, useRef, useCallback, useMemo } = React;
    const [gameState, setGameStateInternal] = useState(() => window.AuthEngine?.validateSession() ? 'STARTUP' : 'LOGIN');
    const gameStateRef = useRef(gameState);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    const historyDepthRef = useRef(0);
    const backPressTimeRef = useRef(0);
    const isProgrammaticBackRef = useRef(false);

    const [showSettings, setShowSettings] = useState(false);
    const showSettingsRef = useRef(false);
    useEffect(() => { showSettingsRef.current = showSettings; }, [showSettings]);

    const [showCustomThemeEditor, setShowCustomThemeEditor] = useState(false);
    const showCustomThemeEditorRef = useRef(false);
    useEffect(() => { showCustomThemeEditorRef.current = showCustomThemeEditor; }, [showCustomThemeEditor]);

    const [showCloudRecovery, setShowCloudRecovery] = useState(false);
    const showCloudRecoveryRef = useRef(false);
    useEffect(() => { showCloudRecoveryRef.current = showCloudRecovery; }, [showCloudRecovery]);

    const [showSyncLog, setShowSyncLog] = useState(false);
    const showSyncLogRef = useRef(false);
    useEffect(() => { showSyncLogRef.current = showSyncLog; }, [showSyncLog]);

    const setGameState = useCallback((newState) => {
        if (newState === gameStateRef.current) return;

        if (newState === 'LOBBY_MAIN' && historyDepthRef.current > 0) {
            isProgrammaticBackRef.current = true;
            window.history.go(-historyDepthRef.current);
            
            setTimeout(() => {
                if (isProgrammaticBackRef.current) {
                    isProgrammaticBackRef.current = false;
                    window.history.replaceState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0 }, '', '');
                    setGameStateInternal('LOBBY_MAIN');
                    historyDepthRef.current = 0;
                }
            }, 150);
            return;
        }

        const navigableStates = ['SHOP', 'THEMES', 'ROULETTE', 'DAILY_REWARD', 'ACHIEVEMENTS', 'STATISTICS', 'LOGIN_REWARD', 'MULTIPLAYER_LOBBY', 'PLAYING', 'PAUSED'];
        
        if (navigableStates.includes(newState)) {
            historyDepthRef.current += 1;
            window.history.pushState({ isAppHistory: true, gameState: newState, depth: historyDepthRef.current }, '', '');
        } else {
            window.history.replaceState({ isAppHistory: true, gameState: newState, depth: historyDepthRef.current }, '', '');
        }
        
        setGameStateInternal(newState);
    }, []);

    useEffect(() => {
        if (!window.history.state || !window.history.state.isAppHistory) {
            window.history.replaceState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0, isDummy: true }, '', '');
            window.history.pushState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0 }, '', ''); 
        } else {
            historyDepthRef.current = window.history.state.depth || 0;
            if (historyDepthRef.current === 0) {
                window.history.replaceState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0, isDummy: true }, '', '');
                window.history.pushState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0 }, '', ''); 
            }
        }

        const handlePopState = (event) => {
            if (!window.AuthEngine?.validateSession()) {
                if (gameStateRef.current === 'LOGIN') {
                    const now = Date.now();
                    if (now - backPressTimeRef.current < 2000) {
                        window.history.back();
                    } else {
                        if (typeof window.Dialog !== 'undefined' && window.Dialog.showToast) {
                            window.Dialog.showToast("Tekan sekali lagi untuk keluar.");
                        }
                        backPressTimeRef.current = now;
                        window.history.pushState({ isAppHistory: true, gameState: 'LOGIN', depth: 0 }, '', '');
                    }
                    return;
                } else {
                    setGameStateInternal('LOGIN');
                    window.history.pushState({ isAppHistory: true, gameState: 'LOGIN', depth: 0 }, '', '');
                    return;
                }
            }

            if (window.PopupManager && window.PopupManager.handlePopState()) {
                return;
            }
            if (isProgrammaticBackRef.current) {
                isProgrammaticBackRef.current = false;
                historyDepthRef.current = 0;
                setGameStateInternal('LOBBY_MAIN');
                if (!event.state || event.state.isDummy) {
                    window.history.pushState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0 }, '', '');
                }
                return;
            }

            if (window.isGameLocked) {
                window.history.pushState({ isAppHistory: true, gameState: gameStateRef.current, depth: historyDepthRef.current }, '', '');
                if (window.Dialog && window.Dialog.showToast) {
                    window.Dialog.showToast(window.gameLockedMessage || "Selesaikan permainan terlebih dahulu.");
                }
                return;
            }

            if (showSyncLogRef.current) {
                setShowSyncLog(false);
                setShowSettings(true);
                return;
            }
            if (showCustomThemeEditorRef.current) {
                setShowCustomThemeEditor(false);
                setShowSettings(true);
                return;
            }
            if (showCloudRecoveryRef.current) {
                setShowCloudRecovery(false);
                return;
            }
            if (showSettingsRef.current) {
                setShowSettings(false);
                return;
            }

            if (gameStateRef.current === 'PLAYING') {
                const newDepth = (event.state && typeof event.state.depth === 'number' ? event.state.depth : 0) + 1;
                historyDepthRef.current = newDepth;
                window.history.pushState({ isAppHistory: true, gameState: 'PAUSED', depth: newDepth }, '', '');
                setGameStateInternal('PAUSED');
                if (typeof window.AudioEngine !== 'undefined') window.AudioEngine.uiOpen();
                return;
            }

            if (gameStateRef.current === 'PAUSED') {
                const newDepth = (event.state && typeof event.state.depth === 'number' ? event.state.depth : 0) + 1;
                historyDepthRef.current = newDepth;
                window.history.pushState({ isAppHistory: true, gameState: 'PLAYING', depth: newDepth }, '', '');
                setGameStateInternal('PLAYING');
                if (typeof window.AudioEngine !== 'undefined') window.AudioEngine.uiStartGame();
                return;
            }

            if (gameStateRef.current === 'LOBBY_MAIN' || gameStateRef.current === 'LOGIN') {
                const now = Date.now();
                if (now - backPressTimeRef.current < 2000) {
                    window.history.back(); 
                } else {
                    if (typeof window.Dialog !== 'undefined' && window.Dialog.showToast) {
                        window.Dialog.showToast("Tekan sekali lagi untuk keluar.");
                    }
                    backPressTimeRef.current = now;
                    window.history.pushState({ isAppHistory: true, gameState: gameStateRef.current, depth: historyDepthRef.current || 0 }, '', '');
                }
                return;
            }

            if (event.state && typeof event.state.depth === 'number') {
                historyDepthRef.current = event.state.depth;
                if (event.state.gameState === 'STARTUP' || event.state.gameState === 'LOGIN') {
                    setGameStateInternal('LOBBY_MAIN');
                    window.history.replaceState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0 }, '', '');
                } else {
                    setGameStateInternal(event.state.gameState || 'LOBBY_MAIN');
                }
            } else {
                historyDepthRef.current = 0;
                setGameStateInternal('LOBBY_MAIN');
                window.history.replaceState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0 }, '', '');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []); 

    const lobbyBadgeText = useMemo(() => {
        if (gameState === 'LOBBY_MAIN') {
            return window.BADGE_TEXTS[Math.floor(Math.random() * window.BADGE_TEXTS.length)];
        }
        return "";
    }, [gameState]);

    const [splashText, setSplashText] = useState(window.SPLASH_TEXTS ? window.SPLASH_TEXTS[0] : "");
    useEffect(() => {
        if (gameState === 'LOBBY_MAIN' && window.SPLASH_TEXTS) {
            setSplashText(window.SPLASH_TEXTS[Math.floor(Math.random() * window.SPLASH_TEXTS.length)]);
        }
    }, [gameState]);
    
    useEffect(() => {
        const gameStates = ['LOADING_BOARD', 'COUNTDOWN', 'PLAYING', 'PAUSED', 'GAMEOVER', 'WON'];
        if (gameStates.includes(gameState)) {
            if (typeof window.AudioEngine?.playGameBgm === 'function') window.AudioEngine.playGameBgm();
        } else {
            if (typeof window.AudioEngine?.playMenuBgm === 'function') window.AudioEngine.playMenuBgm();
        }
    }, [gameState]);

    useEffect(() => {
        const handleEditCustomTheme = () => { setShowCustomThemeEditor(true); window.history.pushState({ isAppHistory: true, modal: 'CUSTOM_THEME' }, '', ''); };
        window.addEventListener('editCustomTheme', handleEditCustomTheme);
        return () => window.removeEventListener('editCustomTheme', handleEditCustomTheme);
    }, []);

    return { 
        gameState, setGameState, setGameStateInternal, gameStateRef,
        showSettings, setShowSettings, showSettingsRef,
        showCustomThemeEditor, setShowCustomThemeEditor, showCustomThemeEditorRef,
        showCloudRecovery, setShowCloudRecovery, showCloudRecoveryRef,
        showSyncLog, setShowSyncLog, showSyncLogRef,
        historyDepthRef, backPressTimeRef, isProgrammaticBackRef,
        lobbyBadgeText, splashText, setSplashText
    };
};

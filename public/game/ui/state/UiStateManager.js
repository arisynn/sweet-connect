const useUiState = () => {    
    const { useState, useEffect, useRef } = React;
    const ctx = React.useContext(GameContext);
    const { profile, setProfile, hp, gameState, setGameState, playerName, prepareLevel, activeThemeRef, activeTheme, progress } = ctx;
    
    // Pass progress inside a ref as it updates frequently
    const progressRef = useRef(progress);
    useEffect(() => { progressRef.current = progress; }, [progress]);
    ctx.progressRef = progressRef;

    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    const [regenTimeLeft, setRegenTimeLeft] = useState(null);

    const multiplayerProps = typeof useMultiplayer !== "undefined" ? useMultiplayer(ctx) : {};
    if (multiplayerProps.handleCancelWager) {
        window.handleCancelWager = multiplayerProps.handleCancelWager;
    }

    // Keep handleMultiplayerEnd here so it can use setGameState if needed, though it currently does nothing
    useEffect(() => {
        window.handleMultiplayerEnd = () => {
            // Keep gameState as PLAYING to show result over the board
        };
    }, []);

    // Timer for Match Time
    useEffect(() => {
        let timer;
        if (multiplayerProps.multiplayerState === 'PLAYING' && multiplayerProps.roomData?.startAt) {
            timer = setInterval(() => {
                multiplayerProps.setMatchTime(Math.max(0, Math.floor((Date.now() - multiplayerProps.roomData.startAt) / 1000)));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [multiplayerProps.multiplayerState, gameState, multiplayerProps.roomData?.startAt]);

    // Other non-multiplayer effects
    useEffect(() => {
        if (hp >= 5 || !profile?.lastHpRegenTime) {
            setRegenTimeLeft(null);
            return;
        }
        
        const REGEN_TIME_MS = 15 * 60 * 1000;
        
        const updateTimer = () => {
            const now = Date.now();
            const elapsed = now - profile.lastHpRegenTime;
            const timeLeft = Math.max(0, REGEN_TIME_MS - (elapsed % REGEN_TIME_MS));
            setRegenTimeLeft(timeLeft);
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [profile?.lastHpRegenTime, hp]);

    const formatRegenTime = (ms) => {
        if (ms === null) return "";
        const totalSeconds = Math.floor(ms / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (gameState === 'LOBBY_MAIN' && profile) {
            const check = () => {
                const loginStatus = window.checkLoginRewardStatus(profile);
                if (loginStatus.canClaim) {
                    setGameState('LOGIN_REWARD');
                }
            };
            check();
            const checkMidnight = setInterval(check, 60000);
            return () => clearInterval(checkMidnight);
        }
    }, [gameState, profile, setGameState]);

    useEffect(() => {
        if (gameState === 'LOBBY' && profile && window.checkNotificationPromptNeeded && window.checkNotificationPromptNeeded()) {
            const lastPrompt = profile.lastNotificationPermissionPrompt || 0;
            const now = Date.now();
            if (now - lastPrompt >= 24 * 60 * 60 * 1000) {
                setShowNotificationPrompt(true);
            }
        }
    }, [gameState, profile]);

    return { 
        showNotificationPrompt, setShowNotificationPrompt, 
        regenTimeLeft, setRegenTimeLeft, 
        formatRegenTime,
        ...multiplayerProps 
    };
};

window.useGameCore = ({ profile, setProfile, profileRef, playerName, gameState, gameStateRef }) => {
    const { useState, useEffect, useRef, useCallback } = React;
    const [board, setBoard] = useState([]);
    const [level, setLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [hp, setHp] = useState(3);
    const [hints, setHints] = useState(3);
    const [shuffles, setShuffles] = useState(3);
    const [progress, setProgress] = useState(100); 
    const [selectedTile, setSelectedTile] = useState(null);
    const [matchedTiles, setMatchedTiles] = useState([]); 
    const [hintActiveTiles, setHintActiveTiles] = useState([]); 
    const [activePath, setActivePath] = useState(null);
    const [hintPath, setHintPath] = useState(null); 
    const [wrongTile, setWrongTile] = useState(null);
    const [wrongConnectionPenalty, setWrongConnectionPenalty] = useState(null);
    const [showTimerAdd, setShowTimerAdd] = useState(false);
    const [showTimeoutFlash, setShowTimeoutFlash] = useState(false);
    const [showBoardClear, setShowBoardClear] = useState(false);
    const [isMuted, setIsMuted] = useState(() => (window.AudioEngine ? (window.AudioEngine.getSettings().muteMusic && window.AudioEngine.getSettings().muteSfx) : localStorage.getItem('pkmnIsMuted') === 'true'));
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [levelStartTime, setLevelStartTime] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const [comboDisplay, setComboDisplay] = useState(null);
    const [sweetMessage, setSweetMessage] = useState('');

    const boardRef = useRef(board);
    const matchesPendingRef = useRef(0);
    const combosPendingRef = useRef(0);
    const hintsPendingRef = useRef(0);
    const shufflesPendingRef = useRef(0);
    const highestComboPendingRef = useRef(0);
    const wrongPendingRef = useRef(0);
    const playTimeAccumRef = useRef(0);
    const lastMatchTimeRef = useRef(0);
    const comboCountRef = useRef(0);
    const missionProgressRef = useRef({ combo: 0, addCombo: 0, match: 0, hints: 0, shuffles: 0, score: 0 });

    const levelRef = useRef(level);
    const scoreRef = useRef(score);
    const hpRef = useRef(hp);
    const hintsRef = useRef(hints);
    const shufflesRef = useRef(shuffles);
    const progressRef = useRef(progress);
    const matchedTilesRef = useRef(matchedTiles);
    const selectedTileRef = useRef(selectedTile);

    useEffect(() => { levelRef.current = level; }, [level]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { hpRef.current = hp; }, [hp]);
    useEffect(() => { hintsRef.current = hints; }, [hints]);
    useEffect(() => { shufflesRef.current = shuffles; }, [shuffles]);
    useEffect(() => { progressRef.current = progress; }, [progress]);
    useEffect(() => { matchedTilesRef.current = matchedTiles; }, [matchedTiles]);
    useEffect(() => { selectedTileRef.current = selectedTile; }, [selectedTile]);
    useEffect(() => { boardRef.current = board; }, [board]);

    useEffect(() => {
        const handleExternalUpdate = (e) => {
            const newProfile = e.detail.profile;
            if (newProfile) {
                setProfile(newProfile);
                setSweetMessage('Profil diperbarui dari Cloud!');
            }
        };
        window.addEventListener('profileUpdatedExternally', handleExternalUpdate);
        return () => window.removeEventListener('profileUpdatedExternally', handleExternalUpdate);
    }, [setProfile]);

    const saveCurrentSession = useCallback((returnSession = false) => {
        return null;
    }, []);

    const flushStats = useCallback((baseProfile, extra = {}) => {
        const patch = { 
            matchesDelta: matchesPendingRef.current, 
            playTimeDeltaMs: playTimeAccumRef.current, 
            hintsUsedDelta: hintsPendingRef.current,
            shufflesUsedDelta: shufflesPendingRef.current,
            highestCombo: highestComboPendingRef.current,
            wrongDelta: wrongPendingRef.current,
            ...extra 
        };
        let p = window.updateStatistics(baseProfile, patch);
        
        matchesPendingRef.current = 0; 
        playTimeAccumRef.current = 0;
        combosPendingRef.current = 0; hintsPendingRef.current = 0; shufflesPendingRef.current = 0; highestComboPendingRef.current = 0; wrongPendingRef.current = 0;
        return p;
    }, []);

    useEffect(() => {
        window.flushStats = flushStats;
        return () => { delete window.flushStats; };
    }, [flushStats]);

    useEffect(() => {
        const handleVisibilityChange = () => { 
            if (document.hidden) {
                const sessionData = saveCurrentSession(true);
                const p = flushStats(profile, sessionData ? { activeSession: sessionData } : {});
                setProfile(p);
                if (playerName && window.saveProfileKeepalive) window.saveProfileKeepalive(playerName, p);
            }
        };
        const handleBeforeUnload = () => {
            const sessionData = saveCurrentSession(true);
            const p = flushStats(profile, sessionData ? { activeSession: sessionData } : {});
            if (playerName && window.saveProfileKeepalive) window.saveProfileKeepalive(playerName, p);
        };
        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        const saveTimer = setInterval(() => saveCurrentSession(), 2000);
        
        const profileSaveTimer = setInterval(() => {
            if (gameStateRef.current === 'PLAYING') {
                const sessionData = saveCurrentSession(true);
                const p = flushStats(profile, sessionData ? { activeSession: sessionData } : {});
                setProfile(p);
                if (playerName) window.saveProfile(playerName, p);
            }
        }, 20000);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearInterval(saveTimer);
            clearInterval(profileSaveTimer);
        };
    }, [saveCurrentSession, flushStats, profile, playerName, gameStateRef, setProfile]);

    useEffect(() => {
        if (!playerName) return;
        const REGEN_TIME_MS = 15 * 60 * 1000;
        
        const checkHpRegen = () => {
            const currentProfile = profileRef.current;
            const currentHp = hpRef.current;
            
            if (!currentProfile) return;
            
            if (currentHp >= 5) {
                if (currentProfile.lastHpRegenTime) {
                    const newProfile = { ...currentProfile, lastHpRegenTime: null };
                    setProfile(newProfile);
                    window.saveProfile(playerName, newProfile);
                }
                return;
            }

            if (!currentProfile.lastHpRegenTime) {
                const newProfile = { ...currentProfile, lastHpRegenTime: Date.now() };
                setProfile(newProfile);
                window.saveProfile(playerName, newProfile);
                return;
            }

            const now = Date.now();
            const elapsed = now - currentProfile.lastHpRegenTime;
            const hpToAdd = Math.floor(elapsed / REGEN_TIME_MS);
            
            if (hpToAdd > 0) {
                const newHp = Math.min(5, currentHp + hpToAdd);
                const remainderMs = elapsed % REGEN_TIME_MS;
                const newLastRegen = newHp >= 5 ? null : (now - remainderMs);
                
                setHp(newHp);
                const newProfile = { ...currentProfile, hp: newHp, lastHpRegenTime: newLastRegen };
                setProfile(newProfile);
                window.saveProfile(playerName, newProfile);
            }
        };
        
        checkHpRegen();
        const interval = setInterval(checkHpRegen, 5000);
        return () => clearInterval(interval);
    }, [playerName, profileRef, hpRef, setProfile]);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            const sessionData = saveCurrentSession();
            if (sessionData && playerName) {
                setProfile(p => {
                    if (!p) return p;
                    const newP = { ...p, activeSession: sessionData };
                    window.saveProfile(playerName, newP);
                    return newP;
                });
            }
        }
    }, [board, score, hp, hints, shuffles, matchedTiles, selectedTile, gameState, saveCurrentSession, playerName, setProfile]);

    useEffect(() => {
        if (gameState !== 'PLAYING' || window.isMultiplayerMatch) return;
        const t = setInterval(() => { playTimeAccumRef.current += 1000; }, 1000);
        return () => clearInterval(t);
    }, [gameState]);

    return {
        board, setBoard, level, setLevel, score, setScore, hp, setHp, hints, setHints, shuffles, setShuffles,
        progress, setProgress, selectedTile, setSelectedTile, matchedTiles, setMatchedTiles, hintActiveTiles, setHintActiveTiles,
        activePath, setActivePath, hintPath, setHintPath, wrongTile, setWrongTile, wrongConnectionPenalty, setWrongConnectionPenalty,
        showTimerAdd, setShowTimerAdd, showTimeoutFlash, setShowTimeoutFlash, showBoardClear, setShowBoardClear,
        isMuted, setIsMuted, isNewRecord, setIsNewRecord, levelStartTime, setLevelStartTime, countdown, setCountdown,
        comboDisplay, setComboDisplay, sweetMessage, setSweetMessage, boardRef, matchesPendingRef, combosPendingRef,
        hintsPendingRef, shufflesPendingRef, highestComboPendingRef, wrongPendingRef, playTimeAccumRef, lastMatchTimeRef,
        comboCountRef, missionProgressRef, flushStats, saveCurrentSession
    };
};

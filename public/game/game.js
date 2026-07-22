// ===================== MAIN APP =====================
const SPLASH_TEXTS = ["Senyum terus ya", "Kamu hebat hari ini", "Bisa karena terbiasa", "I'm proud of you", "Cantik banget hari ini", "Jangan lupa istirahat", "Dunia lebih indah ada kamu", "Tetap semangat manis", "You are my sunshine", "Bahagia selalu ya"];
const BADGE_TEXTS = ["Semangat sayang", "I love you", "Kamu pasti bisa", "Miss you", "Pinter banget", "Have fun sayang", "Kangen kamu", "My only one", "Ayo main"];

const App = () => {
    const [isStandalone, setIsStandalone] = useState(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('pkmnPlayerName') || '');
    const [loginError, setLoginError] = useState('');
    const [gameState, setGameState] = useState('LOGIN'); 
    
    const lobbyBadgeText = useMemo(() => {
        if (gameState === 'LOBBY_MAIN') {
            return BADGE_TEXTS[Math.floor(Math.random() * BADGE_TEXTS.length)];
        }
        return "";
    }, [gameState]);

    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    
    // Cloud Sync State
    const [syncStatus, setSyncStatus] = useState('Connected');
    const [syncLogs, setSyncLogs] = useState([]);
    const [showSyncLog, setShowSyncLog] = useState(false);
    const [startupStep, setStartupStep] = useState(0);
    const [startupMessage, setStartupMessage] = useState('');
    const [startupProgress, setStartupProgress] = useState(0);
    const [showCloudRecovery, setShowCloudRecovery] = useState(false);
    const [localRecoveryProfile, setLocalRecoveryProfile] = useState(null);
    
    useEffect(() => {
        const handler = (e) => {
            const { status, action, result } = e.detail;
            const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setSyncLogs(prev => [`${time} - ${action}: ${result}`, ...prev].slice(0, 50));
            setSyncStatus(status);
        };
        window.addEventListener('syncLog', handler);
        return () => window.removeEventListener('syncLog', handler);
    }, []);

    
    // Profile sekarang menyimpan semua state progres agar tidak hilang
    const [profile, setProfile] = useState(() => getDefaultProfile());
    
    const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('pkmnTheme') || 'sweets');
    const [board, setBoard] = useState([]);
    
    // State in-game
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
    const [wrongTile, setWrongTile] = useState(null);
    const [wrongConnectionPenalty, setWrongConnectionPenalty] = useState(null);

    const [showTimerAdd, setShowTimerAdd] = useState(false);
    const [showTimeoutFlash, setShowTimeoutFlash] = useState(false);
    const [showBoardClear, setShowBoardClear] = useState(false);
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('pkmnMuted') === 'true');
    const [isNewRecord, setIsNewRecord] = useState(false);
    const [levelStartTime, setLevelStartTime] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const [alertData, setAlertData] = useState(null);
    const [splashText, setSplashText] = useState(SPLASH_TEXTS[0]);
    const [showCustomThemeEditor, setShowCustomThemeEditor] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Combo, sweet message & progress-reward feature state
    const [comboDisplay, setComboDisplay] = useState(null);
    const [sweetMessage, setSweetMessage] = useState('');

    const boardRef = useRef(board);
    const activeThemeRef = useRef(activeTheme);
    const gameStateRef = useRef(gameState);
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

    // Refs for auto-save state
    const levelRef = useRef(level);
    const scoreRef = useRef(score);
    const hpRef = useRef(hp);
    const hintsRef = useRef(hints);
    const shufflesRef = useRef(shuffles);
    const progressRef = useRef(progress);
    const matchedTilesRef = useRef(matchedTiles);
    const selectedTileRef = useRef(selectedTile);

    // Sync refs
    useEffect(() => { levelRef.current = level; }, [level]);
    useEffect(() => { scoreRef.current = score; }, [score]);
    useEffect(() => { hpRef.current = hp; }, [hp]);
    useEffect(() => { hintsRef.current = hints; }, [hints]);
    useEffect(() => { shufflesRef.current = shuffles; }, [shuffles]);
    useEffect(() => { progressRef.current = progress; }, [progress]);
    useEffect(() => { matchedTilesRef.current = matchedTiles; }, [matchedTiles]);
    useEffect(() => { selectedTileRef.current = selectedTile; }, [selectedTile]);

    const saveCurrentSession = useCallback((returnSession = false) => {
        if (gameStateRef.current !== 'PLAYING' && gameStateRef.current !== 'PAUSED') return null;
        const name = localStorage.getItem('pkmnPlayerName');
        if (!name) return null;
        const sessionData = {
            level: levelRef.current,
            score: scoreRef.current,
            hp: hpRef.current,
            hints: hintsRef.current,
            shuffles: shufflesRef.current,
            progress: progressRef.current,
            board: boardRef.current,
            matchedTiles: matchedTilesRef.current,
            selectedTile: selectedTileRef.current,
            comboCount: comboCountRef.current,
            lastMatchTime: lastMatchTimeRef.current,
            activeTheme: activeThemeRef.current,
        };
        localStorage.setItem(`pkmnActiveSession_${name}`, JSON.stringify(sessionData));
        return returnSession ? sessionData : null;
    }, []);

    const clearActiveSession = useCallback(() => {
        const name = localStorage.getItem('pkmnPlayerName');
        if (name) localStorage.removeItem(`pkmnActiveSession_${name}`);
        setProfile(p => {
            if(!p) return p;
            const newP = { ...p, activeSession: null };
            // we do NOT saveProfile here because it's usually called together with level end which does saveProfile
            return newP;
        });
    }, []);

    // Periodic auto-save and tab lifecycle save
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
        
        // Auto-save profile stats every 20 seconds
        const profileSaveTimer = setInterval(() => {
            if (gameStateRef.current === 'PLAYING') {
                const sessionData = saveCurrentSession(true);
                const p = flushStats(profile, sessionData ? { activeSession: sessionData } : {});
                setProfile(p);
                if (playerName) saveProfile(playerName, p);
            }
        }, 20000);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            clearInterval(saveTimer);
            clearInterval(profileSaveTimer);
        };
    }, [saveCurrentSession, profile, playerName]);

    // Save immediately after important state changes
    useEffect(() => {
        if (gameState === 'PLAYING') {
            saveCurrentSession();
        }
    }, [board, score, hp, hints, shuffles, matchedTiles, selectedTile, gameState, saveCurrentSession]);

    // Rolls up matches/playtime tracked since the last save into the profile's statistics,
    // resetting the counters. Used at every point the profile is persisted.
    const flushStats = (baseProfile, extra = {}) => {
        const patch = { 
            matchesDelta: matchesPendingRef.current, 
            playTimeDeltaMs: playTimeAccumRef.current, 
            hintsUsedDelta: hintsPendingRef.current,
            shufflesUsedDelta: shufflesPendingRef.current,
            highestCombo: highestComboPendingRef.current,
            wrongDelta: wrongPendingRef.current,
            ...extra 
        };
        let p = updateStatistics(baseProfile, patch);
        
        matchesPendingRef.current = 0; 
        playTimeAccumRef.current = 0;
        combosPendingRef.current = 0; hintsPendingRef.current = 0; shufflesPendingRef.current = 0; highestComboPendingRef.current = 0; wrongPendingRef.current = 0;
        return p;
    };

    useEffect(() => {
        // Load cached theme assets from LocalStorage
        Object.keys(THEMES).forEach(id => {
            if (THEMES[id].type === 'premium') {
                const cached = localStorage.getItem(`pkmnThemeAssets_${id}`);
                if (cached) {
                    try {
                        const parsed = JSON.parse(cached);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            THEMES[id].data = parsed;
                        }
                    } catch(e) {}
                }
            }
        });

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = (e) => setIsStandalone(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    useEffect(() => { boardRef.current = board; activeThemeRef.current = activeTheme; gameStateRef.current = gameState; }, [board, activeTheme, gameState]);
    useEffect(() => {
        const handleEditCustomTheme = () => setShowCustomThemeEditor(true);
        window.addEventListener('editCustomTheme', handleEditCustomTheme);
        return () => window.removeEventListener('editCustomTheme', handleEditCustomTheme);
    }, []);

    useEffect(() => {
        if (!playerName) return;
        const checkTrial = () => {
            const trialJson = localStorage.getItem(`pkmn_trial_${playerName}`);
            if (trialJson) {
                try {
                    const trial = JSON.parse(trialJson);
                    // check if expired (5 minutes = 300000ms)
                    if (Date.now() - trial.startTime > 300000 && gameState === 'LOBBY_MAIN') {
                        localStorage.removeItem(`pkmn_trial_${playerName}`);
                        if (activeThemeRef.current === trial.theme) {
                            setActiveTheme('sweets');
                        }
                    }
                } catch(e) {}
            }
        };
        const interval = setInterval(checkTrial, 1000);
        return () => clearInterval(interval);
    }, [playerName, gameState]);

    useEffect(() => {
        if (gameState === 'LOBBY_MAIN') {
            setSplashText(SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)]);
        }
    }, [gameState]);
    useEffect(() => { 
    AudioEngine.updateSettings({ muteMusic: isMuted, muteSfx: isMuted }); 
    localStorage.setItem('pkmnMuted', isMuted); 
    setProfile(p => { 
        if(!p) return p;
        const newSettings = { ...(p.settings || {}), isMuted };
        const newP = { ...p, settings: newSettings };
        saveProfile(playerName, newP);
        return newP;
    });
}, [isMuted]);
    useEffect(() => {
        const gameStates = ['LOADING_BOARD', 'COUNTDOWN', 'PLAYING', 'PAUSED', 'GAMEOVER', 'WON'];
        if (gameStates.includes(gameState)) {
            if (typeof AudioEngine.playGameBgm === 'function') AudioEngine.playGameBgm();
        } else {
            if (typeof AudioEngine.playMenuBgm === 'function') AudioEngine.playMenuBgm();
        }
    }, [gameState]);

    // Tracks total time spent actively playing, for the Statistics screen
    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        const t = setInterval(() => { playTimeAccumRef.current += 1000; }, 1000);
        return () => clearInterval(t);
    }, [gameState]);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if(playerName && gameState === 'LOGIN') handleLoginSubmit(); }, []);


        const logSync = (status, action, result) => {
        window.dispatchEvent(new CustomEvent('syncLog', { detail: { status, action, result } }));
    };

    const runStartup = async (name) => {
        setGameState('STARTUP');
        if (window.setStartupComplete) window.setStartupComplete(false);
        
        setStartupStep(1); setStartupMessage('Memulai...'); setStartupProgress(5);
        await new Promise(r => setTimeout(r, 400));
        const isOnline = navigator.onLine;

        setStartupStep(2); setStartupMessage('Memuat Profil...'); setStartupProgress(15);
        const localProfile = getLocalProfile(name);
        await new Promise(r => setTimeout(r, 400));

        setStartupStep(3); setStartupMessage(isOnline ? 'Sinkronisasi Cloud...' : 'Mode Offline...'); setStartupProgress(25);
        logSync('Syncing', 'Login', 'Login Success');
        
        let cloudProfile = null;
        let fetchError = null;
        if (isOnline) {
            try {
                cloudProfile = await fetchCloudProfile(name);
                logSync('Connected', 'Download Cloud', 'Download Success');
            } catch (e) {
                fetchError = e;
                logSync('Offline', 'Download Cloud', e.message || 'Timeout');
            }
        }

        setStartupStep(4); setStartupMessage('Memeriksa Data...'); setStartupProgress(40);
        let finalProfile = null;
        let isNewAccount = false;
        
        if (cloudProfile) {
            // Cloud-First: Always use cloud if available
            finalProfile = cloudProfile;
        } else {
            if (localProfile && (!isOnline || fetchError)) {
                // Offline fallback
                finalProfile = localProfile;
                logSync('Offline', 'Load Local', 'Using local cache');
            } else if (localProfile && !fetchError) {
                // Cloud is empty but local exists (e.g., cleared cloud DB)
                // New recovery flow to prevent overwrite
                setLocalRecoveryProfile(localProfile);
                setShowCloudRecovery(true);
                return;
            } else if (!localProfile && fetchError) {
                setLoginError('Koneksi internet bermasalah. Gagal memuat data dari Cloud. Harap periksa koneksi Anda dan coba lagi.');
                setGameState('LOGIN');
                return;
            } else {
                // Brand new profile
                isNewAccount = true;
                finalProfile = getDefaultProfile();
            }
        }
        await new Promise(r => setTimeout(r, 500));
        
        finishStartup(name, finalProfile, isNewAccount, fetchError);
    };

    const finishStartup = async (name, finalProfile, isNewAccount, fetchError) => {
        setStartupStep(5); setStartupMessage('Menyiapkan Game...'); setStartupProgress(50);
        
        if (finalProfile.activeTheme) {
            setActiveTheme(finalProfile.activeTheme);
        } else {
            finalProfile.activeTheme = 'sweets';
            setActiveTheme('sweets');
        }
        if (finalProfile.settings) {
            setIsMuted(finalProfile.settings.isMuted);
            AudioEngine.updateSettings({ 
                muteMusic: finalProfile.settings.isMuted, 
                muteSfx: finalProfile.settings.isMuted,
                ...finalProfile.settings.audio 
            });
        }
        if (!finalProfile.unlockedThemes.includes(finalProfile.activeTheme)) {
            finalProfile.activeTheme = 'sweets';
            setActiveTheme('sweets');
        }
        if (finalProfile.customEmojis && finalProfile.customEmojis.length > 0) {
            THEMES.custom.data = finalProfile.customEmojis;
        }
        if (finalProfile.activeSession) {
            localStorage.setItem(`pkmnActiveSession_${name}`, JSON.stringify(finalProfile.activeSession));
        } else {
            localStorage.removeItem(`pkmnActiveSession_${name}`);
        }
        setProfile(finalProfile);
        await new Promise(r => setTimeout(r, 500));
        
        setStartupStep(6); setStartupMessage('Menyimpan Profil...'); setStartupProgress(65);
        if (isNewAccount && navigator.onLine && !fetchError) {
            try {
                if (window.saveCloudProfile) await window.saveCloudProfile(name, finalProfile);
                logSync('Connected', 'Upload Cloud', 'Upload Success');
            } catch(e) {
                logSync('Offline', 'Upload Cloud', e.message || 'Upload failed');
            }
        }
        setLocalProfile(name, finalProfile);
        await new Promise(r => setTimeout(r, 400));
        
        setStartupStep(7); setStartupMessage('Memeriksa Asset...'); setStartupProgress(75);
        const assets = [
            '/',
            '/logo.png',
            '/css/style.css',
            '/manifest.json',
            '/themes.json',
            '/js/config.js',
            '/js/storage.js',
            '/js/audio.js',
            '/js/app.js'
        ];
        await new Promise(r => setTimeout(r, 400));
        
        setStartupStep(8); setStartupMessage('Menyiapkan Cache...'); setStartupProgress(80);
        try {
            if ('caches' in window) {
                const cache = await caches.open('sweet-connect-v1');
                for (let i = 0; i < assets.length; i++) {
                    const url = assets[i];
                    let match = await cache.match(url);
                    if (!match) {
                        setStartupMessage(`Mengunduh Asset (${i + 1}/${assets.length})...`);
                        
                        let success = false;
                        for (let attempt = 1; attempt <= 3; attempt++) {
                            try {
                                await cache.add(url);
                                // Verify
                                match = await cache.match(url);
                                if (match) {
                                    success = true;
                                    break;
                                }
                            } catch(err) {
                                console.warn(`Attempt ${attempt} failed for ${url}`);
                                await new Promise(r => setTimeout(r, 500));
                            }
                        }
                        if (!success) {
                            console.error(`Gagal mengunduh asset penting: ${url}`);
                            // We don't block startup completely for non-critical, but log it.
                        }
                    }
                    setStartupProgress(80 + Math.floor((i / assets.length) * 10));
                }
            }
        } catch (e) {
            console.warn('Cache API error', e);
        }
        setStartupMessage('Memeriksa Database...');
        await new Promise(r => setTimeout(r, 300));
        try { localStorage.setItem('sc_db_test', '1'); localStorage.removeItem('sc_db_test'); } catch(e) {}
        
        
        setStartupStep(9); setStartupMessage('Menyiapkan Notifikasi...'); setStartupProgress(95);
        if (window.initPushManager) {
            window.initPushManager(name);
        }
        if (window.triggerOfflineCron) {
            window.triggerOfflineCron();
        }
        await new Promise(r => setTimeout(r, 500));
        
        setStartupStep(10); setStartupMessage('Selesai.'); setStartupProgress(100);
        await new Promise(r => setTimeout(r, 500));
        
        AudioEngine.uiReturnMenu();
        if (window.setStartupComplete) window.setStartupComplete(true);
        const loginStatus = window.checkLoginRewardStatus(finalProfile);
        if (loginStatus.canClaim) {
            setGameState('LOGIN_REWARD');
        } else {
            setGameState('LOBBY_MAIN');
        }
    };

        const handleClaimLoginReward = () => {
        const status = window.checkLoginRewardStatus(profile);
        if (!status.canClaim) return;
        
        const config = window.getLoginRewardConfig(profile);
        const reward = config[status.currentDay].reward;
        
        const newProfile = { ...profile, loginReward: { ...profile.loginReward, date: new Date().toDateString(), dayCount: status.currentDay + 1 } };
        
        if (!newProfile.statistics) newProfile.statistics = {};
        if (reward.coins) newProfile.coins = (newProfile.coins || 0) + reward.coins;
        if (reward.gems) newProfile.gems = (newProfile.gems || 0) + reward.gems;
        if (reward.gacha_vouchers) newProfile.gacha_vouchers = (newProfile.gacha_vouchers || 0) + reward.gacha_vouchers;
        if (reward.hints) newProfile.hints = Math.min(99, (newProfile.hints || 0) + reward.hints);
        if (reward.shuffles) newProfile.shuffles = Math.min(99, (newProfile.shuffles || 0) + reward.shuffles);
        if (reward.hp) newProfile.hp = Math.min(10, (newProfile.hp || 0) + reward.hp);
        newProfile.statistics.totalLoginDays = (newProfile.statistics.totalLoginDays || 0) + 1;
        if (reward.candy) newProfile.candy = (newProfile.candy || 0) + reward.candy;
        if (reward.theme && !newProfile.unlockedThemes?.includes(reward.theme)) {
            newProfile.unlockedThemes = [...(newProfile.unlockedThemes || []), reward.theme];
            newProfile.newThemes = [...(newProfile.newThemes || []), reward.theme];
        }
        
        if (newProfile.loginReward.dayCount >= 7) {
            newProfile.loginReward.dayCount = 0;
            newProfile.loginRewardCycle = (newProfile.loginRewardCycle || 0) + 1;
        }
        
        setProfile(newProfile);
        saveProfile(playerName, newProfile);
        
        // Trigger save to cloud immediately
        if (!isStandalone) {
             window.saveCloudProfile(playerName, newProfile).catch(e => console.log('background sync failed', e));
        }

        setGameState('LOBBY_MAIN');
    };
const handleLoginSubmit = async () => {
        if (playerName.trim()) {
            const name = playerName.trim();
            localStorage.setItem('pkmnPlayerName', name); 
            setLoginError(''); 
            runStartup(name);
        } else setLoginError('Nama tidak boleh kosong!');
    };

    const triggerLevelEndStats = useCallback(async (isGameOver = false) => {
        clearActiveSession();
        if (isGameOver) {
            const trialJson = localStorage.getItem(`pkmn_trial_${playerName}`);
            if (trialJson) {
                try {
                    const trial = JSON.parse(trialJson);
                    localStorage.removeItem(`pkmn_trial_${playerName}`);
                    if (activeThemeRef.current === trial.theme) {
                        setActiveTheme('sweets');
                    }
                } catch(e) {}
            }
        }
        if (isGameOver) {
            AudioEngine.gameOver();
            const coinsEarned = calculateCoinReward(score);
            const statsProfile = flushStats(profile, { scoreAchieved: score });
            // Game Over hanya mereset Level & Skor berjalan. HP, Hint, Shuffle, Koin, Gem,
            // Tema, dan semua progres (achievement/statistik/reward) TIDAK pernah direset.
            missionProgressRef.current = { combo: 0, addCombo: 0, match: 0, hints: 0, shuffles: 0, score: 0 };
            
            if (!statsProfile.statistics) statsProfile.statistics = {};
            statsProfile.statistics.totalCoinsEarned = (statsProfile.statistics.totalCoinsEarned || 0) + coinsEarned;

            const newProfile = { 
                ...statsProfile, 
                coins: statsProfile.coins + coinsEarned,
                currentLevel: 1, 
                currentScore: 0,
                highestLevel: Math.max(statsProfile.highestLevel || 1, level)
            };
            setProfile(newProfile); await saveProfile(playerName, newProfile);
            setGameState('GAMEOVER');
        } else {
            AudioEngine.levelClear(); 
            const timeElapsed = (167 - Math.max(0, getSecondsLeft(progress, level))) * 1000;
            const nextLevel = level + 1;
            let isFlawless = (!missionProgressRef.current.wrong && missionProgressRef.current.hints === 0 && missionProgressRef.current.shuffles === 0);
            
            let p = flushStats(profile, { 
                scoreAchieved: score, 
                timeElapsedMs: timeElapsed,
                remainingProgress: progress,
                flawlessDelta: isFlawless ? 1 : 0
            });
            
            // Chest progress (easier logic)
            if (typeof addChestProgress === 'function') {
                let chestPoints = 2; // base points
                if (isFlawless) chestPoints += 1;
                if (missionProgressRef.current.combo >= 15) chestPoints += 2;
                else if (missionProgressRef.current.combo >= 8) chestPoints += 1;
                
                if (timeElapsed < 45000) chestPoints += 1; // Under 45 seconds
                
                p = addChestProgress(p, chestPoints);
            }
            
            p = updateMissions(p, 'winLevel', 1); if (isFlawless) { p = updateMissions(p, 'flawless', 1); }
            
            // Real-time mission updates now handle the rest during gameplay
            
            // Capture stats before reset
            window.lastLevelStats = {
                matches: missionProgressRef.current.match || 0,
                combo: missionProgressRef.current.combo || 0,
                hints: missionProgressRef.current.hints || 0,
                shuffles: missionProgressRef.current.shuffles || 0,
                wrong: missionProgressRef.current.wrong || 0,
                timeSec: levelStartTime ? Math.max(0, Math.floor((Date.now() - levelStartTime) / 1000)) : 0,
                hpRemaining: hp
            };
            
            // Reset for next level
            missionProgressRef.current = { combo: 0, addCombo: 0, match: 0, hints: 0, shuffles: 0, score: 0, wrong: 0 };
            
            const progressProfile = p; const rewardGiven = null;
            
            // Simpan level & status barang ke cloud otomatis
            const newProfile = {
                ...progressProfile,
                currentLevel: nextLevel,
                currentScore: score,
                hp: hp,
                hints: hints,
                shuffles: shuffles,
                highestLevel: Math.max(progressProfile.highestLevel || 1, nextLevel)
            };
            setProfile(newProfile); await saveProfile(playerName, newProfile);
            setSweetMessage(msg => pickSweetMessage(msg));
            setShowBoardClear(false);
            setGameState('WON');
            if (rewardGiven) window.Dialog.showInfo("Progress Penuh!", `Progress hadiahmu penuh! Kamu dapat ${rewardGiven.label}.`);
        }
    }, [level, score, playerName, profile, hp, hints, shuffles]);

    const handleLevelCleared = useCallback(() => triggerLevelEndStats(false), [triggerLevelEndStats]);

    const handleDeadlock = useCallback((b) => setBoard(guaranteedShuffle(b)), []);

    const prepareLevel = async (startLevel, providedBoard = null, providedTheme = null, startScore = null, startHp = null, startHints = null, startShuffles = null, startProgress = null, startMatchedTiles = null, startSelectedTile = null, startComboCount = 0, startLastMatchTime = 0) => {
        const currentT = providedTheme || activeThemeRef.current;
        const b = providedBoard || generateBoard(currentT, startLevel);
        setBoard(b); setLevel(startLevel);
        
        // Gunakan nilai yang di pass, jika tidak ambil dari profile saat ini (melanjutkan main)
        setScore(startScore !== null ? startScore : profile.currentScore);
        setHp(startHp !== null ? startHp : profile.hp);
        setHints(startHints !== null ? startHints : profile.hints);
        setShuffles(startShuffles !== null ? startShuffles : profile.shuffles);

        comboCountRef.current = startComboCount; 
        lastMatchTimeRef.current = startLastMatchTime;
        
        if (startLevel === 1) {
            setIsNewRecord(false);
            const statsProfile = updateStatistics(profile, { incrementGames: true });
            const dmProfile = updateMissions(statsProfile, 'play', 1);
            setProfile(dmProfile); saveProfile(playerName, dmProfile);
        }
        setMatchedTiles(startMatchedTiles || []);
        
        setGameState('LOADING_BOARD'); setProgress(0); 
        let p = 0; const interval = setInterval(() => { p += 25; setProgress(p); }, 100);
        await new Promise(r => setTimeout(r, 400)); clearInterval(interval); 
        setProgress(startProgress !== null ? startProgress : 100);
        
        setLevelStartTime(Date.now() + 3700);
        runCountdownThenPlay(Date.now() + 3700, startSelectedTile);
    };

    const runCountdownThenPlay = (startAt, startSelectedTile = null) => {
        setGameState('COUNTDOWN');
        const steps = [{ label: 3, offset: -3000 }, { label: 2, offset: -2000 }, { label: 1, offset: -1000 }, { label: 'GO!', offset: 0 }];
        steps.forEach(({ label, offset }) => {
            const delay = Math.max(0, (startAt + offset) - Date.now());
            setTimeout(() => { setCountdown(label); AudioEngine.tick(label); }, delay);
        });
        const playDelay = Math.max(0, (startAt + 700) - Date.now());
        setTimeout(() => {
            setCountdown(null); setSelectedTile(startSelectedTile); setActivePath(null); setHintActiveTiles([]);
            AudioEngine.uiStartGame(); setGameState('PLAYING');
        }, playDelay);
    };

    const handleTileClick = (e, r, c) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (gameStateRef.current !== 'PLAYING') return;
        const currentBoard = boardRef.current;
        if (currentBoard[r][c] === 0 || matchedTiles.some(m => m.r === r && m.c === c)) return; 
        if (selectedTile && selectedTile.r === r && selectedTile.c === c) { AudioEngine.uiCancel(); setSelectedTile(null); return; }
        if (!selectedTile) { AudioEngine.uiClick(); setSelectedTile({r, c}); return; }

        const virtualBoard = currentBoard.map(row => [...row]);
        matchedTiles.forEach(m => { virtualBoard[m.r][m.c] = 0; });
        if (virtualBoard[selectedTile.r][selectedTile.c] === 0 || virtualBoard[r][c] === 0) { setSelectedTile(null); return; }

        const path = getPath(virtualBoard, selectedTile.r, selectedTile.c, r, c);
        if (path) {
            const r1 = selectedTile.r; const c1 = selectedTile.c; const id1 = virtualBoard[r1][c1]; const id2 = virtualBoard[r][c];
            const newMatches = [{r: r1, c: c1, id: id1}, {r, c, id: id2}];
            setMatchedTiles(prev => [...prev, ...newMatches]); setHintActiveTiles([]); setActivePath(path); AudioEngine.match();

            setShowTimerAdd(true); setTimeout(() => setShowTimerAdd(false), 900); setSelectedTile(null); 

            setTimeout(() => {
                setBoard(prev => {
                    const newBoard = prev.map(row => [...row]);
                    if (newBoard[r1][c1] !== 0 && newBoard[r][c] !== 0) {
                        newBoard[r1][c1] = 0; newBoard[r][c] = 0;
                        if (countRemaining(newBoard) === 0) setTimeout(() => handleLevelCleared(), 0);
                        else if (!findHint(newBoard)) setTimeout(() => handleDeadlock(newBoard), 0);
                    }
                    return newBoard;
                });
                setMatchedTiles(prev => prev.filter(m => !( (m.r === r1 && m.c === c1) || (m.r === r && m.c === c) )));
                setActivePath(null); 

                // Combo: matches made in quick succession stack a bonus & a little animation
                matchesPendingRef.current += 1;
                missionProgressRef.current.match += 1;
                setProfile(prev => updateMissions(prev, 'match', 1));
                const now = Date.now();
                comboCountRef.current = (now - lastMatchTimeRef.current <= COMBO_WINDOW_MS) ? comboCountRef.current + 1 : 1;
                lastMatchTimeRef.current = now;
                
                missionProgressRef.current.combo = Math.max(missionProgressRef.current.combo, comboCountRef.current); highestComboPendingRef.current = Math.max(highestComboPendingRef.current, comboCountRef.current);
                setProfile(prev => updateMissions(prev, 'combo', comboCountRef.current));
                
                if (comboCountRef.current === 5) {
                    missionProgressRef.current.addCombo = (missionProgressRef.current.addCombo || 0) + 1;
                    setProfile(prev => updateMissions(prev, 'addCombo', 1));
                }
                
                if (comboCountRef.current > 1) {
                    combosPendingRef.current += 1;
                }
                
                const comboBonus = getComboBonus(comboCountRef.current);
                if (comboBonus > 0) {
                    setComboDisplay({ count: comboCountRef.current, bonus: comboBonus, r, c });
                    setTimeout(() => setComboDisplay(null), 900);
                }

                const gained = 10 + (comboBonus || 0); missionProgressRef.current.score += gained; setProfile(p => updateMissions(p, "score", gained));

                setScore(s => {
                    const { newScore, isNewRecord } = applyMatchScore(s, comboBonus);
                    if (isNewRecord) setIsNewRecord(true);
                    return newScore;
                });
                const addSec = Math.max(1, 5 - Math.floor((level - 1) / 5));
                const addPct = (addSec * 1000) / 90000 * 100;
                setProgress(p => Math.min(100, p + addPct)); 
            }, 350); 
                } else {
            
            AudioEngine.wrong(); missionProgressRef.current.wrong = (missionProgressRef.current.wrong || 0) + 1; wrongPendingRef.current += 1; setWrongTile({r, c}); setTimeout(() => setWrongTile(null), 380); setSelectedTile({r, c});
            if (virtualBoard[selectedTile.r][selectedTile.c] === virtualBoard[r][c]) {
                const penaltySec = Math.min(15, 1 + level);
                const penaltyPct = (penaltySec * 1000) / 90000 * 100; // TIME_LIMIT_MS is 90000
                setProgress(p => Math.max(0, p - penaltyPct));
                setWrongConnectionPenalty({ r, c, sec: penaltySec });
                setTimeout(() => setWrongConnectionPenalty(null), 1000);
            } else {
                const penaltySec = Math.min(15, 1 + level);
                const penaltyPct = (penaltySec * 1000) / 90000 * 100;
                setProgress(p => Math.max(0, p - penaltyPct)); // Wrong match penalty!
            }
        }
    };

    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        const speed = getTimerSpeed(level);
        const timer = setInterval(() => {
            setProgress(prev => { if (prev <= 0) { clearInterval(timer); handleTimeout(); return 0; } return prev - speed; });
        }, 200);
        return () => clearInterval(timer);
    }, [gameState, level]);

    const handleTimeout = () => {
        AudioEngine.timeout(); setShowTimeoutFlash(true);
        setTimeout(() => {
            setShowTimeoutFlash(false);
            if (hp > 1) { 
                setHp(h => h - 1); 
                
                // Simpan pengurangan HP ke profil sekalian supaya nggak hilang direfresh
                const statsProfile = flushStats(profile, { scoreAchieved: score });
                const newProfile = { ...statsProfile, hp: hp - 1 };
                setProfile(newProfile); saveProfile(playerName, newProfile);
                
                setProgress(100);
                runCountdownThenPlay(Date.now() + 3700, selectedTile);
            } 
            else {
                triggerLevelEndStats(true);
            }
        }, 1000);
    };

    const handleShuffleClick = () => { 
        if (gameState !== 'PLAYING') return;
        if (shuffles > 0) { 
            setShuffles(s => s - 1); missionProgressRef.current.shuffles += 1; setProfile(p => updateMissions(p, 'useShuffle', 1)); shufflesPendingRef.current += 1; AudioEngine.shuffle(); handleDeadlock(board); setSelectedTile(null); 
        } else if (hp > 1) {
            setHp(h => h - 1); missionProgressRef.current.shuffles += 1; setProfile(p => updateMissions(p, 'useShuffle', 1)); AudioEngine.shuffle(); handleDeadlock(board); setSelectedTile(null);
            window.Dialog.showInfo("Pakai Nyawa", "Kamu menggunakan 1 Nyawa untuk Shuffle!");
            const p = flushStats(profile);
            setProfile(p);
            saveProfile(playerName, p);
        } else {
            window.Dialog.showError("Gagal", "Tidak ada Shuffle dan Nyawa tidak cukup (Minimal 2).");
        }
    };
    
    const handleHintClick = () => {
        if (gameState !== 'PLAYING') return;
        const hintData = findHint(board);
        if (!hintData) return;

        if (hints > 0) {
            setHints(h => h - 1); missionProgressRef.current.hints += 1; hintsPendingRef.current += 1; setProfile(p => updateMissions(p, 'useHint', 1)); AudioEngine.hint(); setHintActiveTiles([{r: hintData.p1.r, c: hintData.p1.c}, {r: hintData.p2.r, c: hintData.p2.c}]); setTimeout(() => setHintActiveTiles([]), 1200); 
        } else if (hp > 1) {
            setHp(h => h - 1); missionProgressRef.current.hints += 1; setProfile(p => updateMissions(p, 'useHint', 1)); AudioEngine.hint(); setHintActiveTiles([{r: hintData.p1.r, c: hintData.p1.c}, {r: hintData.p2.r, c: hintData.p2.c}]); setTimeout(() => setHintActiveTiles([]), 1200); 
            window.Dialog.showInfo("Pakai Nyawa", "Kamu menggunakan 1 Nyawa untuk Hint!");
            const p = flushStats(profile);
            setProfile(p);
            saveProfile(playerName, p);
        } else {
            window.Dialog.showError("Gagal", "Tidak ada Hint dan Nyawa tidak cukup (Minimal 2).");
        }
    };
    
    const handleBuyHpInGame = () => {
        if (hp >= 5) {
            window.Dialog.showInfo("Penuh", "Nyawa kamu sudah penuh (Maksimal 5).");
            return;
        }
        if ((profile.gems || 0) < 5) {
            window.Dialog.showError("Gagal", "Gem tidak cukup! Butuh 5 Gem untuk beli 1 Nyawa saat main.");
            return;
        }
        setHp(h => h + 1);
        const newProfile = { ...profile, gems: profile.gems - 5, hp: hp + 1 };
        setProfile(newProfile);
        saveProfile(playerName, newProfile);
        window.Dialog.showSuccess("Berhasil", "Berhasil membeli 1 Nyawa seharga 5 Gem!");
    };
    
    const handleBuyStore = async (item, qty = 1) => {
        let newProfile = { ...profile };

        const actualId = item.itemId || item.id;
        if (actualId === 'hp' && profile.hp + qty > 5) { window.Dialog.showInfo("Penuh", `Nyawa kamu akan melebihi maksimal 5 (Beli: ${qty}, Punya: ${profile.hp})!`); return; }
        
        const totalPrice = (item.price || 0) * qty;

        if (item.currency === 'gems') {
            if ((profile.gems || 0) < totalPrice) { window.Dialog.showError("Gagal", "Gem kamu tidak cukup!"); return; }
            newProfile.gems = (profile.gems || 0) - totalPrice;
        } else {
            if (profile.coins < totalPrice) { window.Dialog.showError("Gagal", "Koin kamu tidak cukup!"); return; }
            newProfile.coins -= totalPrice;
        }
        
        if (item.type === 'tema') {
            newProfile.unlockedThemes = [...newProfile.unlockedThemes, item.id];
            newProfile.newThemes = [...(newProfile.newThemes || []), item.id];
            
            // Simpan cache asset ke LocalStorage untuk premium theme
            const themeDataObj = THEMES[item.id];
            if (themeDataObj && themeDataObj.type === 'premium') {
                try {
                    const cacheArr = [];
                    for (let i = 0; i < themeDataObj.data.length; i++) {
                        const url = themeDataObj.data[i];
                        if (url.startsWith('http') || url.startsWith('/')) {
                            // Coba fetch dan simpan base64
                            const resp = await fetch(url);
                            const blob = await resp.blob();
                            const reader = new FileReader();
                            const base64 = await new Promise((resolve) => {
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                            cacheArr.push(base64);
                        } else {
                            cacheArr.push(url); // emoji dll
                        }
                    }
                    localStorage.setItem(`pkmnThemeAssets_${item.id}`, JSON.stringify(cacheArr));
                    // Update the global THEMES object to use the base64 cache
                    THEMES[item.id].data = cacheArr;
                } catch (e) {
                    console.error("Gagal mendownload asset tema ke cache", e);
                }
            }

            // Setup preferred background logic if selected
            if (item.selectedBgIndex !== undefined && THEMES[item.id]) {
                const bgOpt = THEMES[item.id].backgroundOptions?.[item.selectedBgIndex];
                if (bgOpt) {
                    // Update global THEMES objects in memory so it applies immediately
                    THEMES[item.id].colors = {
                        ...THEMES[item.id].colors,
                        bg: bgOpt.bg,
                        border: bgOpt.border,
                        text: bgOpt.text,
                        accent: bgOpt.accent,
                        buttonActive: bgOpt.buttonActive
                    };
                }
            }
        }
        else if (item.type === 'item') {
            if (actualId === 'hp') newProfile.hp = Math.min(5, newProfile.hp + qty);
            if (actualId === 'hints') newProfile.hints = Math.min(99, newProfile.hints + (3 * qty));
            if (actualId === 'shuffles') newProfile.shuffles = Math.min(99, newProfile.shuffles + (3 * qty));
        }
        else if (item.type === 'item_bulk') {
            if (item.itemId === 'hp') newProfile.hp = Math.min(5, newProfile.hp + (item.val * qty));
            if (item.itemId === 'hints') newProfile.hints = Math.min(99, newProfile.hints + (item.val * qty));
            if (item.itemId === 'shuffles') newProfile.shuffles = Math.min(99, newProfile.shuffles + (item.val * qty));
            if (item.itemId === 'gems') newProfile.gems = (newProfile.gems || 0) + (item.val * qty);
            if (item.itemId === 'coins') newProfile.coins = newProfile.coins + (item.val * qty);
        }
        else if (item.type === 'item_special') {
            const rewards = ['hints', 'shuffles', 'gems', 'coins'];
            const rewardType = rewards[Math.floor(Math.random() * rewards.length)];
            let baseQty = 0; let label = '';
            if (rewardType === 'hints') { baseQty = 10; label = 'Hint'; }
            if (rewardType === 'shuffles') { baseQty = 10; label = 'Shuffle'; }
            if (rewardType === 'gems') { baseQty = 5; label = 'Gem'; }
            if (rewardType === 'coins') { baseQty = 2000; label = 'Koin'; }
            newProfile[rewardType] = (newProfile[rewardType] || 0) + (baseQty * qty);
            window.Dialog.showSuccess("Gacha Hoki!", `Kamu mendapatkan ${(baseQty * qty)} ${label}!`);
        }
        else if (item.type === 'flex') newProfile.flexCrown = true;
        
        if (item.type === 'theme') {
            newProfile = updateStatistics(newProfile, { themesBoughtDelta: 1 });
        } else if (item.type === 'item' || item.type === 'item_bulk' || item.type === 'item_special') {
            newProfile = updateStatistics(newProfile, { powerupsBoughtDelta: qty });
        }
        
        setProfile(newProfile); await saveProfile(playerName, newProfile);
        if (item.type !== 'item_special') window.Dialog.showSuccess("Berhasil", `Berhasil membeli ${qty}x ${item.name}!`);
    };

    const handleSellStore = async (actionType, qty) => {
        let newProfile = { ...profile };
        
        if (actionType === 'sell_hint') {
            if ((profile.hints || 0) < qty) { window.Dialog.showError("Gagal", "Hint kamu tidak cukup!"); return; }
            newProfile.hints = (profile.hints || 0) - qty;
            newProfile.coins = (newProfile.coins || 0) + Math.floor((50 * qty) * 0.9);
        } else if (actionType === 'sell_shuffle') {
            if ((profile.shuffles || 0) < qty) { window.Dialog.showError("Gagal", "Shuffle kamu tidak cukup!"); return; }
            newProfile.shuffles = (profile.shuffles || 0) - qty;
            newProfile.coins = (newProfile.coins || 0) + Math.floor((50 * qty) * 0.9);
        } else if (actionType === 'exchange_nyawa') {
            if ((profile.hp || 0) <= qty) { window.Dialog.showError("Gagal", "Nyawa kamu tidak cukup! Sisakan minimal 1."); return; }
            const tax = 50 * qty;
            if ((profile.coins || 0) < tax) { window.Dialog.showError("Gagal", `Koin kamu tidak cukup untuk bayar pajak! Butuh ${tax} Koin.`); return; }
            newProfile.hp = (profile.hp || 0) - qty;
            newProfile.coins = (profile.coins || 0) - tax;
            newProfile.gems = (newProfile.gems || 0) + qty;
            if (!newProfile.statistics) newProfile.statistics = {};
            newProfile.statistics.totalTicketsEarned = (newProfile.statistics.totalTicketsEarned || 0) + qty;
        }
        setProfile(newProfile); await saveProfile(playerName, newProfile);
        window.Dialog.showSuccess("Berhasil", "Transaksi sukses!");
    };
    const handleClaimDaily = async (missionId, isWeekly) => {
        const { profile: newProfile, rewardLabel } = claimMissionReward(profile, missionId, isWeekly);
        setProfile(newProfile); await saveProfile(playerName, newProfile);
        AudioEngine.winPrize();
        setSweetMessage(`+ ${rewardLabel}`);
    };

    const handleClaimAchievement = async (achievement) => {
        const newProfile = applyAchievementReward(profile, achievement);
        setProfile(newProfile); await saveProfile(playerName, newProfile);
        setSweetMessage(`Klaim: ${achievement.title}`);
    };

    const handleClaimMilestone = async (milestone) => {
        const newProfile = applyMilestoneReward(profile, milestone);
        setProfile(newProfile); await saveProfile(playerName, newProfile);
        setSweetMessage(`Klaim Level ${milestone.level}`);
    };

    const handleMysteryGiftComplete = async (p, boxesOpened = 1) => {
        let newProfile = updateStatistics(p, { mysteryBoxOpenedDelta: boxesOpened });
        newProfile = updateMissions(newProfile, 'openMystery', boxesOpened);
        setProfile(newProfile); await saveProfile(playerName, newProfile);
    };

    // ===================== PWA GUARD =====================
    if (!isStandalone) {
        return <InstallPrompt deferredPrompt={deferredPrompt} onSkip={() => setIsStandalone(true)} />;
    }

    
    const ctxValue = {
        gameState, setGameState, activeTheme, activeThemeRef, gameStateRef, board, score, hp, hints, shuffles, level, progress, showTimerAdd, wrongConnectionPenalty, activePath, wrongTile, hintActiveTiles, matchedTiles, selectedTile, isMuted, setIsMuted, isStandalone, deferredPrompt, playerName, setPlayerName, loginError, setLoginError, lobbyBadgeText, isLoadingProfile, syncStatus, showSyncLog, setShowSyncLog, syncLogs, startupStep, startupMessage, startupProgress, showCloudRecovery, localRecoveryProfile, setShowCloudRecovery, setSelectedTile, setActiveTheme, setBoard, finishStartup, getDefaultProfile, profile, setProfile, isNewRecord, countdown, setCountdown, comboDisplay, setComboDisplay, showBoardClear, setShowBoardClear, showTimeoutFlash, setShowTimeoutFlash, sweetMessage, setSweetMessage,  showSettings, setShowSettings, showCustomThemeEditor, setShowCustomThemeEditor, splashText, handleLoginSubmit, handleBuyHpInGame, handleHintClick, handleShuffleClick, handleTileClick, getSecondsLeft, handleBuyStore, handleSellStore, handleClaimDaily, handleClaimAchievement, handleClaimMilestone, handleMysteryGiftComplete, prepareLevel, handleClaimLoginReward, THEMES, formatNumber, calculateCoinReward, AudioEngine, saveProfile, window, saveCurrentSession, flushStats
    };

    return (
        <GameContext.Provider value={ctxValue}>
            <GameUI />
            <DialogManager />
        </GameContext.Provider>
    );
};

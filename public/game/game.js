// ===================== MAIN APP =====================
const SPLASH_TEXTS = ["Senyum terus ya", "Kamu hebat hari ini", "Bisa karena terbiasa", "I'm proud of you", "Cantik banget hari ini", "Jangan lupa istirahat", "Dunia lebih indah ada kamu", "Tetap semangat manis", "You are my sunshine", "Bahagia selalu ya"];
const BADGE_TEXTS = ["Semangat sayang", "I love you", "Kamu pasti bisa", "Miss you", "Pinter banget", "Have fun sayang", "Kangen kamu", "My only one", "Ayo main"];

const getInitialTheme = () => {
    const name = localStorage.getItem('pkmnPlayerName');
    if (!name) return 'sweets';
    try {
        const raw = localStorage.getItem(`SC_BACKUP_${name}`);
        if (raw) {
            const parsed = JSON.parse(raw);
            const data = parsed.gameData || parsed.data || parsed;
            if (data && data.activeTheme) return data.activeTheme;
        }
        
        // Fallback for legacy format
        const oldRaw = localStorage.getItem(`sweet_connect_${name}`);
        if (oldRaw) {
            const parsed = JSON.parse(oldRaw);
            if (parsed && parsed.activeTheme) return parsed.activeTheme;
        }
    } catch(e) {}
    return 'sweets';
};

const App = () => {
    const [isStandalone, setIsStandalone] = useState(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    
    const [playerName, setPlayerName] = useState(() => localStorage.getItem('pkmnPlayerName') || '');
    const [loginError, setLoginError] = useState('');
    const [gameState, setGameState] = useState(() => localStorage.getItem('pkmnPlayerName') ? 'STARTUP' : 'LOGIN'); 
    
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
    const [profile, setProfile] = useState(() => window.getDefaultProfile());
    const profileRef = useRef(profile);
    useEffect(() => { profileRef.current = profile; }, [profile]);
    
    const [activeTheme, setActiveTheme] = useState(() => getInitialTheme());
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

    useEffect(() => {
        const handleExternalUpdate = (e) => {
            const newProfile = e.detail.profile;
            if (newProfile) {
                setProfile(newProfile);
                if (newProfile.activeTheme) setActiveTheme(newProfile.activeTheme);
                setSweetMessage('Profil diperbarui dari Cloud!');
            }
        };
        window.addEventListener('profileUpdatedExternally', handleExternalUpdate);
        return () => window.removeEventListener('profileUpdatedExternally', handleExternalUpdate);
    }, []);

    const saveCurrentSession = useCallback((returnSession = false) => {
        return null;
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
                    saveProfile(playerName, newProfile);
                }
                return;
            }

            if (!currentProfile.lastHpRegenTime) {
                const newProfile = { ...currentProfile, lastHpRegenTime: Date.now() };
                setProfile(newProfile);
                saveProfile(playerName, newProfile);
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
                saveProfile(playerName, newProfile);
            }
        };
        
        checkHpRegen();
        const interval = setInterval(checkHpRegen, 5000);
        return () => clearInterval(interval);
    }, [playerName]);

    // Save immediately after important state changes
    useEffect(() => {
        if (gameState === 'PLAYING') {
            const sessionData = saveCurrentSession();
            if (sessionData && playerName) {
                setProfile(p => {
                    if (!p) return p;
                    const newP = { ...p, activeSession: sessionData };
                    saveProfile(playerName, newP);
                    return newP;
                });
            }
        }
    }, [board, score, hp, hints, shuffles, matchedTiles, selectedTile, gameState, saveCurrentSession, playerName]);

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
        window.flushStats = flushStats;
        return () => { delete window.flushStats; };
    }, []);

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
        const gameStates = ['LOADING_BOARD', 'COUNTDOWN', 'PLAYING', 'PAUSED', 'GAMEOVER', 'WON'];
        if (gameStates.includes(gameState)) {
            if (typeof AudioEngine.playGameBgm === 'function') AudioEngine.playGameBgm();
        } else {
            if (typeof AudioEngine.playMenuBgm === 'function') AudioEngine.playMenuBgm();
        }
    }, [gameState]);

    // Tracks total time spent actively playing, for the Statistics screen
    useEffect(() => {
        if (gameState !== 'PLAYING' || window.isMultiplayerMatch) return;
        const t = setInterval(() => { playTimeAccumRef.current += 1000; }, 1000);
        return () => clearInterval(t);
    }, [gameState]);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if(playerName && gameState === 'STARTUP') handleLoginSubmit(true); }, []);

    useEffect(() => {
        if (playerName && profile && window.NotificationScheduler) {
            window.NotificationScheduler.restart(playerName, profile);
        } else if (!playerName && window.NotificationScheduler) {
            window.NotificationScheduler.stop();
        }
    }, [playerName, profile]);

        const logSync = (status, action, result) => {
        window.dispatchEvent(new CustomEvent('syncLog', { detail: { status, action, result } }));
    };

    const runStartup = async (name, isColdStart = false) => {
        if (!isColdStart) {
            setGameState('LOGIN_LOADING');
        }
        if (window.setStartupComplete) window.setStartupComplete(false);
        
        const isOnline = navigator.onLine;

        if (!isOnline) {
            setLoginError('Tidak ada koneksi internet. Cloud tidak tersedia.');
            setGameState('LOGIN');
            return;
        }

        let finalProfile = null;
        let isNewAccount = false;
        
        try {
            // Save Engine handles fetch, migration, conflict resolution, validation, and local backups
            finalProfile = await window.SaveEngine.loadProfile(name);
            logSync('Connected', 'Download Cloud', 'Save Engine Load Success');
            
            // Check if brand new (SaveEngine returns empty object if new)
            if (Object.keys(finalProfile).length === 0) {
                isNewAccount = true;
                finalProfile = window.getDefaultProfile();
            }
        } catch (e) {
            logSync('Offline', 'Download Cloud', e.message || 'Timeout/Error');
            setLoginError('Terjadi kesalahan memuat data: ' + e.message);
            setGameState('LOGIN');
            return;
        }

        // Apply theme before showing Startup Screen to prevent flicker
        if (!isColdStart) {
            const themeToApply = finalProfile.activeTheme || 'sweets';
            setActiveTheme(themeToApply);
            setGameState('STARTUP');
            // Give a tiny delay so React has time to render STARTUP before changing steps
            await new Promise(r => setTimeout(r, 50));
        }

        setStartupStep(1); setStartupMessage('Memulai...'); setStartupProgress(5);
        await new Promise(r => setTimeout(r, 300));

        setStartupStep(2); setStartupMessage('Menghubungkan ke Save Engine...'); setStartupProgress(25);
        await new Promise(r => setTimeout(r, 200));

        setStartupStep(3); setStartupMessage('Memuat dan Validasi Profil...'); setStartupProgress(40);
        await new Promise(r => setTimeout(r, 300));
        
        finishStartup(name, finalProfile, isNewAccount, null);
    };

    const finishStartup = async (name, finalProfile, isNewAccount, fetchError) => {
        setStartupStep(5); setStartupMessage('Menyiapkan Game...'); setStartupProgress(50);
        
        if (finalProfile.activeTheme) {
            setActiveTheme(finalProfile.activeTheme);
        } else {
            finalProfile.activeTheme = 'sweets';
            setActiveTheme('sweets');
        }
        if (!finalProfile.unlockedThemes.includes(finalProfile.activeTheme)) {
            finalProfile.activeTheme = 'sweets';
            setActiveTheme('sweets');
        }
        
        Object.keys(THEMES).forEach(k => {
            if (THEMES[k].price === 0 && !finalProfile.unlockedThemes.includes(k)) {
                finalProfile.unlockedThemes.push(k);
            }
        });

        if (finalProfile.customEmojis && finalProfile.customEmojis.length > 0) {
            THEMES.custom.data = finalProfile.customEmojis;
        }
        
        try {
            localStorage.removeItem(`pkmnActiveSession_${name}`);
        } catch(e) {}
        
        setProfile(finalProfile);
        await new Promise(r => setTimeout(r, 500));
        
        setStartupStep(6); setStartupMessage('Menyiapkan Sinkronisasi...'); setStartupProgress(65);
        if (window.setStartupComplete) window.setStartupComplete(true);
        if (isNewAccount) {
            if (window.SaveEngine) window.SaveEngine.saveProfile(name, finalProfile);
        }
        await new Promise(r => setTimeout(r, 400));
        
        setStartupStep(7); setStartupMessage('Memeriksa Asset...'); setStartupProgress(75);
        const assets = [
            '/',
            '/logo.png',
            '/css/style.css',
            '/manifest.json',
            '/themes.json',
            '/js/config.js',
            '/engine/SaveEngine.js',
            '/js/audio.js',
            '/js/app.js'
        ];
        
        // Ensure theme assets are fully loaded and decoded in memory before entering Main Menu
        if (window.THEMES && window.THEMES[finalProfile.activeTheme]) {
            const themeObj = window.THEMES[finalProfile.activeTheme];
            const themeUrls = [];
            if (themeObj.splash) themeUrls.push(themeObj.splash);
            if (themeObj.background) themeUrls.push(themeObj.background);
            if (themeObj.logo) themeUrls.push(themeObj.logo);
            if (themeObj.menuBackgrounds) {
                Object.values(themeObj.menuBackgrounds).forEach(url => themeUrls.push(url));
            }
            if (themeObj.menuIcons) {
                Object.values(themeObj.menuIcons).forEach(url => themeUrls.push(url));
            }
            
            // Add to cache list
            themeUrls.forEach(url => assets.push(url));
            
            // Pre-decode images to prevent flickering
            setStartupMessage('Memuat Asset Tema...');
            await Promise.all(themeUrls.map(url => new Promise(resolve => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;
                img.src = url;
            })));
        }

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
        if (window.forceSaveProfileNow) {
             window.forceSaveProfileNow(playerName, newProfile);
        } else {
             saveProfile(playerName, newProfile);
        }

        setGameState('LOBBY_MAIN');
    };
const handleLoginSubmit = async (isColdStart = false) => {
        if (playerName.trim()) {
            const name = playerName.trim();
            localStorage.setItem('pkmnPlayerName', name); 
            setLoginError(''); 
            runStartup(name, isColdStart);
        } else setLoginError('Nama tidak boleh kosong!');
    };

    const handleLogout = () => {
        if (window.SaveEngine) window.SaveEngine.logout();
        AudioEngine.stopBgm();
        if (window.NotificationManager) window.NotificationManager.reset();
        localStorage.removeItem('pkmnPlayerName');
        try { localStorage.removeItem('pkmnActiveSession_' + playerName); } catch(e) {}
        
        // Full reset of memory, theme assets, and runtime state
        window.location.reload();
    };

    const triggerLevelEndStats = useCallback(async (isGameOver = false) => {
        try { localStorage.removeItem('pkmnActiveSession_' + playerName); } catch(e) {}
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
            const statsProfile = flushStats(profile, { scoreAchieved: score });
            
            // Kurangi HP karena GAME OVER
            const newHp = Math.max(0, hp - 1);
            setHp(newHp);

            // Capture stats before reset
            window.lastLevelStats = {
                score: missionProgressRef.current.score || 0,
                matches: missionProgressRef.current.match || 0,
                combo: missionProgressRef.current.combo || 0,
                hints: missionProgressRef.current.hints || 0,
                shuffles: missionProgressRef.current.shuffles || 0,
                wrong: missionProgressRef.current.wrong || 0,
                timeSec: levelStartTime ? Math.max(0, Math.floor((Date.now() - levelStartTime) / 1000)) : 0,
                hpRemaining: newHp
            };

            // Game Over tidak mereset level, skor, atau item.
            missionProgressRef.current = { combo: 0, addCombo: 0, match: 0, hints: 0, shuffles: 0, score: 0, wrong: 0 };
            
            const newProfile = { 
                ...statsProfile, 
                hp: newHp,
                currentLevel: level, 
                currentScore: 0,
                highestLevel: Math.max(statsProfile.highestLevel || 1, level)
            };
            setProfile(newProfile); await saveProfile(playerName, newProfile);
            setGameState('GAMEOVER');
        } else {
            AudioEngine.levelClear(); 
            const remainingSeconds = Math.max(0, getSecondsLeft(progress, level));
            const timeElapsed = (167 - remainingSeconds) * 1000;
            const nextLevel = level + 1;
            let isFlawless = (!missionProgressRef.current.wrong && missionProgressRef.current.hints === 0 && missionProgressRef.current.shuffles === 0);
            
            const timeBonus = calculateTimeBonus(remainingSeconds);
            let finalScore = score + timeBonus;
            const flawlessBonus = isFlawless ? calculateFlawlessBonus(finalScore) : 0;
            finalScore += flawlessBonus;
            
            const bonusGained = timeBonus + flawlessBonus;
            let currentProfile = profile;
            if (bonusGained > 0) {
                missionProgressRef.current.score += bonusGained;
                currentProfile = updateMissions(currentProfile, "score", bonusGained);
            }
            
            setScore(finalScore);

            let p = flushStats(currentProfile, { 
                scoreAchieved: finalScore, 
                timeElapsedMs: timeElapsed,
                remainingProgress: progress,
                flawlessDelta: isFlawless ? 1 : 0
            });
            
            if (window.RewardEngine) {
                p = window.RewardEngine.processWin(p, {
                    isMultiplayer: false,
                    isFlawless: isFlawless,
                    timeElapsed: timeElapsed,
                    progress: progress,
                    highestCombo: missionProgressRef.current.combo
                });
            }
            
            // Real-time mission updates now handle the rest during gameplay
            
            // Capture stats before reset
            window.lastLevelStats = {
                score: missionProgressRef.current.score || 0,
                matches: missionProgressRef.current.match || 0,
                combo: missionProgressRef.current.combo || 0,
                hints: missionProgressRef.current.hints || 0,
                shuffles: missionProgressRef.current.shuffles || 0,
                wrong: missionProgressRef.current.wrong || 0,
                timeSec: levelStartTime ? Math.max(0, Math.floor((Date.now() - levelStartTime) / 1000)) : 0,
                remainingSeconds: remainingSeconds,
                hpRemaining: hp
            };
            
            // Reset for next level
            missionProgressRef.current = { combo: 0, addCombo: 0, match: 0, hints: 0, shuffles: 0, score: 0, wrong: 0 };
            
            const progressProfile = p; const rewardGiven = null;
            
            // Simpan level & status barang ke cloud otomatis
            const newProfile = {
                ...progressProfile,
                currentLevel: nextLevel,
                currentScore: 0,
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

    const prepareLevel = async (startLevel, providedBoard = null, providedTheme = null, startScore = null, startHp = null, startHints = null, startShuffles = null, startProgress = null, startMatchedTiles = null, startSelectedTile = null, startComboCount = 0, startLastMatchTime = 0, targetStartAt = null) => {
        const currentT = providedTheme || activeThemeRef.current;
        const b = providedBoard || generateBoard(currentT, startLevel);
        window.initialMultiplayerTiles = b.flat().filter(v => v !== 0).length;
        setBoard(b); setLevel(startLevel);
        
        // Gunakan nilai yang di pass, jika tidak ambil dari profile saat ini
        // Score selalu dimulai dari 0 kecuali saat melanjutkan dari session.
        setScore(startScore !== null ? startScore : 0);
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
        setWrongTile(null);
        setWrongConnectionPenalty(null);
        setComboDisplay(null);
        setHintActiveTiles([]);
        setActivePath(null);
                
        
        setGameState('LOADING_BOARD'); setProgress(0); 
        let p = 0; const interval = setInterval(() => { p += 25; setProgress(p); }, 100);
        await new Promise(r => setTimeout(r, 400)); clearInterval(interval); 
        setProgress(startProgress !== null ? startProgress : 100);
        
        const startAt = targetStartAt || (Date.now() + 3700);
        setLevelStartTime(startAt);
        runCountdownThenPlay(startAt, startSelectedTile);
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
            setMatchedTiles(prev => [...prev, ...newMatches]); setHintActiveTiles([]); setHintPath(null); setActivePath(path); AudioEngine.match();

            setShowTimerAdd(true); setTimeout(() => setShowTimerAdd(false), 900); setSelectedTile(null); 

            setTimeout(() => {
                setBoard(prev => {
                    const newBoard = prev.map(row => [...row]);
                    if (newBoard[r1][c1] !== 0 && newBoard[r][c] !== 0) {
                        newBoard[r1][c1] = 0; newBoard[r][c] = 0;
                        if (countRemaining(newBoard) === 0) { if(window.isMultiplayerMatch) { setTimeout(() => window.handleMultiplayerClear(), 0); } else { setTimeout(() => handleLevelCleared(), 0); } }
                        else if (!findHint(newBoard)) setTimeout(() => handleDeadlock(newBoard), 0);
                    }
                    if (window.isMultiplayerMatch) { 
                        const remaining = newBoard.flat().filter(v => v !== 0).length;
                        const initial = window.initialMultiplayerTiles || 192;
                        setProgress(Math.floor(((initial - remaining) / initial) * 100)); 
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
                const timeSinceLastMatchMs = lastMatchTimeRef.current > 0 ? now - lastMatchTimeRef.current : 10000;
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
                
                setScore(s => {
                    const currentBest = profileRef.current?.statistics?.highestScore || 0;
                    const { newScore, gained, isNewRecord } = applyMatchScore(s, timeSinceLastMatchMs, comboCountRef.current, currentBest);
                    
                    if (comboCountRef.current > 1) {
                        setComboDisplay({ count: comboCountRef.current, bonus: gained, r, c });
                        setTimeout(() => setComboDisplay(null), 900);
                    }
                    
                    missionProgressRef.current.score += gained;
                    setProfile(p => updateMissions(p, "score", gained));

                    if (isNewRecord) setIsNewRecord(true);
                    return newScore;
                });
                const addSec = Math.max(1, 5 - Math.floor((level - 1) / 5));
                const addPct = (addSec * 1000) / 90000 * 100;
                setProgress(p => Math.min(100, p + addPct)); 
            }, 350); 
        } else {
            if (virtualBoard[selectedTile.r][selectedTile.c] === virtualBoard[r][c]) {
                AudioEngine.wrong(); 
                missionProgressRef.current.wrong = (missionProgressRef.current.wrong || 0) + 1; 
                wrongPendingRef.current += 1; 
                setWrongTile({r, c}); 
                setTimeout(() => setWrongTile(null), 380); 
                setSelectedTile(null);
                
                const penaltySec = Math.min(15, 1 + level);
                const penaltyPct = (penaltySec * 1000) / 90000 * 100; 
                setProgress(p => Math.max(0, p - penaltyPct));
                setWrongConnectionPenalty({ r, c, sec: penaltySec });
                setTimeout(() => setWrongConnectionPenalty(null), 1000);
            } else {
                AudioEngine.uiClick();
                setWrongTile({r, c});
                setTimeout(() => setWrongTile(null), 380);
                setSelectedTile({r, c});
            }
        }
    };

    useEffect(() => {
        if (gameState !== 'PLAYING' || window.isMultiplayerMatch) return;
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
            triggerLevelEndStats(true); // Always GAME OVER
        }, 1000);
    };

    const handleShuffleClick = () => { 
        if (gameState !== 'PLAYING' || window.isMultiplayerMatch) return;
        if (shuffles > 0) { 
            comboCountRef.current = 0; // Memutus combo aktif
            setShuffles(s => s - 1); missionProgressRef.current.shuffles += 1; setProfile(p => updateMissions(p, 'useShuffle', 1)); shufflesPendingRef.current += 1; AudioEngine.shuffle(); setHintActiveTiles([]); setHintPath(null); handleDeadlock(board); setSelectedTile(null); 
        } else if (hp > 1) {
            comboCountRef.current = 0; // Memutus combo aktif
            setHp(h => h - 1); missionProgressRef.current.shuffles += 1; 
            AudioEngine.shuffle(); setHintActiveTiles([]); setHintPath(null); handleDeadlock(board); setSelectedTile(null);
            window.Dialog.showInfo("Pakai Nyawa", "Kamu menggunakan 1 Nyawa untuk Shuffle!");
            let p = updateMissions(profile, 'useShuffle', 1);
            p = flushStats(p);
            setProfile(p);
            saveProfile(playerName, p);
        } else {
            window.Dialog.showError("Gagal", "Tidak ada Shuffle dan Nyawa tidak cukup (Minimal 2).");
        }
    };
    
    const handleHintClick = () => {
        if (gameState !== 'PLAYING' || window.isMultiplayerMatch) return;
        const hintData = findHint(board);
        if (!hintData) return;

        if (hints > 0) {
            comboCountRef.current = 0; // Memutus combo aktif
            setHints(h => h - 1); missionProgressRef.current.hints += 1; hintsPendingRef.current += 1; setProfile(p => updateMissions(p, 'useHint', 1)); AudioEngine.hint(); setHintActiveTiles([{r: hintData.p1.r, c: hintData.p1.c}, {r: hintData.p2.r, c: hintData.p2.c}]); setHintPath(hintData.path); 
        } else if (hp > 1) {
            comboCountRef.current = 0; // Memutus combo aktif
            setHp(h => h - 1); missionProgressRef.current.hints += 1; 
            AudioEngine.hint(); setHintActiveTiles([{r: hintData.p1.r, c: hintData.p1.c}, {r: hintData.p2.r, c: hintData.p2.c}]); setHintPath(hintData.path); 
            window.Dialog.showInfo("Pakai Nyawa", "Kamu menggunakan 1 Nyawa untuk Hint!");
            let p = updateMissions(profile, 'useHint', 1);
            p = flushStats(p);
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
        
        const hpNeeded = 5 - hp;
        const costPerHp = 15;
        const totalCost = hpNeeded * costPerHp;

        window.Dialog.showConfirm("Isi Penuh Nyawa", `Isi penuh Nyawa (+${hpNeeded}) seharga ${totalCost} Gem?`, "Beli", "Batal", () => {
            if ((profile.gems || 0) < totalCost) {
                window.Dialog.showError("Gagal", `Gem tidak cukup! Butuh ${totalCost} Gem.`);
                return;
            }
            setHp(5);
            const newProfile = { ...profile, gems: profile.gems - totalCost, hp: 5, lastHpRegenTime: null };
            setProfile(newProfile);
            saveProfile(playerName, newProfile);
            window.Dialog.showSuccess("Berhasil", "Nyawa sudah terisi penuh!");
        });
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
        gameState, setGameState, activeTheme, activeThemeRef, gameStateRef, board, score, hp, hints, shuffles, level, progress, showTimerAdd, wrongConnectionPenalty, activePath, wrongTile, hintPath, hintActiveTiles, matchedTiles, selectedTile, isMuted, setIsMuted, isStandalone, deferredPrompt, playerName, setPlayerName, loginError, setLoginError, lobbyBadgeText, isLoadingProfile, syncStatus, showSyncLog, setShowSyncLog, syncLogs, startupStep, startupMessage, startupProgress, showCloudRecovery, localRecoveryProfile, setShowCloudRecovery, setSelectedTile, setActiveTheme, setBoard, finishStartup, getDefaultProfile: window.getDefaultProfile, profile, setProfile, isNewRecord, countdown, setCountdown, comboDisplay, setComboDisplay, showBoardClear, setShowBoardClear, showTimeoutFlash, setShowTimeoutFlash, sweetMessage, setSweetMessage,  showSettings, setShowSettings, showCustomThemeEditor, setShowCustomThemeEditor, splashText, handleLoginSubmit, handleLogout, handleBuyHpInGame, handleHintClick, handleShuffleClick, handleTileClick, getSecondsLeft, handleBuyStore, handleSellStore, handleClaimDaily, handleClaimAchievement, handleClaimMilestone, handleMysteryGiftComplete, prepareLevel, handleClaimLoginReward, THEMES, formatNumber, calculateCoinReward, AudioEngine, saveProfile, window, saveCurrentSession, flushStats
    };

    return (
        <GameContext.Provider value={ctxValue}>
            <GameUI />
            <DialogManager />
        </GameContext.Provider>
    );
};

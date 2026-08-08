window.useStartupManager = ({ 
    profile, setProfile, playerName, setPlayerName, setLoginError,
    gameState, setGameState, setGameStateInternal,
    setActiveTheme, setScore, setLevel, setHp, setHints, setShuffles, setBoard, setShowSettings, historyDepthRef
}) => {
    const { useState, useEffect } = React;
    
    useEffect(() => {
        if (gameState === 'STARTUP' && playerName) {
            handleLoginSubmit(true);
        }
    }, []); // Only run once on mount if we start in STARTUP state
    const [startupStep, setStartupStep] = useState(0);
    const [startupMessage, setStartupMessage] = useState('');
    const [startupProgress, setStartupProgress] = useState(0);

    const logSync = (status, action, result) => {
        window.dispatchEvent(new CustomEvent('syncLog', { detail: { status, action, result } }));
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
        
        Object.keys(window.THEMES).forEach(k => {
            if (window.THEMES[k].price === 0 && !finalProfile.unlockedThemes.includes(k)) {
                finalProfile.unlockedThemes.push(k);
            }
        });

        if (finalProfile.customEmojis && finalProfile.customEmojis.length > 0) {
            window.THEMES.custom.data = finalProfile.customEmojis;
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
        
        if (window.AudioEngine) window.AudioEngine.uiReturnMenu();
        if (window.setStartupComplete) window.setStartupComplete(true);
        const loginStatus = window.checkLoginRewardStatus(finalProfile);
        if (loginStatus.canClaim) {
            setGameState('LOGIN_REWARD');
        } else {
            setGameState('LOBBY_MAIN');
        }
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
            finalProfile = await window.SaveEngine.loadProfile(name);
            logSync('Connected', 'Download Cloud', 'Save Engine Load Success');
            
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

        if (!isColdStart) {
            const themeToApply = finalProfile.activeTheme || 'sweets';
            setActiveTheme(themeToApply);
            setGameState('STARTUP');
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

    const handleLoginSubmit = async (isColdStart = false) => {
        if (playerName.trim()) {
            const name = playerName.trim();
            // Session is created in SaveEngine.loadProfile called by runStartup
            // localStorage.setItem('pkmnPlayerName', name); 
            setLoginError(''); 
            runStartup(name, isColdStart);
        } else setLoginError('Nama tidak boleh kosong!');
    };

    const handleLogout = () => {
        if (window.SaveEngine) window.SaveEngine.logout();
        if (window.AudioEngine) window.AudioEngine.stopBgm();
        if (window.NotificationManager) window.NotificationManager.reset();
        // localStorage.removeItem('pkmnPlayerName'); handled by SaveEngine.logout()
        try { 
            localStorage.removeItem('pkmnActiveSession_' + playerName); 
            if (playerName) {
                localStorage.removeItem('pkmn_trial_' + playerName);
            }
        } catch(e) {}
        
        setPlayerName('');
        setProfile(window.getDefaultProfile ? window.getDefaultProfile() : null);
        setActiveTheme('sweets');
        setScore(0);
        setLevel(1);
        setHp(5);
        setHints(3);
        setShuffles(3);
        setBoard([]);
        
        setShowSettings(false);
        if (window.PopupManager && window.PopupManager._activePopups) {
            window.PopupManager._activePopups = [];
        }

        historyDepthRef.current = 0;
        
        setGameStateInternal('LOGIN');
        window.dispatchEvent(new Event('userLogout'));
        window.history.replaceState({ isAppHistory: true, gameState: 'LOGIN', depth: 0 }, '', '');
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
             window.saveProfile(playerName, newProfile);
        }

        setGameState('LOBBY_MAIN');
    };

    return { 
        startupStep, startupMessage, startupProgress,
        runStartup, finishStartup, handleLoginSubmit, handleLogout, handleClaimLoginReward 
    };
};

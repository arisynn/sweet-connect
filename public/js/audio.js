// ===================== WEB AUDIO =====================
// ===================== WEB AUDIO =====================
const AudioEngine = (() => {
    let ctx = null; 
    
    // Default settings
    let settings = {
        musicVol: 100,
        sfxVol: 100,
        muteMusic: false,
        muteSfx: false
    };

    const saveSettings = () => {
        // CLOUD-ONLY: Audio settings are managed via the profile system
    };

    const getCtx = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
    
    // Background Music
    let bgmMenu = null;
    let bgmGame = null;
    let currentBgm = null;
    let fadeInterval = null;
    let targetVol = settings.musicVol / 100 * 0.3; // base max volume 0.3

    try {
        bgmMenu = new Audio('/assets/sounds/menu.mp3');
        bgmMenu.loop = true;
        bgmMenu.volume = 0; // start silent for fade
        
        bgmGame = new Audio('/assets/sounds/game.mp3');
        bgmGame.loop = true;
        bgmGame.volume = 0;
    } catch(e) {}

    const applyMusicVolume = () => {
        targetVol = settings.muteMusic ? 0 : (settings.musicVol / 100 * 0.3);
        if (currentBgm && !fadeInterval) {
            currentBgm.volume = targetVol;
        }
    };

    const fadeOut = (audio, callback) => {
        if (!audio) {
            if (callback) callback();
            return;
        }
        let vol = audio.volume;
        const step = vol / 20;
        const interval = setInterval(() => {
            vol -= step;
            if (vol <= 0) {
                vol = 0;
                audio.volume = vol;
                audio.pause();
                audio.currentTime = 0;
                clearInterval(interval);
                if (callback) callback();
            } else {
                audio.volume = vol;
            }
        }, 20);
    };

    const fadeIn = (audio) => {
        if (!audio) return;
        audio.volume = 0;
        if (!settings.muteMusic) {
            let p = audio.play();
            if (p !== undefined) p.catch(() => {});
        } else {
            // Still "play" silently in case it's unmuted later
            let p = audio.play();
            if (p !== undefined) p.catch(() => {});
        }
        let vol = 0;
        const finalVol = settings.muteMusic ? 0 : (settings.musicVol / 100 * 0.3);
        const step = Math.max(0.01, finalVol / 20);
        
        clearInterval(fadeInterval);
        fadeInterval = setInterval(() => {
            vol += step;
            if (vol >= finalVol) {
                vol = finalVol;
                audio.volume = vol;
                clearInterval(fadeInterval);
                fadeInterval = null;
            } else {
                audio.volume = vol;
            }
        }, 20);
    };

    const playBgm = (bgm) => {
        if (!bgm) return;
        if (currentBgm === bgm) return; // already playing
        
        const previousBgm = currentBgm;
        currentBgm = bgm;
        
        if (previousBgm) {
            fadeOut(previousBgm, () => {
                fadeIn(bgm);
            });
        } else {
            fadeIn(bgm);
        }
    };

    // Tab visibility handling
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (currentBgm) {
                currentBgm.pause();
            }
        } else {
            if (currentBgm && !settings.muteMusic) {
                currentBgm.play().catch(() => {});
            }
        }
    });

    const play = (freqs, dur, type = 'sine', vol = 0.3, delay = 0) => {
        if (settings.muteSfx) return;
        
        // Scale by SFX volume
        const sfxScale = settings.sfxVol / 100;
        if (sfxScale === 0) return;
        
        const finalVol = vol * Math.min(1, sfxScale); // keep the mix balanced

        try {
            const ac = getCtx();
            freqs.forEach(({ f, t, d }) => {
                const osc = ac.createOscillator(); const gain = ac.createGain();
                osc.connect(gain); gain.connect(ac.destination); osc.type = type;
                osc.frequency.setValueAtTime(f, ac.currentTime + delay + t);
                gain.gain.setValueAtTime(finalVol, ac.currentTime + delay + t);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + t + d);
                osc.start(ac.currentTime + delay + t); osc.stop(ac.currentTime + delay + t + d + 0.05);
            });
        } catch(e) {}
    };

    // UI Sounds rate limiting to prevent spam
    let lastUiSoundTime = 0;
    const playUiSound = (freqs, dur, type = 'sine', vol = 0.1) => {
        const now = Date.now();
        if (now - lastUiSoundTime < 50) return; // debounce
        lastUiSoundTime = now;
        play(freqs, dur, type, vol);
    };

    return {
        // Settings API
        getSettings: () => ({ ...settings }),
        updateSettings: (newSettings) => {
            settings = { ...settings, ...newSettings };
            saveSettings();
            applyMusicVolume();
        },
        
        // BGM API
        playMenuBgm: () => playBgm(bgmMenu),
        playGameBgm: () => playBgm(bgmGame),
        stopBgm: () => {
            if (currentBgm) {
                fadeOut(currentBgm, () => {
                    currentBgm = null;
                });
            }
        },

        // Gameplay SFX
        match: () => play([{ f: 523, t: 0, d: 0.1 }, { f: 659, t: 0.08, d: 0.1 }, { f: 784, t: 0.16, d: 0.2 }], 0.4, 'triangle', 0.25),
        wrong: () => play([{ f: 180, t: 0, d: 0.1 }], 0.1, 'sawtooth', 0.15),
        hint: () => play([{ f: 880, t: 0, d: 0.2 }], 0.2, 'sine', 0.2),
        shuffle: () => play([400, 500, 350, 600, 450].map((f, i) => ({ f, t: i * 0.05, d: 0.1 })), 0.3, 'sine', 0.2),
        tick: (n) => { const f = n === 'GO!' ? 880 : (n === 1 ? 660 : n === 2 ? 587 : 523); play([{ f, t: 0, d: n === 'GO!' ? 0.3 : 0.15 }], 0.15, 'triangle', 0.3); },
        levelClear: () => play([{ f: 523, t: 0, d: 0.1 }, { f: 659, t: 0.1, d: 0.1 }, { f: 784, t: 0.2, d: 0.1 }, { f: 1047, t: 0.3, d: 0.3 }], 0.5, 'triangle', 0.25),
        gameOver: () => play([{ f: 440, t: 0, d: 0.15 }, { f: 370, t: 0.15, d: 0.15 }, { f: 294, t: 0.3, d: 0.3 }], 0.5, 'sawtooth', 0.2),
        timeout: () => play([{ f: 300, t: 0, d: 0.2 }, { f: 220, t: 0.2, d: 0.3 }], 0.5, 'sawtooth', 0.2),
        spin: () => play([{f: 600, t:0, d:0.1}], 0.1, 'sine', 0.1),
        winPrize: () => play([{ f: 440, t: 0, d: 0.1 }, { f: 554, t: 0.1, d: 0.1 }, { f: 659, t: 0.2, d: 0.3 }], 0.5, 'triangle', 0.3),
        
        // UI SFX
        uiClick: () => playUiSound([{ f: 700, t: 0, d: 0.05 }], 0.05, 'sine', 0.05),
        uiOpen: () => playUiSound([{ f: 400, t: 0, d: 0.05 }, { f: 600, t: 0.05, d: 0.05 }], 0.1, 'sine', 0.05),
        uiClose: () => playUiSound([{ f: 600, t: 0, d: 0.05 }, { f: 400, t: 0.05, d: 0.05 }], 0.1, 'sine', 0.05),
        uiSwitchTab: () => playUiSound([{ f: 550, t: 0, d: 0.05 }], 0.05, 'triangle', 0.03),
        uiConfirm: () => playUiSound([{ f: 500, t: 0, d: 0.05 }, { f: 750, t: 0.05, d: 0.1 }], 0.15, 'sine', 0.06),
        uiCancel: () => playUiSound([{ f: 300, t: 0, d: 0.05 }, { f: 250, t: 0.05, d: 0.1 }], 0.15, 'sine', 0.06),
        uiBuy: () => playUiSound([{ f: 800, t: 0, d: 0.05 }, { f: 1000, t: 0.05, d: 0.1 }], 0.15, 'triangle', 0.06),
        uiError: () => playUiSound([{ f: 200, t: 0, d: 0.1 }], 0.1, 'sawtooth', 0.05),
        uiReward: () => playUiSound([{ f: 600, t: 0, d: 0.1 }, { f: 800, t: 0.1, d: 0.1 }, { f: 1000, t: 0.2, d: 0.2 }], 0.4, 'sine', 0.08),
        uiSuccess: () => playUiSound([{ f: 440, t: 0, d: 0.1 }, { f: 660, t: 0.1, d: 0.2 }], 0.3, 'sine', 0.1),
        uiAchievement: () => playUiSound([{ f: 440, t: 0, d: 0.1 }, { f: 554, t: 0.1, d: 0.1 }, { f: 659, t: 0.2, d: 0.1 }, { f: 880, t: 0.3, d: 0.3 }], 0.6, 'triangle', 0.1),
        uiPopupOpen: () => playUiSound([{ f: 300, t: 0, d: 0.1 }, { f: 400, t: 0.05, d: 0.1 }], 0.15, 'sine', 0.05),
        uiPopupClose: () => playUiSound([{ f: 400, t: 0, d: 0.1 }, { f: 300, t: 0.05, d: 0.1 }], 0.15, 'sine', 0.05),
        uiStartGame: () => playUiSound([{ f: 440, t: 0, d: 0.1 }, { f: 660, t: 0.1, d: 0.1 }, { f: 880, t: 0.2, d: 0.2 }], 0.4, 'square', 0.05),
        uiReturnMenu: () => playUiSound([{ f: 600, t: 0, d: 0.1 }, { f: 400, t: 0.1, d: 0.1 }, { f: 300, t: 0.2, d: 0.2 }], 0.4, 'sine', 0.05),
    };
})();


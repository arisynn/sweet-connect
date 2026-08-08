// ===================== WEB AUDIO =====================
window.AudioEngine = (() => {
    let ctx = null; 
    
    // Default settings
    let settings = {
        musicVol: 100,
        sfxVol: 100,
        muteMusic: false,
        muteSfx: false
    };

    try {
        const saved = localStorage.getItem('sweetConnectAudioSettings');
        if (saved) {
            settings = { ...settings, ...JSON.parse(saved) };
        }
    } catch(e) {}

    const saveSettings = () => {
        try {
            localStorage.setItem('sweetConnectAudioSettings', JSON.stringify(settings));
            localStorage.setItem('pkmnIsMuted', String(settings.muteMusic && settings.muteSfx));
        } catch(e) {}
    };

    const getCtx = () => {
        if (!ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) ctx = new AudioCtx();
        }
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
        return ctx;
    };
    
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

    // ================= SFX SYNTHESIS HELPERS =================
    const getSfxVolume = (baseVol = 0.2) => {
        if (settings.muteSfx) return 0;
        const scale = settings.sfxVol / 100;
        return baseVol * Math.min(1, Math.max(0, scale));
    };

    // High quality synth note helper with envelopes & pitch ramps
    const playNote = (opts = {}) => {
        const vol = getSfxVolume(opts.vol ?? 0.2);
        if (vol <= 0.0001) return;

        const ac = getCtx();
        if (!ac) return;

        try {
            const startTime = ac.currentTime + (opts.delay || 0);
            const attack = opts.attack || 0.005;
            const decay = opts.decay || 0.15;
            const stopTime = startTime + attack + decay + 0.05;

            const osc = ac.createOscillator();
            const gain = ac.createGain();

            osc.type = opts.type || 'sine';
            const startF = opts.freq || 440;
            const endF = opts.endFreq !== undefined ? opts.endFreq : startF;

            osc.frequency.setValueAtTime(startF, startTime);
            if (endF !== startF) {
                if (opts.ramp === 'exponential' && startF > 0 && endF > 0) {
                    osc.frequency.exponentialRampToValueAtTime(endF, startTime + attack + decay);
                } else {
                    osc.frequency.linearRampToValueAtTime(endF, startTime + attack + decay);
                }
            }

            // Envelope: fast linear attack, exponential decay
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.linearRampToValueAtTime(vol, startTime + attack);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attack + decay);

            if (opts.filterFreq) {
                const filter = ac.createBiquadFilter();
                filter.type = opts.filterType || 'lowpass';
                filter.frequency.setValueAtTime(opts.filterFreq, startTime);
                osc.connect(filter);
                filter.connect(gain);
            } else {
                osc.connect(gain);
            }

            gain.connect(ac.destination);

            osc.start(startTime);
            osc.stop(stopTime);
        } catch(e) {}
    };

    // Filtered noise generator for subtle clicks and swooshes
    const playNoise = (opts = {}) => {
        const vol = getSfxVolume(opts.vol ?? 0.05);
        if (vol <= 0.0001) return;

        const ac = getCtx();
        if (!ac) return;

        try {
            const duration = opts.duration || 0.05;
            const startTime = ac.currentTime + (opts.delay || 0);
            const bufferSize = Math.floor(ac.sampleRate * duration);
            if (bufferSize <= 0) return;

            const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ac.createBufferSource();
            noise.buffer = buffer;

            const filter = ac.createBiquadFilter();
            filter.type = opts.filterType || 'bandpass';
            filter.frequency.setValueAtTime(opts.filterFreq || 1000, startTime);
            if (opts.Q) filter.Q.value = opts.Q;

            const gain = ac.createGain();
            gain.gain.setValueAtTime(vol, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ac.destination);

            noise.start(startTime);
            noise.stop(startTime + duration + 0.01);
        } catch(e) {}
    };

    // UI Sounds rate limiting to prevent audio overload
    let lastUiSoundTime = 0;
    const debounceUi = (fn) => {
        const now = Date.now();
        if (now - lastUiSoundTime < 40) return;
        lastUiSoundTime = now;
        fn();
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
        match: () => {
            // Bright, juicy match-3 pitch rise + subtle harmonic pop
            playNote({ freq: 523, endFreq: 659, type: 'sine', attack: 0.005, decay: 0.1, vol: 0.22, delay: 0 });
            playNote({ freq: 659, endFreq: 784, type: 'sine', attack: 0.005, decay: 0.1, vol: 0.24, delay: 0.06 });
            playNote({ freq: 784, endFreq: 1046, type: 'triangle', attack: 0.005, decay: 0.18, vol: 0.25, delay: 0.12 });
            playNote({ freq: 2093, type: 'sine', attack: 0.002, decay: 0.1, vol: 0.06, delay: 0.12 });
        },

        wrong: () => {
            // Soft downward slide with subtle lowpass filter (non-annoying)
            playNote({ freq: 280, endFreq: 180, type: 'triangle', attack: 0.005, decay: 0.12, vol: 0.16, filterFreq: 500 });
            playNote({ freq: 220, endFreq: 140, type: 'sine', attack: 0.005, decay: 0.12, vol: 0.12, delay: 0.02 });
        },

        hint: () => {
            // Friendly, gentle attention chime with soft pitch lift
            playNote({ freq: 659, endFreq: 880, type: 'sine', attack: 0.01, decay: 0.18, vol: 0.18 });
            playNote({ freq: 880, endFreq: 1175, type: 'sine', attack: 0.01, decay: 0.22, vol: 0.18, delay: 0.07 });
        },

        shuffle: () => {
            // Dynamic multi-tone card/tile swoosh rustle
            playNote({ freq: 350, endFreq: 520, type: 'sine', attack: 0.005, decay: 0.06, vol: 0.12, delay: 0 });
            playNote({ freq: 480, endFreq: 680, type: 'sine', attack: 0.005, decay: 0.06, vol: 0.12, delay: 0.04 });
            playNote({ freq: 400, endFreq: 600, type: 'sine', attack: 0.005, decay: 0.06, vol: 0.12, delay: 0.08 });
            playNote({ freq: 580, endFreq: 780, type: 'triangle', attack: 0.005, decay: 0.08, vol: 0.14, delay: 0.12 });
            playNoise({ duration: 0.14, filterFreq: 1400, Q: 2, vol: 0.04, delay: 0.02 });
        },

        tick: (n) => {
            if (n === 'GO!') {
                playNote({ freq: 880, endFreq: 1175, type: 'triangle', attack: 0.005, decay: 0.22, vol: 0.28 });
                playNote({ freq: 1046, type: 'sine', attack: 0.005, decay: 0.25, vol: 0.2, delay: 0.02 });
            } else {
                const f = n === 1 ? 660 : n === 2 ? 587 : 523;
                playNote({ freq: f, endFreq: f * 0.7, type: 'triangle', attack: 0.002, decay: 0.08, vol: 0.2, filterFreq: 1200 });
                playNoise({ duration: 0.02, filterFreq: 2200, vol: 0.03 });
            }
        },

        levelClear: () => {
            // Rewarding arpeggio sequence with sparkling release
            const notes = [523, 659, 784, 987, 1046];
            notes.forEach((freq, idx) => {
                playNote({
                    freq,
                    type: idx === notes.length - 1 ? 'triangle' : 'sine',
                    attack: 0.005,
                    decay: idx === notes.length - 1 ? 0.35 : 0.14,
                    vol: 0.22,
                    delay: idx * 0.07
                });
            });
            playNote({ freq: 2093, type: 'sine', attack: 0.002, decay: 0.3, vol: 0.08, delay: 0.28 });
        },

        gameOver: () => {
            // Warm, melancholic soft descending chord
            playNote({ freq: 392, endFreq: 349, type: 'triangle', attack: 0.01, decay: 0.22, vol: 0.18, delay: 0 });
            playNote({ freq: 329, endFreq: 293, type: 'triangle', attack: 0.01, decay: 0.22, vol: 0.18, delay: 0.16 });
            playNote({ freq: 261, endFreq: 220, type: 'sine', attack: 0.01, decay: 0.35, vol: 0.2, delay: 0.32, filterFreq: 600 });
        },

        timeout: () => {
            // Time out double drop warning chime
            playNote({ freq: 523, endFreq: 392, type: 'triangle', attack: 0.005, decay: 0.12, vol: 0.2, delay: 0 });
            playNote({ freq: 392, endFreq: 261, type: 'triangle', attack: 0.005, decay: 0.18, vol: 0.22, delay: 0.12 });
        },

        spin: () => {
            // Crisp wheel ratchet click
            playNote({ freq: 700, endFreq: 250, type: 'sine', attack: 0.002, decay: 0.035, vol: 0.12 });
            playNoise({ duration: 0.02, filterFreq: 1800, vol: 0.03 });
        },

        winPrize: () => {
            // Upbeat sparkling prize chime arpeggio
            const freqs = [523, 659, 784, 1046, 1318];
            freqs.forEach((freq, idx) => {
                playNote({
                    freq,
                    type: 'sine',
                    attack: 0.004,
                    decay: idx === freqs.length - 1 ? 0.3 : 0.12,
                    vol: 0.2,
                    delay: idx * 0.05
                });
            });
            playNote({ freq: 2637, type: 'sine', attack: 0.002, decay: 0.25, vol: 0.08, delay: 0.2 });
        },
        
        // UI SFX
        uiClick: () => debounceUi(() => {
            playNote({ freq: 450, endFreq: 180, type: 'sine', attack: 0.002, decay: 0.025, vol: 0.08 });
            playNoise({ duration: 0.015, filterFreq: 2000, vol: 0.02 });
        }),

        uiOpen: () => debounceUi(() => {
            playNote({ freq: 300, endFreq: 550, type: 'sine', attack: 0.003, decay: 0.07, vol: 0.1 });
            playNote({ freq: 150, endFreq: 275, type: 'sine', attack: 0.003, decay: 0.05, vol: 0.05 });
        }),

        uiClose: () => debounceUi(() => {
            playNote({ freq: 500, endFreq: 280, type: 'sine', attack: 0.003, decay: 0.06, vol: 0.09 });
        }),

        uiSwitchTab: () => debounceUi(() => {
            playNote({ freq: 620, endFreq: 780, type: 'sine', attack: 0.002, decay: 0.04, vol: 0.06 });
        }),

        uiConfirm: () => debounceUi(() => {
            playNote({ freq: 587, type: 'sine', attack: 0.004, decay: 0.08, vol: 0.1, delay: 0 });
            playNote({ freq: 880, type: 'triangle', attack: 0.004, decay: 0.14, vol: 0.12, delay: 0.05 });
        }),

        uiCancel: () => debounceUi(() => {
            playNote({ freq: 523, type: 'sine', attack: 0.004, decay: 0.06, vol: 0.08, delay: 0 });
            playNote({ freq: 392, type: 'sine', attack: 0.004, decay: 0.1, vol: 0.08, delay: 0.04 });
        }),

        uiBuy: () => debounceUi(() => {
            playNote({ freq: 784, type: 'sine', attack: 0.003, decay: 0.08, vol: 0.12, delay: 0 });
            playNote({ freq: 1175, type: 'triangle', attack: 0.003, decay: 0.12, vol: 0.14, delay: 0.05 });
            playNote({ freq: 1568, type: 'sine', attack: 0.002, decay: 0.18, vol: 0.1, delay: 0.1 });
        }),

        uiError: () => debounceUi(() => {
            playNote({ freq: 220, endFreq: 160, type: 'square', attack: 0.005, decay: 0.08, vol: 0.06, filterFreq: 400 });
            playNote({ freq: 180, endFreq: 130, type: 'square', attack: 0.005, decay: 0.1, vol: 0.06, delay: 0.07, filterFreq: 400 });
        }),

        uiReward: () => debounceUi(() => {
            const freqs = [523, 659, 784, 1046];
            freqs.forEach((freq, idx) => {
                playNote({ freq, type: 'sine', attack: 0.004, decay: 0.15, vol: 0.12, delay: idx * 0.06 });
            });
            playNote({ freq: 1568, type: 'sine', attack: 0.002, decay: 0.2, vol: 0.06, delay: 0.18 });
        }),

        uiSuccess: () => debounceUi(() => {
            playNote({ freq: 523, type: 'sine', attack: 0.004, decay: 0.08, vol: 0.1, delay: 0 });
            playNote({ freq: 784, type: 'triangle', attack: 0.004, decay: 0.18, vol: 0.12, delay: 0.06 });
        }),

        uiAchievement: () => debounceUi(() => {
            // Rich multi-chord fanfare chime
            playNote({ freq: 523, type: 'sine', attack: 0.005, decay: 0.2, vol: 0.12, delay: 0 });
            playNote({ freq: 784, type: 'sine', attack: 0.005, decay: 0.2, vol: 0.1, delay: 0 });

            playNote({ freq: 659, type: 'sine', attack: 0.005, decay: 0.2, vol: 0.12, delay: 0.08 });
            playNote({ freq: 987, type: 'sine', attack: 0.005, decay: 0.2, vol: 0.1, delay: 0.08 });

            playNote({ freq: 784, type: 'sine', attack: 0.005, decay: 0.25, vol: 0.14, delay: 0.16 });
            playNote({ freq: 1175, type: 'triangle', attack: 0.005, decay: 0.25, vol: 0.12, delay: 0.16 });

            playNote({ freq: 1046, type: 'sine', attack: 0.005, decay: 0.35, vol: 0.16, delay: 0.24 });
            playNote({ freq: 1568, type: 'triangle', attack: 0.005, decay: 0.35, vol: 0.14, delay: 0.24 });
            playNote({ freq: 2093, type: 'sine', attack: 0.002, decay: 0.3, vol: 0.08, delay: 0.24 });
        }),

        uiPopupOpen: () => debounceUi(() => {
            playNote({ freq: 300, endFreq: 550, type: 'sine', attack: 0.003, decay: 0.07, vol: 0.1 });
            playNote({ freq: 150, endFreq: 275, type: 'sine', attack: 0.003, decay: 0.05, vol: 0.05 });
        }),

        uiPopupClose: () => debounceUi(() => {
            playNote({ freq: 500, endFreq: 280, type: 'sine', attack: 0.003, decay: 0.06, vol: 0.09 });
        }),

        uiStartGame: () => debounceUi(() => {
            playNote({ freq: 350, endFreq: 700, type: 'sine', attack: 0.005, decay: 0.1, vol: 0.14, delay: 0 });
            playNote({ freq: 784, type: 'triangle', attack: 0.004, decay: 0.2, vol: 0.15, delay: 0.08 });
            playNote({ freq: 1046, type: 'sine', attack: 0.004, decay: 0.25, vol: 0.15, delay: 0.08 });
        }),

        uiReturnMenu: () => debounceUi(() => {
            playNote({ freq: 659, endFreq: 523, type: 'sine', attack: 0.005, decay: 0.1, vol: 0.1, delay: 0 });
            playNote({ freq: 523, endFreq: 392, type: 'sine', attack: 0.005, decay: 0.18, vol: 0.1, delay: 0.07, filterFreq: 800 });
        }),
    };
})();

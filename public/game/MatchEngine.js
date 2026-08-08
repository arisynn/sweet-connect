window.useMatchEngine = ({
    profile, setProfile, profileRef, playerName,
    gameState, setGameState, gameStateRef,
    activeThemeRef, core
}) => {
    const {
        board, setBoard, level, setLevel, score, setScore, hp, setHp, hints, setHints, shuffles, setShuffles,
        progress, setProgress, selectedTile, setSelectedTile, matchedTiles, setMatchedTiles, hintActiveTiles, setHintActiveTiles,
        activePath, setActivePath, hintPath, setHintPath, wrongTile, setWrongTile, wrongConnectionPenalty, setWrongConnectionPenalty,
        showTimerAdd, setShowTimerAdd, showTimeoutFlash, setShowTimeoutFlash, showBoardClear, setShowBoardClear,
        isMuted, setIsMuted, isNewRecord, setIsNewRecord, levelStartTime, setLevelStartTime, countdown, setCountdown,
        comboDisplay, setComboDisplay, sweetMessage, setSweetMessage, boardRef, matchesPendingRef, combosPendingRef,
        hintsPendingRef, shufflesPendingRef, highestComboPendingRef, wrongPendingRef, playTimeAccumRef, lastMatchTimeRef,
        comboCountRef, missionProgressRef, flushStats, saveCurrentSession
    } = core;
    const { useCallback, useEffect } = React;
    const COMBO_WINDOW_MS = 3000;

    const triggerLevelEndStats = useCallback(async (isGameOver = false) => {
        try { localStorage.removeItem('pkmnActiveSession_' + playerName); } catch(e) {}
        if (isGameOver) {
            const trialJson = localStorage.getItem(`pkmn_trial_${playerName}`);
            if (trialJson) {
                try {
                    const trial = JSON.parse(trialJson);
                    localStorage.removeItem(`pkmn_trial_${playerName}`);
                    if (activeThemeRef.current === trial.theme) {
                        // handled externally if needed
                    }
                } catch(e) {}
            }
        }
        if (isGameOver) {
            AudioEngine.gameOver();
            const statsProfile = flushStats(profile, { scoreAchieved: score });
            
            const newHp = Math.max(0, hp - 1);
            setHp(newHp);

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
            const remainingSeconds = Math.max(0, window.getSecondsLeft(progress, level));
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
                currentProfile = window.updateMissions(currentProfile, "score", bonusGained);
            }
            
            setScore(finalScore);

            let p = flushStats(currentProfile, { 
                scoreAchieved: finalScore, 
                timeElapsedMs: timeElapsed,
                remainingProgress: progress,
                flawlessDelta: isFlawless ? 1 : 0
            });
            
            if (RewardEngine) {
                p = RewardEngine.processWin(p, {
                    isMultiplayer: false,
                    isFlawless: isFlawless,
                    timeElapsed: timeElapsed,
                    progress: progress,
                    highestCombo: missionProgressRef.current.combo
                });
            }
            
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
            
            missionProgressRef.current = { combo: 0, addCombo: 0, match: 0, hints: 0, shuffles: 0, score: 0, wrong: 0 };
            
            const progressProfile = p; const rewardGiven = null;
            
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
            setSweetMessage(msg => pickSweetMessage ? pickSweetMessage(msg) : '');
            setShowBoardClear(false);
            setGameState('WON');
            if (rewardGiven && Dialog) Dialog.showInfo("Progress Penuh!", `Progress hadiahmu penuh! Kamu dapat ${rewardGiven.label}.`);
        }
    }, [level, score, playerName, profile, hp, hints, shuffles, activeThemeRef, flushStats, setGameState, setHp, setProfile, setScore, setShowBoardClear, setSweetMessage, levelStartTime]);

    const handleLevelCleared = useCallback(() => triggerLevelEndStats(false), [triggerLevelEndStats]);

    const handleDeadlock = useCallback((b) => {
        comboCountRef.current = 0;
        lastMatchTimeRef.current = 0;
        setComboDisplay(null);
        setBoard(guaranteedShuffle(b));
    }, [comboCountRef, lastMatchTimeRef, setBoard, setComboDisplay]);

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

    const prepareLevel = async (startLevel, providedBoard = null, providedTheme = null, startScore = null, startHp = null, startHints = null, startShuffles = null, startProgress = null, startMatchedTiles = null, startSelectedTile = null, startComboCount = 0, startLastMatchTime = 0, targetStartAt = null) => {
        const currentT = providedTheme || activeThemeRef.current;
        const b = providedBoard || generateBoard(currentT, startLevel);
        window.initialMultiplayerTiles = b.flat().filter(v => v !== 0).length;
        setBoard(b); setLevel(startLevel);
        
        setScore(startScore !== null ? startScore : 0);
        setHp(startHp !== null ? startHp : profile.hp);
        setHints(startHints !== null ? startHints : profile.hints);
        setShuffles(startShuffles !== null ? startShuffles : profile.shuffles);

        comboCountRef.current = startComboCount; 
        lastMatchTimeRef.current = startLastMatchTime;
        
        if (startLevel === 1) {
            setIsNewRecord(false);
            const statsProfile = window.updateStatistics(profile, { incrementGames: true });
            const dmProfile = window.updateMissions(statsProfile, 'play', 1);
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
                
                matchesPendingRef.current += 1;
                missionProgressRef.current.match += 1;
                setProfile(prev => window.updateMissions(prev, 'match', 1));
                const now = Date.now();
                const timeSinceLastMatchMs = lastMatchTimeRef.current > 0 ? now - lastMatchTimeRef.current : 10000;
                comboCountRef.current = (now - lastMatchTimeRef.current <= COMBO_WINDOW_MS) ? comboCountRef.current + 1 : 1;
                lastMatchTimeRef.current = now;
                
                missionProgressRef.current.combo = Math.max(missionProgressRef.current.combo, comboCountRef.current); highestComboPendingRef.current = Math.max(highestComboPendingRef.current, comboCountRef.current);
                setProfile(prev => window.updateMissions(prev, 'combo', comboCountRef.current));
                
                if (comboCountRef.current === 5) {
                    missionProgressRef.current.addCombo = (missionProgressRef.current.addCombo || 0) + 1;
                    setProfile(prev => window.updateMissions(prev, 'addCombo', 1));
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
                    setProfile(p => window.updateMissions(p, "score", gained));

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
                
                comboCountRef.current = 0;
                lastMatchTimeRef.current = 0;
                setComboDisplay(null);
                
                const penaltySec = Math.min(3, 1 + Math.floor(level / 5));
                const penaltyPct = (penaltySec / 1.666); 
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

    const handleTimeout = useCallback(() => {
        AudioEngine.timeout(); setShowTimeoutFlash(true);
        setTimeout(() => {
            setShowTimeoutFlash(false);
            triggerLevelEndStats(true); 
        }, 1000);
    }, [setShowTimeoutFlash, triggerLevelEndStats]);

    useEffect(() => {
        if (gameState !== 'PLAYING' || window.isMultiplayerMatch) return;
        const speed = getTimerSpeed(level);
        const timer = setInterval(() => {
            setProgress(prev => { if (prev <= 0) { clearInterval(timer); handleTimeout(); return 0; } return prev - speed; });
        }, 200);
        return () => clearInterval(timer);
    }, [gameState, level, handleTimeout, setProgress]);

    const handleShuffleClick = () => { 
        if (gameState !== 'PLAYING' || window.isMultiplayerMatch) return;
        if (shuffles > 0) { 
            comboCountRef.current = 0; lastMatchTimeRef.current = 0; setComboDisplay(null);
            setShuffles(s => s - 1); missionProgressRef.current.shuffles += 1; setProfile(p => window.updateMissions(p, 'useShuffle', 1)); shufflesPendingRef.current += 1; AudioEngine.shuffle(); setHintActiveTiles([]); setHintPath(null); handleDeadlock(board); setSelectedTile(null); 
        } else if (hp > 1) {
            comboCountRef.current = 0; lastMatchTimeRef.current = 0; setComboDisplay(null);
            setHp(h => h - 1); missionProgressRef.current.shuffles += 1; 
            AudioEngine.shuffle(); setHintActiveTiles([]); setHintPath(null); handleDeadlock(board); setSelectedTile(null);
            Dialog.showInfo("Pakai Nyawa", "Kamu menggunakan 1 Nyawa untuk Shuffle!");
            let p = window.updateMissions(profile, 'useShuffle', 1);
            p = flushStats(p);
            setProfile(p);
            saveProfile(playerName, p);
        } else {
            Dialog.showError("Gagal", "Tidak ada Shuffle dan Nyawa tidak cukup (Minimal 2).");
        }
    };
    
    const handleHintClick = () => {
        if (gameState !== 'PLAYING' || window.isMultiplayerMatch) return;
        const hintData = findHint(board);
        if (!hintData) return;

        if (hints > 0) {
            comboCountRef.current = 0; lastMatchTimeRef.current = 0; setComboDisplay(null);
            setHints(h => h - 1); missionProgressRef.current.hints += 1; hintsPendingRef.current += 1; setProfile(p => window.updateMissions(p, 'useHint', 1)); AudioEngine.hint(); setHintActiveTiles([{r: hintData.p1.r, c: hintData.p1.c}, {r: hintData.p2.r, c: hintData.p2.c}]); setHintPath(hintData.path); 
        } else if (hp > 1) {
            comboCountRef.current = 0; lastMatchTimeRef.current = 0; setComboDisplay(null);
            setHp(h => h - 1); missionProgressRef.current.hints += 1; 
            AudioEngine.hint(); setHintActiveTiles([{r: hintData.p1.r, c: hintData.p1.c}, {r: hintData.p2.r, c: hintData.p2.c}]); setHintPath(hintData.path); 
            Dialog.showInfo("Pakai Nyawa", "Kamu menggunakan 1 Nyawa untuk Hint!");
            let p = window.updateMissions(profile, 'useHint', 1);
            p = flushStats(p);
            setProfile(p);
            saveProfile(playerName, p);
        } else {
            Dialog.showError("Gagal", "Tidak ada Hint dan Nyawa tidak cukup (Minimal 2).");
        }
    };

    return {
        triggerLevelEndStats, handleLevelCleared, handleDeadlock, prepareLevel, runCountdownThenPlay, handleTileClick,
        handleTimeout, handleShuffleClick, handleHintClick
    };
};

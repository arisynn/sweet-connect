const GameUI = () => {
    const ctx = React.useContext(GameContext);
    
    React.useEffect(() => {
        if (window.NotificationManager) {
            window.NotificationManager.init();
        }
    }, []);
    
    React.useEffect(() => {
        if (window.NotificationManager && ctx.profile) {
            window.NotificationManager.scheduleChest(ctx.profile);
            window.NotificationManager.checkLoginReward(ctx.profile);
        }
    }, [ctx.profile]);
    const {
        gameState, setGameState, activeTheme, activeThemeRef, gameStateRef, board, score, hp, hints, shuffles, level, progress, showTimerAdd, wrongConnectionPenalty, activePath, hintPath, wrongTile, hintActiveTiles, matchedTiles, selectedTile, isMuted, setIsMuted, isStandalone, deferredPrompt, playerName, setPlayerName, loginError, setLoginError, lobbyBadgeText, isLoadingProfile, syncStatus, showSyncLog, setShowSyncLog, syncLogs, startupStep, startupMessage, startupProgress, showCloudRecovery, localRecoveryProfile, setShowCloudRecovery, setSelectedTile, setActiveTheme, setBoard, getDefaultProfile, finishStartup, profile, setProfile, isNewRecord, countdown, setCountdown, comboDisplay, setComboDisplay, showBoardClear, setShowBoardClear, showTimeoutFlash, setShowTimeoutFlash, sweetMessage, setSweetMessage,  showSettings, setShowSettings, showCustomThemeEditor, setShowCustomThemeEditor, splashText, handleLoginSubmit, handleLogout, handleBuyHpInGame, handleHintClick, handleShuffleClick, handleTileClick, getSecondsLeft, handleBuyStore, handleSellStore, handleClaimDaily, handleClaimAchievement, handleClaimMilestone, handleMysteryGiftComplete, prepareLevel, handleClaimLoginReward, THEMES, formatNumber, calculateCoinReward, AudioEngine, saveProfile, window, saveCurrentSession, flushStats
    } = ctx;

    const uiState = useUiState();
    const { showNotificationPrompt, setShowNotificationPrompt, regenTimeLeft, setRegenTimeLeft, multiplayerState, setMultiplayerState, matchTime, setMatchTime, showMultiplayerPopup, setShowMultiplayerPopup, showJoinDialog, setShowJoinDialog, showModeSheet, setShowModeSheet, roomData, setRoomData, wagerConfigOpen, setWagerConfigOpen, handleCreateRoom, handleJoinRoom, handleLeaveRoom, handleReadyToggle, handleProposeWager, handleAcceptWager, handleRejectWager, handleStartMatch, formatRegenTime, showWagerPrompt, setShowWagerPrompt } = uiState;
    Object.assign(window, uiState); // temporary hack to let other things access it if needed
    const activeThemeObj = THEMES[activeThemeRef.current || activeTheme] || {};
    const isDarkMode = activeThemeObj.darkMode === true;
    const themeBg = activeThemeObj.colors?.bg || (isDarkMode ? "#171717" : "#fdf2f8");
    const themeBorder = activeThemeObj.colors?.border || (isDarkMode ? "#525252" : "#fbcfe8");
    const themeText = activeThemeObj.colors?.text || (isDarkMode ? "#d946ef" : "#ec4899");
    const themeAccent = activeThemeObj.colors?.accent || (isDarkMode ? "#c026d3" : "#ec4899");
    const themeButtonActive = activeThemeObj.colors?.buttonActive || (isDarkMode ? "#a21caf" : "#e11d48");
    const themeBackgroundImage = (activeThemeObj.background || activeThemeObj.menuBackgrounds?.['home']) ? `url(${activeThemeObj.background || activeThemeObj.menuBackgrounds['home']})` : 'none';

    return (
        <React.Fragment>
        <div className="w-full h-[100dvh] flex items-center justify-center p-0 sm:p-2 bg-transparent" style={{ "--theme-bg": themeBg, "--theme-border": themeBorder, "--theme-text": themeText, "--theme-accent": themeAccent, "--theme-buttonActive": themeButtonActive, backgroundImage: themeBackgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className={`w-full max-w-[480px] h-full flex flex-col sm:border sm:border-gray-200 sm:rounded-3xl sm:shadow-xl overflow-hidden relative ${(activeThemeObj.background || activeThemeObj.menuBackgrounds?.['home']) ? 'bg-white/30 backdrop-blur-md' : 'theme-bg'}`}>
                
                {/* ===================== IN-GAME HEADER ===================== */}
                {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'COUNTDOWN') && (<HUD regenTimeLeft={regenTimeLeft} multiplayerState={multiplayerState} matchTime={matchTime} formatRegenTime={formatRegenTime} roomData={roomData} />)}
                {/* ===================== GRID ===================== */}
                <GameBoard />
                {/* ===================== SCREENS ===================== */}
                
                {(gameState === 'LOGIN' || gameState === 'LOGIN_LOADING') && (<LoginScreen />)}

                                {gameState === 'STARTUP' && window.StartupScreen && (
                    <window.StartupScreen 
                        activeTheme={activeThemeRef.current || activeTheme}
                        THEMES={THEMES}
                        startupMessage={startupMessage}
                        startupProgress={startupProgress}
                        showCloudRecovery={showCloudRecovery}
                        playerName={playerName}
                        localRecoveryProfile={localRecoveryProfile}
                        finishStartup={finishStartup}
                        getDefaultProfile={getDefaultProfile}
                        setShowCloudRecovery={setShowCloudRecovery}
                    />
                )}
                
                {gameState === 'LOBBY_MAIN' && (<LobbyScreen handleStartMatch={handleStartMatch} setShowMultiplayerPopup={setShowMultiplayerPopup} multiplayerState={multiplayerState} setShowSettings={setShowSettings} showSettings={showSettings} setSweetMessage={setSweetMessage} handleLeaveRoom={handleLeaveRoom} setShowModeSheet={setShowModeSheet} handleReadyToggle={handleReadyToggle} roomData={roomData} />)}
                {gameState === 'SHOP' && <Shop profile={profile} activeTheme={activeTheme} onThemeSelect={(t) => { setActiveTheme(t); setProfile(p => { const newP = {...p, activeTheme: t}; saveProfile(playerName, newP); return newP; }); }} onBuy={handleBuyStore} onSell={handleSellStore} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} />}
                {gameState === 'THEMES' && <ThemeScreen profile={profile} setProfile={setProfile} saveProfile={saveProfile} playerName={playerName} activeTheme={activeTheme} onThemeSelect={(t) => { setActiveTheme(t); setProfile(p => { const newP = {...p, activeTheme: t}; saveProfile(playerName, newP); return newP; }); }} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} />}
                
                {gameState === 'ROULETTE' && <MysteryGift onThemeSelect={(t) => { setActiveTheme(t); setProfile(p => { const newP = {...p, activeTheme: t}; saveProfile(playerName, newP); return newP; }); }} activeTheme={activeThemeRef.current || activeTheme} profile={profile} setProfile={setProfile} saveProfile={saveProfile} playerName={playerName} onOpenComplete={handleMysteryGiftComplete} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} onActivateTrial={(t) => {
    let p = { ...profile };
    p.themeTrials = p.themeTrials || {};
    p.themeTrials[t] = Date.now();
    localStorage.setItem(`pkmn_trial_${playerName}`, JSON.stringify({ theme: t, startTime: Date.now() }));
    setProfile(p);
    saveProfile(playerName, p);
    setActiveTheme(t);
    setGameState('LOBBY_MAIN');
}} />}
                {gameState === 'DAILY_REWARD' && <DailyReward activeTheme={activeThemeRef.current || activeTheme} profile={profile} onClaim={handleClaimDaily} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} />}
                {gameState === 'ACHIEVEMENTS' && <AchievementsScreen activeTheme={activeThemeRef.current || activeTheme} profile={profile} onClaimAchievement={handleClaimAchievement} onClaimMilestone={handleClaimMilestone} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} />}
                {gameState === 'STATISTICS' && <StatisticsScreen activeTheme={activeThemeRef.current || activeTheme} profile={profile} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} />}
                {gameState === 'LOGIN_REWARD' && <LoginRewardScreen profile={profile} onClaim={handleClaimLoginReward} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} />}

                <MultiplayerPopup isRequestingRoom={uiState.isRequestingRoom} isOpen={showMultiplayerPopup} onClose={() => setShowMultiplayerPopup(false)} onCreateRoom={handleCreateRoom} onJoinRoom={() => { setShowMultiplayerPopup(false); setShowJoinDialog(true); }} />
                <JoinRoomDialog isRequestingRoom={uiState.isRequestingRoom} isOpen={showJoinDialog} onClose={() => setShowJoinDialog(false)} onJoin={handleJoinRoom} />
                <GameModeSheet 
                    isOpen={showModeSheet} 
                    onClose={() => setShowModeSheet(false)} 
                    currentMode={roomData?.mode} 
                    isHost={roomData?.host === playerName} 
                    onSelect={async (mode) => { 
                        if (mode === 'Match Berhadiah') {
                            setShowModeSheet(false);
                            setWagerConfigOpen(true);
                        } else {
                            setShowModeSheet(false);
                            fetch('/api/multiplayer?action=change_mode', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ roomId: roomData.id, host: playerName, mode: 'Friendly Match' })
                            }).catch(()=>{});
                        }
                    }} 
                />
                
                <window.WagerConfigSheet 
                    isOpen={wagerConfigOpen} 
                    onClose={() => setWagerConfigOpen(false)} 
                    onPropose={handleProposeWager} 
                    profile={profile} 
                />

                <window.WagerApprovalDialog 
                    wager={showWagerPrompt ? roomData.wager : null} 
                    profile={profile} 
                    onAccept={() => handleAcceptWager(roomData.wager.offerId)} 
                    onReject={() => handleRejectWager(roomData.wager.offerId)} 
                />

                {gameState === 'LOADING_BOARD' && (<LoadingOverlay />)}

                {gameState === 'COUNTDOWN' && (<CountdownOverlay />)}

                {gameState === 'PAUSED' && (<PauseMenu />)}

                {gameState === 'GAMEOVER' && (<GameOverScreen />)}

                {gameState === 'WON' && (<WinScreen />)}
                
        
                {multiplayerState === 'RESULT' && (<MultiplayerResultScreen roomData={roomData} playerName={playerName} handleLeaveRoom={handleLeaveRoom} setMultiplayerState={setMultiplayerState} />)}
                
                {showSettings && (
                    <SettingsPanel 
                        syncStatus={syncStatus}
                        onOpenCloudSync={() => { window.history.pushState({ isAppHistory: true, modal: 'CLOUD_SYNC' }, ' ', ' '); setShowSyncLog(true); setShowSettings(false); }}
                        profile={profile}
                        setProfile={setProfile}
                        saveProfile={saveProfile}
                        playerName={playerName}
                        onClose={() => { window.history.back(); setIsMuted(AudioEngine.getSettings().muteMusic && AudioEngine.getSettings().muteSfx); }} 
                        onLogout={() => {
                            if (handleLogout) handleLogout();
                        }} 
                    />
                )}

                {showCustomThemeEditor && (
                    <CustomThemeEditor
                        profile={profile}
                        onChangePreview={(emojis) => {
                            if (activeTheme === 'custom') {
                                const oldEmojis = THEMES.custom.data;
                                setBoard(prev => {
                                    const nextBoard = prev.map(row => [...row]);
                                    // Use ROWS=8, COLS=12 as defined in constants
                                    for(let r = 1; r <= 8; r++) {
                                        for(let c = 1; c <= 12; c++) {
                                            if(nextBoard[r] && nextBoard[r][c] !== 0) {
                                                const idx = oldEmojis.indexOf(nextBoard[r][c]);
                                                if (idx !== -1 && emojis[idx]) {
                                                    nextBoard[r][c] = emojis[idx];
                                                }
                                            }
                                        }
                                    }
                                    return nextBoard;
                                });
                                THEMES.custom.data = [...emojis];
                            }
                        }}
                        onSave={async (emojis) => {
                            const newProfile = { ...profile, customEmojis: emojis };
                            setProfile(newProfile); await saveProfile(playerName, newProfile);
                            if (activeTheme === 'custom') {
                                THEMES.custom.data = emojis;
                                setBoard(prev => prev); // trigger re-render if needed
                                if (window.Dialog && window.Dialog.showToast) {
                                    window.Dialog.showToast('Emoji custom berhasil diperbarui.', 'success');
                                }
                            }
                            window.history.back();
                        }}
                        onClose={() => {
                            if (activeTheme === 'custom' && profile.customEmojis && profile.customEmojis.length >= 12) {
                                const originalEmojis = profile.customEmojis.slice(0, 12);
                                const currentEmojis = THEMES.custom.data;
                                setBoard(prev => {
                                    const nextBoard = prev.map(row => [...row]);
                                    for(let r = 1; r <= 8; r++) {
                                        for(let c = 1; c <= 12; c++) {
                                            if(nextBoard[r] && nextBoard[r][c] !== 0) {
                                                const idx = currentEmojis.indexOf(nextBoard[r][c]);
                                                if (idx !== -1 && originalEmojis[idx]) {
                                                    nextBoard[r][c] = originalEmojis[idx];
                                                }
                                            }
                                        }
                                    }
                                    return nextBoard;
                                });
                                THEMES.custom.data = [...originalEmojis];
                            }
                            window.history.back();
                        }}
                    />
                )}
        
        {showSyncLog && window.CloudSyncPanel && (
            <window.CloudSyncPanel 
                syncStatus={syncStatus} 
                syncLogs={syncLogs} 
                profile={profile} 
                playerName={playerName} 
                onClose={() => { window.history.back(); }} 
                setProfile={setProfile} 
                saveProfile={saveProfile} 
            />
        )}
        
        {showNotificationPrompt && (
            <NotificationPrompt
                playerName={playerName}
                onAccept={() => {
                    setShowNotificationPrompt(false);
                    if (profile) {
                        const newProfile = { ...profile, lastNotificationPermissionPrompt: Date.now() };
                        setProfile(newProfile);
                        if (saveProfile) saveProfile(playerName, newProfile);
                    }
                }}
                onClose={() => {
                    setShowNotificationPrompt(false);
                    if (profile) {
                        const newProfile = { ...profile, lastNotificationPermissionPrompt: Date.now() };
                        setProfile(newProfile);
                        if (saveProfile) saveProfile(playerName, newProfile);
                    }
                }}
            />
        )}

            </div>
        </div>
        </React.Fragment>
    );
};

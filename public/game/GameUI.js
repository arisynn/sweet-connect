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
        gameState, setGameState, activeTheme, activeThemeRef, gameStateRef, board, score, hp, hints, shuffles, level, progress, showTimerAdd, wrongConnectionPenalty, activePath, wrongTile, hintActiveTiles, matchedTiles, selectedTile, isMuted, setIsMuted, isStandalone, deferredPrompt, playerName, setPlayerName, loginError, setLoginError, lobbyBadgeText, isLoadingProfile, syncStatus, showSyncLog, setShowSyncLog, syncLogs, startupStep, startupMessage, startupProgress, showCloudRecovery, localRecoveryProfile, setShowCloudRecovery, setSelectedTile, setActiveTheme, setBoard, getDefaultProfile, finishStartup, profile, setProfile, isNewRecord, countdown, setCountdown, comboDisplay, setComboDisplay, showBoardClear, setShowBoardClear, showTimeoutFlash, setShowTimeoutFlash, sweetMessage, setSweetMessage,  showSettings, setShowSettings, showCustomThemeEditor, setShowCustomThemeEditor, splashText, handleLoginSubmit, handleBuyHpInGame, handleHintClick, handleShuffleClick, handleTileClick, getSecondsLeft, handleBuyStore, handleSellStore, handleClaimDaily, handleClaimAchievement, handleClaimMilestone, handleMysteryGiftComplete, prepareLevel, handleClaimLoginReward, THEMES, formatNumber, calculateCoinReward, AudioEngine, saveProfile, window, saveCurrentSession, flushStats
    } = ctx;

    const [showNotificationPrompt, setShowNotificationPrompt] = React.useState(false);

    React.useEffect(() => {
        if (gameState === 'LOBBY' && profile && window.checkNotificationPromptNeeded && window.checkNotificationPromptNeeded()) {
            const lastPrompt = profile.lastNotificationPermissionPrompt || 0;
            const now = Date.now();
            if (now - lastPrompt >= 24 * 60 * 60 * 1000) {
                setShowNotificationPrompt(true);
            }
        }
    }, [gameState, profile]);

    return (
        <React.Fragment>
        <div className="w-full h-[100dvh] flex items-center justify-center p-0 sm:p-2 bg-transparent" style={{ "--theme-bg": THEMES[activeThemeRef.current || activeTheme]?.colors.bg || "#fdf2f8", "--theme-border": THEMES[activeThemeRef.current || activeTheme]?.colors.border || "#fbcfe8", "--theme-text": THEMES[activeThemeRef.current || activeTheme]?.colors.text || "#ec4899", "--theme-accent": THEMES[activeThemeRef.current || activeTheme]?.colors.accent || "#ec4899", "--theme-buttonActive": THEMES[activeThemeRef.current || activeTheme]?.colors.buttonActive || "#e11d48", backgroundImage: (THEMES[activeThemeRef.current || activeTheme]?.background || THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home']) ? `url(${THEMES[activeThemeRef.current || activeTheme].background || THEMES[activeThemeRef.current || activeTheme].menuBackgrounds['home']})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className={`w-full max-w-[480px] h-full flex flex-col sm:border sm:border-gray-200 sm:rounded-3xl sm:shadow-xl overflow-hidden relative ${(THEMES[activeThemeRef.current || activeTheme]?.background || THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home']) ? 'bg-white/30 backdrop-blur-md' : 'theme-bg'}`}>
                
                {/* ===================== IN-GAME HEADER ===================== */}
                {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'COUNTDOWN') && (
                    <div className={`w-full flex flex-col shrink-0 border-b theme-border z-50 py-0.5 px-1 gap-0.5 shadow-sm ${(THEMES[activeThemeRef.current || activeTheme]?.background || THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home']) ? 'bg-white/20 backdrop-blur-md' : 'theme-bg'}`}>
                        
                        {/* Top Row: HP, Level, Controls */}
                        <div className="flex items-center justify-between w-full">
                            {/* HP Left */}
                            <div className="flex items-center bg-white px-2 py-0 rounded-full border theme-border shadow-sm shrink-0 min-w-[60px]">
                                <IconHeart className="w-4 h-4 theme-text-active mr-1" />
                                <span className="text-sm font-bold theme-text">{hp}</span>
                                <div onClick={handleBuyHpInGame} className="w-3.5 h-3.5 bg-emerald-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold ml-1 shadow-sm cursor-pointer">+</div>
                            </div>

                            {/* Level Centered */}
                            <div className="flex items-center bg-white px-4 py-0 rounded-full border theme-border shadow-sm shrink-0">
                                <span className="text-sm font-black theme-text-active">Level {level}</span>
                            </div>

                            {/* Pause & Sound Right */}
                            <div className="flex gap-1 shrink-0">
                                <button onClick={() => setIsMuted(m => !m)} className={`bg-white w-6 h-6 rounded-full flex items-center justify-center border theme-border shadow-sm active:scale-95 transition-transform ${isMuted ? 'text-gray-400' : 'theme-text-active'}`}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">{isMuted ? <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />}</svg>
                                </button>
                                <button onClick={() => { AudioEngine.uiOpen(); setGameState('PAUSED'); }} className="bg-white w-6 h-6 rounded-full flex items-center justify-center border theme-border theme-text-active shadow-sm active:scale-95 transition-transform"><IconPause className="w-3.5 h-3.5"/></button>
                            </div>
                        </div>

                        {/* Row 2: Thin Progress Bar */}
                        <div className="w-full bg-emerald-100 rounded-full h-[3px] relative overflow-hidden border border-emerald-200 shadow-inner mt-0.5 mb-0.5">
                            <div className="h-full rounded-full transition-all duration-200 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.1)]" style={{ width: `${progress}%`, backgroundColor: progress > 40 ? '#34d399' : progress > 20 ? '#fbbf24' : '#f87171' }} />
                        </div>

                        {/* Bottom Row: Score, Time, Hint, Shuffle */}
                        <div className="flex items-center justify-between gap-1 w-full">
                            
                            {/* Score */}
                            <div className="flex items-center bg-white px-2 py-0 rounded-full border theme-border shadow-sm flex-1 justify-center">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-amber-400 mr-1"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                                <span className="text-xs font-bold theme-text">{score}</span>
                            </div>

                            {/* Timer */}
                            <div className="flex items-center bg-white px-2 py-0 rounded-full border theme-border shadow-sm flex-1 justify-center relative">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-orange-500 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-xs font-bold theme-text">{getSecondsLeft(progress, level)}s</span>
                                {showTimerAdd && <span className="absolute -top-4 text-[10px] font-bold text-emerald-500 float-text z-[60]">+waktu</span>}
                            </div>

                            {/* Hint */}
                            <button onClick={handleHintClick} className={`flex items-center bg-white px-2 py-0 rounded-full border theme-border shadow-sm active:scale-95 transition-transform flex-1 justify-center ${hints === 0 ? 'text-rose-500' : 'text-sky-500'}`}>
                                {hints === 0 ? <IconHeart className="w-3 h-3 mr-1"/> : <IconSearch className="w-3 h-3 mr-1"/>}
                                <span className="text-xs font-bold theme-text">{hints === 0 ? '1' : hints}</span>
                            </button>

                            {/* Shuffle */}
                            <button onClick={handleShuffleClick} className={`flex items-center bg-white px-2 py-0 rounded-full border theme-border shadow-sm active:scale-95 transition-transform flex-1 justify-center ${shuffles === 0 ? 'text-rose-500' : 'text-orange-500'}`}>
                                {shuffles === 0 ? <IconHeart className="w-3 h-3 mr-1"/> : <IconRefresh className="w-3 h-3 mr-1"/>}
                                <span className="text-xs font-bold theme-text">{shuffles === 0 ? '1' : shuffles}</span>
                            </button>

                        </div>

                    </div>
                )}

                {/* ===================== GRID ===================== */}
                <div className={`flex-1 w-full relative overflow-hidden ${(THEMES[activeThemeRef.current || activeTheme]?.background || THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home']) ? 'bg-transparent' : 'theme-bg'}`} onClick={() => { if (gameStateRef.current === 'PLAYING' && selectedTile) { AudioEngine.uiCancel(); setSelectedTile(null); } }} >
                    {board.length > 0 && (() => {
                        const P = 0.3; // 30% padding instead of full 1 tile padding
                        const getSvgX = (c) => c === 0 ? P / 2 : c === COLS + 1 ? P + COLS + P / 2 : P + (c - 1) + 0.5;
                        const getSvgY = (r) => r === 0 ? P / 2 : r === ROWS + 1 ? P + ROWS + P / 2 : P + (r - 1) + 0.5;
                        return (
                        <div className="absolute inset-0">
                            {wrongConnectionPenalty && (
                                <div className="absolute z-[100] text-red-500 font-black text-2xl drop-shadow-md pointer-events-none"
                                     style={{
                                         left: `calc((${getSvgX(wrongConnectionPenalty.c)} / ${COLS + 2 * P}) * 100%)`,
                                         top: `calc((${getSvgY(wrongConnectionPenalty.r)} / ${ROWS + 2 * P}) * 100%)`,
                                         transform: 'translate(-50%, -100%)',
                                         animation: 'floatUp 1s ease-out forwards'
                                     }}>
                                    -{wrongConnectionPenalty.sec}s
                                </div>
                            )}
                            <svg viewBox={`0 0 ${COLS + 2 * P} ${ROWS + 2 * P}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                                {activePath && (
                                    <g><path d={`M ${activePath.map(p => `${getSvgX(p.c)} ${getSvgY(p.r)}`).join(' L ')}`} fill="none" stroke="#f472b6" strokeWidth="0.15" strokeLinecap="round" strokeLinejoin="round" className="path-line-outer"/></g>
                                )}
                            </svg>

                            <div className="absolute inset-0 grid p-0 border border-[#f472b6]/50" style={{ zIndex: 20, gridTemplateColumns: `${P}fr repeat(${COLS}, 1fr) ${P}fr`, gridTemplateRows: `${P}fr repeat(${ROWS}, 1fr) ${P}fr`, gap: '1px' }}>
                                {board.map((row, r) => row.map((cellId, c) => {
                                    if (r === 0 || r === ROWS + 1 || c === 0 || c === COLS + 1) return <div key={`${r}-${c}`} className="w-full h-full pointer-events-none" />;
                                    const isSelected = selectedTile && selectedTile.r === r && selectedTile.c === c;
                                    const matchingTile = matchedTiles.find(m => m.r === r && m.c === c);
                                    const isMatching = !!matchingTile;
                                    const isHinting = hintActiveTiles.find(h => h.r === r && h.c === c);
                                    const isWrong = wrongTile && wrongTile.r === r && wrongTile.c === c;
                                    const isEmpty = cellId === 0 && !isMatching;
                                    const hideBg = THEMES[activeThemeRef.current || activeTheme]?.hideBackground || false;
                                    const cellData = isMatching ? matchingTile.id : cellId;

                                    return (
                                        <div key={`${r}-${c}`} className="relative w-full h-full border border-[#f472b6]/30">
                                            {!isEmpty && (
                                                <button className={`cute-tile ${isSelected ? 'selected' : ''} ${isMatching ? 'matched' : ''} ${isHinting ? 'hint-glow' : ''} ${isWrong ? 'wrong' : ''}`}
                                                    style={{ WebkitTapHighlightColor: 'transparent' }} onClick={(e) => handleTileClick(e, r, c)}>
                                                    {cellData && (cellData.startsWith('http') || cellData.startsWith('/') || cellData.includes('.png') || cellData.includes('.svg')) ? (
                                                        <img src={cellData} alt="tile" className="w-full h-full object-contain pointer-events-none select-none" draggable="false" />
                                                        ) : (
                                                        <svg viewBox="0 0 100 100" className="w-full h-full pointer-events-none select-none">
                                                            <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={activeTheme === 'cute_symbols' ? "58" : hideBg ? "88" : "70"} fill={activeTheme === 'cute_symbols' ? "var(--theme-text)" : "currentColor"}>{cellData}</text>
                                                        </svg>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                }))}
                            </div>
                        </div>
                        );
                    })()}
                    
                    <ComboOverlay combo={comboDisplay} />
                </div>

                

                {showBoardClear && <div className="absolute inset-0 bg-white board-clear-flash z-[90] pointer-events-none" />}
                {showTimeoutFlash && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-[95] timeout-flash pointer-events-none" style={{ background: 'rgba(239,68,68,0.9)' }}>
                        <span className="text-white text-3xl font-black drop-shadow-lg">Waktu Habis!</span>
                        <span className="text-white text-lg font-bold mt-2">-1 Nyawa</span>
                    </div>
                )}

                {/* ===================== SCREENS ===================== */}
                
                {gameState === 'LOGIN' && (
                    <div className="absolute inset-0 bg-[#F2F2F7] flex flex-col items-center justify-center z-[100] px-8 overflow-hidden animate-fade-in">
                        {THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home'] && (
                            <img src={THEMES[activeThemeRef.current || activeTheme].menuBackgrounds['home']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-30 blur-[2px]" alt=""/>
                        )}
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>
                        
                        <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center">
                            <img src="/logo.png" alt="Logo" className="w-28 h-28 object-contain drop-shadow-xl mb-6 animate-logo-enter" />
                            
                            <h1 className="text-3xl font-black text-gray-800 mb-2 tracking-tight text-center drop-shadow-sm">Sweet Connect</h1>
                            <p className="text-gray-500 font-medium mb-8 text-center text-sm leading-relaxed px-2">
                                Masukkan nama panggilanmu. Progres permainan akan disimpan dengan aman di Cloud.
                            </p>
                            
                            {!navigator.onLine && (
                                <div className="mb-5 bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-sm">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.9 9.9a9.043 9.043 0 00-6.263 2.59A1.5 1.5 0 004 15.35M14.1 14.1a9.043 9.043 0 016.263-2.59 1.5 1.5 0 01.363 2.86" /></svg>
                                    Mode Offline Aktif
                                </div>
                            )}

                            <div className="w-full relative mb-4">
                                <input type="text" placeholder="Nama Panggilan" maxLength={15}
                                    className="bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-3xl px-6 py-4 text-center text-lg font-bold text-gray-800 w-full focus:outline-none focus:border-pink-400 focus:shadow-[0_4px_16px_rgba(236,72,153,0.15)] transition-all duration-300"
                                    value={playerName} onChange={e => { setPlayerName(e.target.value); setLoginError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLoginSubmit()} disabled={isLoadingProfile}
                                />
                                {loginError && <p className="absolute -bottom-6 left-0 right-0 text-red-500 text-xs font-bold text-center animate-fade-in">{loginError}</p>}
                            </div>
                            
                            <button onClick={handleLoginSubmit} disabled={isLoadingProfile || !playerName.trim()} className="mt-4 flex items-center justify-center bg-gray-900 text-white w-full py-4 text-base font-bold rounded-3xl shadow-lg hover:bg-gray-800 active:bg-black active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed">
                                {isLoadingProfile ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Menghubungkan...
                                    </>
                                ) : 'Mulai Bermain'}
                            </button>
                        </div>
                        <style dangerouslySetInnerHTML={{__html: `
                            @keyframes logoEnter {
                                0% { opacity: 0; transform: scale(0.7) translateY(20px); }
                                100% { opacity: 1; transform: scale(1) translateY(0); }
                            }
                            .animate-logo-enter {
                                animation: logoEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                            }
                        `}} />
                    </div>
                )}

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
                
                {gameState === 'LOBBY_MAIN' && (
                    <div className="absolute inset-0 bg-[#F2F2F7] flex flex-col z-[100] overflow-hidden animate-fade-in">
                        {THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home'] && (
                            <img src={THEMES[activeThemeRef.current || activeTheme].menuBackgrounds['home']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
                        )}
                        <div className="w-full flex justify-between items-center px-4 pt-6 pb-2 shrink-0 relative z-10">
                            <div className="flex flex-col drop-shadow-sm">
                                <button onClick={() => { AudioEngine.uiOpen(); setShowSettings(true); }} className="flex bg-white/30 backdrop-blur-md border border-white/40 pl-3 pr-4 py-1.5 rounded-full items-center shadow-sm gap-2 hover:bg-white/40 transition-colors">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-gray-800 drop-shadow-sm"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-xl font-black text-gray-800 tracking-tight leading-none drop-shadow-sm">{playerName}</span>
                                    {profile.flexCrown && <IconCrown className="w-5 h-5 ml-1 drop-shadow-sm" />}
                                </button>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="bg-white/30 backdrop-blur-md border border-white/40 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <IconGem className="w-4 h-4 text-pink-500 drop-shadow-sm" />
                                    <span className="font-black text-gray-800 text-sm drop-shadow-sm">{formatNumber(profile.gems || 0)}</span>
                                </div>
                                <div className="bg-white/30 backdrop-blur-md border border-white/40 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <IconCoin className="w-4 h-4 text-amber-500 drop-shadow-sm" />
                                    <span className="font-black text-gray-800 text-sm drop-shadow-sm">{formatNumber(profile.coins || 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 px-4 pb-4 flex flex-col gap-2.5 overflow-y-auto custom-scroll relative z-10">
                            
                            {/* Hero Card / Play Button */}
                            <div className="relative w-full shrink-0">
                                <button onClick={() => {
                                    const savedSessionStr = localStorage.getItem(`pkmnActiveSession_${playerName}`);
                                    let session = null;
                                    try {
                                        if (savedSessionStr) session = JSON.parse(savedSessionStr);
                                    } catch(e) {}
                                    
                                    if (!session && profile.activeSession) {
                                        session = profile.activeSession;
                                    }

                                    // Check if session board is corrupted (all tiles same)
                                    let isCorrupted = false;
                                    if (session && session.board) {
                                        let unique = new Set();
                                        session.board.forEach(r => r.forEach(c => { if (c !== 0) unique.add(c); }));
                                        if (unique.size <= 1) isCorrupted = true;
                                    }

                                    if (session && session.level === profile.currentLevel && !isCorrupted) {
                                        let boardToLoad = session.board;
                                        let matchedTilesToLoad = session.matchedTiles || [];
                                        
                                        let sampleTile = null;
                                        for(let r=0; r<boardToLoad.length; r++) {
                                            for(let c=0; c<boardToLoad[r].length; c++) {
                                                if (boardToLoad[r][c] !== 0) { sampleTile = boardToLoad[r][c]; break; }
                                            }
                                            if (sampleTile) break;
                                        }
                                        
                                        const newThemeData = THEMES[activeThemeRef.current].data;
                                        if (sampleTile && !newThemeData.includes(sampleTile)) {
                                            let uniqueTiles = new Set();
                                            boardToLoad.forEach(row => row.forEach(cell => { if (cell !== 0) uniqueTiles.add(cell); }));
                                            matchedTilesToLoad.forEach(m => uniqueTiles.add(m.id));
                                            uniqueTiles = Array.from(uniqueTiles);
                                            
                                            const tileMap = {};
                                            for(let i=0; i<uniqueTiles.length; i++) {
                                                tileMap[uniqueTiles[i]] = newThemeData[i % newThemeData.length];
                                            }
                                            
                                            const mapTile = (cell) => {
                                                if (cell === 0) return 0;
                                                return tileMap[cell] || newThemeData[0];
                                            };
                                            
                                            boardToLoad = boardToLoad.map(row => row.map(cell => mapTile(cell)));
                                            matchedTilesToLoad = matchedTilesToLoad.map(m => ({...m, id: mapTile(m.id)}));
                                        }
                                        
                                        prepareLevel(session.level, boardToLoad, activeThemeRef.current, session.score, profile.hp, profile.hints, profile.shuffles, session.progress, matchedTilesToLoad, session.selectedTile, session.comboCount || 0, session.lastMatchTime || 0);
                                    } else {
                                        prepareLevel(profile.currentLevel);
                                    }
                                }} className="w-full overflow-hidden bg-gradient-to-br from-pink-500 to-rose-500 rounded-[1.25rem] p-4 shadow-md flex flex-col items-start relative active:scale-[0.98] transition-transform">
                                    {THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['continue'] && (
                                        <img src={THEMES[activeThemeRef.current || activeTheme].menuBackgrounds['continue']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-80" alt=""/>
                                    )}
                                    <div className="theme-text-active bg-white p-2.5 rounded-xl mb-3 shadow-sm relative z-10">
                                        <IconPlay className="w-5 h-5"/>
                                    </div>
                                    <span className="text-white text-xl font-bold mb-0.5 tracking-wide relative z-10">{profile.currentLevel > 1 || localStorage.getItem(`pkmnActiveSession_${playerName}`) ? 'Lanjutkan Main' : 'Main Sekarang'}</span>
                                    <span className="text-pink-100 text-sm font-medium relative z-10">Level {profile.currentLevel}</span>
                                    
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 z-10">{lobbyBadgeText}</div>
                                    
                                    {/* Decorative circles */}
                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none z-0"></div>
                                    <div className="absolute -right-8 top-2 w-16 h-16 bg-white/10 rounded-full pointer-events-none z-0"></div>
                                </button>
                            </div>
                            
                            {/* Chest Section */}
                            <ChestSection activeTheme={activeThemeRef.current || activeTheme} profile={profile} setProfile={setProfile} saveProfile={saveProfile} playerName={playerName} setSweetMessage={setSweetMessage} />
                            {/* Menu Grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                                <button onClick={() => setGameState('ROULETTE')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors relative">
                                    <div className="bg-pink-50 theme-text-active p-2.5 rounded-xl mb-2">
                                        {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['gacha'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['gacha']} className="w-5 h-5 object-contain mix-blend-multiply" alt="gacha"/> : <IconGift className="w-5 h-5"/>}
                                    </div>
                                    <span className="theme-text font-bold text-sm">Gacha</span>
                                    {(profile.gacha_vouchers || 0) > 0 ? (
                                        <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{profile.gacha_vouchers}</span>
                                    ) : (
                                        Object.keys(THEMES || {}).filter(k => THEMES[k].type === 'gacha' && !(profile.unlockedThemes || []).includes(k) && (profile.rainbow_candy || 0) >= (THEMES[k].price || 100)).length > 0 && (
                                            <span className="absolute top-2.5 right-2.5 bg-red-500 w-3 h-3 rounded-full border-2 border-white shadow-sm"></span>
                                        )
                                    )}
                                </button>

                                <button onClick={() => setGameState('SHOP')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors">
                                    <div className="bg-amber-50 text-amber-500 p-2.5 rounded-xl mb-2">
                                        {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['toko'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['toko']} className="w-5 h-5 object-contain mix-blend-multiply" alt="toko"/> : <IconStore className="w-5 h-5"/>}
                                    </div>
                                    <span className="theme-text font-bold text-sm">Toko</span>
                                </button>

                                <button onClick={() => setGameState('DAILY_REWARD')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors relative">
                                    <div className="bg-indigo-50 text-indigo-500 p-2.5 rounded-xl mb-2">
                                        {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['misi'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['misi']} className="w-5 h-5 object-contain mix-blend-multiply" alt="misi"/> : <IconTarget className="w-5 h-5"/>}
                                    </div>
                                    <span className="theme-text font-bold text-sm">Misi</span>
                                    {canClaimAnyMissionReward(profile) && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                </button>

                                <button onClick={() => setGameState('ACHIEVEMENTS')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors relative">
                                    <div className="bg-amber-50 text-amber-500 p-2.5 rounded-xl mb-2">
                                        {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['prestasi'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['prestasi']} className="w-5 h-5 object-contain mix-blend-multiply" alt="prestasi"/> : <IconTrophy className="w-5 h-5"/>}
                                    </div>
                                    <span className="theme-text font-bold text-sm">Prestasi</span>
                                    {(getClaimableAchievements(profile).length > 0 || getClaimableMilestones(profile).length > 0) && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                </button>
                                
                                <button onClick={() => setGameState('THEMES')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors relative">
                                    <div className="bg-emerald-50 text-emerald-500 p-2.5 rounded-xl mb-2">
                                        {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['tema'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['tema']} className="w-5 h-5 object-contain mix-blend-multiply" alt="tema"/> : <IconBrush className="w-5 h-5"/>}
                                    </div>
                                    <span className="theme-text font-bold text-sm">Tema</span>
                                    {profile.newThemes && profile.newThemes.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                </button>
                                
                                <button onClick={() => setGameState('STATISTICS')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors">
                                    <div className="bg-sky-50 text-sky-500 p-2.5 rounded-xl mb-2">
                                        {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['statistik'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['statistik']} className="w-5 h-5 object-contain mix-blend-multiply" alt="statistik"/> : <IconChart className="w-5 h-5"/>}
                                    </div>
                                    <span className="theme-text font-bold text-sm">Statistik</span>
                                </button>
                                
                                
                            </div>
                            
                        </div>
                    </div>
                )}
                {gameState === 'SHOP' && <Shop profile={profile} activeTheme={activeTheme} onThemeSelect={(t) => { setActiveTheme(t); setProfile(p => { const newP = {...p, activeTheme: t}; saveProfile(playerName, newP); return newP; }); localStorage.setItem('pkmnTheme', t); }} onBuy={handleBuyStore} onSell={handleSellStore} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} />}
                {gameState === 'THEMES' && <ThemeScreen profile={profile} setProfile={setProfile} saveProfile={saveProfile} playerName={playerName} activeTheme={activeTheme} onThemeSelect={(t) => { setActiveTheme(t); setProfile(p => { const newP = {...p, activeTheme: t}; saveProfile(playerName, newP); return newP; }); localStorage.setItem('pkmnTheme', t); }} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} />}
                                {gameState === 'ROULETTE' && <MysteryGift onThemeSelect={(t) => { setActiveTheme(t); setProfile(p => { const newP = {...p, activeTheme: t}; saveProfile(playerName, newP); return newP; }); localStorage.setItem('pkmnTheme', t); }} activeTheme={activeThemeRef.current || activeTheme} profile={profile} onOpenComplete={handleMysteryGiftComplete} onClose={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} onActivateTrial={(t) => {
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

                {gameState === 'LOADING_BOARD' && (
                    <div className="absolute inset-0 theme-bg flex flex-col items-center justify-center z-[100]">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-pink-500 rounded-full animate-spin mb-6"></div>
                        <h2 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest">Menyiapkan Meja</h2>
                        <div className="w-3/4 max-w-[200px] bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                {gameState === 'COUNTDOWN' && (
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
                        <div key={countdown} style={{ animation: 'countdownPop 0.5s ease-out forwards', fontSize: countdown === 'GO!' ? '4rem' : '6rem', color: countdown === 'GO!' ? '#10b981' : 'white', fontWeight: 900, display: 'inline-block' }}>
                            {countdown}
                        </div>
                    </div>
                )}

                {gameState === 'PAUSED' && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100] px-6">
                        <h2 className="text-2xl font-black theme-text mb-8 tracking-widest uppercase">Dijeda</h2>
                        <button onClick={() => { AudioEngine.uiStartGame(); setGameState('PLAYING'); }} className="btn-modern bg-gray-900 text-white w-full max-w-[260px] py-4 rounded-xl font-bold mb-4 shadow-md">Lanjutkan</button>
                        <button onClick={() => {
                            // Simpan state saat keluar dari pause menu
                            const sessionData = saveCurrentSession(true);
                            const statsProfile = flushStats(profile, { scoreAchieved: score, activeSession: sessionData });
                            const newProfile = { ...statsProfile, hp, hints, shuffles, currentLevel: level, currentScore: score };
                            setProfile(newProfile); saveProfile(playerName, newProfile);
                            AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN');
                        }} className="btn-modern bg-gray-100 text-gray-600 w-full max-w-[260px] py-4 rounded-xl font-bold">Simpan & Keluar ke Menu</button>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="absolute inset-0 theme-bg flex flex-col items-center justify-center z-[100] p-6">
                        <h2 className="text-2xl font-black theme-text mb-8 uppercase tracking-widest">Permainan Berakhir</h2>
                        <div className="w-full max-w-[300px] flex flex-col gap-3 mb-8">
                            <div className="flex justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                <span className="text-gray-500 font-bold text-sm">Skor Akhir</span>
                                <span className="theme-text-active font-black text-lg">{formatNumber(score)}</span>
                            </div>
                            <div className="flex justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                                <span className="text-gray-500 font-bold text-sm">Berhenti di Level</span>
                                <span className="theme-text font-black text-lg">{level}</span>
                            </div>
                            <div className="flex justify-between bg-amber-50 border border-amber-100 p-4 rounded-2xl shadow-sm">
                                <span className="text-amber-600 font-bold text-sm flex items-center gap-1"><IconCoin className="w-4 h-4" /> Didapat</span>
                                <span className="text-amber-500 font-black text-lg flex items-center gap-1">+{calculateCoinReward(score)} <IconCoin/></span>
                            </div>
                        </div>
                        {isNewRecord && <div className="bg-yellow-400 text-white font-black px-6 py-2 rounded-full mb-6 text-sm shadow-md uppercase tracking-wider">Rekor Baru!</div>}
                        <p className="text-xs text-red-500 font-bold mb-1">Yah, nyawanya habis sayang, mulai dari level 1 lagi ya.</p>
                        <p className="text-[11px] text-gray-400 font-medium mb-4">Tenang cintaku, item, koin, gem & tema kamu tetap aman kok.</p>
                        <button onClick={() => prepareLevel(1)} className="btn-modern bg-pink-500 text-white w-full max-w-[300px] py-4 rounded-xl font-bold shadow-md mb-4">Main Lagi Buat Aku (Level 1)</button>
                        <button onClick={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} className="text-gray-400 font-bold text-sm">Kembali ke Menu</button>
                    </div>
                )}

                {gameState === 'WON' && (
                    <div className="absolute inset-0 theme-bg flex flex-col items-center justify-center z-[100] px-8">
                        <h2 className="text-3xl font-black theme-text mb-2 tracking-widest text-center">Level {level} Selesai!</h2>
                        {sweetMessage && <p className="text-sm theme-text-active font-bold text-center mb-6 max-w-[280px]">"{sweetMessage}"</p>}
                        
                        <div className="bg-white/80 p-5 rounded-2xl w-full max-w-[300px] mb-8 shadow-sm flex flex-col gap-3">
                            <h3 className="font-bold text-gray-500 text-center mb-2 border-b pb-2">Statistik Level Ini</h3>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Waktu Main:</span>
                                <span className="font-black theme-text">{window.lastLevelStats?.timeSec || 0}s</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Kesalahan:</span>
                                <span className="font-black text-rose-500">{window.lastLevelStats?.wrong || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Sisa Nyawa:</span>
                                <span className="font-black text-emerald-500">{window.lastLevelStats?.hpRemaining || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Maksimal Kombo:</span>
                                <span className="font-black text-orange-500">x{window.lastLevelStats?.combo || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Bantuan Dipakai:</span>
                                <span className="font-black text-sky-500">{(window.lastLevelStats?.hints || 0) + (window.lastLevelStats?.shuffles || 0)}</span>
                            </div>
                        </div>

                        <button onClick={() => {
                            const nextLevel = level + 1;
                            const newB = generateBoard(activeThemeRef.current, nextLevel);
                            prepareLevel(nextLevel, newB, activeThemeRef.current, score, hp, hints, shuffles);
                            AudioEngine.uiStartGame(); setGameState('PLAYING');
                        }} className="btn-modern bg-pink-500 text-white w-full max-w-[300px] py-4 rounded-xl font-bold shadow-md text-lg">
                            Lanjut ke Level {level + 1}
                        </button>
                    </div>
                )}
                
            </div>
        </div>
        
                
                {showSettings && (
                    <SettingsPanel 
                        syncStatus={syncStatus}
                        setShowSyncLog={setShowSyncLog}
                        profile={profile}
                        setProfile={setProfile}
                        saveProfile={saveProfile}
                        playerName={playerName}
                        onClose={() => setShowSettings(false)} 
                        onLogout={() => {
                            localStorage.removeItem('pkmnPlayerName'); 
                            setPlayerName(''); 
                            setGameState('LOGIN');
                            setShowSettings(false);
                        }} 
                    />
                )}

                {showCustomThemeEditor && (
                    <CustomThemeEditor
                        profile={profile}
                        onSave={(emojis) => {
                            const newProfile = { ...profile, customEmojis: emojis };
                            setProfile(newProfile); saveProfile(playerName, newProfile);
                            if (activeTheme === 'custom') {
                                THEMES.custom.data = emojis;
                                setBoard(prev => {
                                    // Let's just force a reload or user can start new game
                                    return prev;
                                });
                                setAlertData({ title: 'Tersimpan!', content: 'Emoji custom berhasil diperbarui. Berlaku di game selanjutnya.' });
                            }
                            setShowCustomThemeEditor(false);
                        }}
                        onClose={() => setShowCustomThemeEditor(false)}
                    />
                )}
        
        {showSyncLog && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-[200] p-4">
                <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold theme-text">Log Sinkronisasi</h3>
                        <button onClick={() => setShowSyncLog(false)} className="text-gray-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="p-4 bg-gray-900 text-gray-300 font-mono text-[10px] h-64 overflow-y-auto flex flex-col gap-1">
                        {syncLogs.length === 0 ? <p className="text-gray-500 italic">Belum ada log aktivitas.</p> : syncLogs.map((l, i) => (
                            <div key={i} className="border-b border-gray-800 pb-1">{l}</div>
                        ))}
                    </div>
                </div>
            </div>
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

        </React.Fragment>
    );
};

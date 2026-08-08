const HUD = ({ regenTimeLeft, multiplayerState, matchTime, formatRegenTime, roomData }) => {
    const ctx = React.useContext(GameContext);
    const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, hints, shuffles, level, progress, showTimerAdd, isMuted, setIsMuted, playerName, getSecondsLeft, handleBuyHpInGame, handleHintClick, handleShuffleClick, AudioEngine, THEMES } = ctx;
    
    return (
        multiplayerState === 'PLAYING' && roomData ? (
                        <div className={`w-full flex flex-col shrink-0 border-b theme-border z-50 py-2 px-3 gap-2 shadow-sm ${(THEMES[activeThemeRef.current || activeTheme]?.background || THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home']) ? 'bg-white/20 backdrop-blur-md' : 'theme-bg'}`}>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col items-start w-[35%]">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">{roomData.host}</span>
                                    <div className="w-full bg-emerald-100 rounded-full h-[6px] relative overflow-hidden border border-emerald-200 shadow-inner">
                                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-200 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.1)]" style={{ width: `${roomData.host === playerName ? progress : (roomData.players.find(p => p.name === roomData.host)?.progress || 0)}%` }} />
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-full border theme-border shadow-sm">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-pink-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span className="text-sm font-black theme-text-active">
                                                {roomData.startAt ? `${Math.floor(matchTime / 60).toString().padStart(2, '0')}:${(matchTime % 60).toString().padStart(2, '0')}` : '00:00'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end w-[35%]">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">{roomData.players.find(p => p.name !== roomData.host)?.name || 'Guest'}</span>
                                    <div className="w-full bg-sky-100 rounded-full h-[6px] relative overflow-hidden border border-sky-200 shadow-inner">
                                        <div className="h-full rounded-full bg-sky-500 transition-all duration-200 shadow-[inset_0_-1px_1px_rgba(0,0,0,0.1)]" style={{ width: `${roomData.host !== playerName ? progress : (roomData.players.find(p => p.name !== roomData.host)?.progress || 0)}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                            ) : (
                        <div className={`w-full flex flex-col shrink-0 border-b theme-border z-50 py-0.5 px-1 gap-0.5 shadow-sm ${(THEMES[activeThemeRef.current || activeTheme]?.background || THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home']) ? 'bg-white/20 backdrop-blur-md' : 'theme-bg'}`}>
                            
                            {/* Top Row: HP, Level, Controls */}
                            <div className="flex items-center justify-between w-full">
                                {/* HP Left */}
                                <div className="flex items-center gap-1">
                                    <div className="flex items-center bg-white px-2 py-0 rounded-full border theme-border shadow-sm shrink-0 min-w-[60px]">
                                        <IconHeart className="w-4 h-4 theme-text-active mr-1" />
                                        <span className="text-sm font-bold theme-text">{hp}</span>
                                        <div onClick={handleBuyHpInGame} className="w-3.5 h-3.5 bg-emerald-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold ml-1 shadow-sm cursor-pointer">+</div>
                                    </div>
                                    {regenTimeLeft !== null && (
                                        <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-1.5 rounded-full border theme-border drop-shadow-sm">{formatRegenTime(regenTimeLeft)}</span>
                                    )}
                                </div>
                                {/* Level Centered */}
                                <div className="flex items-center bg-white px-4 py-0 rounded-full border theme-border shadow-sm shrink-0">
                                    <span className="text-sm font-black theme-text-active">Level {level}</span>
                                </div>
                                {/* Pause & Sound Right */}
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => { const newMuted = !isMuted; setIsMuted(newMuted); AudioEngine.updateSettings({ muteMusic: newMuted, muteSfx: newMuted }); }} className={`bg-white w-6 h-6 rounded-full flex items-center justify-center border theme-border shadow-sm active:scale-95 transition-transform ${isMuted ? 'text-gray-400' : 'theme-text-active'}`}>
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
                    )
    );
};

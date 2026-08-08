const WinScreen = () => {
    const ctx = React.useContext(GameContext);
    const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError, prepareLevel, sweetMessage, hints, shuffles } = ctx;
    return (
        <div className="absolute inset-0 theme-bg flex flex-col items-center justify-center z-[100] px-8">
                        <h2 className="text-3xl font-black theme-text mb-2 tracking-widest text-center uppercase">Level {level} Selesai</h2>
                        {sweetMessage && <p className="text-sm theme-text-active font-bold text-center mb-6 max-w-[280px]">"{sweetMessage}"</p>}
                        
                        <div className="bg-white/80 p-5 rounded-3xl w-full max-w-[300px] mb-8 shadow-sm flex flex-col gap-4 border border-white/50 backdrop-blur-md">
                            <div className="flex flex-col items-center border-b border-gray-100 pb-4 mb-2">
                                <span className="font-bold text-gray-500 text-sm mb-1">Skor Level</span>
                                <span className="font-black text-4xl theme-text-active">{formatNumber(window.lastLevelStats?.score || 0)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700 text-sm">Maksimal Kombo</span>
                                <span className="font-black text-orange-500 text-base">x{window.lastLevelStats?.combo || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700 text-sm">Waktu Tersisa</span>
                                <span className="font-black theme-text text-base">{window.lastLevelStats?.remainingSeconds || 0}s</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700 text-sm">Kesalahan</span>
                                <span className="font-black text-rose-500 text-base">{window.lastLevelStats?.wrong || 0}</span>
                            </div>
                            
                            {(!window.lastLevelStats?.wrong && window.lastLevelStats?.hints === 0 && window.lastLevelStats?.shuffles === 0) && (
                                <div className="mt-2 bg-emerald-50 text-emerald-600 font-black text-center py-2 rounded-xl text-sm border border-emerald-100 tracking-wider">
                                    FLAWLESS
                                </div>
                            )}
                        </div>

                        <button onClick={() => {
                            const nextLevel = level + 1;
                            const newB = generateBoard(activeThemeRef.current, nextLevel);
                            prepareLevel(nextLevel, newB, activeThemeRef.current, 0, hp, hints, shuffles);
                        }} className="btn-modern bg-pink-500 text-white w-full max-w-[300px] py-4 rounded-xl font-bold shadow-md text-lg mb-3">
                            Lanjut ke Level {level + 1}
                        </button>
                        <button onClick={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} className="btn-modern bg-gray-100 text-gray-600 w-full max-w-[300px] py-4 rounded-xl font-bold">
                            Kembali ke Menu
                        </button>
                    </div>
    );
};

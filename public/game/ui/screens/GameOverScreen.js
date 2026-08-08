const GameOverScreen = () => {
    const ctx = React.useContext(GameContext);
    const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError, prepareLevel } = ctx;
    return (
        <div className="absolute inset-0 theme-bg flex flex-col items-center justify-center z-[100] px-8">
                        <h2 className="text-3xl font-black theme-text mb-2 tracking-widest text-center uppercase">Waktu Habis</h2>
                        <p className="text-sm theme-text-active font-bold text-center mb-6 max-w-[280px]">"Waktunya habis, coba lagi ya sayang."</p>
                        
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
                                <span className="font-semibold text-gray-700 text-sm">Pasangan Ditemukan</span>
                                <span className="font-black text-sky-500 text-base">{window.lastLevelStats?.matches || 0}</span>
                            </div>
                            <div className="flex justify-between items-center bg-rose-50 -mx-2 px-2 py-1.5 rounded-xl border border-rose-100">
                                <span className="font-bold text-rose-600 text-sm flex items-center gap-1"><IconHeart className="w-3.5 h-3.5" /> Nyawa</span>
                                <span className="font-black text-rose-500 text-base">{window.lastLevelStats?.hpRemaining || 0} / 5</span>
                            </div>
                        </div>

                        <button onClick={() => {
                            if (hp <= 0) {
                                window.Dialog?.showError?.("Gagal", "Nyawa kamu habis! Tunggu beberapa saat atau beli di Shop.");
                                return;
                            }
                            prepareLevel(level);
                        }} className="btn-modern bg-pink-500 text-white w-full max-w-[300px] py-4 rounded-xl font-bold shadow-md mb-3">Coba Lagi Level {level}</button>
                        <button onClick={() => { AudioEngine.uiReturnMenu(); setGameState('LOBBY_MAIN'); }} className="btn-modern bg-gray-100 text-gray-600 w-full max-w-[300px] py-4 rounded-xl font-bold">Kembali ke Menu</button>
                    </div>
    );
};

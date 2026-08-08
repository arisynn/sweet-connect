const LoginScreen = () => {
    const ctx = React.useContext(GameContext);
    const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError, setLoginError } = ctx;
    return (
        <div className="absolute inset-0 bg-[#F2F2F7] flex flex-col items-center justify-center z-[100] px-8 overflow-hidden animate-page-enter">
                        {/* Always use default Sweet background for isolation */}
                        {THEMES['sweets']?.menuBackgrounds?.['home'] && (
                            <img src={THEMES['sweets'].menuBackgrounds['home']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-30 blur-[2px]" alt=""/>
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
                                <div className="mb-4 bg-gray-100 border border-gray-200 text-gray-500 text-xs font-bold px-4 py-2 rounded-xl flex items-center shadow-sm w-full">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.9 9.9a9.043 9.043 0 00-6.263 2.59A1.5 1.5 0 004 15.35M14.1 14.1a9.043 9.043 0 016.263-2.59 1.5 1.5 0 01.363 2.86" /></svg>
                                    Mode Offline Aktif. Cloud tidak tersedia.
                                </div>
                            )}

                            {loginError && (
                                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold px-4 py-3 rounded-xl flex items-center shadow-sm w-full animate-fade-in">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 mr-2 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span className="flex-1">{loginError}</span>
                                </div>
                            )}

                            <div className="w-full relative mb-4">
                                <input type="text" placeholder="Nama Panggilan" maxLength={15}
                                    className="bg-white border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-3xl px-6 py-4 text-center text-lg font-bold text-gray-800 w-full focus:outline-none focus:border-pink-400 focus:shadow-[0_4px_16px_rgba(236,72,153,0.15)] transition-all duration-300"
                                    value={playerName} onChange={e => { setPlayerName(e.target.value); setLoginError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLoginSubmit(false)} disabled={isLoadingProfile || gameState === 'LOGIN_LOADING'}
                                />
                            </div>
                            
                            <button onClick={() => handleLoginSubmit(false)} disabled={isLoadingProfile || gameState === 'LOGIN_LOADING' || !playerName.trim()} className="flex items-center justify-center bg-gray-900 text-white w-full py-4 text-base font-bold rounded-3xl shadow-lg hover:bg-gray-800 active:bg-black active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:active:scale-100 disabled:cursor-not-allowed">
                                {isLoadingProfile || gameState === 'LOGIN_LOADING' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                        Menyiapkan Tema...
                                    </>
                                ) : loginError ? 'Coba Lagi' : 'Mulai Bermain'}
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
    );
};

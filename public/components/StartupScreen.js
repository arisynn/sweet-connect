

const StartupScreen = ({ 
    activeTheme, 
    THEMES, 
    startupMessage, 
    startupProgress, 
    showCloudRecovery, 
    playerName, 
    localRecoveryProfile, 
    finishStartup, 
    getDefaultProfile,
    setShowCloudRecovery
}) => {
    const themeObj = THEMES[activeTheme] || THEMES['sweets'];
    const bgUrl = themeObj.menuBackgrounds?.home || '';
    const primaryColor = themeObj.primary || '#ec4899';
    
    // Fallback illustration: use the first emoji of the theme if no specific illustration exists
    const centerIllustration = themeObj.data ? themeObj.data[0] : "🍬";

    const renderLogo = () => {
        if (themeObj.logo && typeof themeObj.logo === 'object' && themeObj.logo.sprite) {
            const { x, y, w, h, bgSize } = themeObj.logo.sprite;
            const src = themeObj.logo.url || themeObj.logo.src;
            return (
                <div 
                    className="drop-shadow-xl mb-4"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundPosition: `-${x}px -${y}px`,
                        backgroundSize: bgSize || 'auto',
                        width: `${w}px`,
                        height: `${h}px`,
                        backgroundRepeat: 'no-repeat'
                    }}
                    title="Sweet Connect"
                />
            );
        }
        
        const logoUrl = (themeObj.logo && typeof themeObj.logo === 'string') ? themeObj.logo : "/logo.png";
        return (
            <img 
                src={logoUrl} 
                onError={(e) => { e.target.onerror = null; e.target.src="/logo.png"; }} 
                alt="Logo" 
                className="w-28 h-28 object-contain drop-shadow-xl mb-4" 
            />
        );
    };
    
    return (
        <div className="absolute inset-0 bg-[#F2F2F7] flex flex-col items-center justify-between z-[100] px-8 py-12 overflow-hidden animate-fade-in">
            {bgUrl && (
                <img src={bgUrl} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-30 blur-[2px]" alt=""/>
            )}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>

            {/* TOP: Logo & Title */}
            <div className="relative z-10 flex flex-col items-center animate-logo-enter mt-4">
                {renderLogo()}
                <h1 className="text-3xl font-black text-gray-800 tracking-tight drop-shadow-sm text-center">Sweet Connect</h1>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2 bg-gray-100/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">v1.0.1</span>
            </div>

            {/* CENTER: Theme Illustration / Mascot */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center animate-fade-in my-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-white/40 rounded-full blur-2xl scale-[2] animate-pulse pointer-events-none"></div>
                    <div className="text-8xl drop-shadow-2xl animate-float relative z-10" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                        {centerIllustration}
                    </div>
                </div>
            </div>

            {/* BOTTOM: Progress Card */}
            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center mb-4">
                {!showCloudRecovery ? (
                    <div className="w-full bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center transform transition-all duration-500">
                        <div className="w-full flex items-center justify-between mb-4 px-1">
                            <span className="text-xs font-bold text-gray-500 truncate pr-2 animate-fade-in" key={startupMessage}>{startupMessage}</span>
                            <span className="text-sm font-black shrink-0" style={{ color: primaryColor }}>{startupProgress}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner relative">
                            <div 
                                className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden" 
                                style={{ width: `${startupProgress}%`, backgroundColor: primaryColor }}
                            >
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full bg-white border border-amber-200 rounded-3xl p-6 text-center shadow-xl animate-fade-in-up">
                        <div className="bg-amber-50 text-amber-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm transform -rotate-3">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-gray-800 text-lg font-black mb-1.5">Data Cloud Tidak Ditemukan</h3>
                        <p className="text-xs text-gray-500 mb-6 font-medium px-2 leading-relaxed">Kami menemukan simpanan lokal, namun server cloud kosong. Gunakan data lokal?</p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => { setShowCloudRecovery(false); finishStartup(playerName, localRecoveryProfile, true, null); }} 
                                className="bg-amber-400 hover:bg-amber-500 active:scale-[0.98] text-white w-full py-4 rounded-2xl font-bold shadow-md transition-all"
                            >
                                YA, Gunakan Data Lokal
                            </button>
                            <button 
                                onClick={() => { setShowCloudRecovery(false); finishStartup(playerName, getDefaultProfile(), true, null); }} 
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-bold text-xs py-3 rounded-2xl transition-all"
                            >
                                TIDAK, Buat Akun Baru
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-12px) rotate(2deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 1.5s infinite linear;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
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

window.StartupScreen = StartupScreen;

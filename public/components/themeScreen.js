const ThemeScreen = ({ profile, setProfile, activeTheme, onThemeSelect, onClose, saveProfile, playerName }) => {
    const { useState, useEffect } = React;

    useEffect(() => {
        // Clear newThemes when opening ThemeScreen
        if (profile.newThemes && profile.newThemes.length > 0) {
            let p = { ...profile };
            p.newThemes = [];
            setProfile(p);
            if (playerName) saveProfile(playerName, p);
        }
    }, []);

    const renderThemeItem = (key, idx) => {
        const t = THEMES[key];
        if (!t) return null;
        
        const isUnlocked = profile.unlockedThemes && profile.unlockedThemes.includes(key);
        if (!isUnlocked) return null;
        const isActive = activeTheme === key;

        return (
            <div key={key} onClick={() => { onThemeSelect(key); AudioEngine.uiClick(); }} className={`animate-card-enter flex flex-col p-3 rounded-2xl border-2 shadow-sm transition-all cursor-pointer ${isActive ? 'bg-pink-50 border-pink-400' : 'bg-white border-transparent hover:border-pink-200'}`} style={{animationDelay: `${idx * 50}ms`}}>
                <div className="flex justify-center items-center mb-3">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl relative shrink-0 shadow-sm" style={{ backgroundColor: t.preview ? 'transparent' : (t.colors?.bg || '#f3f4f6') }}>
                        {t.preview ? (
                            <img src={t.preview} alt={t.name} className="w-16 h-16 object-cover rounded-xl shadow-sm" draggable="false" />
                        ) : t.data && t.data[0] && (t.data[0].startsWith('http') || t.data[0].startsWith('/') || t.data[0].includes('.png')) ? (
                            <img src={t.data[0]} alt="theme icon" className="w-10 h-10 object-contain" draggable="false" />
                        ) : (
                            <span style={{color: t.colors?.text || '#374151'}}>{t.data && t.data.length > 0 ? (t.data[0].length < 3 ? t.data[0] : '🎨') : '🎨'}</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center flex-1">
                    <span className={`font-bold text-sm text-center mb-1 ${isActive ? 'text-pink-600' : 'text-gray-700'}`}>{t.name}</span>
                    <span className="text-[9px] text-gray-400 text-center mb-3 leading-tight flex-1 line-clamp-2">{t.desc}</span>
                    
                    <div className="flex gap-2 w-full mt-auto">
                        {key === 'custom' && (
                            <button onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('editCustomTheme')); AudioEngine.uiClick(); }} className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm active:scale-95 bg-purple-100 text-purple-600 hover:bg-purple-200">
                                Edit
                            </button>
                        )}
                        {isActive ? (
                            <div className="w-full text-center text-[10px] font-bold py-1.5 rounded-lg bg-pink-500 text-white shadow-sm">Dipakai</div>
                        ) : (
                            <div className="w-full text-center text-[10px] font-bold py-1.5 rounded-lg bg-gray-100 text-gray-500">Pakai</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const ownedThemes = Object.keys(THEMES).filter(k => profile.unlockedThemes && profile.unlockedThemes.includes(k));

    return (
        <div className={`absolute inset-0 z-[100] flex flex-col items-center animate-page-enter ${THEMES[activeTheme]?.background ? 'bg-transparent' : 'theme-bg'}`}>
            {THEMES[activeTheme]?.menuBackgrounds?.['theme'] && (
                <img src={THEMES[activeTheme].menuBackgrounds['theme']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
            )}
            <div className="absolute inset-0 z-10 w-full h-full flex flex-col items-center custom-scroll overflow-y-auto pb-10">

            <div className="w-full flex items-center justify-between mb-4 mt-2 px-2 sticky top-0 bg-white/50 backdrop-blur-md z-20 py-2 border-b theme-border shadow-sm">
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 shadow-sm transition-colors"><IconChevronLeft /></button>
                <div className="flex bg-white rounded-xl px-4 py-1.5 shadow-sm border theme-border">
                    <h2 className="text-sm font-black theme-text">Tema</h2>
                </div>
                <div className="w-10"></div>
            </div>
            
            <div className="w-full max-w-[320px] flex-1 pb-8 px-1 relative z-10">
                {ownedThemes.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm mt-10">Belum ada tema. Beli di Toko!</div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {ownedThemes.map((key, idx) => renderThemeItem(key, idx))}
                    </div>
                )}
            </div>
                    </div>
        </div>
    );};

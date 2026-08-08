const MysteryGift = ({ profile, setProfile, saveProfile, playerName, onOpenComplete, onClose, activeTheme, onActivateTrial, onThemeSelect }) => {
    const { useState, useEffect } = React;
    const [showPrizePool, setShowPrizePoolState] = useState(false);
    const ppCloseCb = React.useRef(null);
    const setShowPrizePool = (val, fromPop = false) => {
        if (val && !showPrizePool) {
            ppCloseCb.current = (isPop) => setShowPrizePoolState(false);
            if (window.PopupManager) window.PopupManager.register(ppCloseCb.current);
        } else if (!val && showPrizePool) {
            if (window.PopupManager) window.PopupManager.unregister(ppCloseCb.current, fromPop === true);
        }
        setShowPrizePoolState(val);
    };
    
    const [showThemeShop, setShowThemeShopState] = useState(false);
    const tsCloseCb = React.useRef(null);
    const setShowThemeShop = (val, fromPop = false) => {
        if (val && !showThemeShop) {
            tsCloseCb.current = (isPop) => setShowThemeShopState(false);
            if (window.PopupManager) window.PopupManager.register(tsCloseCb.current);
        } else if (!val && showThemeShop) {
            if (window.PopupManager) window.PopupManager.unregister(tsCloseCb.current, fromPop === true);
        }
        setShowThemeShopState(val);
    };
    
    const [gachaMode, setGachaMode] = useState('dice'); // 'item', 'theme', 'dice', 'mines'
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const syncProfile = async (newProfile) => {
        setProfile(newProfile);
        try {
            await saveProfile(newProfile, 'minigame_sync');
        } catch(e) {
        }
    };

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const minSwipeDistance = 50;
        
        const modes = ['dice', 'item', 'theme', 'mines'];
        const currentIndex = modes.indexOf(gachaMode);
        
        if (distance > minSwipeDistance) {
            const nextMode = modes[(currentIndex + 1) % modes.length];
            setGachaMode(nextMode);
        }
        if (distance < -minSwipeDistance) {
            const prevMode = modes[(currentIndex - 1 + modes.length) % modes.length];
            setGachaMode(prevMode);
        }
    };

    const engine = useGachaEngine({
        profile, 
        onOpenComplete, 
        AudioEngine: typeof AudioEngine !== 'undefined' ? AudioEngine : null,
        THEMES,
        gachaMode
    });

    const cost1x = gachaMode === 'item' ? 500 : 50;
    const cost10x = gachaMode === 'item' ? 4500 : 450;
    const costCurrency = gachaMode === 'item' ? 'coins' : 'gems';
    const canUseVoucher1x = gachaMode === 'item' && (profile.gacha_vouchers || 0) >= 1;
    const canUseVoucher10x = gachaMode === 'item' && (profile.gacha_vouchers || 0) >= 10;
    const gachaThemes = Object.keys(THEMES || {}).filter(k => THEMES[k].type === 'gacha' && THEMES[k].price > 0);

    return (
        <div className={`absolute inset-0 z-[100] flex flex-col items-center animate-page-enter ${THEMES[activeTheme]?.background ? 'bg-transparent' : 'theme-bg'}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {THEMES[activeTheme]?.menuBackgrounds?.['gacha'] && (
                <img src={THEMES[activeTheme].menuBackgrounds['gacha']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
            )}
            
            {/* Fixed Header */}
            <div className="absolute top-0 left-0 right-0 h-[64px] bg-white/90 backdrop-blur-md z-30 border-b border-gray-100 shadow-sm flex items-center px-4">
                <div className="flex-1 flex justify-start">
                    <button disabled={engine.opening} onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-full disabled:opacity-50 text-gray-500 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100/50">
                        <IconChevronLeft className="w-5 h-5"/>
                    </button>
                </div>
                
                <div className="flex-none bg-gray-50/80 p-1 rounded-xl flex items-center shadow-inner border border-gray-100/50">
                    <button disabled={engine.opening} onClick={() => setGachaMode('dice')} className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${gachaMode === 'dice' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>DICE</button>
                    <button disabled={engine.opening} onClick={() => setGachaMode('item')} className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${gachaMode === 'item' ? 'bg-white text-amber-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>ITEM</button>
                    <button disabled={engine.opening} onClick={() => setGachaMode('theme')} className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${gachaMode === 'theme' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>TEMA</button>
                    <button disabled={engine.opening} onClick={() => setGachaMode('mines')} className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${gachaMode === 'mines' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>MINES</button>
                </div>
                
                <div className="flex-1"></div>
            </div>

            {/* Scrollable Content */}
            <div className="absolute top-[64px] bottom-0 left-0 right-0 z-10 w-full flex flex-col items-center custom-scroll overflow-y-auto pb-10">
            {gachaMode === 'dice' ? (
                <DiceGacha profile={profile} syncProfile={syncProfile} onOpenComplete={onOpenComplete} opening={engine.opening} setOpening={engine.setOpening} />
            ) : gachaMode === 'mines' ? (
                <MinesGame profile={profile} syncProfile={syncProfile} onOpenComplete={onOpenComplete} opening={engine.opening} setOpening={engine.setOpening} />
            ) : gachaMode === 'item' ? (
                <MagicWheelGacha 
                    profile={profile} 
                    opening={engine.opening} 
                    setOpening={engine.setOpening} 
                    setShowPrizePool={setShowPrizePool} 
                    currentPrizesCoin={engine.currentPrizesCoin} 
                    getIconComponent={engine.getIconComponent} 
                    AudioEngine={typeof AudioEngine !== 'undefined' ? AudioEngine : null} 
                    processReward={engine.processReward} 
                    cost1x={cost1x} 
                    cost10x={cost10x} 
                    canUseVoucher1x={canUseVoucher1x} 
                    canUseVoucher10x={canUseVoucher10x} 
                    costCurrency={costCurrency} 
                />
            ) : (
                <GachaBox 
                    gachaMode={gachaMode}
                    gachaState={engine.gachaState}
                    profile={profile}
                    cost1x={cost1x}
                    cost10x={cost10x}
                    canUseVoucher1x={canUseVoucher1x}
                    canUseVoucher10x={canUseVoucher10x}
                    costCurrency={costCurrency}
                    spinGacha={engine.spinGacha}
                    opening={engine.opening}
                    setShowPrizePool={setShowPrizePool}
                    setShowThemeShop={setShowThemeShop}
                    formatNumber={window.formatNumber}
                />
            )}
            </div>

            <RewardPopup 
                wonPrize={engine.wonPrize}
                setWonPrize={engine.setWonPrize}
                wonPrizesList={engine.wonPrizesList}
                setWonPrizesList={engine.setWonPrizesList}
            />

            {/* Prize Pool Modal */}
            <div className={`absolute inset-0 bg-white z-[120] transition-transform duration-300 ${showPrizePool ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="h-full flex flex-col relative">
                    <div className="absolute top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-4 z-10 shrink-0">
                        <h3 className="font-black text-lg text-gray-800">Daftar Hadiah</h3>
                        <button onClick={() => setShowPrizePool(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scroll p-4 mt-[60px]">
                        <div className="grid grid-cols-2 gap-3">
                            {engine.activePrizes.map((p, i) => (
                                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center">
                                    <div className="w-12 h-12 mb-2">{p.icon}</div>
                                    <div className="text-xs font-black text-gray-800 mb-0.5">{p.name}</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">{p.type === 'theme' ? 'Tema' : p.item}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Shop Modal */}
            {gachaMode === 'theme' && (
                <div className={`absolute inset-0 bg-white z-[120] transition-transform duration-300 ${showThemeShop ? 'translate-y-0' : 'translate-y-full'}`}>
                    <div className="h-full flex flex-col relative">
                        <div className="absolute top-0 left-0 right-0 h-[60px] bg-white border-b border-gray-100 flex items-center justify-between px-4 z-10 shrink-0 shadow-sm">
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-lg text-gray-800">Tukar Tema</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 bg-fuchsia-50 px-3 py-1.5 rounded-full border border-fuchsia-100">
                                    <IconRainbowCandy className="w-4 h-4"/>
                                    <span className="text-xs font-black text-fuchsia-600">{typeof window.formatNumber === 'function' ? window.formatNumber(profile.rainbow_candy || 0) : profile.rainbow_candy || 0}</span>
                                </div>
                                <button onClick={() => setShowThemeShop(false)} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scroll p-4 mt-[60px] bg-gray-50">
                            <p className="text-xs text-gray-500 font-medium text-center mb-6 max-w-xs mx-auto">Kumpulkan Permen Pelangi dari Gacha Tema untuk ditukar dengan tema-tema eksklusif ini!</p>
                            <div className="grid grid-cols-2 gap-4">
                                {gachaThemes.map(key => {
                                    const t = THEMES[key];
                                    const isUnlocked = (profile.unlockedThemes || []).includes(key);
                                    const price = t.price || 100;
                                    const canAfford = (profile.rainbow_candy || 0) >= price;
                                    const trialValid = profile.themeTrials && profile.themeTrials[key] && (Date.now() - profile.themeTrials[key] < 7 * 24 * 60 * 60 * 1000);
                                    const canTrial = !isUnlocked && !trialValid;
                                    
                                    return (
                                        <div key={key} className={`bg-white rounded-3xl overflow-hidden shadow-sm border ${isUnlocked ? 'border-emerald-200' : 'border-gray-100'} flex flex-col relative`}>
                                            <div className="h-24 relative overflow-hidden" style={{ background: t.background ? `url(${t.background})` : t.colors?.bg || '#fdf2f8', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                                {isUnlocked && (
                                                    <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                                        <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                                            DIMILIKI
                                                        </div>
                                                    </div>
                                                )}
                                                {!isUnlocked && trialValid && (
                                                    <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                                                        TRIAL AKTIF
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 flex-1 flex flex-col">
                                                <h4 className="text-xs font-black text-gray-800 mb-1">{t.name}</h4>
                                                <div className="flex-1"></div>
                                                
                                                {isUnlocked ? (
                                                    <button onClick={() => { setShowThemeShop(false); onClose(); if(onThemeSelect) onThemeSelect(key); }} className="w-full mt-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold border border-emerald-100 active:bg-emerald-100 transition-colors">
                                                        GUNAKAN
                                                    </button>
                                                ) : (
                                                    <div className="flex flex-col gap-1.5 mt-3">
                                                        <button 
                                                            disabled={!canAfford}
                                                            onClick={() => engine.exchangeTheme(key, price)}
                                                            className={`w-full py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors ${canAfford ? 'bg-fuchsia-500 text-white shadow-sm active:bg-fuchsia-600' : 'bg-gray-100 text-gray-400'}`}
                                                        >
                                                            <IconRainbowCandy className="w-3.5 h-3.5"/>
                                                            {price} Tukar
                                                        </button>
                                                        {canTrial && (
                                                            <button 
                                                                onClick={() => { setShowThemeShop(false); onClose(); if(onActivateTrial) onActivateTrial(key); }}
                                                                className="w-full py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold border border-indigo-100 active:bg-indigo-100 transition-colors"
                                                            >
                                                                Coba Gratis 7 Hari
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

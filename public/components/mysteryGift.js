// ===================== TEMPAT GACHA =====================
const IconRainbowCandy = ({ className }) => <img src="/assets/gacha/permenpelangi.png" className={className || "w-5 h-5"} draggable="false" alt="Permen Pelangi" />;
const IconGachaItem = ({ className }) => <img src="/assets/gacha/gachaitem.png" className={className || "w-5 h-5"} draggable="false" alt="Gacha Item" />;
const IconGachaTheme = ({ className }) => <img src="/assets/gacha/gachatema.png" className={className || "w-5 h-5"} draggable="false" alt="Gacha Tema" />;

const MysteryGift = ({ profile, onOpenComplete, onClose, activeTheme, onActivateTrial, onThemeSelect }) => {
    const { useState, useEffect } = React;
    const [opening, setOpening] = useState(false);
    const [wonPrize, setWonPrize] = useState(null);
    const [wonPrizesList, setWonPrizesList] = useState(null);
    const [showPrizePool, setShowPrizePool] = useState(false);
    const [showThemeShop, setShowThemeShop] = useState(false);
    const [gachaState, setGachaState] = useState('idle'); // 'idle', 'shaking', 'open'
    const [gachaMode, setGachaMode] = useState('item'); // 'item' or 'theme'
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

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

        if (distance > minSwipeDistance) {
            // Swipe left
            if (gachaMode === 'item') {
                AudioEngine.uiSwitchTab();
                setGachaMode('theme');
            }
        } else if (distance < -minSwipeDistance) {
            // Swipe right
            if (gachaMode === 'theme') {
                AudioEngine.uiSwitchTab();
                setGachaMode('item');
            }
        }
    };

    const getIconComponent = (iconName) => {
        const iconProps = { className: "w-full h-full p-1.5 drop-shadow-md" };
        switch(iconName) {
            case 'IconWallet': return <IconWallet {...iconProps} />;
            case 'IconCoin': return <IconCoin {...iconProps} />;
            case 'IconHeart': return <IconHeart {...iconProps} />;
            case 'IconSearch': return <IconSearch {...iconProps} />;
            case 'IconRefresh': return <IconRefresh {...iconProps} />;
            case 'IconGem': return <IconGem {...iconProps} />;
            case 'IconStar': return <IconRainbowCandy {...iconProps} />;
            default: return <IconGift {...iconProps} />;
        }
    };

    const currentPrizesCoin = GACHA_PRIZES_COIN.map(p => ({
        ...p, icon: getIconComponent(p.iconName)
    }));

    const currentPrizesTheme = (typeof GACHA_PRIZES_THEME !== 'undefined' ? GACHA_PRIZES_THEME : []).map(p => ({
        ...p, icon: getIconComponent(p.iconName)
    }));

    const activePrizes = gachaMode === 'item' ? currentPrizesCoin : currentPrizesTheme;

    const spinGacha = (times) => {
        const poolType = gachaMode === 'item' ? 'coin' : 'theme';
        const vouchers = profile.gacha_vouchers || 0;
        const canUseVoucher = gachaMode === 'item' && vouchers >= times;
        const costType = canUseVoucher ? 'gacha_vouchers' : (gachaMode === 'item' ? 'coins' : 'gems');
        const cost = canUseVoucher ? times : (gachaMode === 'item' ? (times === 1 ? 500 : 4500) : (times === 1 ? 50 : 450));

        if ((profile[costType] || 0) < cost || opening) return;
        setOpening(true); 
        setGachaState('shaking');
        if (AudioEngine) AudioEngine.spin();

        const rawFinalPrize = getPrizeByRarity(poolType);
        const finalPrize = { ...rawFinalPrize, icon: getIconComponent(rawFinalPrize.iconName) };
        
        setTimeout(() => {
            setGachaState('open');
            if (AudioEngine) AudioEngine.uiReward();
            
            setTimeout(() => {
                setOpening(false);
                setGachaState('idle');
                processReward(times, finalPrize, costType, cost, poolType);
            }, 800);
        }, 1500);
    };

    const processReward = (times, firstPrize, costType, cost, poolType) => {
        const updatedProfile = { ...profile, [costType]: (profile[costType] || 0) - cost };

        const getRandomFnWrapped = () => {
            const raw = getPrizeByRarity(poolType);
            return { ...raw, icon: getIconComponent(raw.iconName) };
        };

        if (times === 1) {
            let actualPrize = { ...firstPrize };
            if (!updatedProfile.statistics) updatedProfile.statistics = {};

            if (firstPrize.item === 'hp') {
                if (updatedProfile.hp >= 5) {
                    actualPrize = { ...firstPrize, name: `${firstPrize.val * 100} Koin (Konversi HP)`, item: 'coins', val: firstPrize.val * 100, icon: <IconCoin className="w-full h-full p-1.5 drop-shadow-md"/>, desc: 'HP penuh, dikonversi jadi Koin!' };
                    updatedProfile.coins += actualPrize.val;
                } else {
                    let hpToAdd = firstPrize.val;
                    if (updatedProfile.hp + hpToAdd > 5) {
                        const excess = (updatedProfile.hp + hpToAdd) - 5;
                        hpToAdd = 5 - updatedProfile.hp;
                        updatedProfile.coins += (excess * 100);
                        actualPrize.desc = `Sebagian dikonversi ke Koin (+${excess*100}) karena HP maksimal 5.`;
                    }
                    updatedProfile.hp += hpToAdd;
                }
            }
            else if (firstPrize.item === 'coins') {
                updatedProfile.coins += firstPrize.val;
            }
            else if (firstPrize.item === 'gems') {
                updatedProfile.gems = (updatedProfile.gems || 0) + firstPrize.val;
            }
            else if (firstPrize.item === 'hints') updatedProfile.hints = Math.min(99, (updatedProfile.hints || 0) + firstPrize.val);
            else if (firstPrize.item === 'shuffles') updatedProfile.shuffles = Math.min(99, (updatedProfile.shuffles || 0) + firstPrize.val);
            else if (firstPrize.item === 'rainbow_candy') {
                updatedProfile.rainbow_candy = (updatedProfile.rainbow_candy || 0) + firstPrize.val;
            }
            
            setWonPrize(actualPrize);
            onOpenComplete(updatedProfile, 1); 
        } else {
            let totalKoin = 0;
            let totalGem = 0;
            let totalHP = 0;
            let totalHints = 0;
            let totalShuffles = 0;
            let totalRainbow = 0;
            
            const resultsList = [];
            
            for (let i = 0; i < 10; i++) {
                let p = i === 0 ? firstPrize : getRandomFnWrapped();
                let actualPrize = { ...p };
                
                if (p.item === 'coins') {
                    totalKoin += p.val;
                } else if (p.item === 'gems') {
                    totalGem += p.val;
                } else if (p.item === 'hints') {
                    totalHints += p.val;
                } else if (p.item === 'shuffles') {
                    totalShuffles += p.val;
                } else if (p.item === 'rainbow_candy') {
                    totalRainbow += p.val;
                } else if (p.item === 'hp') {
                    if (updatedProfile.hp + totalHP >= 5) {
                        totalKoin += p.val * 100;
                        actualPrize = { ...p, name: `${p.val * 100} Koin (Konversi HP)`, item: 'coins', val: p.val * 100, icon: <IconCoin className="w-full h-full p-1.5 drop-shadow-md"/>, desc: 'HP penuh, dikonversi jadi Koin!' };
                    } else {
                        let hpToAdd = p.val;
                        if (updatedProfile.hp + totalHP + hpToAdd > 5) {
                            const excess = (updatedProfile.hp + totalHP + hpToAdd) - 5;
                            hpToAdd = 5 - (updatedProfile.hp + totalHP);
                            totalKoin += excess * 100;
                            actualPrize.desc = `Sebagian dikonversi ke Koin (+${excess*100}) karena HP maksimal 5.`;
                        }
                        totalHP += hpToAdd;
                    }
                }
                resultsList.push(actualPrize);
            }

            updatedProfile.coins += totalKoin;
            updatedProfile.gems = (updatedProfile.gems || 0) + totalGem;
            updatedProfile.hp += totalHP;
            updatedProfile.hints = Math.min(99, (updatedProfile.hints || 0) + totalHints);
            updatedProfile.shuffles = Math.min(99, (updatedProfile.shuffles || 0) + totalShuffles);
            updatedProfile.rainbow_candy = (updatedProfile.rainbow_candy || 0) + totalRainbow;

            setWonPrizesList({
                items: resultsList,
                summary: {
                    koin: totalKoin,
                    gem: totalGem,
                    hp: totalHP,
                    hints: totalHints,
                    shuffles: totalShuffles,
                    rainbow: totalRainbow
                }
            });
            onOpenComplete(updatedProfile, 10);
        }
    };

    const cost1x = gachaMode === 'item' ? 500 : 50;
    const cost10x = gachaMode === 'item' ? 4500 : 450;
    const costCurrency = gachaMode === 'item' ? 'coins' : 'gems';
    const canUseVoucher1x = gachaMode === 'item' && (profile.gacha_vouchers || 0) >= 1;
    const canUseVoucher10x = gachaMode === 'item' && (profile.gacha_vouchers || 0) >= 10;

    const gachaThemes = Object.keys(THEMES || {}).filter(k => THEMES[k].type === 'gacha' && THEMES[k].price > 0);

    const exchangeTheme = (themeKey, price) => {
        if ((profile.rainbow_candy || 0) < price) return;
        const updatedProfile = { ...profile, rainbow_candy: profile.rainbow_candy - price };
        updatedProfile.unlockedThemes = [...(updatedProfile.unlockedThemes || []), themeKey];
        updatedProfile.newThemes = [...(updatedProfile.newThemes || []), themeKey];
        onOpenComplete(updatedProfile, 0); // using 0 to just save profile silently
        window.Dialog.showSuccess("Berhasil", `Berhasil menukar Tema ${THEMES[themeKey].name}!`);
    };

    return (
        <div className={`absolute inset-0 z-[100] flex flex-col items-center animate-page-enter ${THEMES[activeTheme]?.background ? 'bg-transparent' : 'theme-bg'}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {THEMES[activeTheme]?.menuBackgrounds?.['gacha'] && (
                <img src={THEMES[activeTheme].menuBackgrounds['gacha']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
            )}
            <div className="absolute inset-0 z-10 w-full h-full flex flex-col items-center custom-scroll overflow-y-auto pb-10">

            <div className="w-full flex items-center justify-between mb-4 mt-2 px-2 sticky top-0 bg-white/50 backdrop-blur-md z-20 py-2 border-b theme-border shadow-sm">
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 shadow-sm transition-colors"><IconChevronLeft /></button>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border theme-border">
                    <button onClick={() => setGachaMode('item')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${gachaMode === 'item' ? 'bg-amber-400 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Item</button>
                    <button onClick={() => setGachaMode('theme')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${gachaMode === 'theme' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Tema</button>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {gachaMode === 'item' ? (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-end gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                                <IconCoin className="w-3 h-3 text-amber-500" /> {formatNumber ? formatNumber(profile.coins) : profile.coins}
                            </div>
                            <div className="flex items-center justify-end gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                                <IconGift className="w-3 h-3 text-sky-500" /> {formatNumber ? formatNumber(profile.gacha_vouchers || 0) : (profile.gacha_vouchers || 0)}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-end gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                                <IconGem className="w-3 h-3 text-pink-500" /> {formatNumber ? formatNumber(profile.gems || 0) : (profile.gems || 0)}
                            </div>
                            <div className="flex items-center justify-end gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                                <IconRainbowCandy className="w-3 h-3 text-fuchsia-500" /> {formatNumber ? formatNumber(profile.rainbow_candy || 0) : (profile.rainbow_candy || 0)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 w-full max-w-[320px] flex flex-col items-center z-10 px-4 mt-4">
                <h1 className="text-3xl font-black theme-text mb-2 tracking-wide">
                    {gachaMode === 'item' ? 'Gacha Hoki' : 'Gacha Tema'}
                </h1>
                <p className="text-gray-600 text-xs font-medium mb-8 text-center bg-white/60 p-2 rounded-xl shadow-sm">
                    {gachaMode === 'item' ? 'Dapatkan hadiah acak seperti Koin, Hint, Gem, atau HP!' : 'Gacha untuk kumpulkan Permen Pelangi dan tukar dengan Tema Eksklusif!'}
                </p>

                <style>{`
                    @keyframes gacha-shake {
                        0%, 100% { transform: rotate(0deg) scale(1.1); }
                        25% { transform: rotate(-8deg) scale(1.1); }
                        50% { transform: rotate(8deg) scale(1.1); }
                        75% { transform: rotate(-8deg) scale(1.1); }
                    }
                    .animate-gacha-shake {
                        animation: gacha-shake 0.3s ease-in-out infinite;
                    }
                    
                    @keyframes gacha-light {
                        0% { transform: scale(0.5); opacity: 0; }
                        50% { transform: scale(1.5); opacity: 1; }
                        100% { transform: scale(2); opacity: 0; }
                    }
                    .animate-gacha-light {
                        animation: gacha-light 0.8s ease-out forwards;
                    }
                `}</style>

                {/* Display Prize */}
                <div className="relative mb-10 w-48 h-48 flex items-center justify-center">
                    {/* Efek cahaya saat open */}
                    {gachaState === 'open' && (
                        <div className="absolute inset-0 bg-yellow-300/60 rounded-full blur-2xl animate-gacha-light z-0 pointer-events-none"></div>
                    )}
                    
                    {/* Gambar Kado */}
                    <img 
                        src={
                            gachaState === 'open' 
                                ? (gachaMode === 'item' ? '/assets/gacha/gachaitem_open.png' : '/assets/gacha/gachatema_open.png')
                                : (gachaMode === 'item' ? '/assets/gacha/gachaitem.png' : '/assets/gacha/gachatema.png')
                        }
                        onError={(e) => {
                            // Fallback jika asset _open belum ada
                            e.target.onerror = null;
                            e.target.src = gachaMode === 'item' ? '/assets/gacha/gachaitem.png' : '/assets/gacha/gachatema.png';
                        }}
                        className={`z-10 w-full h-full object-contain transition-transform duration-300 ${
                            gachaState === 'shaking' ? 'animate-gacha-shake scale-110' : 
                            gachaState === 'open' ? 'scale-125 drop-shadow-2xl' : 'scale-110 drop-shadow-lg'
                        }`}
                        alt="Gacha Box"
                        draggable="false"
                    />
                </div>

                {/* Spin Buttons */}
                <div className="flex gap-3 w-full mb-6">
                    <button 
                        disabled={(profile[costCurrency] || 0) < cost1x && !canUseVoucher1x || opening} 
                        onClick={() => spinGacha(1)}
                        className={`flex-1 ${canUseVoucher1x ? 'bg-sky-400 active:bg-sky-500' : (gachaMode === 'item' ? 'bg-amber-400 active:bg-amber-500' : 'bg-pink-400 active:bg-pink-500')} text-white p-3 rounded-2xl font-bold shadow-sm disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center gap-1 transition-colors`}
                    >
                        <span className="text-sm tracking-wide">PUTAR 1x</span>
                        <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {canUseVoucher1x ? <IconGift className="w-3 h-3"/> : (gachaMode === 'item' ? <IconCoin className="w-3 h-3"/> : <IconGem className="w-3 h-3"/>)} {canUseVoucher1x ? 1 : cost1x}
                        </span>
                    </button>

                    <button 
                        disabled={(profile[costCurrency] || 0) < cost10x && !canUseVoucher10x || opening} 
                        onClick={() => spinGacha(10)}
                        className={`flex-1 ${canUseVoucher10x ? 'bg-blue-500 active:bg-blue-600' : (gachaMode === 'item' ? 'bg-orange-500 active:bg-orange-600' : 'bg-purple-500 active:bg-purple-600')} text-white p-3 rounded-2xl font-bold shadow-sm disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center gap-1 transition-colors`}
                    >
                        <span className="text-sm tracking-wide">PUTAR 10x</span>
                        <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full flex items-center gap-1 text-white">
                            {canUseVoucher10x ? <IconGift className="w-3 h-3"/> : (gachaMode === 'item' ? <IconCoin className="w-3 h-3"/> : <IconGem className="w-3 h-3"/>)} {canUseVoucher10x ? 10 : cost10x}
                        </span>
                    </button>
                </div>
                {gachaMode === 'theme' && (
                    <div className="w-full flex justify-center mt-2 mb-4">
                        <button onClick={() => setShowThemeShop(true)} className="bg-white border theme-border px-6 py-3 rounded-2xl shadow-sm text-fuchsia-600 font-bold flex items-center gap-2 active:bg-pink-50 transition-colors">
                            <IconRainbowCandy className="w-5 h-5"/> Toko Tema
                        </button>
                    </div>
                )}

                

                <button onClick={() => setShowPrizePool(true)} className="px-5 py-2.5 bg-white text-gray-600 rounded-xl text-xs font-bold shadow-sm border theme-border flex items-center justify-center gap-2 active:bg-gray-50 transition-colors mb-6">
                    <IconSearch className="w-4 h-4"/> Lihat Daftar Hadiah
                </button>

                
            </div>

            {/* Modals for Rewards */}
            {wonPrize && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-[110] p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-[300px] text-center shadow-2xl modal-enter relative overflow-hidden border-2 theme-border">
                        <div className={`absolute top-0 inset-x-0 h-4 bg-gradient-to-r ${wonPrize.item === 'rainbow_candy' ? 'from-pink-400 to-purple-500' : 'from-yellow-400 to-amber-500'}`}></div>
                        <p className="text-gray-500 font-bold text-[10px] mb-3 uppercase tracking-widest mt-2">Selamat!</p>
                        <div className={`mx-auto w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl shadow-inner ${wonPrize.item === 'gems' || wonPrize.item === 'rainbow_candy' ? 'bg-pink-50 text-pink-500' : 'bg-amber-50 text-amber-500'}`}>
                            {wonPrize.icon}
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 mb-2 leading-tight">{wonPrize.name}</h3>
                        <p className="text-xs font-medium text-gray-500 mb-8">{wonPrize.desc}</p>
                        <button onClick={() => setWonPrize(null)} className="btn-modern bg-gray-900 text-white py-3.5 w-full text-sm font-bold shadow-md rounded-xl">Klaim</button>
                    </div>
                </div>
            )}

            {wonPrizesList && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-[110] p-4">
                    <div className="bg-white p-6 rounded-3xl w-full max-w-[340px] shadow-2xl modal-enter relative overflow-hidden border-2 theme-border max-h-[85vh] flex flex-col">
                        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 shrink-0"></div>
                        <div className="shrink-0 text-center">
                            <h3 className="text-xl font-black text-gray-800 mb-1 mt-2">Hasil Buka 10x</h3>
                            <p className="text-[11px] font-medium text-gray-500 mb-4">Wow! Lihat apa saja yang kamu dapatkan.</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scroll pr-2 mb-4 space-y-2">
                            {wonPrizesList.items.map((prize, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100 shadow-sm animate-fade-in-up" style={{animationDelay: `${idx * 50}ms`}}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${prize.item === 'gems' || prize.item === 'rainbow_candy' ? 'bg-pink-100 text-pink-500 border border-pink-200' : 'bg-amber-100 text-amber-500 border border-amber-200'}`}>
                                        {prize.icon}
                                    </div>
                                    <div className="flex flex-col flex-1 text-left overflow-hidden">
                                        <span className="font-bold text-sm text-gray-800 truncate leading-tight">{prize.name}</span>
                                        <span className="text-[9px] text-gray-500 font-medium truncate">{prize.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="shrink-0">
                            <div className="h-px bg-gray-200 w-full mb-3"></div>
                            <div className="flex justify-center gap-3 mb-4">
                                {wonPrizesList.summary.koin > 0 && <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><IconCoin className="w-3 h-3"/> {formatNumber ? formatNumber(wonPrizesList.summary.koin) : wonPrizesList.summary.koin}</span>}
                                {wonPrizesList.summary.gem > 0 && <span className="text-[10px] font-bold text-pink-600 flex items-center gap-1"><IconGem className="w-3 h-3"/> {formatNumber ? formatNumber(wonPrizesList.summary.gem) : wonPrizesList.summary.gem}</span>}
                                {wonPrizesList.summary.rainbow > 0 && <span className="text-[10px] font-bold text-fuchsia-600 flex items-center gap-1"><IconRainbowCandy className="w-3 h-3"/> {formatNumber ? formatNumber(wonPrizesList.summary.rainbow) : wonPrizesList.summary.rainbow}</span>}
                            </div>
                            <button onClick={() => setWonPrizesList(null)} className="btn-modern bg-gray-900 text-white py-3 w-full text-sm font-bold shadow-md rounded-xl active:scale-95 transition-transform">Klaim</button>
                        </div>
                    </div>
                </div>
            )}

            {showThemeShop && (
                <div className="absolute inset-0 bg-gray-50 z-[120] flex flex-col custom-scroll overflow-y-auto modal-enter">
                    <div className="w-full flex items-center justify-between mb-4 mt-2 px-2 sticky top-0 bg-white/50 backdrop-blur-md z-20 py-2 border-b theme-border shadow-sm">
                        <button onClick={() => setShowThemeShop(false)} className="p-2 bg-white rounded-full text-gray-500 shadow-sm transition-colors"><IconChevronLeft /></button>
                        <div className="flex bg-white rounded-xl px-4 py-1.5 shadow-sm border theme-border">
                            <h2 className="text-sm font-black theme-text">Toko Tema</h2>
                        </div>
                        <div className="flex items-center gap-1.5 text-pink-500 font-black text-sm bg-pink-50 px-3 py-1 rounded-xl shadow-sm border border-pink-100">
                            <IconRainbowCandy className="w-4 h-4"/> {formatNumber ? formatNumber(profile.rainbow_candy || 0) : (profile.rainbow_candy || 0)}
                        </div>
                    </div>
                    <div className="px-2 grid grid-cols-2 gap-3 pb-8 content-start">
                        {gachaThemes.map(key => {
                            const t = THEMES[key];
                            if (!t) return null;
                            const isUnlocked = (profile.unlockedThemes || []).includes(key);
                            const price = t.price || 100;
                            const canAfford = (profile.rainbow_candy || 0) >= price;
                            const trialValid = profile.themeTrials && profile.themeTrials[key] && (Date.now() - profile.themeTrials[key] < 7 * 24 * 60 * 60 * 1000);
                            const canTrial = !isUnlocked && !trialValid;
                            return (
<div key={key} className="bg-white rounded-2xl shadow-sm border theme-border relative overflow-hidden flex flex-col aspect-[4/5] p-3 justify-between">
                                    {/* Badge at top right */}
                                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[8px] font-black tracking-wider uppercase shadow-sm border border-amber-200 z-10">
                                        {t.rarity || 'Eksklusif'}
                                    </div>
                                    
                                    <div className="flex flex-col items-center flex-1 justify-center gap-2 mt-4 relative z-0">
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm" style={{ backgroundColor: t.preview ? 'transparent' : t.colors.bg }}>
                                            {t.preview ? (
                                                <img src={t.preview} alt={t.name} className="w-14 h-14 object-cover rounded-2xl" draggable="false" />
                                            ) : t.data[0] && (t.data[0].startsWith('http') || t.data[0].startsWith('/') || t.data[0].includes('.png')) ? (
                                                <img src={t.data[0]} alt="theme icon" className="w-10 h-10 object-contain" draggable="false" />
                                            ) : (
                                                <span style={{color: t.colors.text}}>{t.data[0]}</span>
                                            )}
                                        </div>
                                        
                                        <span className="font-bold text-gray-800 text-xs text-center leading-tight line-clamp-2">{t.name}</span>
                                    </div>
                                    
                                    <div className="w-full flex flex-col gap-1.5 mt-2 z-10">
                                        {!isUnlocked && (
                                            <button 
                                                disabled={!canTrial}
                                                onClick={() => onActivateTrial && onActivateTrial(key)}
                                                className={`w-full py-2 rounded-xl text-[10px] font-bold shadow-sm transition-transform flex items-center justify-center ${canTrial ? 'bg-amber-400 text-white active:scale-95' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                Coba
                                            </button>
                                        )}
                                        {isUnlocked ? (
                                            <div className="w-full py-2 rounded-xl text-[10px] font-bold shadow-sm flex items-center justify-center bg-gray-100 text-gray-500">Dimiliki</div>
                                        ) : (
                                            <button 
                                                disabled={isUnlocked || !canAfford}
                                                onClick={() => exchangeTheme(key, price)}
                                                className={`w-full py-2 rounded-xl text-[10px] font-bold shadow-sm transition-transform flex items-center justify-center gap-1 ${canAfford ? 'bg-pink-500 text-white active:scale-95 relative' : 'bg-gray-100 text-gray-400'}`}
                                            >
                                                {canAfford && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                                <IconRainbowCandy className="w-3.5 h-3.5"/> {price}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showPrizePool && (
                <div className="absolute inset-0 bg-gray-50 z-[120] flex flex-col custom-scroll overflow-y-auto modal-enter">
                    <div className="w-full flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
                        <button onClick={() => setShowPrizePool(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"><IconChevronLeft /></button>
                        <h2 className="text-lg font-black theme-text">Daftar Hadiah</h2>
                        <div className="w-10"></div>
                    </div>
                    <div className="p-4 flex flex-col gap-3 pb-8">
                        <div className={`text-xs font-bold p-3 rounded-xl mb-2 text-center flex items-center justify-center gap-2 shadow-sm ${gachaMode === 'item' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-pink-100 text-pink-700 border border-pink-200'}`}>
                            <IconGift className="w-4 h-4"/> {gachaMode === 'item' ? 'Hadiah dari Gacha Item' : 'Hadiah dari Gacha Tema'}
                        </div>
                        {activePrizes.map((p, idx) => (
                            <div key={idx} className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-inner ${p.item === 'gems' || p.item === 'rainbow_candy' ? 'bg-pink-50 text-pink-600 border border-pink-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                        {p.icon}
                                    </div>
                                    <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium pl-[52px]">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
                    </div>
        </div>
    );};

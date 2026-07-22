// ===================== SHOP =====================
const Shop = ({ profile, activeTheme, onThemeSelect, onBuy, onClose, onSell }) => {
    
    const [modalData, setModalData] = useState(null);
    const [qty, setQty] = useState(1);
    const [actionType, setActionType] = useState('buy'); // 'buy', 'sell_hint', 'sell_shuffle', 'exchange_nyawa', 'buy_coin'
    const [customAmount, setCustomAmount] = useState('');
    
    const holdTimeout = useRef(null);
    const holdInterval = useRef(null);

    const getMaxQty = (type, modalItem) => {
        if (type === 'sell_hint') return profile.hints || 0;
        if (type === 'sell_shuffle') return profile.shuffles || 0;
        if (type === 'exchange_nyawa') return profile.hp || 0;
        if (type === 'buy') {
            if (!modalItem) return 1;
            if (modalItem.currency === 'coins') return Math.max(1, Math.floor((profile.coins || 0) / modalItem.price));
            if (modalItem.currency === 'gems') return Math.max(1, Math.floor((profile.gems || 0) / modalItem.price));
            
        }
        return 99; // Fallback
    };

    const startHold = (direction, maxQty) => {
        if (maxQty < 1) maxQty = 1;
        const update = (currentQty) => {
            let next = currentQty + direction;
            if (next < 1) return maxQty;
            if (next > maxQty) return 1;
            return next;
        };
        
        setQty(prev => update(prev));
        
        holdTimeout.current = setTimeout(() => {
            holdInterval.current = setInterval(() => {
                setQty(prev => update(prev));
            }, 100);
        }, 500);
    };

    const stopHold = () => {
        clearTimeout(holdTimeout.current);
        clearInterval(holdInterval.current);
    };

    // Clean up on unmount just in case
    useEffect(() => {
        return () => stopHold();
    }, []);


    // Separate themes
    const themesStandar = Object.keys(THEMES).filter(k => THEMES[k].type === 'standar');
    const themesPremium = Object.keys(THEMES).filter(k => THEMES[k].type === 'premium');

    const openBuyModal = (item) => {
        setModalData(item);
        setQty(1);
        setActionType('buy');
    };

    const openSellModal = (type) => {
        setModalData({ type });
        setQty(1);
        setCustomAmount('');
        setActionType(type);
        };

    const handleConfirm = () => {
        if (!modalData) return;
        if (actionType === 'buy') {
            onBuy(modalData, qty);
        } else {
            onSell(actionType, qty);
        }
        setModalData(null);
    };

    const renderThemeItem = (key) => {
        const t = THEMES[key]; 
        const isUnlocked = profile.unlockedThemes.includes(key); 
        const isUsed = activeTheme === key;
        const isCustom = key === 'custom';
        const isPremium = t.type === 'premium';
        
        return (
            <div key={key} className={`flex flex-col bg-white p-4 rounded-2xl shadow-sm border-2 transition-all ${isUsed ? 'theme-border' : 'border-transparent'}`}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative shrink-0" style={{ backgroundColor: t.preview ? 'transparent' : t.colors.bg }}>
                            {t.preview ? (
                                <img src={t.preview} alt={t.name} className="w-12 h-12 object-cover rounded-xl shadow-sm" draggable="false" />
                            ) : t.data[0] && (t.data[0].startsWith('http') || t.data[0].startsWith('/') || t.data[0].includes('.png')) ? (
                                <img src={t.data[0]} alt="theme icon" className="w-8 h-8 object-contain" draggable="false" />
                            ) : (
                                <span style={{color: t.colors.text}}>{t.data[0]}</span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold theme-text">{t.name}</span>
                            {isPremium && <span className="bg-gradient-to-tr from-yellow-400 to-amber-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm w-fit mt-1">{THEME_BADGE_TEXT}</span>}
                        </div>
                    </div>
                    {isUnlocked ? (
                        <div className="flex gap-1 items-center">
                            
                            {isUsed ? (
                                <span className="text-xs font-bold flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-500">Dipakai</span>
                            ) : (
                                <button onClick={() => onThemeSelect(key)} className="text-xs font-bold flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500 text-white shadow-sm active:scale-95 transition-transform">Pakai</button>
                            )}

                        </div>
                    ) : (
                        <button onClick={() => { setModalData({ id: key, name: `Tema ${t.name}`, price: t.price, type: 'tema', currency: t.currency || 'coins', themeData: t }); setActionType('buy'); setQty(1); }} className="btn-modern px-3 py-2 text-xs font-bold rounded-lg flex gap-1 items-center" style={{ backgroundColor: t.colors.bg, color: t.colors.text }}>
                            {<IconCoin className="w-3 h-3" />} {formatNumber(t.price)}
                        </button>
                    )}
                </div>
            </div>
        );
    };
    
    return (
        <div className={`absolute inset-0 z-[100] flex flex-col items-center ${THEMES[activeTheme]?.background ? 'bg-transparent' : 'theme-bg'}`}>
            {THEMES[activeTheme]?.menuBackgrounds?.['shop'] && (
                <img src={THEMES[activeTheme].menuBackgrounds['shop']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
            )}
            <div className="absolute inset-0 z-10 w-full h-full flex flex-col items-center custom-scroll overflow-y-auto pb-10">

            <div className="w-full flex items-center justify-between mb-4 mt-2 px-2 sticky top-0 bg-white/50 backdrop-blur-md z-20 py-2 border-b theme-border shadow-sm">
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 shadow-sm transition-colors"><IconChevronLeft /></button>
                <div className="flex bg-white rounded-xl px-4 py-1.5 shadow-sm border theme-border">
                    <h2 className="text-sm font-black theme-text">Tempat Jajan</h2>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                        <IconCoin className="w-3 h-3 text-amber-500" /> {formatNumber(profile.coins)}
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                        <IconGem className="w-3 h-3 text-pink-500" /> {formatNumber(profile.gems || 0)}
                    </div>
                </div>
            </div>
            
            <div className="w-full max-w-[320px] flex flex-col gap-3 relative z-10">
                    <div className="bg-orange-50 border border-orange-200 p-3 rounded-2xl shadow-sm mb-2">
                        <h3 className="font-bold text-orange-600 text-sm mb-2 text-center">Pasar Tukar</h3>
                        <div className="flex flex-col gap-2">
                                
                                <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <IconSearch className="w-4 h-4 text-sky-500" />
                                        <span className="text-xs font-bold text-gray-700">Jual Hint</span>
                                    </div>
                                    <button onClick={() => openSellModal('sell_hint')} className="bg-orange-100 text-orange-600 px-3 py-1 text-[10px] font-bold rounded-lg">Jual</button>
                                </div>
                                <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <IconRefresh className="w-4 h-4 text-orange-500" />
                                        <span className="text-xs font-bold text-gray-700">Jual Shuffle</span>
                                    </div>
                                    <button onClick={() => openSellModal('sell_shuffle')} className="bg-orange-100 text-orange-600 px-3 py-1 text-[10px] font-bold rounded-lg">Jual</button>
                                </div>
                                
                            </div>
                        </div>
                        {SHOP_ITEMS.map((it, idx) => {
                            if (it.type === 'flex' && profile.flexCrown) return null;
                            const getIcon = (iconName) => {
                                switch (iconName) {
                                    case 'IconCoin': return IconCoin;
                                    case 'IconGem': return IconGem;
                                    case 'IconHeart': return IconHeart;
                                    case 'IconSearch': return IconSearch;
                                    case 'IconRefresh': return IconRefresh;
                                    case 'IconCrown': return IconCrown;
                                    default: return null;
                                }
                            };
                            const IconComp = getIcon(it.iconName);
                            return (
                                <div key={idx} className={`flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 ${it.type==='flex'?'border-yellow-300 bg-yellow-50':''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 theme-bg rounded-xl flex items-center justify-center text-xl shrink-0">
                                            {IconComp ? <IconComp className={`w-5 h-5 ${it.iconColor || ''}`} /> : null}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold theme-text flex items-center gap-1">{it.name}</span>
                                            <span className="text-[10px] font-medium text-gray-400 mt-1 max-w-[140px] leading-tight">{it.desc || 'Otomatis dipakai.'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => openBuyModal(it)} className="btn-modern theme-bg theme-text px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1.5">
                                        {it.currency === 'gems' ? <IconGem className="w-3 h-3" /> : <IconCoin className="w-3 h-3" />} {formatNumber(it.price)}
                                    </button>
                                </div>
                            )
                        })}

                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl shadow-sm mb-2 mt-2">
                            <h3 className="font-bold text-amber-600 text-sm mb-2 text-center">Tema Standar</h3>
                            <div className="flex flex-col gap-2">
                                {themesStandar.map(key => renderThemeItem(key))}
                            </div>
                        </div>
            </div>
            
            <CustomModal 
                isOpen={!!modalData} 
                title={actionType === 'buy' ? (modalData?.type === 'tema' ? 'Beli Tema' : 'Beli Item') : ''} 
                hideHeader={actionType !== 'buy'}
                hideFooter={actionType !== 'buy'}
                maxWidthClass="w-[90vw] max-w-[320px]"
                content={
                    <div className={`flex flex-col items-center w-full ${actionType !== 'buy' ? 'gap-0' : 'gap-4'}`}>
                        {actionType === 'buy' && modalData?.type !== 'tema' && (
                            <>
                                <span className="text-gray-600 font-medium text-center">Berapa banyak <span className="font-bold text-gray-800">{modalData?.name}</span> yang ingin dibeli?</span>
                                <div className="flex items-center gap-4">
                                    <button onPointerDown={() => startHold(-1, getMaxQty(actionType, modalData))} onPointerUp={stopHold} onPointerLeave={stopHold} className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full font-bold text-lg">-</button>
                                    <span className="font-black text-xl w-8 text-center">{qty}</span>
                                    <button onPointerDown={() => startHold(1, getMaxQty(actionType, modalData))} onPointerUp={stopHold} onPointerLeave={stopHold} className="bg-gray-200 text-gray-600 w-8 h-8 rounded-full font-bold text-lg">+</button>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs text-gray-500">Total Harga:</span>
                                    <span className="font-black text-2xl flex items-center gap-1.5 text-rose-500 mt-1">
                                        {modalData?.currency === 'gems' ? <IconGem className="w-6 h-6"/> : <IconCoin className="w-6 h-6"/>}
                                        {formatNumber((modalData?.price || 0) * qty)}
                                    </span>
                                </div>
                            </>
                        )}
                        {actionType === 'buy' && modalData?.type === 'tema' && (
                            <>
                                <span className="text-gray-600 font-medium text-center">Beli tema <span className="font-bold text-gray-800">{modalData?.name}</span>?</span>
                                {modalData?.themeData?.type === 'premium' && (
                                    <div className="w-full flex flex-col items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <span className="text-xs font-bold text-gray-500 mb-2">Pilih Warna Latar:</span>
                                        <div className="flex gap-2 flex-wrap justify-center mb-3">
                                            {modalData.themeData.backgroundOptions.map((opt, i) => (
                                                <button key={i} onClick={() => setModalData({...modalData, selectedBgIndex: i})} className={`w-8 h-8 rounded-full border-2 transition-all ${modalData.selectedBgIndex === i || (modalData.selectedBgIndex === undefined && i===0) ? 'scale-110 shadow-md ring-2 ring-pink-400' : 'border-gray-200'}`} style={{ backgroundColor: opt.bg, borderColor: opt.border }}></button>
                                            ))}
                                        </div>
                                        <div className="w-full h-32 rounded-lg border-2 relative overflow-hidden flex flex-col p-2" style={{ backgroundColor: modalData.themeData.backgroundOptions[modalData.selectedBgIndex || 0].bg, borderColor: modalData.themeData.backgroundOptions[modalData.selectedBgIndex || 0].border }}>
                                            <div className="text-[10px] font-bold mb-1 opacity-50" style={{ color: modalData.themeData.backgroundOptions[modalData.selectedBgIndex || 0].text }}>PREVIEW</div>
                                            <div className="flex-1 grid grid-cols-4 gap-1">
                                                {[0,1,2,3,4,5,6,7].map(i => (
                                                    <div key={i} className="rounded-md flex items-center justify-center border bg-white/50" style={{ borderColor: modalData.themeData.backgroundOptions[modalData.selectedBgIndex || 0].border }}>
                                                        {modalData.themeData.data[i%4] && modalData.themeData.data[i%4].startsWith('http') || modalData.themeData.data[i%4]?.startsWith('/') ? <img src={modalData.themeData.data[i%4]} className="w-4 h-4 object-contain" /> : <span className="text-xs">{modalData.themeData.data[i%4]}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <span className="font-black text-2xl flex items-center gap-1.5 text-rose-500 mt-1">
                                    {modalData?.currency === 'gems' ? <IconGem className="w-6 h-6"/> : <IconCoin className="w-6 h-6"/>}
                                    {formatNumber(modalData?.price || 0)}
                                </span>
                            </>
                        )}
                        {(actionType === 'sell_hint' || actionType === 'sell_shuffle') && (
                            <div className="flex flex-col items-center w-full px-2">
                                <div className="flex justify-between items-center w-full mb-6">
                                    <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Jual {actionType === 'sell_hint' ? 'Hint' : 'Shuffle'}</span>
                                    <span className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                                        {actionType === 'sell_hint' ? <IconSearch className="w-4 h-4 text-cyan-500" /> : <IconRefresh className="w-4 h-4 text-purple-500" />} {actionType === 'sell_hint' ? profile.hints || 0 : profile.shuffles || 0}
                                    </span>
                                </div>
                                
                                <div className="flex gap-4 w-full mb-4 items-center">
                                    <div className="flex-1 bg-emerald-50 rounded-2xl py-4 border border-emerald-100 flex flex-col justify-center items-center gap-2 shadow-sm">
                                        <IconCoin className="w-8 h-8 text-emerald-500"/>
                                        <span className="text-2xl font-black text-emerald-600 leading-none">+{formatNumber(Math.floor((50 * qty) * 0.9))}</span>
                                    </div>
                                    <div className="flex flex-col gap-2 items-center">
                                        <button onPointerDown={() => startHold(1, getMaxQty(actionType, modalData))} onPointerUp={stopHold} onPointerLeave={stopHold} className="bg-gray-100 text-gray-600 w-12 h-12 rounded-xl font-bold text-xl active:bg-gray-200 transition-colors shadow-sm">+</button>
                                        <span className="font-black text-2xl w-12 text-center text-gray-800">{qty}</span>
                                        <button onPointerDown={() => startHold(-1, getMaxQty(actionType, modalData))} onPointerUp={stopHold} onPointerLeave={stopHold} className="bg-gray-100 text-gray-600 w-12 h-12 rounded-xl font-bold text-xl active:bg-gray-200 transition-colors shadow-sm">-</button>
                                    </div>
                                </div>

                                <span className="text-[10px] text-red-400 font-bold mb-6 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">Dipotong pajak 10%</span>

                                <div className="flex gap-3 w-full">
                                    <button onClick={() => setModalData(null)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl shadow-sm active:bg-gray-200 transition-colors text-base">Batal</button>
                                    <button onClick={handleConfirm} className="flex-1 bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-md active:bg-emerald-600 transition-colors text-base">Jual</button>
                                </div>
                            </div>
                        )}
                        
                    </div>
                } 
                confirmText={actionType === 'buy' ? 'Beli' : 'Konfirmasi'} 
                cancelText="Batal" 
                onConfirm={handleConfirm} 
                onCancel={() => setModalData(null)} 
            />
                    </div>
        </div>
    );};

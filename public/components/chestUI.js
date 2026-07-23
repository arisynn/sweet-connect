

const DynamicSpeedUpButton = ({ chest, onConfirm }) => {
    const [cost, setCost] = useState(0);

    useEffect(() => {
        if (!chest) return;
        const tick = () => {
            if (window.calculateDynamicSpeedUpCost) {
                setCost(window.calculateDynamicSpeedUpCost(chest.type, chest.startTime));
            }
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [chest]);

    if (!chest) return null;
    
    if (cost === 0) {
        return (
            <button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2">
                Buka
            </button>
        );
    }

    return (
        <button onClick={onConfirm} className="flex-1 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2">
            <IconGem className="w-5 h-5" /> {cost}
        </button>
    );
};

const ChestSlot = ({ chest, onOpen, index, onSpeedUp, activeTheme }) => {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!chest) return;
        const config = CHEST_TYPES[chest.type];
        
        const tick = () => {
            const passed = Date.now() - chest.startTime;
            const remaining = Math.max(0, config.durationMs - passed);
            setTimeLeft(remaining);
        };
        
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [chest]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}j ${m}m`;
        return `${m}m ${s}s`;
    };

    if (!chest) {
        return (
            <div className="flex-1 bg-gray-100 rounded-[1rem] h-24 flex flex-col items-center justify-center border border-dashed border-gray-300">
                <span className="text-gray-400 text-[10px] font-bold">Slot Kosong</span>
            </div>
        );
    }

    const config = CHEST_TYPES[chest.type];
    const isReady = timeLeft === 0;

    return (
        <div 
            className={`flex-1 rounded-[1rem] h-24 flex flex-col items-center justify-center relative border shadow-sm transition-transform ${isReady ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200 cursor-pointer active:scale-95' : 'bg-white border-gray-100 cursor-pointer active:scale-95'}`}
            onClick={() => isReady ? onOpen(chest) : (onSpeedUp && onSpeedUp(index))}
        >
            <img src={config.imgClose} alt={config.name} className="w-12 h-12 object-contain mb-1" />
            {isReady ? (
                <span className="text-orange-500 font-black text-[10px] bg-orange-100 px-2 py-0.5 rounded-full animate-pulse border border-orange-200 shadow-sm">BUKA</span>
            ) : (
                <div className="flex flex-col items-center gap-1">
                    <span className="text-gray-500 font-bold text-[9px] leading-none">{formatTime(timeLeft)}</span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onSpeedUp) onSpeedUp(index);
                        }}
                        className="bg-pink-100 hover:bg-pink-200 text-pink-600 border border-pink-200 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1 transition-colors"
                    >
                        <IconGem className="w-3 h-3" /> {window.calculateDynamicSpeedUpCost ? window.calculateDynamicSpeedUpCost(chest.type, chest.startTime) : config.speedUpCost}
                    </button>
                </div>
            )}
        </div>
    );
};

const ChestProgress = ({ progress }) => {
    const targetPercentage = Math.min(100, Math.floor((progress / 5) * 100));
    const [percentage, setPercentage] = useState(targetPercentage);

    useEffect(() => {
        if (percentage === targetPercentage) return;
        
        let startTimestamp = null;
        const duration = 500;
        const startValue = percentage;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // easeOutQuad
            const easeOut = progress * (2 - progress);
            
            setPercentage(Math.floor(startValue + (targetPercentage - startValue) * easeOut));
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setPercentage(targetPercentage);
            }
        };
        
        window.requestAnimationFrame(step);
    }, [targetPercentage]);

    return (
        <div className="w-full flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden relative shadow-inner">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${targetPercentage}%` }} />
                </div>
                <span className="text-[10px] font-black text-gray-500 w-8 text-right">{percentage}%</span>
            </div>
            {progress >= 5 && (
                <p className="text-[9px] text-rose-500 font-bold text-center mt-0.5">Semua slot penuh! Progress terhenti.</p>
            )}
        </div>
    );
};

const ChestRewardPopup = ({ rewards, onClose }) => {
    if (!rewards) return null;
    
    const chestType = rewards.chestType || 'common';
    
    const styleMap = {
        epic: { 
            border: 'border-fuchsia-400', 
            badge: 'from-fuchsia-400 to-purple-500 border-fuchsia-300', 
            btn: 'from-fuchsia-500 to-purple-600',
            glow: 'shadow-[0_0_15px_rgba(217,70,239,0.3)]',
            title: 'PETI EPIK'
        },
        rare: { 
            border: 'border-blue-400', 
            badge: 'from-blue-400 to-indigo-500 border-blue-300', 
            btn: 'from-blue-500 to-indigo-600',
            glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
            title: 'PETI LANGKA'
        },
        common: { 
            border: 'border-yellow-400', 
            badge: 'from-yellow-400 to-amber-500 border-yellow-300', 
            btn: 'from-amber-400 to-orange-500',
            glow: 'shadow-[0_0_15px_rgba(250,204,21,0.3)]',
            title: 'PETI BIASA'
        }
    };
    
    const style = styleMap[chestType];
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 modal-enter">
            <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-2 ${style.border} ${style.glow} scale-in-center`}>
                <div className="bg-gray-900 p-4 shrink-0 flex items-center justify-between relative">
                    <h2 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${style.badge} uppercase tracking-wider mx-auto`}>{style.title}</h2>
                    <button onClick={onClose} className="absolute right-4 text-gray-400 hover:text-white p-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 flex flex-col gap-4 bg-gray-50 items-center">
                    <div className="flex flex-col gap-2 w-full">
                        {rewards.coins && (
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-center justify-center gap-2 shadow-sm">
                                <IconCoin className="w-6 h-6 text-amber-500" />
                                <span className="font-black text-amber-700 text-base">Koin x{rewards.coins}</span>
                            </div>
                        )}
                        {rewards.hints && (
                            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-center justify-center gap-2 shadow-sm">
                                <IconSearch className="w-6 h-6 text-sky-500" />
                                <span className="font-black text-sky-700 text-base">Hint x{rewards.hints}</span>
                            </div>
                        )}
                        {rewards.gacha_vouchers && (
                            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex items-center justify-center gap-2 shadow-sm">
                                <IconRainbowCandy className="w-6 h-6 text-purple-500" />
                                <span className="font-black text-purple-700 text-base">Voucher Gacha x{rewards.gacha_vouchers}</span>
                            </div>
                        )}
                        {rewards.gems && (
                            <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 flex items-center justify-center gap-2 shadow-sm">
                                <IconGem className="w-6 h-6 text-pink-500" />
                                <span className="font-black text-pink-700 text-base">Gem x{rewards.gems}</span>
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className={`mt-2 w-full bg-gradient-to-r ${style.btn} text-white font-black py-3 rounded-xl shadow-md active:scale-95 transition-transform text-base`}>KLAIM HADIAH</button>
                </div>
            </div>
        </div>
    );
};

const ChestSection = ({ profile, setProfile, saveProfile, playerName, setSweetMessage, activeTheme }) => {
    const p = initChestProfile(profile);
    const slots = p.chestSlots;
    const progress = p.chestProgress;

    const [animatingSlot, setAnimatingSlot] = useState(null);
    const [chestAnimState, setChestAnimState] = useState(null);
    const [rewardData, setRewardData] = useState(null);
    const [rewardPopup, setRewardPopup] = useState(null);
    const [showInfo, setShowInfo] = useState(false);
    const [confirmSpeedUp, setConfirmSpeedUp] = useState(null);
    
    const handleSpeedUp = (index) => {
        setConfirmSpeedUp(index);
    };

    const confirmSpeedUpAction = () => {
        if (confirmSpeedUp === null) return;
        
        const { profile: newP, success } = speedUpChestAction(profile, confirmSpeedUp);
        if (success) {
            setProfile(newP);
            if (playerName) saveProfile(playerName, newP);
            AudioEngine && AudioEngine.play && AudioEngine.play('buy');
        } else {
            if (setSweetMessage) setSweetMessage("Gem tidak cukup!");
        }
        setConfirmSpeedUp(null);
    };


    const handleOpen = (chest, index) => {
        if (animatingSlot !== null) return;
        setAnimatingSlot(index);
        setChestAnimState('shaking');
        AudioEngine && AudioEngine.play && AudioEngine.play('chestOpen'); // Example
        
        setTimeout(() => {
            setChestAnimState('opening');
            // AudioEngine && AudioEngine.play && AudioEngine.play('chestReveal');
            setTimeout(() => {
                let { profile: newP, rewards } = openChestAction(profile, index);
                if (rewards) {
                    if (typeof updateStatistics === 'function') {
                        newP = updateStatistics(newP, { chestOpenedDelta: 1 });
                    }
                    // Update chest weekly missions
                    if (typeof updateMissions === 'function') {
                        newP = updateMissions(newP, 'openChest', 1);
                    }
                    
                    setRewardData({ newP, rewards });
                    setRewardPopup(rewards);
                }
                setAnimatingSlot(null);
                setChestAnimState(null);
            }, 600);
        }, 1000); // 1.0s shaking animation duration
    };

    const handleClaim = () => {
        if (rewardData) {
            setProfile(rewardData.newP);
            if (playerName) saveProfile(playerName, rewardData.newP);
        }
        setRewardPopup(null);
        setRewardData(null);
    };

    return (
        <div className="w-full bg-white border border-gray-100 rounded-[1.25rem] p-4 shadow-sm flex flex-col gap-3 relative">
            <div className="flex justify-between items-center mb-1">
                <span className="font-black theme-text text-sm uppercase tracking-wider">Peti</span>
                <button onClick={() => setShowInfo(true)} className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs hover:bg-gray-200 transition-colors">?</button>
            </div>
            
            <div className="flex gap-2 w-full relative">
                {slots.map((chest, i) => (
                    <div key={i} className="flex-1 relative">
                        {animatingSlot === i && chest ? (
                            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                                {chestAnimState === 'shaking' ? (
                                    <img src={CHEST_TYPES[chest.type].imgClose} className="w-16 h-16 animate-chest-shake drop-shadow-xl" />
                                ) : (
                                    <div className="relative flex items-center justify-center scale-in-center">
                                        <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-60 animate-pulse"></div>
                                        <img src={CHEST_TYPES[chest.type].imgOpen} className="w-20 h-20 drop-shadow-2xl relative z-10" />
                                    </div>
                                )}
                            </div>
                        ) : null}
                        <div className={animatingSlot === i ? 'opacity-0' : ''}>
                            <ChestSlot chest={chest} index={i} onOpen={(c) => handleOpen(c, i)} onSpeedUp={handleSpeedUp} activeTheme={activeTheme} />
                        </div>
                    </div>
                ))}
            </div>
            
            <ChestProgress progress={progress} />
            {confirmSpeedUp !== null && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 modal-enter">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative scale-in-center">
                        <div className="bg-gray-900 p-4 shrink-0 flex items-center justify-between relative z-10">
                            <h2 className="text-xl font-black text-white uppercase tracking-wider mx-auto">Percepat Peti</h2>
                            <button onClick={() => setConfirmSpeedUp(null)} className="absolute right-4 text-gray-400 hover:text-white p-1">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-4 bg-gray-50 items-center text-center relative z-10">
                            {THEMES[activeTheme]?.menuBackgrounds?.['chest'] && (
                                <img src={THEMES[activeTheme].menuBackgrounds['chest']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-20" alt=""/>
                            )}
                            <div className="relative z-10 w-full">
                                <p className="text-sm font-medium text-gray-600 mb-6">Gunakan Gem untuk langsung membuka peti ini?</p>
                                
                                <div className="flex gap-3">
                                    <button onClick={() => setConfirmSpeedUp(null)} className="flex-1 bg-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors">Batal</button>
                                    <DynamicSpeedUpButton chest={slots[confirmSpeedUp]} onConfirm={confirmSpeedUpAction} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showInfo && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 modal-enter"
                    onClick={() => setShowInfo(false)}
                >
                    <div 
                        className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col relative scale-in-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {THEMES[activeTheme]?.menuBackgrounds?.['chest'] && (
                            <img src={THEMES[activeTheme].menuBackgrounds['chest']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
                        )}
                        <div className="bg-gray-900 p-4 shrink-0 flex items-center justify-between relative z-10">
                            <h2 className="text-xl font-black text-white uppercase tracking-wider mx-auto">Informasi Peti</h2>
                            <button onClick={() => setShowInfo(false)} className="absolute right-4 text-gray-400 hover:text-white p-1">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5 flex flex-col gap-4 bg-gray-50 overflow-y-auto max-h-[70vh] text-sm text-gray-700 font-medium">
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Cara Mendapatkan Progress (Max 5 per peti)</h4>
                                <ul className="list-disc pl-5 flex flex-col gap-1 text-gray-600 text-xs">
                                    <li>Selesai Level (Dasar) <strong className="text-gray-800">(+2)</strong></li>
                                    <li>Selesai tanpa Bantuan (Flawless) <strong className="text-gray-800">(+1)</strong></li>
                                    <li>Combo x8 / x15+ <strong className="text-gray-800">(+1 / +2)</strong></li>
                                    <li>Selesai cepat &lt; 45 Detik <strong className="text-gray-800">(+1)</strong></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Cara Mendapatkan Peti</h4>
                                <ul className="list-disc pl-5 flex flex-col gap-1 text-gray-600 text-xs">
                                    <li>Dapatkan total <strong>5 Poin Progress</strong> untuk mendapatkan 1 peti.</li>
                                    <li>Jika semua slot peti (3 maksimal) penuh, progress akan ditahan di 5/5.</li>
                                    <li className="text-rose-600 font-bold">Pastikan membuka peti agar tidak membuang progress sia-sia!</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Jenis Peti & Hadiah</h4>
                                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                    Peti terdiri dari <strong>Common</strong>, <strong>Rare</strong>, dan <strong>Epic</strong>. Hadiah yang mungkin didapat meliputi <strong>Coin, Gem, Hint, dan Voucher Gacha Gratis</strong>.
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    Semua hadiah dipilih secara acak. Setiap jenis peti memiliki pool hadiah dan peluang yang berbeda. Semakin langka peti, semakin besar peluang memperoleh hadiah bernilai tinggi.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-white border-t border-gray-100">
                            <button onClick={() => setShowInfo(false)} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform">
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {rewardPopup && (
                <ChestRewardPopup rewards={rewardPopup} onClose={handleClaim} />
            )}
        </div>
    );
};

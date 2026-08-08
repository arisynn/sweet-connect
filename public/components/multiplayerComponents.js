const HeroCarousel = ({ profile, activeTheme, THEMES, prepareLevel, onMultiplayerClick, inRoom, onStartGame, isHost, allReady, roomData }) => {
    const [activeIndex, setActiveIndex] = React.useState(0);
    const touchStartX = React.useRef(0);
    const touchEndX = React.useRef(0);

    React.useEffect(() => {
        if (inRoom) {
            setActiveIndex(1);
        }
    }, [inRoom]);

    const handleTouchStart = (e) => {
        if (inRoom) return;
        touchStartX.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
        if (inRoom) return;
        touchEndX.current = e.changedTouches[0].screenX;
        if (touchStartX.current - touchEndX.current > 50) {
            setActiveIndex(1);
        }
        if (touchEndX.current - touchStartX.current > 50) {
            setActiveIndex(0);
        }
    };

    return (
        <div className="relative w-full shrink-0 animate-card-enter overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                
                {/* Play Card */}
                <div className="w-full shrink-0 pr-1">
                    <button onClick={() => { 
                        if(!inRoom) {
                            if ((profile.hp || 0) <= 0) {
                                window.Dialog?.showError?.("Gagal", "Nyawa kamu habis! Tunggu beberapa saat atau beli di Shop.");
                                return;
                            }
                            prepareLevel(profile.currentLevel); 
                        }
                    }} className={`w-full h-[140px] overflow-hidden bg-gradient-to-br from-pink-500 to-rose-500 rounded-[1.25rem] p-4 shadow-md flex flex-col items-start relative transition-transform ${inRoom ? '' : 'active:scale-[0.98]'}`}>
                        {(THEMES[activeTheme]?.cards?.['continue'] || THEMES[activeTheme]?.menuBackgrounds?.['continue']) && (
                            <PanoramaBackground 
                                src={THEMES[activeTheme]?.cards?.['continue'] || THEMES[activeTheme].menuBackgrounds['continue']} 
                                themeConfig={THEMES[activeTheme]} 
                                fallbackOpacity={0.8} 
                            />
                        )}
                        <div className="theme-text-active bg-white p-2.5 rounded-xl mb-auto shadow-sm relative z-10">
                            <IconPlay className="w-5 h-5"/>
                        </div>
                        <span className="text-white text-xl font-bold mb-0.5 tracking-wide relative z-10">Main Sekarang</span>
                        <span className="text-pink-100 text-sm font-medium relative z-10">Level {profile.currentLevel}</span>
                    </button>
                </div>

                {/* Multiplayer Card */}
                <div className="w-full shrink-0 pl-1">
                    <button onClick={inRoom ? (isHost ? onStartGame : null) : onMultiplayerClick} className={`w-full h-[140px] overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-500 rounded-[1.25rem] p-4 shadow-md flex flex-col items-start relative transition-transform ${inRoom && isHost && !allReady ? 'opacity-80' : 'active:scale-[0.98]'}`} disabled={inRoom && isHost && !allReady}>
                        {(THEMES[activeTheme]?.cards?.['multiplayer'] || THEMES[activeTheme]?.menuBackgrounds?.['multiplayer']) && (
                            <PanoramaBackground 
                                src={THEMES[activeTheme]?.cards?.['multiplayer'] || THEMES[activeTheme].menuBackgrounds['multiplayer']} 
                                themeConfig={THEMES[activeTheme]} 
                                fallbackOpacity={0.8} 
                            />
                        )}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
                        <div className={`bg-white p-2.5 rounded-xl mb-auto shadow-sm relative z-10 ${inRoom && isHost && allReady ? 'text-pink-500' : 'text-indigo-500'}`}>
                            {inRoom && isHost && allReady ? <IconPlay className="w-5 h-5"/> : <IconUsers className="w-5 h-5"/>}
                        </div>
                        <span className="text-white text-xl font-bold mb-0.5 tracking-wide relative z-10">{inRoom ? (isHost ? "Mulai Game" : "Match") : "Multiplayer"}</span>
                        <span className="text-indigo-100 text-sm font-medium relative z-10">{inRoom ? (roomData?.players?.length < 2 ? "Menunggu pasangan..." : (allReady ? "Semua siap! Host bisa memulai." : "Menunggu pasangan siap...")) : "Main bareng"}</span>
                    </button>
                </div>
            </div>

            {!inRoom && (
                <div className="flex justify-center gap-1.5 mt-2.5">
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === 0 ? 'w-4 bg-pink-500' : 'w-1.5 bg-gray-300'}`} />
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === 1 ? 'w-4 bg-indigo-500' : 'w-1.5 bg-gray-300'}`} />
                </div>
            )}
        </div>
    );
};

const MultiplayerLobby = ({ roomData, profile, playerName, onLeaveRoom, onStartGame, onChangeMode, onReadyToggle, THEMES }) => {
    const isHost = roomData?.host === playerName;
    const allReady = roomData?.players?.length === 2 && roomData?.players?.every(p => p.ready);
    
    return (
        <div className="flex-1 w-full flex flex-col gap-4 relative z-10 animate-page-enter">
            <div className="bg-white rounded-[1.25rem] p-4 shadow-sm flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">ROOM CODE</span>
                    </div>
                    <div className="text-gray-800 text-xl font-black tracking-widest">{roomData?.id || '......'}</div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(roomData?.id)} className="bg-gray-100 p-2.5 rounded-xl text-gray-500 active:bg-gray-200 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                    <button onClick={onLeaveRoom} className="bg-red-50 p-2.5 rounded-xl text-red-500 active:bg-red-100 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    </button>
                </div>
            </div>

            <div className="w-full flex-1 flex flex-col gap-4 overflow-y-auto hide-scrollbar pb-6">
                <div className="flex flex-col gap-2">
                {roomData?.players?.map((player, idx) => (
                    <div key={idx} className="bg-white rounded-[14px] p-2 flex items-center shadow-sm h-[60px]">
                        <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500 text-lg font-black shrink-0 overflow-hidden shadow-inner border border-gray-100">
                            {player.theme && THEMES && THEMES[player.theme]?.preview ? (
                                <img src={THEMES[player.theme].preview} alt="theme" className="w-full h-full object-cover" />
                            ) : (
                                (player.theme && THEMES && THEMES[player.theme]?.data?.[0]) || (player.name || '?').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="ml-3 flex-1 overflow-hidden flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className="font-semibold text-gray-800 text-[15px] truncate leading-none">{player.name || 'Player'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs font-medium leading-none">Lv.{player.level}</span>
                                <div className="flex items-center gap-1 leading-none">
                                    <div className={`w-1.5 h-1.5 rounded-full ${player.connection === 'RECONNECTING' ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                                    <span className={`text-[11px] font-semibold ${player.connection === 'RECONNECTING' ? 'text-amber-500' : 'text-gray-600'}`}>
                                        {player.connection === 'RECONNECTING' ? 'Reconnecting...' : 'Online'}
                                    </span>
                                </div>
                                <span className="text-[11px] font-medium text-gray-400 flex items-center gap-0.5 leading-none">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" /></svg>
                                    {player.connection === 'RECONNECTING' ? '>1000' : (player.name === playerName ? '12' : (40 + (player.name.length * 3)))}ms
                                </span>
                            </div>
                        </div>
                        {player.name === playerName ? (
                            <button onClick={onReadyToggle} className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-transform ${player.ready ? 'bg-amber-400 text-amber-900' : 'bg-gray-800 text-white'}`}>
                                {player.ready ? 'Batal Siap' : 'Siap'}
                            </button>
                        ) : (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${player.ready ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                {player.ready ? 'Siap' : 'Belum Siap'}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={onChangeMode} className="bg-white rounded-[1.25rem] p-4 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform text-left shrink-0">
                <div className="flex flex-col items-start w-full">
                    <span className="text-gray-400 text-xs font-bold mb-0.5">Mode Permainan</span>
                    <span className="text-gray-800 font-black">{roomData?.mode || 'Friendly Match'}</span>
                    
                    {roomData?.mode === 'Match Berhadiah' && roomData?.wager && (
                        <div className="mt-2 w-full pt-3 border-t border-gray-100 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <img src={`/assets/icon/${roomData.wager.currency === 'coins' ? 'coin' : 'gem'}.png`} alt={roomData.wager.currency} className="w-5 h-5 object-contain" />
                                    <span className="text-amber-500 font-black text-sm">{roomData.wager.amount}</span>
                                </div>
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${roomData.wager.memberAgreed ? 'text-green-500 bg-green-50 px-2 py-0.5 rounded border border-green-100' : 'text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100'}`}>
                                    {roomData.wager.memberAgreed ? 'Disetujui' : 'Menunggu guest...'}
                                </span>
                            </div>
                            {!roomData.wager.memberAgreed && isHost && window.handleCancelWager && (
                                <button onClick={(e) => { e.stopPropagation(); window.handleCancelWager(roomData.wager.offerId); }} className="w-full py-2 bg-red-50 text-red-500 font-bold text-xs rounded-lg active:bg-red-100 transition-colors mt-1 border border-red-100">
                                    Batalkan Penawaran
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {isHost && (
                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-500 shrink-0 ml-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
                    </div>
                )}
            </button>
            </div>
        </div>
    );
};

const MultiplayerPopup = ({ isOpen, onClose, onCreateRoom, onJoinRoom, isRequestingRoom }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-in-center relative overflow-hidden">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Multiplayer</h2>
                    <p className="text-gray-500 text-sm mt-1">Bermain bareng menggunakan Room Code.</p>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={onCreateRoom} disabled={isRequestingRoom} className={`w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-2xl shadow-md ${isRequestingRoom ? 'opacity-50' : 'active:scale-95 transition-transform'} flex flex-col items-center justify-center`}>
                        <span className="font-bold text-lg mb-0.5">Buat Room</span>
                        <span className="text-pink-100 text-xs text-center">Buat room baru lalu kasih kodenya ke pasangan.</span>
                    </button>
                    <button onClick={onJoinRoom} disabled={isRequestingRoom} className={`w-full bg-white border-2 border-pink-100 text-pink-600 p-4 rounded-2xl shadow-sm ${isRequestingRoom ? 'opacity-50' : 'active:scale-95 transition-transform'} flex flex-col items-center justify-center`}>
                        <span className="font-bold text-lg mb-0.5">Gabung Room</span>
                        <span className="text-pink-400 text-xs text-center">Masukkan kode room untuk bergabung.</span>
                    </button>
                </div>
                <button onClick={onClose} className="w-full mt-4 text-gray-400 font-bold py-3 active:text-gray-600 transition-colors">Batal</button>
            </div>
        </div>
    );
};

const JoinRoomDialog = ({ isOpen, onClose, onJoin, isRequestingRoom }) => {
    const [code, setCode] = React.useState("");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-in-center">
                <h2 className="text-xl font-black text-gray-800 text-center mb-4">Gabung Room</h2>
                <input 
                    type="text" 
                    value={code} 
                    onChange={e => setCode(e.target.value.toUpperCase())} 
                    placeholder="Masukkan Room Code" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-black text-gray-800 tracking-widest outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all mb-6"
                    maxLength={6}
                />
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 active:bg-gray-200 transition-colors">Batal</button>
                    <button onClick={() => { if(code.trim()) onJoin(code.trim()); else window.Dialog.showError("Error", "Kode room tidak boleh kosong."); }} disabled={isRequestingRoom} className={`flex-1 py-3 rounded-xl font-bold text-white bg-pink-500 shadow-md transition-colors ${isRequestingRoom ? 'opacity-50' : 'active:bg-pink-600'}`}>{isRequestingRoom ? 'Loading...' : 'Gabung'}</button>
                </div>
            </div>
        </div>
    );
};

const GameModeSheet = ({ isOpen, onClose, onSelect, currentMode, isHost }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-fade-in-up sm:scale-in-center" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                <h2 className="text-xl font-black text-gray-800 text-center mb-6">Pilih Mode Permainan</h2>
                <div className="flex flex-col gap-3">
                    <button onClick={() => { if(!isHost) return; onSelect('Friendly Match'); }} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${currentMode === 'Friendly Match' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-white'} ${!isHost && 'opacity-70'}`}>
                        <div className="font-bold text-gray-800 text-lg">Friendly Match</div>
                        <div className="text-gray-500 text-xs mt-1">Main santai tanpa taruhan.</div>
                    </button>
                    <button onClick={() => { if(!isHost) return; onSelect('Match Berhadiah'); }} className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${currentMode === 'Match Berhadiah' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-white'} ${!isHost && 'opacity-70'}`}>
                        <div className="font-bold text-gray-800 text-lg">Match Berhadiah</div>
                        <div className="text-gray-500 text-xs mt-1">Taruhan Coin atau Gem ditentukan oleh Host. Kalian berdua harus setuju.</div>
                    </button>
                </div>
            </div>
        </div>
    );
};

const WagerConfigSheet = ({ isOpen, onClose, onPropose, profile }) => {
    const [currency, setCurrency] = React.useState('coins');
    const [amount, setAmount] = React.useState('100');

    if (!isOpen) return null;
    const balance = profile[currency] || 0;
    
    return (
        <div className="fixed inset-0 z-[220] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-sm rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-fade-in-up sm:scale-in-center" onClick={e => e.stopPropagation()}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                <h2 className="text-xl font-black text-gray-800 text-center mb-2">Atur Taruhan</h2>
                
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setCurrency('coins')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold transition-all ${currency === 'coins' ? 'bg-amber-100 text-amber-600 border-2 border-amber-400' : 'bg-gray-50 text-gray-400 border-2 border-transparent'}`}>
                        <img src="/assets/icon/coin.png" className="w-5 h-5 object-contain" />
                    </button>
                    <button onClick={() => setCurrency('gems')} className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold transition-all ${currency === 'gems' ? 'bg-fuchsia-100 text-fuchsia-600 border-2 border-fuchsia-400' : 'bg-gray-50 text-gray-400 border-2 border-transparent'}`}>
                        <img src="/assets/icon/gem.png" className="w-5 h-5 object-contain" />
                    </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-6 flex justify-between items-center text-sm border border-gray-100">
                    <span className="font-bold text-gray-500">Saldo</span>
                    <div className="flex items-center gap-1.5">
                        <img src={`/assets/icon/${currency === 'coins' ? 'coin' : 'gem'}.png`} className="w-4 h-4 object-contain" />
                        <span className="font-black text-gray-800">{balance}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Nominal</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <img src={`/assets/icon/${currency === 'coins' ? 'coin' : 'gem'}.png`} className="w-6 h-6 object-contain" />
                        </div>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => {
                                let val = e.target.value;
                                if (val !== '') {
                                    const parsed = parseInt(val, 10);
                                    val = isNaN(parsed) ? '' : parsed.toString();
                                }
                                setAmount(val);
                            }} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-2xl font-black text-gray-800 outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all"
                            min="1"
                        />
                    </div>
                    <div className="flex justify-between gap-2 mt-3">
                        {[25, 50, 100].map(val => (
                            <button key={val} onClick={() => setAmount(val.toString())} className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-bold text-gray-600 active:bg-gray-200 transition-colors">{val}</button>
                        ))}
                        <button onClick={() => setAmount(balance.toString())} className="flex-1 py-2 bg-pink-50 rounded-lg text-sm font-bold text-pink-600 active:bg-pink-100 transition-colors">MAX</button>
                    </div>
                </div>

                <button onClick={() => {
                    const num = parseInt(amount, 10);
                    if (num > 0) onPropose(currency, num);
                }} className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold shadow-md active:scale-95 transition-transform">
                    Kirim Penawaran
                </button>
            </div>
        </div>
    );
};

const WagerApprovalDialog = ({ wager, profile, onAccept, onReject }) => {
    if (!wager) return null;
    const balance = profile[wager.currency] || 0;
    const canAfford = balance >= wager.amount;
    const iconSrc = `/assets/icon/${wager.currency === 'coins' ? 'coin' : 'gem'}.png`;
    const currencyName = wager.currency === 'coins' ? 'Coin' : 'Gem';

    return (
        <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl scale-in-center text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                    <img src={iconSrc} alt="wager" className="w-10 h-10 object-contain drop-shadow-md" />
                </div>
                <h2 className="text-xl font-black text-gray-800 mb-2">Tawaran Taruhan</h2>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-500">Host menawarkan:</span>
                        <div className="flex items-center gap-1.5">
                            <img src={iconSrc} className="w-4 h-4 object-contain" />
                            <span className="text-gray-800">{wager.amount} {currencyName}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-gray-500">Kontribusi Anda:</span>
                        <div className="flex items-center gap-1.5">
                            <img src={iconSrc} className="w-4 h-4 object-contain" />
                            <span className="text-gray-800">{wager.amount} {currencyName}</span>
                        </div>
                    </div>
                    <div className="h-px bg-gray-200 w-full"></div>
                    <div className="flex justify-between items-center text-base font-black">
                        <span className="text-gray-800">Total Bank:</span>
                        <div className="flex items-center gap-1.5">
                            <img src={iconSrc} className="w-5 h-5 object-contain" />
                            <span className="text-amber-500">{wager.amount * 2} {currencyName}</span>
                        </div>
                    </div>
                </div>

                {!canAfford && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                        Saldo kamu tidak mencukupi. (Saldo: {balance})
                    </div>
                )}
                
                <div className="flex gap-3">
                    <button onClick={onReject} className="flex-1 py-3.5 bg-gray-100 rounded-xl font-bold text-gray-600 active:bg-gray-200 transition-colors">
                        Tolak
                    </button>
                    <button 
                        onClick={canAfford ? onAccept : null} 
                        className={`flex-1 py-3.5 rounded-xl font-bold shadow-sm transition-colors ${canAfford ? 'bg-amber-400 text-amber-900 active:bg-amber-500' : 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed'}`}
                    >
                        Terima
                    </button>
                </div>
            </div>
        </div>
    );
};
window.WagerConfigSheet = WagerConfigSheet;
window.WagerApprovalDialog = WagerApprovalDialog;

const MultiplayerResult = ({ roomData, playerName, onRematch, onLeave }) => {
    const isWinner = roomData.winner === playerName;
    const [opponentName] = React.useState(() => {
        return roomData.players.find(p => p.name !== playerName)?.name || 'Guest';
    });
    const wager = roomData.wager;

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm flex flex-col items-center animate-fade-in-up">
            <h1 className={`text-4xl font-black mb-2 ${isWinner ? 'text-amber-500' : 'text-gray-400'}`}>
                {isWinner ? 'MENANG!' : 'KALAH'}
            </h1>
            
            <div className="text-gray-500 font-bold mb-6 flex flex-col items-center">
                <span>vs {opponentName}</span>
                {roomData.finishReason === 'DISCONNECT' && (
                    <span className="text-xs font-black text-red-500 bg-red-50 border border-red-100 px-3 py-1 rounded-full mt-2">
                        {isWinner ? 'Pasangan terputus dari pertandingan' : 'Kamu terputus'}
                    </span>
                )}
            </div>

            {roomData.mode === 'Match Berhadiah' && wager && (
                <div className={`flex flex-col items-center justify-center p-4 rounded-2xl mb-8 w-full border-2 ${isWinner ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {isWinner ? 'Hadiah Didapatkan' : 'Taruhan Hilang'}
                    </span>
                    <div className="flex items-center gap-2">
                        <img src={`/assets/icon/${wager.currency === 'coins' ? 'coin' : 'gem'}.png`} className="w-8 h-8 object-contain drop-shadow-sm" />
                        <span className={`text-3xl font-black ${isWinner ? 'text-amber-500' : 'text-gray-600'}`}>
                            {isWinner ? '+' : '-'}{wager.amount}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex gap-3 w-full mt-4">
                <button onClick={onLeave} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold active:bg-gray-200 transition-colors">
                    Keluar
                </button>
                <button onClick={onRematch} className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-bold shadow-md active:bg-pink-600 transition-colors">
                    Main Lagi
                </button>
            </div>
        </div>
    );
};
window.MultiplayerResult = MultiplayerResult;

window.MultiplayerLoading = ({ roomData, playerName }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-pink-50/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-pink-100 flex flex-col items-center w-full max-w-sm animate-card-enter">
                <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <IconGem className="w-8 h-8 text-pink-400 drop-shadow-sm animate-pulse" />
                    </div>
                </div>
                
                <h3 className="text-2xl font-black text-gray-800 mb-2">Menyiapkan Pertandingan</h3>
                <p className="text-sm font-bold text-pink-500 mb-8">Sinkronisasi permainan...</p>
                
                <div className="w-full flex flex-col gap-3">
                    {roomData?.players?.map(p => (
                        <div key={p.name} className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-black text-base shadow-inner">
                                    {p.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-gray-700">{p.name}</span>
                            </div>
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${p.readyForGame ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                                {p.readyForGame ? <IconCheck className="w-5 h-5" /> : <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

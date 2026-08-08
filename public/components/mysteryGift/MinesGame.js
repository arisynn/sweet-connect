const MinesGame = ({ profile, syncProfile, onOpenComplete, opening, setOpening }) => {
    const { useState, useEffect, useRef } = React;
    const [wager, setWager] = useState(100);
    const [bombCount, setBombCount] = useState(1);
    const [helpOpen, setHelpOpen] = useState(false);
    const [gameState, setGameState] = useState('idle'); // idle, playing, result, freeze
    const [resultType, setResultType] = useState(null); // 'win', 'lose'
    const [grid, setGrid] = useState(Array(9).fill({ type: '', revealed: false }));
    const [openedCount, setOpenedCount] = useState(0);
    const [statsOpen, setStatsOpen] = useState(false);
    const [animatingCell, setAnimatingCell] = useState(-1);
    const [showBanner, setShowBanner] = useState(false);
    const [winAmountDisplay, setWinAmountDisplay] = useState(0);
    
    useEffect(() => {
        window.isGameLocked = (gameState === 'playing' || gameState === 'result' || gameState === 'freeze');
        window.gameLockedMessage = "Selesaikan permainan Mines terlebih dahulu.";
        return () => { window.isGameLocked = false; };
    }, [gameState]);

    const profileRef = useRef(profile);
    useEffect(() => { profileRef.current = profile; }, [profile]);


    const BET_OPTIONS = [100, 200, 300, 400, 500];
    const BOMB_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
    const RTP = 0.95;

    const getMultiplier = (bombs, opened) => {
        if (opened === 0) return 1.0;
        const safeCells = 9 - bombs;
        if (opened > safeCells) return 0;
        let prob = 1;
        for (let i = 0; i < opened; i++) {
            prob *= (safeCells - i) / (9 - i);
        }
        return prob > 0 ? (RTP / prob) : 0;
    };

    const currentMultiplier = getMultiplier(bombCount, openedCount);
    const nextMultiplier = getMultiplier(bombCount, openedCount + 1);
    const safeCells = 9 - bombCount;
    const remainingSafe = safeCells - openedCount;
    
    const defaultStats = { rounds: 0, wins: 0, losses: 0, profit: 0, totalWagered: 0, maxWin: 0, history: [], dailyCashouts: 0, lastCashoutDate: '' };
    const stats = profile.minesStats || defaultStats;
    const today = new Date().toDateString();
    const dailyCashouts = stats.lastCashoutDate === today ? (stats.dailyCashouts || 0) : 0;
    const [timeLeftToReset, setTimeLeftToReset] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const diff = tomorrow - now;
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeftToReset(`Reset dalam ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
        };
        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(interval);
    }, []);

    const startGame = async () => {
        if ((profileRef.current.coins || 0) < wager) {
            if (typeof AudioEngine !== 'undefined') AudioEngine.uiError();
            return;
        }
        if (typeof AudioEngine !== 'undefined') AudioEngine.uiClick();
        
        const newCoins = (profileRef.current.coins || 0) - wager;
        const tempProfile = { ...profileRef.current, coins: newCoins };
        
        let newStats = { ...(tempProfile.minesStats || defaultStats) };
        newStats.rounds = (newStats.rounds || 0) + 1;
        newStats.totalWagered = (newStats.totalWagered || 0) + wager;
        newStats.profit = (newStats.profit || 0) - wager;
        tempProfile.minesStats = newStats;
        
        if (typeof syncProfile === 'function') {
            await syncProfile(tempProfile);
        } else if (typeof SaveEngine !== 'undefined') {
            SaveEngine.saveProfile(tempProfile);
            if (typeof onOpenComplete === 'function') onOpenComplete(tempProfile);
        }
        
        const positions = [0,1,2,3,4,5,6,7,8];
        const bombs = [];
        for (let i = 0; i < bombCount; i++) {
            const idx = Math.floor(Math.random() * positions.length);
            bombs.push(positions.splice(idx, 1)[0]);
        }
        
        setGrid(Array(9).fill(null).map((_, i) => ({
            type: bombs.includes(i) ? 'bomb' : 'gem',
            revealed: false
        })));
        setOpenedCount(0);
        setResultType(null);
        setShowBanner(false);
        setWinAmountDisplay(0);
        setGameState('playing');
        setOpening(true);
        setStatsOpen(false); // auto close accordion when starting
    };

    const handleCellClick = async (index) => {
        if (gameState !== 'playing') return;
        if (grid[index].revealed) return;
        
        setAnimatingCell(index);
        setTimeout(() => setAnimatingCell(-1), 300);

        const newGrid = [...grid];
        newGrid[index].revealed = true;
        setGrid(newGrid);
        
        if (newGrid[index].type === 'bomb') {
            if (typeof AudioEngine !== 'undefined') AudioEngine.wrong();
            
            setTimeout(() => {
                const revealedGrid = newGrid.map(cell => ({ ...cell, revealed: true }));
                setGrid(revealedGrid);
            }, 300);
            setResultType('lose');
            setGameState('freeze');
            setOpening(false);
            
            const tempProfile = { ...profileRef.current };
            let newStats = { ...(tempProfile.minesStats || defaultStats) };
            newStats.losses = (newStats.losses || 0) + 1;
            newStats.history = ['lose', ...(newStats.history || [])].slice(0, 10);
            tempProfile.minesStats = newStats;
            if (typeof syncProfile === 'function') {
                await syncProfile(tempProfile);
            } else if (typeof SaveEngine !== 'undefined') {
                SaveEngine.saveProfile(tempProfile);
                if (typeof onOpenComplete === 'function') onOpenComplete(tempProfile);
            }
        } else {
            if (typeof AudioEngine !== 'undefined') AudioEngine.match();
            const newOpenedCount = openedCount + 1;
            setOpenedCount(newOpenedCount);
            
            if (newOpenedCount === 9 - bombCount) {
                setTimeout(() => cashout(newOpenedCount), 500);
            }
        }
    };
    
    const cashout = async (count = openedCount) => {
        if (gameState !== 'playing' || count === 0) return;
        
        const isManualCashout = count < (9 - bombCount);
        if (isManualCashout && dailyCashouts >= 3) {
            if (typeof AudioEngine !== 'undefined') AudioEngine.uiError();
            return;
        }

        if (typeof AudioEngine !== 'undefined') AudioEngine.winPrize();
        
        const multiplier = getMultiplier(bombCount, count);
        const winAmount = Math.floor(wager * multiplier);
        
        const tempProfile = { ...profileRef.current };
        tempProfile.coins = (tempProfile.coins || 0) + winAmount;
        
        let newStats = { ...(tempProfile.minesStats || defaultStats) };
        newStats.wins = (newStats.wins || 0) + 1;
        newStats.profit = (newStats.profit || 0) + winAmount;
        if (winAmount > (newStats.maxWin || 0)) newStats.maxWin = winAmount;
        newStats.history = ['win', ...(newStats.history || [])].slice(0, 10);
        
        if (isManualCashout) {
            newStats.lastCashoutDate = today;
            newStats.dailyCashouts = dailyCashouts + 1;
        }
        
        tempProfile.minesStats = newStats;
        
        if (typeof syncProfile === 'function') {
            await syncProfile(tempProfile);
        } else if (typeof SaveEngine !== 'undefined') {
            SaveEngine.saveProfile(tempProfile);
            if (typeof onOpenComplete === 'function') onOpenComplete(tempProfile);
        }
        
        const revealedGrid = grid.map(cell => ({ ...cell, revealed: true }));
        setGrid(revealedGrid);
        setWinAmountDisplay(winAmount);
        setResultType('win');
        setGameState('freeze');
        setOpening(false);
    };

    const resetGame = () => {
        if (typeof AudioEngine !== 'undefined') AudioEngine.uiClick();
        setGameState('idle');
        setGrid(Array(9).fill({ type: '', revealed: false }));
        setOpenedCount(0);
        setShowBanner(false);
        setResultType(null);
    };

    const formatNum = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

    return (
        <div className="w-full h-full flex flex-col pt-2 px-4 pb-20 max-w-sm mx-auto relative">
            
            <GuideModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="Panduan Mines Harta">
                <div className="guide-section">
                    <h3 className="guide-section-title">Cara Bermain</h3>
                    <ul className="guide-list">
                        <li>Pilih jumlah taruhan dan jumlah ranjau yang diinginkan.</li>
                        <li>Tekan tombol <strong>Mulai Bermain</strong>.</li>
                        <li>Buka kotak satu per satu. Setiap permata yang ditemukan akan menaikkan hadiah (multiplier).</li>
                        <li>Anda dapat melakukan <strong>Cash Out</strong> (ambil hadiah) kapan saja sebelum terkena ranjau.</li>
                        <li>Jika membuka kotak berisi ranjau, taruhan hangus!</li>
                    </ul>
                </div>

                <div className="guide-section">
                    <h3 className="guide-section-title">Risiko & Hadiah</h3>
                    <ul className="guide-list">
                        <li>Semakin <strong>banyak ranjau</strong> yang dipasang, peluang menang lebih kecil, tetapi <strong>pengali (multiplier) akan naik lebih cepat</strong>.</li>
                        <li>Setiap permata berikutnya akan memberikan keuntungan eksponensial.</li>
                    </ul>
                </div>
                
                <div className="guide-section">
                    <h3 className="guide-section-title">Tabel Pengali (Berdasarkan Ranjau Terpilih: {bombCount})</h3>
                    <p className="guide-text mb-2">Semakin banyak permata yang dibuka, semakin besar pengali:</p>
                    <table className="guide-table">
                        <thead>
                            <tr>
                                <th>Permata Dibuka</th>
                                <th>Pengali (Multiplier)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5].map(p => {
                                if (p > 9 - bombCount) return null;
                                return (
                                    <tr key={p}>
                                        <td>{p} Permata</td>
                                        <td className="text-emerald-600 font-bold">x{getMultiplier(bombCount, p).toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="guide-section">
                    <h3 className="guide-section-title">Contoh Perhitungan</h3>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center pb-1 border-b border-gray-200">
                            <span className="text-xs font-bold text-gray-500">Taruhan Awal</span>
                            <span className="text-sm font-black text-gray-700">100 Koin</span>
                        </div>
                        <div className="flex justify-between items-center pb-1 border-b border-gray-200">
                            <span className="text-xs font-bold text-gray-500">Jumlah Ranjau</span>
                            <span className="text-sm font-black text-gray-700">{bombCount} Ranjau</span>
                        </div>
                        <div className="flex justify-between items-center pb-1 border-b border-gray-200">
                            <span className="text-xs font-bold text-gray-500">Buka Permata</span>
                            <span className="text-sm font-black text-gray-700">2 Permata</span>
                        </div>
                        <div className="flex justify-between items-center pb-1 border-b border-gray-200">
                            <span className="text-xs font-bold text-gray-500">Pengali (Multiplier)</span>
                            <span className="text-sm font-black text-emerald-600">x{getMultiplier(bombCount, 2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-xs font-black text-gray-600">Total Cash Out</span>
                            <span className="text-base font-black text-amber-500">{Math.floor(100 * getMultiplier(bombCount, 2))} Koin</span>
                        </div>
                    </div>
                </div>

                <div className="guide-section border-l-4 border-l-amber-400">
                    <h3 className="guide-section-title">Tips Bermain</h3>
                    <ul className="guide-list">
                        <li>Semakin lama Anda bertahan, hadiah semakin besar.</li>
                        <li>Cash Out lebih awal memiliki risiko lebih kecil.</li>
                        <li>Jangan terlalu serakah jika sudah memperoleh keuntungan yang memuaskan.</li>
                    </ul>
                </div>
            </GuideModal>

            <div className="text-center mb-2 sm:mb-4 shrink-0">
                <h2 className="text-xl sm:text-2xl font-black text-emerald-600 mb-0.5 sm:mb-1 tracking-tight">Mines Harta</h2>
                <p className="text-gray-500 text-[11px] sm:text-sm">Temukan permata, hindari ranjau</p>
            </div>

            <style>{`
                @keyframes flipIn {
                    0% { transform: perspective(400px) rotateY(-90deg); opacity: 0; }
                    100% { transform: perspective(400px) rotateY(0deg); opacity: 1; }
                }
                .animate-flip {
                    animation: flipIn 0.3s ease-out forwards;
                }
                @keyframes popBounce {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop-bounce {
                    animation: popBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes slideDownResult {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes popUp {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-4px) rotate(-2deg); }
                    40% { transform: translateX(4px) rotate(2deg); }
                    60% { transform: translateX(-4px) rotate(-2deg); }
                    80% { transform: translateX(4px) rotate(2deg); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
                @keyframes countUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-count-up {
                    animation: countUp 0.3s ease-out;
                }
            `}</style>



            {/* BOARD CARD */}
            <div className="bg-white rounded-3xl p-3 sm:p-4 mb-2 shadow-sm border border-gray-100 relative overflow-hidden shrink-0 transition-all duration-300">
                {(gameState === 'playing' || gameState === 'freeze') && (
                    <div className="flex justify-between items-center mb-2 px-1 mt-1">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500">Aman: <span className="text-emerald-500 font-black">{openedCount}/{safeCells}</span></span>
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500">Tersisa: <span className="text-gray-700 font-black">{remainingSafe}</span></span>
                    </div>
                )}
                {gameState === 'idle' && (
                    <div className="flex justify-center items-center mb-2 px-1 mt-1 opacity-50">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500">Siap Bermain</span>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-2 sm:gap-3 relative z-10">
                    {grid.map((cell, i) => (
                        <button 
                            key={i}
                            disabled={gameState !== 'playing' || cell.revealed}
                            onClick={() => handleCellClick(i)}
                            className={`relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 transform outline-none ${
                                !cell.revealed ? 
                                    (gameState === 'playing' ? 
                                        `bg-emerald-50 shadow-[0_4px_0_#d1fae5] border-2 border-emerald-100 cursor-pointer hover:bg-emerald-100 active:translate-y-1 active:shadow-[0_0px_0_#d1fae5] ${animatingCell === i ? 'scale-95' : ''}` : 
                                        'bg-gray-50 shadow-[0_4px_0_#f3f4f6] border-2 border-gray-100 cursor-default') : 
                                (cell.type === 'bomb' ? 
                                    'bg-rose-50 border-2 border-rose-200 shadow-inner' : 
                                    'bg-emerald-100 border-2 border-emerald-200 shadow-inner')
                            }`}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                {cell.revealed && (
                                    cell.type === 'bomb' ? 
                                    <IconBomb className={`w-8 h-8 sm:w-10 sm:h-10 text-rose-500 drop-shadow-sm animate-flip ${gameState === 'freeze' && resultType === 'lose' ? 'animate-shake' : ''}`} /> : 
                                    <IconCoin className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm animate-pop-bounce text-amber-500" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* SINGLE CONTROLS CARD */}
            <div className="w-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible transition-all duration-300 relative z-20">
                    {gameState === 'idle' && (
                        <div className="p-3 flex flex-col animate-[fadeIn_0.3s_ease-out]">
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[9px] font-black text-gray-400 tracking-wider">TARUHAN</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-500 rounded-full border border-amber-100 shadow-sm h-[26px]">
                                            <IconCoin className="w-3.5 h-3.5"/>
                                            <span className="text-[11px] font-black">{formatNum(profileRef.current.coins || 0)}</span>
                                        </div>
                                        <button 
                                            onClick={() => { if(typeof AudioEngine !== 'undefined') AudioEngine.uiClick(); setHelpOpen(true); }}
                                            className="text-[11px] font-black text-gray-500 bg-white hover:bg-gray-50 hover:text-emerald-500 active:scale-95 transition-all px-3 py-1 rounded-full border border-gray-200 shadow-sm flex items-center h-[26px]"
                                        >
                                            BANTUAN
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-1">
                                    {BET_OPTIONS.map(b => (
                                        <button 
                                            key={b}
                                            onClick={() => setWager(b)}
                                            className={`py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all ${
                                                wager === b 
                                                    ? 'bg-amber-400 text-white shadow-sm ring-2 ring-amber-400 ring-offset-1' 
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                            }`}
                                        >
                                            {formatNum(b)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-2.5">
                                <span className="text-[9px] sm:text-[10px] font-black text-gray-400 tracking-wider block mb-1.5">JUMLAH RANJAU</span>
                                <div className="grid grid-cols-7 gap-1">
                                    {BOMB_OPTIONS.map(b => (
                                        <button 
                                            key={b}
                                            onClick={() => setBombCount(b)}
                                            className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                                                bombCount === b 
                                                    ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-500 ring-offset-1' 
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                            }`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={startGame}
                                disabled={(profileRef.current.coins || 0) < wager}
                                className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-500 text-white font-black text-[13px] sm:text-base shadow-[0_4px_0_#059669] hover:bg-emerald-600 active:translate-y-1 active:shadow-[0_0px_0_#059669] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all tracking-wide mt-1"
                            >
                                MULAI MAIN
                            </button>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <div className="p-3 sm:p-4 flex flex-col animate-[fadeIn_0.3s_ease-out]">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex flex-col">
                                    <span className="text-[9px] sm:text-[10px] font-black text-gray-400 tracking-wider">REWARD SAAT INI</span>
                                    <div className="flex items-center gap-1 text-amber-500 font-black text-xl sm:text-2xl animate-count-up" key={currentMultiplier}>
                                        <IconCoin className="w-5 h-5 sm:w-6 sm:h-6"/>
                                        <span>{formatNum(Math.floor(wager * currentMultiplier))}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end text-right gap-1 sm:gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] sm:text-[9px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-100">M. SAAT INI</span>
                                        <span className="text-xs sm:text-sm font-black text-emerald-600 animate-count-up" key={'cur'+currentMultiplier}>{currentMultiplier.toFixed(2)}x</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] sm:text-[9px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-100">M. BERIKUTNYA</span>
                                        <span className="text-xs sm:text-sm font-black text-gray-600 animate-count-up" key={'next'+nextMultiplier}>{nextMultiplier.toFixed(2)}x</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => cashout()}
                                disabled={openedCount === 0 || (openedCount < safeCells && dailyCashouts >= 3)}
                                className={`w-full py-3 sm:py-4 rounded-xl text-white font-black text-[13px] sm:text-base transition-all flex flex-col items-center justify-center relative ${
                                    openedCount === 0 ? 'bg-gray-300 shadow-[0_4px_0_#9ca3af] cursor-not-allowed opacity-80' : 
                                    'bg-amber-400 shadow-[0_4px_0_#d97706] hover:bg-amber-500 active:translate-y-1 active:shadow-[0_0px_0_#d97706]'
                                } ${(openedCount < safeCells && dailyCashouts >= 3) ? 'opacity-50 translate-y-0 shadow-none' : ''}`}
                            >
                                <div className="flex flex-col items-center gap-0.5">
                                    {openedCount < safeCells && dailyCashouts >= 3 ? (
                                        <>
                                            <span className="text-xs sm:text-sm">Batas Cash Out Harian Tercapai (3/3)</span>
                                            <span className="text-[9px] sm:text-[10px] font-bold text-amber-100">{timeLeftToReset}</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <IconCoin className="w-4 h-4 sm:w-5 sm:h-5"/> 
                                                <span className="text-sm sm:text-lg">AMBIL ({formatNum(Math.floor(wager * currentMultiplier))})</span>
                                            </div>
                                            {openedCount > 0 && openedCount < safeCells && dailyCashouts < 3 && (
                                                <span className="text-[9px] sm:text-[10px] font-bold text-amber-100 uppercase tracking-wider mt-0.5 sm:mt-1">Sisa Cashout Harian: {3 - dailyCashouts}</span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    )}

                    {gameState === 'freeze' && (
                        <div className="p-3 flex flex-col animate-[fadeIn_0.3s_ease-out]">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className={`text-xs font-black uppercase tracking-wider ${resultType === 'win' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {resultType === 'win' ? 'MENANG' : 'KALAH'}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                                    M. {resultType === 'win' ? '' : 'Terakhir'}: <span className="text-gray-700 font-black">x{getMultiplier(bombCount, openedCount).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-400 tracking-wider">TARUHAN</span>
                                    <div className="flex items-center gap-1 text-gray-600 font-black text-sm">
                                        <IconCoin className="w-3.5 h-3.5 text-amber-500"/>
                                        <span>{formatNum(wager)}</span>
                                    </div>
                                </div>
                                <div className="w-[1px] h-8 bg-gray-200"></div>
                                <div className="flex flex-col items-end text-right">
                                    <span className="text-[9px] font-black text-gray-400 tracking-wider">HADIAH</span>
                                    <div className={`flex items-center gap-1 font-black text-sm ${resultType === 'win' ? 'text-amber-500' : 'text-gray-400'}`}>
                                        <IconCoin className={`w-3.5 h-3.5 ${resultType === 'win' ? 'text-amber-500' : 'grayscale opacity-50'}`}/>
                                        <span>{formatNum(resultType === 'win' ? winAmountDisplay : 0)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={resetGame}
                                    className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-[11px] sm:text-xs shadow-[0_4px_0_#e5e7eb] hover:bg-gray-200 active:translate-y-1 active:shadow-[0_0px_0_#e5e7eb] transition-all tracking-wide flex items-center justify-center"
                                >
                                    UBAH TARUHAN
                                </button>
                                <button 
                                    onClick={startGame}
                                    disabled={(profileRef.current.coins || 0) < wager}
                                    className="flex-[2] py-2.5 sm:py-3 rounded-xl bg-indigo-500 text-white font-black text-[13px] sm:text-base shadow-[0_4px_0_#4f46e5] hover:bg-indigo-600 active:translate-y-1 active:shadow-[0_0px_0_#4f46e5] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all tracking-wide flex items-center justify-center gap-2"
                                >
                                    <IconRefresh className="w-4 h-4 sm:w-5 sm:h-5"/> MAIN LAGI
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ACCORDION STATS */}
                    <button onClick={() => setStatsOpen(!statsOpen)} className={`w-full pt-1.5 pb-2 border-t border-gray-50 flex items-center justify-center gap-1 text-[8px] font-black text-gray-400 bg-gray-50/50 hover:bg-gray-100/50 transition-colors ${!statsOpen ? 'rounded-b-2xl' : ''}`}>
                        STATISTIK MINES {statsOpen ? <IconChevronUp className="w-3 h-3"/> : <IconChevronDown className="w-3 h-3"/>}
                    </button>
                    
                    {statsOpen && (
                        <div className="w-full p-3 sm:p-4 pt-2 flex flex-col gap-2 sm:gap-3 animate-popup text-left bg-white rounded-b-2xl">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100 flex justify-between items-center">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-500">Total Ronde</span>
                                    <span className="text-[11px] sm:text-xs font-black text-gray-700">{formatNum(stats.rounds)}</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100 flex justify-between items-center">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-500">Win Rate</span>
                                    <span className="text-[11px] sm:text-xs font-black text-gray-700">{stats.rounds > 0 ? Math.floor((stats.wins / stats.rounds) * 100) : 0}%</span>
                                </div>
                                <div className="bg-emerald-50/50 rounded-xl p-2 sm:p-2.5 border border-emerald-50 flex justify-between items-center">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-500">Total Menang</span>
                                    <span className="text-[11px] sm:text-xs font-black text-emerald-600">{formatNum(stats.wins)}</span>
                                </div>
                                <div className="bg-rose-50/50 rounded-xl p-2 sm:p-2.5 border border-rose-50 flex justify-between items-center">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-500">Total Kalah</span>
                                    <span className="text-[11px] sm:text-xs font-black text-rose-500">{formatNum(stats.losses)}</span>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-2 sm:p-2.5 border border-gray-100 flex justify-between items-center">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-500">Total Taruhan</span>
                                    <span className="text-[11px] sm:text-xs font-black text-gray-700 flex items-center gap-1">{formatNum(stats.totalWagered)}</span>
                                </div>
                                <div className="bg-amber-50/50 rounded-xl p-2 sm:p-2.5 border border-amber-100 flex justify-between items-center">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-500">Max Menang</span>
                                    <span className="text-[11px] sm:text-xs font-black text-amber-600 flex items-center gap-1">{formatNum(stats.maxWin)}</span>
                                </div>
                            </div>

                            {/* Total Profit Full Width */}
                            <div className={`rounded-xl p-2.5 sm:p-3 border flex flex-col items-center justify-center text-center ${stats.profit > 0 ? 'bg-emerald-50/50 border-emerald-100' : stats.profit < 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-50 border-gray-100'}`}>
                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-0.5">Total Profit</span>
                                <span className={`text-sm sm:text-base font-black flex items-center gap-1 ${stats.profit > 0 ? 'text-emerald-600' : stats.profit < 0 ? 'text-rose-600' : 'text-gray-700'}`}>
                                    {stats.profit > 0 ? '+' : ''}{formatNum(stats.profit)} <IconCoin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500"/>
                                </span>
                            </div>

                            {/* Kemenangan Terbaru */}
                            <div className="flex flex-col mt-1">
                                <span className="text-[9px] sm:text-[10px] font-black text-gray-800 mb-1.5 sm:mb-2 tracking-wide px-1">KEMENANGAN TERBARU</span>
                                <div className="flex flex-col gap-1.5 sm:gap-2 max-h-[140px] overflow-y-auto custom-scroll pr-1 pb-1 overscroll-contain">
                                    {(!stats.history || stats.history.length === 0) ? (
                                        <div className="text-[10px] sm:text-xs text-gray-400 text-center py-3 sm:py-4 font-medium bg-gray-50 rounded-xl border border-gray-100">Belum ada riwayat kemenangan.</div>
                                    ) : (
                                        stats.history.map((res, i) => (
                                            <div key={i} className="flex justify-between items-center bg-white p-2.5 sm:p-3 rounded-xl border border-gray-100 shadow-sm shrink-0">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] sm:text-xs font-black text-gray-700 uppercase tracking-tight">RONDE LALU</span>
                                                </div>
                                                <div className={`flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border ${res === 'win' ? 'bg-emerald-50 border-emerald-100/50 text-emerald-600' : 'bg-rose-50 border-rose-100/50 text-rose-600'}`}>
                                                    <span className="text-[10px] sm:text-xs font-black">{res === 'win' ? 'MENANG' : 'KALAH'}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
        </div>
    );
};



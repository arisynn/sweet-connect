const fs = require('fs');
const file = 'public/components/mysteryGift.js';
let content = fs.readFileSync(file, 'utf8');

const minesStartStr = 'const MinesGame = ({ profile, onOpenComplete, opening, setOpening }) => {';
const minesEndStr = 'const MysteryGift = ({ profile, onOpenComplete, onClose, activeTheme, onActivateTrial, onThemeSelect }) => {';

const startIndex = content.indexOf(minesStartStr);
const endIndex = content.indexOf(minesEndStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find boundaries");
    process.exit(1);
}

const replacement = `const MinesGame = ({ profile, onOpenComplete, opening, setOpening }) => {
    const { useState, useEffect, useRef } = React;
    const [wager, setWager] = useState(100);
    const [bombCount, setBombCount] = useState(1);
    const [gameState, setGameState] = useState('idle'); // idle, playing, result
    const [resultType, setResultType] = useState(null); // 'win', 'lose'
    const [grid, setGrid] = useState(Array(9).fill({ type: '', revealed: false }));
    const [openedCount, setOpenedCount] = useState(0);
    const [statsOpen, setStatsOpen] = useState(false);
    const [animatingCell, setAnimatingCell] = useState(-1);
    const [showBanner, setShowBanner] = useState(false);
    const [winAmountDisplay, setWinAmountDisplay] = useState(0);

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
            setTimeLeftToReset(\`Reset dalam \${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}\`);
        };
        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000);
        return () => clearInterval(interval);
    }, []);

    const startGame = () => {
        if ((profile.coins || 0) < wager) {
            if (typeof AudioEngine !== 'undefined') AudioEngine.uiError();
            return;
        }
        if (typeof AudioEngine !== 'undefined') AudioEngine.uiClick();
        
        const newCoins = (profile.coins || 0) - wager;
        const tempProfile = { ...profile, coins: newCoins };
        
        let newStats = { ...(tempProfile.minesStats || defaultStats) };
        newStats.rounds = (newStats.rounds || 0) + 1;
        newStats.totalWagered = (newStats.totalWagered || 0) + wager;
        newStats.profit = (newStats.profit || 0) - wager;
        tempProfile.minesStats = newStats;
        
        if (typeof SaveEngine !== 'undefined') {
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
    };

    const handleCellClick = (index) => {
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
            setGameState('result');
            setShowBanner(true);
            setOpening(false);
            
            const tempProfile = { ...profile };
            let newStats = { ...(tempProfile.minesStats || defaultStats) };
            newStats.losses = (newStats.losses || 0) + 1;
            newStats.history = ['lose', ...(newStats.history || [])].slice(0, 10);
            tempProfile.minesStats = newStats;
            if (typeof SaveEngine !== 'undefined') {
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
    
    const cashout = (count = openedCount) => {
        if (gameState !== 'playing' || count === 0) return;
        
        const isManualCashout = count < (9 - bombCount);
        if (isManualCashout && dailyCashouts >= 3) {
            if (typeof AudioEngine !== 'undefined') AudioEngine.uiError();
            return;
        }

        if (typeof AudioEngine !== 'undefined') AudioEngine.winPrize();
        
        const multiplier = getMultiplier(bombCount, count);
        const winAmount = Math.floor(wager * multiplier);
        
        const tempProfile = { ...profile };
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
        
        if (typeof SaveEngine !== 'undefined') {
            SaveEngine.saveProfile(tempProfile);
            if (typeof onOpenComplete === 'function') onOpenComplete(tempProfile);
        }
        
        const revealedGrid = grid.map(cell => ({ ...cell, revealed: true }));
        setGrid(revealedGrid);
        setWinAmountDisplay(winAmount);
        setResultType('win');
        setGameState('result');
        setShowBanner(true);
        setOpening(false);
    };

    const resetGame = () => {
        setGameState('idle');
        setGrid(Array(9).fill({ type: '', revealed: false }));
        setOpenedCount(0);
        setShowBanner(false);
        setResultType(null);
    };

    const formatNum = (n) => new Intl.NumberFormat('id-ID').format(n || 0);

    return (
        <div className="w-full h-full flex flex-col pt-4 pb-20 overflow-y-auto custom-scroll">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-black text-emerald-600 mb-1 tracking-tight">Mines Harta</h2>
                <p className="text-gray-500 text-sm">Temukan permata, hindari ranjau</p>
            </div>

            <style>{`
                @keyframes flipIn {
                    0% { transform: perspective(400px) rotateY(-90deg); opacity: 0; }
                    100% { transform: perspective(400px) rotateY(0deg); opacity: 1; }
                }
                .animate-flip {
                    animation: flipIn 0.3s ease-out forwards;
                }
                @keyframes pop {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop {
                    animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes slideDownHeader {
                    from { transform: translateY(-100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <div className="flex-1 px-4 max-w-sm mx-auto w-full">
                
                {/* IN-GAME TOP BAR */}
                {gameState !== 'idle' && (
                    <div className="bg-white rounded-2xl p-3 mb-3 shadow-sm border border-emerald-100 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 tracking-wider">REWARD SAAT INI</span>
                            <div className="flex items-center gap-1 text-amber-500 font-black text-lg">
                                <IconCoin className="w-5 h-5"/>
                                <span>{formatNum(Math.floor(wager * currentMultiplier))}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end text-right">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider">M. SAAT INI</span>
                                <span className="text-xs font-black text-emerald-600">{currentMultiplier.toFixed(2)}x</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider">M. BERIKUTNYA</span>
                                <span className="text-xs font-black text-gray-600">{nextMultiplier.toFixed(2)}x</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOARD */}
                <div className="bg-white rounded-3xl p-4 mb-3 shadow-sm border border-gray-100 relative overflow-hidden">
                    {/* Banner Overlay for Result */}
                    {showBanner && gameState === 'result' && (
                        <div className={\`absolute top-0 left-0 right-0 py-2.5 px-4 z-20 flex flex-col items-center justify-center shadow-md border-b backdrop-blur-md \${
                            resultType === 'win' ? 'bg-emerald-500/95 border-emerald-600 text-white' : 'bg-rose-500/95 border-rose-600 text-white'
                        }\`} style={{ animation: 'slideDownHeader 0.4s ease-out' }}>
                            <span className="text-sm font-black flex items-center gap-2">
                                {resultType === 'win' ? '✔ Cash Out Berhasil' : '💥 Terkena Ranjau'}
                            </span>
                            <span className="text-[11px] font-bold opacity-90 mt-0.5">
                                {resultType === 'win' ? \`+\${formatNum(winAmountDisplay)} Koin\` : 'Taruhan Hangus'}
                            </span>
                        </div>
                    )}

                    {gameState !== 'idle' && (
                        <div className="flex justify-between items-center mb-3 px-1 mt-1">
                            <span className="text-xs font-bold text-gray-500">Aman: <span className="text-emerald-500 font-black">{openedCount}/{safeCells}</span></span>
                            <span className="text-xs font-bold text-gray-500">Tersisa: <span className="text-gray-700 font-black">{remainingSafe}</span></span>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-3 relative z-10">
                        {grid.map((cell, i) => (
                            <button 
                                key={i}
                                disabled={gameState !== 'playing' || cell.revealed}
                                onClick={() => handleCellClick(i)}
                                className={\`relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 transform outline-none \${
                                    !cell.revealed ? 
                                        (gameState === 'playing' ? 
                                            \`bg-emerald-50 shadow-[0_4px_0_#d1fae5] border-2 border-emerald-100 cursor-pointer hover:bg-emerald-100 active:translate-y-1 active:shadow-[0_0px_0_#d1fae5] \${animatingCell === i ? 'scale-95' : ''}\` : 
                                            'bg-gray-50 shadow-[0_4px_0_#f3f4f6] border-2 border-gray-100 cursor-default') : 
                                    (cell.type === 'bomb' ? 
                                        'bg-rose-50 border-2 border-rose-200 shadow-inner' : 
                                        'bg-emerald-100 border-2 border-emerald-200 shadow-inner')
                                }\`}
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    {cell.revealed && (
                                        cell.type === 'bomb' ? 
                                        <IconBomb className={\`w-10 h-10 text-rose-500 drop-shadow-sm animate-flip\`} /> : 
                                        <IconCoin className="w-10 h-10 drop-shadow-sm animate-pop" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTROLS (Idle) */}
                {gameState === 'idle' && (
                    <div className="w-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 animate-[fadeIn_0.3s_ease-out]">
                        <div className="p-4 flex flex-col">
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-gray-400 tracking-wider">TARUHAN</span>
                                    <span className="text-xs font-black flex items-center gap-1 text-amber-500 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                                        <IconCoin className="w-3.5 h-3.5"/> {formatNum(profile.coins || 0)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {BET_OPTIONS.map(b => (
                                        <button 
                                            key={b}
                                            onClick={() => setWager(b)}
                                            className={\`py-2 rounded-xl text-xs font-black transition-all \${
                                                wager === b 
                                                    ? 'bg-amber-400 text-white shadow-sm ring-2 ring-amber-400 ring-offset-1' 
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                            }\`}
                                        >
                                            {formatNum(b)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-5">
                                <span className="text-[10px] font-black text-gray-400 tracking-wider block mb-2">JUMLAH RANJAU</span>
                                <div className="grid grid-cols-7 gap-1">
                                    {BOMB_OPTIONS.map(b => (
                                        <button 
                                            key={b}
                                            onClick={() => setBombCount(b)}
                                            className={\`py-1.5 rounded-lg text-xs font-black transition-all \${
                                                bombCount === b 
                                                    ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-500 ring-offset-1' 
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                            }\`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={startGame}
                                disabled={(profile.coins || 0) < wager}
                                className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-black text-base shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-[0_0px_0_#059669] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all tracking-wide"
                            >
                                MULAI MAIN
                            </button>
                        </div>
                    </div>
                )}

                {/* CONTROLS (Playing) */}
                {gameState === 'playing' && (
                    <div className="w-full animate-[fadeIn_0.3s_ease-out]">
                        <button 
                            onClick={() => cashout()}
                            disabled={openedCount === 0 || (openedCount < safeCells && dailyCashouts >= 3)}
                            className={\`w-full py-4 rounded-2xl text-white font-black text-base transition-all flex flex-col items-center justify-center relative \${
                                openedCount === 0 ? 'bg-gray-300 shadow-[0_4px_0_#9ca3af] cursor-not-allowed opacity-80' : 
                                'bg-amber-400 shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-[0_0px_0_#d97706]'
                            } \${(openedCount < safeCells && dailyCashouts >= 3) ? 'opacity-50 translate-y-0 shadow-none' : ''}\`}
                        >
                            <div className="flex flex-col items-center gap-0.5">
                                {openedCount < safeCells && dailyCashouts >= 3 ? (
                                    <>
                                        <span className="text-sm">Batas Cash Out Harian Tercapai (3/3)</span>
                                        <span className="text-[10px] font-bold text-amber-100">{timeLeftToReset}</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <IconCoin className="w-5 h-5"/> 
                                            <span className="text-lg">AMBIL ({formatNum(Math.floor(wager * currentMultiplier))})</span>
                                        </div>
                                        {openedCount > 0 && openedCount < safeCells && dailyCashouts < 3 && (
                                            <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider mt-1">Sisa Cashout Harian: {3 - dailyCashouts}</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                )}

                {/* CONTROLS (Result) */}
                {gameState === 'result' && (
                    <div className="w-full animate-[fadeIn_0.3s_ease-out]">
                        <button 
                            onClick={resetGame}
                            className="w-full py-4 rounded-2xl bg-indigo-500 text-white font-black text-base shadow-[0_4px_0_#4f46e5] active:translate-y-1 active:shadow-[0_0px_0_#4f46e5] transition-all tracking-wide"
                        >
                            MAIN LAGI
                        </button>
                    </div>
                )}
                
                {/* STATS ACCORDION */}
                {gameState === 'idle' && (
                    <div className="mt-4">
                        <button onClick={() => setStatsOpen(!statsOpen)} className="w-full pt-1.5 pb-2 rounded-xl border border-gray-100 flex items-center justify-center gap-1 text-[9px] font-black text-gray-400 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                            STATISTIK MINES {statsOpen ? <IconChevronUp className="w-3 h-3"/> : <IconChevronDown className="w-3 h-3"/>}
                        </button>
                        
                        {statsOpen && (
                            <div className="w-full p-4 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out] text-left bg-white rounded-xl border border-gray-100 shadow-sm mt-2">
                                {/* Summary Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Total Ronde</span>
                                        <span className="text-xs font-black text-gray-700">{formatNum(stats.rounds)}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Win Rate</span>
                                        <span className="text-xs font-black text-gray-700">{stats.rounds > 0 ? Math.floor((stats.wins / stats.rounds) * 100) : 0}%</span>
                                    </div>
                                    <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-50 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Total Menang</span>
                                        <span className="text-xs font-black text-emerald-600">{formatNum(stats.wins)}</span>
                                    </div>
                                    <div className="bg-rose-50/50 rounded-xl p-2.5 border border-rose-50 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Total Kalah</span>
                                        <span className="text-xs font-black text-rose-500">{formatNum(stats.losses)}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Total Taruhan</span>
                                        <span className="text-xs font-black text-gray-700 flex items-center gap-1">{formatNum(stats.totalWagered)}</span>
                                    </div>
                                    <div className="bg-amber-50/50 rounded-xl p-2.5 border border-amber-100 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-gray-500">Max Menang</span>
                                        <span className="text-xs font-black text-amber-600 flex items-center gap-1">{formatNum(stats.maxWin)}</span>
                                    </div>
                                </div>

                                {/* Total Profit Full Width */}
                                <div className={\`rounded-xl p-3 border flex flex-col items-center justify-center text-center \${stats.profit > 0 ? 'bg-emerald-50/50 border-emerald-100' : stats.profit < 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-50 border-gray-100'}\`}>
                                    <span className="text-[10px] font-bold text-gray-500 mb-0.5">Total Profit</span>
                                    <span className={\`text-base font-black flex items-center gap-1 \${stats.profit > 0 ? 'text-emerald-600' : stats.profit < 0 ? 'text-rose-600' : 'text-gray-700'}\`}>
                                        {stats.profit > 0 ? '+' : ''}{formatNum(stats.profit)} <IconCoin className="w-4 h-4 text-amber-500"/>
                                    </span>
                                </div>

                                {/* Kemenangan Terbaru */}
                                <div className="flex flex-col mt-1">
                                    <span className="text-[10px] font-black text-gray-800 mb-2 tracking-wide px-1">KEMENANGAN TERBARU</span>
                                    <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scroll pr-1 pb-1 overscroll-contain">
                                        {(!stats.history || stats.history.length === 0) ? (
                                            <div className="text-xs text-gray-400 text-center py-4 font-medium bg-gray-50 rounded-xl border border-gray-100">Belum ada riwayat kemenangan.</div>
                                        ) : (
                                            stats.history.map((res, i) => (
                                                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm shrink-0">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs font-black text-gray-700 uppercase tracking-tight">RONDE LALU</span>
                                                    </div>
                                                    <div className={\`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border \${res === 'win' ? 'bg-emerald-50 border-emerald-100/50 text-emerald-600' : 'bg-rose-50 border-rose-100/50 text-rose-600'}\`}>
                                                        <span className="text-xs font-black">{res === 'win' ? 'MENANG' : 'KALAH'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
`;

content = content.substring(0, startIndex) + replacement + '\n\n' + content.substring(endIndex);
fs.writeFileSync(file, content);
console.log('Mines UX refactored!');

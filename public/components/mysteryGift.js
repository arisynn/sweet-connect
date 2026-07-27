const DiceGacha = ({ profile, onOpenComplete, opening, setOpening }) => {
    const { useState, useEffect, useRef } = React;
    const formatNum = window.formatNumber || (n => n);
    
    // Core states
    const [phase, setPhase] = useState('betting'); // betting, rolling, result
    const [timeLeft, setTimeLeft] = useState(15);
    
    // Betting states
    const [selectedChip, setSelectedChip] = useState(5);
    const [bets, setBets] = useState({});
    const [lastBets, setLastBets] = useState({});
    
    // Dice & Animation states
    const [diceValues, setDiceValues] = useState([1, 1, 1]);
    const [rollingValues, setRollingValues] = useState([1, 1, 1]);
    const [highlightedKeys, setHighlightedKeys] = useState([]);
    const [resultMessage, setResultMessage] = useState(null);
    const [feedbackMsg, setFeedbackMsg] = useState(null);
    const [statsOpen, setStatsOpen] = useState(false);

    const userGems = profile.gems || 0;
    const defaultDiceStats = { rounds: 0, wins: 0, losses: 0, totalWagered: 0, totalReturned: 0, profit: 0, biggestWin: 0, recentWins: [] };
    const diceStats = profile.diceStats || defaultDiceStats;
    
    // Refs for lifecycle
    const timerRef = useRef(null);
    const isMounted = useRef(true);
    const profileRef = useRef(profile);
    const betsRef = useRef(bets);
    const phaseRef = useRef(phase);
    
    useEffect(() => { profileRef.current = profile; }, [profile]);
    useEffect(() => { betsRef.current = bets; }, [bets]);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    
    const PAYOUTS = {
        SMALL: 2, BIG: 2, ODD: 2, EVEN: 2, TRIPLE: 25,
        TOTAL_4: 50, TOTAL_5: 18, TOTAL_6: 14, TOTAL_7: 12, TOTAL_8: 8, TOTAL_9: 6, TOTAL_10: 6,
        TOTAL_11: 6, TOTAL_12: 6, TOTAL_13: 8, TOTAL_14: 12, TOTAL_15: 14, TOTAL_16: 18, TOTAL_17: 50
    };
    
    const PAYOUTS_LABELS = {
        SMALL: 'KECIL', BIG: 'BESAR', ODD: 'GANJIL', EVEN: 'GENAP', TRIPLE: 'TRIPLE'
    };
    const getBetLabel = (k) => k.startsWith('TOTAL_') ? `TOTAL ${k.split('_')[1]}` : PAYOUTS_LABELS[k] || k;

    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

    useEffect(() => {
        isMounted.current = true;
        startBettingPhase();
        return () => {
            isMounted.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
            setOpening(false);
        };
    }, []);

    const startBettingPhase = () => {
        setPhase('betting');
        setTimeLeft(15);
        setHighlightedKeys([]);
        setResultMessage(null);
        
        timerRef.current = setInterval(() => {
            if (!isMounted.current) return;
            setTimeLeft(prev => {
                if (prev === 6) {
                    setTimeout(() => { if (isMounted.current) startRollingPhase() }, 0);
                    return 5;
                }
                if (prev === 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const startRollingPhase = () => {
        setPhase('rolling');
        setOpening(true);
        
        if (typeof AudioEngine !== 'undefined') AudioEngine.spin();
        
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2 + d3;
        const isTriple = (d1 === d2 && d2 === d3);
        
        setDiceValues([d1, d2, d3]);
        
        let rolls = 0;
        const rollInterval = setInterval(() => {
            if (!isMounted.current) {
                clearInterval(rollInterval);
                return;
            }
            setRollingValues([
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ]);
            rolls++;
            if (rolls > 35) { // ~3.5 seconds
                clearInterval(rollInterval);
            }
        }, 100);
        
        setTimeout(() => {
            clearInterval(rollInterval);
            if (!isMounted.current) return;
            processResult(d1, d2, d3, total, isTriple);
        }, 4000);
    };

    const processResult = (d1, d2, d3, total, isTriple) => {
        setPhase('result');
        setOpening(false);
        
        const currentBets = betsRef.current;
        let wonKeys = [];
        if (isTriple) wonKeys.push('TRIPLE');
        if (!isTriple && total >= 4 && total <= 10) wonKeys.push('SMALL');
        if (!isTriple && total >= 11 && total <= 17) wonKeys.push('BIG');
        if (!isTriple && total % 2 !== 0) wonKeys.push('ODD');
        if (!isTriple && total % 2 === 0) wonKeys.push('EVEN');
        wonKeys.push(`TOTAL_${total}`);
        
        setHighlightedKeys(wonKeys);
        
        let totalWin = 0;
        let totalStake = 0;
        
        for (const [key, amount] of Object.entries(currentBets)) {
            totalStake += amount;
            if (wonKeys.includes(key)) {
                totalWin += amount * PAYOUTS[key];
            }
        }
        
        let tempProfile = { ...profileRef.current };
        const netDifference = totalWin - totalStake;
        
        let newStats = { ...(tempProfile.diceStats || defaultDiceStats) };
        if (totalStake > 0) {
            newStats.rounds += 1;
            newStats.totalWagered += totalStake;
            newStats.totalReturned += totalWin;
            newStats.profit += netDifference;
            
            if (netDifference > 0) {
                newStats.wins += 1;
                if (netDifference > newStats.biggestWin) newStats.biggestWin = netDifference;
                
                const winLabels = Object.keys(currentBets).filter(k => wonKeys.includes(k)).map(getBetLabel).join(' + ');
                newStats.recentWins = [{
                    timestamp: Date.now(),
                    total: total,
                    bets: winLabels,
                    profit: netDifference
                }, ...(newStats.recentWins || [])].slice(0, 15);
            } else {
                newStats.losses += 1;
            }
        }
        tempProfile.diceStats = newStats;
        
        if (netDifference !== 0) {
            tempProfile.gems = (tempProfile.gems || 0) + netDifference;
        }
        onOpenComplete(tempProfile, netDifference > 0 ? netDifference : 0);
        
        if (totalWin > 0) {
            if (typeof AudioEngine !== 'undefined') AudioEngine.uiReward();
            setResultMessage({ text: `TOTAL ${total} • MENANG +${totalWin} GEM`, type: 'win' });
        } else if (totalStake > 0) {
            setResultMessage({ text: `TOTAL ${total} • RUGI -${totalStake} GEM`, type: 'lose' });
        } else {
            setResultMessage({ text: `TOTAL ${total}`, type: 'neutral' });
        }
        
        setLastBets(Object.keys(currentBets).length > 0 ? { ...currentBets } : {});
        
        setTimeout(() => {
            if (!isMounted.current) return;
            setBets({});
            startBettingPhase();
        }, 2000);
    };
    
    const showFeedback = (msg) => {
        setFeedbackMsg(msg);
        setTimeout(() => {
            if(isMounted.current) setFeedbackMsg(null);
        }, 1000);
    };

    const placeBet = (key) => {
        if (phase !== 'betting') {
            showFeedback('TARUHAN SUDAH DITUTUP');
            return;
        }
        if (userGems - totalBet < selectedChip) {
            showFeedback('GEM TIDAK CUKUP');
            return;
        }
        
        setBets(prev => {
            const current = prev[key] || 0;
            return { ...prev, [key]: current + selectedChip };
        });
        if (typeof AudioEngine !== 'undefined') AudioEngine.uiClick();
    };

    const clearBets = () => {
        if (phase !== 'betting') {
            showFeedback('TARUHAN SUDAH DITUTUP');
            return;
        }
        setBets({});
        if (typeof AudioEngine !== 'undefined') AudioEngine.uiClick();
    };
    
    const repeatBet = () => {
        if (phase !== 'betting') {
            showFeedback('TARUHAN SUDAH DITUTUP');
            return;
        }
        const lastTotal = Object.values(lastBets).reduce((a, b) => a + b, 0);
        if (lastTotal === 0) return;
        if (userGems - totalBet < lastTotal) {
            showFeedback('GEM TIDAK CUKUP');
            return;
        }
        
        setBets(prev => {
            let newBets = { ...prev };
            for (const [k, v] of Object.entries(lastBets)) {
                newBets[k] = (newBets[k] || 0) + v;
            }
            return newBets;
        });
        if (typeof AudioEngine !== 'undefined') AudioEngine.uiClick();
    };

    const renderPip = (num) => {
        const dot = <div className="w-2.5 h-2.5 bg-gray-800 rounded-full shadow-inner"></div>;
        const layouts = {
            1: <div className="flex w-full h-full items-center justify-center">{dot}</div>,
            2: <div className="flex w-full h-full items-center justify-center gap-2 rotate-45">{dot}{dot}</div>,
            3: <div className="flex w-full h-full items-center justify-center gap-1.5 rotate-45">{dot}{dot}{dot}</div>,
            4: <div className="grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-full p-2 place-items-center">{dot}{dot}{dot}{dot}</div>,
            5: <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-2 place-items-center">{dot}<div></div>{dot}<div></div>{dot}<div></div>{dot}<div></div>{dot}</div>,
            6: <div className="grid grid-cols-2 grid-rows-3 gap-y-1 gap-x-1.5 w-full h-full p-2 place-items-center">{dot}{dot}{dot}{dot}{dot}{dot}</div>
        };
        return layouts[num] || layouts[1];
    };

    return (
        <div className="flex-1 w-full flex flex-col items-center z-10 px-2 sm:px-4 mt-2 mb-2 max-w-[400px] relative">
            <style>{`
                .dice-box {
                    width: 48px; height: 48px;
                    background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
                    border-radius: 12px;
                    box-shadow: inset -2px -2px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,1), 0 6px 12px rgba(0,0,0,0.15);
                    position: relative;
                }
                @keyframes dice-shake-1 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    20% { transform: translate(-2px, -3px) rotate(-10deg); }
                    40% { transform: translate(3px, 2px) rotate(10deg); }
                    60% { transform: translate(-3px, 3px) rotate(-10deg); }
                    80% { transform: translate(2px, -2px) rotate(10deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes dice-shake-2 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    20% { transform: translate(3px, 2px) rotate(15deg); }
                    40% { transform: translate(-2px, -3px) rotate(-5deg); }
                    60% { transform: translate(2px, 2px) rotate(10deg); }
                    80% { transform: translate(-2px, -2px) rotate(-15deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                @keyframes dice-shake-3 {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    20% { transform: translate(-3px, 2px) rotate(-15deg); }
                    40% { transform: translate(2px, -3px) rotate(15deg); }
                    60% { transform: translate(-2px, 3px) rotate(-5deg); }
                    80% { transform: translate(3px, -2px) rotate(10deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                .anim-shake-1 { animation: dice-shake-1 0.25s ease-in-out infinite; }
                .anim-shake-2 { animation: dice-shake-2 0.2s ease-in-out infinite; }
                .anim-shake-3 { animation: dice-shake-3 0.3s ease-in-out infinite; }
                
                @keyframes dice-bounce { 0% { transform: translateY(0) scale(1, 1); } 40% { transform: translateY(-10px) scale(1.05, 0.95); } 70% { transform: translateY(0) scale(0.95, 1.05); } 85% { transform: translateY(-3px) scale(1.02, 0.98); } 100% { transform: translateY(0) scale(1, 1); } }
                .anim-bounce { animation: dice-bounce 0.4s ease-out forwards; }

                .bet-btn { position: relative; transition: all 0.15s ease; overflow: hidden; }
                .bet-btn:active { transform: scale(0.96); }
                .highlight-win { box-shadow: 0 0 15px rgba(236, 72, 153, 0.6); border-color: #ec4899 !important; animation: pulse-win 1s infinite alternate; z-index: 10; }
                .dim-lose { opacity: 0.4; }
                @keyframes pulse-win { 0% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.4); } 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.8); } }
                .popup-gem { animation: popup-enter 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                @keyframes popup-enter { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
            
            {feedbackMsg && (
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 text-white px-4 py-2 rounded-xl text-xs font-bold z-50 animate-popup whitespace-nowrap shadow-lg">
                    {feedbackMsg}
                </div>
            )}
            
            {/* Countdown & Header */}
            <div className="w-full flex items-center justify-between bg-white px-3 sm:px-4 py-2 rounded-[1.2rem] shadow-sm border theme-border mb-2.5 h-[52px]">
                <div className="flex flex-col justify-center w-36">
                    <span className={`text-[10px] font-black tracking-wider ${phase === 'betting' && timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                        {phase === 'betting' ? 'TARUHAN DIBUKA' : 'TARUHAN DITUTUP'}
                    </span>
                </div>
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-lg border-2 shrink-0 ${phase === 'betting' ? (timeLeft <= 5 ? 'border-red-500 text-red-500 animate-bounce' : 'border-amber-400 text-amber-500') : 'border-gray-300 text-gray-400'}`}>
                    <span className="font-mono w-[22px] text-center">{timeLeft.toString().padStart(2, '0')}</span>
                </div>
            </div>

            {/* Arena Dadu */}
            <div className="w-full h-24 sm:h-28 bg-indigo-50 rounded-[2rem] border-4 border-indigo-100 flex flex-col items-center justify-center relative shadow-inner mb-2.5 overflow-hidden">
                <div className="flex gap-4 items-center justify-center dice-container">
                    {[0, 1, 2].map(i => {
                        const currentVal = phase === 'rolling' ? rollingValues[i] : diceValues[i];
                        return (
                            <div key={i} className={`dice-box bg-white ${phase === 'rolling' ? 'anim-shake-'+(i+1) : 'anim-bounce'}`}>
                                {renderPip(currentVal)}
                            </div>
                        );
                    })}
                </div>
                
                {/* Result Overlay inline */}
                {phase === 'result' && resultMessage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40 backdrop-blur-[2px] z-10 rounded-[1.8rem]">
                        <div className={`px-4 py-1.5 rounded-full shadow-lg font-black text-white text-sm border-2 animate-popup ${resultMessage.type === 'win' ? 'bg-pink-500 border-pink-400' : resultMessage.type === 'lose' ? 'bg-gray-600 border-gray-500' : 'bg-indigo-500 border-indigo-400'}`}>
                            {resultMessage.text}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Betting Board */}
            <div className="w-full flex flex-col gap-1.5 mb-2.5">
                {/* Small/Big, Odd/Even */}
                <div className="grid grid-cols-2 gap-1.5">
                    {[
                        { k: 'SMALL', n: 'KECIL', s: '4-10', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
                        { k: 'BIG', n: 'BESAR', s: '11-17', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
                        { k: 'ODD', n: 'GANJIL', s: '×2', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
                        { k: 'EVEN', n: 'GENAP', s: '×2', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' }
                    ].map(b => (
                        <button key={b.k} onClick={() => placeBet(b.k)} disabled={phase !== 'betting'} className={`bet-btn relative flex flex-col items-center justify-center p-2 rounded-xl border-2 ${b.bg} ${b.border} ${phase === 'result' && highlightedKeys.includes(b.k) ? 'highlight-win' : phase === 'result' ? 'dim-lose' : ''}`}>
                            <span className={`font-black text-sm ${b.text}`}>{b.n}</span>
                            <div className="flex gap-1 items-center mt-0.5">
                                {b.s !== '×2' && <span className="text-[9px] font-bold text-gray-400">{b.s}</span>}
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md bg-white ${b.text}`}>×2</span>
                            </div>
                            
                            {bets[b.k] > 0 && (
                                <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center popup-gem z-10 border-2 border-pink-300 shadow-inner">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className={`font-black text-xs ${b.text}`}>{b.n}</span>
                                        <span className="text-[8px] font-black text-white bg-gray-400 px-1 rounded-sm">×2</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                                       <IconGem className="w-3 h-3 text-pink-500" />
                                       <span className="text-[11px] font-black text-pink-700">{bets[b.k]}</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Total 4-17 */}
                <div className="w-full bg-white rounded-xl border border-gray-200 p-1.5 relative mt-1">
                    <div className="text-[7px] font-black text-gray-400 tracking-widest text-center mb-1 absolute -top-[7px] bg-white px-2 left-1/2 -translate-x-1/2">TOTAL DADU</div>
                    <div className="grid grid-cols-7 gap-1">
                        {[4,5,6,7,8,9,10, 11,12,13,14,15,16,17].map(num => {
                            const k = `TOTAL_${num}`;
                            return (
                                <button key={k} onClick={() => placeBet(k)} disabled={phase !== 'betting'} className={`bet-btn relative flex flex-col items-center justify-center py-1 rounded-lg border bg-orange-50 border-orange-100 ${phase === 'result' && highlightedKeys.includes(k) ? 'highlight-win' : phase === 'result' ? 'dim-lose' : ''}`}>
                                    <span className="font-black text-[11px] sm:text-[12px] text-orange-600 leading-none mb-0.5">{num}</span>
                                    <span className="text-[7px] sm:text-[8px] font-bold text-orange-400 leading-none">×{PAYOUTS[k]}</span>
                                    
                                    {bets[k] > 0 && (
                                        <div className="absolute inset-0 bg-orange-50 rounded-lg flex flex-col items-center justify-center popup-gem z-10 border border-pink-300">
                                            <span className="text-[11px] sm:text-[12px] font-black text-orange-600 leading-none mb-0.5">{num}</span>
                                            <div className="flex items-center gap-0.5 bg-white px-1 rounded shadow-sm border border-pink-100">
                                               <IconGem className="w-2 h-2 text-pink-500" />
                                               <span className="text-[8px] font-black text-pink-600">{bets[k]}</span>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Triple */}
                <button onClick={() => placeBet('TRIPLE')} disabled={phase !== 'betting'} className={`bet-btn relative w-full py-1.5 rounded-xl border-2 bg-amber-50 border-amber-200 flex items-center justify-center gap-2 mt-1 ${phase === 'result' && highlightedKeys.includes('TRIPLE') ? 'highlight-win' : phase === 'result' ? 'dim-lose' : ''}`}>
                    <span className="font-black text-xs sm:text-sm text-amber-600">TRIPLE (SEMUA SAMA)</span>
                    <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded-md text-amber-500">×25</span>
                    
                    {bets['TRIPLE'] > 0 && (
                        <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center popup-gem z-10 border-2 border-amber-300 shadow-inner">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="font-black text-xs sm:text-sm text-amber-600">TRIPLE (SEMUA SAMA)</span>
                                <span className="text-[8px] font-black text-white bg-amber-400 px-1 rounded-sm">×25</span>
                            </div>
                            <div className="flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200">
                               <IconGem className="w-3 h-3 text-pink-500" />
                               <span className="text-[11px] font-black text-pink-700">{bets['TRIPLE']}</span>
                            </div>
                        </div>
                    )}
                </button>
            </div>

            {/* Chips */}
            <div className="w-full flex flex-col items-center mb-2.5 mt-1">
                <div className="text-[8px] font-black text-gray-400 tracking-widest mb-1.5">PILIH CHIP GEM</div>
                <div className="flex items-center gap-2">
                    {[2, 5, 10, 25, 50].map(val => (
                        <button 
                            key={val} 
                            onClick={() => setSelectedChip(val)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-black text-[11px] sm:text-xs flex items-center justify-center border-2 transition-all ${selectedChip === val ? 'scale-110 shadow-md z-10 ' + (val===2?'border-gray-400 bg-white text-gray-700' : val===5?'border-emerald-400 bg-emerald-50 text-emerald-600' : val===10?'border-sky-400 bg-sky-50 text-sky-600' : val===25?'border-purple-400 bg-purple-50 text-purple-600' : 'border-pink-400 bg-pink-50 text-pink-600') : 'scale-100 border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                        >
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-dashed ${selectedChip === val ? 'border-current opacity-50' : 'border-gray-200'}`}>
                                {val}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Actions w/ Accordion */}
            <div className="w-full flex flex-col bg-white px-3 py-2 rounded-2xl shadow-sm border theme-border overflow-hidden transition-all duration-300">
                <div className="w-full flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 tracking-wider">TOTAL TARUHAN</span>
                        <div className="flex items-center gap-1">
                            <IconGem className="w-4 h-4 text-pink-500"/>
                            <span className="font-black text-pink-600 text-sm">{totalBet}</span>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        <button onClick={clearBets} disabled={phase !== 'betting' || totalBet === 0} className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-[10px] font-bold active:scale-95 transition-transform disabled:opacity-50">
                            HAPUS
                        </button>
                        <button onClick={repeatBet} disabled={phase !== 'betting' || Object.keys(lastBets).length === 0} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1 text-[10px] font-bold active:scale-95 transition-transform disabled:opacity-50">
                            <IconRefresh className="w-3 h-3"/> ULANGI
                        </button>
                    </div>
                </div>
                
                <button onClick={() => setStatsOpen(!statsOpen)} className="w-full mt-2 pt-2 border-t border-gray-100 flex items-center justify-center gap-1 text-[9px] font-black text-gray-400 active:bg-gray-50 rounded-b-lg">
                    STATISTIK DICE {statsOpen ? <IconChevronUp className="w-3 h-3"/> : <IconChevronDown className="w-3 h-3"/>}
                </button>
                
                {statsOpen && (
                    <div className="w-full mt-3 flex flex-col gap-3 pb-2 animate-popup">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-gray-400">Total Ronde</span>
                                <span className="text-xs font-black text-gray-700">{formatNum(diceStats.rounds)}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-gray-400">Win Rate</span>
                                <span className="text-xs font-black text-gray-700">{diceStats.rounds > 0 ? Math.round((diceStats.wins/diceStats.rounds)*100) : 0}%</span>
                            </div>
                            <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-emerald-400">Total Menang</span>
                                <span className="text-xs font-black text-emerald-600">{formatNum(diceStats.wins)}</span>
                            </div>
                            <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-rose-400">Total Kalah</span>
                                <span className="text-xs font-black text-rose-600">{formatNum(diceStats.losses)}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-gray-400">Total Taruhan</span>
                                <span className="text-xs font-black text-gray-700">{formatNum(diceStats.totalWagered)}</span>
                            </div>
                            <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-amber-500">Max Menang</span>
                                <span className="text-xs font-black text-amber-600">+{formatNum(diceStats.biggestWin)}</span>
                            </div>
                            <div className={`col-span-2 p-2 rounded-lg border flex flex-col items-center ${diceStats.profit >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                                <span className={`text-[8px] font-bold ${diceStats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Total Profit</span>
                                <span className={`text-sm font-black ${diceStats.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{diceStats.profit > 0 ? '+' : ''}{formatNum(diceStats.profit)} Gem</span>
                            </div>
                        </div>
                        
                        <div className="text-[9px] font-black text-gray-400 tracking-wider mt-2 mb-1 text-center">KEMENANGAN TERBARU</div>
                        <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto custom-scroll pr-1">
                            {diceStats.recentWins.map((w, i) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="flex flex-col w-[60%]">
                                        <span className="text-[10px] font-black text-gray-600 truncate">{w.bets}</span>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-[8px] font-bold text-gray-400 bg-white px-1 py-0.5 rounded border border-gray-100">TOTAL {w.total}</span>
                                            <span className="text-[8px] font-bold text-gray-400">{new Date(w.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-emerald-500">+{formatNum(w.profit)} Gem</span>
                                </div>
                            ))}
                            {(!diceStats.recentWins || diceStats.recentWins.length === 0) && (
                                <div className="text-xs text-gray-400 text-center py-2">Belum ada kemenangan</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
        </div>
    );
};

const MagicWheelGacha = ({ profile, opening, setOpening, setShowPrizePool, currentPrizesCoin, getIconComponent, AudioEngine, processReward, cost1x, cost10x, canUseVoucher1x, canUseVoucher10x, costCurrency }) => {
    const { useState, useEffect, useRef } = React;
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    
    // Assign consistent colors based on category
    const categoryColors = {
        coins: '#fef3c7', // amber-100
        gems: '#fce7f3', // pink-100
        hints: '#e0f2fe', // sky-100
        shuffles: '#d1fae5', // emerald-100
    };
    
    const numSegments = 20;
    const anglePerSegment = 360 / numSegments;

    const spin = (times) => {
        const vouchers = profile.gacha_vouchers || 0;
        const canUseVoucher = vouchers >= times;
        const costType = canUseVoucher ? 'gacha_vouchers' : 'coins';
        const cost = canUseVoucher ? times : (times === 1 ? cost1x : cost10x);
        
        if ((profile[costType] || 0) < cost || opening || isSpinning) return;
        
        setOpening(true);
        setIsSpinning(true);
        if (AudioEngine) AudioEngine.spin();
        
        if (times === 1) {
            const prizeIndex = Math.floor(Math.random() * 20);
            const finalPrize = currentPrizesCoin[prizeIndex];
            
            // To bring segment to top:
            // Calculate target rotation to make the center of prizeIndex segment stop at the top (0 degrees).
            // We want it perfectly centered, so we don't add random offsets.
            const targetRotation = rotation + (360 * 5) + (360 - (prizeIndex * anglePerSegment)) - (rotation % 360);
            
            setRotation(targetRotation);
            
            setTimeout(() => {
                setIsSpinning(false);
                setOpening(false);
                if (AudioEngine) AudioEngine.uiReward();
                processReward(times, finalPrize, costType, cost, 'coin', [finalPrize]);
            }, 3500); // 3.5s animation
        } else {
            // 10x spin
            const tenPrizes = [];
            for (let i = 0; i < 10; i++) {
                const idx = Math.floor(Math.random() * 20);
                tenPrizes.push(currentPrizesCoin[idx]);
            }
            
            setRotation(prev => prev + 360 * 5);
            
            setTimeout(() => {
                setIsSpinning(false);
                setOpening(false);
                if (AudioEngine) AudioEngine.uiReward();
                processReward(times, null, costType, cost, 'coin', tenPrizes);
            }, 3500);
        }
    };

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };
    
    return (
        <div className="flex-1 w-full max-w-[320px] flex flex-col items-center z-10 px-4 mt-4">
            <h1 className="text-3xl font-black theme-text mb-2 tracking-wide">
                Gacha Hoki
            </h1>
            <p className="text-gray-600 text-xs font-medium mb-4 text-center bg-white/60 p-2 rounded-xl shadow-sm">
                Putar roda dan dapatkan hadiah acak seperti Koin, Hint, Gem, atau HP!
            </p>

            {/* Wheel Area */}
            <div className="relative mb-8 w-64 h-64 flex items-center justify-center">
                <style>{`
                    @keyframes pointer-tick {
                        0% { transform: rotate(0deg); }
                        50% { transform: rotate(-15deg); }
                        100% { transform: rotate(0deg); }
                    }
                    .animate-pointer-tick {
                        animation: pointer-tick 0.1s linear infinite;
                        transform-origin: top center;
                    }
                `}</style>
                {/* Pointer */}
                <div className={`absolute -top-3 z-20 flex flex-col items-center ${isSpinning ? 'animate-pointer-tick' : ''}`} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                    <div className="w-6 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-t-full" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
                    <div className="w-4 h-4 bg-red-700 rounded-full -mt-2"></div>
                </div>
                
                {/* Wheel Outer Border */}
                <div className="absolute inset-0 rounded-full border-[10px] border-amber-300 shadow-[0_0_20px_rgba(0,0,0,0.1),inset_0_0_10px_rgba(0,0,0,0.2)] z-10 pointer-events-none"></div>

                {/* The Wheel */}
                <div 
                    className="w-full h-full rounded-full overflow-hidden shadow-inner"
                    style={{ 
                        transform: `rotate(${rotation}deg)`, 
                        transitionDuration: isSpinning ? '3.5s' : '0s',
                        transitionTimingFunction: 'cubic-bezier(0.15, 0.85, 0.35, 1)',
                    }}
                >
                    <svg viewBox="-1 -1 2 2" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                        {currentPrizesCoin.map((prize, i) => {
                            const percent = 1 / numSegments;
                            const startPercent = (i - 0.5) * percent;
                            const endPercent = (i + 0.5) * percent;
                            
                            const [startX, startY] = getCoordinatesForPercent(startPercent);
                            const [endX, endY] = getCoordinatesForPercent(endPercent);
                            
                            const pathData = [
                                `M ${startX} ${startY}`,
                                `A 1 1 0 0 1 ${endX} ${endY}`,
                                `L 0 0`,
                            ].join(' ');
                            
                            return (
                                <path 
                                    key={i}
                                    d={pathData} 
                                    fill={categoryColors[prize.item]} 
                                    stroke="rgba(0,0,0,0.1)"
                                    strokeWidth="0.01"
                                />
                            );
                        })}
                    </svg>

                    {/* Icons and Text over slices */}
                    {currentPrizesCoin.map((prize, i) => {
                        const angle = i * anglePerSegment;
                        return (
                            <div 
                                key={i}
                                className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start pointer-events-none"
                                style={{ transform: `rotate(${angle}deg)` }}
                            >
                                <div className="mt-[10%] flex flex-col items-center justify-center transform -rotate-0">
                                    <div className={`w-5 h-5 ${prize.item === 'coins' ? 'text-amber-500' : prize.item === 'gems' ? 'text-pink-500' : prize.item === 'hints' ? 'text-sky-500' : 'text-emerald-500'}`}>
                                        {prize.icon}
                                    </div>
                                    <span className={`text-[9px] font-black mt-0.5 ${prize.item === 'coins' ? 'text-amber-700' : prize.item === 'gems' ? 'text-pink-700' : prize.item === 'hints' ? 'text-sky-700' : 'text-emerald-700'}`}>
                                        {prize.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    
                    {/* Inner Center Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-amber-400 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center">
                        <div className="w-4 h-4 bg-amber-200 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Spin Buttons */}
            <div className="flex gap-3 w-full mb-4">
                <button 
                    disabled={(profile[costCurrency] || 0) < cost1x && !canUseVoucher1x || opening} 
                    onClick={() => spin(1)}
                    className={`flex-1 ${canUseVoucher1x ? 'bg-sky-400 active:bg-sky-500' : 'bg-amber-400 active:bg-amber-500'} text-white p-3 rounded-2xl font-bold shadow-sm disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center gap-1 transition-colors`}
                >
                    <span className="text-sm tracking-wide">PUTAR 1x</span>
                    <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {canUseVoucher1x ? <IconGift className="w-3 h-3"/> : <IconCoin className="w-3 h-3"/>} {canUseVoucher1x ? 1 : cost1x}
                    </span>
                </button>
                <button 
                    disabled={(profile[costCurrency] || 0) < cost10x && !canUseVoucher10x || opening} 
                    onClick={() => spin(10)}
                    className={`flex-1 ${canUseVoucher10x ? 'bg-blue-500 active:bg-blue-600' : 'bg-orange-500 active:bg-orange-600'} text-white p-3 rounded-2xl font-bold shadow-sm disabled:opacity-50 disabled:grayscale flex flex-col items-center justify-center gap-1 transition-colors`}
                >
                    <span className="text-sm tracking-wide">PUTAR 10x</span>
                    <span className="text-[10px] bg-black/10 px-2 py-0.5 rounded-full flex items-center gap-1 text-white">
                        {canUseVoucher10x ? <IconGift className="w-3 h-3"/> : <IconCoin className="w-3 h-3"/>} {canUseVoucher10x ? 10 : cost10x}
                    </span>
                </button>
            </div>
            
            <button onClick={() => setShowPrizePool(true)} className="px-5 py-2.5 bg-white text-gray-600 rounded-xl text-xs font-bold shadow-sm border theme-border flex items-center justify-center gap-2 active:bg-gray-50 transition-colors mb-6">
                <IconSearch className="w-4 h-4"/> Lihat Daftar Hadiah
            </button>
        </div>
    );
};

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
    const [gachaMode, setGachaMode] = useState('dice'); // 'item' or 'theme'
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        if (wonPrize && gachaMode === 'item') {
            const timer = setTimeout(() => {
                setWonPrize(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [wonPrize, gachaMode]);

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

        if (opening) return;
        if (distance > minSwipeDistance) {
            // Swipe left
            if (gachaMode === 'dice') {
                AudioEngine.uiSwitchTab();
                setGachaMode('item');
            } else if (gachaMode === 'item') {
                AudioEngine.uiSwitchTab();
                setGachaMode('theme');
            }
        } else if (distance < -minSwipeDistance) {
            // Swipe right
            if (gachaMode === 'theme') {
                AudioEngine.uiSwitchTab();
                setGachaMode('item');
            } else if (gachaMode === 'item') {
                AudioEngine.uiSwitchTab();
                setGachaMode('dice');
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

    const currentPrizesCoin = [
        { id: 'c1000', label: '1000', type: 'item', item: 'coins', val: 1000, desc: 'Jackpot Koin!', iconName: 'IconCoin' },
        { id: 'gem50', label: '50', type: 'item', item: 'gems', val: 50, desc: 'Super Jackpot Gem!', iconName: 'IconGem' },
        { id: 'hint5', label: '5', type: 'item', item: 'hints', val: 5, desc: 'Banyak Hint!', iconName: 'IconSearch' },
        { id: 'shuffle5', label: '5', type: 'item', item: 'shuffles', val: 5, desc: 'Banyak Shuffle!', iconName: 'IconRefresh' },

        { id: 'c500', label: '500', type: 'item', item: 'coins', val: 500, desc: 'Balik modal!', iconName: 'IconCoin' },
        { id: 'gem25', label: '25', type: 'item', item: 'gems', val: 25, desc: 'Jackpot Gem!', iconName: 'IconGem' },
        { id: 'hint3', label: '3', type: 'item', item: 'hints', val: 3, desc: 'Lumayan Hint!', iconName: 'IconSearch' },
        { id: 'shuffle3', label: '3', type: 'item', item: 'shuffles', val: 3, desc: 'Lumayan Shuffle!', iconName: 'IconRefresh' },

        { id: 'c200', label: '200', type: 'item', item: 'coins', val: 200, desc: 'Koin balikan.', iconName: 'IconCoin' },
        { id: 'gem10', label: '10', type: 'item', item: 'gems', val: 10, desc: 'Banyak Gem!', iconName: 'IconGem' },
        { id: 'hint2', label: '2', type: 'item', item: 'hints', val: 2, desc: 'Ekstra Hint.', iconName: 'IconSearch' },
        { id: 'shuffle2', label: '2', type: 'item', item: 'shuffles', val: 2, desc: 'Ekstra Shuffle.', iconName: 'IconRefresh' },

        { id: 'c100', label: '100', type: 'item', item: 'coins', val: 100, desc: 'Koin hiburan.', iconName: 'IconCoin' },
        { id: 'gem5', label: '5', type: 'item', item: 'gems', val: 5, desc: 'Mantap dapat Gem!', iconName: 'IconGem' },
        { id: 'hint1', label: '1', type: 'item', item: 'hints', val: 1, desc: 'Satu Hint.', iconName: 'IconSearch' },
        { id: 'shuffle1', label: '1', type: 'item', item: 'shuffles', val: 1, desc: 'Satu Shuffle.', iconName: 'IconRefresh' },

        { id: 'c50', label: '50', type: 'item', item: 'coins', val: 50, desc: 'Koin kecil.', iconName: 'IconCoin' },
        { id: 'gem1', label: '1', type: 'item', item: 'gems', val: 1, desc: 'Satu Gem.', iconName: 'IconGem' },
        { id: 'hint1_2', label: '1', type: 'item', item: 'hints', val: 1, desc: 'Satu Hint.', iconName: 'IconSearch' },
        { id: 'shuffle1_2', label: '1', type: 'item', item: 'shuffles', val: 1, desc: 'Satu Shuffle.', iconName: 'IconRefresh' },
    ].map(p => ({ 
        ...p, 
        icon: getIconComponent(p.iconName), 
        name: p.item === 'coins' ? `${p.val} Koin` : p.item === 'gems' ? `${p.val} Gem` : p.item === 'hints' ? `${p.val} Hint` : `${p.val} Shuffle` 
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

    const processReward = (times, firstPrize, costType, cost, poolType, customPrizes = null) => {
        const updatedProfile = { ...profile, [costType]: (profile[costType] || 0) - cost };

        const getRandomFnWrapped = () => {
            const raw = getPrizeByRarity(poolType);
            return { ...raw, icon: getIconComponent(raw.iconName) };
        };

        if (times === 1) {
            let actualPrize = customPrizes ? { ...customPrizes[0] } : { ...firstPrize };
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
                let p = customPrizes ? customPrizes[i] : (i === 0 ? firstPrize : getRandomFnWrapped());
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
                <button disabled={opening} onClick={onClose} className="p-2 bg-white rounded-full disabled:opacity-50 text-gray-500 shadow-sm transition-colors"><IconChevronLeft /></button>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border theme-border">
                    <button disabled={opening} onClick={() => setGachaMode('dice')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${gachaMode === 'dice' ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>DICE</button>
                    <button disabled={opening} onClick={() => setGachaMode('item')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${gachaMode === 'item' ? 'bg-amber-400 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>ITEM</button>
                    <button disabled={opening} onClick={() => setGachaMode('theme')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${gachaMode === 'theme' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>TEMA</button>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {gachaMode === 'dice' && (
                        <div className="flex items-center justify-end gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                            <IconGem className="w-3 h-3 text-pink-500" /> {formatNumber ? formatNumber(profile.gems || 0) : (profile.gems || 0)}
                        </div>
                    )}
                    {gachaMode === 'item' && (
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-end gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                                <IconCoin className="w-3 h-3 text-amber-500" /> {formatNumber ? formatNumber(profile.coins) : profile.coins}
                            </div>
                            <div className="flex items-center justify-end gap-1 bg-white px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm text-gray-600">
                                <IconGift className="w-3 h-3 text-sky-500" /> {formatNumber ? formatNumber(profile.gacha_vouchers || 0) : (profile.gacha_vouchers || 0)}
                            </div>
                        </div>
                    )}
                    {gachaMode === 'theme' && (
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

            {gachaMode === 'dice' ? (
                <DiceGacha profile={profile} onOpenComplete={onOpenComplete} opening={opening} setOpening={setOpening} />
            ) : gachaMode === 'item' ? (
                <MagicWheelGacha 
                    profile={profile} 
                    opening={opening} 
                    setOpening={setOpening} 
                    setShowPrizePool={setShowPrizePool} 
                    currentPrizesCoin={currentPrizesCoin} 
                    getIconComponent={getIconComponent} 
                    AudioEngine={typeof AudioEngine !== 'undefined' ? AudioEngine : null} 
                    processReward={processReward} 
                    cost1x={cost1x} 
                    cost10x={cost10x} 
                    canUseVoucher1x={canUseVoucher1x} 
                    canUseVoucher10x={canUseVoucher10x} 
                    costCurrency={costCurrency} 
                />
            ) : (
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

            )}
            {/* Modals for Rewards */}
            {wonPrize && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-[110] p-4">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-[300px] text-center shadow-2xl modal-enter relative overflow-hidden border-2 theme-border">
                        <div className={`absolute top-0 inset-x-0 h-4 bg-gradient-to-r ${wonPrize.item === 'rainbow_candy' ? 'from-pink-400 to-purple-500' : 'from-yellow-400 to-amber-500'}`}></div>
                        <p className="text-gray-500 font-bold text-[10px] mb-3 uppercase tracking-widest mt-2">Selamat!</p>
                        <div className={`mx-auto w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl shadow-inner ${wonPrize.item === 'coins' ? 'bg-amber-50 text-amber-500' : wonPrize.item === 'gems' || wonPrize.item === 'rainbow_candy' ? 'bg-pink-50 text-pink-500' : wonPrize.item === 'hints' ? 'bg-sky-50 text-sky-500' : wonPrize.item === 'shuffles' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
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
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${prize.item === 'coins' ? 'bg-amber-100 text-amber-500 border border-amber-200' : prize.item === 'gems' || prize.item === 'rainbow_candy' ? 'bg-pink-100 text-pink-500 border border-pink-200' : prize.item === 'hints' ? 'bg-sky-100 text-sky-500 border border-sky-200' : prize.item === 'shuffles' ? 'bg-emerald-100 text-emerald-500 border border-emerald-200' : 'bg-amber-100 text-amber-500 border border-amber-200'}`}>
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
                        {gachaMode === 'item' ? (
                            ['coins', 'gems', 'hints', 'shuffles'].map(category => (
                                <div key={category} className="mb-2">
                                    <h3 className={`text-sm font-black mb-2 px-2 uppercase ${category === 'coins' ? 'text-amber-600' : category === 'gems' ? 'text-pink-600' : category === 'hints' ? 'text-sky-600' : 'text-emerald-600'}`}>
                                        {category === 'coins' ? 'Koin' : category === 'gems' ? 'Gem' : category === 'hints' ? 'Hint' : 'Shuffle'}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {activePrizes.filter(p => p.item === category).map((p, idx) => (
                                            <div key={idx} className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl border border-gray-100 shadow-sm text-center">
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-inner mb-2 ${category === 'coins' ? 'bg-amber-50 text-amber-500 border border-amber-100' : category === 'gems' ? 'bg-pink-50 text-pink-500 border border-pink-100' : category === 'hints' ? 'bg-sky-50 text-sky-500 border border-sky-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
                                                    {p.icon}
                                                </div>
                                                <span className="font-bold text-gray-800 text-xs">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            activePrizes.map((p, idx) => (
                                <div key={idx} className="flex flex-col bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-inner ${p.item === 'gems' || p.item === 'rainbow_candy' ? 'bg-pink-50 text-pink-600 border border-pink-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                            {p.icon}
                                        </div>
                                        <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium pl-[52px]">{p.desc}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
                    </div>
        </div>
    );};

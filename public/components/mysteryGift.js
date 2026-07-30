
const CasinoChip = ({ amount }) => (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 
        w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.6),0_1px_1px_rgba(0,0,0,0.3)] 
        flex items-center justify-center border-2 border-white bg-pink-500 popup-chip pointer-events-none">
        <div className="w-full h-full rounded-full border-[1.5px] border-dashed border-pink-200 flex flex-col items-center justify-center bg-pink-500">
            <span className="text-[10px] sm:text-[11px] font-black text-white leading-none drop-shadow-md">{amount}</span>
        </div>
    </div>
);

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
    const [revealedDice, setRevealedDice] = useState([false, false, false]);
    const [highlightedKeys, setHighlightedKeys] = useState([]);
    const [resultMessage, setResultMessage] = useState(null);
    const [feedbackMsg, setFeedbackMsg] = useState(null);
    const [statsOpen, setStatsOpen] = useState(false);

    const userGems = profile.gems || 0;
    const defaultDiceStats = { rounds: 0, wins: 0, losses: 0, totalWagered: 0, totalReturned: 0, profit: 0, biggestWin: 0, recentWins: [] };
    const diceStats = profile.diceStats || defaultDiceStats;
    
    // Refs for lifecycle
    const timerRef = useRef(null);
    const rollIntervalRef = useRef(null);
    const isMounted = useRef(true);
    const profileRef = useRef(profile);
    const betsRef = useRef(bets);
    const phaseRef = useRef(phase);
    
    
    useEffect(() => {
        if (phase === 'rolling') {
            if (timeLeft === 3) setRevealedDice([true, false, false]);
            if (timeLeft === 2) setRevealedDice([true, true, false]);
            if (timeLeft === 1) {
                setRevealedDice([true, true, true]);
                if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
            }
            if (timeLeft === 0) {
                const total = diceValues[0] + diceValues[1] + diceValues[2];
                const isTriple = (diceValues[0] === diceValues[1] && diceValues[1] === diceValues[2]);
                processResult(diceValues[0], diceValues[1], diceValues[2], total, isTriple);
            }
        }
    }, [timeLeft, phase, diceValues]);

    useEffect(() => { profileRef.current = profile; }, [profile]);
    useEffect(() => { betsRef.current = bets; }, [bets]);
    useEffect(() => { phaseRef.current = phase; }, [phase]);
    
    const PAYOUTS = {
        SMALL: 2, BIG: 2, ODD: 2, EVEN: 2, TRIPLE: 34,
        TOTAL_4: 65, TOTAL_5: 34, TOTAL_6: 20, TOTAL_7: 14, TOTAL_8: 10, TOTAL_9: 8, TOTAL_10: 7.5,
        TOTAL_11: 7.5, TOTAL_12: 8, TOTAL_13: 10, TOTAL_14: 14, TOTAL_15: 20, TOTAL_16: 34, TOTAL_17: 65
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
        setOpening(false);
        
        if (timerRef.current) clearInterval(timerRef.current);
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
        const currentBets = betsRef.current;
        const totalWager = Object.values(currentBets).reduce((a, b) => a + b, 0);
        setOpening(totalWager > 0);
        
        if (typeof AudioEngine !== 'undefined') AudioEngine.spin();
        
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2 + d3;
        const isTriple = (d1 === d2 && d2 === d3);
        
        setDiceValues([d1, d2, d3]);
        
        setRevealedDice([false, false, false]);
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = setInterval(() => {
            if (!isMounted.current) {
                clearInterval(rollIntervalRef.current);
                return;
            }
            setRollingValues([
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ]);
        }, 80);
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
                
                const winLabels = Object.keys(currentBets).filter(k => wonKeys.includes(k)).map(getBetLabel).join(', ');
                newStats.recentWins = [{
                    timestamp: Date.now(),
                    total: total,
                    dice: [d1, d2, d3],
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
            setResultMessage({ text: `MENANG +${totalWin}`, type: 'win' });
        } else if (totalStake > 0) {
            setResultMessage({ text: `RUGI -${totalStake}`, type: 'lose' });
        } else {
            setResultMessage({ text: '', type: 'neutral' });
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
        const dot = <div className="w-2.5 h-2.5 bg-gray-800 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"></div>;
        const layouts = {
            1: <div className="flex w-full h-full items-center justify-center">{dot}</div>,
            2: <div className="flex w-full h-full items-center justify-center gap-2 rotate-45">{dot}{dot}</div>,
            3: <div className="flex w-full h-full items-center justify-center gap-1.5 rotate-45">{dot}{dot}{dot}</div>,
            4: <div className="grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-full p-2.5 place-items-center">{dot}{dot}{dot}{dot}</div>,
            5: <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-2 place-items-center">{dot}<div></div>{dot}<div></div>{dot}<div></div>{dot}<div></div>{dot}</div>,
            6: <div className="grid grid-cols-2 grid-rows-3 gap-y-1 gap-x-1.5 w-full h-full p-2 place-items-center">{dot}{dot}{dot}{dot}{dot}{dot}</div>
        };
        return layouts[num] || layouts[1];
    };

    const MiniDice = ({ val }) => {
        const pips = [];
        if ([1, 3, 5].includes(val)) pips.push(4);
        if ([2, 3, 4, 5, 6].includes(val)) { pips.push(0, 8); }
        if ([4, 5, 6].includes(val)) { pips.push(2, 6); }
        if (val === 6) { pips.push(3, 5); }
        
        return (
            <div className="w-[18px] h-[18px] bg-white rounded-[3px] border border-gray-200 grid grid-cols-3 grid-rows-3 gap-[1px] p-[2px] shadow-sm">
                {[0,1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className={`w-full h-full rounded-full ${pips.includes(i) ? 'bg-gray-800' : ''}`}></div>
                ))}
            </div>
        );
    };

    const totalVal = diceValues[0] + diceValues[1] + diceValues[2];
    const isTriple = diceValues[0] === diceValues[1] && diceValues[1] === diceValues[2];
    const sizeLabel = isTriple ? 'TRIPLE' : (totalVal >= 11 ? 'BESAR' : 'KECIL');
    const oddEvenLabel = totalVal % 2 === 0 ? 'GENAP' : 'GANJIL';
    
    // Derived display time
    const displayTime = phase === 'result' ? 0 : timeLeft;
    const progressPercent = ((15 - displayTime) / 15) * 100;

    return (
        <div className="flex-1 w-full flex flex-col items-center z-10 px-2 sm:px-4 mt-2 mb-2 max-w-[400px] relative">
                                    <style>{`
                .dice-container { perspective: 800px; }
                .dice-cube-wrapper {
                    width: 56px; height: 56px;
                    position: relative;
                }
                .dice-cube {
                    width: 100%; height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .dice-face {
                    position: absolute;
                    width: 56px; height: 56px;
                    background: linear-gradient(135deg, #ffffff 0%, #f4f4f4 100%);
                    border-radius: 12px;
                    border: 1px solid #e5e5e5;
                    box-shadow: inset -2px -2px 6px rgba(0,0,0,0.05), inset 2px 2px 6px rgba(255,255,255,1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backface-visibility: hidden;
                }
                .dice-face.front  { transform: rotateY(0deg) translateZ(28px); }
                .dice-face.back   { transform: rotateY(180deg) translateZ(28px); }
                .dice-face.right  { transform: rotateY(90deg) translateZ(28px); }
                .dice-face.left   { transform: rotateY(-90deg) translateZ(28px); }
                .dice-face.top    { transform: rotateX(90deg) translateZ(28px); }
                .dice-face.bottom { transform: rotateX(-90deg) translateZ(28px); }
                
                @keyframes dice-roll-3d-1 {
                    0% { transform:  rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                    100% { transform:  rotateX(1080deg) rotateY(720deg) rotateZ(360deg); }
                }
                @keyframes dice-roll-3d-2 {
                    0% { transform:  rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                    100% { transform:  rotateX(-720deg) rotateY(1080deg) rotateZ(-360deg); }
                }
                @keyframes dice-roll-3d-3 {
                    0% { transform:  rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                    100% { transform:  rotateX(720deg) rotateY(-1080deg) rotateZ(720deg); }
                }
                .anim-roll-1 { animation: dice-roll-3d-1 1s linear infinite; }
                .anim-roll-2 { animation: dice-roll-3d-2 1.2s linear infinite; }
                .anim-roll-3 { animation: dice-roll-3d-3 0.9s linear infinite; }
                
                @keyframes dice-land { 
                    0% { transform: translateY(-5px); } 
                    50% { transform: translateY(1px); } 
                    100% { transform: translateY(0); } 
                }
                .anim-drop { animation: dice-land 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards; }

                .bet-btn { position: relative; transition: opacity 0.15s ease; overflow: hidden; }
                .bet-btn:active { transform: scale(0.97); }
                .highlight-win { box-shadow: 0 0 15px rgba(236, 72, 153, 0.6); border-color: #ec4899 !important; animation: pulse-win 1s infinite alternate; z-index: 10; }
                .dim-lose { opacity: 0.4; }
                @keyframes pulse-win { 0% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.4); } 100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.8); } }
                
                @keyframes popup-chip {
                    0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
                    60% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
                .popup-chip { animation: popup-chip 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                
                .popup-gem { animation: popup-enter 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                @keyframes popup-enter { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

                .shake-during-roll { animation: tiny-shake 0.2s linear infinite; }
                @keyframes tiny-shake { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-2px) rotate(-1deg); } 50% { transform: translateY(0) rotate(0deg); } 75% { transform: translateY(2px) rotate(1deg); } }
            `}</style>
            
            {feedbackMsg && (
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800/90 text-white px-4 py-2 rounded-xl text-xs font-bold z-50 animate-popup whitespace-nowrap shadow-lg">
                    {feedbackMsg}
                </div>
            )}
            
            {/* Timeline Countdown Header */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 px-3 py-2 mb-2 flex flex-col relative h-[52px] justify-center overflow-hidden">
                {/* Progress bar background */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-100 -translate-y-1/2 z-0 rounded-full">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-linear ${phase === 'betting' ? 'bg-emerald-400' : 'bg-orange-400'}`} 
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                
                <div className="flex justify-between items-center z-10 relative">
                    <div className="flex flex-col items-start bg-white pr-2">
                        <span className={`text-[9px] font-black tracking-wider ${phase === 'betting' ? 'text-emerald-500' : 'text-gray-400'}`}>
                            {phase === 'betting' ? 'TARUHAN DIBUKA' : 'TARUHAN DITUTUP'}
                        </span>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-white px-3">
                        <div className={`w-10 h-10 rounded-full border-[3px] flex flex-col items-center justify-center bg-white ${phase === 'betting' ? 'border-emerald-400 text-emerald-500' : 'border-orange-400 text-orange-500'}`}>
                            <span className="text-lg font-black leading-none">{displayTime}</span>
                            <span className="text-[6px] font-black leading-none mt-[1px]">DETIK</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white pl-2">
                        <div className="flex flex-col items-center">
                            <span className={`text-[7px] font-black ${timeLeft <= 5 ? 'text-orange-500' : 'text-gray-400'}`}>5 DETIK</span>
                            <div className={`w-2 h-2 rounded-full mt-0.5 ${timeLeft <= 5 ? 'bg-orange-400' : 'bg-gray-200'}`}></div>
                        </div>
                        <div className="w-3 h-[1px] bg-gray-200 mt-2"></div>
                        <div className="flex flex-col items-center">
                            <span className={`text-[7px] font-black ${phase === 'result' ? 'text-indigo-500' : 'text-gray-400'}`}>HASIL</span>
                            <div className={`w-2 h-2 rounded-full mt-0.5 ${phase === 'result' ? 'bg-indigo-400' : 'bg-gray-200'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Arena Dadu */}
            <div className="w-full bg-[#f8faff] rounded-2xl border border-indigo-50 px-2 py-4 mb-2 flex flex-col items-center justify-center relative shadow-sm min-h-[120px]">
                <div className="flex gap-4 items-center justify-center dice-container z-10 w-full h-[80px]">
                    {[0, 1, 2].map(i => {
                        const isRolling = phase === 'rolling' && !revealedDice[i];
                        const currentVal = isRolling ? rollingValues[i] : diceValues[i];
                        
                        // Map values to rotations so the correct face faces front
                        const getTransform = (val) => {
                            switch(val) {
                                case 1: return 'rotateX(0deg) rotateY(0deg)';
                                case 2: return 'rotateX(0deg) rotateY(180deg)';
                                case 3: return 'rotateX(0deg) rotateY(-90deg)';
                                case 4: return 'rotateX(0deg) rotateY(90deg)';
                                case 5: return 'rotateX(-90deg) rotateY(0deg)';
                                case 6: return 'rotateX(90deg) rotateY(0deg)';
                                default: return 'rotateX(0deg) rotateY(0deg)';
                            }
                        };
                        
                        return (
                            <div key={i} className={`dice-cube-wrapper ${revealedDice[i] ? 'anim-drop' : ''}`}>
                                <div 
                                    className={`dice-cube ${isRolling ? 'anim-roll-'+(i+1) : ''}`}
                                    style={!isRolling ? { transform: getTransform(currentVal) } : {}}
                                >
                                    <div className="dice-face front">{renderPip(1)}</div>
                                    <div className="dice-face back">{renderPip(2)}</div>
                                    <div className="dice-face right">{renderPip(3)}</div>
                                    <div className="dice-face left">{renderPip(4)}</div>
                                    <div className="dice-face top">{renderPip(5)}</div>
                                    <div className="dice-face bottom">{renderPip(6)}</div>
                                </div>
                                
                            </div>
                        );
                    })}
                </div>
                
                {/* Result Text Below */}
                <div className="h-8 mt-2 flex flex-col items-center justify-center">
                    {phase === 'result' && (
                        <div className="flex flex-col items-center animate-popup">
                            <span className="text-[10px] font-black text-gray-600 tracking-wider">
                                TOTAL {totalVal} • {sizeLabel} • {oddEvenLabel}
                            </span>
                            {resultMessage && resultMessage.type !== 'neutral' && (
                                <div className={`flex items-center gap-1 mt-0.5 ${resultMessage.type === 'win' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <span className="text-[11px] font-black">{resultMessage.text}</span>
                                    <IconGem className="w-3 h-3 text-pink-500"/>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>


            {/* Main Betting Board */}
            <div className="w-full flex flex-col gap-1.5 mb-2.5">
                {(() => {

                    return (
                        <>
                {/* Small/Big, Odd/Even */}
                <div className="grid grid-cols-2 gap-1.5">
                    {[
                        { k: 'SMALL', n: 'KECIL', s: '4-10', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
                        { k: 'BIG', n: 'BESAR', s: '11-17', bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
                        { k: 'ODD', n: 'GANJIL', s: '×2', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
                        { k: 'EVEN', n: 'GENAP', s: '×2', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' }
                    ].map(b => {
                        const hasBet = bets[b.k] > 0;
                        return (
                            <button 
                                key={b.k} 
                                onClick={() => placeBet(b.k)} 
                                disabled={phase !== 'betting'} 
                                className={`bet-btn relative flex flex-col items-center justify-center py-2 rounded-xl border shadow-sm ${b.bg} ${hasBet ? 'border-[2px] '+b.border : 'border-transparent'} ${phase === 'result' && highlightedKeys.includes(b.k) ? 'highlight-win' : phase === 'result' ? 'dim-lose' : ''} h-[64px]`}
                            >
                                <div className={`flex flex-col items-center relative z-0 ${hasBet ? 'opacity-40' : ''}`}>
                                    <span className={`font-black text-sm ${b.text}`}>{b.n}</span>
                                    <div className="flex gap-1 items-center mt-0.5">
                                        {b.s !== '×2' && <span className={`text-[9px] font-bold ${b.text}`}>{b.s}</span>}
                                        <span className={`text-[8px] font-black px-1 py-0.5 rounded-sm bg-white shadow-sm ${b.text}`}>×2</span>
                                    </div>
                                </div>
                                
                                {hasBet && <div className="absolute inset-0 bg-black/[0.04] rounded-xl pointer-events-none"></div>}
                                {hasBet && <CasinoChip amount={bets[b.k]} />}
                            </button>
                        );
                    })}
                </div>

                {/* Total 4-17 */}
                <div className="w-full bg-[#fffcf5] rounded-xl border border-orange-100 p-1.5 relative mt-1">
                    <div className="text-[7px] font-black text-gray-400 tracking-widest text-center mb-1 absolute -top-[7px] bg-white px-2 left-1/2 -translate-x-1/2 rounded-full border border-gray-100 z-10">TOTAL DADU</div>
                    <div className="grid grid-cols-7 gap-1 mt-1">
                        {[4,5,6,7,8,9,10, 11,12,13,14,15,16,17].map(num => {
                            const k = `TOTAL_${num}`;
                            const hasBet = bets[k] > 0;
                            return (
                                <button 
                                    key={k} 
                                    onClick={() => placeBet(k)} 
                                    disabled={phase !== 'betting'} 
                                    className={`bet-btn relative flex flex-col items-center justify-center py-1 rounded-lg border bg-orange-50 ${hasBet ? 'border-orange-300' : 'border-orange-100'} ${phase === 'result' && highlightedKeys.includes(k) ? 'highlight-win' : phase === 'result' ? 'dim-lose' : ''} h-[44px]`}
                                >
                                    <div className={`flex flex-col items-center relative z-0 ${hasBet ? 'opacity-30' : ''}`}>
                                        <span className="font-black text-[11px] text-orange-600 leading-none">{num}</span>
                                        <span className="text-[7px] font-bold text-orange-400 mt-0.5">×{PAYOUTS[k]}</span>
                                    </div>
                                    
                                    {hasBet && <div className="absolute inset-0 bg-black/[0.04] rounded-lg pointer-events-none"></div>}
                                    {hasBet && <CasinoChip amount={bets[k]} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Triple */}
                <button onClick={() => placeBet('TRIPLE')} disabled={phase !== 'betting'} className={`bet-btn relative w-full py-2 rounded-xl border bg-amber-50 flex flex-col items-center justify-center gap-1 mt-1 h-[56px] ${bets['TRIPLE'] > 0 ? 'border-[2px] border-amber-300' : 'border-amber-100'} ${phase === 'result' && highlightedKeys.includes('TRIPLE') ? 'highlight-win' : phase === 'result' ? 'dim-lose' : ''}`}>
                    <div className={`flex items-center gap-2 relative z-0 ${bets['TRIPLE'] > 0 ? 'opacity-30' : ''}`}>
                        <span className="font-black text-xs text-amber-600">TRIPLE (SEMUA SAMA)</span>
                        <span className="text-[8px] font-black bg-white px-1.5 py-0.5 rounded shadow-sm text-amber-600">×25</span>
                    </div>
                    
                    {bets['TRIPLE'] > 0 && <div className="absolute inset-0 bg-black/[0.04] rounded-xl pointer-events-none"></div>}
                    {bets['TRIPLE'] > 0 && <CasinoChip amount={bets['TRIPLE']} />}
                </button>
                        </>
                    );
                })()}
            </div>

            {/* Chips */}
            <div className="w-full flex flex-col items-center mb-2.5 mt-1">
                <div className="flex justify-between items-center w-full px-2 mb-1.5">
                    <span className="text-[7px] font-black text-gray-400 tracking-widest bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100">PILIH CHIP GEM</span>
                    <span className="text-[10px] font-black flex items-center gap-1 text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100 shadow-sm">
                        <IconGem className="w-3.5 h-3.5"/> {typeof window.formatNumber === 'function' ? window.formatNumber(profile.gems || 0) : new Intl.NumberFormat('id-ID').format(profile.gems || 0)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {[1, 5, 10, 25, 50].map(val => (
                        <button 
                            key={val} 
                            onClick={() => setSelectedChip(val)}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-black text-[11px] sm:text-xs flex items-center justify-center border-[2px] transition-all ${selectedChip === val ? 'scale-110 shadow-md z-10 ' + (val===1?'border-gray-400 bg-white text-gray-700' : val===5?'border-emerald-400 bg-emerald-50 text-emerald-600' : val===10?'border-sky-400 bg-sky-50 text-sky-600' : val===25?'border-purple-400 bg-purple-50 text-purple-600' : 'border-pink-400 bg-pink-50 text-pink-600') : 'scale-100 border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                        >
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-dashed ${selectedChip === val ? 'border-current opacity-50' : 'border-gray-200'}`}>
                                {val}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Actions w/ Accordion */}
            <div className="w-full flex flex-col bg-white rounded-2xl shadow-sm border theme-border overflow-hidden transition-all duration-300">
                <div className="w-full flex items-center justify-between px-3 py-2">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-gray-400 tracking-wider">TOTAL TARUHAN</span>
                        <div className="flex items-center gap-1">
                            <IconGem className="w-4 h-4 text-pink-500"/>
                            <span className="font-black text-pink-600 text-[13px]">{totalBet}</span>
                        </div>
                    </div>
                    <div className="flex gap-1.5">
                        <button onClick={clearBets} disabled={phase !== 'betting' || totalBet === 0} className="px-3 py-1.5 rounded-xl bg-gray-50 text-rose-500 text-[9px] font-black active:scale-95 transition-transform disabled:opacity-30 border border-gray-100">
                            HAPUS
                        </button>
                        <button onClick={repeatBet} disabled={phase !== 'betting' || Object.keys(lastBets).length === 0} className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1 text-[9px] font-black active:scale-95 transition-transform disabled:opacity-50">
                            <IconRefresh className="w-3 h-3"/> ULANGI
                        </button>
                    </div>
                </div>
                
                <button onClick={() => setStatsOpen(!statsOpen)} className="w-full pt-1.5 pb-2 border-t border-gray-50 flex items-center justify-center gap-1 text-[8px] font-black text-gray-400 bg-gray-50/50 hover:bg-gray-100/50">
                    STATISTIK DICE {statsOpen ? <IconChevronUp className="w-3 h-3"/> : <IconChevronDown className="w-3 h-3"/>}
                </button>
                
                {statsOpen && (
                    <div className="w-full p-4 pt-2 flex flex-col gap-3 animate-popup text-left">
                        {/* Summary Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">Total Ronde</span>
                                <span className="text-xs font-black text-gray-700">{formatNum(diceStats.rounds)}</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">Win Rate</span>
                                <span className="text-xs font-black text-gray-700">{diceStats.rounds > 0 ? Math.round((diceStats.wins/diceStats.rounds)*100) : 0}%</span>
                            </div>
                            <div className="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-50 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">Total Menang</span>
                                <span className="text-xs font-black text-emerald-600">{formatNum(diceStats.wins)}</span>
                            </div>
                            <div className="bg-rose-50/50 rounded-xl p-2.5 border border-rose-50 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">Total Kalah</span>
                                <span className="text-xs font-black text-rose-500">{formatNum(diceStats.losses)}</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">Total Taruhan</span>
                                <span className="text-xs font-black text-gray-700 flex items-center gap-1">{formatNum(diceStats.totalWagered)}</span>
                            </div>
                            <div className="bg-amber-50/50 rounded-xl p-2.5 border border-amber-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500">Max Menang</span>
                                <span className="text-xs font-black text-amber-600 flex items-center gap-1">{formatNum(diceStats.biggestWin)}</span>
                            </div>
                        </div>

                        {/* Total Profit Full Width */}
                        <div className={`rounded-xl p-3 border flex flex-col items-center justify-center text-center ${diceStats.profit > 0 ? 'bg-emerald-50/50 border-emerald-100' : diceStats.profit < 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-bold text-gray-500 mb-0.5">Total Profit</span>
                            <span className={`text-base font-black flex items-center gap-1 ${diceStats.profit > 0 ? 'text-emerald-600' : diceStats.profit < 0 ? 'text-rose-600' : 'text-gray-700'}`}>
                                {diceStats.profit > 0 ? '+' : ''}{formatNum(diceStats.profit)} <IconGem className="w-4 h-4 text-pink-500"/>
                            </span>
                        </div>

                        {/* Kemenangan Terbaru */}
                        <div className="flex flex-col mt-1">
                            <span className="text-[10px] font-black text-gray-800 mb-2 tracking-wide px-1">KEMENANGAN TERBARU</span>
                            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scroll pr-1 pb-1 overscroll-contain">
                                {(!diceStats.recentWins || diceStats.recentWins.length === 0) ? (
                                    <div className="text-xs text-gray-400 text-center py-4 font-medium bg-gray-50 rounded-xl border border-gray-100">Belum ada riwayat kemenangan.</div>
                                ) : (
                                    diceStats.recentWins.map((w, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm shrink-0">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-black text-gray-700 uppercase tracking-tight">{w.bets || `TOTAL ${w.total}`}</span>
                                                <div className="flex items-center gap-1.5 opacity-80">
                                                    {w.dice && w.dice.length === 3 ? (
                                                        <div className="flex gap-0.5">
                                                            <MiniDice val={w.dice[0]} />
                                                            <MiniDice val={w.dice[1]} />
                                                            <MiniDice val={w.dice[2]} />
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-gray-500">TOTAL {w.total}</span>
                                                    )}
                                                    <span className="text-[10px] text-gray-400 font-medium">•</span>
                                                    <span className="text-[10px] font-bold text-gray-400">{w.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100/50">
                                                <span className="text-xs font-black text-emerald-600">+{formatNum(w.profit)}</span>
                                                <IconGem className="w-3.5 h-3.5 text-pink-500"/>
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
    
                .shake-during-roll { animation: tiny-shake 0.2s linear infinite; }
                @keyframes tiny-shake { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-2px) rotate(-1deg); } 50% { transform: translateY(0) rotate(0deg); } 75% { transform: translateY(2px) rotate(1deg); } }
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

            <div className="w-full flex flex-col items-center mb-2 mt-1">
                <div className="flex justify-between items-center w-full px-1 mb-2">
                    <span className="text-[7px] font-black text-gray-400 tracking-widest bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100">SALDO ANDA</span>
                    <div className="flex gap-1.5">
                        <span className="text-[10px] font-black flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 shadow-sm">
                            <IconCoin className="w-3.5 h-3.5"/> {typeof window.formatNumber === 'function' ? window.formatNumber(profile.coins || 0) : new Intl.NumberFormat('id-ID').format(profile.coins || 0)}
                        </span>
                        <span className="text-[10px] font-black flex items-center gap-1 text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 shadow-sm">
                            <IconGift className="w-3.5 h-3.5"/> {typeof window.formatNumber === 'function' ? window.formatNumber(profile.gacha_vouchers || 0) : new Intl.NumberFormat('id-ID').format(profile.gacha_vouchers || 0)}
                        </span>
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

// -- MINES GAME --
const IconBomb = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="13" r="9"/>
    <path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/>
    <path d="m22 2-1.5 1.5"/>
  </svg>
);

const MinesGame = ({ profile, onOpenComplete, opening, setOpening }) => {
    const { useState, useEffect, useRef } = React;
    const [wager, setWager] = useState(100);
    const [bombCount, setBombCount] = useState(1);
    const [gameState, setGameState] = useState('idle'); // idle, playing, result, freeze
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
            setTimeLeftToReset(`Reset dalam ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
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
        setStatsOpen(false); // auto close accordion when starting
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
            setGameState('freeze');
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
        setGameState('freeze');
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 2000); // Hide banner after 2s for win
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
        <div className="w-full flex-1 flex flex-col pt-4 px-4 pb-20 custom-scroll overflow-y-auto max-w-sm mx-auto">
            <div className="text-center mb-4 shrink-0">
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
                @keyframes popBounce {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop-bounce {
                    animation: popBounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes slideDownHeader {
                    from { transform: translateY(-100%); opacity: 0; }
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
            <div className="bg-white rounded-3xl p-4 mb-3 shadow-sm border border-gray-100 relative overflow-hidden shrink-0">
                {/* Banner Overlay for Result */}
                {showBanner && gameState === 'freeze' && (
                    <div className={`absolute top-0 left-0 right-0 py-2.5 px-4 z-20 flex flex-col items-center justify-center shadow-md border-b backdrop-blur-md ${
                        resultType === 'win' ? 'bg-emerald-500/95 border-emerald-600 text-white' : 'bg-rose-500/95 border-rose-600 text-white'
                    }`} style={{ animation: 'slideDownHeader 0.4s ease-out' }}>
                        <span className="text-sm font-black flex items-center gap-2">
                            {resultType === 'win' ? '✔ Cash Out Berhasil' : '💥 Terkena Ranjau'}
                        </span>
                        <span className="text-[11px] font-bold opacity-90 mt-0.5">
                            {resultType === 'win' ? `+${formatNum(winAmountDisplay)} Koin` : 'Taruhan Hangus'}
                        </span>
                    </div>
                )}

                {(gameState === 'playing' || gameState === 'freeze') && (
                    <div className="flex justify-between items-center mb-3 px-1 mt-1">
                        <span className="text-xs font-bold text-gray-500">Aman: <span className="text-emerald-500 font-black">{openedCount}/{safeCells}</span></span>
                        <span className="text-xs font-bold text-gray-500">Tersisa: <span className="text-gray-700 font-black">{remainingSafe}</span></span>
                    </div>
                )}
                {gameState === 'idle' && (
                    <div className="flex justify-center items-center mb-3 px-1 mt-1 opacity-50">
                        <span className="text-xs font-bold text-gray-500">Siap Bermain</span>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 relative z-10">
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
                                    <IconBomb className={`w-10 h-10 text-rose-500 drop-shadow-sm animate-flip ${gameState === 'freeze' && resultType === 'lose' ? 'animate-shake' : ''}`} /> : 
                                    <IconCoin className="w-10 h-10 drop-shadow-sm animate-pop-bounce text-amber-500" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* SINGLE CONTROLS CARD */}
            <div className="w-full flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                {gameState === 'idle' && (
                    <div className="p-4 flex flex-col animate-[fadeIn_0.3s_ease-out]">
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
                                        className={`py-2 rounded-xl text-xs font-black transition-all ${
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

                        <div className="mb-5">
                            <span className="text-[10px] font-black text-gray-400 tracking-wider block mb-2">JUMLAH RANJAU</span>
                            <div className="grid grid-cols-7 gap-1">
                                {BOMB_OPTIONS.map(b => (
                                    <button 
                                        key={b}
                                        onClick={() => setBombCount(b)}
                                        className={`py-1.5 rounded-lg text-xs font-black transition-all ${
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
                            disabled={(profile.coins || 0) < wager}
                            className="w-full py-3.5 rounded-xl bg-emerald-500 text-white font-black text-base shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-[0_0px_0_#059669] disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none transition-all tracking-wide"
                        >
                            MULAI MAIN
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="p-4 flex flex-col animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 tracking-wider">REWARD SAAT INI</span>
                                <div className="flex items-center gap-1 text-amber-500 font-black text-2xl animate-count-up" key={currentMultiplier}>
                                    <IconCoin className="w-6 h-6"/>
                                    <span>{formatNum(Math.floor(wager * currentMultiplier))}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end text-right gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-100">M. SAAT INI</span>
                                    <span className="text-sm font-black text-emerald-600 animate-count-up" key={'cur'+currentMultiplier}>{currentMultiplier.toFixed(2)}x</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-100">M. BERIKUTNYA</span>
                                    <span className="text-sm font-black text-gray-600 animate-count-up" key={'next'+nextMultiplier}>{nextMultiplier.toFixed(2)}x</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => cashout()}
                            disabled={openedCount === 0 || (openedCount < safeCells && dailyCashouts >= 3)}
                            className={`w-full py-4 rounded-xl text-white font-black text-base transition-all flex flex-col items-center justify-center relative ${
                                openedCount === 0 ? 'bg-gray-300 shadow-[0_4px_0_#9ca3af] cursor-not-allowed opacity-80' : 
                                'bg-amber-400 shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-[0_0px_0_#d97706]'
                            } ${(openedCount < safeCells && dailyCashouts >= 3) ? 'opacity-50 translate-y-0 shadow-none' : ''}`}
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

                {gameState === 'freeze' && (
                    <div className="p-4 flex flex-col animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex justify-between items-center mb-4 opacity-50">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 tracking-wider">REWARD SAAT INI</span>
                                <div className="flex items-center gap-1 text-amber-500 font-black text-2xl">
                                    <IconCoin className="w-6 h-6"/>
                                    <span>{formatNum(Math.floor(wager * currentMultiplier))}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end text-right gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-100">M. SAAT INI</span>
                                    <span className="text-sm font-black text-emerald-600">{currentMultiplier.toFixed(2)}x</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded uppercase tracking-wider border border-gray-100">M. BERIKUTNYA</span>
                                    <span className="text-sm font-black text-gray-600">{nextMultiplier.toFixed(2)}x</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={resetGame}
                            className="w-full py-4 rounded-xl bg-indigo-500 text-white font-black text-base shadow-[0_4px_0_#4f46e5] active:translate-y-1 active:shadow-[0_0px_0_#4f46e5] transition-all tracking-wide"
                        >
                            MAIN LAGI
                        </button>
                    </div>
                )}

                {/* ACCORDION STATS (Part of the same card) */}
                <button onClick={() => setStatsOpen(!statsOpen)} className="w-full pt-1.5 pb-2 border-t border-gray-50 flex items-center justify-center gap-1 text-[8px] font-black text-gray-400 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                    STATISTIK MINES {statsOpen ? <IconChevronUp className="w-3 h-3"/> : <IconChevronDown className="w-3 h-3"/>}
                </button>
                
                {statsOpen && (
                    <div className="w-full p-4 pt-2 flex flex-col gap-3 animate-popup text-left bg-white">
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
                        <div className={`rounded-xl p-3 border flex flex-col items-center justify-center text-center ${stats.profit > 0 ? 'bg-emerald-50/50 border-emerald-100' : stats.profit < 0 ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-50 border-gray-100'}`}>
                            <span className="text-[10px] font-bold text-gray-500 mb-0.5">Total Profit</span>
                            <span className={`text-base font-black flex items-center gap-1 ${stats.profit > 0 ? 'text-emerald-600' : stats.profit < 0 ? 'text-rose-600' : 'text-gray-700'}`}>
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
                                            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border ${res === 'win' ? 'bg-emerald-50 border-emerald-100/50 text-emerald-600' : 'bg-rose-50 border-rose-100/50 text-rose-600'}`}>
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
        </div>
    );
};


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
                        {/* Fixed Header */}
            <div className="absolute top-0 left-0 right-0 h-[64px] bg-white/90 backdrop-blur-md z-30 border-b border-gray-100 shadow-sm flex items-center px-4">
                {/* Left: Back Button */}
                <div className="flex-1 flex justify-start">
                    <button disabled={opening} onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-full disabled:opacity-50 text-gray-500 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100/50">
                        <IconChevronLeft className="w-5 h-5"/>
                    </button>
                </div>
                
                {/* Center: Tabs */}
                <div className="flex-none bg-gray-50/80 p-1 rounded-xl flex items-center shadow-inner border border-gray-100/50">
                    <button disabled={opening} onClick={() => setGachaMode('dice')} className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${gachaMode === 'dice' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>DICE</button>
                    <button disabled={opening} onClick={() => setGachaMode('item')} className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${gachaMode === 'item' ? 'bg-white text-amber-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>ITEM</button>
                    <button disabled={opening} onClick={() => setGachaMode('theme')} className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${gachaMode === 'theme' ? 'bg-white text-pink-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>TEMA</button>
                    <button disabled={opening} onClick={() => setGachaMode('mines')} className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${gachaMode === 'mines' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>MINES</button>
                </div>
                
                {/* Right: Spacer */}
                <div className="flex-1"></div>
            </div>

            {/* Scrollable Content */}
            <div className="absolute top-[64px] bottom-0 left-0 right-0 z-10 w-full flex flex-col items-center custom-scroll overflow-y-auto pb-10">
            {gachaMode === 'dice' ? (
                <DiceGacha profile={profile} onOpenComplete={onOpenComplete} opening={opening} setOpening={setOpening} />
            ) : gachaMode === 'mines' ? (
                <MinesGame profile={profile} onOpenComplete={onOpenComplete} opening={opening} setOpening={setOpening} />
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
    
                .shake-during-roll { animation: tiny-shake 0.2s linear infinite; }
                @keyframes tiny-shake { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-2px) rotate(-1deg); } 50% { transform: translateY(0) rotate(0deg); } 75% { transform: translateY(2px) rotate(1deg); } }
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

                <div className="w-full flex flex-col items-center mb-2 mt-1">
                    <div className="flex justify-between items-center w-full mb-2">
                        <span className="text-[7px] font-black text-gray-400 tracking-widest bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-100">SALDO ANDA</span>
                        <div className="flex gap-1.5">
                            <span className="text-[10px] font-black flex items-center gap-1 text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100 shadow-sm">
                                <IconGem className="w-3.5 h-3.5"/> {typeof window.formatNumber === 'function' ? window.formatNumber(profile.gems || 0) : new Intl.NumberFormat('id-ID').format(profile.gems || 0)}
                            </span>
                            <span className="text-[10px] font-black flex items-center gap-1 text-fuchsia-500 bg-fuchsia-50 px-2 py-0.5 rounded-full border border-fuchsia-100 shadow-sm">
                                <IconRainbowCandy className="w-3.5 h-3.5"/> {typeof window.formatNumber === 'function' ? window.formatNumber(profile.rainbow_candy || 0) : new Intl.NumberFormat('id-ID').format(profile.rainbow_candy || 0)}
                            </span>
                        </div>
                    </div>
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

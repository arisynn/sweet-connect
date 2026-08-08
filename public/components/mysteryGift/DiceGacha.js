const DiceGacha = ({ profile, syncProfile, onOpenComplete, opening, setOpening }) => {
    const { useState, useEffect, useRef } = React;
    const formatNum = window.formatNumber || (n => n);
    
    // Core states
    const [helpOpen, setHelpOpen] = useState(false);
    const [phase, setPhase] = useState('betting'); // betting, rolling, result
    const [timeLeft, setTimeLeft] = useState(15);
    
    useEffect(() => {
        window.isGameLocked = (phase === 'rolling' || phase === 'result');
        window.gameLockedMessage = "Selesaikan putaran Dadu terlebih dahulu.";
        return () => { window.isGameLocked = false; };
    }, [phase]);
    
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
    const defaultDiceStats = { rounds: 0, wins: 0, losses: 0, totalWagered: 0, totalReturned: 0, profit: 0, biggestWin: 0, recentHistory: [] };
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

    const processResult = async (d1, d2, d3, total, isTriple) => {
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
            } else {
                newStats.losses += 1;
            }
            
            const betLabels = Object.keys(currentBets).map(getBetLabel).join(', ');
            newStats.recentHistory = [{
                timestamp: Date.now(),
                total: total,
                dice: [d1, d2, d3],
                bets: betLabels,
                profit: netDifference,
                type: netDifference > 0 ? 'win' : 'lose'
            }, ...(newStats.recentHistory || newStats.recentWins || [])].slice(0, 15);
        }
        tempProfile.diceStats = newStats;
        
        if (netDifference !== 0) {
            tempProfile.gems = (tempProfile.gems || 0) + netDifference;
        }
        if (typeof syncProfile === "function") {
            await syncProfile(tempProfile);
        } else {
            onOpenComplete(tempProfile, netDifference > 0 ? netDifference : 0);
        }
        
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
            
            <GuideModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} title="Panduan Dice Gacha">
                <div className="guide-section">
                    <h3 className="guide-section-title">Cara Bermain</h3>
                    <ul className="guide-list">
                        <li>Pilih jumlah taruhan pada chip di bawah layar.</li>
                        <li>Pilih satu atau beberapa jenis taruhan (Besar, Kecil, Ganjil, Genap, dll).</li>
                        <li>Tekan tombol <strong>Putar</strong> (jika ada) atau tunggu waktu habis.</li>
                        <li>Tiga dadu akan dikocok otomatis saat waktu habis.</li>
                        <li>Jika hasil penjumlahan dadu sesuai taruhan, Anda menang dan hadiah otomatis masuk ke saldo.</li>
                    </ul>
                </div>
                
                <div className="guide-section">
                    <h3 className="guide-section-title">Jenis Taruhan, Peluang & Pengali</h3>
                    <p className="guide-text mb-2">Peluang menang dan pengali hadiah diambil langsung dari sistem:</p>
                    <table className="guide-table">
                        <thead>
                            <tr>
                                <th>Jenis Taruhan</th>
                                <th>Kondisi</th>
                                <th>Pengali</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Kecil</td>
                                <td>Total 4 - 10</td>
                                <td className="text-indigo-600 font-bold">x{PAYOUTS.SMALL}</td>
                            </tr>
                            <tr>
                                <td>Besar</td>
                                <td>Total 11 - 17</td>
                                <td className="text-indigo-600 font-bold">x{PAYOUTS.BIG}</td>
                            </tr>
                            <tr>
                                <td>Ganjil</td>
                                <td>Total Ganjil</td>
                                <td className="text-indigo-600 font-bold">x{PAYOUTS.ODD}</td>
                            </tr>
                            <tr>
                                <td>Genap</td>
                                <td>Total Genap</td>
                                <td className="text-indigo-600 font-bold">x{PAYOUTS.EVEN}</td>
                            </tr>
                            <tr>
                                <td>Triple</td>
                                <td>Tiga Dadu Sama</td>
                                <td className="text-indigo-600 font-bold">x{PAYOUTS.TRIPLE}</td>
                            </tr>
                            <tr>
                                <td>Total Tertentu</td>
                                <td>Tebak Total Dadu</td>
                                <td className="text-indigo-600 font-bold">x{PAYOUTS.TOTAL_4} - x{PAYOUTS.TOTAL_10}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="guide-section">
                    <h3 className="guide-section-title">Contoh Hasil</h3>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex flex-col gap-2">
                        <div className="flex gap-2">
                            <span className="w-7 h-7 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-gray-700 shadow-sm">2</span>
                            <span className="w-7 h-7 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-gray-700 shadow-sm">5</span>
                            <span className="w-7 h-7 bg-white border border-gray-200 rounded flex items-center justify-center font-bold text-gray-700 shadow-sm">6</span>
                            <span className="ml-2 font-black text-indigo-600 flex items-center">= Total 13</span>
                        </div>
                        <p className="guide-text mt-1">
                            Hasil di atas <strong>Menang</strong> pada taruhan: 
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 text-xs rounded font-bold border border-indigo-100">✔ Besar</span> 
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 text-xs rounded font-bold border border-indigo-100">✔ Ganjil</span>
                            <span className="bg-indigo-50 text-indigo-600 px-2 py-1 text-xs rounded font-bold border border-indigo-100">✔ Total 13</span>
                        </div>
                    </div>
                </div>

                <div className="guide-section border-l-4 border-l-amber-400">
                    <h3 className="guide-section-title">Tips Bermain</h3>
                    <ul className="guide-list">
                        <li>Taruhan <strong>Besar/Kecil</strong> memiliki peluang menang lebih tinggi.</li>
                        <li>Taruhan <strong>Triple</strong> memiliki peluang kecil tetapi hadiah lebih besar.</li>
                        <li>Kombinasikan strategi sesuai risiko yang diinginkan.</li>
                    </ul>
                </div>
            </GuideModal>

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
                <div className="flex justify-between items-center w-full px-2 mb-2">
                    <span className="text-[9px] font-black text-gray-400 tracking-wider">PILIH CHIP GEM</span>
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-500 rounded-full border border-pink-100 shadow-sm h-[26px]">
                            <IconGem className="w-3.5 h-3.5"/>
                            <span className="text-[11px] font-black">{typeof window.formatNumber === 'function' ? window.formatNumber(profile.gems || 0) : new Intl.NumberFormat('id-ID').format(profile.gems || 0)}</span>
                        </div>
                        <button 
                            onClick={() => { if(typeof AudioEngine !== 'undefined') AudioEngine.uiClick(); setHelpOpen(true); }}
                            className="text-[11px] font-black text-gray-500 bg-white hover:bg-gray-50 hover:text-indigo-500 active:scale-95 transition-all px-3 py-1 rounded-full border border-gray-200 shadow-sm flex items-center h-[26px]"
                        >
                            BANTUAN
                        </button>
                    </div>
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

                        {/* Riwayat Terbaru */}
                        <div className="flex flex-col mt-1">
                            <span className="text-[10px] font-black text-gray-800 mb-2 tracking-wide px-1">RIWAYAT TERBARU</span>
                            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scroll pr-1 pb-1 overscroll-contain">
                                {(!diceStats.recentHistory || diceStats.recentHistory.length === 0) ? (
                                    <div className="text-xs text-gray-400 text-center py-4 font-medium bg-gray-50 rounded-xl border border-gray-100">Belum ada riwayat permainan.</div>
                                ) : (
                                    diceStats.recentHistory.map((w, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm shrink-0">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-black text-gray-700 uppercase tracking-tight max-w-[120px] truncate">{w.bets || `TOTAL ${w.total}`}</span>
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
                                                    <span className="text-[10px] font-bold text-gray-400">{new Date(w.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border ${w.type === 'win' ? 'bg-emerald-50 border-emerald-100/50' : 'bg-rose-50 border-rose-100/50'}`}>
                                                <span className={`text-xs font-black ${w.type === 'win' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {w.type === 'win' ? '+' : ''}{formatNum(w.profit)}
                                                </span>
                                                <IconGem className={`w-3.5 h-3.5 ${w.type === 'win' ? 'text-pink-500' : 'grayscale opacity-50'}`}/>
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


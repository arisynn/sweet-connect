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

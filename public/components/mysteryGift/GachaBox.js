const GachaBox = ({ gachaMode, gachaState, profile, cost1x, cost10x, canUseVoucher1x, canUseVoucher10x, costCurrency, spinGacha, opening, setShowPrizePool, setShowThemeShop, formatNumber }) => {
    return (
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
                .animate-gacha-shake { animation: gacha-shake 0.3s ease-in-out infinite; }
                    
                @keyframes gacha-light {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { transform: scale(1.5); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
                .animate-gacha-light { animation: gacha-light 0.8s ease-out forwards; }
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
                            <IconGem className="w-3.5 h-3.5"/> {typeof formatNumber === 'function' ? formatNumber(profile.gems || 0) : new Intl.NumberFormat('id-ID').format(profile.gems || 0)}
                        </span>
                        <span className="text-[10px] font-black flex items-center gap-1 text-fuchsia-500 bg-fuchsia-50 px-2 py-0.5 rounded-full border border-fuchsia-100 shadow-sm">
                            <IconRainbowCandy className="w-3.5 h-3.5"/> {typeof formatNumber === 'function' ? formatNumber(profile.rainbow_candy || 0) : new Intl.NumberFormat('id-ID').format(profile.rainbow_candy || 0)}
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
    );
};

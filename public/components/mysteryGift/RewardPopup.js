const RewardPopup = ({ wonPrize, setWonPrize, wonPrizesList, setWonPrizesList }) => {
    if (wonPrize) {
        return (
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
        );
    }
    
    if (wonPrizesList) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm z-[110] p-4">
                <div className="bg-white p-6 rounded-3xl w-full max-w-[340px] shadow-2xl modal-enter relative overflow-hidden border-2 theme-border max-h-[85vh] flex flex-col">
                    <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-yellow-400 to-amber-500 shrink-0"></div>
                    <div className="shrink-0 text-center">
                        <h3 className="text-xl font-black text-gray-800 mb-1 mt-2">Hasil Buka 10x</h3>
                        <p className="text-[11px] font-medium text-gray-500 mb-4">Wow! Lihat apa saja yang kamu dapatkan.</p>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scroll -mx-2 px-2 pb-2">
                        <div className="grid grid-cols-2 gap-2">
                            {wonPrizesList.items.map((p, i) => (
                                <div key={i} className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border shadow-sm ${p.rarity === 'legendary' ? 'bg-gradient-to-b from-yellow-50 to-amber-100 border-amber-200' : p.rarity === 'epic' ? 'bg-gradient-to-b from-purple-50 to-fuchsia-100 border-fuchsia-200' : p.rarity === 'rare' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className="w-10 h-10">{p.icon}</div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-black text-gray-800">{p.name}</div>
                                        <div className="text-[8px] font-bold text-gray-500 uppercase">{p.rarity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {wonPrizesList.summary.coins > 0 && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">+{wonPrizesList.summary.coins} Koin</span>}
                            {wonPrizesList.summary.gems > 0 && <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-1 rounded-lg">+{wonPrizesList.summary.gems} Gem</span>}
                            {wonPrizesList.summary.rainbow > 0 && <span className="text-[10px] font-bold bg-fuchsia-100 text-fuchsia-700 px-2 py-1 rounded-lg">+{wonPrizesList.summary.rainbow} Permen</span>}
                            {wonPrizesList.summary.hints > 0 && <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-1 rounded-lg">+{wonPrizesList.summary.hints} Hint</span>}
                            {wonPrizesList.summary.shuffles > 0 && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">+{wonPrizesList.summary.shuffles} Shuffle</span>}
                        </div>
                        <button onClick={() => setWonPrizesList(null)} className="btn-modern bg-gray-900 text-white py-3.5 w-full text-sm font-bold shadow-md rounded-xl">Klaim Semua</button>
                    </div>
                </div>
            </div>
        );
    }
    
    return null;
};

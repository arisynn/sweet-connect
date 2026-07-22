

const LoginRewardScreen = ({ profile, onClaim, onClose }) => {
    const config = window.getLoginRewardConfig(profile);
    const status = window.checkLoginRewardStatus(profile);
    const [claiming, setClaiming] = React.useState(false);
    
    const handleClaim = () => {
        if (claiming || !status.canClaim) return;
        setClaiming(true);
        if (AudioEngine) AudioEngine.uiSuccess();
        setTimeout(() => {
            onClaim();
        }, 1000);
    };

    const renderRewardItem = (reward) => {
        const items = [];
        if (reward.coins) items.push(<div key="c" className="flex items-center gap-1"><IconCoin className="w-4 h-4 text-amber-500" /> <span>{reward.coins}</span></div>);
        if (reward.gems) items.push(<div key="g" className="flex items-center gap-1"><IconGem className="w-4 h-4 text-pink-500" /> <span>{reward.gems}</span></div>);
        if (reward.gacha_vouchers) items.push(<div key="v" className="flex items-center gap-1"><IconGift className="w-4 h-4 text-purple-500" /> <span>x{reward.gacha_vouchers}</span></div>);
        if (reward.hints) items.push(<div key="h" className="flex items-center gap-1"><IconSearch className="w-4 h-4 text-sky-500" /> <span>x{reward.hints}</span></div>);
        if (reward.shuffles) items.push(<div key="s" className="flex items-center gap-1"><IconRefresh className="w-4 h-4 text-orange-500" /> <span>x{reward.shuffles}</span></div>);
        if (reward.hp) items.push(<div key="hp" className="flex items-center gap-1"><IconHeart className="w-4 h-4 text-rose-500" /> <span>x{reward.hp}</span></div>);
        if (reward.candy) items.push(<div key="cd" className="flex items-center gap-1 text-xs"><IconCandy className="w-4 h-4 text-amber-500" /> <span>x{reward.candy}</span></div>);
        if (reward.theme) items.push(<div key="t" className="flex items-center gap-1 text-xs"><IconBrush className="w-4 h-4 text-sky-500" /> <span>Tema</span></div>);
        return items;
    };

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 modal-enter">
            <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative border-4 border-pink-200">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black px-6 py-2 rounded-full shadow-lg border-2 border-white whitespace-nowrap text-lg">
                    Hadiah Harian
                </div>
                
                {!status.canClaim && (
                    <button onClick={onClose} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 font-bold border-2 border-gray-200 shadow-sm z-10 hover:bg-gray-50">
                        X
                    </button>
                )}

                <p className="text-center text-gray-500 text-sm mt-4 mb-6 font-medium">Login setiap hari untuk mendapatkan hadiah menarik!</p>

                <div className="grid grid-cols-3 gap-2 mb-2">
                    {config.slice(0, 6).map((item, idx) => {
                        const isClaimed = idx < status.currentDay;
                        const isToday = status.canClaim && idx === status.currentDay;
                        
                        return (
                            <div key={idx} className={`relative flex flex-col items-center p-2 rounded-2xl border-2 transition-all ${isClaimed ? 'bg-gray-100 border-gray-200 opacity-60' : isToday ? 'bg-pink-50 border-pink-400 shadow-md scale-105' : 'bg-white border-gray-100'}`}>
                                <span className={`text-[10px] font-black mb-1 ${isToday ? 'text-pink-500' : 'text-gray-400'}`}>Hari {item.day}</span>
                                <div className="flex-1 flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-700">
                                    {renderRewardItem(item.reward)}
                                </div>
                                {isClaimed && (
                                    <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center">
                                        <div className="bg-emerald-500 text-white p-1 rounded-full"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all w-full mt-2 ${status.currentDay === 6 && status.canClaim ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-yellow-400 shadow-lg scale-105' : status.currentDay > 6 ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'}`}>
                    <span className={`text-xs font-black mb-1 ${status.currentDay === 6 && status.canClaim ? 'text-amber-600' : 'text-gray-400'}`}>Hari 7 - Jackpot!</span>
                    <div className="flex items-center justify-center gap-3 text-sm font-bold text-gray-700">
                        {renderRewardItem(config[6].reward)}
                    </div>
                    {status.currentDay > 6 && (
                        <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center">
                            <div className="bg-emerald-500 text-white p-1 rounded-full"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    {status.canClaim ? (
                        <button 
                            onClick={handleClaim} 
                            disabled={claiming}
                            className={`w-full py-3 rounded-xl font-black text-white text-lg shadow-lg transition-all active:scale-95 ${claiming ? 'bg-gray-400' : 'bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse'}`}
                        >
                            {claiming ? 'Mengklaim...' : 'Klaim Hadiah'}
                        </button>
                    ) : (
                        <button 
                            onClick={onClose} 
                            className="w-full py-3 rounded-xl font-black text-gray-500 bg-gray-100 border-2 border-gray-200 shadow-sm transition-all active:scale-95"
                        >
                            Tutup
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
window.LoginRewardScreen = LoginRewardScreen;

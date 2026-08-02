const _rpb_formatK = (num) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0) + 'k';
    }
    return num;
};

const _rpb_RewardBadge = ({ type, amount }) => {
    return (
        <div className="flex items-center gap-0.5">
            {type === 'gems' ? <IconGem className="w-3 h-3" /> : type === 'gacha_vouchers' ? <IconGift className="w-3 h-3" /> : <IconCoin className="w-3 h-3" />}
            <span className="text-[10px]">x{_rpb_formatK(amount)}</span>
        </div>
    );
};

const RewardProgressBar = ({ profile, onClaimRepeatable }) => {
    const dm = getDailyMissions(profile);
    const repMission = window.REPEATABLE_MISSIONS_CONFIG[dm.repeatable.typeIndex];
    if (!repMission) return null;

    const progress = dm.repeatable.progress;
    const target = repMission.target;
    const readyCount = dm.repeatable.readyCount;
    const canClaim = readyCount > 0;
    
    let displayProgress = progress;
    const percent = Math.min(100, Math.floor((displayProgress / target) * 100));

    return (
        <div className="w-full bg-white border border-indigo-50 rounded-[1rem] p-2 shadow-sm relative overflow-hidden flex flex-col gap-1.5">
            <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <div className="shrink-0 w-7 h-7 rounded-[0.5rem] flex items-center justify-center text-base shadow-inner bg-gradient-to-br from-purple-50 to-pink-50 text-pink-500">
                        <IconTarget className="w-4 h-4"/>
                    </div>
                    <div className="flex flex-col overflow-hidden whitespace-nowrap">
                        <span className="font-black theme-text text-[11px] leading-none truncate">{repMission.title}</span>
                        <p className="text-[9px] text-gray-400 font-medium leading-none truncate mt-0.5">{repMission.desc}</p>
                    </div>
                </div>
                <div className="shrink-0 flex items-center justify-center font-black text-[10px] px-1.5 py-0.5 rounded shadow-sm bg-gradient-to-br from-pink-500 to-rose-500 text-white border border-pink-400">
                    <_rpb_RewardBadge type={repMission.rewardType} amount={repMission.rewardAmount} />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
                <div className="flex-1 bg-gray-100/80 rounded-full h-1.5 overflow-hidden relative shadow-inner">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.max(5, percent)}%` }} />
                </div>
                <span className="text-[9px] font-black text-gray-400 whitespace-nowrap text-right min-w-[2.5rem]">{_rpb_formatK(displayProgress)}/{_rpb_formatK(target)}</span>
            </div>

            {canClaim && (
                <button onClick={() => onClaimRepeatable('repeatable')} className="w-full py-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded text-[10px] shadow-[0_2px_8px_-2px_rgba(244,63,94,0.4)] active:scale-95 transition-transform flex justify-center items-center gap-1.5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    <span className="relative z-10">Klaim Hadiah {readyCount > 1 ? `(${readyCount}x)` : ''}</span>
                </button>
            )}
        </div>
    );
};

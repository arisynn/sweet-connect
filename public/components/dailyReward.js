const formatK = (num) => {
    if (num >= 1000) {
        return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0) + 'k';
    }
    return num;
};

const getIconForMission = (id) => {
    if (id === 'login') return <IconPlay className="w-6 h-6 text-indigo-500" />;
    if (id.includes('clear')) return <IconTrophy className="w-6 h-6 text-amber-500" />;
    if (id.includes('score')) return <IconChart className="w-6 h-6 text-emerald-500" />;
    if (id.includes('combo')) return <IconTarget className="w-6 h-6 text-rose-500" />;
    if (id.includes('useHint')) return <IconSearch className="w-6 h-6 text-cyan-500" />;
    if (id.includes('useShuffle')) return <IconRefresh className="w-6 h-6 text-purple-500" />;
    if (id.includes('Mystery')) return <IconGift className="w-6 h-6 text-pink-500" />;
    if (id.includes('chest')) return <IconGift className="w-6 h-6 text-amber-500" />;
    if (id.includes('match')) return <IconChart className="w-6 h-6 text-emerald-500" />;
    if (id.includes('flawless')) return <IconTrophy className="w-6 h-6 text-yellow-500" />;
    return <IconTarget className="w-6 h-6 text-indigo-500" />;
};

const RewardBadge = ({ type, amount }) => {
    const getIcon = () => {
        switch(type) {
            case 'gems': return <IconGem className="w-3.5 h-3.5" />;
            case 'gacha_vouchers': return <IconGift className="w-3.5 h-3.5 text-sky-500" />;
            case 'hints': return <IconSearch className="w-3.5 h-3.5 text-cyan-500" />;
            case 'shuffles': return <IconRefresh className="w-3.5 h-3.5 text-orange-500" />;
            case 'hp': return <IconHeart className="w-3.5 h-3.5 text-rose-500" />;
            case 'rainbow_candy': return <IconRainbowCandy className="w-3.5 h-3.5 text-fuchsia-500" />;
            default: return <IconCoin className="w-3.5 h-3.5" />;
        }
    };
    return (
        <div className="flex items-center gap-1">
            {getIcon()}
            <span>x{formatK(amount)}</span>
        </div>
    );
};

const MissionCard = ({ id, icon, title, desc, progress, target, isClaimed, rewardType, rewardAmount, difficulty, isWeekly, idx, claimingId, handleClaim }) => {
    let displayProgress = progress;
    const isFinished = isClaimed;
    const canClaim = !isClaimed && displayProgress >= target;
    const percent = Math.min(100, Math.floor((displayProgress / target) * 100));

    let diffClass = "text-gray-400 border-gray-200";
    if (difficulty === 'Mudah') diffClass = "text-emerald-500 border-emerald-200 bg-emerald-50";
    if (difficulty === 'Menengah') diffClass = "text-amber-500 border-amber-200 bg-amber-50";
    if (difficulty === 'Sulit') diffClass = "text-rose-500 border-rose-200 bg-rose-50";
    if (difficulty === 'Epic') diffClass = "text-purple-500 border-purple-200 bg-purple-50";
    if (difficulty === 'Legendary') diffClass = "text-amber-600 border-amber-300 bg-amber-100";

    return (
        <div className={`w-full ${isWeekly ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-gray-100'} border rounded-[1.25rem] p-3 shadow-sm transition-all duration-300 flex flex-col gap-2 ${isFinished ? 'opacity-70 scale-[0.98]' : ''} animate-card-enter origin-center ${claimingId === id ? 'scale-95 opacity-50' : ''}`} style={{animationDelay: `${(idx || 0) * 50}ms`}}>
            <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-12 h-12 rounded-[1rem] flex items-center justify-center text-2xl shadow-inner ${isFinished ? 'bg-gradient-to-br from-emerald-100 to-teal-50 grayscale opacity-50' : 'bg-gradient-to-br from-indigo-50 to-pink-50'}`}>
                        {icon}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className="font-black theme-text text-[13px] leading-tight">{title}</span>
                            {difficulty && (
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${diffClass}`}>
                                    {difficulty}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium leading-snug pr-2">{desc}</p>
                    </div>
                </div>
                <div className={`shrink-0 flex items-center justify-center font-black text-xs px-2.5 py-1.5 rounded-xl shadow-sm ${isFinished ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white border border-pink-400'}`}>
                    <RewardBadge type={rewardType} amount={rewardAmount} />
                </div>
            </div>

            {!isFinished && (
                <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 bg-gray-100/80 rounded-full h-3.5 overflow-hidden relative shadow-inner">
                        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2" style={{ width: `${Math.max(5, percent)}%` }}>
                            {percent > 15 && <span className="text-[9px] text-white font-black opacity-90">{percent}%</span>}
                        </div>
                    </div>
                    
                </div>
            )}

            {isFinished ? (
                <div className="w-full py-2 bg-emerald-50 text-emerald-600 font-black rounded-xl text-[13px] flex items-center justify-center gap-2 border border-emerald-100 mt-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Selesai
                </div>
            ) : canClaim ? (
                <button onClick={() => handleClaim(id, isWeekly)} className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-xl text-[13px] shadow-[0_4px_12px_-2px_rgba(244,63,94,0.4)] active:scale-95 transition-transform flex justify-center items-center gap-2 mt-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    <span className="relative z-10">Klaim Hadiah</span>
                </button>
            ) : null}
        </div>
    );
};

const DailyReward = ({ profile, onClaim, onClose, activeTheme }) => {
    const [tab, setTab] = useState('daily');
    const touchStartRef = useRef(null);
    const touchEndRef = useRef(null);

    const onTouchStart = (e) => {
        touchEndRef.current = null;
        touchStartRef.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
        touchEndRef.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (touchStartRef.current === null || touchEndRef.current === null) return;
        const distance = touchStartRef.current - touchEndRef.current;
        const minSwipeDistance = 50;

        if (distance > minSwipeDistance) {
            // Swipe left
            if (tab === 'daily') {
                AudioEngine.uiSwitchTab();
                setTab('weekly');
            }
        } else if (distance < -minSwipeDistance) {
            // Swipe right
            if (tab === 'weekly') {
                AudioEngine.uiSwitchTab();
                setTab('daily');
            }
        }
    };

    const dm = getDailyMissions(profile);
    const wm = getWeeklyMissions(profile);
    const [claimingId, setClaimingId] = useState(null);

    const handleClaim = (missionId, isWeekly) => {
        setClaimingId(missionId);
        setTimeout(() => {
            onClaim(missionId, isWeekly);
            setClaimingId(null);
        }, 300);
    };

    const renderDailyProgress = () => {
        const total = dm.activeIds.length;
        const completed = getDailyMissionsCompletedCount(profile);
        const percent = Math.min(100, Math.floor((completed / total) * 100));
        const allCompleted = completed >= total;
        const claimed = dm.allClaimed;

        return (
            <div className="bg-white border border-gray-100 rounded-[1.25rem] p-4 flex flex-col gap-3 shadow-sm mb-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-pink-50 text-pink-500 flex items-center justify-center shrink-0 shadow-inner">
                            <IconTarget className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black theme-text uppercase tracking-wide">Progress Harian</h4>
                            <p className="text-[11px] font-medium text-gray-500">Selesaikan semua misi harian</p>
                        </div>
                    </div>
                    <div className={`shrink-0 flex items-center justify-center font-black text-xs px-2.5 py-1.5 rounded-xl shadow-sm ${claimed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white border border-pink-400'}`}>
                        <div className="flex gap-1"><RewardBadge type="gacha_vouchers" amount={1} /><RewardBadge type="gems" amount={5} /></div>
                    </div>
                </div>
                
                {!claimed && (
                    <div className="flex flex-col gap-1">
                        <div className="flex-1 bg-gray-100/80 rounded-full h-3.5 overflow-hidden relative shadow-inner">
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2" style={{ width: `${Math.max(5, percent)}%` }}>
                                {percent > 15 && <span className="text-[9px] text-white font-black opacity-90">{percent}%</span>}
                            </div>
                        </div>
                        
                    </div>
                )}
                
                {claimed ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-600 font-black rounded-xl text-[13px] flex items-center justify-center gap-2 border border-emerald-100 mt-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Selesai
                    </div>
                ) : allCompleted && !claimed ? (
                    <button onClick={() => handleClaim('daily_all', false)} className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-xl text-[13px] shadow-[0_4px_12px_-2px_rgba(244,63,94,0.4)] active:scale-95 transition-transform flex justify-center items-center gap-2 relative overflow-hidden group mt-1">
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                        <span className="relative z-10">Klaim 1 Voucher</span>
                    </button>
                ) : null}
            </div>
        );
    };
    
    const renderWeeklyProgress = () => {
        const total = wm.activeIds.length;
        const completed = getWeeklyMissionsCompletedCount(profile);
        const percent = Math.min(100, Math.floor((completed / total) * 100));
        const allCompleted = completed >= total;
        const claimed = wm.allClaimed;

        return (
            <div className="bg-white border border-gray-100 rounded-[1.25rem] p-4 flex flex-col gap-3 shadow-sm mb-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-pink-50 text-pink-500 flex items-center justify-center shrink-0 shadow-inner">
                            <IconCalendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black theme-text uppercase tracking-wide">Progress Mingguan</h4>
                            <p className="text-[11px] font-medium text-gray-500">Selesaikan semua misi mingguan</p>
                        </div>
                    </div>
                    <div className={`shrink-0 flex items-center justify-center font-black text-xs px-2.5 py-1.5 rounded-xl shadow-sm ${claimed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white border border-pink-400'}`}>
                        <div className="flex gap-1"><RewardBadge type="gacha_vouchers" amount={10} /><RewardBadge type="gems" amount={20} /></div>
                    </div>
                </div>
                
                {!claimed && (
                    <div className="flex flex-col gap-1">
                        <div className="flex-1 bg-gray-100/80 rounded-full h-3.5 overflow-hidden relative shadow-inner">
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2" style={{ width: `${Math.max(5, percent)}%` }}>
                                {percent > 15 && <span className="text-[9px] text-white font-black opacity-90">{percent}%</span>}
                            </div>
                        </div>
                        
                    </div>
                )}
                
                {claimed ? (
                    <div className="w-full py-2 bg-emerald-50 text-emerald-600 font-black rounded-xl text-[13px] flex items-center justify-center gap-2 border border-emerald-100 mt-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Selesai
                    </div>
                ) : allCompleted && !claimed ? (
                    <button onClick={() => handleClaim('weekly_all', true)} className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-xl text-[13px] shadow-[0_4px_12px_-2px_rgba(244,63,94,0.4)] active:scale-95 transition-transform flex justify-center items-center gap-2 relative overflow-hidden group mt-1">
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                        <span className="relative z-10">Klaim 5 Voucher</span>
                    </button>
                ) : null}
            </div>
        );
    };

    const sortMissions = (missions, progress, claimed) => {
        return missions.sort((a, b) => {
            const aClaimed = claimed[a.id] || false;
            const bClaimed = claimed[b.id] || false;
            const aCurrent = progress[a.id] || 0;
            const bCurrent = progress[b.id] || 0;
            const aEligible = !aClaimed && aCurrent >= a.target;
            const bEligible = !bClaimed && bCurrent >= b.target;
            
            if (aEligible && !bEligible) return -1;
            if (!aEligible && bEligible) return 1;
            if (aClaimed && !bClaimed) return 1;
            if (!aClaimed && bClaimed) return -1;
            return 0;
        });
    };

    return (
        <div className={`absolute inset-0 z-[100] flex flex-col animate-page-enter ${THEMES[activeTheme]?.background ? 'bg-transparent' : 'theme-bg'}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {THEMES[activeTheme]?.menuBackgrounds?.['mission'] && (
                <img src={THEMES[activeTheme].menuBackgrounds['mission']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
            )}
            <div className="absolute inset-0 z-10 w-full h-full flex flex-col items-center custom-scroll overflow-y-auto pb-10">

            <div className="w-full flex items-center justify-between mb-4 mt-2 px-2 sticky top-0 bg-white/50 backdrop-blur-md z-20 py-2 border-b theme-border shadow-sm">
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 shadow-sm transition-colors">
                    <IconChevronLeft />
                </button>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border theme-border">
                    <button onClick={() => setTab('daily')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${tab === 'daily' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Harian</button>
                    <button onClick={() => setTab('weekly')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${tab === 'weekly' ? 'bg-purple-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Mingguan</button>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="p-4 flex flex-col gap-4 pb-8 max-w-lg mx-auto w-full relative z-10">
                <div style={{ display: tab === 'daily' ? 'block' : 'none' }}>
                    {renderDailyProgress()}
                </div>
                <div style={{ display: tab === 'weekly' ? 'block' : 'none' }}>
                    {renderWeeklyProgress()}
                </div>
                
                <div className="flex flex-col gap-3 relative">
                    <div className="flex flex-col gap-3" style={{ display: tab === 'daily' ? 'flex' : 'none' }}>
                        {React.useMemo(() => sortMissions(getActiveDailyMissionsConfig(profile), dm.progress, dm.claimed), [profile, dm.progress, dm.claimed]).map((m, idx) => {
                            const current = dm.progress[m.id] || 0;
                            const claimed = dm.claimed[m.id] || false;
                            return (
                                <MissionCard 
                                    key={m.id}
                                    id={m.id} 
                                    icon={getIconForMission(m.id)}
                                    title={m.title} 
                                    desc={m.desc} 
                                    progress={current} 
                                    target={m.target} 
                                    isClaimed={claimed}
                                    rewardType={m.rewardType}
                                    rewardAmount={m.rewardAmount}
                                    difficulty={m.difficulty}
                                    isWeekly={false}
                                    idx={idx}
                                    claimingId={claimingId}
                                    handleClaim={handleClaim}
                                />
                            );
                        })}
                    </div>
                    <div className="flex flex-col gap-3" style={{ display: tab === 'weekly' ? 'flex' : 'none' }}>
                        {React.useMemo(() => sortMissions(getActiveWeeklyMissionsConfig(profile), wm.progress, wm.claimed), [profile, wm.progress, wm.claimed]).map((m, idx) => {
                            const current = wm.progress[m.id] || 0;
                            const claimed = wm.claimed[m.id] || false;
                            return (
                                <MissionCard 
                                    key={m.id}
                                    id={m.id} 
                                    icon={getIconForMission(m.id)}
                                    title={m.title} 
                                    desc={m.desc} 
                                    progress={current} 
                                    target={m.target} 
                                    isClaimed={claimed}
                                    rewardType={m.rewardType}
                                    rewardAmount={m.rewardAmount}
                                    difficulty={m.difficulty}
                                    isWeekly={true}
                                    idx={idx}
                                    claimingId={claimingId}
                                    handleClaim={handleClaim}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
                    </div>
        </div>
    );};

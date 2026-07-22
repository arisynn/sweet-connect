// ===================== ACHIEVEMENTS & MILESTONES SCREEN =====================
const AchievementsScreen = ({ profile, onClaimAchievement, onClaimMilestone, onClose, activeTheme }) => {
    const [tab, setTab] = useState('achievement');
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

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

        if (distance > minSwipeDistance) {
            // Swipe left
            if (tab === 'achievement') {
                AudioEngine.uiSwitchTab();
                setTab('milestone');
            }
        } else if (distance < -minSwipeDistance) {
            // Swipe right
            if (tab === 'milestone') {
                AudioEngine.uiSwitchTab();
                setTab('achievement');
            }
        }
    };

        const formatK = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(num % 1000 !== 0 ? 1 : 0) + 'k';
        }
        return num;
    };

    const renderAchievementList = () => {
        // Sort achievements so claimable ones are at the top
        const list = [...ACHIEVEMENTS_DATA].map(a => {
            const tierIdx = getCurrentTier(profile, a.id);
            const isCompleted = tierIdx >= a.tiers.length;
            const currentTier = isCompleted ? a.tiers[a.tiers.length - 1] : a.tiers[tierIdx];
            const progress = a.getProgress(profile);
            const target = currentTier.target;
            let eligible = false;
            if (!isCompleted) {
                eligible = progress >= target;
            }
            
            return {
                ...a,
                tierIdx,
                isCompleted,
                currentTier,
                progress,
                target,
                eligible
            };
        });

        list.sort((a, b) => {
            if (a.eligible && !b.eligible) return -1;
            if (!a.eligible && b.eligible) return 1;
            if (a.isCompleted && !b.isCompleted) return 1;
            if (!a.isCompleted && b.isCompleted) return -1;
            return 0;
        });

        return list.map(a => {
            const { isCompleted, currentTier, eligible, tierIdx, progress, target } = a;
            
            // Format Roman Numeral for level
            const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
            const levelText = isCompleted ? `Maksimal` : `Level ${roman[tierIdx] || tierIdx + 1}`;

            return (
                <div key={a.id} className={`flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border ${eligible ? 'border-pink-300' : 'border-gray-100'} ${isCompleted ? 'opacity-60' : ''}`}>
                    <div className="flex flex-col pr-2 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-bold theme-text text-sm">{a.title}</span>
                            <span className="text-[10px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full font-bold">{levelText}</span>
                        </div>
                        <span className="text-[11px] text-gray-400">{a.desc(target)}</span>
                        
                        {!isCompleted && (
                            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-pink-400" style={{ width: `${Math.min(100, (progress / target) * 100)}%` }}></div>
                            </div>
                        )}
                        {!isCompleted && (
                            <span className="text-[9px] text-gray-400 mt-0.5 font-medium">{formatK(progress)} / {formatK(target)}</span>
                        )}

                        {!isCompleted && (
                            <span className="text-[10px] font-bold text-pink-500 mt-1.5">
                                Hadiah: {[
                                    currentTier.reward.coins && <span key="c" className="inline-flex items-center gap-0.5"><IconCoin className="w-3 h-3"/>{formatK(currentTier.reward.coins)}</span>,
                                    currentTier.reward.gems && <span key="g" className="inline-flex items-center gap-0.5"><IconGem className="w-3 h-3"/>{currentTier.reward.gems}</span>,
                                    currentTier.reward.gacha_vouchers && <span key="v" className="inline-flex items-center gap-0.5"><IconRainbowCandy className="w-3 h-3"/>{currentTier.reward.gacha_vouchers}</span>,
                                    currentTier.reward.hp && `${currentTier.reward.hp} Nyawa`,
                                    currentTier.reward.hints && `${currentTier.reward.hints} Hint`,
                                    currentTier.reward.shuffles && `${currentTier.reward.shuffles} Shuffle`,
                                    currentTier.reward.theme && `Tema ${THEMES[currentTier.reward.theme]?.name || 'Spesial'}`
                                ].filter(Boolean).map((item, idx, arr) => <React.Fragment key={idx}>{item}{idx < arr.length - 1 && ', '}</React.Fragment>)}
                            </span>
                        )}
                    </div>
                    {isCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-2 rounded-lg whitespace-nowrap ml-2">Selesai</span>
                    ) : eligible ? (
                        <button onClick={() => { AudioEngine.uiAchievement(); onClaimAchievement({ id: a.id, tierIdx, tier: currentTier }); }} className="btn-modern bg-pink-500 text-white px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap ml-2">Klaim</button>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-400 theme-bg px-3 py-2 rounded-lg whitespace-nowrap ml-2">
                            {`${Math.floor(Math.min(100, (progress/target)*100))}%`}
                        </span>
                    )}
                </div>
            );
        });
    };

    const renderMilestoneList = () => {
        const list = [...MILESTONES].map(m => {
            const claimed = !!profile.milestones[m.level];
            const eligible = !claimed && profile.highestLevel >= m.level;
            return { ...m, claimed, eligible };
        });

        list.sort((a, b) => {
            if (a.eligible && !b.eligible) return -1;
            if (!a.eligible && b.eligible) return 1;
            if (a.claimed && !b.claimed) return 1;
            if (!a.claimed && b.claimed) return -1;
            return 0;
        });

        return list.map(m => {
            const { claimed, eligible } = m;
            return (
                <div key={m.level} className={`flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border ${eligible ? 'border-pink-300' : 'border-gray-100'} ${claimed ? 'opacity-60' : ''}`}>
                    <div className="flex flex-col pr-2 flex-1">
                        <span className="font-bold theme-text text-sm">Level {m.level}</span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                            
                            {[
                                m.reward.coins && <span key="c" className="inline-flex items-center gap-0.5"><IconCoin className="w-3 h-3"/>{m.reward.coins}</span>,
                                m.reward.gems && <span key="g" className="inline-flex items-center gap-0.5"><IconGem className="w-3 h-3"/>{m.reward.gems}</span>,
                                m.reward.gacha_vouchers && <span key="v" className="inline-flex items-center gap-0.5"><IconRainbowCandy className="w-3 h-3"/>{m.reward.gacha_vouchers}</span>,
                                m.reward.theme && `Tema ${THEMES[m.reward.theme]?.name || 'Spesial'}`
                            ].filter(Boolean).map((item, idx, arr) => <React.Fragment key={idx}>{item}{idx < arr.length - 1 && ', '}</React.Fragment>)}
    
                        </span>
                        {!claimed && (
                            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-pink-400" style={{ width: `${Math.min(100, (profile.highestLevel / m.level) * 100)}%` }}></div>
                            </div>
                        )}
                        {!claimed && (
                            <span className="text-[9px] text-gray-400 mt-0.5 font-medium">{profile.highestLevel} / {m.level}</span>
                        )}
                    </div>
                    {claimed ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-2 rounded-lg whitespace-nowrap ml-2">Selesai</span>
                    ) : eligible ? (
                        <button onClick={() => { AudioEngine.uiAchievement(); onClaimMilestone(m); }} className="btn-modern bg-pink-500 text-white px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap ml-2">Klaim</button>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-400 theme-bg px-3 py-2 rounded-lg whitespace-nowrap ml-2">Terkunci</span>
                    )}
                </div>
            );
        });
    };

    return (
        <div className={`absolute inset-0 z-[100] flex flex-col items-center ${THEMES[activeTheme]?.background ? 'bg-transparent' : 'theme-bg'}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {THEMES[activeTheme]?.menuBackgrounds?.['achievement'] && (
                <img src={THEMES[activeTheme].menuBackgrounds['achievement']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
            )}
            <div className="absolute inset-0 z-10 w-full h-full flex flex-col items-center custom-scroll overflow-y-auto pb-10">

            <div className="w-full flex items-center justify-between mb-4 mt-2 px-2 sticky top-0 bg-white/50 backdrop-blur-md z-20 py-2 border-b theme-border shadow-sm">
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 shadow-sm transition-colors"><IconChevronLeft /></button>
                <div className="flex bg-white rounded-xl p-1 shadow-sm border theme-border">
                    <button onClick={() => { AudioEngine.uiSwitchTab(); setTab('achievement'); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${tab === 'achievement' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Prestasi</button>
                    <button onClick={() => { AudioEngine.uiSwitchTab(); setTab('milestone'); }} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${tab === 'milestone' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Level</button>
                </div>
                <div className="w-10"></div>
            </div>
            <div className="w-full max-w-[320px] flex-1 flex flex-col gap-3 pb-8 relative z-10">
                {tab === 'achievement' ? renderAchievementList() : renderMilestoneList()}
            </div>
                    </div>
        </div>
    );};

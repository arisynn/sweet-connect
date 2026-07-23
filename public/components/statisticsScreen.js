// ===================== STATISTICS SCREEN =====================
const StatisticsScreen = ({ profile, onClose, activeTheme }) => {
    const s = profile.statistics;

    const formatDuration = (ms) => {
        const totalMinutes = Math.floor(ms / 60000);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return h > 0 ? `${h}j ${m}m` : `${m}m`;
    };

    const formatTime = (ms) => {
        if (!ms) return '0d';
        return `${Math.floor(ms / 1000)}d`;
    };
    
    const rows = [
        { label: 'Total Game', value: formatNumber(s.totalGames || 0) },
        { label: 'Level Tertinggi', value: formatNumber(profile.highestLevel || 1) },
        { label: 'Skor Tertinggi', value: formatNumber(s.highestScore || 0) },
        { label: 'Total Koin Didapat', value: formatNumber(s.totalCoinsEarned || 0) },
        { label: 'Total Gem Didapat', value: formatNumber(s.totalTicketsEarned || 0) },
        { label: 'Total Mencocokkan', value: formatNumber(s.totalMatches || 0) },
        { label: 'Blok Dihapus', value: formatNumber(s.totalBlocksCleared || 0) },
        { label: 'Kombo Tertinggi', value: formatNumber(s.highestCombo || 0) },
        { label: 'Sisa Bar Waktu Maksimal', value: `${s.highestRemainingProgress ? Math.floor(s.highestRemainingProgress) : 0}%` },
        { label: 'Level Tanpa Salah (Flawless)', value: formatNumber(s.totalFlawless || 0) },
        { label: 'Hint Digunakan', value: formatNumber(s.totalHintsUsed || 0) },
        { label: 'Shuffle Digunakan', value: formatNumber(s.totalShufflesUsed || 0) },
        { label: 'Nyawa (Revive) Digunakan', value: formatNumber(s.totalRevivesUsed || 0) },
        { label: 'Misi Harian Selesai', value: formatNumber(s.totalDailyMissionsCompleted || 0) },
        { label: 'Misi Mingguan Selesai', value: formatNumber(s.totalWeeklyMissionsCompleted || 0) },
        { label: 'Total Hari Login', value: formatNumber(s.totalLoginDays || 0) },
        { label: 'Peti Dibuka', value: formatNumber(s.totalChestsOpened || 0) },
        { label: 'Main Gacha Hoki', value: formatNumber(s.totalMysteryBoxOpened || 0) },
        { label: 'Tema Dibeli', value: formatNumber(s.totalThemesBought || 0) },
        { label: 'Power-up Dibeli', value: formatNumber(s.totalPowerupsBought || 0) },
        { label: 'Total Salah Pasang', value: formatNumber(s.totalWrong || 0) },
        { label: 'Total Waktu Bermain', value: formatDuration(s.totalPlayTimeMs || 0) }
    ];

    return (
        <div className={`absolute inset-0 z-[100] flex flex-col items-center animate-page-enter ${THEMES[activeTheme]?.background ? 'bg-transparent' : 'theme-bg'}`}>
            {THEMES[activeTheme]?.menuBackgrounds?.['statistics'] && (
                <img src={THEMES[activeTheme].menuBackgrounds['statistics']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
            )}
            <div className="absolute inset-0 z-10 w-full h-full flex flex-col items-center custom-scroll overflow-y-auto pb-10">

            <div className="w-full flex items-center justify-between mb-6 mt-2 px-2 sticky top-0 bg-white/50 backdrop-blur-md z-20 py-2 border-b theme-border shadow-sm">
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 shadow-sm transition-colors"><IconChevronLeft /></button>
                <div className="flex bg-white rounded-xl px-4 py-1.5 shadow-sm border theme-border">
                    <h2 className="text-sm font-black theme-text">Statistik</h2>
                </div>
                <div className="w-10"></div>
            </div>
            <div className="w-full max-w-[320px] flex flex-col gap-3 pb-8 relative z-10">
                {rows.map((r, idx) => (
                    <div key={r.label} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-card-enter" style={{animationDelay: `${idx * 50}ms`}}>
                        <span className="text-sm font-bold text-gray-500">{r.label}</span>
                        <span className="text-sm font-black theme-text">{r.value}</span>
                    </div>
                ))}
            </div>
                    </div>
        </div>
    );};

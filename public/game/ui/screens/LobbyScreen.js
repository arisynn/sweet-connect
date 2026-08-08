const LobbyScreen = ({ handleStartMatch, setShowMultiplayerPopup, multiplayerState, setShowSettings, showSettings, setSweetMessage, handleLeaveRoom, setShowModeSheet, handleReadyToggle, roomData }) => {
    const ctx = React.useContext(GameContext);
    const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError, saveProfile, setProfile, prepareLevel } = ctx;
    return (
        <div className="absolute inset-0 bg-[#F2F2F7] flex flex-col z-[100] overflow-hidden animate-page-enter">
                        {THEMES[activeThemeRef.current || activeTheme]?.menuBackgrounds?.['home'] && (
                            <img src={THEMES[activeThemeRef.current || activeTheme].menuBackgrounds['home']} className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0" alt=""/>
                        )}
                        <div className="w-full flex justify-between items-center px-4 pt-6 pb-2 shrink-0 relative z-10">
                            <div className="flex flex-col drop-shadow-sm">
                                <button onClick={() => { AudioEngine.uiOpen(); setShowSettings(true); window.history.pushState({ isAppHistory: true, modal: 'SETTINGS' }, '', ''); }} className="flex bg-white/30 backdrop-blur-md border border-white/40 pl-3 pr-4 py-1.5 rounded-full items-center shadow-sm gap-2 hover:bg-white/40 transition-colors">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-gray-800 drop-shadow-sm"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="text-xl font-black text-gray-800 tracking-tight leading-none drop-shadow-sm">{playerName}</span>
                                    {profile.flexCrown && <IconCrown className="w-5 h-5 ml-1 drop-shadow-sm" />}
                                </button>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="bg-white/30 backdrop-blur-md border border-white/40 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <IconGem className="w-4 h-4 text-pink-500 drop-shadow-sm" />
                                    <span className="font-black text-gray-800 text-sm drop-shadow-sm">{formatNumber(profile.gems || 0)}</span>
                                </div>
                                <div className="bg-white/30 backdrop-blur-md border border-white/40 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    <IconCoin className="w-4 h-4 text-amber-500 drop-shadow-sm" />
                                    <span className="font-black text-gray-800 text-sm drop-shadow-sm">{formatNumber(profile.coins || 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 px-4 pb-4 flex flex-col gap-2.5 overflow-y-auto custom-scroll relative z-10">
                            
                                                                                    {/* Hero Carousel */}
                            <HeroCarousel 
                                profile={profile} 
                                activeTheme={activeThemeRef.current || activeTheme} 
                                THEMES={THEMES} 
                                prepareLevel={prepareLevel} 
                                onMultiplayerClick={() => setShowMultiplayerPopup(true)} 
                                inRoom={multiplayerState === 'WAITING' || multiplayerState === 'STARTING'}
                                onStartGame={handleStartMatch}
                                isHost={roomData?.host === playerName}
                                allReady={roomData?.players?.every(p => p.ready)}
                                roomData={roomData}
                            />
                            
                            <div className="animate-card-enter stagger-1">
                                <ChestSection activeTheme={activeThemeRef.current || activeTheme} profile={profile} setProfile={setProfile} saveProfile={saveProfile} playerName={playerName} setSweetMessage={setSweetMessage} />
                            </div>

                            {/* Menu Grid / Multiplayer Lobby */}
                            {multiplayerState === 'STARTING' ? (
                                (() => {
                                    const MultiplayerLoading = window.MultiplayerLoading;
                                    return <MultiplayerLoading roomData={roomData} playerName={playerName} />;
                                })()
                            ) : multiplayerState === 'WAITING' || multiplayerState === 'STARTING' ? (
                                <MultiplayerLobby 
                                    roomData={roomData} 
                                    profile={profile} 
                                    playerName={playerName}
                                    onLeaveRoom={handleLeaveRoom}
                                    onStartGame={handleStartMatch}
                                    onChangeMode={() => { if(roomData?.host === playerName) setShowModeSheet(true); }}
                                    onReadyToggle={handleReadyToggle}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button onClick={() => setGameState('ROULETTE')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors relative animate-card-enter stagger-2">
                                        <div className="bg-pink-50 theme-text-active p-2.5 rounded-xl mb-2">
                                            {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['gacha'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['gacha']} className="w-5 h-5 object-contain mix-blend-multiply" alt="gacha"/> : <IconGift className="w-5 h-5"/>}
                                        </div>
                                        <span className="theme-text font-bold text-sm">Gacha</span>
                                        {(profile.gacha_vouchers || 0) > 0 ? (
                                            <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{profile.gacha_vouchers}</span>
                                        ) : (
                                            Object.keys(THEMES || {}).filter(k => THEMES[k].type === 'gacha' && THEMES[k].price > 0 && !(profile.unlockedThemes || []).includes(k) && (profile.rainbow_candy || 0) >= (THEMES[k].price || 100)).length > 0 && (
                                                <span className="absolute top-2.5 right-2.5 bg-red-500 w-3 h-3 rounded-full border-2 border-white shadow-sm"></span>
                                            )
                                        )}
                                    </button>
                                    <button onClick={() => setGameState('SHOP')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors animate-card-enter stagger-3">
                                        <div className="bg-amber-50 text-amber-500 p-2.5 rounded-xl mb-2">
                                            {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['toko'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['toko']} className="w-5 h-5 object-contain mix-blend-multiply" alt="toko"/> : <IconStore className="w-5 h-5"/>}
                                        </div>
                                        <span className="theme-text font-bold text-sm">Toko</span>
                                    </button>
                                    <button onClick={() => setGameState('DAILY_REWARD')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors relative animate-card-enter stagger-4">
                                        <div className="bg-indigo-50 text-indigo-500 p-2.5 rounded-xl mb-2">
                                            {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['misi'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['misi']} className="w-5 h-5 object-contain mix-blend-multiply" alt="misi"/> : <IconTarget className="w-5 h-5"/>}
                                        </div>
                                        <span className="theme-text font-bold text-sm">Misi</span>
                                        {canClaimAnyMissionReward(profile) && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                    </button>
                                    <button onClick={() => setGameState('ACHIEVEMENTS')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors relative animate-card-enter stagger-5">
                                        <div className="bg-amber-50 text-amber-500 p-2.5 rounded-xl mb-2">
                                            {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['prestasi'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['prestasi']} className="w-5 h-5 object-contain mix-blend-multiply" alt="prestasi"/> : <IconTrophy className="w-5 h-5"/>}
                                        </div>
                                        <span className="theme-text font-bold text-sm">Prestasi</span>
                                        {(window.getClaimableAchievements(profile).length > 0 || window.getClaimableMilestones(profile).length > 0) && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                    </button>
                                    
                                    <button onClick={() => setGameState('THEMES')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors relative animate-card-enter stagger-6">
                                        <div className="bg-emerald-50 text-emerald-500 p-2.5 rounded-xl mb-2">
                                            {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['tema'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['tema']} className="w-5 h-5 object-contain mix-blend-multiply" alt="tema"/> : <IconBrush className="w-5 h-5"/>}
                                        </div>
                                        <span className="theme-text font-bold text-sm">Tema</span>
                                        {profile.newThemes && profile.newThemes.length > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                    </button>
                                    
                                    <button onClick={() => setGameState('STATISTICS')} className="bg-white rounded-[1.25rem] p-3.5 flex flex-col items-start justify-center shadow-sm active:bg-gray-50 transition-colors animate-card-enter stagger-7">
                                        <div className="bg-sky-50 text-sky-500 p-2.5 rounded-xl mb-2">
                                            {THEMES[activeThemeRef.current || activeTheme]?.menuIcons?.['statistik'] ? <img src={THEMES[activeThemeRef.current || activeTheme].menuIcons['statistik']} className="w-5 h-5 object-contain mix-blend-multiply" alt="statistik"/> : <IconChart className="w-5 h-5"/>}
                                        </div>
                                        <span className="theme-text font-bold text-sm">Statistik</span>
                                    </button>
                                </div>
                            )}
                            
                        </div>
                    </div>
    );
};

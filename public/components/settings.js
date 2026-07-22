
const SettingsPanel = ({ syncStatus, setShowSyncLog, onClose, onLogout, profile, setProfile, saveProfile, playerName }) => {
    const [settings, setSettings] = useState(() => AudioEngine.getSettings());

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        AudioEngine.updateSettings(newSettings);
        if (key.includes('mute') || key.includes('Vol')) {
            if (!newSettings.muteSfx) {
                AudioEngine.uiClick();
            }
        }
    };
    
    const notifPrefs = profile.notificationPrefs || {
        dailyReward: true,
        dailyMission: true,
        weeklyMission: true,
        chestReady: true,
        comeBack: true
    };
    
    const updateNotif = (key, value) => {
        AudioEngine.uiClick();
        const newProfile = { ...profile, notificationPrefs: { ...notifPrefs, [key]: value } };
        setProfile(newProfile);
        if (playerName && saveProfile) saveProfile(playerName, newProfile);
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 modal-enter">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="bg-gray-900 p-4 shrink-0 flex items-center justify-between relative">
                    <h2 className="text-xl font-black text-white uppercase tracking-wider mx-auto">Pengaturan</h2>
                    <button onClick={() => { AudioEngine.uiClose(); onClose(); }} className="absolute right-4 text-gray-400 hover:text-white p-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-6 flex flex-col gap-6 bg-gray-50 overflow-y-auto max-h-[60vh]">
                    
                    {/* Musik */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">Musik</span>
                            <button onClick={() => updateSetting('muteMusic', !settings.muteMusic)} className={`w-12 h-6 rounded-full relative transition-colors ${settings.muteMusic ? 'bg-gray-300' : 'bg-emerald-500'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.muteMusic ? 'left-1' : 'left-7'}`}></div>
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-5 h-5 ${settings.muteMusic ? 'text-gray-300' : 'text-gray-500'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            <input type="range" min="0" max="100" value={settings.musicVol} onChange={(e) => updateSetting('musicVol', parseInt(e.target.value))} className="w-full accent-emerald-500" disabled={settings.muteMusic}/>
                            <span className="text-xs font-bold text-gray-500 w-8 text-right">{settings.musicVol}%</span>
                        </div>
                    </div>

                    {/* SFX */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">Efek Suara</span>
                            <button onClick={() => updateSetting('muteSfx', !settings.muteSfx)} className={`w-12 h-6 rounded-full relative transition-colors ${settings.muteSfx ? 'bg-gray-300' : 'bg-sky-500'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.muteSfx ? 'left-1' : 'left-7'}`}></div>
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-5 h-5 ${settings.muteSfx ? 'text-gray-300' : 'text-gray-500'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                            <input type="range" min="0" max="100" value={settings.sfxVol} onChange={(e) => updateSetting('sfxVol', parseInt(e.target.value))} className="w-full accent-sky-500" disabled={settings.muteSfx}/>
                            <span className="text-xs font-bold text-gray-500 w-8 text-right">{settings.sfxVol}%</span>
                        </div>
                    </div>
                    
                    {/* Notifikasi */}
                    <div className="flex flex-col gap-3 pt-3 border-t border-gray-200">
                        <span className="font-bold text-gray-700">Notifikasi</span>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Daily Reward</span>
                                <button onClick={() => updateNotif('dailyReward', !notifPrefs.dailyReward)} className={`w-10 h-5 rounded-full relative transition-colors ${!notifPrefs.dailyReward ? 'bg-gray-300' : 'bg-pink-500'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${!notifPrefs.dailyReward ? 'left-0.5' : 'left-5'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Daily Mission</span>
                                <button onClick={() => updateNotif('dailyMission', !notifPrefs.dailyMission)} className={`w-10 h-5 rounded-full relative transition-colors ${!notifPrefs.dailyMission ? 'bg-gray-300' : 'bg-pink-500'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${!notifPrefs.dailyMission ? 'left-0.5' : 'left-5'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Weekly Mission</span>
                                <button onClick={() => updateNotif('weeklyMission', !notifPrefs.weeklyMission)} className={`w-10 h-5 rounded-full relative transition-colors ${!notifPrefs.weeklyMission ? 'bg-gray-300' : 'bg-pink-500'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${!notifPrefs.weeklyMission ? 'left-0.5' : 'left-5'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Peti Siap Dibuka</span>
                                <button onClick={() => updateNotif('chestReady', !notifPrefs.chestReady)} className={`w-10 h-5 rounded-full relative transition-colors ${!notifPrefs.chestReady ? 'bg-gray-300' : 'bg-pink-500'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${!notifPrefs.chestReady ? 'left-0.5' : 'left-5'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Pengingat Kembali (24 Jam)</span>
                                <button onClick={() => updateNotif('comeBack', !notifPrefs.comeBack)} className={`w-10 h-5 rounded-full relative transition-colors ${!notifPrefs.comeBack ? 'bg-gray-300' : 'bg-pink-500'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${!notifPrefs.comeBack ? 'left-0.5' : 'left-5'}`}></div>
                                </button>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">Pesan Penyemangat</span>
                                <button onClick={() => updateNotif('affirmation', notifPrefs.affirmation !== false ? false : true)} className={`w-10 h-5 rounded-full relative transition-colors ${notifPrefs.affirmation === false ? 'bg-gray-300' : 'bg-pink-500'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifPrefs.affirmation === false ? 'left-0.5' : 'left-5'}`}></div>
                                </button>
                            </div>
                            
                            <button onClick={() => { if(window.initPushManager) window.initPushManager(playerName, true); }} className="mt-2 text-xs text-pink-500 font-bold hover:underline self-start">
                                Izinkan Notifikasi Browser
                            </button>
                        </div>
                    </div>
                    
                    {/* Cloud Sync Status */}
                    <div className="flex flex-col gap-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-700">Cloud Sync</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${syncStatus === 'Connected' ? 'bg-green-500' : syncStatus === 'Syncing' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs font-bold text-gray-500 uppercase">{syncStatus}</span>
                                <button onClick={() => { if(setShowSyncLog) setShowSyncLog(true); onClose(); }} className="ml-1 text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 p-1 rounded-full transition-colors">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <button onClick={() => {
                        AudioEngine.uiConfirm();
                        onLogout();
                    }} className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                        Keluar Akun
                    </button>
                </div>
            </div>
        </div>
    );
};


const CloudSyncPanel = ({ syncStatus, syncLogs, profile, playerName, onClose, setProfile, saveProfile }) => {
    const { useState, useEffect, useMemo, useRef } = React;
    
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [filter, setFilter] = useState('Semua');
    
    // Status State
    const [diagnostics, setDiagnostics] = useState({
        // Cloud
        cloudConnected: false,
        cloudSaveVersion: 'Unknown',
        localSaveVersion: 'Unknown',
        lastUpload: 'Never',
        lastDownload: 'Never',
        queueSize: 0,
        // Push
        pushSupported: false,
        swRegistered: false,
        pushPermission: 'default',
        pushSubscribed: false,
        vapidLoaded: false,
        // Device
        online: true,
        platform: navigator.platform || 'Unknown',
        browser: 'Unknown',
        pwaMode: window.matchMedia('(display-mode: standalone)').matches ? 'Active' : 'Inactive',
        memory: 'Unknown',
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language || 'Unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
        // Supabase
        supabaseConnected: !!window.supabase,
        login: playerName ? `Active (${playerName})` : 'Guest'
    });

    useEffect(() => {
        // Detect browser roughly
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        if (ua.includes('Firefox/')) browser = 'Firefox';
        else if (ua.includes('Chrome/')) browser = 'Chrome';
        else if (ua.includes('Safari/')) browser = 'Safari';
        
        // Memory
        let mem = 'Unknown';
        if (navigator.deviceMemory) mem = `${navigator.deviceMemory}GB`;

        const checkRealtimeStatus = async () => {
            let battery = null;
            if (navigator.getBattery) {
                try {
                    const bm = await navigator.getBattery();
                    battery = `${Math.round(bm.level * 100)}% ${bm.charging ? '(Charging)' : ''}`.trim();
                } catch(e) {}
            }
            const swReg = await navigator.serviceWorker?.getRegistration();
            const isSwReg = !!swReg;
            
            let isSubscribed = false;
            let vapidLoaded = false;
            
            if (isSwReg && swReg.pushManager) {
                const sub = await swReg.pushManager.getSubscription();
                isSubscribed = !!sub;
                
                // try to fetch VAPID
                try {
                    const res = await fetch('/api/push').catch(()=>null);
                    if (res && res.ok) {
                        const data = await res.json().catch(()=>({}));
                        if (data.publicKey) vapidLoaded = true;
                    }
                } catch(e){}
            }

            const currentPayload = window.SaveEngine?.currentPayload || null;
            const localRev = currentPayload?._engine?.revision || 0;
            const qSize = window.QueueEngine?.queue?.length || 0;
            
            let cloudRev = 'Unknown';
            let cloudConnected = false;
            if (playerName && navigator.onLine) {
                 try {
                     const data = await window.CloudEngine?.fetchCloud(playerName);
                     if (data) {
                         cloudRev = data._engine?.revision || 0;
                         cloudConnected = true;
                     }
                 } catch(e){}
            }

            setDiagnostics(prev => ({
                ...prev,
                online: navigator.onLine,
                pushSupported: 'serviceWorker' in navigator && 'PushManager' in window,
                swRegistered: isSwReg,
                pushPermission: Notification.permission,
                pushSubscribed: isSubscribed,
                vapidLoaded,
                localSaveVersion: localRev,
                cloudSaveVersion: cloudRev,
                queueSize: qSize,
                cloudConnected,
                browser,
                memory: mem,
                battery,
                resolution: `${window.innerWidth}x${window.innerHeight}`
            }));
        };

        checkRealtimeStatus();
        const interval = setInterval(checkRealtimeStatus, 5000);
        
        const updateOnline = () => setDiagnostics(prev => ({...prev, online: navigator.onLine}));
        window.addEventListener('online', updateOnline);
        window.addEventListener('offline', updateOnline);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('online', updateOnline);
            window.removeEventListener('offline', updateOnline);
        };
    }, [playerName]);

    // Format logs
    const formattedLogs = useMemo(() => {
        return (syncLogs || []).map((rawLog, idx) => {
            // rawLog is like: "15:47:04 - [Module] Message Data"
            let time = '';
            let module = 'System';
            let message = rawLog;
            let level = 'INFO';
            
            const timeMatch = rawLog.match(/^(d{2}:d{2}:d{2})s*-s*(.*)/);
            if (timeMatch) {
                time = timeMatch[1];
                message = timeMatch[2];
            }
            
            const moduleMatch = message.match(/^[(.*?)]s*(.*)/);
            if (moduleMatch) {
                module = moduleMatch[1];
                message = moduleMatch[2];
            }
            
            const msgLower = message.toLowerCase();
            if (msgLower.includes('failed') || msgLower.includes('error') || msgLower.includes('gagal') || msgLower.includes('aborted')) {
                level = 'ERROR';
            } else if (msgLower.includes('berhasil') || msgLower.includes('successful') || msgLower.includes('complete')) {
                level = 'SUCCESS';
            } else if (msgLower.includes('conflict') || msgLower.includes('warning')) {
                level = 'WARNING';
            }
            
            return { id: idx, time, module, message, level, raw: rawLog };
        });
    }, [syncLogs]);

    const filteredLogs = useMemo(() => {
        if (filter === 'Semua') return formattedLogs;
        return formattedLogs.filter(l => l.module.toLowerCase() === filter.toLowerCase());
    }, [formattedLogs, filter]);

    const filters = ['Semua', 'Cloud', 'Push', 'Auth', 'Save', 'Session', 'System', 'UI', 'Engine'];

    const getLevelBadge = (level) => {
        if (level === 'ERROR') return 'bg-red-100 text-red-600 border-red-200';
        if (level === 'SUCCESS') return 'bg-green-100 text-green-600 border-green-200';
        if (level === 'WARNING') return 'bg-yellow-100 text-yellow-600 border-yellow-200';
        return 'bg-blue-100 text-blue-600 border-blue-200';
    };

    const getStatusColor = (val, okCondition, warnCondition) => {
        if (val === okCondition) return 'bg-emerald-500';
        if (warnCondition && val === warnCondition) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const StatusItem = ({ label, value, statusColor }) => (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm font-bold text-gray-500">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800">{value}</span>
                {statusColor && <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>}
            </div>
        </div>
    );

    const handleForceSync = async () => {
        setLoading(true);
        setLoadingMessage('Mengecek Status Sinkronisasi...');
        try {
            if (window.EngineUtils) window.EngineUtils.log('UI', 'Manual force sync initiated');
            const cloudData = await window.CloudEngine?.fetchCloud(playerName);
            const currentPayload = window.SaveEngine?.currentPayload;
            if (cloudData && currentPayload) {
                if (cloudData._engine.revision > currentPayload._engine.revision) {
                    setLoadingMessage('Cloud lebih baru. Mengunduh...');
                    setProfile(cloudData.gameData);
                    window.SaveEngine.currentPayload = cloudData;
                    window.RecoveryEngine?.saveLocalBackup(playerName, cloudData);
                    if (window.EngineUtils) window.EngineUtils.log('UI', 'Berhasil disinkronkan dari Cloud');
                } else if (cloudData._engine.revision < currentPayload._engine.revision) {
                    setLoadingMessage('Lokal lebih baru. Mengunggah...');
                    await window.CloudEngine?.pushCloud(playerName, currentPayload);
                    if (window.EngineUtils) window.EngineUtils.log('UI', 'Berhasil disinkronkan ke Cloud');
                } else {
                    if (window.EngineUtils) window.EngineUtils.log('UI', 'Data sudah sinkron. Tidak ada perubahan.');
                }
            } else if (currentPayload) {
                setLoadingMessage('Data Cloud kosong. Mengunggah...');
                await window.CloudEngine?.pushCloud(playerName, currentPayload);
                if (window.EngineUtils) window.EngineUtils.log('UI', 'Berhasil disinkronkan ke Cloud');
            }
        } catch(e) {
            if (window.EngineUtils) window.EngineUtils.log('UI', 'Sinkronisasi manual gagal', e.message);
        } finally {
            setLoading(false);
        }
    };

    const copyLogs = () => {
        const text = formattedLogs.map(l => `[${l.time}] [${l.level}] [${l.module}] ${l.message}`).join('\n');
        navigator.clipboard.writeText(text);
        if (window.EngineUtils) window.EngineUtils.log('UI', 'Log copied to clipboard');
    };

    const exportTxt = () => {
        const text = formattedLogs.map(l => `[${l.time}] [${l.level}] [${l.module}] ${l.message}`).join('\n');
        const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sweet_connect_log_${new Date().getTime()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportJson = () => {
        const data = JSON.stringify({ diagnostics, logs: formattedLogs }, null, 2);
        const blob = new Blob([data], {type: "application/json;charset=utf-8"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sweet_connect_diagnostics_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="absolute inset-0 bg-[#F2F2F7] flex flex-col z-[100] animate-page-enter overflow-hidden relative">
            <div className="w-full flex items-center justify-between mb-4 mt-2 px-2 sticky top-0 bg-white/50 backdrop-blur-md z-20 py-2 border-b border-gray-200 shadow-sm">
                <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-500 shadow-sm transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex bg-white rounded-xl px-4 py-1.5 shadow-sm border border-gray-200">
                    <h2 className="text-sm font-black text-gray-800">Status Sistem</h2>
                </div>
                <div className="w-10"></div>
            </div>
            
            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                    <p className="font-bold text-gray-600">{loadingMessage}</p>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    
                    {/* Device Status */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </div>
                            <span className="font-bold text-gray-800">Device & Runtime</span>
                        </div>
                        <div className="flex flex-col">
                            <StatusItem label="Internet" value={diagnostics.online ? 'Online' : 'Offline'} statusColor={getStatusColor(diagnostics.online, true)} />
                            <StatusItem label="Platform" value={diagnostics.platform} />
                            <StatusItem label="Browser" value={diagnostics.browser} />
                            <StatusItem label="PWA Mode" value={diagnostics.pwaMode} statusColor={getStatusColor(diagnostics.pwaMode, 'Active', 'Inactive')} />
                            <StatusItem label="Memory" value={diagnostics.memory} />
                            <StatusItem label="Resolution" value={diagnostics.resolution} />
                            <StatusItem label="Language" value={diagnostics.language} />
                            <StatusItem label="Timezone" value={diagnostics.timezone} />
                            {diagnostics.battery && <StatusItem label="Battery" value={diagnostics.battery} />}
                        </div>
                    </div>

                    {/* Push Notification */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            </div>
                            <span className="font-bold text-gray-800">Push Notification</span>
                        </div>
                        <div className="flex flex-col">
                            <StatusItem label="API Supported" value={diagnostics.pushSupported ? 'Supported' : 'Unsupported'} statusColor={getStatusColor(diagnostics.pushSupported, true)} />
                            <StatusItem label="Permission" value={diagnostics.pushPermission} statusColor={getStatusColor(diagnostics.pushPermission, 'granted', 'default')} />
                            <StatusItem label="Service Worker" value={diagnostics.swRegistered ? 'Registered' : 'Missing'} statusColor={getStatusColor(diagnostics.swRegistered, true)} />
                            <StatusItem label="VAPID Key" value={diagnostics.vapidLoaded ? 'Loaded' : 'Configuration Required'} statusColor={diagnostics.vapidLoaded ? 'bg-emerald-500' : 'bg-amber-500'} />
                            <StatusItem label="Subscription" value={diagnostics.pushSubscribed ? 'Subscribed' : 'Not Subscribed'} statusColor={getStatusColor(diagnostics.pushSubscribed, true, false)} />
                        </div>
                    </div>

                    {/* Cloud Engine */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
                                </div>
                                <span className="font-bold text-gray-800">Cloud Engine</span>
                            </div>
                            <button onClick={handleForceSync} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Force Sync</button>
                        </div>
                        <div className="flex flex-col">
                            <StatusItem label="Cloud Connected" value={diagnostics.cloudConnected ? 'Yes' : 'No'} statusColor={getStatusColor(diagnostics.cloudConnected, true)} />
                            <StatusItem label="Login Status" value={diagnostics.login} statusColor={getStatusColor(!!playerName, true)} />
                            <StatusItem label="Local Save Version" value={`v${diagnostics.localSaveVersion}`} />
                            <StatusItem label="Cloud Save Version" value={`v${diagnostics.cloudSaveVersion}`} />
                            <StatusItem label="Pending Queue" value={diagnostics.queueSize} statusColor={diagnostics.queueSize === 0 ? 'bg-emerald-500' : 'bg-amber-500'} />
                        </div>
                    </div>

                    {/* Log Diagnostik */}
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col md:col-span-2">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                                </div>
                                <span className="font-bold text-gray-800">Log Diagnostik</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button onClick={copyLogs} className="text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">Salin</button>
                                <button onClick={exportTxt} className="text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">TXT</button>
                                <button onClick={exportJson} className="text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">JSON</button>
                                <button onClick={() => window.dispatchEvent(new Event('clearLogs'))} className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors">Hapus</button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex overflow-x-auto gap-2 pb-3 mb-2 no-scrollbar border-b border-gray-100">
                            {filters.map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Log Window */}
                        <div className="bg-[#0D1117] rounded-2xl p-4 h-80 overflow-y-auto flex flex-col gap-2 font-mono text-xs">
                            {filteredLogs.length > 0 ? filteredLogs.map((l, i) => (
                                <div key={i} className="flex items-start gap-2 border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-1 -mx-1 rounded">
                                    <span className="text-gray-500 shrink-0 mt-0.5">{l.time}</span>
                                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getLevelBadge(l.level)}`}>{l.level}</span>
                                    <span className="shrink-0 text-pink-400 font-bold">[{l.module}]</span>
                                    <span className="text-gray-300 break-words flex-1 leading-relaxed">{l.message}</span>
                                </div>
                            )) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 mb-2 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                    <p className="italic">Tidak ada log untuk filter "{filter}".</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
window.CloudSyncPanel = CloudSyncPanel;

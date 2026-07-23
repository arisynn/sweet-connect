const PushDebugConsole = ({ playerName, onClose }) => {
    const [logs, setLogs] = React.useState([]);
    const [isRunning, setIsRunning] = React.useState(false);
    const [systemInfo, setSystemInfo] = React.useState(null);

    const addLog = (message, status = 'info', detail = null) => {
        setLogs(prev => [...prev, { message, status, detail, time: new Date().toLocaleTimeString() }]);
    };

    const urlB64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const runDebug = async () => {
        setLogs([]);
        setIsRunning(true);
        setSystemInfo(null);

        let currentSystemInfo = {
            notificationPermission: 'unknown',
            serviceWorkerState: 'unknown',
            endpoint: 'none',
            playerName: playerName || 'unknown',
            browser: navigator.userAgent,
            platform: navigator.platform
        };
        const updateSysInfo = (updates) => {
            currentSystemInfo = { ...currentSystemInfo, ...updates };
            setSystemInfo(currentSystemInfo);
        };

        try {
            // 1. Browser support
            if (!('PushManager' in window)) {
                throw new Error("PushManager not available in browser");
            }
            addLog("Browser mendukung Push API", "success");

            if (!('Notification' in window)) {
                throw new Error("Notification API not available in browser");
            }
            addLog("Notification API tersedia", "success");

            if (!('serviceWorker' in navigator)) {
                throw new Error("Service Worker not supported in browser");
            }
            addLog("Service Worker didukung", "success");

            // 2. Service worker active
            const registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                throw new Error("Service Worker not registered");
            }
            addLog("Service Worker ditemukan", "success");
            
            if (registration.active) {
                addLog(`Service Worker aktif (${registration.active.state})`, "success");
                updateSysInfo({ serviceWorkerState: registration.active.state });
            } else {
                 addLog(`Service Worker state: ${registration.installing ? 'installing' : (registration.waiting ? 'waiting' : 'unknown')}`, "warning");
                 updateSysInfo({ serviceWorkerState: 'not active yet' });
            }

            const readyReg = await navigator.serviceWorker.ready;
            
            // 3. Permission
            let permission = Notification.permission;
            updateSysInfo({ notificationPermission: permission });
            
            if (permission !== 'granted') {
                addLog(`Notification Permission: ${permission}, meminta izin...`, "info");
                permission = await Notification.requestPermission();
                updateSysInfo({ notificationPermission: permission });
                if (permission !== 'granted') {
                    throw new Error(`Permission ditolak: ${permission}`);
                }
            }
            addLog("Notification Permission : granted", "success");

            // 4. Get Subscription
            addLog("Mendapatkan Push Subscription...", "info");
            let subscription = await readyReg.pushManager.getSubscription();
            
            if (!subscription) {
                addLog("Tidak ada subscription, mengambil VAPID key...", "info");
                const vapidRes = await fetch('/api/push');
                if (!vapidRes.ok) {
                     const errText = await vapidRes.text();
                     throw new Error(`Gagal mengambil VAPID key: ${vapidRes.status} ${errText}`);
                }
                const vapidData = await vapidRes.json();
                if (!vapidData.publicKey) {
                     throw new Error("VAPID public key tidak ditemukan dari backend");
                }
                addLog("VAPID key diterima, membuat subscription baru...", "success");
                
                const convertedVapidKey = urlB64ToUint8Array(vapidData.publicKey);
                subscription = await readyReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            }
            
            addLog("Push Subscription berhasil didapatkan", "success");
            
            if (!subscription.endpoint) {
                throw new Error("Subscription endpoint tidak valid");
            }
            addLog("Subscription endpoint valid", "success");
            updateSysInfo({ endpoint: subscription.endpoint.substring(0, 50) + '...' });

            if (!playerName) {
                throw new Error("Player name tidak tersedia (user belum login/guest)");
            }
            addLog(`User login ditemukan: ${playerName}`, "success");

            // 5. Send to backend
            addLog("Mengirim subscription ke backend...", "info");
            const saveRes = await fetch('/api/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'subscribe',
                    playerName: playerName,
                    subscription: subscription
                })
            });
            
            let saveData;
            try {
                saveData = await saveRes.json();
            } catch(e) {
                const text = await saveRes.text();
                throw new Error(`Response backend tidak valid JSON: ${text}`);
            }

            if (!saveRes.ok || !saveData.success) {
                throw new Error(`Gagal menyimpan ke Supabase: ${saveData.error || JSON.stringify(saveData)}`);
            }
            
            addLog("Subscription berhasil disimpan di backend", "success", JSON.stringify(saveData, null, 2));

            // 6. Test push
            addLog("Mengambil subscription dari database dan mengirim test push...", "info");
            const testRes = await fetch('/api/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'testPush', playerName })
            });

            let testData;
            try {
                testData = await testRes.json();
            } catch(e) {
                const text = await testRes.text();
                throw new Error(`Response test push bukan JSON: ${text}`);
            }

            if (!testRes.ok || !testData.success) {
                 if (testData.error === "No subscriptions found for player") {
                      throw new Error("Backend tidak dapat menemukan subscription di database (kemungkinan gagal insert ke Supabase / RLS policy).");
                 }
                 throw new Error(`Test push gagal: ${testData.error || JSON.stringify(testData)}`);
            }
            
            updateSysInfo({ 
                subscriptionCount: testData.results ? testData.results.length : 1 
            });

            addLog("Push berhasil dikirim oleh backend", "success", JSON.stringify(testData, null, 2));
            addLog("Selesai. Silakan periksa notifikasi di perangkat Anda.", "success");

        } catch (error) {
            addLog(`Gagal: ${error.message}`, "error", error.stack);
        } finally {
            setIsRunning(false);
            setSystemInfo(currentSystemInfo);
        }
    };

    React.useEffect(() => {
        runDebug();
    }, []);

    const copyLog = () => {
        const text = logs.map(l => `[${l.time}] ${l.status.toUpperCase()}: ${l.message}\n${l.detail ? l.detail : ''}`).join('\n\n') + '\n\nSystem Info:\n' + JSON.stringify(systemInfo, null, 2);
        navigator.clipboard.writeText(text);
        alert("Log dicopy ke clipboard!");
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 font-mono text-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl text-green-400">
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-950 rounded-t-lg">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Push Notification Debug
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {logs.map((log, i) => (
                        <div key={i} className={`flex flex-col gap-1 ${log.status === 'error' ? 'text-red-400' : log.status === 'warning' ? 'text-yellow-400' : log.status === 'info' ? 'text-blue-300' : 'text-green-400'}`}>
                            <div className="flex gap-3">
                                <span className="opacity-50 shrink-0">[{log.time}]</span>
                                <span className="shrink-0">
                                    {log.status === 'success' && '✓'}
                                    {log.status === 'error' && '✗'}
                                    {log.status === 'warning' && '⚠'}
                                    {log.status === 'info' && 'ℹ'}
                                </span>
                                <span>{log.message}</span>
                            </div>
                            {log.detail && (
                                <pre className="ml-20 mr-4 p-2 bg-black/50 rounded text-xs overflow-x-auto text-gray-300 border border-gray-800">
                                    {log.detail}
                                </pre>
                            )}
                        </div>
                    ))}
                    {isRunning && (
                        <div className="flex gap-3 text-gray-500 animate-pulse">
                            <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                            <span>...</span>
                            <span>Menunggu proses...</span>
                        </div>
                    )}
                </div>
                
                {systemInfo && (
                    <div className="p-4 bg-gray-950 border-t border-gray-700 text-xs text-gray-400 grid grid-cols-2 gap-2">
                        <div><span className="text-gray-500">Permission:</span> {systemInfo.notificationPermission}</div>
                        <div><span className="text-gray-500">SW State:</span> {systemInfo.serviceWorkerState}</div>
                        <div className="col-span-2 truncate"><span className="text-gray-500">Endpoint:</span> {systemInfo.endpoint}</div>
                        <div><span className="text-gray-500">Player ID:</span> {systemInfo.playerName}</div>
                        <div><span className="text-gray-500">Subscriptions:</span> {systemInfo.subscriptionCount !== undefined ? systemInfo.subscriptionCount : '?'}</div>
                        <div className="col-span-2 truncate"><span className="text-gray-500">Browser:</span> {systemInfo.browser}</div>
                        <div><span className="text-gray-500">Platform:</span> {systemInfo.platform}</div>
                    </div>
                )}

                <div className="p-4 border-t border-gray-700 flex justify-end gap-3 bg-gray-900 rounded-b-lg">
                    <button onClick={copyLog} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors text-sm">
                        Copy Log
                    </button>
                    <button onClick={runDebug} disabled={isRunning} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors text-sm">
                        Retry
                    </button>
                    <button onClick={onClose} className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded transition-colors text-sm">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

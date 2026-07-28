function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
    return outputArray;
}

window.NotificationService = {
    isSupported: () => 'serviceWorker' in navigator && 'PushManager' in window,
    needsPermission: () => window.NotificationService.isSupported() && Notification.permission === 'default',
    hasPermission: () => window.NotificationService.isSupported() && Notification.permission === 'granted',
    
    initPushManager: async (playerName, forcePrompt = false) => {
        if (!window.NotificationService.isSupported()) return false;
        
        if (Notification.permission === 'default') {
            if (!forcePrompt) return 'needs_prompt';
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return false;
        } else if (Notification.permission === 'denied') {
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const response = await fetch('/api/push').catch(() => null);
            if (!response || !response.ok) return false;
            
            const data = await response.json().catch(() => ({}));
            if (!data.publicKey) return false;
            
            const convertedVapidKey = urlBase64ToUint8Array(data.publicKey);
            let subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                const currentKey = new Uint8Array(subscription.options.applicationServerKey);
                let match = currentKey.length === convertedVapidKey.length && currentKey.every((v, i) => v === convertedVapidKey[i]);
                if (!match) {
                    await subscription.unsubscribe();
                    subscription = null;
                }
            }
            
            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
            }
            
            const saveRes = await fetch('/api/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'subscribe', playerName, subscription })
            });
            const saveData = await saveRes.json();
            return saveData.success;
        } catch (e) {
            console.error('[NotificationService] Error initializing:', e);
            return false;
        }
    },
    
    sendPush: async (playerName, category, title, body) => {
        try {
            await fetch('/api/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'sendNotification', playerName, category, title, body })
            });
        } catch (e) {
            console.error('[NotificationService] Failed to send push:', e);
        }
    },

    triggerGlobalCron: async () => {
        try {
            const lastRun = localStorage.getItem('last_offline_cron');
            const now = Date.now();
            if (lastRun && (now - parseInt(lastRun)) < 3600000) return;
            
            await fetch('/api/push?action=cron_affirmations', { method: 'GET' });
            localStorage.setItem('last_offline_cron', now.toString());
        } catch(e) {}
    }
};

// Backward compatibility for old codebase
window.initPushManager = window.NotificationService.initPushManager;
window.checkNotificationPromptNeeded = window.NotificationService.needsPermission;
window.triggerOfflineCron = window.NotificationService.triggerGlobalCron;

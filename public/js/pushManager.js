// pushManager.js

function urlBase64ToUint8Array(base64String) {
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
}

window.checkNotificationPromptNeeded = function() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
    }
    return Notification.permission === 'default';
};

window.triggerOfflineCron = async function() {
    try {
        const lastRun = localStorage.getItem('last_offline_cron');
        const now = Date.now();
        // Hanya jalankan maksimal 1 jam sekali (3600000 ms) dari setiap client
        if (lastRun && (now - parseInt(lastRun)) < 3600000) {
            return;
        }
        
        // Panggil endpoint cron_affirmations secara background
        fetch('/api/push?action=cron_affirmations', {
            method: 'GET'
        }).catch(e => console.warn('Offline cron trigger failed', e));
        
        localStorage.setItem('last_offline_cron', now.toString());
    } catch (e) {
        console.warn('Error running offline cron', e);
    }
};

window.initPushManager = async function(playerName, forcePrompt = false) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications are not supported by this browser.');
        return false;
    }
    
    // Request permission if not already granted or denied
    if (Notification.permission === 'default') {
        if (!forcePrompt) {
            // Need permission, but we won't prompt now.
            return 'needs_prompt';
        }
        
        console.log('Requesting push notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Permission status:', permission);
        if (permission !== 'granted') {
            console.log('Push notification permission denied.');
            return false;
        }
    } else if (Notification.permission === 'denied') {
        console.log('Push notification permission is already denied.');
        return false;
    }

    try {
        console.log('Waiting for service worker ready...');
        const registration = await navigator.serviceWorker.ready;
        console.log('Service worker is ready.');
        let subscription = await registration.pushManager.getSubscription();
        let isNewSubscription = false;
        
        if (!subscription) {
            console.log('No subscription found, fetching VAPID public key from backend...');
            // Get public VAPID key from backend
            const response = await fetch('/api/push');
            const data = await response.json();
            
            if (!data.publicKey) {
                console.error('Failed to retrieve VAPID public key');
                return false;
            }
            
            const convertedVapidKey = urlBase64ToUint8Array(data.publicKey);
            console.log('Subscribing to push manager...');
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });
            console.log('Successfully subscribed to push notifications.');
            isNewSubscription = true;
        } else {
            console.log('Existing push subscription found.');
        }

        console.log('Sending subscription to backend to save in Supabase...');
        // Send subscription to backend
        const saveRes = await fetch('/api/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'subscribe',
                playerName,
                subscription
            })
        });

        const saveData = await saveRes.json();
        if (saveData.success) {
            console.log('Subscription saved successfully in backend.');
            return true;
        } else {
            console.error('Backend failed to save subscription:', saveData.error);
            return false;
        }

    } catch (error) {
        console.error('Error during push manager initialization:', error);
        return false;
    }
}

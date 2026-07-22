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
        
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Push notification permission denied.');
            return false;
        }
    } else if (Notification.permission === 'denied') {
        console.log('Push notification permission is already denied.');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
            // Get public VAPID key from backend
            const response = await fetch('/api/push');
            const data = await response.json();
            
            if (!data.publicKey) {
                console.error('Failed to retrieve VAPID public key');
                return;
            }
            
            const convertedVapidKey = urlBase64ToUint8Array(data.publicKey);
            
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });
            console.log('Subscribed to push notifications');
        }

        // Send subscription to backend
        await fetch('/api/push', {
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
        return true;

    } catch (error) {
        console.error('Error during push manager initialization:', error);
        return false;
    }
}

// Version: 1.0.1
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => self.clients.claim());
self.addEventListener('fetch', (e) => {});

self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body,
                icon: data.icon || '/logo.png',
                badge: data.badge || '/logo.png',
                vibrate: data.vibrate || [100, 50, 100],
                data: data.url || '/'
            };
            
            event.waitUntil(
                clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
                    const isFocused = clientList.some(client => client.visibilityState === 'visible');
                    
                    if (isFocused) {
                        // Jika aplikasi sedang terbuka dan terlihat, jangan tampilkan notifikasi sistem (hindari spam).
                        // Kirim pesan ke client agar bisa ditampilkan sebagai toast in-app jika diperlukan.
                        clientList.forEach(client => {
                            client.postMessage({
                                type: 'PUSH_NOTIFICATION',
                                payload: data
                            });
                        });
                        return null; // Batal kirim notifikasi sistem
                    } else {
                        // Tampilkan notifikasi sistem jika aplikasi di background atau ditutup
                        return self.registration.showNotification(data.title || 'Sweet Connect', options);
                    }
                })
            );
        } catch (e) {
            console.error('Push data is not valid JSON:', e);
            // Fallback for simple text payloads
            event.waitUntil(
                clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
                    const isFocused = clientList.some(client => client.visibilityState === 'visible');
                    if (isFocused) return null;
                    
                    return self.registration.showNotification('Sweet Connect', {
                        body: event.data.text(),
                        icon: '/logo.png'
                    });
                })
            );
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            const url = event.notification.data || '/';
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

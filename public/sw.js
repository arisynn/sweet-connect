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
                self.registration.showNotification(data.title || 'Sweet Connect', options)
            );
        } catch (e) {
            console.error('Push data is not valid JSON:', e);
            // Fallback for simple text payloads
            event.waitUntil(
                self.registration.showNotification('Sweet Connect', {
                    body: event.data.text(),
                    icon: '/logo.png'
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

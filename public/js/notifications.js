window.NotificationManager = {
    initialized: false,
    permission: 'default',
    timers: {},
    notified: {
        chest: false,
        login: false
    },
    
    init: async function() {
        if (!('Notification' in window)) return;
        this.permission = Notification.permission;
        
        // Wait for user interaction to request permission if not granted
        if (this.permission === 'default') {
            const requestOnInteraction = () => {
                Notification.requestPermission().then(p => {
                    this.permission = p;
                });
                document.removeEventListener('click', requestOnInteraction);
            };
            document.addEventListener('click', requestOnInteraction);
        }
        this.initialized = true;
    },
    
    reset: function() {
        Object.values(this.timers).forEach(t => clearTimeout(t));
        this.timers = {};
        this.notified = { chest: false, login: false };
    },
    
    send: function(title, options) {
        if (!('Notification' in window) || this.permission !== 'granted') return;
        
        // Mencegah spam notifikasi sistem jika aplikasi sedang dibuka dan terlihat
        if (document.visibilityState === 'visible') {
            console.log('[NotificationManager] Skipped OS notification because app is visible:', title);
            return;
        }

        try {
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification(title, options);
                });
            } else {
                new Notification(title, options);
            }
        } catch (e) {
            console.error('Notification error', e);
        }
    },
    
    scheduleChest: function(profile) {
        if (!profile || !profile.chestSlots) return;
        
        // Find the earliest chest
        let earliest = null;
        let now = Date.now();
        
        profile.chestSlots.forEach(chest => {
            if (chest) {
                let timeLeft = chest.unlockTime - now;
                if (timeLeft > 0) {
                    if (!earliest || timeLeft < earliest.timeLeft) {
                        earliest = { chest, timeLeft };
                    }
                } else if (timeLeft <= 0 && !this.notified.chest) {
                    // Already ready, send now if we haven't
                    this.send('Peti Siap Dibuka!', {
                        body: 'Ada Peti yang sudah siap dibuka, ayo cek sekarang!',
                        icon: '/logo.png',
                        tag: 'chest-ready'
                    });
                    this.notified.chest = true;
                }
            }
        });
        
        if (earliest) {
            if (this.timers.chest) clearTimeout(this.timers.chest);
            this.notified.chest = false;
            this.timers.chest = setTimeout(() => {
                // Re-validate just before sending
                try {
                    const latestRaw = localStorage.getItem('sweet_connect_profile');
                    if (latestRaw) {
                        const latestProfile = JSON.parse(latestRaw);
                        if (!latestProfile.chestSlots || !latestProfile.chestSlots.some(c => c && c.unlockTime <= Date.now())) {
                            return; // Chest already opened or state changed
                        }
                    }
                } catch(e) {}

                this.send('Peti Siap Dibuka!', {
                    body: 'Peti kamu sudah siap dibuka, ayo cek sekarang!',
                    icon: '/logo.png',
                    tag: 'chest-ready'
                });
                this.notified.chest = true;
            }, earliest.timeLeft);
        }
    },
    
    checkLoginReward: function(profile) {
        if (!profile) return;
        
        const loginStatus = window.checkLoginRewardStatus(profile);
        if (loginStatus.canClaim && !this.notified.login) {
            this.send('Hadiah Harian Siap!', {
                body: 'Login Reward kamu untuk hari ini sudah bisa diklaim!',
                icon: '/logo.png',
                tag: 'login-reward'
            });
            this.notified.login = true;
        }
    }
};

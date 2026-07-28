window.NotificationScheduler = {
    intervalId: null,
    playerName: null,
    profile: null,
    
    start: (playerName, profile) => {
        window.NotificationScheduler.stop();
        if (!playerName || !profile) return;
        
        window.NotificationScheduler.playerName = playerName;
        window.NotificationScheduler.profile = profile;
        
        // Kita gunakan 60 menit agar tidak spam
        window.NotificationScheduler.intervalId = setInterval(async () => {
            await window.NotificationScheduler.evaluateAndSend();
            // Juga jalankan global cron dari sisi client (sesuai existing)
            if (window.NotificationService && window.NotificationService.triggerGlobalCron) {
                window.NotificationService.triggerGlobalCron();
            }
        }, 3600000); // 1 hour
        
        console.log(`[NotificationScheduler] Started for ${playerName}`);
    },
    
    stop: () => {
        if (window.NotificationScheduler.intervalId) {
            clearInterval(window.NotificationScheduler.intervalId);
            window.NotificationScheduler.intervalId = null;
            console.log(`[NotificationScheduler] Stopped`);
        }
        window.NotificationScheduler.playerName = null;
        window.NotificationScheduler.profile = null;
    },
    
    restart: (playerName, profile) => {
        window.NotificationScheduler.start(playerName, profile);
    },
    
    evaluateAndSend: async () => {
        const playerName = window.NotificationScheduler.playerName;
        const profile = window.NotificationScheduler.profile;
        if (!playerName || !profile) return;
        
        const prefs = profile.notificationPrefs || {};
        if (prefs.affirmation === false) return; // Jika disabled
        
        const category = window.NotificationTimeResolver.getTimeCategory();
        const greeting = window.NotificationTimeResolver.getGreeting(category);
        
        const messages = await window.NotificationLoader.loadMessages(category);
        const randomMsg = window.NotificationRandomizer.getRandomMessage(messages, category);
        
        const title = greeting;
        const body = randomMsg;
        
        console.log(`[NotificationScheduler] Sending customized push: ${title} - ${body}`);
        await window.NotificationService.sendPush(playerName, 'custom', title, body);
    }
};

window.NotificationEngine = {
    triggerCron: async () => {
        if (window.NotificationService && window.NotificationService.triggerGlobalCron) {
            window.NotificationService.triggerGlobalCron();
        }
    }
};

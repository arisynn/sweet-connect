window.NotificationEngine = {
    triggerCron: async () => {
        try {
            await fetch('/api/push?action=cron_affirmations', { method: 'POST' });
        } catch (e) {
            window.EngineUtils.log('Notification', 'Cron trigger failed', e);
        }
    }
};

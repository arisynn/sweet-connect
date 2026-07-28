window.NotificationTimeResolver = {
    getTimeCategory: () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'morning';
        if (hour >= 11 && hour < 15) return 'afternoon';
        if (hour >= 15 && hour < 18) return 'evening';
        if (hour >= 18 && hour < 22) return 'night';
        return 'lateNight';
    },
    getGreeting: (category) => {
        switch (category) {
            case 'morning': return 'Selamat pagi!';
            case 'afternoon': return 'Selamat siang!';
            case 'evening': return 'Selamat sore!';
            case 'night': return 'Selamat malam!';
            default: return 'Masih bangun?';
        }
    }
};

window.NotificationLoader = {
    cache: {},
    loadMessages: async (category) => {
        if (window.NotificationLoader.cache[category]) {
            return window.NotificationLoader.cache[category];
        }
        try {
            const res = await fetch(`/notifications/${category}.json`);
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            window.NotificationLoader.cache[category] = data;
            return data;
        } catch (e) {
            console.warn(`[NotificationLoader] Failed to load ${category}.json`, e);
            // Fallback affirmations
            return ["Semoga harimu menyenangkan.", "Kamu pasti bisa!", "Jangan lupa senyum hari ini."];
        }
    }
};

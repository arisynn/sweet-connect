window.SPLASH_TEXTS = ["Senyum terus ya", "Kamu hebat hari ini", "Bisa karena terbiasa", "I'm proud of you", "Cantik banget hari ini", "Jangan lupa istirahat", "Dunia lebih indah ada kamu", "Tetap semangat manis", "You are my sunshine", "Bahagia selalu ya"];
window.BADGE_TEXTS = ["Semangat sayang", "I love you", "Kamu pasti bisa", "Miss you", "Pinter banget", "Have fun sayang", "Kangen kamu", "My only one", "Ayo main"];

window.getInitialTheme = () => {
    const name = window.AuthEngine?.getLoggedInUser();
    if (!name) return 'sweets';
    try {
        const raw = localStorage.getItem(`SC_BACKUP_${name}`);
        if (raw) {
            const parsed = JSON.parse(raw);
            const data = parsed.gameData || parsed.data || parsed;
            if (data && data.activeTheme) return data.activeTheme;
        }
        
        // Fallback for legacy format
        const oldRaw = localStorage.getItem(`sweet_connect_${name}`);
        if (oldRaw) {
            const parsed = JSON.parse(oldRaw);
            if (parsed && parsed.activeTheme) return parsed.activeTheme;
        }
    } catch(e) {}
    return 'sweets';
};

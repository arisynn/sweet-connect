// ===================== PWA SETUP (service worker) =====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

// ===================== MOUNT =====================
async function initApp() {
    try {
        const res = await fetch('/themes.json?t=' + Date.now());
        if (res.ok) {
            const data = await res.json();
            const loadedThemes = {};
            data.themes.forEach(t => { 
                loadedThemes[t.id] = t; 
            });
            // Ensure custom theme is always present
            loadedThemes.custom = getFallbackThemes().custom;
            THEMES = loadedThemes;
        } else {
            throw new Error('Failed to load themes from API');
        }
    } catch (e) {
        console.warn('Using fallback themes due to error:', e);
        THEMES = getFallbackThemes();
    }
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
}

initApp();

// ===================== PWA SETUP (service worker) =====================
if ('serviceWorker' in navigator) {
    const registerSW = () => {
        console.log('[SW] Attempting to register service worker at /sw.js');
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(registration => {
                console.log('[SW] Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('[SW] Service Worker registration failed:', error);
            });
    };

    if (document.readyState === 'complete') {
        registerSW();
    } else {
        window.addEventListener('load', registerSW);
    }
}

// ===================== MOUNT =====================
async function initApp() {
    try {
        const res = await fetch('/themes.json?t=' + Date.now());
        if (res.ok) {
            const data = await res.json();
            const loadedThemes = {};
            data.themes.forEach(t => { 
                if (!t.colors) {
                    t.colors = t.darkMode 
                        ? { bg: '#171717', border: '#525252', text: '#d946ef', accent: '#c026d3', buttonActive: '#a21caf' }
                        : { bg: '#fdf2f8', border: '#fbcfe8', text: '#ec4899', accent: '#ec4899', buttonActive: '#e11d48' };
                }
                loadedThemes[t.id] = t; 
            });
            // Ensure custom theme is always present
            loadedThemes.custom = getFallbackThemes().custom;
            window.THEMES = loadedThemes; THEMES = window.THEMES;
        } else {
            throw new Error('Failed to load themes from API');
        }
    } catch (e) {
        console.warn('Using fallback themes due to error:', e);
        window.THEMES = getFallbackThemes(); THEMES = window.THEMES;
    }
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
}

initApp();

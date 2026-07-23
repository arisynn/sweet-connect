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
            
            // Merge all themes with the default 'sweets' theme to ensure missing assets fallback
            const defaultTheme = loadedThemes['sweets'] || getFallbackThemes().sweets;
            
            function deepMerge(target, source) {
                if (!source) return target;
                if (!target) return source;
                const output = Object.assign({}, target);
                for (const key of Object.keys(source)) {
                    if (source[key] instanceof Object && key !== 'data' && !Array.isArray(source[key])) {
                        if (!(key in target)) Object.assign(output, { [key]: source[key] });
                        else output[key] = deepMerge(target[key], source[key]);
                    } else {
                        output[key] = source[key];
                    }
                }
                return output;
            }
            
            for (const key in loadedThemes) {
                if (key !== 'sweets' && key !== 'custom') {
                    loadedThemes[key] = deepMerge(defaultTheme, loadedThemes[key]);
                }
            }

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

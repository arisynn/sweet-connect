import fs from 'fs';
let code = fs.readFileSync('public/js/audio.js', 'utf8');

code = code.replace(/const saveSettings = \(\) => \{\s*\/\/ CLOUD-ONLY: Audio settings are managed via the profile system\s*\};/g, `
    try {
        const saved = localStorage.getItem('sweetConnectAudioSettings');
        if (saved) {
            settings = { ...settings, ...JSON.parse(saved) };
        }
    } catch(e) {}

    const saveSettings = () => {
        try {
            localStorage.setItem('sweetConnectAudioSettings', JSON.stringify(settings));
            localStorage.setItem('pkmnIsMuted', String(settings.muteMusic && settings.muteSfx));
        } catch(e) {}
    };`);

fs.writeFileSync('public/js/audio.js', code);

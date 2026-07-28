import fs from 'fs';
let code = fs.readFileSync('public/game/game.js', 'utf8');

// Replace the handleExternalUpdate block:
/*
                if (newProfile.settings) {
                    setIsMuted(newProfile.settings.isMuted);
                    if (window.AudioEngine) {
                        window.AudioEngine.updateSettings({ 
                            muteMusic: newProfile.settings.isMuted, 
                            muteSfx: newProfile.settings.isMuted,
                            ...newProfile.settings.audio 
                        });
                    }
                }
*/
code = code.replace(/if \(newProfile\.settings\) \{[\s\S]*?setSweetMessage/g, 'setSweetMessage');


// Replace the finishStartup block:
/*
        if (finalProfile.settings) {
            setIsMuted(finalProfile.settings.isMuted);
            AudioEngine.updateSettings({ 
                muteMusic: finalProfile.settings.isMuted, 
                muteSfx: finalProfile.settings.isMuted,
                ...finalProfile.settings.audio 
            });
        }
*/
code = code.replace(/if \(finalProfile\.settings\) \{[\s\S]*?if \(!finalProfile\.unlockedThemes/g, 'if (!finalProfile.unlockedThemes');

// Replace the useEffect for isMuted:
/*
    useEffect(() => {
     localStorage.setItem("pkmnIsMuted", isMuted);
    AudioEngine.updateSettings({ muteMusic: isMuted, muteSfx: isMuted }); 
    setProfile(p => { 
        if(!p) return p;
        const newSettings = { ...(p.settings || {}), isMuted };
        const newP = { ...p, settings: newSettings };
        saveProfile(playerName, newP);
        return newP;
    });
}, [isMuted]);
*/
code = code.replace(/useEffect\(\(\) => \{\s*localStorage\.setItem\("pkmnIsMuted", isMuted\);[\s\S]*?\}, \[isMuted\]\);/g, `useEffect(() => {
     localStorage.setItem("pkmnIsMuted", isMuted);
    AudioEngine.updateSettings({ muteMusic: isMuted, muteSfx: isMuted }); 
}, [isMuted]);`);


fs.writeFileSync('public/game/game.js', code);

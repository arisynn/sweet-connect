import fs from 'fs';
let code = fs.readFileSync('public/game/game.js', 'utf8');

const target = `useEffect(() => {
     localStorage.setItem("pkmnIsMuted", isMuted);
    AudioEngine.updateSettings({ muteMusic: isMuted, muteSfx: isMuted }); 
}, [isMuted]);`;

code = code.replace(target, '');
fs.writeFileSync('public/game/game.js', code);

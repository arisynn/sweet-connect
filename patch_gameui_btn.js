import fs from 'fs';
let code = fs.readFileSync('public/game/GameUI.js', 'utf8');

code = code.replace(
    /onClick=\{\(\) => setIsMuted\(m => !m\)\}/,
    `onClick={() => { const newMuted = !isMuted; setIsMuted(newMuted); AudioEngine.updateSettings({ muteMusic: newMuted, muteSfx: newMuted }); }}`
);

fs.writeFileSync('public/game/GameUI.js', code);

import fs from 'fs';
let code = fs.readFileSync('public/game/game.js', 'utf8');

code = code.replace(
    /const \[isMuted, setIsMuted\] = useState\(\(\) => localStorage\.getItem\('pkmnIsMuted'\) === 'true'\);/,
    "const [isMuted, setIsMuted] = useState(() => (window.AudioEngine ? (window.AudioEngine.getSettings().muteMusic && window.AudioEngine.getSettings().muteSfx) : localStorage.getItem('pkmnIsMuted') === 'true'));"
);

fs.writeFileSync('public/game/game.js', code);

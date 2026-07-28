import fs from 'fs';
let code = fs.readFileSync('public/game/GameUI.js', 'utf8');

const target = `                        onClose={() => setShowSettings(false)} 
                        onLogout={() => {
                            if (handleLogout) handleLogout();
                            setShowSettings(false);
                        }} `;

const replacement = `                        onClose={() => { setShowSettings(false); setIsMuted(AudioEngine.getSettings().muteMusic && AudioEngine.getSettings().muteSfx); }} 
                        onLogout={() => {
                            if (handleLogout) handleLogout();
                            setShowSettings(false);
                            setIsMuted(AudioEngine.getSettings().muteMusic && AudioEngine.getSettings().muteSfx);
                        }} `;

code = code.replace(target, replacement);
fs.writeFileSync('public/game/GameUI.js', code);

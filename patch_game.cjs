const fs = require('fs');
let content = fs.readFileSync('public/game/game.js', 'utf-8');

// Insert window.PopupManager check right at the top of handlePopState
content = content.replace(
    'const handlePopState = (event) => {',
    `const handlePopState = (event) => {
            if (window.PopupManager && window.PopupManager.handlePopState()) {
                return; // PopupManager handled the popstate by closing a popup
            }`
);

// Fix LOBBY_MAIN logic to handle LOGIN too and prevent exiting
const lobbyLogicOld = `if (gameStateRef.current === 'LOBBY_MAIN') {
                const now = Date.now();
                if (now - backPressTimeRef.current < 2000) {
                    window.history.back(); 
                } else {
                    if (typeof window.Dialog !== 'undefined' && window.Dialog.showToast) {
                        window.Dialog.showToast("Tekan sekali lagi untuk keluar.");
                    }
                    backPressTimeRef.current = now;
                    window.history.pushState({ isAppHistory: true, gameState: 'LOBBY_MAIN', depth: 0 }, '', '');
                }
                return;
            }`;

const lobbyLogicNew = `if (gameStateRef.current === 'LOBBY_MAIN' || gameStateRef.current === 'LOGIN') {
                const now = Date.now();
                if (now - backPressTimeRef.current < 2000) {
                    window.history.back(); 
                } else {
                    if (typeof window.Dialog !== 'undefined' && window.Dialog.showToast) {
                        window.Dialog.showToast("Tekan sekali lagi untuk keluar.");
                    }
                    backPressTimeRef.current = now;
                    window.history.pushState({ isAppHistory: true, gameState: gameStateRef.current, depth: historyDepthRef.current || 0 }, '', '');
                }
                return;
            }`;

content = content.replace(lobbyLogicOld, lobbyLogicNew);

fs.writeFileSync('public/game/game.js', content);

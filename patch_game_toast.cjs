const fs = require('fs');
let content = fs.readFileSync('public/game/game.js', 'utf-8');

content = content.replace(
    'window.Dialog.showToast("Tekan sekali lagi untuk keluar.");',
    'window.Dialog.showToast("Tekan sekali lagi untuk keluar");'
);

fs.writeFileSync('public/game/game.js', content);

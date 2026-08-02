const fs = require('fs');
let content = fs.readFileSync('public/js/utils.js', 'utf-8');

content = content.replace(
    'window.PopupManager = {',
    `window.PopupManager = {
    _ignoreNextPop: false,`
);

content = content.replace(
    'window.history.back(); // Trigger popstate to remove the dummy state',
    `window.PopupManager._ignoreNextPop = true;
                window.history.back(); // Trigger popstate to remove the dummy state`
);

content = content.replace(
    'handlePopState: () => {',
    `handlePopState: () => {
        if (window.PopupManager._ignoreNextPop) {
            window.PopupManager._ignoreNextPop = false;
            return true;
        }`
);

fs.writeFileSync('public/js/utils.js', content);

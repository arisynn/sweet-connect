const fs = require('fs');
let content = fs.readFileSync('public/components/mysteryGift.js', 'utf-8');

// Replace showThemeShop and showPrizePool with PopupManager equivalents

content = content.replace(
    'const [showPrizePool, setShowPrizePool] = useState(false);',
    `const [showPrizePool, setShowPrizePoolState] = useState(false);
    const ppCloseCb = React.useRef(null);
    const setShowPrizePool = (val, fromPop = false) => {
        if (val && !showPrizePool) {
            ppCloseCb.current = (isPop) => setShowPrizePoolState(false);
            if (window.PopupManager) window.PopupManager.register(ppCloseCb.current);
        } else if (!val && showPrizePool) {
            if (window.PopupManager) window.PopupManager.unregister(ppCloseCb.current, fromPop === true);
        }
        setShowPrizePoolState(val);
    };`
);

content = content.replace(
    'const [showThemeShop, setShowThemeShop] = useState(false);',
    `const [showThemeShop, setShowThemeShopState] = useState(false);
    const tsCloseCb = React.useRef(null);
    const setShowThemeShop = (val, fromPop = false) => {
        if (val && !showThemeShop) {
            tsCloseCb.current = (isPop) => setShowThemeShopState(false);
            if (window.PopupManager) window.PopupManager.register(tsCloseCb.current);
        } else if (!val && showThemeShop) {
            if (window.PopupManager) window.PopupManager.unregister(tsCloseCb.current, fromPop === true);
        }
        setShowThemeShopState(val);
    };`
);

fs.writeFileSync('public/components/mysteryGift.js', content);

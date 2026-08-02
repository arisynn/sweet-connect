const fs = require('fs');
let content = fs.readFileSync('public/components/shop.js', 'utf-8');

// Replace standard useState for modalData with the PopupManager hooked version
content = content.replace(
    'const [modalData, setModalData] = useState(null);',
    `const [modalData, setModalDataState] = useState(null);
    const closeCbRef = React.useRef(null);
    const setModalData = (data, fromPop = false) => {
        if (data && !modalData) {
            closeCbRef.current = (isPop) => setModalDataState(null);
            if (window.PopupManager) window.PopupManager.register(closeCbRef.current);
        } else if (!data && modalData) {
            if (window.PopupManager) window.PopupManager.unregister(closeCbRef.current, fromPop === true);
        }
        setModalDataState(data);
    };`
);

content = content.replace(/setModalData\(null\)/g, 'setModalData(null)');

fs.writeFileSync('public/components/shop.js', content);

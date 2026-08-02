const fs = require('fs');
let content = fs.readFileSync('public/components/dialogSystem.js', 'utf-8');

const newDialogObj = `window.Dialog = {
    _isOpen: false,
    showSuccess: (title, desc, buttonText = 'OK') => {
        if (!window.Dialog._isOpen) { window.PopupManager.register((fromPop) => window.Dialog._internalClose(fromPop)); window.Dialog._isOpen = true; }
        if(dialogShowFn) dialogShowFn({ type: 'success', title, desc, confirmText: buttonText });
    },
    showError: (title, desc, buttonText = 'OK') => {
        if (!window.Dialog._isOpen) { window.PopupManager.register((fromPop) => window.Dialog._internalClose(fromPop)); window.Dialog._isOpen = true; }
        if(dialogShowFn) dialogShowFn({ type: 'error', title, desc, confirmText: buttonText });
    },
    showWarning: (title, desc, buttonText = 'OK') => {
        if (!window.Dialog._isOpen) { window.PopupManager.register((fromPop) => window.Dialog._internalClose(fromPop)); window.Dialog._isOpen = true; }
        if(dialogShowFn) dialogShowFn({ type: 'warning', title, desc, confirmText: buttonText });
    },
    showInfo: (title, desc, buttonText = 'OK') => {
        if (!window.Dialog._isOpen) { window.PopupManager.register((fromPop) => window.Dialog._internalClose(fromPop)); window.Dialog._isOpen = true; }
        if(dialogShowFn) dialogShowFn({ type: 'info', title, desc, confirmText: buttonText });
    },
    showConfirm: (title, desc, confirmText = 'Ya', cancelText = 'Batal', onConfirm, onCancel) => {
        if (!window.Dialog._isOpen) { window.PopupManager.register((fromPop) => window.Dialog._internalClose(fromPop)); window.Dialog._isOpen = true; }
        if(dialogShowFn) dialogShowFn({ type: 'confirm', title, desc, confirmText, cancelText, onConfirm, onCancel });
    },
    showLoading: (title = 'Memuat...', desc = 'Mohon tunggu sebentar...') => {
        if (!window.Dialog._isOpen) { window.PopupManager.register((fromPop) => window.Dialog._internalClose(fromPop)); window.Dialog._isOpen = true; }
        if(dialogShowFn) dialogShowFn({ type: 'loading', title, desc });
    },
    showToast: (message, type = 'info', duration = 2000) => {
        if(window.toastShowFn) window.toastShowFn(message, type, duration);
    },
    close: () => {
        if (window.Dialog._isOpen) {
            window.PopupManager.unregister((fromPop) => window.Dialog._internalClose(fromPop), false);
            window.Dialog._internalClose(false);
        } else {
            window.Dialog._internalClose(false);
        }
    },
    _internalClose: (fromPopState) => {
        window.Dialog._isOpen = false;
        if(dialogShowFn) dialogShowFn(null);
    }
};`;

content = content.replace(/window\.Dialog = \{[\s\S]*?\n\};\n/, newDialogObj + '\n');
fs.writeFileSync('public/components/dialogSystem.js', content);

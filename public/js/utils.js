// ===================== FORMATTING HELPERS =====================
const formatNumber = (num) => {
    if (num >= 1000000) {
        return Number((num / 1000000).toFixed(1)) + 'M';
    } else if (num >= 1000) {
        return Number((num / 1000).toFixed(1)) + 'k';
    }
    return new Intl.NumberFormat('id-ID').format(num);
};

// ===================== POPUP NAVIGATION MANAGER =====================
window.PopupManager = {
    _ignoreNextPop: false,
    _activePopups: [],
    
    // Call this when opening a popup
    register: (closeCallback) => {
        window.history.pushState({ isAppHistory: true, isPopup: true }, '', '');
        window.PopupManager._activePopups.push(closeCallback);
    },
    
    // Call this when closing a popup manually (e.g., clicking X or OK)
    // It will pop the state if it wasn't triggered by a back button
    unregister: (closeCallback, fromPopState = false) => {
        const index = window.PopupManager._activePopups.indexOf(closeCallback);
        if (index > -1) {
            window.PopupManager._activePopups.splice(index, 1);
            if (!fromPopState) {
                window.PopupManager._ignoreNextPop = true;
                window.history.back(); // Trigger popstate to remove the dummy state
            }
        }
    },
    
    // Call this from handlePopState to close the top-most popup
    handlePopState: () => {
        if (window.PopupManager._ignoreNextPop) {
            window.PopupManager._ignoreNextPop = false;
            return true;
        }
        if (window.PopupManager._activePopups.length > 0) {
            const closeCallback = window.PopupManager._activePopups.pop();
            closeCallback(true); // true indicates it came from popstate, so don't call history.back() again
            return true; // Indicates a popup was handled
        }
        return false;
    }
};

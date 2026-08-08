window.SessionEngine = {
    currentSessionId: null,
    currentDeviceId: null,
    playerName: null,
    init: () => {
        let deviceId = localStorage.getItem('SC_DEVICE_ID');
        if (!deviceId) {
            deviceId = window.EngineUtils.generateId();
            localStorage.setItem('SC_DEVICE_ID', deviceId);
        }
        window.SessionEngine.currentDeviceId = deviceId;
        
        let storedPlayerName = localStorage.getItem('pkmnPlayerName');
        if (storedPlayerName) {
            window.SessionEngine.playerName = storedPlayerName;
            window.SessionEngine.currentSessionId = window.EngineUtils.generateId();
        }
    },
    startSession: (name) => {
        window.SessionEngine.playerName = name;
        window.SessionEngine.currentSessionId = window.EngineUtils.generateId();
        localStorage.setItem('pkmnPlayerName', name);
        window.EngineUtils.log('Session', `Started new session ${window.SessionEngine.currentSessionId} for ${name}`);
    },
    clearSession: () => {
        window.EngineUtils.log('Session', `Clearing session for ${window.SessionEngine.playerName}`);
        window.SessionEngine.playerName = null;
        window.SessionEngine.currentSessionId = null;
        localStorage.removeItem('pkmnPlayerName');
    },
    isValid: () => {
        return window.SessionEngine.playerName !== null && window.SessionEngine.currentSessionId !== null;
    }
};

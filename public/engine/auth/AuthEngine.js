window.AuthEngine = {
    login: async (playerName) => {
        window.EngineUtils.log('Auth', `Attempting login for ${playerName}`);
        return await window.SaveEngine.loadProfile(playerName);
    },
    logout: () => {
        window.EngineUtils.log('Auth', 'Logging out...');
        window.SaveEngine.logout();
    },
    validateSession: () => {
        return window.SessionEngine.isValid();
    }
};

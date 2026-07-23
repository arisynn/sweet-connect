window.SaveEngine = {
    isStartupComplete: false,
    currentPayload: null,

    init: () => {
        window.EngineUtils.log('System', 'Initializing Save Engine V2...');
        window.SessionEngine.init();
    },

    loadProfile: async (playerName) => {
        window.EngineUtils.log('System', `Loading profile for ${playerName}...`);
        window.SessionEngine.startSession(playerName);
        
        let localPayload = window.RecoveryEngine.loadLocalBackup(playerName);
        let cloudRaw = null;
        
        try {
            cloudRaw = await window.CloudEngine.fetchCloud(playerName);
            window.EngineUtils.log('System', 'Cloud fetch successful.');
        } catch (e) {
            window.EngineUtils.log('System', 'Cloud fetch failed. Relying on local backup if available.');
        }

        let cloudPayload = null;
        if (cloudRaw) {
            if (cloudRaw._engine) {
                cloudPayload = cloudRaw;
            } else {
                cloudPayload = window.ProfileEngine.migrateFromV1(cloudRaw);
            }
        }

        if (!localPayload) {
            const oldLocalRaw = localStorage.getItem('sweet_connect_' + playerName);
            if (oldLocalRaw) {
                try {
                    const parsed = JSON.parse(oldLocalRaw);
                    localPayload = window.ProfileEngine.migrateFromV1(parsed);
                } catch(e) {}
            }
        }

        let activePayload = window.ConflictResolver.resolve(localPayload, cloudPayload);
        
        if (!activePayload) {
            window.EngineUtils.log('System', 'No profile found. Starting fresh.');
            activePayload = {
                _engine: {
                    version: 2, revision: 1, updatedAt: Date.now(),
                    deviceId: window.SessionEngine.currentDeviceId,
                    sessionId: window.SessionEngine.currentSessionId,
                    saveHash: null
                },
                gameData: {}
            };
        } else {
            try {
                activePayload.gameData = window.ProfileEngine.migrateGameData(activePayload.gameData);
                activePayload._engine.saveHash = window.EngineUtils.calculateHash(activePayload.gameData);
                window.ValidationEngine.validatePayload(activePayload);
            } catch (error) {
                window.EngineUtils.log('System', 'Profile validation failed during load!', error.message);
                throw error;
            }
        }

        window.SaveEngine.currentPayload = activePayload;
        window.RecoveryEngine.saveLocalBackup(playerName, activePayload);
        
        return activePayload.gameData;
    },

    setStartupComplete: () => {
        window.SaveEngine.isStartupComplete = true;
        window.EngineUtils.log('System', 'Startup Sequence Complete. Save Engine unlocked.');
    },

    saveProfile: (playerName, gameData, isImmediate = false) => {
        if (!window.SaveEngine.isStartupComplete) {
            window.EngineUtils.log('System', 'Ignoring save request. Startup not complete.');
            return;
        }
        if (!window.SessionEngine.isValid() || window.SessionEngine.playerName !== playerName) {
            window.EngineUtils.log('System', 'Ignoring save request. Invalid session.');
            return;
        }

        try {
            window.ValidationEngine.validateGameData(gameData);
        } catch (e) {
            window.EngineUtils.log('System', 'Save aborted. Invalid GameData: ' + e.message);
            return;
        }

        const payload = JSON.parse(JSON.stringify(window.SaveEngine.currentPayload));
        // Deep clone gameData so React state mutations don't affect our stored payload
        payload.gameData = JSON.parse(JSON.stringify(gameData));
        payload._engine.revision++;
        payload._engine.updatedAt = Date.now();
        payload._engine.deviceId = window.SessionEngine.currentDeviceId;
        payload._engine.sessionId = window.SessionEngine.currentSessionId;
        payload._engine.saveHash = window.EngineUtils.calculateHash(payload.gameData);

        try {
            window.ValidationEngine.validatePayload(payload);
        } catch (e) {
            window.EngineUtils.log('System', 'Save aborted. Payload corruption: ' + e.message);
            return;
        }

        window.SaveEngine.currentPayload = payload;
        window.RecoveryEngine.saveLocalBackup(playerName, payload);
        window.QueueEngine.enqueue(playerName, payload);
    },

    saveProfileKeepalive: (playerName, gameData) => {
        if (!window.SaveEngine.isStartupComplete || !window.SessionEngine.isValid()) return;
        
        const payload = JSON.parse(JSON.stringify(window.SaveEngine.currentPayload));
        if (!payload) return;

        payload.gameData = JSON.parse(JSON.stringify(gameData));
        payload._engine.revision++;
        payload._engine.updatedAt = Date.now();
        payload._engine.saveHash = window.EngineUtils.calculateHash(payload.gameData);
        
        window.SaveEngine.currentPayload = payload;
        window.RecoveryEngine.saveLocalBackup(playerName, payload);

        try {
            fetch(`/api/profile?name=${encodeURIComponent(playerName)}`, {
                method: 'POST',
                keepalive: true,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => {});
        } catch(e) {}
    },

    logout: () => {
        window.SessionEngine.clearSession();
        window.SaveEngine.isStartupComplete = false;
        window.SaveEngine.currentPayload = null;
        window.QueueEngine.queue = [];
    }
};

window.saveProfile = (name, profile) => window.SaveEngine.saveProfile(name, profile);
window.forceSaveProfileNow = (name, profile) => window.SaveEngine.saveProfile(name, profile, true);
window.saveProfileKeepalive = (name, profile) => window.SaveEngine.saveProfileKeepalive(name, profile);
window.setStartupComplete = (val) => val ? window.SaveEngine.setStartupComplete() : (window.SaveEngine.isStartupComplete = false);
window.saveCloudProfile = async (name, profile) => window.SaveEngine.saveProfile(name, profile, true);
window.getLocalProfile = (name) => window.SaveEngine.currentPayload ? window.SaveEngine.currentPayload.gameData : null;
window.setLocalProfile = (name, profile) => {};

// Initialize early
window.SaveEngine.init();

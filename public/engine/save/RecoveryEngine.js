window.RecoveryEngine = {
    getBackupKey: (name) => `SC_BACKUP_${name}`,
    saveLocalBackup: (name, payload) => {
        try {
            localStorage.setItem(window.RecoveryEngine.getBackupKey(name), JSON.stringify(payload));
        } catch(e) {
            window.EngineUtils.log('Recovery', 'Failed to write local backup', e.message);
        }
    },
    loadLocalBackup: (name) => {
        try {
            const raw = localStorage.getItem(window.RecoveryEngine.getBackupKey(name));
            if (raw) return JSON.parse(raw);
        } catch(e) {
            window.EngineUtils.log('Recovery', 'Failed to read local backup', e.message);
        }
        return null;
    }
};

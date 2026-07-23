window.ValidationEngine = {
    validateGameData: (gameData) => {
        if (!gameData || typeof gameData !== 'object') throw new Error("GameData is null or invalid type.");
        if (gameData.currentLevel === undefined || gameData.currentLevel < 1) throw new Error("Invalid currentLevel.");
        if (gameData.coins === undefined || gameData.hp === undefined) throw new Error("Missing critical currencies.");
        return true;
    },
    validatePayload: (payload) => {
        if (!payload || !payload._engine || !payload.gameData) throw new Error("Invalid Payload structure (missing _engine or gameData).");
        const engine = payload._engine;
        if (!engine.revision || !engine.updatedAt || !engine.deviceId || !engine.sessionId || !engine.saveHash) throw new Error("Payload missing engine metadata.");
        const hashCheck = window.EngineUtils.calculateHash(payload.gameData);
        if (hashCheck !== engine.saveHash) throw new Error(`Hash mismatch! Corrupted data. Expected ${engine.saveHash}, got ${hashCheck}`);
        return true;
    }
};

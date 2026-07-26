window.ConflictResolver = {
    resolve: (localPayload, cloudPayload) => {
        if (!localPayload) return cloudPayload;
        if (!cloudPayload) return localPayload;
        const localRev = localPayload._engine.revision;
        const cloudRev = cloudPayload._engine.revision;
        if (localRev === cloudRev) return localPayload._engine.updatedAt >= cloudPayload._engine.updatedAt ? localPayload : cloudPayload;
        if (cloudRev > localRev) {
            const localLevel = localPayload.gameData.currentLevel || 1;
            const cloudLevel = cloudPayload.gameData.currentLevel || 1;

            if (localLevel > cloudLevel) {
                window.EngineUtils.log('Conflict', 'Cloud revision higher, but Local has more progress. Force merging local over cloud, but keeping cloud currency.');
                const mergedPayload = JSON.parse(JSON.stringify(localPayload));
                mergedPayload.gameData.coins = cloudPayload.gameData.coins;
                mergedPayload.gameData.gems = cloudPayload.gameData.gems;
                mergedPayload._engine.revision = cloudRev + 1;
                return mergedPayload;
            }
            window.EngineUtils.log('Conflict', 'Cloud is ahead. Adopting cloud save.');
            return cloudPayload;
        }
        return localPayload;
    }
};

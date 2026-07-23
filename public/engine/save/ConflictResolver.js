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
            const localCoins = localPayload.gameData.coins || 0;
            const cloudCoins = cloudPayload.gameData.coins || 0;
            if (localLevel > cloudLevel || (localLevel === cloudLevel && localCoins > cloudCoins)) {
                window.EngineUtils.log('Conflict', 'Cloud revision higher, but Local has more progress. Force merging local over cloud.');
                localPayload._engine.revision = cloudRev + 1;
                return localPayload;
            }
            window.EngineUtils.log('Conflict', 'Cloud is ahead. Adopting cloud save.');
            return cloudPayload;
        }
        return localPayload;
    }
};

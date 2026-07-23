window.QueueEngine = {
    isProcessing: false,
    queue: [],
    enqueue: (playerName, payload) => {
        // Create a deep copy of the payload to avoid reference mutation issues
        const payloadCopy = JSON.parse(JSON.stringify(payload));
        
        // Remove pending tasks for this player, EXCEPT the one currently processing (index 0 if isProcessing)
        window.QueueEngine.queue = window.QueueEngine.queue.filter((item, index) => {
            if (window.QueueEngine.isProcessing && index === 0) return true;
            return item.playerName !== playerName;
        });
        
        window.QueueEngine.queue.push({ playerName, payload: payloadCopy, retries: 0 });
        window.EngineUtils.log('Queue', `Enqueued save for ${playerName}. Queue length: ${window.QueueEngine.queue.length}`);
        window.QueueEngine.processNext();
    },
    processNext: async () => {
        if (window.QueueEngine.isProcessing || window.QueueEngine.queue.length === 0) return;
        window.QueueEngine.isProcessing = true;
        const task = window.QueueEngine.queue[0];
        try {
            window.EngineUtils.log('Queue', `Processing save for ${task.playerName} (Revision: ${task.payload._engine.revision})`);
            await window.CloudEngine.pushCloud(task.playerName, task.payload);
            window.EngineUtils.log('Queue', 'Save successful.');
            window.dispatchEvent(new CustomEvent('syncLog', { detail: { status: 'Connected', action: 'Upload Cloud Save', result: 'Sync Complete' } }));
            window.QueueEngine.queue.shift();
        } catch (error) {
            if (error.isConflict) {
                window.EngineUtils.log('Queue', 'Conflict detected during save! Resolving...');
                const resolvedPayload = window.ConflictResolver.resolve(task.payload, error.cloudData);
                resolvedPayload._engine.revision++;
                resolvedPayload._engine.updatedAt = Date.now();
                resolvedPayload._engine.saveHash = window.EngineUtils.calculateHash(resolvedPayload.gameData);
                task.payload = resolvedPayload;
                window.RecoveryEngine.saveLocalBackup(task.playerName, resolvedPayload);
                
                // CRITICAL: Update SaveEngine's currentPayload so subsequent saves build on the resolved payload
                if (window.SaveEngine && window.SaveEngine.currentPayload && window.SaveEngine.currentPayload._engine.sessionId === resolvedPayload._engine.sessionId) {
                    window.SaveEngine.currentPayload = resolvedPayload;
                }
                
                // NOTIFY REACT
                window.dispatchEvent(new CustomEvent('profileUpdatedExternally', { detail: { profile: resolvedPayload.gameData } }));
            } else {
                window.EngineUtils.log('Queue', 'Save failed due to network. Will retry later.', error.message);
                window.dispatchEvent(new CustomEvent('syncLog', { detail: { status: 'Offline', action: 'Upload failed', result: error.message || 'Timeout' } }));
                task.retries++;
                if (task.retries > 5) {
                    window.EngineUtils.log('Queue', 'Max retries reached. Dropping from active queue (saved in local backup).');
                    window.QueueEngine.queue.shift();
                } else {
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        } finally {
            window.QueueEngine.isProcessing = false;
            if (window.QueueEngine.queue.length > 0) {
                setTimeout(window.QueueEngine.processNext, 1000);
            }
        }
    }
};

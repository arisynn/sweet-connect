window.MultiplayerEngine = {
    pollInterval: null,
    currentRoomId: null,
    currentMatchId: null,
    currentPlayerName: null,
    currentProgress: 0,
    pollRate: 2000,
    
    startPolling: (roomId, playerName, matchId = null) => {
        window.MultiplayerEngine.currentMatchId = matchId;
        window.MultiplayerEngine.currentRoomId = roomId;
        window.MultiplayerEngine.currentPlayerName = playerName;
        
        if (window.MultiplayerEngine.pollInterval) {
            clearInterval(window.MultiplayerEngine.pollInterval);
        }
        
        window.MultiplayerEngine.pollInterval = setInterval(async () => {
            if (!window.MultiplayerEngine.currentRoomId) {
                window.MultiplayerEngine.stopPolling();
                return;
            }
            try {
                const data = await window.MultiplayerAPI.syncRoom(
                    window.MultiplayerEngine.currentRoomId, 
                    window.MultiplayerEngine.currentPlayerName, 
                    window.MultiplayerEngine.currentProgress,
                    window.MultiplayerEngine.currentMatchId
                );
                
                if (data && data.id) {
                    window.dispatchEvent(new CustomEvent('multiplayerSync', { detail: data }));
                } else if (data.error) {
                    if (data.error === 'Server error') {
                        console.warn("Multiplayer API returned a server error, waiting for next sync...");
                    } else {
                        window.dispatchEvent(new CustomEvent('multiplayerError', { detail: data.error }));
                    }
                }
            } catch (e) {
                console.warn('Sync error:', e.message);
            }
        }, window.MultiplayerEngine.pollRate);
    },
    
    stopPolling: () => {
        if (window.MultiplayerEngine.pollInterval) {
            clearInterval(window.MultiplayerEngine.pollInterval);
            window.MultiplayerEngine.pollInterval = null;
        }
        window.MultiplayerEngine.currentRoomId = null;
        window.MultiplayerEngine.currentPlayerName = null;
    },
    
    updateProgress: (progress) => {
        window.MultiplayerEngine.currentProgress = progress;
    }
};

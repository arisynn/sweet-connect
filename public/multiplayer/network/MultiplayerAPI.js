window.MultiplayerAPI = {
    _fetch: async (action, body = null) => {
        const url = `/api/multiplayer?action=${action}`;
        const options = {
            method: body ? 'POST' : 'GET',
            headers: { 'Content-Type': 'application/json' },
            ...(body && { body: JSON.stringify(body) })
        };
        const res = await fetch(url, options);
        const data = await res.json();
        if (data.error && data.error !== 'Server error') {
            throw new Error(data.error);
        }
        return data;
    },
    createRoom: (host, level, theme) => 
        window.MultiplayerAPI._fetch('create', { host, level, theme }),
    joinRoom: (roomId, name, level, theme) => 
        window.MultiplayerAPI._fetch('join', { roomId, name, level, theme }),
    leaveRoom: (roomId, name) => 
        window.MultiplayerAPI._fetch('leave', { roomId, name }),
    readyToggle: (roomId, name, ready) => 
        window.MultiplayerAPI._fetch('ready', { roomId, name, ready }),
    changeMode: (roomId, host, mode) => 
        window.MultiplayerAPI._fetch('change_mode', { roomId, host, mode }),
    proposeWager: (roomId, host, currency, amount) => 
        window.MultiplayerAPI._fetch('propose_wager', { roomId, host, currency, amount }),
    cancelWager: (roomId, host, offerId) => 
        window.MultiplayerAPI._fetch('cancel_wager', { roomId, host, offerId }),
    acceptWager: (roomId, name, offerId) => 
        window.MultiplayerAPI._fetch('accept_wager', { roomId, name, offerId }),
    rejectWager: (roomId, name, offerId) => 
        window.MultiplayerAPI._fetch('reject_wager', { roomId, name, offerId }),
    startMatch: (roomId, host, board) => 
        window.MultiplayerAPI._fetch('start_match', { roomId, host, board }),
    readyForGame: (roomId, name) => 
        window.MultiplayerAPI._fetch('ready_for_game', { roomId, name }),
    completeMatch: (roomId, name) => 
        window.MultiplayerAPI._fetch('complete', { roomId, name }),
    
    syncRoom: (roomId, name, progress, matchId) => {
        return fetch(`/api/multiplayer?action=sync&roomId=${roomId}&name=${encodeURIComponent(name)}&progress=${progress}&matchId=${matchId || ''}`, { cache: 'no-store' })
            .then(r => r.json());
    }
};

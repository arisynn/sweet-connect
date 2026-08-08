const useMultiplayer = (ctx) => {
    const { profile, playerName, setProfile, prepareLevel, activeThemeRef, activeTheme, setGameState } = ctx;
    const { useState, useEffect, useRef, useCallback } = React;
    
    const [multiplayerState, setMultiplayerState] = useState('IDLE');
    const [roomData, setRoomData] = useState(null);
    const [showMultiplayerPopup, setShowMultiplayerPopup] = useState(false);
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [showModeSheet, setShowModeSheet] = useState(false);
    const [wagerConfigOpen, setWagerConfigOpen] = useState(false);
    // showWagerPrompt is computed from roomData
    const showWagerPrompt = roomData?.mode === 'Match Berhadiah' && roomData?.wager && !roomData.wager.memberAgreed && roomData.host !== playerName;
    const [matchTime, setMatchTime] = useState(0);
    const [isRequestingRoom, setIsRequestingRoom] = useState(false);

    const leaveIntentRef = useRef(false);
    const prevHostRef = useRef(null);
    useEffect(() => {
        if (roomData?.host && prevHostRef.current && roomData.host !== prevHostRef.current) {
            if (window.Dialog && window.Dialog.showToast) window.Dialog.showToast("Host telah keluar. Menentukan host baru...", 'info');
        }
        if (roomData?.host) {
            prevHostRef.current = roomData.host;
        }
    }, [roomData?.host]);

    // Sync progress to engine
    useEffect(() => {
        window.MultiplayerEngine.updateProgress(ctx.progress || 0);
    }, [ctx.progress]);

    useEffect(() => {
        const handleSync = (e) => {
            const data = e.detail;
            setRoomData(data);

            setMultiplayerState(prevState => {
                if (data.status === 'STARTING' && prevState === 'WAITING') {
                    return 'STARTING';
                } else if (data.status === 'WAITING' && prevState === 'STARTING') {
                    if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Timeout", "Gagal memulai permainan. Pasangan tidak merespon.");
                    return 'WAITING';
                } else if (data.status === 'PLAYING' && (prevState === 'STARTING' || prevState === 'WAITING')) {
                    window.isMultiplayerMatch = true;
                    if (prepareLevel) prepareLevel(profile.currentLevel, data.board || null, null, null, null, null, null, 0, null, null, 0, 0, data.startAt);
                    return 'PLAYING';
                } else if (data.status === 'FINISHED' && (prevState === 'PLAYING' || prevState === 'WAITING' || prevState === 'STARTING')) {
                    const wasPlaying = prevState === "PLAYING";
                    if (wasPlaying) {
                        setProfile(prev => {
                            if (!prev) return prev;
                            let next = { ...prev };
                            if (data.wager && data.wager.settledBalances) {
                                if (data.wager.settledBalances[playerName] !== undefined) {
                                    next[data.wager.currency] = data.wager.settledBalances[playerName];
                                }
                            }
                            if (window.flushStats) next = window.flushStats(next);
                            if (window.RewardEngine) {
                                const isWinner = data.winner === playerName;
                                next = window.RewardEngine.processWin(next, {
                                    isMultiplayer: true,
                                    isFlawless: false,
                                    timeElapsed: data.startAt ? (Date.now() - data.startAt) : null,
                                    progress: ctx.progressRef?.current || 0,
                                    highestCombo: 0,
                                    isWinner: isWinner
                                });
                            }
                            if (window.saveProfile) window.saveProfile(playerName, next);
                            return next;
                        });
                    }
                    if (window.handleMultiplayerEnd) window.handleMultiplayerEnd();
                    return "RESULT";
                } else if (data.status === 'WAITING' && prevState === 'RESULT') {
                    if (setGameState) setGameState('LOBBY_MAIN');
                    return 'WAITING';
                }
                return prevState;
            });
        };

        const handleError = (e) => {
            const errorMsg = e.detail;
            if (leaveIntentRef.current) return;
            setMultiplayerState(prevState => {
                if (prevState === 'PLAYING') {
                    if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Disconnected", "Koneksi ke room terputus.");
                    return 'RESULT';
                } else {
                    window.isMultiplayerMatch = false;
                    setRoomData(null);
                    if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Disconnected", errorMsg === 'Room not found' ? "Room tidak ditemukan." : errorMsg);
                    return 'IDLE';
                }
            });
        };

        window.addEventListener('multiplayerSync', handleSync);
        window.addEventListener('multiplayerError', handleError);

        return () => {
            window.removeEventListener('multiplayerSync', handleSync);
            window.removeEventListener('multiplayerError', handleError);
        };
    }, [playerName, profile, prepareLevel, setProfile, ctx.progressRef]);

    useEffect(() => {
        if ((multiplayerState === 'WAITING' || multiplayerState === 'STARTING' || multiplayerState === 'PLAYING') && roomData?.id) {
            window.MultiplayerEngine.startPolling(roomData.id, playerName, roomData.matchId);
        } else {
            window.MultiplayerEngine.stopPolling();
        }
        return () => window.MultiplayerEngine.stopPolling();
    }, [multiplayerState, roomData?.id, playerName]);

    useEffect(() => {
        if (multiplayerState === 'STARTING' && roomData?.id) {
            window.MultiplayerAPI.readyForGame(roomData.id, playerName)
                .then(data => {
                    if (data.success && data.room) {
                        setRoomData(data.room);
                        if (data.room.status === 'PLAYING' && prepareLevel) {
                            // Do nothing here, let handleSync process the PLAYING state to ensure it only happens once and properly
                        }
                    }
                }).catch(console.error);
        }
    }, [multiplayerState, roomData?.id, playerName, prepareLevel, profile]);

    useEffect(() => {
        window.handleMultiplayerClear = async () => {
            try {
                const data = await window.MultiplayerAPI.completeMatch(roomData?.id, playerName);
                if (!data.error) setRoomData(data);
            } catch (e) {}
        };
    }, [roomData?.id, playerName]);

    useEffect(() => {
        if (roomData?.wager?.settledBalances && roomData.wager.settledBalances[playerName] !== undefined) {
            setProfile(prev => {
                if (!prev) return prev;
                const currentBal = prev[roomData.wager.currency] || 0;
                const settledBal = roomData.wager.settledBalances[playerName];
                if (currentBal !== settledBal) {
                    const next = { ...prev, [roomData.wager.currency]: settledBal };
                    if (window.saveProfile) window.saveProfile(playerName, next);
                    return next;
                }
                return prev;
            });
        }
    }, [roomData?.wager?.settledBalances, playerName, setProfile]);

    const handleCreateRoom = async () => {
        if (isRequestingRoom) return;
        setIsRequestingRoom(true);
        try {
            const data = await window.MultiplayerAPI.createRoom(playerName, profile.currentLevel, activeThemeRef?.current || activeTheme);
            setRoomData(data);
            setShowMultiplayerPopup(false);
            setMultiplayerState('WAITING');
        } catch (e) {
            if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Gagal", e.message);
        } finally {
            setIsRequestingRoom(false);
        }
    };

    const handleJoinRoom = async (code) => {
        if (isRequestingRoom) return;
        setIsRequestingRoom(true);
        try {
            const data = await window.MultiplayerAPI.joinRoom(code, playerName, profile.currentLevel, activeThemeRef?.current || activeTheme);
            setRoomData(data);
            setShowJoinDialog(false);
            setMultiplayerState('WAITING');
        } catch (e) {
            if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Gagal", e.message);
        } finally {
            setIsRequestingRoom(false);
        }
    };

    const handleLeaveRoom = async () => {
        leaveIntentRef.current = true;
        if (roomData?.id) {
            try {
                await window.MultiplayerAPI.leaveRoom(roomData.id, playerName);
            } catch(e) {}
        }
        setRoomData(null);
        setMultiplayerState('IDLE'); 
        window.isMultiplayerMatch = false;
        setTimeout(() => leaveIntentRef.current = false, 3000);
    };

    const handleReadyToggle = async () => {
        if (!roomData?.id) return;
        const myPlayer = roomData.players.find(p => p.name === playerName);
        const newReady = !myPlayer?.ready;
        try {
            const data = await window.MultiplayerAPI.readyToggle(roomData.id, playerName, newReady);
            if (!data.error) setRoomData(data);
        } catch (e) {}
    };

    const handleProposeWager = async (currency, amount) => {
        try {
            const data = await window.MultiplayerAPI.proposeWager(roomData.id, playerName, currency, amount);
            setRoomData(data);
            setWagerConfigOpen(false);
            setShowModeSheet(false);
        } catch (e) {
            if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Gagal", e.message);
        }
    };

    const handleAcceptWager = async (offerId) => {
        try {
            const data = await window.MultiplayerAPI.acceptWager(roomData.id, playerName, offerId);
            setRoomData(data);
        } catch (e) {
            if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Gagal", e.message);
        }
    };

    const handleCancelWager = async (offerId) => {
        try {
            const data = await window.MultiplayerAPI.cancelWager(roomData.id, playerName, offerId);
            setRoomData(data);
        } catch (e) {
            if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Gagal", e.message);
        }
    };

    const handleRejectWager = async (offerId) => {
        try {
            const data = await window.MultiplayerAPI.rejectWager(roomData.id, playerName, offerId);
            if (!data.error) setRoomData(data);
        } catch (e) {
            if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Gagal", e.message);
        }
    };

    const handleStartMatch = async () => {
        try {
            const board = window.generateBoard ? window.generateBoard(activeThemeRef?.current || activeTheme, profile.currentLevel) : null;
            const data = await window.MultiplayerAPI.startMatch(roomData.id, playerName, board);
            if (data.success && data.room) {
                 setRoomData(data.room);
            }
        } catch (e) {
            if (window.Dialog && window.Dialog.showError) window.Dialog.showError("Gagal", e.message);
        }
    };

    return { handleCancelWager, isRequestingRoom, 
        multiplayerState, setMultiplayerState, 
        matchTime, setMatchTime, 
        showMultiplayerPopup, setShowMultiplayerPopup, 
        showJoinDialog, setShowJoinDialog, 
        showModeSheet, setShowModeSheet, 
        roomData, setRoomData, 
        wagerConfigOpen, setWagerConfigOpen, 
        showWagerPrompt,
        handleCreateRoom, handleJoinRoom, handleLeaveRoom, 
        handleReadyToggle, handleProposeWager, handleAcceptWager, 
        handleRejectWager, handleStartMatch 
    };
};

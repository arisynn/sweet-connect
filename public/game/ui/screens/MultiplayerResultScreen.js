const MultiplayerResultScreen = ({ roomData, playerName, handleLeaveRoom, setMultiplayerState }) => {
    const ctx = React.useContext(GameContext);
    const { setGameState } = ctx;
    
    return (
        <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        {(() => {
                            const MultiplayerResult = window.MultiplayerResult;
                            return <MultiplayerResult 
                                roomData={roomData} 
                                playerName={playerName}
                                onRematch={async () => {
                                    await fetch("/api/multiplayer?action=rematch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId: roomData?.id, name: playerName }) });
                                    setMultiplayerState("WAITING");
                                    setGameState("LOBBY_MAIN");
                                }}
                                onLeave={() => {
                                    handleLeaveRoom();
                                    setGameState("LOBBY_MAIN");
                                }}
                            />;
                        })()}
                    </div>
    );
};

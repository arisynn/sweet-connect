import sys

with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

start_marker = "{multiplayerState === 'RESULT' && roomData?.id && ("
idx = content.find(start_marker)
if idx != -1:
    count = 0
    end_idx = -1
    start_idx = idx + len(start_marker) - 1
    for i in range(start_idx, len(content)):
        if content[i] == '(':
            count += 1
        elif content[i] == ')':
            count -= 1
            if count == 0:
                end_idx = i
                break
                
    if end_idx != -1:
        extracted = content[start_idx+1:end_idx].strip()
        comp_content = f"""const MultiplayerResultScreen = ({{ handleLeaveRoom, roomData, multiplayerState, setMultiplayerState }}) => {{
    const ctx = React.useContext(GameContext);
    const {{ gameState, setGameState, playerName }} = ctx;
    
    return (
        {extracted}
    );
}};
"""
        with open('public/game/ui/screens/MultiplayerResultScreen.js', 'w') as f:
            f.write(comp_content)
            
        global_content = content[:start_idx] + "(<MultiplayerResultScreen handleLeaveRoom={handleLeaveRoom} roomData={roomData} multiplayerState={multiplayerState} setMultiplayerState={setMultiplayerState} />)" + content[end_idx+1:]
        with open('public/game/GameUI.js', 'w') as f:
            f.write(global_content)
        print("MultiplayerResultScreen Extracted")

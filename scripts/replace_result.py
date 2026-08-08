import re

with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

start_marker = "{multiplayerState === 'RESULT' && ("
idx = content.find(start_marker)
if idx != -1:
    count = 0
    start_idx = content.find('(', idx)
    end_idx = -1
    for i in range(start_idx, len(content)):
        if content[i] == '(': count += 1
        elif content[i] == ')':
            count -= 1
            if count == 0:
                end_idx = i
                break

    if end_idx != -1:
        extracted = content[start_idx+1:end_idx].strip()
        comp_content = f"""const MultiplayerResultScreen = ({{ roomData, playerName, handleLeaveRoom, setMultiplayerState }}) => {{
    const ctx = React.useContext(GameContext);
    const {{ setGameState }} = ctx;
    
    return (
        {extracted}
    );
}};
"""
        with open('public/game/ui/screens/MultiplayerResultScreen.js', 'w') as f:
            f.write(comp_content)
            
        global_content = content[:start_idx] + "(<MultiplayerResultScreen roomData={roomData} playerName={playerName} handleLeaveRoom={handleLeaveRoom} setMultiplayerState={setMultiplayerState} />)" + content[end_idx+1:]
        with open('public/game/GameUI.js', 'w') as f:
            f.write(global_content)
        print("Done")

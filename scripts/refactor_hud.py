import sys

with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

start_marker = "{(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'COUNTDOWN') && ("
idx = content.find(start_marker)
if idx == -1:
    print("Not found")
    sys.exit(1)

start_idx = idx + len(start_marker) - 1 # The last '(' in start_marker
count = 0
end_idx = -1
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
    
    comp_content = f"""const HUD = ({{ regenTimeLeft, multiplayerState, matchTime, formatRegenTime, roomData }}) => {{
    const ctx = React.useContext(GameContext);
    const {{ gameState, setGameState, activeTheme, activeThemeRef, score, hp, hints, shuffles, level, progress, showTimerAdd, isMuted, setIsMuted, playerName, getSecondsLeft, handleBuyHpInGame, handleHintClick, handleShuffleClick, AudioEngine, THEMES }} = ctx;
    
    return (
        {extracted}
    );
}};
"""
    with open('public/game/ui/components/HUD.js', 'w') as f:
        f.write(comp_content)
        
    global_content = content[:idx] + "{(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'COUNTDOWN') && (<HUD regenTimeLeft={regenTimeLeft} multiplayerState={multiplayerState} matchTime={matchTime} formatRegenTime={formatRegenTime} roomData={roomData} />)}" + content[end_idx+1:]
    with open('public/game/GameUI.js', 'w') as f:
        f.write(global_content)
    print("HUD Extracted properly")


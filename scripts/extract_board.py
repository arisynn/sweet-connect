import sys

with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

start_marker = "<div style={{ visibility: (gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'COUNTDOWN') ? 'visible' : 'hidden' }}"
idx = content.find(start_marker)
if idx != -1:
    count = 0
    end_idx = -1
    for i in range(idx, len(content)):
        if content[i:i+4] == '<div':
            count += 1
        elif content[i:i+5] == '</div':
            count -= 1
            if count == 0:
                end_idx = i + 5
                break
                
    if end_idx != -1:
        extracted = content[idx:end_idx+1].strip()
        comp_content = f"""const GameBoard = () => {{
    const ctx = React.useContext(GameContext);
    const {{ gameState, gameStateRef, activeTheme, activeThemeRef, board, wrongConnectionPenalty, activePath, hintPath, wrongTile, hintActiveTiles, matchedTiles, selectedTile, setSelectedTile, AudioEngine, THEMES, comboDisplay, handleTileClick }} = ctx;
    
    // We need COLS and ROWS from constants.js which are usually globally available
    
    return (
        {extracted}
    );
}};
"""
        with open('public/game/ui/components/GameBoard.js', 'w') as f:
            f.write(comp_content)
            
        global_content = content[:idx] + "<GameBoard />" + content[end_idx+1:]
        with open('public/game/GameUI.js', 'w') as f:
            f.write(global_content)
        print("GameBoard Extracted")


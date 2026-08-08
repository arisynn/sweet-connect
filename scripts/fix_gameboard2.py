with open('public/game/ui/components/GameBoard.js', 'r') as f:
    content = f.read()

content = content.replace(
    "const { gameState, gameStateRef, activeTheme, activeThemeRef, board, wrongConnectionPenalty, activePath, hintPath, wrongTile, hintActiveTiles, matchedTiles, selectedTile, setSelectedTile, AudioEngine, THEMES, comboDisplay, handleTileClick, showBoardClear } = ctx;",
    "const { gameState, gameStateRef, activeTheme, activeThemeRef, board, wrongConnectionPenalty, activePath, hintPath, wrongTile, hintActiveTiles, matchedTiles, selectedTile, setSelectedTile, AudioEngine, THEMES, comboDisplay, handleTileClick, showBoardClear, showTimeoutFlash } = ctx;"
)

with open('public/game/ui/components/GameBoard.js', 'w') as f:
    f.write(content)

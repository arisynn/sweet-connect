import sys

with open('public/game/ui/screens/LobbyScreen.js', 'r') as f:
    content = f.read()

content = content.replace("const LobbyScreen = () => {", "const LobbyScreen = ({ handleStartMatch, setShowMultiplayerPopup, multiplayerState, setShowSettings, showSettings, setSweetMessage }) => {")
# Add IconCrown, IconGem, IconCoin if missing
# Wait, they are global.

# But wait, what about `saveProfile`, `setProfile`, `prepareLevel` etc?
# Let me just ensure they are destructured from ctx.
ctx_replace = """const { gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError, saveProfile, setProfile, prepareLevel } = ctx;"""

import re
content = re.sub(r"const \{ gameState.*\} = ctx;", ctx_replace, content)

with open('public/game/ui/screens/LobbyScreen.js', 'w') as f:
    f.write(content)


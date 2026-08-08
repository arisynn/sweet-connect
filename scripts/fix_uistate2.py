with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

content = content.replace("formatRegenTime };", "formatRegenTime } = uiState;")

with open('public/game/GameUI.js', 'w') as f:
    f.write(content)

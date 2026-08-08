with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

content = content.replace(
    "const { showNotificationPrompt",
    "const uiState = useUiState();\n    const { showNotificationPrompt"
)
content = content.replace(" = useUiState();\n    Object.assign(window, uiState);", ";\n    Object.assign(window, uiState);")

with open('public/game/GameUI.js', 'w') as f:
    f.write(content)

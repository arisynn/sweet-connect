import re

with open('public/game/GameUI.js', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "const [showNotificationPrompt, setShowNotificationPrompt]" in line:
        start_idx = i
    if "const activeThemeObj = THEMES" in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    extracted_lines = lines[start_idx:end_idx]
    
    # We need to return an object with all the things defined here
    # A simple regex to find `const [var, setVar]` or `const funcName = `
    
    vars_to_export = []
    for line in extracted_lines:
        match1 = re.search(r"const\s+\[(\w+),\s*set\w+\]\s*=", line)
        if match1:
            vars_to_export.append(match1.group(1))
            vars_to_export.append(f"set{match1.group(1)[0].upper() + match1.group(1)[1:]}")
        match2 = re.search(r"const\s+(handle\w+)\s*=", line)
        if match2:
            vars_to_export.append(match2.group(1))
        match3 = re.search(r"const\s+(format\w+)\s*=", line)
        if match3:
            vars_to_export.append(match3.group(1))
    
    # remove duplicates
    vars_to_export = list(dict.fromkeys(vars_to_export))
    
    return_stmt = "    return { " + ", ".join(vars_to_export) + " };\n"
    
    hook_content = "const useUiState = () => {\n"
    hook_content += "    const ctx = React.useContext(GameContext);\n"
    hook_content += "    const { gameState, setGameState, hp, profile, activeThemeRef, activeTheme, playerName, progress, prepareLevel, setProfile } = ctx;\n"
    hook_content += "".join(extracted_lines)
    hook_content += return_stmt
    hook_content += "};\n"
    
    with open('public/game/ui/state/UiStateManager.js', 'w') as f:
        f.write(hook_content)
        
    # Replace in GameUI.js
    replacement = "    const uiState = useUiState();\n    Object.assign(window, uiState); // temporary hack to let other things access it if needed\n"
    new_lines = lines[:start_idx] + [replacement] + lines[end_idx:]
    
    with open('public/game/GameUI.js', 'w') as f:
        f.writelines(new_lines)
        
    print("UiStateManager extracted")

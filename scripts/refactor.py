import re
import os

with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

def extract_block(pattern, replace_with):
    global content
    match = re.search(pattern, content, re.DOTALL)
    if match:
        extracted = match.group(1)
        content = content[:match.start(1)] + replace_with + content[match.end(1):]
        return extracted
    return None

# We can find blocks by matching {gameState === 'GAMEOVER' && ( ... )}
# However, balancing parentheses in regex is hard. It's better to use a simple parenthesis balancer in Python.

def extract_balanced_jsx(start_str):
    idx = content.find(start_str)
    if idx == -1: return None
    
    # find the first '(' after idx
    start_idx = content.find('(', idx)
    if start_idx == -1: return None
    
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
        extracted = content[start_idx:end_idx+1]
        return start_idx, end_idx, extracted
    return None


import sys

def replace_balanced(start_marker, replacement_jsx, output_file, component_name):
    global content
    idx = content.find(start_marker)
    if idx == -1: return False
    
    start_idx = content.find('(', idx)
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
        
        # Create component file
        comp_content = f"const {component_name} = () => {{\n    const ctx = React.useContext(GameContext);\n    const {{ gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError }} = ctx;\n    return (\n        {extracted}\n    );\n}};\n"
        
        with open(output_file, 'w') as f:
            f.write(comp_content)
            
        content = content[:start_idx] + f"({replacement_jsx})" + content[end_idx+1:]
        print(f"Extracted {component_name}")
        return True
    return False

replace_balanced("{gameState === 'GAMEOVER' && (", "<GameOverScreen />", "public/game/ui/screens/GameOverScreen.js", "GameOverScreen")
replace_balanced("{gameState === 'WON' && (", "<WinScreen />", "public/game/ui/screens/WinScreen.js", "WinScreen")
replace_balanced("{gameState === 'PAUSED' && (", "<PauseMenu />", "public/game/ui/screens/PauseMenu.js", "PauseMenu")
replace_balanced("{gameState === 'COUNTDOWN' && (", "<CountdownOverlay />", "public/game/ui/screens/CountdownOverlay.js", "CountdownOverlay")
replace_balanced("{gameState === 'LOADING_BOARD' && (", "<LoadingOverlay />", "public/game/ui/screens/LoadingOverlay.js", "LoadingOverlay")

with open('public/game/GameUI.js', 'w') as f:
    f.write(content)

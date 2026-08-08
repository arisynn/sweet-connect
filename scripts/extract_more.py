import sys

with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

def replace_balanced(start_marker, replacement_jsx, output_file, component_name):
    global content
    idx = content.find(start_marker)
    if idx == -1: return False
    
    start_idx = content.find('(', idx)
    if start_idx == -1: return False
    
    # Wait, for {(gameState === 'LOGIN' || gameState === 'LOGIN_LOADING') && (
    # the start_marker ends with '&& ('. We want to start balancing from THAT parenthesis!
    # So:
    start_idx = idx + len(start_marker) - 1
    
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
        
        comp_content = f"const {component_name} = () => {{\n    const ctx = React.useContext(GameContext);\n    const {{ gameState, setGameState, activeTheme, activeThemeRef, score, hp, level, progress, playerName, roomData, profile, THEMES, formatNumber, AudioEngine, handleLoginSubmit, handleLogout, setPlayerName, isLoadingProfile, loginError }} = ctx;\n    return (\n        {extracted}\n    );\n}};\n"
        
        with open(output_file, 'w') as f:
            f.write(comp_content)
            
        # Replace the entire block with {condition && <Component />}
        # wait, the start_marker is just the {condition && (
        # so if we just replace the JSX body and let the `condition && (` stay?
        # NO! It's better to replace from `idx` to `end_idx` with `{condition && <Component />}`
        
        # But wait, start_marker already includes the condition!
        # Instead, let's just do what I did before: replace the BODY of the parenthesis with the component!
        
        content = content[:start_idx] + f"({replacement_jsx})" + content[end_idx+1:]
        print(f"Extracted {component_name}")
        return True
    return False

replace_balanced("{(gameState === 'LOGIN' || gameState === 'LOGIN_LOADING') && (", "<LoginScreen />", "public/game/ui/screens/LoginScreen.js", "LoginScreen")

# For LOBBY_MAIN, it has extra local state dependencies, like handleStartMatch, setShowMultiplayerPopup, etc.
# Actually, the user says "GameUI.js hanya menjadi UI Coordinator." It's fine to pass those down as props, or move them!
# Wait, handleStartMatch is defined in GameUI.js.
# Let's extract LobbyScreen and we will manually fix the props.

replace_balanced("{gameState === 'LOBBY_MAIN' && (", "<LobbyScreen handleStartMatch={handleStartMatch} setShowMultiplayerPopup={setShowMultiplayerPopup} multiplayerState={multiplayerState} setShowSettings={setShowSettings} showSettings={showSettings} setSweetMessage={setSweetMessage} />", "public/game/ui/screens/LobbyScreen.js", "LobbyScreen")

with open('public/game/GameUI.js', 'w') as f:
    f.write(content)

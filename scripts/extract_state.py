with open('public/game/GameUI.js', 'r') as f:
    lines = f.readlines()

state_lines = []
for line in lines:
    if "React.useState" in line or "React.useEffect" in line or "useRef" in line:
        pass # we can't blindly extract, wait


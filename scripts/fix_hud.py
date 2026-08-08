with open('public/game/ui/components/HUD.js', 'r') as f:
    content = f.read()

content = content.replace("const HUD = () => {", "const HUD = ({ regenTimeLeft, multiplayerState, matchTime, formatRegenTime }) => {")

with open('public/game/ui/components/HUD.js', 'w') as f:
    f.write(content)


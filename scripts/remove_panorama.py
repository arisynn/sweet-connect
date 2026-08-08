import re

with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

start_marker = "const PanoramaBackground = ("
idx = content.find(start_marker)
if idx != -1:
    count = 0
    end_idx = -1
    for i in range(idx, len(content)):
        if content[i] == '{':
            count += 1
        elif content[i] == '}':
            count -= 1
            if count == 0:
                end_idx = i + 1
                break
                
    if end_idx != -1:
        # But wait, it's an arrow function: `...}) => { ... };`
        # The `{` parsing might stop at the end of the `({ ... })` arguments!
        pass

# Since it's exactly 120 lines, we can just replace lines 1 to 121
lines = content.split('\n')
if lines[0].startswith("const PanoramaBackground"):
    end_idx = 0
    for i, line in enumerate(lines):
        if line.startswith("const GameUI = () => {"):
            end_idx = i
            break
    
    lines = lines[end_idx:]
    with open('public/game/GameUI.js', 'w') as f:
        f.write('\n'.join(lines))
    print("Removed PanoramaBackground")

import re

with open('index.html', 'r') as f:
    html = f.read()

new_scripts = [
    '"/game/ui/state/UiStateManager.js",',
]

idx = html.find('"/game/GameUI.js",')
if idx != -1:
    spaces = "            "
    insert_str = "\n".join([spaces + s for s in new_scripts]) + "\n"
    html = html[:idx] + insert_str + html[idx:]
    
with open('index.html', 'w') as f:
    f.write(html)

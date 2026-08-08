with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

content = content.replace("        </React.Fragment>\n    );\n};", "            </div>\n        </div>\n        </React.Fragment>\n    );\n};")

with open('public/game/GameUI.js', 'w') as f:
    f.write(content)

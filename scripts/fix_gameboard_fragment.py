import re

with open('public/game/ui/components/GameBoard.js', 'r') as f:
    content = f.read()

content = content.replace("return (\n        <div", "return (\n        <React.Fragment>\n        <div")
content = content.replace("        </div>\n        );\n};\n", "        </div>\n        </React.Fragment>\n        );\n};\n")
# Actually, the replacement for the end might be different if my python script output something else.
# Let's do a safe replace:

with open('public/game/ui/components/GameBoard.js', 'w') as f:
    f.write(content)

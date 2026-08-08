with open('public/game/ui/components/GameBoard.js', 'r') as f:
    content = f.read()

content = content.replace("            </div>\n        </React.Fragment>\n        );\n};\n", "        </React.Fragment>\n        );\n};\n")

with open('public/game/ui/components/GameBoard.js', 'w') as f:
    f.write(content)

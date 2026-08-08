with open('public/game/GameUI.js', 'r') as f:
    content = f.read()

import re

for match in re.finditer(r"\{\(?(gameState === '[^']+'(\s*\|\|\s*gameState === '[^']+')*)\)? && \(", content):
    print(match.group(0))


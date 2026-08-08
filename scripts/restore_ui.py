import re

with open('public/game/ui/components/GameBoard.js', 'r') as f:
    lines = f.readlines()

split_idx = -1
for i, line in enumerate(lines):
    if "SCREENS" in line:
        split_idx = i
        break

if split_idx != -1:
    board_lines = lines[:split_idx] + ["            </div>\n        );\n};\n"]
    
    extracted_lines = lines[split_idx:-4] # exclude the closing divs
    
    with open('public/game/ui/components/GameBoard.js', 'w') as f:
        f.writelines(board_lines)
        
    with open('public/game/GameUI.js', 'r') as f:
        ui_lines = f.readlines()
        
    for i, line in enumerate(ui_lines):
        if "<GameBoard />" in line:
            ui_lines.insert(i+1, "".join(extracted_lines))
            break
            
    with open('public/game/GameUI.js', 'w') as f:
        f.writelines(ui_lines)
        
    print("Restored UI screens to GameUI")

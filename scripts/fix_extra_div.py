with open('public/game/ui/components/GameBoard.js', 'r') as f:
    lines = f.readlines()

# let's just rewrite the end
# find the last </div> before </React.Fragment> and remove it.

new_lines = []
for line in lines:
    new_lines.append(line)

# Wait, if line 83 is `            </div>\n`, let's remove it.
if "</div>" in new_lines[-3]:
    new_lines.pop(-3)

with open('public/game/ui/components/GameBoard.js', 'w') as f:
    f.writelines(new_lines)

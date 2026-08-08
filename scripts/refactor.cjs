const fs = require('fs');
const parser = require('@babel/parser');
const generate = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('public/game/GameUI.js', 'utf8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

let panoramaCode = '';
let gameUICode = '';

traverse(ast, {
  VariableDeclaration(path) {
    if (path.node.declarations[0].id.name === 'PanoramaBackground') {
      panoramaCode = generate(path.node).code;
      path.remove();
    }
  }
});

const modifiedCode = generate(ast).code;
fs.writeFileSync('public/game/GameUI.new.js', modifiedCode);
fs.writeFileSync('public/game/ui/components/PanoramaBackground.js', 
  "const React = window.React;\n" + panoramaCode + "\nexport default PanoramaBackground;\n"
);
console.log('done');

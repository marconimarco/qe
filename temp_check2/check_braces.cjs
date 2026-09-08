const fs = require('fs');
const data = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

let open = 0;
let close = 0;
let parenOpen = 0;
let parenClose = 0;

for (let i = 0; i < data.length; i++) {
  if (data[i] === '{') open++;
  if (data[i] === '}') close++;
  if (data[i] === '(') parenOpen++;
  if (data[i] === ')') parenClose++;
}

console.log('Braces:', { open, close, diff: open - close });
console.log('Parentheses:', { parenOpen, parenClose, diff: parenOpen - parenClose });

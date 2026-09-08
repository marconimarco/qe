const fs = require('fs');
const data = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

let stack = [];
let lines = data.split('\n');

for(let i = 0; i < lines.length; i++) {
  let line = lines[i];
  // Simple check for unclosed parenthesis or brackets
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '(') stack.push({char: '(', line: i+1});
    if (line[j] === '{') stack.push({char: '{', line: i+1});
    if (line[j] === ')') {
      let pop = stack.pop();
      if (pop && pop.char !== '(') console.log(`Mismatch ) at ${i+1}. Expected closing for ${pop.char} from line ${pop.line}`);
    }
    if (line[j] === '}') {
      let pop = stack.pop();
      if (pop && pop.char !== '{') console.log(`Mismatch } at ${i+1}. Expected closing for ${pop.char} from line ${pop.line}`);
    }
  }
}
if(stack.length > 0) {
  console.log('Unclosed:', stack[stack.length - 1]);
} else {
  console.log('All matched');
}

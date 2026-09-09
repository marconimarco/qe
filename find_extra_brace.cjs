const fs = require('fs');
const file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');
let open = 0;
let lines = file.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') open++;
    if (line[j] === '}') open--;
  }
  if (open < 0) {
    console.log("Extra closing brace found at line", i + 1, ":", line);
    open = 0; // reset to continue
  }
}

const fs = require('fs');
const file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

let open = 0;
let close = 0;
for (let i = 0; i < file.length; i++) {
  if (file[i] === '{') open++;
  if (file[i] === '}') close++;
}
console.log('Total Open:', open, 'Total Close:', close);

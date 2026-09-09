const fs = require('fs');
const file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

const regex = /const renderFormattedMessage = \(text: string\) => \{([\s\S]*?)\n  \};/m;
const match = file.match(regex);
if (match) {
  let open = 0;
  let close = 0;
  for (let char of match[0]) {
    if (char === '{') open++;
    if (char === '}') close++;
  }
  console.log('Open:', open, 'Close:', close);
} else {
  console.log("Not found");
}

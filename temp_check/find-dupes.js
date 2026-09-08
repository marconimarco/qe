import fs from 'fs';
const content = fs.readFileSync('src/lib/translations.ts', 'utf8');
const lines = content.split('\n');
let currentLang = '';
const keysByLang = {};

lines.forEach((line, i) => {
  const langMatch = line.match(/^\s*(\w+): \{/);
  if (langMatch) {
    currentLang = langMatch[1];
    keysByLang[currentLang] = new Set();
    return;
  }
  
  const keyMatch = line.match(/^\s*(\w+): /);
  if (keyMatch && currentLang) {
    const key = keyMatch[1];
    if (keysByLang[currentLang].has(key)) {
      console.log(`Duplicate key "${key}" in language "${currentLang}" at line ${i + 1}`);
    }
    keysByLang[currentLang].add(key);
  }
});

const fs = require('fs');
const data = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

// Try to parse with typescript
const ts = require('typescript');
const sourceFile = ts.createSourceFile('TestPage.tsx', data, ts.ScriptTarget.Latest, true);

function printDiagnostics(diagnostics) {
  diagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });
}

const diagnostics = sourceFile.parseDiagnostics;
if (diagnostics && diagnostics.length > 0) {
  printDiagnostics(diagnostics);
} else {
  console.log("No syntax errors found by TS parser directly!");
}

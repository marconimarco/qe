const fs = require('fs');
let data = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

if (data.includes('    setIsManualAngle(false);\n  const radTheta')) {
  data = data.replace('    setIsManualAngle(false);\n  const radTheta', '    setIsManualAngle(false);\n  };\n\n  const radTheta');
  fs.writeFileSync('src/components/TestPage.tsx', data);
  console.log('Patched');
} else if (data.includes('    setPhi(0);\n    setIsManualAngle(false);\n  const radTheta')) {
  data = data.replace('    setPhi(0);\n    setIsManualAngle(false);\n  const radTheta', '    setPhi(0);\n  };\n\n  const radTheta');
  fs.writeFileSync('src/components/TestPage.tsx', data);
  console.log('Patched 2');
} else {
  console.log('Not found');
}

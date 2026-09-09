const fs = require('fs');
let file = fs.readFileSync('src/components/TestPage.tsx', 'utf8');

const sphereDrawRegex = /\/\/ 1\. Cerchio Principale della Sfera[\s\S]*?\/\/ 2\. Ellissi 3D animate \(rotazione lenta\)/;

const newSphereDraw = `// 1. Cerchio Principale della Sfera e griglia 3D
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#334155'; // Lighter border
      ctx.lineWidth = 2;
      ctx.stroke();

      // Latitudine e Longitudine per effetto 3D
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      
      // Ellissi orizzontale (equatore)
      ctx.beginPath();
      ctx.ellipse(center, center, radius, radius * 0.3, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Ellissi verticale
      ctx.beginPath();
      ctx.ellipse(center, center, radius * 0.3, radius, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Effetto gradiente 3D interno
      const innerGrad = ctx.createRadialGradient(center - radius*0.3, center - radius*0.3, radius * 0.1, center, center, radius);
      innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.fill();

      // 2. Ellissi 3D animate (rotazione lenta)`;

file = file.replace(sphereDrawRegex, newSphereDraw);
fs.writeFileSync('src/components/TestPage.tsx', file);

const fs = require('fs');
const path = require('path');
const p = path.resolve('src/components/TestPage.tsx');
let data = fs.readFileSync(p, 'utf8');

data = data.replace(/\{isManualAngle && \(\s*<div className="text-\[10px\] text-amber-400 font-mono mt-1 pt-1 border-t border-white\/10">\s*⚠️ \[MODALITÀ MANUALE\] Angoli modificati tramite slider\.\s*<\/div>\s*\)\}/g, '');

const regexDrawBloch = /useEffect\(\(\) => \{\s*drawBlochSphere\(\);\s*\}, \[theta, phi, targetAlgoritmo, assetSector, vincoloStile\]\);[\s\S]*?const drawBlochSphere = \(\) => \{[\s\S]*?ctx\.fill\(\);\s*\};/m;

const newCanvasCode = `  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let currentTheta = 0;
    let currentPhi = 0;
    let time = 0;

    const render = () => {
      // Interpolazione fluida verso theta e phi
      currentTheta += (theta - currentTheta) * 0.05;
      currentPhi += (phi - currentPhi) * 0.05;
      time += 0.02;

      const isQuantum = targetAlgoritmo.startsWith('Qiskit_');
      const size = 280;
      const center = size / 2;
      const radius = 100;
      const radTheta = (currentTheta * Math.PI) / 180;
      const radPhi = (currentPhi * Math.PI) / 180;

      ctx.clearRect(0, 0, size, size);

      // Glow luminoso di background
      const gradient = ctx.createRadialGradient(center, center, radius * 0.2, center, center, radius * 1.5);
      gradient.addColorStop(0, targetAlgoritmo === 'IDLE' ? 'rgba(30, 41, 59, 0.2)' : (isQuantum ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'));
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // 1. Cerchio Principale della Sfera
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Ellissi 3D animate (rotazione lenta)
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(time * 0.2);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.3, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(-time * 0.15);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.3, Math.PI / 2, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.2)';
      ctx.stroke();
      ctx.restore();

      // 3. Assi Cartesiani (tratteggiati)
      ctx.beginPath();
      ctx.moveTo(center, center - radius - 15); ctx.lineTo(center, center + radius + 15); // Asse Z
      ctx.moveTo(center - radius - 15, center); ctx.lineTo(center + radius + 15, center); // Asse X
      ctx.strokeStyle = 'rgba(99, 115, 139, 0.3)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Etichette Poli
      ctx.fillStyle = '#06b6d4'; ctx.font = 'bold 10px monospace'; ctx.fillText('|0⟩', center - 18, center - radius - 5);
      ctx.fillStyle = '#ec4899'; ctx.fillText('|1⟩', center - 18, center + radius + 12);

      // 4. Calcolo vettore 3D
      const x3d = radius * Math.sin(radTheta) * Math.cos(radPhi);
      const y3d = radius * Math.sin(radTheta) * Math.sin(radPhi);
      const z3d = radius * Math.cos(radTheta);

      // Mappatura isometrica
      const targetX = center + x3d - y3d * 0.4;
      const targetY = center - z3d;

      // Disegno Vettore di Stato
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(targetX, targetY);
      ctx.strokeStyle = targetAlgoritmo === 'IDLE' ? '#334155' : (isQuantum ? '#f59e0b' : '#10b981');
      ctx.lineWidth = 3;
      ctx.stroke();

      // Effetto ombra sul nodo
      ctx.shadowBlur = 15;
      ctx.shadowColor = targetAlgoritmo === 'IDLE' ? '#475569' : (isQuantum ? '#fbbf24' : '#34d399');

      // Nodo sulla punta
      ctx.beginPath();
      ctx.arc(targetX, targetY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = targetAlgoritmo === 'IDLE' ? '#475569' : (isQuantum ? '#fbbf24' : '#34d399');
      ctx.fill();

      // Particelle orbitali animate se non IDLE
      if (targetAlgoritmo !== 'IDLE') {
        ctx.beginPath();
        const pX = center + (radius * 0.8) * Math.cos(time * 2);
        const pY = center + (radius * 0.8) * Math.sin(time * 2) * 0.3;
        ctx.arc(pX, pY, 2, 0, 2 * Math.PI);
        ctx.fillStyle = isQuantum ? '#fbbf24' : '#34d399';
        ctx.fill();
        
        ctx.beginPath();
        const pX2 = center + (radius * 0.8) * Math.cos(time * 2 + Math.PI);
        const pY2 = center + (radius * 0.8) * Math.sin(time * 2 + Math.PI) * 0.3;
        ctx.arc(pX2, pY2, 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theta, phi, targetAlgoritmo]);`;

data = data.replace(regexDrawBloch, newCanvasCode);
fs.writeFileSync(p, data);

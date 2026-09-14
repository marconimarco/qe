export function BlochSphere({ theta, phi, targetAlgoritmo }: { theta: number; phi: number; targetAlgoritmo: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
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
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius * 1.5);
      gradient.addColorStop(0, isQuantum ? 'rgba(6, 182, 212, 0.15)' : 'rgba(16, 185, 129, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      // Sfera wireframe
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = isQuantum ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Assi (X, Y, Z)
      ctx.beginPath();
      ctx.moveTo(center, center - radius - 10);
      ctx.lineTo(center, center + radius + 10);
      ctx.moveTo(center - radius - 10, center);
      ctx.lineTo(center + radius + 10, center);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etichette Assi
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px monospace';
      ctx.fillText('|0⟩', center - 8, center - radius - 15);
      ctx.fillText('|1⟩', center - 8, center + radius + 22);
      ctx.fillText('x', center + radius + 15, center + 4);

      // Calcolo coordinate Vettore di Stato (Bloch)
      // Rotazione simulata sull'asse Y per dare senso 3D
      const x = center + radius * Math.sin(radTheta) * Math.cos(radPhi + time);
      const y = center - radius * Math.cos(radTheta);

      // Vettore principale
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      ctx.strokeStyle = isQuantum ? '#06b6d4' : '#10b981'; // Ciano se quantistico, smeraldo se classico
      ctx.lineWidth = 2;
      ctx.stroke();

      // Punto (Head del vettore)
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = isQuantum ? '#fff' : '#a7f3d0';
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = isQuantum ? '#06b6d4' : '#10b981';
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theta, phi, targetAlgoritmo]);

  return <canvas ref={canvasRef} width={280} height={280} />;
}

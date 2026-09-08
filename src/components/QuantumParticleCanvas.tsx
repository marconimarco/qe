import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  isAtomCenter?: boolean;
  orbitAngle?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitCenterIndex?: number;
}

export default function QuantumParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palette inspired by quantum energy levels and atomic shells
    const colors = [
      '#00f2ff', // Cyan / Quantum Primary
      '#7000ff', // Deep Ultraviolet / Quantum Secondary
      '#38bdf8', // Sky Blue / Electron Shell
      '#818cf8', // Indigo / Wavepacket
      '#00ffc8', // Quantum Mint
    ];

    // Generate Atomic Nuclei and Surrounding Quantum Particles
    const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
    const particles: Particle[] = [];

    // Create 4-6 primary Atomic Nuclei centers
    const atomCentersCount = Math.max(3, Math.min(6, Math.floor(width / 320)));
    const atomCenters: { x: number; y: number; vx: number; vy: number }[] = [];

    for (let i = 0; i < atomCentersCount; i++) {
      atomCenters.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
      const isAtomCenter = i < atomCentersCount;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const baseRadius = isAtomCenter ? Math.random() * 2.5 + 3.5 : Math.random() * 1.5 + 1.2;

      // Assign some particles as orbiting electrons around an atom nucleus
      const hasOrbit = !isAtomCenter && Math.random() > 0.45;
      const orbitCenterIndex = Math.floor(Math.random() * atomCentersCount);

      particles.push({
        x: isAtomCenter ? atomCenters[i].x : Math.random() * width,
        y: isAtomCenter ? atomCenters[i].y : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: baseRadius,
        baseRadius,
        color,
        alpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        isAtomCenter,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitRadius: hasOrbit ? Math.random() * 90 + 35 : undefined,
        orbitSpeed: (Math.random() - 0.5) * 0.02,
        orbitCenterIndex: hasOrbit ? orbitCenterIndex : undefined,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Update and draw atom centers
      atomCenters.forEach((center) => {
        center.x += center.vx;
        center.y += center.vy;

        if (center.x < 50 || center.x > width - 50) center.vx *= -1;
        if (center.y < 50 || center.y > height - 50) center.vy *= -1;
      });

      // Draw quantum probability wave ripples / orbital rings
      atomCenters.forEach((center, idx) => {
        const pulse = Math.sin(time * 1.5 + idx) * 10;
        
        // Orbital Ring 1
        ctx.beginPath();
        ctx.arc(center.x, center.y, 50 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        // Orbital Ring 2 (Elliptical inclined simulation)
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, 90 + pulse * 0.5, 45 + pulse * 0.2, (time * 0.2) + idx, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(112, 0, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Update particle positions
      particles.forEach((p, index) => {
        p.pulsePhase += p.pulseSpeed;
        const scale = 1 + Math.sin(p.pulsePhase) * 0.3;
        p.radius = p.baseRadius * scale;

        if (p.orbitRadius !== undefined && p.orbitCenterIndex !== undefined) {
          const center = atomCenters[p.orbitCenterIndex];
          if (center) {
            p.orbitAngle! += p.orbitSpeed!;
            p.x = center.x + Math.cos(p.orbitAngle!) * p.orbitRadius;
            p.y = center.y + Math.sin(p.orbitAngle!) * (p.orbitRadius * 0.65);
          }
        } else {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;
        }

        // Draw particle (Quantum Node / Molecule Atom)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = p.isAtomCenter ? 18 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Draw molecular/entanglement connection bonds between nearby particles
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = p.isAtomCenter || p2.isAtomCenter ? 140 : 100;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);

            // Subtle gradient bond
            const grad = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, p2.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = p.isAtomCenter || p2.isAtomCenter ? 1.2 : 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-75"
    />
  );
}

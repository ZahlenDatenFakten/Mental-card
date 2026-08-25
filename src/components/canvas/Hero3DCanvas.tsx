import React, { useEffect, useRef } from 'react';

interface Node3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  label: string;
  type: 'thesis' | 'evidence' | 'norm' | 'fact' | 'risk' | 'remedy';
  color: string;
  radius: number;
  pulsePhase: number;
}

const LEGAL_TERMS: { label: string; type: Node3D['type']; color: string }[] = [
  { label: 'Исковые требования', type: 'remedy', color: '#FF375F' },
  { label: 'Тезис стороны', type: 'thesis', color: '#BF5AF2' },
  { label: 'ст. 309, 310 ГК РФ', type: 'norm', color: '#0A84FF' },
  { label: 'Договор поставки № 12', type: 'evidence', color: '#30D158' },
  { label: 'Акт сверки расчетов', type: 'evidence', color: '#30D158' },
  { label: '14.04.2024 Оплата счета', type: 'fact', color: '#FF9F0A' },
  { label: 'Возражение оппонента', type: 'risk', color: '#FF453A' },
  { label: 'Товарная накладная', type: 'evidence', color: '#30D158' },
  { label: 'Пленум ВС РФ № 7', type: 'norm', color: '#0A84FF' },
  { label: 'Контр-аргумент', type: 'thesis', color: '#BF5AF2' },
  { label: 'Судебная экспертиза', type: 'evidence', color: '#30D158' },
  { label: 'Неустойка по ст. 395', type: 'remedy', color: '#FF375F' },
  { label: 'Претензионный порядок', type: 'norm', color: '#0A84FF' },
  { label: 'Фабула спора', type: 'fact', color: '#FFD60A' },
  { label: 'Риск отказа в иске', type: 'risk', color: '#FF453A' },
];

export const Hero3DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 450;
    };

    window.addEventListener('resize', handleResize);

    // Mouse coordinates for 3D parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / width - 0.5;
      const normY = (e.clientY - rect.top) / height - 0.5;
      mouseX = normX * 2;
      mouseY = normY * 2;
      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Create 3D Nodes
    const nodes: Node3D[] = LEGAL_TERMS.map((item, idx) => {
      const theta = (idx / LEGAL_TERMS.length) * Math.PI * 2 + Math.random() * 0.5;
      const phi = Math.acos((Math.random() * 2) - 1);
      const radius = 180 + Math.random() * 120;

      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: (radius * Math.sin(phi) * Math.sin(theta)) * 0.7,
        z: radius * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.25,
        vz: (Math.random() - 0.5) * 0.3,
        label: item.label,
        type: item.type,
        color: item.color,
        radius: 4.5 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    // Create background stars/particles
    const particlesCount = 60;
    const particles = Array.from({ length: particlesCount }).map(() => ({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 500,
      z: (Math.random() - 0.5) * 600,
      size: 1 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.5,
    }));

    const fov = 350;
    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth camera rotation with spring interpolation
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY + Math.sin(time * 0.5) * 0.15 - rotY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw subtle ambient nebula lights behind 3D space
      const bgGrad = ctx.createRadialGradient(
        centerX + mouseX * 60,
        centerY + mouseY * 40,
        20,
        centerX,
        centerY,
        width * 0.6
      );
      bgGrad.addColorStop(0, 'rgba(10, 132, 255, 0.12)');
      bgGrad.addColorStop(0.35, 'rgba(191, 90, 242, 0.07)');
      bgGrad.addColorStop(0.7, 'rgba(48, 209, 88, 0.03)');
      bgGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Rotate and project function
      const project = (x: number, y: number, z: number) => {
        // Rotate around Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate around X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const distance = fov / (fov + z2 + 350);
        return {
          px: centerX + x1 * distance,
          py: centerY + y2 * distance,
          scale: distance,
          depth: z2,
        };
      };

      // Draw background ambient particles
      particles.forEach((p) => {
        const prj = project(p.x, p.y, p.z);
        if (prj.scale > 0) {
          ctx.beginPath();
          ctx.arc(prj.px, prj.py, p.size * prj.scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * prj.scale * 0.7})`;
          ctx.fill();
        }
      });

      // Update node positions with gentle floating
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        // Boundary bounce
        if (Math.abs(n.x) > 280) n.vx *= -1;
        if (Math.abs(n.y) > 180) n.vy *= -1;
        if (Math.abs(n.z) > 240) n.vz *= -1;
      });

      // Project all nodes
      const projectedNodes = nodes.map((n) => {
        const prj = project(n.x, n.y, n.z);
        return {
          node: n,
          px: prj.px,
          py: prj.py,
          scale: prj.scale,
          depth: prj.depth,
        };
      });

      // Sort by depth for correct 3D rendering order (back to front)
      projectedNodes.sort((a, b) => b.depth - a.depth);

      // Draw 3D Connection Lines between nearby nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const a = projectedNodes[i];
          const b = projectedNodes[j];

          const dist3D = Math.hypot(
            a.node.x - b.node.x,
            a.node.y - b.node.y,
            a.node.z - b.node.z
          );

          if (dist3D < 180) {
            const alpha = (1 - dist3D / 180) * 0.45 * Math.min(a.scale, b.scale);
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);

            const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
            grad.addColorStop(0, a.node.color);
            grad.addColorStop(1, b.node.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.2 * Math.min(a.scale, b.scale);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            // Draw traveling light pulse photon on connection line
            const pulse = (time * 0.8 + (i + j)) % 1;
            const pulseX = a.px + (b.px - a.px) * pulse;
            const pulseY = a.py + (b.py - a.py) * pulse;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 2 * a.scale, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = alpha * 1.5;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Draw 3D Legal Nodes (Glass Cards & Spheres)
      projectedNodes.forEach(({ node, px, py, scale }) => {
        if (scale <= 0) return;

        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.2 + 1;
        const currentRadius = node.radius * scale * pulse;

        // Outer Glow
        const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, currentRadius * 4);
        glowGrad.addColorStop(0, node.color + 'aa');
        glowGrad.addColorStop(0.5, node.color + '33');
        glowGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Node Inner Orb
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12 * scale;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Shiny Glass Highlight
        ctx.beginPath();
        ctx.arc(px - currentRadius * 0.3, py - currentRadius * 0.3, currentRadius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fill();

        // Luminous Glass Label Card
        if (scale > 0.45) {
          ctx.font = `600 ${Math.max(10, 11 * scale)}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
          const textWidth = ctx.measureText(node.label).width;
          const padX = 8 * scale;
          const padY = 4 * scale;
          const boxW = textWidth + padX * 2;
          const boxH = 18 * scale + padY;
          const boxX = px - boxW / 2;
          const boxY = py + currentRadius + 6 * scale;

          // Glass pill background
          ctx.fillStyle = 'rgba(28, 28, 30, 0.85)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 0.8;

          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 6 * scale);
          ctx.fill();
          ctx.stroke();

          // Left node color dot
          ctx.beginPath();
          ctx.arc(boxX + 6 * scale, boxY + boxH / 2, 2.5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Label Text
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(node.label, boxX + 12 * scale, boxY + boxH / 2 + 3.5 * scale);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] overflow-hidden rounded-3xl border border-white/[0.12] shadow-2xl bg-gradient-to-b from-zinc-950 via-[#0d0d11] to-black">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing" />
      <div className="absolute inset-0 pointer-events-none bg-radial-vignette opacity-40" />
    </div>
  );
};

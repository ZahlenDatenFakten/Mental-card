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
  { label: 'Правовой тезис', type: 'thesis', color: '#BF5AF2' },
  { label: 'ст. 309, 310 ГК РФ', type: 'norm', color: '#0A84FF' },
  { label: 'Договор поставки', type: 'evidence', color: '#30D158' },
  { label: 'Акт сверки расчетов', type: 'evidence', color: '#30D158' },
  { label: 'Хронология оплаты', type: 'fact', color: '#FF9F0A' },
  { label: 'Возражения оппонента', type: 'risk', color: '#FF453A' },
  { label: 'Товарная накладная', type: 'evidence', color: '#30D158' },
  { label: 'Пленум ВС РФ № 7', type: 'norm', color: '#0A84FF' },
  { label: 'Контр-позиция', type: 'thesis', color: '#BF5AF2' },
  { label: 'Судебная экспертиза', type: 'evidence', color: '#30D158' },
  { label: 'Расчет неустойки', type: 'remedy', color: '#FF375F' },
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

    // Mouse tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / width - 0.5;
      const normY = (e.clientY - rect.top) / height - 0.5;
      targetRotY = normX * 0.5;
      targetRotX = -normY * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Create 3D Nodes
    const nodes: Node3D[] = LEGAL_TERMS.map((item, idx) => {
      const theta = (idx / LEGAL_TERMS.length) * Math.PI * 2;
      const phi = Math.acos((idx % 2 === 0 ? 0.4 : -0.4));
      const radius = 170 + (idx % 3) * 25;

      return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta) * 0.65,
        z: radius * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.18,
        label: item.label,
        type: item.type,
        color: item.color,
        radius: 5,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    const fov = 380;
    let time = 0;

    const render = () => {
      time += 0.012;

      // Smooth camera rotation
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY + Math.sin(time * 0.4) * 0.12 - rotY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Subtle ambient background gradient
      const bgGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        width * 0.6
      );
      bgGrad.addColorStop(0, 'rgba(10, 132, 255, 0.08)');
      bgGrad.addColorStop(0.5, 'rgba(191, 90, 242, 0.04)');
      bgGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Rotate and project function
      const project = (x: number, y: number, z: number) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        const distance = fov / (fov + z2 + 360);
        return {
          px: centerX + x1 * distance,
          py: centerY + y2 * distance,
          scale: distance,
          depth: z2,
        };
      };

      // Update positions
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        if (Math.abs(n.x) > 220) n.vx *= -1;
        if (Math.abs(n.y) > 140) n.vy *= -1;
        if (Math.abs(n.z) > 200) n.vz *= -1;
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

      // Sort by depth
      projectedNodes.sort((a, b) => b.depth - a.depth);

      // 1. DRAW CONNECTIONS FIRST (in the background, so they never draw on top of cards or labels!)
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const a = projectedNodes[i];
          const b = projectedNodes[j];

          const dist3D = Math.hypot(
            a.node.x - b.node.x,
            a.node.y - b.node.y,
            a.node.z - b.node.z
          );

          if (dist3D < 160) {
            const alpha = (1 - dist3D / 160) * 0.35 * Math.min(a.scale, b.scale);
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);

            const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
            grad.addColorStop(0, a.node.color);
            grad.addColorStop(1, b.node.color);

            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.0 * Math.min(a.scale, b.scale);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // 2. DRAW GLOWING NODES & CLEAN LABELS (on top layer)
      projectedNodes.forEach(({ node, px, py, scale }) => {
        if (scale <= 0) return;

        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.15 + 1;
        const currentRadius = node.radius * scale * pulse;

        // Outer Glow
        const glowGrad = ctx.createRadialGradient(px, py, 0, px, py, currentRadius * 3.5);
        glowGrad.addColorStop(0, node.color + '88');
        glowGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(px, py, currentRadius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Node Center
        ctx.beginPath();
        ctx.arc(px, py, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10 * scale;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Clean Glass Label Pill (solid dark background so no lines ever show through!)
        if (scale > 0.45) {
          ctx.font = `600 ${Math.max(10, 11 * scale)}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
          const textWidth = ctx.measureText(node.label).width;
          const padX = 8 * scale;
          const padY = 4 * scale;
          const boxW = textWidth + padX * 2;
          const boxH = 18 * scale + padY;
          const boxX = px - boxW / 2;
          const boxY = py + currentRadius + 5 * scale;

          // Solid glass pill background
          ctx.fillStyle = '#18181b';
          ctx.strokeStyle = node.color + '44';
          ctx.lineWidth = 0.8;

          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 6 * scale);
          ctx.fill();
          ctx.stroke();

          // Left node color indicator dot
          ctx.beginPath();
          ctx.arc(boxX + 6 * scale, boxY + boxH / 2, 2.5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Clean Label Text
          ctx.fillStyle = '#F5F5F7';
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
    <div className="relative w-full h-[360px] sm:h-[420px] overflow-hidden rounded-3xl border border-zinc-800/80 shadow-2xl bg-[#0d0d10]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing" />
    </div>
  );
};

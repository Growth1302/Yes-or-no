import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  active: boolean;
  styleType: 'burst' | 'sparkle' | 'calm' | 'party';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vr: number;
  alpha: number;
  shape: 'rect' | 'circle';
}

const COLORS_BY_STYLE: Record<ConfettiCanvasProps['styleType'], string[]> = {
  burst: ['#2563EB', '#7C3AED', '#EC4899', '#06B6D4', '#EAB308'],
  party: ['#EC4899', '#F97316', '#EAB308', '#10B981', '#2563EB', '#7C3AED'],
  sparkle: ['#F97316', '#EAB308', '#06B6D4', '#7C3AED', '#10B981'],
  calm: ['#06B6D4', '#7C3AED', '#6366F1', '#10B981'],
};

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({
  active,
  styleType,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const palette = COLORS_BY_STYLE[styleType];
    const count = styleType === 'calm' ? 38 : styleType === 'party' ? 85 : 65;
    const particles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed =
        styleType === 'calm'
          ? 2 + Math.random() * 4.5
          : 4 + Math.random() * 9.5;
      return {
        x: width * (0.35 + Math.random() * 0.3),
        y: height * (0.28 + Math.random() * 0.15),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (styleType === 'calm' ? 2 : 5),
        size: styleType === 'calm' ? 4 + Math.random() * 4 : 5 + Math.random() * 6,
        color: palette[Math.floor(Math.random() * palette.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        alpha: 1,
        shape:
          styleType === 'calm' || Math.random() > 0.65 ? 'circle' : 'rect',
      };
    });

    let rafId = 0;
    const gravity = styleType === 'calm' ? 0.08 : 0.22;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.vx *= 0.99;
        p.rotation += p.vr;
        p.alpha -= styleType === 'calm' ? 0.01 : 0.011;

        if (p.alpha > 0.02 && p.y < height + 40) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
          }
          ctx.restore();
        }
      }

      if (alive) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, styleType]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[70]"
    />
  );
};

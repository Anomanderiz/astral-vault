import { useEffect, useRef } from 'react';

function rand(min, max) {
  return min + Math.random() * (max - min);
}

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const makeStar = (bright) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: bright ? rand(1.5, 3) : rand(0.5, 1.5),
      baseOpacity: bright ? rand(0.5, 1) : rand(0.2, 0.5),
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: rand(0.005, bright ? 0.02 : 0.015),
      drift: rand(0.02, 0.05),
    });

    const dimStars = Array.from({ length: 120 }, () => makeStar(false));
    const brightStars = Array.from({ length: 40 }, () => makeStar(true));
    const allStars = [...dimStars, ...brightStars];

    let shootingStar = null;
    let nextShootAt = Date.now() + rand(4000, 12000);
    let t = 0;

    function drawStars() {
      for (const s of allStars) {
        const opacity = s.baseOpacity + Math.sin(s.phase + t * s.twinkleSpeed) * s.baseOpacity * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, opacity)})`;
        ctx.fill();
        s.x += s.drift;
        if (s.x > canvas.width + 4) s.x = -4;
      }
    }

    function drawShootingStar() {
      const now = Date.now();
      if (!shootingStar && now >= nextShootAt) {
        shootingStar = {
          x: rand(0, canvas.width * 0.6),
          y: rand(0, canvas.height * 0.4),
          angle: rand(0.3, 0.7),
          speed: rand(8, 14),
          length: rand(80, 160),
          opacity: 1,
          progress: 0,
        };
        nextShootAt = now + rand(4000, 12000);
      }
      if (!shootingStar) return;

      const { x, y, angle, speed, length, opacity, progress } = shootingStar;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const hx = x + cos * speed * progress;
      const hy = y + sin * speed * progress;
      const tx = hx - cos * length;
      const ty = hy - sin * length;

      const grad = ctx.createLinearGradient(tx, ty, hx, hy);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, `rgba(255,255,255,${opacity})`);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      shootingStar.progress += 1;
      shootingStar.opacity -= 0.018;
      if (shootingStar.opacity <= 0 || hx > canvas.width + 100 || hy > canvas.height + 100) {
        shootingStar = null;
      }
    }

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawStars();
      drawShootingStar();
      t++;
      animId = requestAnimationFrame(frame);
    }

    animId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

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

    // Dim background stars — just dots with subtle twinkle
    const dimStars = Array.from({ length: 160 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: rand(0.4, 1.1),
      minOpacity: rand(0.05, 0.15),
      maxOpacity: rand(0.3, 0.65),
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: rand(0.006, 0.022),
      drift: rand(0.015, 0.04),
    }));

    // Mid-bright stars — dot + soft glow
    const medStars = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: rand(1.3, 2.3),
      minOpacity: rand(0.15, 0.35),
      maxOpacity: rand(0.65, 1.0),
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: rand(0.01, 0.028),
      drift: rand(0.015, 0.035),
      glow: true,
    }));

    // Feature stars — large glow + cross spikes
    const brightStars = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: rand(2.6, 4.2),
      minOpacity: rand(0.35, 0.55),
      maxOpacity: 1.0,
      phase: Math.random() * Math.PI * 2,
      twinkleSpeed: rand(0.01, 0.022),
      drift: rand(0.012, 0.028),
      glow: true,
      spikes: true,
    }));

    const allStars = [...dimStars, ...medStars, ...brightStars];

    let shootingStar = null;
    let nextShootAt = Date.now() + rand(4000, 12000);
    let frame = 0;

    function starOpacity(s) {
      const t = s.phase + frame * s.twinkleSpeed;
      return s.minOpacity + (s.maxOpacity - s.minOpacity) * (0.5 + 0.5 * Math.sin(t));
    }

    function drawStar(s) {
      const op = starOpacity(s);

      if (s.spikes) {
        // Outer halo
        const haloR = s.r * 6;
        const halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
        halo.addColorStop(0,   `rgba(210,230,255,${op * 0.85})`);
        halo.addColorStop(0.18,`rgba(190,215,255,${op * 0.35})`);
        halo.addColorStop(0.55,`rgba(170,205,255,${op * 0.08})`);
        halo.addColorStop(1,   'rgba(160,200,255,0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();

        // Cross spikes
        const spikeL = s.r * 10;
        ctx.save();
        ctx.lineWidth = Math.max(0.5, s.r * 0.32);
        ctx.lineCap = 'round';
        for (const [ax, ay, bx, by] of [
          [s.x - spikeL, s.y,        s.x + spikeL, s.y       ],
          [s.x,          s.y - spikeL, s.x,         s.y + spikeL],
        ]) {
          const g = ctx.createLinearGradient(ax, ay, bx, by);
          g.addColorStop(0,   'rgba(255,255,255,0)');
          g.addColorStop(0.5, `rgba(255,255,255,${op * 0.6})`);
          g.addColorStop(1,   'rgba(255,255,255,0)');
          ctx.strokeStyle = g;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
        ctx.restore();

        // Bright core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();

      } else if (s.glow) {
        // Soft radial glow
        const glowR = s.r * 3.8;
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
        g.addColorStop(0,   `rgba(230,240,255,${op})`);
        g.addColorStop(0.25,`rgba(210,230,255,${op * 0.28})`);
        g.addColorStop(1,   'rgba(180,210,255,0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();

      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }

      s.x += s.drift;
      const edge = s.spikes ? s.r * 11 : s.r * 5;
      if (s.x > canvas.width + edge) s.x = -edge;
    }

    function drawShootingStar() {
      const now = Date.now();
      if (!shootingStar && now >= nextShootAt) {
        shootingStar = {
          x: rand(0, canvas.width * 0.65),
          y: rand(0, canvas.height * 0.38),
          angle: rand(0.28, 0.62),
          speed: rand(10, 18),
          length: rand(110, 210),
          opacity: 1,
          progress: 0,
        };
        nextShootAt = now + rand(5000, 14000);
      }
      if (!shootingStar) return;

      const { x, y, angle, speed, length, opacity, progress } = shootingStar;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const hx = x + cos * speed * progress;
      const hy = y + sin * speed * progress;

      const g = ctx.createLinearGradient(hx - cos * length, hy - sin * length, hx, hy);
      g.addColorStop(0,   'rgba(255,255,255,0)');
      g.addColorStop(0.6, `rgba(200,225,255,${opacity * 0.45})`);
      g.addColorStop(1,   `rgba(255,255,255,${opacity})`);
      ctx.beginPath();
      ctx.moveTo(hx - cos * length, hy - sin * length);
      ctx.lineTo(hx, hy);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      shootingStar.progress += 1;
      shootingStar.opacity -= 0.015;
      if (shootingStar.opacity <= 0 || hx > canvas.width + 120 || hy > canvas.height + 120) {
        shootingStar = null;
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of allStars) drawStar(s);
      drawShootingStar();
      frame++;
      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);
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

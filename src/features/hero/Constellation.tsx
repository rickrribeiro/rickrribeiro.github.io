import { useEffect, useRef } from 'react';

interface P3 {
  x: number;
  y: number;
  z: number;
}

/**
 * A slowly rotating 3D constellation of technology names, drawn on a 2D canvas
 * (no WebGL needed, so there is nothing to fall back from). Pauses when off-screen
 * or in a background tab, follows the pointer subtly, and renders a single still
 * frame when the visitor prefers reduced motion.
 */
export function Constellation({ labels, accentLabels, ariaLabel }: { labels: string[]; accentLabels: string[]; ariaLabel: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Start after the page is interactive so the canvas never competes with hydration / LCP.
    let cleanup: (() => void) | undefined;
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 600));
    const handle = idle(() => {
      cleanup = init();
    });
    return () => {
      (window.cancelIdleCallback ?? window.clearTimeout)(handle as number);
      cleanup?.();
    };
  }, [labels, accentLabels]);

  function init(): (() => void) | undefined {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    const text = css.getPropertyValue('--color-text').trim() || '#edebe6';
    const accent = css.getPropertyValue('--color-accent').trim() || '#ff5b23';
    const signal = css.getPropertyValue('--color-signal').trim() || '#8ed1ff';
    const mono = css.getPropertyValue('--font-mono').trim() || 'monospace';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fibonacci sphere for labels, a looser shell of dust around it.
    const fib = (i: number, n: number, r: number): P3 => {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y);
      const th = Math.PI * (3 - Math.sqrt(5)) * i;
      return { x: Math.cos(th) * rad * r, y: y * r, z: Math.sin(th) * rad * r };
    };
    const nodes = labels.map((l, i) => ({ label: l, accent: accentLabels.includes(l), p: fib(i, labels.length, 1) }));
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const dust: P3[] = Array.from({ length: 160 }, () => {
      const u = rnd() * 2 - 1;
      const th = rnd() * Math.PI * 2;
      const r = 0.55 + rnd() * 0.75;
      const s = Math.sqrt(1 - u * u);
      return { x: Math.cos(th) * s * r, y: u * r, z: Math.sin(th) * s * r };
    });
    // Each label links to its two nearest neighbours.
    const edges: [number, number][] = [];
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: (a.p.x - b.p.x) ** 2 + (a.p.y - b.p.y) ** 2 + (a.p.z - b.p.z) ** 2 }))
        .filter((o) => o.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          if (!edges.some(([p, q]) => (p === j && q === i) || (p === i && q === j))) edges.push([i, j]);
        });
    });
    const packets = edges.filter((_, i) => i % 3 === 0).map((e, i) => ({ e, t: (i * 0.37) % 1, speed: 0.12 + (i % 4) * 0.04 }));

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();

    let pointerX = 0;
    let pointerY = 0;
    let tiltX = 0;
    let tiltY = 0;
    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const project = (p: P3, ry: number, rx: number) => {
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const x = p.x * cy - p.z * sy;
      let z = p.x * sy + p.z * cy;
      const y = p.y * cx - z * sx;
      z = p.y * sx + z * cx;
      const R = Math.min(w, h) * 0.42;
      const persp = 2.6 / (2.6 + z);
      return { x: w / 2 + x * R * persp, y: h / 2 + y * R * persp, z, s: persp };
    };

    let raf = 0;
    let last = performance.now();
    let angle = 0.6;
    let running = false;

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) angle += dt * 0.09;
      tiltX += (pointerY * 0.25 - tiltX) * 0.04;
      tiltY += (pointerX * 0.35 - tiltY) * 0.04;
      const ry = angle + tiltY;
      const rx = -0.35 + tiltX;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const d of dust) {
        const q = project(d, ry * 0.8, rx);
        const a = 0.08 + (1 - (q.z + 1.4) / 2.8) * 0.35;
        ctx.fillStyle = text;
        ctx.globalAlpha = Math.max(0.03, a);
        ctx.fillRect(q.x, q.y, 1.2 * q.s, 1.2 * q.s);
      }

      const pts = nodes.map((n) => project(n.p, ry, rx));
      ctx.lineWidth = 1;
      for (const [i, j] of edges) {
        const a = pts[i];
        const b = pts[j];
        const depth = 1 - ((a.z + b.z) / 2 + 1) / 2;
        ctx.globalAlpha = 0.06 + depth * 0.22;
        ctx.strokeStyle = text;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const pk of packets) {
        if (!reduce) pk.t = (pk.t + dt * pk.speed) % 1;
        const a = pts[pk.e[0]];
        const b = pts[pk.e[1]];
        const x = a.x + (b.x - a.x) * pk.t;
        const y = a.y + (b.y - a.y) * pk.t;
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = signal;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      const order = pts.map((p, i) => ({ p, i })).sort((a, b) => b.p.z - a.p.z);
      for (const { p, i } of order) {
        const n = nodes[i];
        const depth = 1 - (p.z + 1) / 2; // 1 = front
        const size = 9 + depth * 5;
        ctx.globalAlpha = 0.18 + depth * 0.78;
        ctx.fillStyle = n.accent ? accent : text;
        ctx.beginPath();
        ctx.arc(p.x, p.y, n.accent ? 2.6 : 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = `${n.accent ? 600 : 400} ${size}px ${mono}`;
        ctx.fillText(n.label, p.x + 7, p.y + 3.5);
      }
      ctx.globalAlpha = 1;

      if (running && !reduce) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop()), { threshold: 0 });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    const ro = new ResizeObserver(() => {
      resize();
      if (!running || reduce) draw(performance.now());
    });
    ro.observe(canvas);
    document.addEventListener('visibilitychange', onVis);
    if (!reduce) window.addEventListener('pointermove', onPointer, { passive: true });
    draw(performance.now());
    canvas.classList.add('is-ready');

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onPointer);
    };
  }

  return <canvas ref={ref} className="constellation" role="img" aria-label={ariaLabel} />;
}

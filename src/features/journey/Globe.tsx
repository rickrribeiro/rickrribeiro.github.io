import { useEffect, useRef } from 'react';
import type { Place, Trip } from '../../lib/schema';

/**
 * Wireframe globe (graticule only — no map data to download) with the journey's
 * places as glowing points and arcs from home. Drag or use arrow keys to rotate.
 */
export function Globe({ places, trips = [], label, names = {} }: { places: Place[]; trips?: Trip[]; label: string; names?: Record<string, string> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const css = getComputedStyle(document.documentElement);
    const text = css.getPropertyValue('--color-text').trim() || '#edebe6';
    const accent = css.getPropertyValue('--color-accent').trim() || '#ff5b23';
    const signal = css.getPropertyValue('--color-signal').trim() || '#8ed1ff';
    const mono = css.getPropertyValue('--font-mono').trim() || 'monospace';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const home = places.find((p) => p.kinds.includes('home')) ?? places[0];
    let lon0 = -(home?.lon ?? 0) * (Math.PI / 180) - 0.6;
    let lat0 = 0.32;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();

    const toVec = (lat: number, lon: number) => {
      const la = (lat * Math.PI) / 180;
      const lo = (lon * Math.PI) / 180;
      return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)] as const;
    };
    const proj = ([x, y, z]: readonly [number, number, number]) => {
      const cl = Math.cos(lon0);
      const sl = Math.sin(lon0);
      const x1 = x * cl + z * sl;
      const z1 = -x * sl + z * cl;
      const ca = Math.cos(lat0);
      const sa = Math.sin(lat0);
      const y2 = y * ca - z1 * sa;
      const z2 = y * sa + z1 * ca;
      const R = Math.min(w, h) * 0.44;
      return { x: w / 2 + x1 * R, y: h / 2 - y2 * R, z: z2 };
    };
    const slerp = (a: readonly number[], b: readonly number[], t: number, lift: number) => {
      const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
      const om = Math.acos(dot) || 1e-6;
      const s1 = Math.sin((1 - t) * om) / Math.sin(om);
      const s2 = Math.sin(t * om) / Math.sin(om);
      const k = 1 + Math.sin(Math.PI * t) * lift;
      return [(a[0] * s1 + b[0] * s2) * k, (a[1] * s1 + b[1] * s2) * k, (a[2] * s1 + b[2] * s2) * k] as const;
    };

    let pulse = 0;
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.44;
      const g = ctx.createRadialGradient(w / 2 - R * 0.3, h / 2 - R * 0.4, R * 0.1, w / 2, h / 2, R * 1.05);
      g.addColorStop(0, 'rgba(255,255,255,0.05)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = text;
      ctx.globalAlpha = 0.18;
      ctx.stroke();

      const line = (pts: { x: number; y: number; z: number }[]) => {
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          if (a.z < 0 && b.z < 0) continue;
          ctx.globalAlpha = 0.05 + Math.max(0, (a.z + b.z) / 2) * 0.16;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      };
      ctx.lineWidth = 1;
      ctx.strokeStyle = text;
      for (let lat = -75; lat <= 75; lat += 15) line(Array.from({ length: 73 }, (_, i) => proj(toVec(lat, -180 + i * 5))));
      for (let lon = -180; lon < 180; lon += 15) line(Array.from({ length: 37 }, (_, i) => proj(toVec(-90 + i * 5, lon))));

      // Every trip: a faint chronological route plus a small dot per city.
      if (trips.length) {
        ctx.strokeStyle = text;
        ctx.lineWidth = 0.8;
        for (let i = 1; i < trips.length; i++) {
          const a = toVec(trips[i - 1].lat, trips[i - 1].lon);
          const b = toVec(trips[i].lat, trips[i].lon);
          const pts = Array.from({ length: 13 }, (_, k) => proj(slerp(a, b, k / 12, 0.06)));
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          for (let k = 1; k < pts.length; k++) {
            const p0 = pts[k - 1];
            const p1 = pts[k];
            if (p0.z < 0 && p1.z < 0) continue;
            ctx.globalAlpha = 0.04 + Math.max(0, (p0.z + p1.z) / 2) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
          ctx.restore();
        }
        for (const tr of trips) {
          const q = proj(toVec(tr.lat, tr.lon));
          if (q.z < 0) continue;
          ctx.globalAlpha = 0.25 + q.z * 0.6;
          ctx.fillStyle = signal;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (home) {
        const a = toVec(home.lat, home.lon);
        for (const p of places) {
          if (p === home) continue;
          const b = toVec(p.lat, p.lon);
          const pts = Array.from({ length: 41 }, (_, i) => proj(slerp(a, b, i / 40, 0.18)));
          ctx.strokeStyle = signal;
          ctx.lineWidth = 1.3;
          line(pts.map((q) => ({ ...q, z: q.z + 0.6 })));
          const k = (pulse + places.indexOf(p) * 0.21) % 1;
          const q = proj(slerp(a, b, k, 0.18));
          if (q.z > -0.1) {
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = signal;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      for (const p of places) {
        const q = proj(toVec(p.lat, p.lon));
        if (q.z < -0.05) continue;
        const isHome = p.kinds.includes('home');
        ctx.globalAlpha = 0.25 + q.z * 0.75;
        ctx.fillStyle = isHome ? accent : text;
        ctx.beginPath();
        ctx.arc(q.x, q.y, isHome ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.25 * (1 - ((pulse * 2) % 1));
        ctx.strokeStyle = isHome ? accent : text;
        ctx.beginPath();
        ctx.arc(q.x, q.y, 4 + ((pulse * 2) % 1) * 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 0.4 + q.z * 0.6;
        ctx.fillStyle = text;
        ctx.font = `11px ${mono}`;
        ctx.fillText((names[p.id] ?? p.city ?? p.country).toUpperCase(), q.x + 8, q.y - 6);
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let running = false;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging) lon0 += dt * 0.12;
      pulse = (pulse + dt * 0.35) % 1;
      draw();
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      lon0 += (e.clientX - lastX) * 0.008;
      lat0 = Math.max(-1.2, Math.min(1.2, lat0 + (e.clientY - lastY) * 0.006));
      lastX = e.clientX;
      lastY = e.clientY;
      if (reduce) draw();
    };
    const up = () => (dragging = false);
    const key = (e: KeyboardEvent) => {
      const step = 0.15;
      if (e.key === 'ArrowLeft') lon0 -= step;
      else if (e.key === 'ArrowRight') lon0 += step;
      else if (e.key === 'ArrowUp') lat0 = Math.min(1.2, lat0 + step);
      else if (e.key === 'ArrowDown') lat0 = Math.max(-1.2, lat0 - step);
      else return;
      e.preventDefault();
      draw();
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('keydown', key);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    draw();
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('keydown', key);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, trips]);

  return <canvas ref={ref} className="globe" role="img" aria-label={label} tabIndex={0} />;
}

import { useId, useMemo, useState } from 'react';
import type { Project } from '../../lib/schema';

type DiagramData = NonNullable<Project['diagram']>;

const NODE_H = 6.4;
const nodeWidth = (label: string) => Math.min(42, Math.max(12, label.length * 1.22 + 6));

interface Box {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Point where the segment from the box centre towards (tx,ty) leaves the box. */
function exitPoint(b: Box, tx: number, ty: number, pad = 0.8) {
  const dx = tx - b.x;
  const dy = ty - b.y;
  if (dx === 0 && dy === 0) return { x: b.x, y: b.y };
  const sx = (b.w / 2 + pad) / Math.abs(dx || 1e-9);
  const sy = (b.h / 2 + pad) / Math.abs(dy || 1e-9);
  const s = Math.min(sx, sy);
  return { x: b.x + dx * s, y: b.y + dy * s };
}

/** Deterministic pseudo-random so server and client render identical markup. */
function seeded(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Blueprint-style architecture diagram rendered from projects.json.
 * `interactive` enables hover/focus highlighting of a node's connections.
 */
export function Diagram({
  data,
  title,
  interactive = false,
  animated = true,
  className = '',
}: {
  data: DiagramData;
  title: string;
  interactive?: boolean;
  animated?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [active, setActive] = useState<string | null>(null);

  const { boxes, edges } = useMemo(() => {
    const boxes = new Map<string, Box>(
      data.nodes.map((n) => {
        const w = nodeWidth(n.label);
        // Keep every box inside the 0–100 × 0–60 canvas whatever the configured centre is.
        const x = Math.min(100 - w / 2, Math.max(w / 2, n.x));
        const y = Math.min(60 - NODE_H / 2, Math.max(NODE_H / 2, n.y));
        return [n.id, { id: n.id, x, y, w, h: NODE_H }];
      }),
    );
    const rnd = seeded(title);
    const edges = data.edges
      .filter((e) => boxes.has(e.from) && boxes.has(e.to))
      .map((e, i) => {
        const a = boxes.get(e.from)!;
        const b = boxes.get(e.to)!;
        const p1 = exitPoint(a, b.x, b.y);
        const p2 = exitPoint(b, a.x, a.y, 1.4);
        return {
          ...e,
          key: `${e.from}-${e.to}-${i}`,
          d: `M${p1.x.toFixed(2)} ${p1.y.toFixed(2)} L${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
          mid: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
          dur: (2.4 + rnd() * 2.2).toFixed(2),
          begin: (rnd() * 2).toFixed(2),
        };
      });
    return { boxes, edges };
  }, [data, title]);

  const connected = (edge: { from: string; to: string }) => active && (edge.from === active || edge.to === active);

  return (
    <svg
      className={`diagram ${interactive ? 'diagram--interactive' : ''} ${active ? 'has-active' : ''} ${className}`}
      viewBox="-2 -4 104 68"
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern id={`g${uid}`} width="2.5" height="2.5" patternUnits="userSpaceOnUse">
          <path d="M2.5 0H0V2.5" fill="none" className="diagram__grid-minor" />
        </pattern>
        <pattern id={`G${uid}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill={`url(#g${uid})`} />
          <path d="M10 0H0V10" fill="none" className="diagram__grid-major" />
        </pattern>
        <marker id={`m${uid}`} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
          <path d="M0 0L6 3L0 6z" className="diagram__arrow" />
        </marker>
      </defs>
      <rect x="-2" y="-4" width="104" height="68" fill={`url(#G${uid})`} />

      <g className="diagram__edges">
        {edges.map((e) => (
          <g key={e.key} className={`edge ${e.dashed ? 'edge--dashed' : ''} ${connected(e) ? 'is-active' : ''}`}>
            <path id={`p${uid}${e.key}`} d={e.d} className="edge__line" markerEnd={`url(#m${uid})`} />
            {!e.dashed && <path d={e.d} className="edge__flow" />}
            {animated && !e.dashed && (
              <circle r="0.55" className="edge__packet">
                <animateMotion dur={`${e.dur}s`} begin={`${e.begin}s`} repeatCount="indefinite" path={e.d} />
              </circle>
            )}
            {e.label && (
              <text x={e.mid.x} y={e.mid.y - 1} className="edge__label" textAnchor="middle">
                {e.label}
              </text>
            )}
          </g>
        ))}
      </g>

      <g className="diagram__nodes">
        {data.nodes.map((n) => {
          const b = boxes.get(n.id)!;
          const isActive = active === n.id;
          return (
            <g
              key={n.id}
              className={`node node--${n.kind} ${isActive ? 'is-active' : ''}`}
              transform={`translate(${(b.x - b.w / 2).toFixed(2)} ${(b.y - b.h / 2).toFixed(2)})`}
              {...(interactive
                ? {
                    tabIndex: 0,
                    role: 'button',
                    'aria-label': n.label,
                    onMouseEnter: () => setActive(n.id),
                    onMouseLeave: () => setActive(null),
                    onFocus: () => setActive(n.id),
                    onBlur: () => setActive(null),
                  }
                : {})}
            >
              <rect width={b.w} height={b.h} rx="1.1" className="node__box" />
              <rect x="1.6" y={b.h / 2 - 0.8} width="1.6" height="1.6" rx="0.3" className="node__glyph" />
              <text x="4.4" y={b.h / 2 + 0.75} className="node__label">
                {n.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

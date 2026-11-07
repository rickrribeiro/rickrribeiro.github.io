import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from 'react';

let observer: IntersectionObserver | null = null;
function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer!.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  return observer;
}

/** Fades content in once it scrolls into view. Server-rendered content is always visible without JS. */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  children,
  style,
  ...rest
}: { as?: ElementType; delay?: number; className?: string; children: ReactNode; style?: CSSProperties } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    const o = getObserver();
    if (!el) return;
    if (!o) {
      el.classList.add('is-visible');
      return;
    }
    o.observe(el);
    return () => o.unobserve(el);
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={{ ...style, ['--reveal-delay' as string]: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

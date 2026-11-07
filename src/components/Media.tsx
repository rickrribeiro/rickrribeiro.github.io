import type { CSSProperties } from 'react';

/** Image with intrinsic size (no layout shift), lazy by default. */
export function Img({
  src,
  alt,
  width,
  height,
  eager = false,
  className,
  sizes,
  style,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  eager?: boolean;
  className?: string;
  sizes?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      className={className}
      sizes={sizes}
      style={style}
    />
  );
}

/** Wraps screenshots in a minimal browser or phone frame so real UI reads as UI. */
export function DeviceFrame({ kind, children, label }: { kind: 'browser' | 'phone' | 'none' | undefined; children: React.ReactNode; label?: string }) {
  if (kind === 'browser')
    return (
      <div className="frame frame--browser">
        <div className="frame__bar" aria-hidden="true">
          <span />
          <span />
          <span />
          {label && <em>{label}</em>}
        </div>
        {children}
      </div>
    );
  if (kind === 'phone') return <div className="frame frame--phone">{children}</div>;
  return <>{children}</>;
}

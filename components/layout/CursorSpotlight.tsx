'use client';

import { useEffect, useState } from 'react';

/**
 * Cursor-following premium gold spotlight overlay.
 * Disabled on touch / coarse pointers for performance.
 */
const CursorSpotlight = () => {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    setEnabled(mq.matches);
    const handler = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let next = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      next = { x: e.clientX, y: e.clientY };
      if (!raf) {
        raf = requestAnimationFrame(() => {
          setPos(next);
          raf = 0;
        });
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[55] mix-blend-screen"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, hsl(42 50% 58% / 0.10), hsl(217 65% 60% / 0.04) 30%, transparent 60%)`,
        transition: 'background 80ms linear',
      }}
    />
  );
};

export default CursorSpotlight;

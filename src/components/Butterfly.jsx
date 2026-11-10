import { useEffect, useRef } from 'react';
import './cursor.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/*
 * Replaces the mouse pointer with a glowing, flapping butterfly and lights up
 * whatever it is over. It only runs for a real mouse (hover + fine pointer);
 * touch screens keep their normal behaviour.
 *
 * Position is written straight to the elements every frame instead of through
 * React state, so moving the mouse never re-renders anything.
 */
const Butterfly = () => {
  const glowRef = useRef(null);
  const butterflyRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const root = document.documentElement;
    const glow = glowRef.current;
    const butterfly = butterflyRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const target = { x: 0, y: 0 };
    const position = { x: 0, y: 0 };
    let lean = 0;
    let moving = false;
    let revealed = false;
    let frame = 0;
    let last = 0;

    const tick = (now) => {
      const dt = Math.min(now - last || 16, 64);
      last = now;

      // Ease toward the pointer: quick enough to click accurately, loose enough to feel like flight
      const follow = reduceMotion ? 1 : 1 - Math.exp(-dt / 55);
      const dx = (target.x - position.x) * follow;
      const dy = (target.y - position.y) * follow;
      position.x += dx;
      position.y += dy;

      // Lean into the direction of travel; settle upright when still
      const velocityX = (dx / dt) * 16;
      lean += (clamp(velocityX * 2.4, -32, 32) - lean) * 0.18;

      const speed = Math.hypot(dx, dy) / dt;
      const isMoving = speed > 0.04;
      if (isMoving !== moving) {
        moving = isMoving;
        butterfly.dataset.moving = String(moving);
      }

      butterfly.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) rotate(${lean}deg)`;
      glow.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;

      const settled = Math.abs(target.x - position.x) < 0.2 && Math.abs(target.y - position.y) < 0.2 && Math.abs(lean) < 0.3;
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (event) => {
      if (event.pointerType === 'touch') return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (!revealed) {
        // First move: appear right at the pointer instead of flying in from the corner
        revealed = true;
        position.x = target.x;
        position.y = target.y;
        // The native cursor is only hidden once the butterfly is there to replace it
        root.classList.add('butterfly-on');
      }
      root.classList.remove('butterfly-away');
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    const onLeave = () => root.classList.add('butterfly-away');

    window.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      root.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(frame);
      root.classList.remove('butterfly-on', 'butterfly-away');
    };
  }, []);

  return (
    <>
      <div className="cursor-glow" ref={glowRef} aria-hidden="true" />
      <div className="butterfly" ref={butterflyRef} data-moving="false" aria-hidden="true">
        <div className="butterfly-float">
          <svg viewBox="0 0 64 64" focusable="false">
            <defs>
              <linearGradient id="wing-left" x1="1" y1="0.3" x2="0" y2="0.8">
                <stop offset="0" stopColor="#f8f4e9" />
                <stop offset="0.2" stopColor="#f6dbc0" />
                <stop offset="0.55" stopColor="#935073" />
                <stop offset="1" stopColor="#502d55" />
              </linearGradient>
              <linearGradient id="wing-right" x1="0" y1="0.3" x2="1" y2="0.8">
                <stop offset="0" stopColor="#f8f4e9" />
                <stop offset="0.2" stopColor="#f6dbc0" />
                <stop offset="0.55" stopColor="#935073" />
                <stop offset="1" stopColor="#502d55" />
              </linearGradient>
              <linearGradient id="butterfly-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f8f4e9" />
                <stop offset="1" stopColor="#935073" />
              </linearGradient>
            </defs>

            <g className="wing wing-left">
              <path d="M31 30 C22 8 4 6 4 18 C4 26 14 34 31 33 Z" fill="url(#wing-left)" />
              <path d="M31 33 C16 36 10 50 18 56 C25 60 30 48 31 38 Z" fill="url(#wing-left)" />
              <circle cx="14" cy="17" r="3" className="wing-spot" />
              <circle cx="22" cy="25" r="1.6" className="wing-spot" />
              <circle cx="20" cy="48" r="2.2" className="wing-spot" />
            </g>
            <g className="wing wing-right">
              <path d="M33 30 C42 8 60 6 60 18 C60 26 50 34 33 33 Z" fill="url(#wing-right)" />
              <path d="M33 33 C48 36 54 50 46 56 C39 60 34 48 33 38 Z" fill="url(#wing-right)" />
              <circle cx="50" cy="17" r="3" className="wing-spot" />
              <circle cx="42" cy="25" r="1.6" className="wing-spot" />
              <circle cx="44" cy="48" r="2.2" className="wing-spot" />
            </g>

            <ellipse cx="32" cy="35" rx="2.3" ry="12" fill="url(#butterfly-body)" />
            <circle cx="32" cy="21" r="2.7" fill="#f8f4e9" />
            <path d="M31 19.5 C29 13 25 10 21.5 9.5 M33 19.5 C35 13 39 10 42.5 9.5" className="butterfly-antennae" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default Butterfly;

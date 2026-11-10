import { useEffect, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Types `lines` one character at a time, one line after another, starting on
 * mount (so it replays on every refresh). With reduced motion on, everything
 * shows immediately.
 *
 * Returns, per line, how many characters are visible so far, plus which line
 * currently holds the caret.
 */
export function useTypewriter(lines, { charDelay = 40, linePause = 520, startDelay = 700 } = {}) {
  const total = lines.reduce((sum, line) => sum + line.length, 0);
  const [count, setCount] = useState(() => (prefersReducedMotion() ? total : 0));

  useEffect(() => {
    if (count >= total) return undefined;

    // A pause at the end of each line makes it read like separate sentences
    let lineEnd = 0;
    let atLineBreak = false;
    for (const line of lines) {
      lineEnd += line.length;
      if (count === lineEnd) atLineBreak = true;
    }

    let delay = charDelay;
    if (count === 0) delay = startDelay;
    else if (atLineBreak) delay = linePause;

    const id = setTimeout(() => setCount((current) => current + 1), delay);
    return () => clearTimeout(id);
  }, [count, total, lines, charDelay, linePause, startDelay]);

  const rows = lines.map((text, index) => {
    const lineStart = lines.slice(0, index).reduce((sum, line) => sum + line.length, 0);
    return { text, typed: Math.min(Math.max(count - lineStart, 0), text.length) };
  });

  const done = count >= total;
  const firstIncomplete = rows.findIndex((row) => row.typed < row.text.length);
  const activeIndex = done ? rows.length - 1 : firstIncomplete;

  return { rows, activeIndex, done };
}

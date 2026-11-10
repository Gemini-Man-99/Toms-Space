import { useTypewriter } from '../hooks/useTypewriter.js';

const LINES = [
  { text: 'Hi, my name is tom, welcome to my space' },
  { text: 'and just like Epictetus said...' },
  { text: '"There is no peace for the man who has seen what he could become."', isQuote: true },
  { text: 'soo...whatever :)' },
];
const TEXTS = LINES.map((line) => line.text);

const Hero = () => {
  const { rows, activeIndex, done } = useTypewriter(TEXTS);

  return (
    <section id="hero" className="hero-section">
      <p className="hero-text">
        {/* Screen readers get the whole text at once instead of letter by letter */}
        <span className="sr-only">{TEXTS.join(' ')}</span>
        {rows.map((row, index) => (
          <span
            key={row.text}
            className={`hero-line${LINES[index].isQuote ? ' is-quote' : ''}`}
            aria-hidden="true"
          >
            {row.text.slice(0, row.typed)}
            {index === activeIndex && <span className={`hero-caret${done ? ' is-done' : ''}`} />}
            {/* Untyped text still takes up space, so lines never re-wrap or jump while typing */}
            <span className="hero-untyped">{row.text.slice(row.typed)}</span>
          </span>
        ))}
      </p>
    </section>
  );
};

export default Hero;

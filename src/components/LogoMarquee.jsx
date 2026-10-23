import { useState } from 'react';
import './LogoMarquee.css';

/**
 * Equal-height looping logo strip. Hover pauses motion and shows institution name.
 */
export default function LogoMarquee({ logos = [] }) {
  const [paused, setPaused] = useState(false);
  const [hoverName, setHoverName] = useState('');

  if (!logos.length) return null;

  // Duplicate sequence for seamless CSS loop
  const sequence = [...logos, ...logos];

  return (
    <div className="logo-marquee">
      <div
        className={['logo-marquee__track', paused ? 'is-paused' : '']
          .filter(Boolean)
          .join(' ')}
        onMouseLeave={() => {
          setPaused(false);
          setHoverName('');
        }}
      >
        {sequence.map((logo, i) => (
          <div
            key={`${logo.id}-${i}`}
            className="logo-marquee__item"
            onMouseEnter={() => {
              setPaused(true);
              setHoverName(logo.name);
            }}
          >
            <img src={logo.src} alt={logo.name} />
          </div>
        ))}
      </div>
      <p
        className={['logo-marquee__name', hoverName ? 'is-visible' : '']
          .filter(Boolean)
          .join(' ')}
        aria-live="polite"
      >
        {hoverName || '\u00a0'}
      </p>
    </div>
  );
}

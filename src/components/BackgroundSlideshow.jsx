import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../i18n';
import './BackgroundSlideshow.css';

/**
 * Full-bleed crossfading image cycle for chapters that replace the map.
 * Auto-advances; arrows let the user step manually (resets the timer).
 */
export default function BackgroundSlideshow({
  images = [],
  intervalMs = 5000,
  active = false,
}) {
  const { t } = useLocale();
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState({});
  const [tick, setTick] = useState(0);

  const imageKey = images.join('|');
  const canNavigate = images.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [imageKey]);

  useEffect(() => {
    if (!active || images.length < 2) return undefined;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [active, imageKey, intervalMs, images.length, tick]);

  const goPrev = useCallback(
    (e) => {
      e.stopPropagation();
      if (!canNavigate) return;
      setIndex((prev) => (prev - 1 + images.length) % images.length);
      setTick((n) => n + 1);
    },
    [canNavigate, images.length],
  );

  const goNext = useCallback(
    (e) => {
      e.stopPropagation();
      if (!canNavigate) return;
      setIndex((prev) => (prev + 1) % images.length);
      setTick((n) => n + 1);
    },
    [canNavigate, images.length],
  );

  if (!images.length) return null;

  return (
    <div
      className={['bg-slideshow', active ? 'is-active' : ''].filter(Boolean).join(' ')}
      aria-hidden={!active}
    >
      {images.map((src, i) => (
        <img
          key={src}
          className={[
            'bg-slideshow__image',
            i === index ? 'is-current' : '',
            ready[src] ? 'is-ready' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          src={src}
          alt=""
          onLoad={() => setReady((prev) => ({ ...prev, [src]: true }))}
        />
      ))}
      <div className="bg-slideshow__shade" />

      {active && canNavigate ? (
        <div className="bg-slideshow__nav">
          <button
            type="button"
            className="bg-slideshow__arrow bg-slideshow__arrow--prev"
            aria-label={t.ui.prevImage}
            onClick={goPrev}
          >
            ‹
          </button>
          <p className="bg-slideshow__counter" aria-hidden="true">
            {index + 1} / {images.length}
          </p>
          <button
            type="button"
            className="bg-slideshow__arrow bg-slideshow__arrow--next"
            aria-label={t.ui.nextImage}
            onClick={goNext}
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}

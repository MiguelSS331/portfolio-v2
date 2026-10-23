import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n';
import './WebProjectEmbed.css';

/**
 * Fullscreen embedded web project.
 * Until the user opts in, a shield forwards page scroll and blocks the iframe
 * from receiving wheel/touch — the embed only moves after “click to interact”.
 */
export default function WebProjectEmbed({
  embed,
  active = false,
  onInteractingChange,
}) {
  const { t } = useLocale();
  const [interacting, setInteracting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const shieldRef = useRef(null);
  const touchY = useRef(null);

  useEffect(() => {
    if (!active) {
      setInteracting(false);
      setLoaded(false);
    }
  }, [active, embed?.src]);

  useEffect(() => {
    onInteractingChange?.(interacting);
  }, [interacting, onInteractingChange]);

  useEffect(() => {
    if (!interacting) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [interacting]);

  // Capture wheel/touch on the shield and scroll the page instead of the iframe
  useEffect(() => {
    if (!active || interacting) return undefined;
    const el = shieldRef.current;
    if (!el) return undefined;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'auto' });
    };

    const onTouchStart = (e) => {
      touchY.current = e.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (e) => {
      if (touchY.current == null) return;
      const y = e.touches[0]?.clientY;
      if (y == null) return;
      const dy = touchY.current - y;
      touchY.current = y;
      e.preventDefault();
      window.scrollBy({ top: dy, behavior: 'auto' });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [active, interacting]);

  if (!embed?.src) return null;

  const external = embed.externalUrl || embed.src;

  return (
    <div
      className={[
        'web-embed',
        active ? 'is-active' : '',
        interacting ? 'is-interacting' : '',
        loaded ? 'is-loaded' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!active}
    >
      {embed.poster ? (
        <img
          className="web-embed__poster"
          src={embed.poster}
          alt=""
          aria-hidden="true"
        />
      ) : null}

      {active ? (
        <iframe
          className="web-embed__frame"
          src={embed.src}
          title={embed.title || 'Web project'}
          loading="eager"
          tabIndex={interacting ? 0 : -1}
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen; geolocation; clipboard-read; clipboard-write"
          onLoad={() => setLoaded(true)}
        />
      ) : null}

      {active && !interacting ? (
        <div className="web-embed__gate" ref={shieldRef}>
          <div className="web-embed__radial" aria-hidden="true" />
          <button
            type="button"
            className="web-embed__enter"
            onClick={() => setInteracting(true)}
          >
            {t.ui.clickToInteract}
          </button>
        </div>
      ) : null}

      {active && interacting ? (
        <div className="web-embed__controls">
          <button
            type="button"
            className="web-embed__ctrl"
            onClick={() => setInteracting(false)}
          >
            {t.ui.stopInteracting}
          </button>
          <a
            className="web-embed__ctrl web-embed__ctrl--link"
            href={external}
            target="_blank"
            rel="noreferrer"
          >
            {t.ui.openFullWebsite}
          </a>
        </div>
      ) : null}
    </div>
  );
}

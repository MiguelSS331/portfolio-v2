import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n';
import './BackgroundVideo.css';

/**
 * Full-bleed muted looping video(s) for story chapters.
 * Multiple sources: user can step between them in the same scroll section.
 * Clips are expected to be pre-encoded at 2x; playback stays at 1x.
 */
export default function BackgroundVideo({
  sources = [],
  active = false,
}) {
  const { t } = useLocale();
  const videoRef = useRef(null);
  const [index, setIndex] = useState(0);
  const list = Array.isArray(sources) ? sources.filter(Boolean) : [];
  const src = list[index] || null;
  const canNavigate = list.length > 1;
  const listKey = list.join('|');

  useEffect(() => {
    setIndex(0);
  }, [listKey]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (!active || !src) {
      el.pause();
      return;
    }

    el.muted = true;
    el.playsInline = true;
    el.playbackRate = 1;
    const play = () => {
      const p = el.play();
      if (p?.catch) p.catch(() => {});
    };
    play();
  }, [active, src]);

  const goPrev = useCallback(
    (e) => {
      e.stopPropagation();
      if (!canNavigate) return;
      setIndex((prev) => (prev - 1 + list.length) % list.length);
    },
    [canNavigate, list.length],
  );

  const goNext = useCallback(
    (e) => {
      e.stopPropagation();
      if (!canNavigate) return;
      setIndex((prev) => (prev + 1) % list.length);
    },
    [canNavigate, list.length],
  );

  if (!list.length) return null;

  return (
    <div
      className={['bg-video', active ? 'is-active' : ''].filter(Boolean).join(' ')}
      aria-hidden={!active}
    >
      <video
        key={src}
        ref={videoRef}
        className="bg-video__media"
        src={src}
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="bg-video__shade" />

      {active && canNavigate ? (
        <div className="bg-video__nav">
          <button
            type="button"
            className="bg-video__arrow bg-video__arrow--prev"
            aria-label={t.ui.prevImage}
            onClick={goPrev}
          >
            ‹
          </button>
          <p className="bg-video__counter" aria-hidden="true">
            {index + 1} / {list.length}
          </p>
          <button
            type="button"
            className="bg-video__arrow bg-video__arrow--next"
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

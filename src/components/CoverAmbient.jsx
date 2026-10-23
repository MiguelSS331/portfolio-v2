import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n';
import './CoverAmbient.css';

const SRC = '/audio/ambientCDMX.mp3';
const FADE_MS = 700;
const TARGET_VOL = 0.45;

/**
 * Cover-only ambient loop. Fades out when leaving the first chapter;
 * mute button disables until the user turns sound back on.
 */
export default function CoverAmbient({ active = false }) {
  const { t } = useLocale();
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audioRef.current = audio;
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const clearFade = () => {
      if (fadeRef.current) {
        cancelAnimationFrame(fadeRef.current);
        fadeRef.current = null;
      }
    };

    const fadeTo = (target, thenPause = false) => {
      clearFade();
      const start = audio.volume;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / FADE_MS);
        const eased = p * p * (3 - 2 * p);
        audio.volume = start + (target - start) * eased;
        if (p < 1) {
          fadeRef.current = requestAnimationFrame(step);
          return;
        }
        fadeRef.current = null;
        audio.volume = target;
        if (thenPause) {
          audio.pause();
          setPlaying(false);
        }
      };
      fadeRef.current = requestAnimationFrame(step);
    };

    const tryPlay = async () => {
      try {
        if (audio.paused) {
          await audio.play();
          setPlaying(true);
        }
        fadeTo(TARGET_VOL);
      } catch {
        setPlaying(false);
      }
    };

    if (active && !muted) {
      tryPlay();
    } else {
      fadeTo(0, true);
    }

    return clearFade;
  }, [active, muted]);

  // Autoplay unlock: first pointer/key after load while on cover
  useEffect(() => {
    if (!active || muted || playing) return undefined;
    const unlock = () => {
      const audio = audioRef.current;
      if (!audio || muted) return;
      audio
        .play()
        .then(() => {
          setPlaying(true);
          audio.volume = TARGET_VOL;
        })
        .catch(() => {});
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [active, muted, playing]);

  return (
    <button
      type="button"
      className={[
        'cover-ambient',
        active ? 'is-visible' : '',
        muted ? 'is-muted' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => setMuted((v) => !v)}
      aria-pressed={muted}
      aria-label={muted ? t.ui.soundOn : t.ui.soundOff}
      title={muted ? t.ui.soundOn : t.ui.soundOff}
      tabIndex={active ? 0 : -1}
    >
      {muted ? (
        <svg
          className="cover-ambient__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M4.3 3.7 3 5l4.1 4.1H3v5.8h3.6L12 21v-7.2L18.3 20l1.3-1.3L4.3 3.7zM16.5 12c0-1.8-.8-3.3-2-4.4l-1.4 1.4A3.7 3.7 0 0 1 14.3 12H16.5zM12 3l-2.1 2.1L12 7.2V3zm7.2 1.8-1.4 1.4A7.5 7.5 0 0 1 19.7 12h2.2a9.6 9.6 0 0 0-2.7-7.2z"
          />
        </svg>
      ) : (
        <svg
          className="cover-ambient__icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M3 9.1v5.8h3.6L12 21V3L6.6 9.1H3zm13.5 2.9c0-1.8-.8-3.3-2-4.4v8.7c1.2-1 2-2.5 2-4.3zm2.2-7.2A9.6 9.6 0 0 1 21.9 12a9.6 9.6 0 0 1-3.2 7.2l-1.4-1.4A7.5 7.5 0 0 0 19.7 12a7.5 7.5 0 0 0-2.5-5.6l1.5-1.6z"
          />
        </svg>
      )}
    </button>
  );
}

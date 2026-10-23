import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ACCENT } from '../data/chapters';
import './PointCard.css';

const CARD_W = 260;
const CARD_OFFSET = { x: 56, y: -150 };
const LINE_GROW_MS = 400;

/**
 * White hover card with animated leader line from the map point.
 */
export default function PointCard({ point, anchor, stageSize }) {
  const cardRef = useRef(null);
  const [cardSize, setCardSize] = useState({ w: CARD_W, h: 220 });
  const [lineReady, setLineReady] = useState(false);

  const open = Boolean(point?.card && anchor);

  useLayoutEffect(() => {
    if (!open || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCardSize({ w: rect.width, h: rect.height });
  }, [open, point?.id, stageSize?.w, stageSize?.h]);

  useEffect(() => {
    if (!open) {
      setLineReady(false);
      return undefined;
    }
    const id = requestAnimationFrame(() => setLineReady(true));
    return () => cancelAnimationFrame(id);
  }, [open, point?.id]);

  if (!open) return null;

  const { title, subtitle, image } = point.card;
  const stageW = stageSize?.w ?? window.innerWidth;
  const stageH = stageSize?.h ?? window.innerHeight;

  const preferRight = anchor.x < stageW * 0.55;
  const preferUp = anchor.y > stageH * 0.42;

  let cardLeft = preferRight
    ? anchor.x + CARD_OFFSET.x
    : anchor.x - CARD_OFFSET.x - cardSize.w;
  let cardTop = preferUp
    ? anchor.y + CARD_OFFSET.y
    : anchor.y - CARD_OFFSET.y;

  cardLeft = Math.max(12, Math.min(cardLeft, stageW - cardSize.w - 12));
  cardTop = Math.max(12, Math.min(cardTop, stageH - cardSize.h - 12));

  // Attach leader to the card edge closest to the point
  const attachX = preferRight ? cardLeft : cardLeft + cardSize.w;
  const attachY = cardTop + Math.min(56, cardSize.h * 0.28);

  const dx = attachX - anchor.x;
  const dy = attachY - anchor.y;
  const length = Math.hypot(dx, dy);

  return (
    <div className="point-card-layer" aria-live="polite">
      <svg className="point-card-leader" width={stageW} height={stageH}>
        <line
          className={['point-card-leader__line', lineReady ? 'is-grown' : '']
            .filter(Boolean)
            .join(' ')}
          x1={anchor.x}
          y1={anchor.y}
          x2={attachX}
          y2={attachY}
          stroke={ACCENT}
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            strokeDasharray: length,
            strokeDashoffset: lineReady ? 0 : length,
            transitionDuration: `${LINE_GROW_MS}ms`,
          }}
        />
        <circle
          className={['point-card-leader__dot', lineReady ? 'is-grown' : '']
            .filter(Boolean)
            .join(' ')}
          cx={attachX}
          cy={attachY}
          r="3.5"
          fill={ACCENT}
        />
      </svg>

      <article
        ref={cardRef}
        className="point-card"
        style={{
          width: CARD_W,
          left: cardLeft,
          top: cardTop,
        }}
      >
        <div className="point-card__media">
          <img src={image} alt="" />
        </div>
        <div className="point-card__body">
          <h3 className="point-card__title">{title}</h3>
          <p className="point-card__subtitle">{subtitle}</p>
        </div>
      </article>
    </div>
  );
}

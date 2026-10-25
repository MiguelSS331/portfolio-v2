import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ACCENT } from '../data/chapters';
import './PointCard.css';

const DESKTOP = { w: 260, offset: { x: 56, y: -150 }, edge: 12, bottomSafe: 12 };
const MOBILE = { w: 148, offset: { x: 22, y: -72 }, edge: 36, bottomSafe: 120 };
const LINE_GROW_MS = 400;

/**
 * White hover card with animated leader line from the map point.
 * `compact` = mobile: smaller card + more edge inset so taps around it still work.
 */
export default function PointCard({ point, anchor, stageSize, compact = false }) {
  const cardRef = useRef(null);
  const layout = compact ? MOBILE : DESKTOP;
  const [cardSize, setCardSize] = useState({ w: layout.w, h: compact ? 150 : 220 });
  const [lineReady, setLineReady] = useState(false);

  const open = Boolean(point?.card && anchor);

  useLayoutEffect(() => {
    if (!open || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCardSize({ w: rect.width, h: rect.height });
  }, [open, point?.id, stageSize?.w, stageSize?.h, compact]);

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
    ? anchor.x + layout.offset.x
    : anchor.x - layout.offset.x - cardSize.w;
  let cardTop = preferUp
    ? anchor.y + layout.offset.y
    : anchor.y - layout.offset.y;

  const topSafe = compact ? 56 : layout.edge;
  cardLeft = Math.max(
    layout.edge,
    Math.min(cardLeft, stageW - cardSize.w - layout.edge),
  );
  cardTop = Math.max(
    topSafe,
    Math.min(cardTop, stageH - cardSize.h - layout.bottomSafe),
  );

  // Attach leader to the card edge closest to the point
  const attachX = preferRight ? cardLeft : cardLeft + cardSize.w;
  const attachY = cardTop + Math.min(compact ? 36 : 56, cardSize.h * 0.28);

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
          strokeWidth={compact ? 1.2 : 1.5}
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
          r={compact ? 2.5 : 3.5}
          fill={ACCENT}
        />
      </svg>

      <article
        ref={cardRef}
        className={['point-card', compact ? 'point-card--compact' : '']
          .filter(Boolean)
          .join(' ')}
        style={{
          width: layout.w,
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

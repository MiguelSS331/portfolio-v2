import { useEffect, useState } from 'react';
import { ACCENT } from '../data/chapters';
import { CATEGORY_COLORS } from '../data/overviewProjects';
import './OverviewProjectFan.css';

const CARD_W = 168;
const CARD_H = 72;
const LINE_MS = 420;

/** Clock hours 2, 4, 6, 8 as radians from screen +x, y-down via cos/sin with -PI/2 = 12 o'clock */
const STAR_HOURS = [2, 4, 6, 8];
const STAR_ANGLES = STAR_HOURS.map(
  (h) => -Math.PI / 2 + (h / 12) * Math.PI * 2,
);

function angleDist(a, b) {
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

/**
 * Red leader lines + compact cards fanned around a map point.
 * With many projects, arms at clock 2 / 4 / 6 / 8 stretch farther (star).
 * Cap sits above the lines so leaders read as behind the point.
 */
export default function OverviewProjectFan({
  anchor,
  projects = [],
  cluster = null,
  stageSize,
  onClose,
  onProjectSelect,
  selectedProjectId = null,
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (!anchor || !projects.length) return undefined;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [anchor, projects]);

  if (!anchor || !projects.length) return null;

  const stageW = stageSize?.w ?? window.innerWidth;
  const stageH = stageSize?.h ?? window.innerHeight;
  const n = projects.length;
  const baseRadius = Math.min(170, Math.max(100, 80 + n * 8));
  const starRadius = baseRadius * (n >= 5 ? 1.55 : 1.28);

  // Mark which indices sit closest to each star arm (no duplicates)
  const starIndexSet = new Set();
  if (n >= 4) {
    const used = new Set();
    for (const starAngle of STAR_ANGLES) {
      let best = -1;
      let bestDist = Infinity;
      for (let i = 0; i < n; i += 1) {
        if (used.has(i)) continue;
        const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const d = angleDist(angle, starAngle);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      if (best >= 0) {
        used.add(best);
        starIndexSet.add(best);
      }
    }
  }

  const items = projects.map((project, i) => {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const radius = starIndexSet.has(i) ? starRadius : baseRadius;
    let left = anchor.x + Math.cos(angle) * radius - CARD_W / 2;
    let top = anchor.y + Math.sin(angle) * radius - CARD_H / 2;
    left = Math.max(10, Math.min(left, stageW - CARD_W - 10));
    top = Math.max(56, Math.min(top, stageH - CARD_H - 10));

    const attachX = left + CARD_W / 2;
    const attachY = top + CARD_H / 2;
    const dx = attachX - anchor.x;
    const dy = attachY - anchor.y;
    const length = Math.hypot(dx, dy) || 1;

    return { project, left, top, attachX, attachY, length, isStar: starIndexSet.has(i) };
  });

  const total = cluster?.total ?? n;
  const counts = cluster?.counts ?? { print: 0, research: 0, web: 0 };
  const ringSegments = ['print', 'research', 'web']
    .map((key) => ({
      key,
      count: counts[key] || 0,
      color: CATEGORY_COLORS[key],
    }))
    .filter((s) => s.count > 0);

  return (
    <div className="overview-fan" aria-live="polite">
      <button
        type="button"
        className="overview-fan__scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <svg className="overview-fan__svg" width={stageW} height={stageH}>
        {items.map(({ project, attachX, attachY, length, isStar }) => (
          <g key={project.id}>
            <line
              className={[
                'overview-fan__line',
                isStar ? 'is-star' : '',
                ready ? 'is-grown' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              x1={anchor.x}
              y1={anchor.y}
              x2={attachX}
              y2={attachY}
              stroke={ACCENT}
              strokeWidth={isStar ? 2 : 1.5}
              strokeLinecap="round"
              style={{
                strokeDasharray: length,
                strokeDashoffset: ready ? 0 : length,
                transitionDuration: `${LINE_MS}ms`,
              }}
            />
            <circle
              className={[
                'overview-fan__dot',
                ready ? 'is-grown' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              cx={attachX}
              cy={attachY}
              r={isStar ? 4 : 3.5}
              fill={ACCENT}
            />
          </g>
        ))}
      </svg>

      {/* Cap above lines so leaders sit behind the point */}
      <div
        className="overview-fan__cap"
        style={{ left: anchor.x, top: anchor.y }}
        aria-hidden="true"
      >
        <svg width="56" height="56" viewBox="0 0 56 56">
          {ringSegments.length === 1 ? (
            <>
              <circle
                cx="28"
                cy="28"
                r="24"
                fill={ringSegments[0].color}
              />
              <circle cx="28" cy="28" r="15" fill="#ffffff" />
            </>
          ) : (
            (() => {
              let angle = -Math.PI / 2;
              const rOuter = 24;
              const rInner = 15;
              const cx = 28;
              const cy = 28;
              return (
                <>
                  {ringSegments.map((seg) => {
                    const sweep = (seg.count / total) * Math.PI * 2;
                    const a0 = angle;
                    const a1 = angle + sweep;
                    angle = a1;
                    const large = sweep > Math.PI ? 1 : 0;
                    const x0 = cx + rOuter * Math.cos(a0);
                    const y0 = cy + rOuter * Math.sin(a0);
                    const x1 = cx + rOuter * Math.cos(a1);
                    const y1 = cy + rOuter * Math.sin(a1);
                    const xi0 = cx + rInner * Math.cos(a1);
                    const yi0 = cy + rInner * Math.sin(a1);
                    const xi1 = cx + rInner * Math.cos(a0);
                    const yi1 = cy + rInner * Math.sin(a0);
                    const d = [
                      `M ${x0} ${y0}`,
                      `A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1}`,
                      `L ${xi0} ${yi0}`,
                      `A ${rInner} ${rInner} 0 ${large} 0 ${xi1} ${yi1}`,
                      'Z',
                    ].join(' ');
                    return (
                      <path key={seg.key} d={d} fill={seg.color} />
                    );
                  })}
                  <circle cx="28" cy="28" r="14" fill="#ffffff" />
                </>
              );
            })()
          )}
          <text
            x="28"
            y="29"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Nunito Sans, Avenir Next, sans-serif"
            fontSize="13"
            fontWeight="700"
            fill="#141413"
          >
            {total}
          </text>
        </svg>
      </div>

      {items.map(({ project, left, top }) => (
        <button
          key={project.id}
          type="button"
          className={[
            'overview-fan__card',
            selectedProjectId === project.id ? 'is-selected' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{
            width: CARD_W,
            left,
            top,
            borderColor: CATEGORY_COLORS[project.category],
          }}
          onClick={(e) => {
            e.stopPropagation();
            onProjectSelect?.(project);
          }}
        >
          <span
            className="overview-fan__swatch"
            style={{ background: CATEGORY_COLORS[project.category] }}
            aria-hidden="true"
          />
          <div className="overview-fan__body">
            <h3 className="overview-fan__title">{project.title}</h3>
            <p className="overview-fan__meta">{project.year}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

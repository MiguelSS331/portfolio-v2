import { TIMELINE_END, TIMELINE_START, colorForYear } from '../data/chapters';
import './YearTimeline.css';

export default function YearTimeline({ activeYear, onYearSelect }) {
  const years = [];
  for (let y = TIMELINE_START; y <= TIMELINE_END; y += 1) {
    years.push(y);
  }

  return (
    <aside className="year-timeline" aria-label="Project timeline">
      <div className="year-timeline__rail" />
      <ol className="year-timeline__list">
        {years.map((year) => {
          const isActive = year === activeYear;
          const isPast = year < activeYear;
          const color = colorForYear(year);
          return (
            <li
              key={year}
              className={[
                'year-timeline__item',
                isActive ? 'is-active' : '',
                isPast ? 'is-past' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ '--year-color': color }}
            >
              <button
                type="button"
                className="year-timeline__btn"
                onClick={() => onYearSelect?.(year)}
                aria-label={`Go to ${year}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="year-timeline__pill">{year}</span>
                <span className="year-timeline__tick" />
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

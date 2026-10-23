import { CATEGORY_COLORS, OVERVIEW_CATEGORIES } from '../data/overviewProjects';
import { useLocale } from '../i18n';
import './CategoryLegend.css';

/**
 * Bottom-left rounded legend; toggles overview categories on/off.
 */
export default function CategoryLegend({ activeCategories, onToggle }) {
  const { t } = useLocale();
  const active = new Set(activeCategories);

  return (
    <div className="category-legend" role="group" aria-label={t.ui.legendAria}>
      {OVERVIEW_CATEGORIES.map((key) => {
        const on = active.has(key);
        return (
          <button
            key={key}
            type="button"
            className={['category-legend__item', on ? 'is-on' : 'is-off']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onToggle?.(key)}
            aria-pressed={on}
          >
            <span
              className="category-legend__swatch"
              style={{ background: CATEGORY_COLORS[key] }}
              aria-hidden="true"
            />
            <span className="category-legend__label">
              {t.ui.legendCategories?.[key] ?? key}
            </span>
          </button>
        );
      })}
    </div>
  );
}

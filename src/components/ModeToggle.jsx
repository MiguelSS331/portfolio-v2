import { useLocale } from '../i18n';
import './ModeToggle.css';

/**
 * Center-top pill: Story ↔ Map with a sliding indicator.
 */
export default function ModeToggle({ mode = 'story', onChange }) {
  const { t } = useLocale();
  const isMap = mode === 'map';

  return (
    <div className="mode-toggle" role="group" aria-label={t.ui.modeToggleAria}>
      <span
        className="mode-toggle__thumb"
        style={{ transform: isMap ? 'translateX(100%)' : 'translateX(0)' }}
        aria-hidden="true"
      />
      <button
        type="button"
        className={['mode-toggle__btn', !isMap ? 'is-active' : '']
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange?.('story')}
        aria-pressed={!isMap}
      >
        {t.ui.modeStory}
      </button>
      <button
        type="button"
        className={['mode-toggle__btn', isMap ? 'is-active' : '']
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange?.('map')}
        aria-pressed={isMap}
      >
        {t.ui.modeMap}
      </button>
    </div>
  );
}

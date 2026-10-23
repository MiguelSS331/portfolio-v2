import { useLocale } from '../i18n';
import './ScrollToTop.css';

/**
 * Floating control that scrolls the story back to the opening chapter.
 */
export default function ScrollToTop({ visible = false, onClick }) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      className={['scroll-top', visible ? 'is-visible' : '']
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      aria-label={t.ui.backToTop}
      title={t.ui.backToTop}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}

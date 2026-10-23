import { useEffect, useRef, useState } from 'react';
import { LOCALES, useLocale } from '../i18n';
import './LanguageSwitcher.css';

/**
 * Top-corner language control: shows current code (EN / DE / ES)
 * and a compact list to switch.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return undefined;

    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      className={['lang-switch', open ? 'is-open' : ''].filter(Boolean).join(' ')}
      ref={rootRef}
    >
      <button
        type="button"
        className="lang-switch__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.ui.langAria}
        onClick={() => setOpen((v) => !v)}
      >
        {current.label}
        <span className="lang-switch__caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open ? (
        <ul className="lang-switch__list" role="listbox" aria-label={t.ui.langAria}>
          {LOCALES.map((item) => (
            <li key={item.code} role="option" aria-selected={item.code === locale}>
              <button
                type="button"
                className={[
                  'lang-switch__option',
                  item.code === locale ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  setLocale(item.code);
                  setOpen(false);
                }}
              >
                <span className="lang-switch__code">{item.label}</span>
                <span className="lang-switch__name">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

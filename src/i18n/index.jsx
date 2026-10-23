import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import en from './en';
import de from './de';
import es from './es';

const STORAGE_KEY = 'portfolio-v2-lang';

export const LOCALES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'es', label: 'ES', name: 'Español' },
];

const DICTS = { en, de, es };

const LocaleContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: en,
  localizeChapter: (c) => c,
  localizePoint: (p) => p,
});

function readStoredLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && DICTS[stored]) return stored;
  } catch {
    /* ignore */
  }
  return 'en';
}

function applyChapterCopy(chapter, copy, categories = {}) {
  const categoryLabel =
    (chapter.category && categories[chapter.category]) || null;

  if (!copy) {
    return categoryLabel ? { ...chapter, categoryLabel } : chapter;
  }

  const next = {
    ...chapter,
    title: copy.title ?? chapter.title,
    subtitle: copy.subtitle ?? chapter.subtitle,
    categoryLabel,
  };

  if (!chapter.panel) return next;

  const panelCopy = copy.panel ?? {};
  next.panel = {
    ...chapter.panel,
    title: panelCopy.title ?? chapter.panel.title,
    date: panelCopy.date ?? chapter.panel.date,
    description: panelCopy.description ?? chapter.panel.description,
    categoryLabel,
    tags: chapter.tags ?? [],
    authors: chapter.authors ?? [],
  };

  if (chapter.panel.pdf) {
    next.panel.pdf = {
      ...chapter.panel.pdf,
      ...(panelCopy.pdf ?? {}),
    };
  }

  if (chapter.panel.pdfReveal) {
    next.panel.pdfReveal = {
      ...chapter.panel.pdfReveal,
      ...(panelCopy.pdfReveal ?? {}),
    };
  }

  return next;
}

function applyPointCopy(point, copy) {
  if (!point?.card || !copy) return point;
  return {
    ...point,
    card: {
      ...point.card,
      title: copy.title ?? point.card.title,
      subtitle: copy.subtitle ?? point.card.subtitle,
    },
  };
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const setLocale = useCallback((code) => {
    if (!DICTS[code]) return;
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = DICTS[locale] ?? en;

  const localizeChapter = useCallback(
    (chapter) =>
      applyChapterCopy(chapter, t.chapters?.[chapter.id], t.ui?.categories),
    [t],
  );

  const localizePoint = useCallback(
    (point) => applyPointCopy(point, t.points?.[point?.id]),
    [t],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, localizeChapter, localizePoint }),
    [locale, setLocale, t, localizeChapter, localizePoint],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

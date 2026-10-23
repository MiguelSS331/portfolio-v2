import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MENU_ABOUT,
  MENU_CATEGORIES,
  projectsForCategory,
} from '../data/categoryMenu';
import { CHAPTERS } from '../data/chapters';
import { useLocale } from '../i18n';
import ProjectDetailPanel from './ProjectDetailPanel';
import './CategoryMenu.css';

const CYCLE_MS = 380;

function CategoryBand({
  category,
  label,
  active,
  onSelect,
  compact = false,
}) {
  const [index, setIndex] = useState(0);
  const images = category.images;

  useEffect(() => {
    if (!active || images.length < 2) {
      setIndex(0);
      return undefined;
    }
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [active, images.length]);

  const shown = active ? index : 0;

  return (
    <button
      type="button"
      className={[
        'category-band',
        compact ? 'category-band--compact' : '',
        active ? 'is-hot' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect?.(category.id)}
    >
      <div className="category-band__media" aria-hidden="true">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={[
              'category-band__img',
              i === shown ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
        <div className="category-band__shade" />
      </div>
      <h3 className="category-band__title">{label}</h3>
    </button>
  );
}

/**
 * Stair hamburger opens a high z-index drawer:
 * categories → project list → full project detail beside the list.
 */
export default function CategoryMenu({ onAboutClick }) {
  const { t, localizeChapter } = useLocale();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  /** Run after drawer unlock so scroll-lock restore doesn't undo navigation */
  const pendingAfterCloseRef = useRef(null);

  const localizedChapters = useMemo(
    () => CHAPTERS.map(localizeChapter),
    [localizeChapter],
  );

  const projects = useMemo(
    () => (categoryId ? projectsForCategory(categoryId, localizedChapters) : []),
    [categoryId, localizedChapters],
  );

  const activeProject = useMemo(
    () => projects.find((p) => p.id === projectId) || null,
    [projects, projectId],
  );

  const view = !categoryId ? 'categories' : projectId ? 'detail' : 'list';

  const closeAll = () => {
    setOpen(false);
    setCategoryId(null);
    setProjectId(null);
    setHovered(null);
  };

  const goBack = () => {
    if (projectId) {
      setProjectId(null);
      return;
    }
    if (categoryId) {
      setCategoryId(null);
      return;
    }
    closeAll();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (projectId) setProjectId(null);
      else if (categoryId) setCategoryId(null);
      else closeAll();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, categoryId, projectId]);

  useEffect(() => {
    if (!open) {
      setHovered(null);
      setCategoryId(null);
      setProjectId(null);
    }
  }, [open]);

  // Lock story scroll while the drawer is open
  useEffect(() => {
    if (!open) return undefined;
    const { body, documentElement } = document;
    const prevBody = body.style.overflow;
    const prevHtml = documentElement.style.overflow;
    const scrollY = window.scrollY;
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    return () => {
      body.style.overflow = prevBody;
      documentElement.style.overflow = prevHtml;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      const pending = pendingAfterCloseRef.current;
      pendingAfterCloseRef.current = null;
      if (pending) {
        // Skip restoring old scrollY — navigate instead
        window.requestAnimationFrame(() => pending());
      } else {
        window.scrollTo(0, scrollY);
      }
    };
  }, [open]);

  return (
    <div
      className={[
        'category-menu',
        open ? 'is-open' : '',
        open ? `is-${view}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="category-menu__toggle"
        aria-expanded={open}
        aria-controls="category-menu-shell"
        aria-label={open ? t.ui.menuClose : t.ui.menuOpen}
        onClick={() => (open ? closeAll() : setOpen(true))}
      >
        <span className="category-menu__stair" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        className="category-menu__scrim"
        aria-hidden={!open}
        onClick={closeAll}
      />

      <div
        id="category-menu-shell"
        className="category-menu__shell"
        aria-hidden={!open}
      >
        {open ? (
          <div className="category-menu__toolbar">
            {view !== 'categories' ? (
              <button
                type="button"
                className="category-menu__toolbar-back"
                onClick={goBack}
                aria-label={t.ui.menuBack}
              >
                ← {t.ui.menuBack}
              </button>
            ) : (
              <span className="category-menu__toolbar-spacer" />
            )}
            <button
              type="button"
              className="category-menu__close"
              onClick={closeAll}
              aria-label={t.ui.menuClose}
            >
              ×
            </button>
          </div>
        ) : null}

        {activeProject ? (
          <ProjectDetailPanel
            project={activeProject}
            variant="menu"
            onClose={() => setProjectId(null)}
          />
        ) : null}

        <aside className="category-menu__panel">
          {view !== 'categories' ? (
            <button
              type="button"
              className="category-menu__back"
              onClick={goBack}
              aria-label={t.ui.menuBack}
            >
              ←
            </button>
          ) : null}

          {view === 'categories' ? (
            <div className="category-menu__bands">
              {MENU_CATEGORIES.map((cat, i) => (
                <div
                  key={cat.id}
                  className="category-menu__slot"
                  style={{ '--band-i': i }}
                  onMouseEnter={() => setHovered(cat.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <CategoryBand
                    category={cat}
                    label={t.ui.legendCategories?.[cat.id] ?? cat.id}
                    active={open && hovered === cat.id}
                    onSelect={setCategoryId}
                  />
                </div>
              ))}
              <div
                className="category-menu__slot category-menu__slot--about"
                style={{ '--band-i': MENU_CATEGORIES.length }}
                onMouseEnter={() => setHovered(MENU_ABOUT.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <CategoryBand
                  category={MENU_ABOUT}
                  label={t.ui.menuAbout ?? t.about?.title ?? 'About me'}
                  compact
                  active={open && hovered === MENU_ABOUT.id}
                  onSelect={() => {
                    pendingAfterCloseRef.current = () => onAboutClick?.();
                    closeAll();
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="category-list">
              <h2 className="category-list__heading">
                {t.ui.legendCategories?.[categoryId] ?? categoryId}
              </h2>
              <ul className="category-list__items">
                {projects.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      className={[
                        'category-list__item',
                        projectId === project.id ? 'is-active' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setProjectId(project.id)}
                    >
                      <span className="category-list__cover">
                        {project.cover ? (
                          <img src={project.cover} alt="" />
                        ) : (
                          <span className="category-list__cover-fallback" />
                        )}
                      </span>
                      <span className="category-list__meta">
                        <span className="category-list__title">
                          {project.title}
                        </span>
                        <span className="category-list__year">
                          {project.date}
                        </span>
                        {project.tags?.length ? (
                          <span className="category-list__tags">
                            {project.tags.slice(0, 4).map((tag) => (
                              <span key={tag} className="category-list__tag">
                                {tag}
                              </span>
                            ))}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

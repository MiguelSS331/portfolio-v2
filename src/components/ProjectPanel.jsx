import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import LogoMarquee from './LogoMarquee';
import PdfViewer from './PdfViewer';
import { useLocale } from '../i18n';
import './ProjectPanel.css';

const SLIDE_MS = 5000;

/**
 * Floating project card in the scroll column (StoryMaps-style).
 * Height fits content; sticky so the next card can peek while scrolling.
 */
export default function ProjectPanel({
  panel,
  onSlideChange,
  open = true,
  active = false,
  slidePos = null, // mobile story: 'before' | 'active' | 'after'
}) {
  const { t } = useLocale();
  const slides = panel?.slides ?? [];
  const afterImages = panel?.afterImages ?? [];
  const [slideIndex, setSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [paused, setPaused] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  const goPrev = useCallback(() => {
    if (slides.length < 2) return;
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    if (slides.length < 2) return;
    setSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    setSlideIndex(0);
    setLightboxOpen(false);
    setGalleryIndex(null);
    setPaused(false);
    setPdfOpen(false);
  }, [panel?.kind]);

  useEffect(() => {
    if (!active) {
      setLightboxOpen(false);
      return undefined;
    }
    if (!slides.length) {
      onSlideChange?.(null);
      return undefined;
    }
    onSlideChange?.(slides[slideIndex] ?? null);
    return undefined;
  }, [active, slides, slideIndex, onSlideChange]);

  useEffect(() => {
    if (!active || slides.length < 2 || paused || lightboxOpen) return undefined;

    const id = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_MS);

    return () => window.clearInterval(id);
  }, [active, slides.length, panel?.kind, paused, lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen && galleryIndex == null) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
        setGalleryIndex(null);
      }
      if (lightboxOpen) {
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
      }
      if (galleryIndex != null && afterImages.length > 1) {
        if (e.key === 'ArrowLeft') {
          setGalleryIndex(
            (i) => (i - 1 + afterImages.length) % afterImages.length,
          );
        }
        if (e.key === 'ArrowRight') {
          setGalleryIndex((i) => (i + 1) % afterImages.length);
        }
      }
    };

    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, galleryIndex, goPrev, goNext, afterImages.length]);

  if (!panel) return null;

  const currentSlide = slides[slideIndex];
  const canNavigate = slides.length > 1;

  const lightbox =
    lightboxOpen && currentSlide
      ? createPortal(
          <div
            className="map-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Map viewer"
            onClick={() => setLightboxOpen(false)}
          >
            <div
              className="map-lightbox__frame"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="map-lightbox__close"
                aria-label="Close viewer"
                onClick={() => setLightboxOpen(false)}
              >
                ×
              </button>

              {canNavigate ? (
                <button
                  type="button"
                  className="map-lightbox__nav map-lightbox__nav--prev"
                  aria-label="Previous map"
                  onClick={goPrev}
                >
                  ‹
                </button>
              ) : null}

              <div className="map-lightbox__media">
                {currentSlide.type === 'iframe' || currentSlide.type === 'pdf' ? (
                  <iframe
                    className="map-lightbox__embed"
                    src={
                      currentSlide.type === 'pdf'
                        ? currentSlide.pdfSrc || currentSlide.src
                        : currentSlide.src
                    }
                    title={
                      currentSlide.type === 'pdf'
                        ? 'PDF map viewer'
                        : `Embedded view ${slideIndex + 1}`
                    }
                    allow="fullscreen"
                  />
                ) : (
                  <img
                    className="map-lightbox__image"
                    src={currentSlide.src}
                    alt={`Map ${slideIndex + 1} of ${slides.length}`}
                  />
                )}
              </div>

              {canNavigate ? (
                <button
                  type="button"
                  className="map-lightbox__nav map-lightbox__nav--next"
                  aria-label="Next map"
                  onClick={goNext}
                >
                  ›
                </button>
              ) : null}

              <p className="map-lightbox__counter">
                {slideIndex + 1} / {slides.length}
              </p>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <aside
        className={[
          'project-panel',
          open ? 'is-open' : '',
          active ? 'is-active' : '',
          slidePos ? `is-slide-${slidePos}` : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden={!open}
      >
        <div className="project-panel__inner">
          <p className="project-panel__date">{panel.date}</p>
          <h2 className="project-panel__title">{panel.title}</h2>
          {panel.categoryLabel ? (
            <p className="project-panel__category">{panel.categoryLabel}</p>
          ) : null}
          {panel.tags?.length ? (
            <ul className="project-panel__tags" aria-label="Tools">
              {panel.tags.map((tag) => (
                <li key={tag} className="project-panel__tag">
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
          {panel.authors?.length ? (
            <p className="project-panel__authors">
              <span className="project-panel__authors-label">
                {t.ui.authors}
              </span>
              {panel.authors.join(' · ')}
            </p>
          ) : null}

          <LogoMarquee logos={panel.logos} />

          <div
            className="project-panel__carousel"
            aria-live="polite"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={[
                  'project-panel__slide-btn',
                  i === slideIndex ? 'is-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => {
                  if (i === slideIndex) setLightboxOpen(true);
                  else setSlideIndex(i);
                }}
                aria-label={
                  i === slideIndex
                    ? `Enlarge map ${i + 1}`
                    : `Show map ${i + 1}`
                }
              >
                <img src={slide.src} alt="" className="project-panel__slide" />
              </button>
            ))}

            {canNavigate ? (
              <>
                <button
                  type="button"
                  className="project-panel__nav project-panel__nav--prev"
                  aria-label="Previous map"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaused(true);
                    goPrev();
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="project-panel__nav project-panel__nav--next"
                  aria-label="Next map"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPaused(true);
                    goNext();
                  }}
                >
                  ›
                </button>
              </>
            ) : null}

            <div className="project-panel__dots" aria-hidden="true">
              {slides.map((slide, i) => (
                <span
                  key={slide.id}
                  className={[
                    'project-panel__dot',
                    i === slideIndex ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              ))}
            </div>
          </div>

          <p className="project-panel__hint">
            {panel.pdfReveal ? t.ui.browsePdfHint : t.ui.clickToEnlarge}
          </p>

          {panel.pdf?.src ? (
            <PdfViewer src={panel.pdf.src} title={panel.pdf.title} />
          ) : null}

          {panel.pdfReveal?.src ? (
            <div className="project-panel__pdf-reveal">
              <button
                type="button"
                className="project-panel__pdf-btn"
                onClick={() => setPdfOpen((v) => !v)}
                aria-expanded={pdfOpen}
              >
                {pdfOpen
                  ? t.ui.hidePdf
                  : panel.pdfReveal.buttonLabel || t.ui.viewFullCollection}
              </button>
              {pdfOpen ? (
                <PdfViewer
                  src={panel.pdfReveal.src}
                  title={panel.pdfReveal.title || 'Full collection'}
                />
              ) : null}
            </div>
          ) : null}

          <p className="project-panel__description">{panel.description}</p>

          {afterImages.length ? (
            <div
              className="project-panel__after-gallery"
              aria-label="Project images"
            >
              {afterImages.map((img, i) => (
                <button
                  key={img.id || img.src}
                  type="button"
                  className="project-panel__after-btn"
                  onClick={() => setGalleryIndex(i)}
                  aria-label={img.alt || `Enlarge image ${i + 1}`}
                >
                  <img src={img.src} alt="" />
                </button>
              ))}
            </div>
          ) : null}

          {panel.footerLogo ? (
            <div className="project-panel__footer-logo">
              <img
                src={panel.footerLogo.src}
                alt={panel.footerLogo.name || ''}
              />
            </div>
          ) : null}

          <span className="project-panel__sr-only">
            Showing map {slideIndex + 1} of {slides.length || 0}
          </span>
        </div>
      </aside>
      {lightbox}
      {galleryIndex != null && afterImages[galleryIndex]
        ? createPortal(
            <div
              className="map-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label="Image viewer"
              onClick={() => setGalleryIndex(null)}
            >
              <div
                className="map-lightbox__frame"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="map-lightbox__close"
                  aria-label="Close viewer"
                  onClick={() => setGalleryIndex(null)}
                >
                  ×
                </button>
                {afterImages.length > 1 ? (
                  <button
                    type="button"
                    className="map-lightbox__nav map-lightbox__nav--prev"
                    aria-label="Previous image"
                    onClick={() =>
                      setGalleryIndex(
                        (i) =>
                          (i - 1 + afterImages.length) % afterImages.length,
                      )
                    }
                  >
                    ‹
                  </button>
                ) : null}
                <div className="map-lightbox__media">
                  <img
                    className="map-lightbox__image"
                    src={afterImages[galleryIndex].src}
                    alt=""
                  />
                </div>
                {afterImages.length > 1 ? (
                  <button
                    type="button"
                    className="map-lightbox__nav map-lightbox__nav--next"
                    aria-label="Next image"
                    onClick={() =>
                      setGalleryIndex((i) => (i + 1) % afterImages.length)
                    }
                  >
                    ›
                  </button>
                ) : null}
                <p className="map-lightbox__counter">
                  {galleryIndex + 1} / {afterImages.length}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

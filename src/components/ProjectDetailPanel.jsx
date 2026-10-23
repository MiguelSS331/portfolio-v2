import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PdfViewer from './PdfViewer';
import { useLocale } from '../i18n';
import './ProjectDetailPanel.css';
import './ProjectPanel.css';

/**
 * Full project detail drawer (left). Used by the category menu and map mode.
 * Includes close control, PDF reveal, and StoryMaps-style image lightbox.
 */
export default function ProjectDetailPanel({
  project,
  onClose,
  variant = 'menu', // 'menu' | 'map'
}) {
  const { t } = useLocale();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const images = project?.images?.length
    ? project.images
    : project?.cover
      ? [project.cover]
      : [];

  useEffect(() => {
    setLightboxIndex(null);
    setPdfOpen(false);
  }, [project?.id]);

  useEffect(() => {
    if (lightboxIndex == null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i + 1) % images.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, images.length]);

  // Map panel: Escape closes when no lightbox/PDF is open
  useEffect(() => {
    if (variant !== 'map' || !onClose) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (lightboxIndex != null || pdfOpen) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [variant, onClose, lightboxIndex, pdfOpen]);

  if (!project) return null;

  const lightbox =
    lightboxIndex != null && images[lightboxIndex]
      ? createPortal(
          <div
            className="map-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            onClick={() => setLightboxIndex(null)}
          >
            <div
              className="map-lightbox__frame"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="map-lightbox__close"
                aria-label={t.ui.menuClose}
                onClick={() => setLightboxIndex(null)}
              >
                ×
              </button>
              {images.length > 1 ? (
                <button
                  type="button"
                  className="map-lightbox__nav map-lightbox__nav--prev"
                  aria-label={t.ui.prevImage}
                  onClick={() =>
                    setLightboxIndex(
                      (i) => (i - 1 + images.length) % images.length,
                    )
                  }
                >
                  ‹
                </button>
              ) : null}
              <div className="map-lightbox__media">
                <img
                  className="map-lightbox__image"
                  src={images[lightboxIndex]}
                  alt=""
                />
              </div>
              {images.length > 1 ? (
                <button
                  type="button"
                  className="map-lightbox__nav map-lightbox__nav--next"
                  aria-label={t.ui.nextImage}
                  onClick={() =>
                    setLightboxIndex((i) => (i + 1) % images.length)
                  }
                >
                  ›
                </button>
              ) : null}
              <p className="map-lightbox__counter">
                {lightboxIndex + 1} / {images.length}
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
          'project-detail-panel',
          `project-detail-panel--${variant}`,
        ].join(' ')}
        aria-label={project.title}
      >
        <button
          type="button"
          className="project-detail-panel__close"
          aria-label={t.ui.closeProject}
          onClick={onClose}
        >
          ×
        </button>

        <div className="project-detail-panel__media">
          {project.cover || images[0] ? (
            <button
              type="button"
              className="project-detail-panel__hero-btn"
              onClick={() => setLightboxIndex(0)}
              aria-label={t.ui.clickToEnlarge}
            >
              <img src={project.cover || images[0]} alt="" />
            </button>
          ) : null}
          <div className="project-detail-panel__shade" />
        </div>

        <div className="project-detail-panel__body">
          <p className="project-detail-panel__date">{project.date}</p>
          <h2 className="project-detail-panel__title">{project.title}</h2>
          {project.categoryLabel ? (
            <p className="project-detail-panel__category">
              {project.categoryLabel}
            </p>
          ) : null}
          {project.tags?.length ? (
            <ul className="project-detail-panel__tags">
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
          {project.authors?.length ? (
            <p className="project-detail-panel__authors">
              <span>{t.ui.authors}</span>
              {project.authors.join(' · ')}
            </p>
          ) : null}
          {project.subtitle ? (
            <p className="project-detail-panel__sub">{project.subtitle}</p>
          ) : null}
          {project.description ? (
            <p className="project-detail-panel__desc">{project.description}</p>
          ) : null}
          {images.length ? (
            <div className="project-detail-panel__gallery">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  className="project-detail-panel__thumb"
                  onClick={() => setLightboxIndex(i)}
                  aria-label={t.ui.clickToEnlarge}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          ) : null}
          {project.pdfReveal?.src ? (
            <div className="project-detail-panel__pdf">
              <button
                type="button"
                className="project-detail-panel__pdf-btn"
                onClick={() => setPdfOpen((v) => !v)}
                aria-expanded={pdfOpen}
              >
                {pdfOpen
                  ? t.ui.hidePdf
                  : project.pdfReveal.buttonLabel || t.ui.viewFullCollection}
              </button>
              {pdfOpen ? (
                <PdfViewer
                  src={project.pdfReveal.src}
                  title={project.pdfReveal.title || 'PDF'}
                />
              ) : null}
            </div>
          ) : null}
          {project.webEmbed?.externalUrl ? (
            <a
              className="project-detail-panel__link"
              href={project.webEmbed.externalUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t.ui.openFullWebsite}
            </a>
          ) : null}
        </div>
      </aside>
      {lightbox}
    </>
  );
}

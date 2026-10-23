import { useMemo, useState } from 'react';
import { useLocale } from '../i18n';
import './PdfViewer.css';

function buildPdfSrc(src, { zoom }) {
  const hash = zoom != null ? `zoom=${zoom}` : '';
  return hash ? `${src}#${hash}` : src;
}

/**
 * Compact in-panel PDF viewer with zoom + open-in-tab.
 * Expects a web-optimized PDF under /public/pdfs/.
 */
export default function PdfViewer({
  src,
  title = 'Exhibition map',
  initialZoom = 'page-width',
}) {
  const { t } = useLocale();
  const [zoom, setZoom] = useState(initialZoom);

  const iframeSrc = useMemo(
    () => buildPdfSrc(src, { zoom }),
    [src, zoom],
  );

  const zoomIn = () =>
    setZoom((z) => (typeof z === 'number' ? Math.min(z + 25, 300) : 125));
  const zoomOut = () =>
    setZoom((z) => (typeof z === 'number' ? Math.max(z - 25, 50) : 100));
  const fitWidth = () => setZoom('page-width');
  const reset = () => setZoom(100);

  return (
    <div className="pdf-viewer">
      <div className="pdf-viewer__bar">
        <p className="pdf-viewer__label">{title}</p>
        <div className="pdf-viewer__controls">
          <button type="button" onClick={zoomOut} title={t.ui.zoomOut}>
            −
          </button>
          <button type="button" onClick={reset} title="100%">
            100%
          </button>
          <button type="button" onClick={fitWidth} title={t.ui.fitWidth}>
            Fit
          </button>
          <button type="button" onClick={zoomIn} title={t.ui.zoomIn}>
            +
          </button>
          <a href={src} target="_blank" rel="noreferrer" title={t.ui.openPdf}>
            {t.ui.openPdf}
          </a>
        </div>
      </div>
      <iframe
        className="pdf-viewer__frame"
        src={iframeSrc}
        title={title}
      />
    </div>
  );
}

import {
  CHAPTERS,
  VA_DASHBOARD_IMAGES,
  VA_EURAC_IMAGES,
  WYMNS_IMAGES,
} from './chapters';

const MENU_EXCLUDE_IDS = new Set(['y2025-wymns-visual', 'y2026-va-visual']);

/** Category drawer: preview image sequences for hover motion. */
export const MENU_CATEGORIES = [
  {
    id: 'research',
    images: [
      '/images/central1.jpg',
      '/images/mig1.jpg',
      '/images/cuxtal1.jpg',
      '/images/ine1.jpg',
      '/images/tur1.jpg',
      '/images/giz1.png',
      '/images/VA1.png',
    ],
  },
  {
    id: 'print',
    images: [
      '/images/sierra-pdf-preview.jpg',
      '/images/cartohome.png',
      '/images/chernoff.jpg',
      '/images/popo.jpg',
      '/images/wymns/wymns-08.jpg',
      '/images/panorama-map.jpg',
      '/images/tharandt-hiking.jpg',
    ],
  },
  {
    id: 'web',
    images: [
      '/images/web-lithium.jpg',
      '/images/web-salzpark.jpg',
      '/images/web-polarized.jpg',
      '/images/web-fear.jpg',
    ],
  },
];

/** Thinner about band under the three category bands */
export const MENU_ABOUT = {
  id: 'about',
  images: [
    '/images/about-hover-IMG_2346.png',
    '/images/about-hover-IMG_9831.png',
    '/images/about-hover-IMG_9423.png',
  ],
};

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function coverForChapter(chapter, images) {
  if (chapter.panel?.cover) return chapter.panel.cover;
  if (chapter.projectId === 'wymns') return '/images/wymns/wymns-08.jpg';
  if (chapter.webEmbed?.poster) return chapter.webEmbed.poster;
  if (images[0]) return images[0];
  if (chapter.backgroundSlideshow?.images?.[0]) {
    return chapter.backgroundSlideshow.images[0];
  }
  return null;
}

function imagesForChapter(chapter) {
  if (chapter.projectId === 'wymns') {
    return WYMNS_IMAGES.map((img) => img.src);
  }
  if (chapter.projectId === 'visual-analytics') {
    return [
      ...VA_EURAC_IMAGES.map((img) => img.src),
      ...VA_DASHBOARD_IMAGES.map((img) => img.src),
    ];
  }

  const fromSlides = (chapter.panel?.slides || [])
    .map((s) => s.src)
    .filter(Boolean);
  const fromAfter = (chapter.panel?.afterImages || [])
    .map((s) => s.src)
    .filter(Boolean);
  const fromSlideshow = chapter.backgroundSlideshow?.images || [];
  const poster = chapter.webEmbed?.poster ? [chapter.webEmbed.poster] : [];
  return unique([...fromSlides, ...fromAfter, ...fromSlideshow, ...poster]);
}

function toMenuProject(chapter) {
  if (!chapter) return null;
  const images = imagesForChapter(chapter);
  const cover = coverForChapter(chapter, images);
  const ordered = cover
    ? [cover, ...images.filter((src) => src !== cover)]
    : images;

  return {
    id: chapter.id,
    projectId: chapter.projectId || null,
    category: chapter.category,
    title: chapter.panel?.title || chapter.title,
    subtitle: chapter.subtitle,
    year: chapter.year,
    date: chapter.panel?.date || String(chapter.year),
    tags: chapter.tags || [],
    authors: chapter.authors || chapter.panel?.authors || [],
    description: chapter.panel?.description || '',
    cover,
    images: ordered,
    webEmbed: chapter.webEmbed || null,
    pdfReveal: chapter.panel?.pdfReveal
      ? { ...chapter.panel.pdfReveal }
      : null,
    categoryLabel: chapter.categoryLabel || null,
  };
}

/**
 * Menu-ready project entries for a category (localized chapter overlay applied by caller).
 */
export function projectsForCategory(categoryId, chapters = CHAPTERS) {
  return chapters
    .filter((c) => c.category === categoryId && (c.panel || c.webEmbed))
    .filter((c) => !MENU_EXCLUDE_IDS.has(c.id))
    .map(toMenuProject)
    .filter(Boolean);
}

/** Resolve overview-map project id (projectId) or chapter id → menu project */
export function getMenuProjectById(id, chapters = CHAPTERS) {
  if (!id) return null;
  const byChapter = chapters.find((c) => c.id === id);
  if (byChapter && !MENU_EXCLUDE_IDS.has(byChapter.id)) {
    return toMenuProject(byChapter);
  }
  const byProject = chapters.find(
    (c) => c.projectId === id && !MENU_EXCLUDE_IDS.has(c.id),
  );
  return toMenuProject(byProject);
}

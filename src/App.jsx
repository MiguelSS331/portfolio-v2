import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StoryMap from './components/StoryMap';
import YearTimeline from './components/YearTimeline';
import PointCard from './components/PointCard';
import ProjectPanel from './components/ProjectPanel';
import BackgroundSlideshow from './components/BackgroundSlideshow';
import BackgroundVideo from './components/BackgroundVideo';
import LanguageSwitcher from './components/LanguageSwitcher';
import WebProjectEmbed from './components/WebProjectEmbed';
import ScrollToTop from './components/ScrollToTop';
import CoverAmbient from './components/CoverAmbient';
import ModeToggle from './components/ModeToggle';
import OverviewMap from './components/OverviewMap';
import CategoryMenu from './components/CategoryMenu';
import ProjectDetailPanel from './components/ProjectDetailPanel';
import AboutMe from './components/AboutMe';
import StoryProgress from './components/StoryProgress';
import StoryTapZones from './components/StoryTapZones';
import { CHAPTERS } from './data/chapters';
import { getMenuProjectById } from './data/categoryMenu';
import { useLocale } from './i18n';
import useMediaQuery from './hooks/useMediaQuery';
import './App.css';
import './mobile.css';

export default function App() {
  const { locale, t, localizeChapter, localizePoint } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const [focus, setFocus] = useState(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [blinkIds, setBlinkIds] = useState([]);
  const [webInteracting, setWebInteracting] = useState(false);
  const [viewMode, setViewMode] = useState('story');
  const [mapProject, setMapProject] = useState(null);
  const chapterRefs = useRef([]);
  const stageRef = useRef(null);
  const mapMode = viewMode === 'map';
  const isMobile = useMediaQuery('(max-width: 768px)');

  const localizedChapters = useMemo(
    () => CHAPTERS.map(localizeChapter),
    [localizeChapter],
  );

  useEffect(() => {
    // Mobile story navigates by tap / timeline — observer would fight zero-height chapters
    if (isMobile) return undefined;

    const nodes = chapterRefs.current.filter(Boolean);
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;

        const id = visible[0].target.dataset.chapterIndex;
        const next = Number(id);
        if (!Number.isNaN(next)) {
          setActiveIndex(next);
        }
      },
      {
        root: null,
        rootMargin: '-35% 0px -35% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setStageSize({ w: rect.width, h: rect.height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handlePointFocus = useCallback(
    (next) => {
      if (!next?.point) {
        setFocus(null);
        return;
      }
      setFocus({
        ...next,
        point: localizePoint(next.point),
      });
    },
    [localizePoint],
  );

  const handleSlideChange = useCallback((slide) => {
    setBlinkIds(slide?.blinkIds ?? []);
  }, []);

  const scrollToChapter = useCallback((index) => {
    const node = chapterRefs.current[index];
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const goToChapter = useCallback(
    (index) => {
      const max = localizedChapters.length - 1;
      const next = Math.max(0, Math.min(max, index));
      const chapter = localizedChapters[next];
      setActiveIndex(next);
      if (!isMobile) {
        scrollToChapter(next);
        return;
      }
      // Mobile: keep document pinned; About is its own fixed scroller
      window.scrollTo({ top: 0, behavior: 'auto' });
      if (chapter?.aboutMe) {
        window.requestAnimationFrame(() => {
          const el = chapterRefs.current[next];
          if (el) el.scrollTop = 0;
        });
      }
    },
    [isMobile, localizedChapters, scrollToChapter],
  );

  const handleYearSelect = useCallback(
    (year) => {
      const index = localizedChapters.findIndex((c) => c.year === year);
      if (index < 0) return;
      goToChapter(index);
    },
    [localizedChapters, goToChapter],
  );

  const handleBackToTop = useCallback(() => {
    goToChapter(0);
  }, [goToChapter]);

  const handleGoToAbout = useCallback(() => {
    const index = localizedChapters.findIndex((c) => c.aboutMe);
    if (index < 0) return;
    goToChapter(index);
  }, [localizedChapters, goToChapter]);

  const handleStoryPrev = useCallback(() => {
    goToChapter(activeIndex - 1);
  }, [activeIndex, goToChapter]);

  const handleStoryNext = useCallback(() => {
    goToChapter(activeIndex + 1);
  }, [activeIndex, goToChapter]);

  const handleMapProjectSelect = useCallback(
    (overviewProject) => {
      const id = overviewProject?.id;
      const resolved = getMenuProjectById(id, localizedChapters);
      setMapProject(resolved);
    },
    [localizedChapters],
  );

  useEffect(() => {
    if (!mapMode) setMapProject(null);
  }, [mapMode]);

  // Snap About Me into view only when scrolling down into it (not when leaving)
  useEffect(() => {
    if (mapMode || isMobile) return undefined;
    const aboutIndex = localizedChapters.findIndex((c) => c.aboutMe);
    if (aboutIndex < 0) return undefined;

    let snapped = false;
    let ticking = false;
    let lastY = window.scrollY;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const scrollingDown = y > lastY + 1;
        lastY = y;

        const el = chapterRefs.current[aboutIndex];
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;

        // Fully above or mostly below → allow snap again next time we approach
        if (rect.top > vh * 0.85 || rect.bottom < vh * 0.35) {
          snapped = false;
          return;
        }

        // Leaving upward: never pull back to About
        if (!scrollingDown) return;

        if (
          !snapped &&
          rect.top < vh * 0.55 &&
          rect.top > 12 &&
          rect.bottom > vh * 0.45
        ) {
          snapped = true;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [localizedChapters, mapMode, isMobile]);

  // Mobile story: pin the document; panel / about scroll in their own containers.
  // Avoid touchmove preventDefault — it blocks overflow scrolling inside the sheet.
  useEffect(() => {
    if (!isMobile || mapMode) return undefined;

    const lockScroll = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    lockScroll();

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverscroll = html.style.overscrollBehavior;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    document.addEventListener('scroll', lockScroll, { passive: true });
    return () => {
      document.removeEventListener('scroll', lockScroll);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, [isMobile, mapMode, activeIndex, localizedChapters]);

  // After About overlay mounts, pin its scroll to the top
  useEffect(() => {
    if (!isMobile) return;
    const onAbout = Boolean(localizedChapters[activeIndex]?.aboutMe);
    if (!onAbout) return;
    const aboutIndex = localizedChapters.findIndex((c) => c.aboutMe);
    const el = chapterRefs.current[aboutIndex];
    if (el) el.scrollTop = 0;
  }, [isMobile, activeIndex, localizedChapters]);

  const activeYear = localizedChapters[activeIndex]?.year ?? localizedChapters[0].year;
  const activeChapter = localizedChapters[activeIndex] ?? localizedChapters[0];
  const showInvite = activeIndex === 0;
  const showAbout = Boolean(activeChapter.aboutMe);
  const panelOpen = Boolean(activeChapter.panel);
  const slideshow = activeChapter.backgroundSlideshow;
  const showSlideshow = Boolean(slideshow?.images?.length);
  const backgroundVideos = activeChapter.backgroundVideos?.sources || null;
  const showBackgroundVideo = Boolean(backgroundVideos?.length);
  const showWebEmbed = Boolean(activeChapter.webEmbed?.src);
  const [cachedSlideshow, setCachedSlideshow] = useState({
    images: [],
    intervalMs: 5000,
  });
  const [cachedVideos, setCachedVideos] = useState([]);

  useEffect(() => {
    if (!showWebEmbed) setWebInteracting(false);
  }, [showWebEmbed, activeChapter.id]);

  useEffect(() => {
    if (slideshow?.images?.length) {
      setCachedSlideshow({
        images: slideshow.images,
        intervalMs: slideshow.intervalMs ?? 5000,
      });
    }
  }, [slideshow]);

  useEffect(() => {
    if (backgroundVideos?.length) setCachedVideos(backgroundVideos);
  }, [backgroundVideos]);

  // Refresh open point card copy when language changes
  useEffect(() => {
    setFocus((prev) => {
      if (!prev?.point) return prev;
      return { ...prev, point: localizePoint(prev.point) };
    });
  }, [locale, localizePoint]);

  const slideshowImages = cachedSlideshow.images;

  // Mobile immersive: full-bleed slideshow / video / web — no bottom sheet
  const mobileImmersive =
    isMobile &&
    !mapMode &&
    !showInvite &&
    !showAbout &&
    (Boolean(activeChapter.webEmbed) ||
      (Boolean(activeChapter.backgroundSlideshow) && !activeChapter.panel) ||
      (Boolean(activeChapter.backgroundVideos) && !activeChapter.panel));

  const showMobileSheet =
    isMobile && !mapMode && !showInvite && !showAbout && !mobileImmersive && panelOpen;

  // Desktop only — on mobile the sheet panel carries year/title/tags
  const showChapterLabel =
    !isMobile &&
    !mapMode &&
    !showInvite &&
    !showAbout &&
    !panelOpen;

  const inviteCta =
    isMobile && t.ui.inviteCtaMobile ? t.ui.inviteCtaMobile : t.ui.inviteCta;
  const inviteLead =
    isMobile && t.ui.inviteLeadMobile ? t.ui.inviteLeadMobile : t.ui.inviteLead;

  // Progress bars: dark on light grounds (cover/about/map sheet), light on dark media
  const progressOnDarkMedia =
    !mapMode &&
    (mobileImmersive ||
      ((showSlideshow || showBackgroundVideo || showWebEmbed) &&
        !showMobileSheet));
  const progressTone = progressOnDarkMedia ? 'light' : 'dark';

  return (
    <div
      className={[
        'app',
        isMobile ? 'app--mobile' : '',
        showInvite && !mapMode ? 'app--cover' : '',
        panelOpen && !mapMode ? 'app--panel-open' : '',
        showSlideshow && !mapMode ? 'app--slideshow' : '',
        showBackgroundVideo && !mapMode ? 'app--bg-video' : '',
        showWebEmbed && !mapMode ? 'app--web-embed' : '',
        webInteracting && !mapMode ? 'app--web-interacting' : '',
        showAbout && !mapMode ? 'app--about' : '',
        mobileImmersive ? 'app--mobile-immersive' : '',
        showMobileSheet ? 'app--mobile-sheet' : '',
        mapMode ? 'app--map-mode' : '',
        mapMode && mapProject ? 'app--map-detail' : '',
        activeIndex > 0 && !mapMode && !showAbout ? 'app--scrolled' : '',
        isMobile && !mapMode ? `app--progress-${progressTone}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="map-stage" ref={stageRef}>
        <StoryMap
          activeIndex={activeIndex}
          onPointFocus={mapMode ? undefined : handlePointFocus}
          blinkIds={!mapMode && panelOpen ? blinkIds : []}
          panelOpen={!mapMode && panelOpen}
        />

        <OverviewMap
          active={mapMode}
          detailOpen={Boolean(mapProject)}
          selectedProjectId={mapProject?.projectId || mapProject?.id || null}
          onProjectSelect={handleMapProjectSelect}
          onDetailClose={() => setMapProject(null)}
        />

        {mapMode && mapProject ? (
          <ProjectDetailPanel
            project={mapProject}
            variant="map"
            onClose={() => setMapProject(null)}
          />
        ) : null}

        <BackgroundSlideshow
          images={slideshowImages}
          intervalMs={cachedSlideshow.intervalMs}
          active={!mapMode && showSlideshow}
        />

        <BackgroundVideo
          sources={cachedVideos}
          active={!mapMode && showBackgroundVideo}
        />

        <WebProjectEmbed
          embed={activeChapter.webEmbed}
          active={!mapMode && showWebEmbed}
          onInteractingChange={setWebInteracting}
        />

        {/* Mobile: veil only on cover — later chapters need a clear map */}
        {!mapMode &&
        !showAbout &&
        !mobileImmersive &&
        (!isMobile || showInvite) ? (
          <div className="map-veil" aria-hidden="true" />
        ) : null}

        {!mapMode && !showAbout && (!isMobile || showMobileSheet) ? (
          <YearTimeline
            activeYear={activeYear}
            onYearSelect={handleYearSelect}
          />
        ) : null}

        <ScrollToTop
          visible={!mapMode && activeIndex > 0 && !webInteracting && !showAbout}
          onClick={handleBackToTop}
        />

        <header
          className={['map-chrome', showInvite && !mapMode ? 'map-chrome--cover' : '']
            .filter(Boolean)
            .join(' ')}
          aria-hidden={webInteracting || mapMode || showAbout}
          hidden={mapMode || showAbout}
        >
          {showInvite ? (
            <img
              className="map-chrome__portrait map-chrome__portrait--link"
              src="/images/coverphoto.jpg"
              alt="Miguel Solano"
              width={160}
              height={160}
              role="link"
              tabIndex={0}
              aria-label={t.about?.title || 'About me'}
              onClick={handleGoToAbout}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleGoToAbout();
                }
              }}
            />
          ) : null}
          <div className="map-chrome__copy">
            <p className="map-chrome__name">Miguel Solano</p>
            <p className="map-chrome__role">{t.ui.role}</p>
            {/* Desktop keeps tagline in chrome; mobile pins it above the invite */}
            {showInvite && !isMobile ? (
              <p className="map-chrome__tagline">
                <span className="map-chrome__tagline-spark" aria-hidden="true" />
                <span className="map-chrome__tagline-text">{t.ui.tagline}</span>
                <span className="map-chrome__tagline-spark" aria-hidden="true" />
              </p>
            ) : null}
          </div>
        </header>

        {showChapterLabel ? (
          <div
            className="chapter-label"
            key={`${activeChapter.id}-${t.code}`}
            aria-hidden={webInteracting}
          >
            <span className="chapter-label__year">{activeChapter.year}</span>
            <h2 className="chapter-label__title">{activeChapter.title}</h2>
            {activeChapter.categoryLabel ? (
              <p className="chapter-label__category">
                {activeChapter.categoryLabel}
              </p>
            ) : null}
            {!isMobile && activeChapter.tags?.length ? (
              <ul className="chapter-label__tags" aria-label="Tools">
                {activeChapter.tags.map((tag) => (
                  <li key={tag} className="chapter-label__tag">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
            {!isMobile && activeChapter.authors?.length ? (
              <p className="chapter-label__authors">
                <span className="chapter-label__authors-label">
                  {t.ui.authors}
                </span>
                {activeChapter.authors.join(' · ')}
              </p>
            ) : null}
            {!isMobile ? (
              <p className="chapter-label__sub">{activeChapter.subtitle}</p>
            ) : null}
          </div>
        ) : null}

        {isMobile && showInvite && !mapMode ? (
          <>
            {/* Above rótulo, right edge: plain text + icon (no button frame) */}
            <p
              className={[
                'journey-invite',
                'journey-invite--mobile-cta',
                showInvite ? 'is-visible' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden={!showInvite}
            >
              <span className="journey-invite__cta">{inviteCta}</span>
              <span className="journey-invite__tap-icon" aria-hidden="true">
                <img src="/icons/tap.svg" alt="" width={22} height={22} />
              </span>
            </p>
            <p className="map-chrome__tagline map-chrome__tagline--cover-mobile">
              <span className="map-chrome__tagline-spark" aria-hidden="true" />
              <span className="map-chrome__tagline-text">{t.ui.tagline}</span>
              <span className="map-chrome__tagline-spark" aria-hidden="true" />
            </p>
            <p
              className={[
                'journey-invite',
                'journey-invite--mobile-lead',
                showInvite ? 'is-visible' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden={!showInvite}
            >
              <span className="journey-invite__lead">{inviteLead}</span>
            </p>
          </>
        ) : null}

        {!mapMode && !(isMobile && showInvite) ? (
          <p
            className={['journey-invite', showInvite ? 'is-visible' : '']
              .filter(Boolean)
              .join(' ')}
            aria-hidden={!showInvite}
          >
            <span className="journey-invite__lead">{inviteLead}</span>
            <span className="journey-invite__cta">{inviteCta}</span>
          </p>
        ) : null}

        {!mapMode ? (
          <PointCard
            point={focus?.point ?? null}
            anchor={focus?.anchor ?? null}
            stageSize={stageSize}
            compact={isMobile}
          />
        ) : null}
      </div>

      {/* Above story/about content so controls stay visible on About Me */}
      <ModeToggle mode={viewMode} onChange={setViewMode} />
      {showAbout && !mapMode ? (
        <button
          type="button"
          className="about-home"
          onClick={handleBackToTop}
          aria-label={t.ui.homeAria ?? t.ui.backToTop}
        >
          {t.ui.home ?? 'Home'}
        </button>
      ) : null}
      <LanguageSwitcher />
      <CategoryMenu onAboutClick={handleGoToAbout} />

      {/* Above map-veil / tap zones so mute stays clickable on cover */}
      <CoverAmbient active={!mapMode && showInvite} />

      <StoryProgress
        count={localizedChapters.length}
        activeIndex={activeIndex}
        visible={isMobile && !mapMode}
      />
      <StoryTapZones
        enabled={isMobile && !mapMode && !showAbout && !webInteracting}
        onPrev={handleStoryPrev}
        onNext={handleStoryNext}
      />

      <main className="scroll-track" hidden={mapMode} aria-hidden={mapMode}>
        {localizedChapters.map((chapter, i) => {
          const hasPanel = Boolean(chapter.panel);
          const isActive = i === activeIndex;
          return (
            <section
              key={chapter.id}
              className={[
                'scroll-chapter',
                hasPanel ? 'scroll-chapter--with-panel' : '',
                chapter.backgroundSlideshow && !hasPanel
                  ? 'scroll-chapter--visual'
                  : '',
                chapter.backgroundVideos && !hasPanel
                  ? 'scroll-chapter--visual'
                  : '',
                chapter.webEmbed ? 'scroll-chapter--web' : '',
                chapter.aboutMe ? 'scroll-chapter--about' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              data-chapter-index={i}
              ref={(el) => {
                chapterRefs.current[i] = el;
              }}
              aria-label={
                chapter.aboutMe
                  ? chapter.title
                  : `${chapter.year}: ${chapter.title}`
              }
            >
              {/* Desktop: About lives in the scroll chapter. Mobile uses overlay below. */}
              {chapter.aboutMe && !isMobile ? (
                <AboutMe active={isActive} />
              ) : null}
              {hasPanel ? (
                <ProjectPanel
                  panel={chapter.panel}
                  open={isActive}
                  active={isActive}
                  slidePos={
                    isMobile
                      ? i < activeIndex
                        ? 'before'
                        : i > activeIndex
                          ? 'after'
                          : 'active'
                      : null
                  }
                  onSlideChange={isActive ? handleSlideChange : undefined}
                />
              ) : null}
            </section>
          );
        })}
      </main>

      {/* Mobile About: fixed overlay (avoids zero-height chapter / stacking bugs) */}
      {isMobile && showAbout && !mapMode ? (
        <div
          className="mobile-about-overlay"
          ref={(el) => {
            const aboutIndex = localizedChapters.findIndex((c) => c.aboutMe);
            if (aboutIndex >= 0) chapterRefs.current[aboutIndex] = el;
          }}
        >
          <AboutMe active />
        </div>
      ) : null}
    </div>
  );
}

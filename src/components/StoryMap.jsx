import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  CHAPTERS,
  boundsForPoints,
  getPointById,
  pointsForStoryYear,
  pointsToGeoJSON,
} from '../data/chapters';
import {
  CARTO_FLOWS,
  CARTO_POINTS,
  flowFeatureCollection,
  pointsFeatureCollection,
} from '../data/cartoHome';
import './StoryMap.css';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const BASE_STYLE = import.meta.env.VITE_MAPBOX_STYLE;

const SOURCE_ID = 'story-points';
const HALO_LAYER = 'story-points-halo';
const CORE_LAYER = 'story-points-core';
const HIT_LAYER = 'story-points-hit';
const POINT_LAYERS = [HIT_LAYER, CORE_LAYER, HALO_LAYER];

const FLOW_SOURCE = 'carto-flows';
const FLOW_LAYER = 'carto-flows-line';
const FLOW_GLOW = 'carto-flows-glow';
const CARTO_PT_SOURCE = 'carto-points';
const CARTO_PT_HALO = 'carto-points-halo';
const CARTO_PT_CORE = 'carto-points-core';

/**
 * Sticky Mapbox map driven by active chapter.
 * Cumulative project points; blinkIds sync with panel carousel;
 * optional per-chapter mapStyle + orbital fly-around.
 */
export default function StoryMap({
  activeIndex = 0,
  onPointFocus,
  blinkIds = [],
  panelOpen = false,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const readyRef = useRef(false);
  const chapterIndexRef = useRef(activeIndex);
  const pulseStopRef = useRef(null);
  const orbitStopRef = useRef(null);
  const flowStopRef = useRef(null);
  const styleUrlRef = useRef(BASE_STYLE);
  const onPointFocusRef = useRef(onPointFocus);
  const focusedIdRef = useRef(null);
  const touchPinnedRef = useRef(false);
  const blinkIdsRef = useRef(blinkIds);
  const panelOpenRef = useRef(panelOpen);
  const getBlinkIds = () => blinkIdsRef.current;

  useEffect(() => {
    onPointFocusRef.current = onPointFocus;
  }, [onPointFocus]);

  useEffect(() => {
    chapterIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    blinkIdsRef.current = blinkIds;
  }, [blinkIds]);

  useEffect(() => {
    panelOpenRef.current = panelOpen;
  }, [panelOpen]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!TOKEN || !BASE_STYLE) {
      console.error('Missing VITE_MAPBOX_TOKEN or VITE_MAPBOX_STYLE');
      return;
    }

    mapboxgl.accessToken = TOKEN;

    const first = CHAPTERS[0];
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      center: first.camera.center,
      zoom: first.camera.zoom,
      pitch: first.camera.pitch ?? 0,
      bearing: first.camera.bearing ?? 0,
      attributionControl: true,
      logoPosition: 'bottom-left',
      interactive: true,
    });

    map.scrollZoom.disable();
    map.dragPan.disable();
    map.dragRotate.disable();
    map.touchZoomRotate.disable();
    map.doubleClickZoom.disable();
    map.keyboard.disable();
    map.boxZoom.disable();
    map.touchPitch.disable();

    try {
      map.setProjection('mercator');
    } catch {
      /* style may lock projection */
    }

    mapRef.current = map;
    styleUrlRef.current = BASE_STYLE;

    const clearFocus = () => {
      focusedIdRef.current = null;
      touchPinnedRef.current = false;
      onPointFocusRef.current?.(null);
      map.getCanvas().style.cursor = '';
    };

    const focusFeature = (feature) => {
      if (!feature) {
        if (!touchPinnedRef.current) clearFocus();
        return;
      }

      const id = feature.properties?.id;
      const data = getPointById(id);
      if (!data?.card) {
        if (!touchPinnedRef.current) clearFocus();
        return;
      }

      const coords = feature.geometry.coordinates;
      const projected = map.project(coords);
      focusedIdRef.current = id;
      map.getCanvas().style.cursor = 'pointer';
      onPointFocusRef.current?.({
        point: data,
        anchor: { x: projected.x, y: projected.y },
      });
    };

    const featureAt = (point) => {
      if (!map.getLayer(HIT_LAYER)) return null;
      const hits = map.queryRenderedFeatures(point, { layers: POINT_LAYERS });
      return hits[0] ?? null;
    };

    const onMove = (e) => {
      if (touchPinnedRef.current) return;
      focusFeature(featureAt(e.point));
    };

    const onLeave = () => {
      if (touchPinnedRef.current) return;
      clearFocus();
    };

    const onClick = (e) => {
      const feature = featureAt(e.point);
      if (feature?.properties?.id && getPointById(feature.properties.id)?.card) {
        touchPinnedRef.current = true;
        focusFeature(feature);
      } else if (touchPinnedRef.current) {
        clearFocus();
      }
    };

    const syncFocusedAnchor = () => {
      if (!focusedIdRef.current) return;
      const data = getPointById(focusedIdRef.current);
      if (!data?.card) return;
      const projected = map.project([data.lng, data.lat]);
      onPointFocusRef.current?.({
        point: data,
        anchor: { x: projected.x, y: projected.y },
      });
    };

    map.on('load', () => {
      ensurePointLayers(map, CHAPTERS[chapterIndexRef.current], blinkIdsRef.current);
      readyRef.current = true;
      applyChapter(map, chapterIndexRef.current, false, {
        blinkIds: blinkIdsRef.current,
        panelOpen: panelOpenRef.current,
        styleUrlRef,
        orbitStopRef,
        pulseStopRef,
        flowStopRef,
        getBlinkIds,
      });
      pulseStopRef.current = startHaloPulse(map, getBlinkIds);

      map.on('mousemove', onMove);
      map.on('mouseleave', onLeave);
      map.on('click', onClick);
      map.on('move', syncFocusedAnchor);
    });

    return () => {
      readyRef.current = false;
      pulseStopRef.current?.();
      pulseStopRef.current = null;
      orbitStopRef.current?.();
      orbitStopRef.current = null;
      flowStopRef.current?.();
      flowStopRef.current = null;
      map.off('mousemove', onMove);
      map.off('mouseleave', onLeave);
      map.off('click', onClick);
      map.off('move', syncFocusedAnchor);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    focusedIdRef.current = null;
    touchPinnedRef.current = false;
    onPointFocusRef.current?.(null);
    applyChapter(map, activeIndex, true, {
      blinkIds: blinkIdsRef.current,
      panelOpen: panelOpenRef.current,
      styleUrlRef,
      orbitStopRef,
      pulseStopRef,
      flowStopRef,
      getBlinkIds,
    });
  }, [activeIndex]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const chapter = CHAPTERS[chapterIndexRef.current];
    syncPointData(map, chapter, blinkIds);
  }, [blinkIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const chapter = CHAPTERS[chapterIndexRef.current];
    // Globe / flow / terrain orbit chapters: only nudge padding
    if (chapter?.flows || chapter?.globe || chapter?.terrain || chapter?.hideMap) {
      if (chapter.camera) {
        map.easeTo({
          center: map.getCenter(),
          zoom: map.getZoom(),
          pitch: map.getPitch(),
          bearing: map.getBearing(),
          padding: cameraPaddingForPanel(map, panelOpen),
          duration: 500,
        });
      }
      return;
    }
    applyChapter(map, chapterIndexRef.current, true, {
      blinkIds: blinkIdsRef.current,
      panelOpen,
      styleUrlRef,
      orbitStopRef,
      pulseStopRef,
      flowStopRef,
      getBlinkIds,
    });
  }, [panelOpen]);

  // Keep Mapbox pixels in sync when the stage height changes (mobile 100↔50dvh)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      const m = mapRef.current;
      if (!m || !readyRef.current) return;
      m.resize();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        applyChapter(m, chapterIndexRef.current, false, {
          blinkIds: blinkIdsRef.current,
          panelOpen: panelOpenRef.current,
          styleUrlRef,
          orbitStopRef,
          pulseStopRef,
          flowStopRef,
          getBlinkIds,
        });
      }, 80);
    });
    ro.observe(el);
    return () => {
      window.clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return <div className="story-map" ref={containerRef} />;
}

/** Desktop: clear right panel. Mobile story sheet: clear bottom half. */
function cameraPaddingForPanel(map, panelOpen) {
  const w = map.getContainer().clientWidth || window.innerWidth;
  const h = map.getContainer().clientHeight || window.innerHeight;
  const mobile = w < 768;
  if (!panelOpen) {
    return mobile
      ? { top: 56, bottom: 24, left: 24, right: 24 }
      : { top: 48, bottom: 48, left: 48, right: 48 };
  }
  if (mobile) {
    return {
      top: 48,
      bottom: Math.max(24, Math.round(h * 0.08)),
      left: 20,
      right: 20,
    };
  }
  return { top: 48, bottom: 48, left: 48, right: 420 };
}

function ensurePointLayers(map, chapter, blinkIds = []) {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: emptyGeoJSON(),
    });
  }

  if (!map.getLayer(HALO_LAYER)) {
    map.addLayer({
      id: HALO_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': 16,
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.3,
        'circle-blur': 0.55,
      },
    });
  }

  if (!map.getLayer(CORE_LAYER)) {
    map.addLayer({
      id: CORE_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': 5,
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
      },
    });
  }

  if (!map.getLayer(HIT_LAYER)) {
    map.addLayer({
      id: HIT_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': 24,
        'circle-color': '#000000',
        'circle-opacity': 0,
      },
    });
  }

  syncPointData(map, chapter, blinkIds);
}

function emptyGeoJSON() {
  return { type: 'FeatureCollection', features: [] };
}

function syncPointData(map, chapter, blinkIds = []) {
  const source = map.getSource(SOURCE_ID);
  if (!source) return;

  if (chapter?.hidePoints) {
    source.setData(emptyGeoJSON());
    return;
  }

  source.setData(
    pointsToGeoJSON(pointsForStoryYear(chapter.year), {
      activeYear: chapter.year,
      blinkIds,
    }),
  );
}

function stopOrbit(orbitStopRef) {
  orbitStopRef?.current?.();
  if (orbitStopRef) orbitStopRef.current = null;
}

function stopFlows(flowStopRef) {
  flowStopRef?.current?.();
  if (flowStopRef) flowStopRef.current = null;
}

function setMapProjection(map, chapter) {
  try {
    map.setProjection(chapter?.globe ? 'globe' : 'mercator');
  } catch {
    /* style may lock projection */
  }
}

const DEM_SOURCE = 'mapbox-dem';

function ensureTerrain(map, exaggeration = 1.85) {
  if (!map.getSource(DEM_SOURCE)) {
    map.addSource(DEM_SOURCE, {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    });
  }
  map.setTerrain({ source: DEM_SOURCE, exaggeration });
  try {
    if (!map.getLayer('sky')) {
      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 12,
        },
      });
    }
  } catch {
    /* sky unsupported */
  }
}

function clearTerrain(map) {
  try {
    map.setTerrain(null);
  } catch {
    /* ignore */
  }
  if (map.getLayer('sky')) {
    try {
      map.removeLayer('sky');
    } catch {
      /* ignore */
    }
  }
}

function clearCartoLayers(map) {
  for (const id of [FLOW_GLOW, FLOW_LAYER, CARTO_PT_CORE, CARTO_PT_HALO]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  for (const id of [FLOW_SOURCE, CARTO_PT_SOURCE]) {
    if (map.getSource(id)) map.removeSource(id);
  }
}

function ensureCartoLayers(map) {
  if (!map.getSource(FLOW_SOURCE)) {
    map.addSource(FLOW_SOURCE, {
      type: 'geojson',
      data: emptyGeoJSON(),
    });
  }
  if (!map.getSource(CARTO_PT_SOURCE)) {
    map.addSource(CARTO_PT_SOURCE, {
      type: 'geojson',
      data: pointsFeatureCollection(CARTO_POINTS),
    });
  }

  if (!map.getLayer(FLOW_GLOW)) {
    map.addLayer({
      id: FLOW_GLOW,
      type: 'line',
      source: FLOW_SOURCE,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 6.5,
        'line-opacity': 0.22,
        'line-blur': 1.2,
      },
    });
  }

  if (!map.getLayer(FLOW_LAYER)) {
    map.addLayer({
      id: FLOW_LAYER,
      type: 'line',
      source: FLOW_SOURCE,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.85,
        'line-opacity': 0.92,
      },
    });
  }

  if (!map.getLayer(CARTO_PT_HALO)) {
    map.addLayer({
      id: CARTO_PT_HALO,
      type: 'circle',
      source: CARTO_PT_SOURCE,
      paint: {
        'circle-radius': [
          'case',
          ['==', ['get', 'hub'], 1],
          18,
          10,
        ],
        'circle-color': ['get', 'color'],
        'circle-opacity': 0.35,
        'circle-blur': 0.5,
      },
    });
  }

  if (!map.getLayer(CARTO_PT_CORE)) {
    map.addLayer({
      id: CARTO_PT_CORE,
      type: 'circle',
      source: CARTO_PT_SOURCE,
      paint: {
        'circle-radius': [
          'case',
          ['==', ['get', 'hub'], 1],
          7,
          4.2,
        ],
        'circle-color': ['get', 'color'],
        'circle-stroke-width': 1.4,
        'circle-stroke-color': '#ffffff',
      },
    });
  }
}

function startFlowBuild(map, flowStopRef, orbitStopRef, chapter) {
  stopFlows(flowStopRef);
  ensureCartoLayers(map);

  const source = map.getSource(FLOW_SOURCE);
  if (!source) return;

  const progress = Object.fromEntries(CARTO_FLOWS.map((f) => [f.id, 0]));
  source.setData(flowFeatureCollection(CARTO_FLOWS, progress));

  const start = performance.now();
  const STAGGER = 70;
  const DURATION = 1600;
  let frame = 0;
  let stopped = false;

  const tick = (now) => {
    if (stopped) return;
    let allDone = true;
    for (let i = 0; i < CARTO_FLOWS.length; i += 1) {
      const f = CARTO_FLOWS[i];
      const local = (now - start - i * STAGGER) / DURATION;
      const p = Math.min(1, Math.max(0, local));
      progress[f.id] = p;
      if (p < 1) allDone = false;
    }
    source.setData(flowFeatureCollection(CARTO_FLOWS, progress));

    if (!allDone) {
      frame = requestAnimationFrame(tick);
      return;
    }

    // After arcs land, start globe rotation
    if (chapter.orbit && chapter.camera && orbitStopRef) {
      stopOrbit(orbitStopRef);
      orbitStopRef.current = startOrbit(map, chapter.camera, 0.1);
    }
  };

  frame = requestAnimationFrame(tick);

  if (flowStopRef) {
    flowStopRef.current = () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
  }
}

function applyChapter(
  map,
  index,
  animate,
  {
    blinkIds = [],
    panelOpen = false,
    styleUrlRef,
    orbitStopRef,
    pulseStopRef,
    flowStopRef,
    getBlinkIds = () => blinkIds,
  } = {},
) {
  const chapter = CHAPTERS[index];
  if (!chapter) return;

  stopOrbit(orbitStopRef);
  stopFlows(flowStopRef);

  const targetStyle = chapter.mapStyle || BASE_STYLE;
  const currentStyle = styleUrlRef?.current || BASE_STYLE;

  const afterStyleReady = () => {
    setMapProjection(map, chapter);
    ensurePointLayers(map, chapter, blinkIds);
    pulseStopRef?.current?.();
    if (pulseStopRef) {
      pulseStopRef.current = startHaloPulse(map, getBlinkIds);
    }

    if (chapter.flows) {
      ensureCartoLayers(map);
    } else {
      clearCartoLayers(map);
    }

    if (chapter.terrain) {
      ensureTerrain(map);
    } else {
      clearTerrain(map);
    }

    if (chapter.hideMap) {
      map.getContainer().style.opacity = '0';
    } else {
      map.getContainer().style.opacity = '1';
    }

    flyToChapter(map, chapter, animate, panelOpen, orbitStopRef, flowStopRef);
  };

  if (targetStyle !== currentStyle) {
    styleUrlRef.current = targetStyle;
    map.setStyle(targetStyle);
    map.once('style.load', afterStyleReady);
    return;
  }

  // Leaving a pitched orbit / globe: flatten before easing to next chapter
  if (!chapter.orbit && !chapter.globe && (map.getPitch() > 1 || Math.abs(map.getBearing()) > 1)) {
    map.jumpTo({ pitch: 0, bearing: 0 });
  }

  if (!chapter.flows) clearCartoLayers(map);
  if (chapter.terrain) ensureTerrain(map);
  else clearTerrain(map);

  map.getContainer().style.opacity = chapter.hideMap ? '0' : '1';

  setMapProjection(map, chapter);
  syncPointData(map, chapter, blinkIds);
  flyToChapter(map, chapter, animate, panelOpen, orbitStopRef, flowStopRef);
}

function flyToChapter(map, chapter, animate, panelOpen, orbitStopRef, flowStopRef) {
  const duration = animate ? 1800 : 0;
  const w = map.getContainer().clientWidth || window.innerWidth;
  const mobile = w < 768;
  const padding = mobile
    ? {
        top: 64,
        bottom: panelOpen ? Math.max(32, Math.round(map.getContainer().clientHeight * 0.06)) : 48,
        left: 28,
        right: 28,
      }
    : {
        top: 72,
        bottom: 72,
        left: 160,
        right: panelOpen ? 460 : 96,
      };

  const afterCamera = () => {
    if (chapter.flows) {
      startFlowBuild(map, flowStopRef, orbitStopRef, chapter);
      return;
    }
    if (chapter.orbit && chapter.camera) {
      stopOrbit(orbitStopRef);
      if (orbitStopRef) {
        orbitStopRef.current = startOrbit(map, chapter.camera);
      }
    }
  };

  // Locked chapters (Sierra / CARTOHome) ignore cumulative bounds
  if (chapter.lockCamera && chapter.camera) {
    map.easeTo({
      ...chapter.camera,
      padding: cameraPaddingForPanel(map, panelOpen),
      duration,
      essential: true,
    });
    if (animate && duration > 0) {
      map.once('moveend', afterCamera);
    } else {
      afterCamera();
    }
    return;
  }

  const visible = pointsForStoryYear(chapter.year);
  const dynamicBounds = boundsForPoints(visible, 3.6);

  if (dynamicBounds) {
    map.fitBounds(dynamicBounds, {
      padding,
      duration,
      essential: true,
      maxZoom: 5.2,
    });
  } else if (chapter.camera) {
    let cameraPadding;
    if (panelOpen) {
      cameraPadding = cameraPaddingForPanel(map, true);
    } else if (chapter.mapPadding) {
      const leftMax = mobile ? Math.round(w * 0.08) : chapter.mapPadding.left;
      cameraPadding = {
        ...chapter.mapPadding,
        left: Math.min(chapter.mapPadding.left, leftMax),
      };
    }
    map.easeTo({
      ...chapter.camera,
      ...(cameraPadding ? { padding: cameraPadding } : {}),
      duration,
      essential: true,
    });
  } else if (chapter.bounds) {
    map.fitBounds(chapter.bounds, {
      padding,
      duration,
      essential: true,
    });
  }
}

/** Slow circular bearing rotation around a fixed center / pitch / zoom. */
function startOrbit(map, { center, zoom, pitch = 55, bearing = 0 }, speed = 0.12) {
  let current = bearing;
  let frame = 0;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    current = (current + speed) % 360;
    map.jumpTo({
      center,
      zoom,
      pitch,
      bearing: current,
    });
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
  };
}

/** Pulse only points whose ids are in blinkIds; others stay steady & softer. */
function startHaloPulse(map, getBlinkIds) {
  let growing = true;
  let radius = 14;
  let frame = 0;
  let stopped = false;

  const tick = () => {
    if (stopped || !map.getLayer(HALO_LAYER)) return;

    radius += growing ? 0.28 : -0.28;
    if (radius >= 24) growing = false;
    if (radius <= 14) growing = true;

    const ids = getBlinkIds?.() ?? [];
    const pulseOpacity = 0.14 + ((radius - 14) / 10) * 0.4;

    if (!ids.length) {
      map.setPaintProperty(HALO_LAYER, 'circle-radius', 14);
      map.setPaintProperty(HALO_LAYER, 'circle-opacity', [
        'case',
        ['==', ['get', 'isActiveYear'], 1],
        0.28,
        0.12,
      ]);
    } else {
      map.setPaintProperty(HALO_LAYER, 'circle-radius', [
        'case',
        ['==', ['get', 'blink'], 1],
        radius,
        12,
      ]);
      map.setPaintProperty(HALO_LAYER, 'circle-opacity', [
        'case',
        ['==', ['get', 'blink'], 1],
        pulseOpacity,
        ['==', ['get', 'isActiveYear'], 1],
        0.22,
        0.1,
      ]);
    }

    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(frame);
  };
}

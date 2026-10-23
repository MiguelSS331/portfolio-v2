import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  CATEGORY_COLORS,
  OVERVIEW_CATEGORIES,
  OVERVIEW_COUNTRY_ZOOM,
  OVERVIEW_MAP_STYLE,
  OVERVIEW_MIN_ZOOM,
  buildOverviewClusters,
  getOverviewDataBounds,
} from '../data/overviewProjects';
import CategoryLegend from './CategoryLegend';
import OverviewProjectFan from './OverviewProjectFan';
import './OverviewMap.css';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

/** SVG pie-ring marker: outer category arcs + center count */
function markerHtml(cluster) {
  const size = 56;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = 24;
  const rInner = 15;
  const segments = OVERVIEW_CATEGORIES.map((key) => ({
    key,
    count: cluster.counts[key] || 0,
    color: CATEGORY_COLORS[key],
  })).filter((s) => s.count > 0);

  const total = cluster.total || 1;
  let arcs;
  if (segments.length === 1) {
    const color = segments[0].color;
    arcs = [
      `<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="${color}" />`,
      `<circle cx="${cx}" cy="${cy}" r="${rInner}" fill="#ffffff" />`,
    ];
  } else {
    let angle = -Math.PI / 2;
    arcs = segments.map((seg) => {
      const sweep = (seg.count / total) * Math.PI * 2;
      const a0 = angle;
      const a1 = angle + sweep;
      angle = a1;
      const large = sweep > Math.PI ? 1 : 0;
      const x0 = cx + rOuter * Math.cos(a0);
      const y0 = cy + rOuter * Math.sin(a0);
      const x1 = cx + rOuter * Math.cos(a1);
      const y1 = cy + rOuter * Math.sin(a1);
      const xi0 = cx + rInner * Math.cos(a1);
      const yi0 = cy + rInner * Math.sin(a1);
      const xi1 = cx + rInner * Math.cos(a0);
      const yi1 = cy + rInner * Math.sin(a0);
      const d = [
        `M ${x0} ${y0}`,
        `A ${rOuter} ${rOuter} 0 ${large} 1 ${x1} ${y1}`,
        `L ${xi0} ${yi0}`,
        `A ${rInner} ${rInner} 0 ${large} 0 ${xi1} ${yi1}`,
        'Z',
      ].join(' ');
      return `<path d="${d}" fill="${seg.color}" />`;
    });
  }

  const haloColor = segments[0]?.color || '#9a9590';

  // Inner wrapper only: never put CSS transform on the root (Mapbox owns that)
  return `
    <button type="button" class="overview-marker" title="${cluster.label}: ${cluster.total}" aria-label="${cluster.label}, ${cluster.total} projects">
      <span class="overview-marker__inner">
        <span class="overview-marker__halo" style="background:${haloColor}" aria-hidden="true"></span>
        <svg class="overview-marker__core" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
          ${arcs.join('')}
          ${
            segments.length === 1
              ? ''
              : `<circle cx="${cx}" cy="${cy}" r="${rInner - 1}" fill="#ffffff" />`
          }
          <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle"
            font-family="Nunito Sans, Avenir Next, sans-serif" font-size="13" font-weight="700"
            fill="#141413">${cluster.total}</text>
        </svg>
      </span>
    </button>
  `;
}

/**
 * Full-bleed Mercator overview on the story Mapbox style.
 * Continent clusters at data extent; country/region points when zoomed in.
 */
export default function OverviewMap({
  active = false,
  detailOpen = false,
  selectedProjectId = null,
  onProjectSelect,
  onDetailClose,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const onDetailCloseRef = useRef(onDetailClose);
  const [activeCategories, setActiveCategories] = useState([
    ...OVERVIEW_CATEGORIES,
  ]);
  const [detailLevel, setDetailLevel] = useState('continent');
  const [selection, setSelection] = useState(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  onDetailCloseRef.current = onDetailClose;

  const clusters = useMemo(
    () => buildOverviewClusters(activeCategories, detailLevel),
    [activeCategories, detailLevel],
  );

  const clearSelection = useCallback(() => setSelection(null), []);

  const dismissOverlay = useCallback(() => {
    setSelection(null);
    onDetailCloseRef.current?.();
  }, []);

  useEffect(() => {
    if (!active || !containerRef.current || mapRef.current) return undefined;
    if (!TOKEN) {
      console.error('Missing VITE_MAPBOX_TOKEN');
      return undefined;
    }

    mapboxgl.accessToken = TOKEN;
    const mobile = isMobileViewport();
    const bounds = getOverviewDataBounds();

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: OVERVIEW_MAP_STYLE,
      bounds,
      fitBoundsOptions: {
        padding: mobile
          ? { top: 72, bottom: 110, left: 36, right: 36 }
          : { top: 80, bottom: 80, left: 72, right: 72 },
      },
      minZoom: OVERVIEW_MIN_ZOOM,
      attributionControl: true,
      logoPosition: 'bottom-right',
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right',
    );

    const syncDetail = () => {
      const z = map.getZoom();
      setDetailLevel(z >= OVERVIEW_COUNTRY_ZOOM ? 'place' : 'continent');
    };

    const syncSize = () => {
      const canvas = map.getCanvas();
      setStageSize({ w: canvas.clientWidth, h: canvas.clientHeight });
    };

    const fitToData = () => {
      const pad = mobile
        ? { top: 72, bottom: 110, left: 36, right: 36 }
        : { top: 80, bottom: 80, left: 72, right: 72 };
      map.fitBounds(getOverviewDataBounds(), {
        padding: pad,
        duration: 0,
        essential: true,
      });
      // Lock zoom-out to the data extent
      const z = map.getZoom();
      map.setMinZoom(Math.max(OVERVIEW_MIN_ZOOM, z - 0.05));
    };

    map.on('load', () => {
      try {
        map.setProjection('mercator');
      } catch {
        /* ignore */
      }
      map.setFog(null);
      fitToData();
      syncDetail();
      syncSize();
      map.resize();
      // Re-fit after resize so mercator framing is exact
      requestAnimationFrame(fitToData);
    });

    map.on('zoomend', syncDetail);
    map.on('move', () => {
      // Keep fan anchored while panning if a selection is open
      setSelection((prev) => {
        if (!prev?.clusterId) return prev;
        const marker = markersRef.current.find(
          (m) => m._overviewId === prev.clusterId,
        );
        if (!marker) return prev;
        const { x, y } = map.project(marker.getLngLat());
        return { ...prev, anchor: { x, y }, cluster: prev.cluster };
      });
    });
    map.on('click', () => {
      setSelection(null);
      onDetailCloseRef.current?.();
    });
    map.on('resize', syncSize);

    mapRef.current = map;

    const onResize = () => {
      map.resize();
      syncSize();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setSelection(null);
    };
  }, [active, clearSelection]);

  useEffect(() => {
    if (!active) setSelection(null);
  }, [active, detailLevel, activeCategories]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    clusters.forEach((cluster) => {
      if (cluster.lng == null || cluster.lat == null) return;
      const el = document.createElement('div');
      el.innerHTML = markerHtml(cluster);
      const node = el.firstElementChild;
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        const { x, y } = map.project([cluster.lng, cluster.lat]);
        setSelection({
          clusterId: cluster.id,
          cluster,
          projects: cluster.projects,
          anchor: { x, y },
        });
      });
      const marker = new mapboxgl.Marker({ element: node, anchor: 'center' })
        .setLngLat([cluster.lng, cluster.lat])
        .addTo(map);
      marker._overviewId = cluster.id;
      markersRef.current.push(marker);
    });
  }, [clusters, active]);

  useEffect(() => {
    if (!active) return undefined;
    const id = requestAnimationFrame(() => mapRef.current?.resize());
    return () => cancelAnimationFrame(id);
  }, [active]);

  // Canvas CSS left shifts over 450ms — Mapbox must resize after that or a dead strip remains
  useEffect(() => {
    if (!active || !mapRef.current) return undefined;
    const map = mapRef.current;

    const syncAfterLayout = () => {
      map.resize();
      const canvas = map.getCanvas();
      setStageSize({ w: canvas.clientWidth, h: canvas.clientHeight });
      setSelection((prev) => {
        if (!prev?.clusterId) return prev;
        const marker = markersRef.current.find(
          (m) => m._overviewId === prev.clusterId,
        );
        if (!marker) return prev;
        const { x, y } = map.project(marker.getLngLat());
        return { ...prev, anchor: { x, y } };
      });
    };

    // Immediate pass (handles open) + pass after the CSS left transition ends
    const t0 = window.setTimeout(syncAfterLayout, 0);
    const t1 = window.setTimeout(syncAfterLayout, 480);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
    };
  }, [active, detailOpen]);

  const handleToggle = (key) => {
    setActiveCategories((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((k) => k !== key);
      }
      return [...prev, key];
    });
  };

  return (
    <div
      className={[
        'overview-map',
        active ? 'is-active' : '',
        detailOpen ? 'has-detail' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!active}
    >
      <div className="overview-map__canvas" ref={containerRef} />
      {active ? (
        <CategoryLegend
          activeCategories={activeCategories}
          onToggle={handleToggle}
        />
      ) : null}
      {active && selection ? (
        <OverviewProjectFan
          anchor={selection.anchor}
          projects={selection.projects}
          cluster={selection.cluster}
          stageSize={stageSize}
          onClose={dismissOverlay}
          selectedProjectId={selectedProjectId}
          onProjectSelect={(project) => {
            onProjectSelect?.(project);
            // Keep fan open so another project can be selected while the panel is active
          }}
        />
      ) : null}
    </div>
  );
}

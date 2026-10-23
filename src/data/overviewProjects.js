/** Overview map: projects by continent / country / region centroids. */

export const CATEGORY_COLORS = {
  print: '#d5893b',
  research: '#81ae34',
  web: '#5e6795',
};

export const OVERVIEW_CATEGORIES = ['print', 'research', 'web'];

/** Light Mapbox style (story base). Natural Earth style intentionally unused. */
export const OVERVIEW_MAP_STYLE =
  import.meta.env.VITE_MAPBOX_STYLE ||
  'mapbox://styles/miguelsolano8555/cmrunzqk900e801sc0xbl8c3s';

/** Fallback floor before fitBounds locks the real min zoom */
export const OVERVIEW_MIN_ZOOM = 1.1;

/** Above this zoom, continent clusters split into country / region points */
export const OVERVIEW_COUNTRY_ZOOM = 3.4;

export const CONTINENT_CENTROIDS = {
  // Mexico City
  'North America': { lng: -99.1332, lat: 19.4326 },
  // Inland Central America (Honduras / Nicaragua highlands)
  'Central America': { lng: -87.0, lat: 14.2 },
  // Inland junction of Argentina, Paraguay and Chile
  'South America': { lng: -64.5, lat: -25.8 },
  Europe: { lng: 10.45, lat: 51.0 },
  Africa: { lng: 20.0, lat: 5.0 },
  Asia: { lng: 90.0, lat: 35.0 },
  Oceania: { lng: 134.0, lat: -25.0 },
};

/** Country and multi-country region centroids */
export const PLACE_CENTROIDS = {
  Mexico: { lng: -99.1332, lat: 19.4326 },
  Germany: { lng: 10.45, lat: 51.16 },
  Austria: { lng: 14.55, lat: 47.52 },
  Italy: { lng: 11.35, lat: 46.5 },
  Chile: { lng: -71.0, lat: -33.45 },
  'Central America': CONTINENT_CENTROIDS['Central America'],
  'South America': CONTINENT_CENTROIDS['South America'],
  Europe: CONTINENT_CENTROIDS.Europe,
};

/**
 * One entry per portfolio project.
 * `place` is a country when specific; otherwise a region/continent centroid.
 */
export const OVERVIEW_PROJECTS = [
  {
    id: 'atlas-ca',
    title: 'Atlas of Central America',
    category: 'research',
    continent: 'Central America',
    place: 'Central America',
    year: 2021,
  },
  {
    id: 'migration',
    title: 'Migration',
    category: 'research',
    continent: 'North America',
    place: 'Mexico',
    year: 2022,
  },
  {
    id: 'cuxtal',
    title: 'Cuxtal',
    category: 'research',
    continent: 'North America',
    place: 'Mexico',
    year: 2023,
  },
  {
    id: 'electoral',
    title: 'Electoral maps',
    category: 'research',
    continent: 'North America',
    place: 'Mexico',
    year: 2023,
  },
  {
    id: 'tourism',
    title: 'Tourism maps',
    category: 'research',
    continent: 'North America',
    place: 'Mexico',
    year: 2023,
  },
  {
    id: 'tourism-plan',
    title: 'Touristic Development Plan',
    category: 'research',
    continent: 'North America',
    place: 'Mexico',
    year: 2024,
  },
  {
    id: 'sierra',
    title: 'Sierra de Guadalupe',
    category: 'print',
    continent: 'North America',
    place: 'Mexico',
    year: 2024,
  },
  {
    id: 'cartohome',
    title: 'CARTOHome',
    category: 'print',
    continent: 'Europe',
    place: 'Germany',
    year: 2025,
  },
  {
    id: 'chernoff',
    title: 'Chernoff Faces Map',
    category: 'print',
    continent: 'Europe',
    place: 'Europe',
    year: 2025,
  },
  {
    id: 'popo',
    title: 'Popocatépetl',
    category: 'print',
    continent: 'North America',
    place: 'Mexico',
    year: 2025,
  },
  {
    id: 'visual-analytics',
    title: 'Visual Analytics, South Tyrol',
    category: 'research',
    continent: 'Europe',
    place: 'Italy',
    year: 2026,
  },
  {
    id: 'wymns',
    title: 'WHAT YOU MUST [NOT] SEE',
    category: 'print',
    continent: 'North America',
    place: 'Mexico',
    year: 2025,
  },
  {
    id: 'lithium',
    title: 'Is Lithium the new Oil?',
    category: 'web',
    continent: 'South America',
    place: 'South America',
    year: 2025,
  },
  {
    id: 'salzpark',
    title: 'Salzpark',
    category: 'web',
    continent: 'Europe',
    place: 'Austria',
    year: 2025,
  },
  {
    id: 'polarized',
    title: 'Is Europe getting polarized',
    category: 'web',
    continent: 'Europe',
    place: 'Europe',
    year: 2025,
  },
  {
    id: 'fear',
    title: 'Fear at home',
    category: 'web',
    continent: 'North America',
    place: 'Mexico',
    year: 2025,
  },
  {
    id: 'panorama-alps',
    title: 'Panorama map in the Alps',
    category: 'print',
    continent: 'Europe',
    place: 'Austria',
    year: 2026,
  },
  {
    id: 'tharandt-hiking',
    title: 'Tharand Hiking map',
    category: 'print',
    continent: 'Europe',
    place: 'Germany',
    year: 2026,
  },
];

function emptyCounts() {
  return { print: 0, research: 0, web: 0 };
}

function makeCluster(id, label, lng, lat, projects) {
  const counts = emptyCounts();
  for (const p of projects) counts[p.category] += 1;
  return {
    id,
    label,
    lng,
    lat,
    projects,
    counts,
    total: projects.length,
  };
}

/**
 * @param {string[]} activeCategories
 * @param {'continent'|'place'} level
 */
export function buildOverviewClusters(
  activeCategories = OVERVIEW_CATEGORIES,
  level = 'continent',
) {
  const active = new Set(activeCategories);
  const groups = new Map();

  for (const project of OVERVIEW_PROJECTS) {
    if (!active.has(project.category)) continue;

    const key = level === 'continent' ? project.continent : project.place;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(project);
  }

  const clusters = [];
  for (const [key, projects] of groups) {
    const coords =
      level === 'continent'
        ? CONTINENT_CENTROIDS[key]
        : PLACE_CENTROIDS[key] || CONTINENT_CENTROIDS[key];
    if (!coords) continue;
    clusters.push(
      makeCluster(
        `${level}:${key}`,
        key,
        coords.lng,
        coords.lat,
        projects,
      ),
    );
  }
  return clusters;
}

/** @deprecated use buildOverviewClusters */
export function buildCountryClusters(activeCategories) {
  return buildOverviewClusters(activeCategories, 'place').map((c) => ({
    ...c,
    country: c.label,
  }));
}

/** Lon/lat bounds covering every place that currently has projects */
export function getOverviewDataBounds(activeCategories = OVERVIEW_CATEGORIES) {
  const nodes = [
    ...buildOverviewClusters(activeCategories, 'continent'),
    ...buildOverviewClusters(activeCategories, 'place'),
  ];
  if (!nodes.length) {
    return [
      [-110, -35],
      [20, 55],
    ];
  }
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const n of nodes) {
    minLng = Math.min(minLng, n.lng);
    minLat = Math.min(minLat, n.lat);
    maxLng = Math.max(maxLng, n.lng);
    maxLat = Math.max(maxLat, n.lat);
  }
  const padLng = Math.max(8, (maxLng - minLng) * 0.18);
  const padLat = Math.max(6, (maxLat - minLat) * 0.18);
  return [
    [minLng - padLng, minLat - padLat],
    [maxLng + padLng, maxLat + padLat],
  ];
}

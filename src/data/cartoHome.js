/**
 * CARTOHome (2025) — globe hub at TU München + country flows + page extracts.
 */

export const CARTO_PALETTE = [
  '#1b2356', // navy
  '#6c7339', // olive
  '#b5bf65', // sage / yellow-green
  '#ebc982', // sand
  '#c95930', // terracotta
];

/** Soft variants for duplicate destinations so arcs feel alive */
const CARTO_PALETTE_SOFT = [
  '#2a3470',
  '#7f8648',
  '#c5ce7a',
  '#f0d59a',
  '#d46e42',
  '#3d4568',
  '#8a9155',
  '#a8b05a',
  '#ddb870',
  '#b84f28',
];

export const MUNICH = {
  id: 'tu-munich',
  label: 'TU München',
  lng: 11.5679,
  lat: 48.1497,
};

/** Country centroids used as flow origins */
export const COUNTRY_COORDS = {
  Russia: { lng: 105.3188, lat: 61.524 },
  Kazakhstan: { lng: 66.9237, lat: 48.0196 },
  Mexico: { lng: -102.5528, lat: 23.6345 },
  Austria: { lng: 14.5501, lat: 47.5162 },
  Italy: { lng: 12.5674, lat: 41.8719 },
  Brazil: { lng: -51.9253, lat: -14.235 },
  Netherlands: { lng: 5.2913, lat: 52.1326 },
  Germany: { lng: 10.4515, lat: 51.1657 },
  Belgium: { lng: 4.4699, lat: 50.5039 },
  Zimbabwe: { lng: 29.1549, lat: -19.0154 },
  USA: { lng: -95.7129, lat: 37.0902 },
  Peru: { lng: -75.0152, lat: -9.19 },
  Spain: { lng: -3.7492, lat: 40.4637 },
  Belize: { lng: -88.4976, lat: 17.1899 },
  Thailand: { lng: 100.9925, lat: 15.87 },
  China: { lng: 104.1954, lat: 35.8617 },
  Slovenia: { lng: 14.9955, lat: 46.1512 },
  Indonesia: { lng: 113.9213, lat: -0.7893 },
  Taiwan: { lng: 120.9605, lat: 23.6978 },
  India: { lng: 78.9629, lat: 20.5937 },
  Ghana: { lng: -1.0232, lat: 7.9465 },
  Ecuador: { lng: -78.1834, lat: -1.8312 },
};

/** One entry per map in the collection (duplicates = multiple arcs) */
export const CARTO_ORIGIN_NAMES = [
  'Russia',
  'Kazakhstan',
  'Mexico',
  'Austria',
  'Italy',
  'Brazil',
  'Netherlands',
  'Russia',
  'Germany',
  'Brazil',
  'Belgium',
  'Zimbabwe',
  'USA',
  'Belgium',
  'Peru',
  'Spain',
  'Belize',
  'Thailand',
  'China',
  'China',
  'Mexico',
  'Slovenia',
  'Indonesia',
  'Taiwan',
  'India',
  'Ghana',
  'Ecuador',
  'Ecuador',
  'Russia',
  'China',
  'China',
];

export const CARTO_MAP_STYLE =
  'mapbox://styles/miguelsolano8555/cmvjqr0a500ki01s25teqejm4';

export const CARTO_PAGES = [1, 3, 20, 21, 34, 35, 42, 43];

export function buildCartoFlows() {
  const counts = {};
  return CARTO_ORIGIN_NAMES.map((name, i) => {
    counts[name] = (counts[name] || 0) + 1;
    const n = counts[name];
    const coords = COUNTRY_COORDS[name];
    const palette = [...CARTO_PALETTE, ...CARTO_PALETTE_SOFT];
    return {
      id: `carto-flow-${i}`,
      country: name,
      pointId: `carto-${name.toLowerCase().replace(/\s+/g, '-')}${n > 1 ? `-${n}` : ''}`,
      from: [coords.lng, coords.lat],
      to: [MUNICH.lng, MUNICH.lat],
      color: palette[i % palette.length],
    };
  });
}

export function uniqueCartoPoints() {
  const seen = new Set();
  const points = [
    {
      id: MUNICH.id,
      label: MUNICH.label,
      lng: MUNICH.lng,
      lat: MUNICH.lat,
      hub: true,
      color: '#ebc982',
    },
  ];
  for (const name of CARTO_ORIGIN_NAMES) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const c = COUNTRY_COORDS[name];
    points.push({
      id: `carto-${key}`,
      label: name,
      lng: c.lng,
      lat: c.lat,
      hub: false,
      color: CARTO_PALETTE[seen.size % CARTO_PALETTE.length],
    });
  }
  return points;
}

/** Great-circle arc with a mid-point bulge for a flowy look on the globe. */
export function arcLine(from, to, steps = 72) {
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const φ1 = (lat1 * Math.PI) / 180;
  const λ1 = (lng1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const λ2 = (lng2 * Math.PI) / 180;

  const cosφ1 = Math.cos(φ1);
  const cosφ2 = Math.cos(φ2);
  const sinφ1 = Math.sin(φ1);
  const sinφ2 = Math.sin(φ2);
  const dλ = λ2 - λ1;
  const cosδ =
    sinφ1 * sinφ2 + cosφ1 * cosφ2 * Math.cos(dλ);
  const δ = Math.acos(Math.min(1, Math.max(-1, cosδ)));

  const coords = [];
  if (δ < 1e-8) {
    coords.push([lng1, lat1], [lng2, lat2]);
    return coords;
  }

  // Perpendicular bulge direction (cross of start/end vectors)
  const x1 = cosφ1 * Math.cos(λ1);
  const y1 = cosφ1 * Math.sin(λ1);
  const z1 = sinφ1;
  const x2 = cosφ2 * Math.cos(λ2);
  const y2 = cosφ2 * Math.sin(λ2);
  const z2 = sinφ2;
  let cx = y1 * z2 - z1 * y2;
  let cy = z1 * x2 - x1 * z2;
  let cz = x1 * y2 - y1 * x2;
  const clen = Math.hypot(cx, cy, cz) || 1;
  cx /= clen;
  cy /= clen;
  cz /= clen;
  const bulge = 0.18 + (δ / Math.PI) * 0.22;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const A = Math.sin((1 - t) * δ) / Math.sin(δ);
    const B = Math.sin(t * δ) / Math.sin(δ);
    let x = A * x1 + B * x2;
    let y = A * y1 + B * y2;
    let z = A * z1 + B * z2;
    const lift = Math.sin(Math.PI * t) * bulge;
    x += cx * lift;
    y += cy * lift;
    z += cz * lift;
    const r = Math.hypot(x, y, z) || 1;
    x /= r;
    y /= r;
    z /= r;
    const lat = (Math.asin(z) * 180) / Math.PI;
    const lng = (Math.atan2(y, x) * 180) / Math.PI;
    coords.push([lng, lat]);
  }
  return coords;
}

export function flowFeatureCollection(flows, progressById = null) {
  return {
    type: 'FeatureCollection',
    features: flows.map((f) => {
      const full = arcLine(f.from, f.to);
      const progress = progressById ? progressById[f.id] ?? 0 : 1;
      const n = Math.max(2, Math.floor(full.length * Math.min(1, Math.max(0, progress))));
      return {
        type: 'Feature',
        properties: {
          id: f.id,
          country: f.country,
          color: f.color,
        },
        geometry: {
          type: 'LineString',
          coordinates: full.slice(0, n),
        },
      };
    }),
  };
}

export function pointsFeatureCollection(points) {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      properties: {
        id: p.id,
        label: p.label,
        hub: p.hub ? 1 : 0,
        color: p.color,
      },
      geometry: {
        type: 'Point',
        coordinates: [p.lng, p.lat],
      },
    })),
  };
}

export const CARTO_FLOWS = buildCartoFlows();
export const CARTO_POINTS = uniqueCartoPoints();

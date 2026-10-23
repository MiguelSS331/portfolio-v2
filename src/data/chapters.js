/** Story years, project points, panels, and year color ramp. */

import {
  CARTO_MAP_STYLE,
  CARTO_PAGES,
  MUNICH,
} from './cartoHome';

export const ACCENT = '#b8442a';

/** Warm → cooler as years advance (projects only). */
export const YEAR_COLORS = {
  2018: ACCENT,
  2021: '#c24a32', // red-orange, close to opening red
  2022: '#d4a07a', // clearer / less saturated
  2023: '#e0b24a', // orange-yellow
  2024: '#a8b83a', // yellowish green
  2025: '#6c7339', // olive / forest green
  2026: '#3b6ea5', // alpine blue
};

export const YEAR_COLORS_MUTED = {
  2018: '#c4a49a',
  2021: '#c9a59a',
  2022: '#d2c0b0',
  2023: '#d9cba0',
  2024: '#c5cba0',
  2025: '#a8ab90',
  2026: '#9bb0c8',
};

const CA_IDS = [
  'belize',
  'guatemala',
  'el-salvador',
  'honduras',
  'nicaragua',
  'costa-rica',
  'panama',
];

export const POINTS = [
  {
    id: 'unam-cu',
    label: 'Ciudad Universitaria',
    year: 2018,
    lng: -99.186,
    lat: 19.332,
    kind: 'education',
    card: {
      image: '/images/grad.jpeg',
      title: 'National Autonomous University of Mexico',
      subtitle: 'Bachelor in Geography (2018 to 2024)',
    },
  },
  // 2021 Atlas of Central America
  { id: 'belize', label: 'Belize', year: 2021, projectId: 'atlas-ca', lng: -88.4976, lat: 17.1899 },
  { id: 'guatemala', label: 'Guatemala', year: 2021, projectId: 'atlas-ca', lng: -90.2308, lat: 15.7835 },
  { id: 'el-salvador', label: 'El Salvador', year: 2021, projectId: 'atlas-ca', lng: -88.8965, lat: 13.7942 },
  { id: 'honduras', label: 'Honduras', year: 2021, projectId: 'atlas-ca', lng: -86.2419, lat: 15.2 },
  { id: 'nicaragua', label: 'Nicaragua', year: 2021, projectId: 'atlas-ca', lng: -85.2072, lat: 12.8654 },
  { id: 'costa-rica', label: 'Costa Rica', year: 2021, projectId: 'atlas-ca', lng: -84.0907, lat: 9.9281 },
  { id: 'panama', label: 'Panama', year: 2021, projectId: 'atlas-ca', lng: -79.5199, lat: 8.9824 },
  // 2022 Migration
  {
    id: 'tijuana',
    label: 'Tijuana',
    year: 2022,
    projectId: 'migration',
    lng: -117.0382,
    lat: 32.5149,
  },
  // 2023 numbered projects
  {
    id: 'merida-cuxtal',
    label: 'Mérida',
    year: 2023,
    projectId: 'cuxtal',
    projectNumber: 1,
    lng: -89.5926,
    lat: 20.9674,
  },
  {
    id: 'mexico-electoral',
    label: 'Central Mexico',
    year: 2023,
    projectId: 'electoral',
    projectNumber: 2,
    lng: -99.1332,
    lat: 22.5,
  },
  {
    id: 'chiapas-tourism',
    label: 'Chiapas',
    year: 2023,
    projectId: 'tourism',
    projectNumber: 3,
    lng: -92.6321,
    lat: 16.7569,
  },
  {
    id: 'tabasco-tourism',
    label: 'Tabasco',
    year: 2023,
    projectId: 'tourism',
    projectNumber: 3,
    lng: -92.6189,
    lat: 17.8409,
  },
  {
    id: 'campeche-tourism',
    label: 'Campeche',
    year: 2023,
    projectId: 'tourism',
    projectNumber: 3,
    lng: -90.5349,
    lat: 19.8301,
  },
  {
    id: 'yucatan-tourism',
    label: 'Yucatán',
    year: 2023,
    projectId: 'tourism',
    projectNumber: 3,
    lng: -89.0943,
    lat: 20.7099,
  },
  {
    id: 'qroo-tourism',
    label: 'Quintana Roo',
    year: 2023,
    projectId: 'tourism',
    projectNumber: 3,
    lng: -88.3030,
    lat: 19.1817,
  },
  // 2024
  {
    id: 'mexico-tourism-plan',
    label: 'Touristic Development Plan',
    year: 2024,
    projectId: 'tourism-plan',
    lng: -99.1332,
    lat: 19.4326,
  },
  {
    id: 'sierra-guadalupe',
    label: 'Sierra de Guadalupe',
    year: 2024,
    projectId: 'sierra',
    lng: -99.095,
    lat: 19.575,
  },
  // 2025
  {
    id: 'tu-munich',
    label: 'TU München',
    year: 2025,
    projectId: 'cartohome',
    lng: MUNICH.lng,
    lat: MUNICH.lat,
  },
  {
    id: 'eu-chernoff',
    label: 'Vienna',
    year: 2025,
    projectId: 'chernoff',
    lng: 16.3738,
    lat: 48.2082,
  },
  {
    id: 'popocatepetl',
    label: 'Popocatépetl',
    year: 2025,
    projectId: 'popo',
    lng: -98.622,
    lat: 19.023,
  },
  {
    id: 'wymns-mexico',
    label: 'Mexico',
    year: 2025,
    projectId: 'wymns',
    lng: -102.55,
    lat: 23.63,
  },
  {
    id: 'schladming-planai',
    label: 'Schladming · Planai',
    year: 2026,
    projectId: 'panorama-alps',
    lng: 13.694,
    lat: 47.386,
  },
  {
    id: 'tharandt',
    label: 'Tharandt',
    year: 2026,
    projectId: 'tharandt-hiking',
    lng: 13.581,
    lat: 50.985,
  },
  {
    id: 'bolzano',
    label: 'Bolzano / Bozen',
    year: 2026,
    projectId: 'visual-analytics',
    lng: 11.3548,
    lat: 46.4983,
  },
];

export const POPO_MAP_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

export const WYMNS_IMAGES = Array.from({ length: 12 }, (_, i) => ({
  id: `wymns-${i + 1}`,
  src: `/images/wymns/wymns-${String(i + 1).padStart(2, '0')}.jpg`,
}));

/** Power BI thesis demos (pre-encoded muted, 2x speed) */
export const VA_VIDEOS = [
  '/videos/web/VA1.mp4',
  '/videos/web/VA2.mp4',
  '/videos/web/VA3.mp4',
];

/** Shared across visual + info chapters so the playlist does not reset */
export const VA_VIDEO_BG = {
  sources: VA_VIDEOS,
};

export const VA_EURAC_IMAGES = [
  { id: 'eurac-1', src: '/images/eurac1.jpeg' },
  { id: 'eurac-2', src: '/images/eurac2.jpg' },
  { id: 'eurac-3', src: '/images/eurac3.jpg' },
  { id: 'eurac-4', src: '/images/eurac4.jpg' },
];

export const VA_DASHBOARD_IMAGES = [
  { id: 'va-1', src: '/images/VA1.png' },
  { id: 'va-2', src: '/images/VA2.png' },
  { id: 'va-2-1', src: '/images/VA2_1.png' },
  { id: 'va-3', src: '/images/VA3.png' },
  { id: 'va-3-1', src: '/images/VA3_1.png' },
  { id: 'va-3-2', src: '/images/VA3_2.png' },
];

const VA_LOGOS = [
  { id: 'eurac', src: '/images/eurac-logo.png', name: 'Eurac Research' },
  {
    id: 'laimburg',
    src: '/images/laimburg-logo.png',
    name: 'Laimburg Research Centre',
  },
  {
    id: 'tum',
    src: '/images/tum-logo.svg',
    name: 'Technical University of Munich',
  },
  {
    id: 'tu-wien',
    src: '/images/tu-wien-logo.webp',
    name: 'TU Wien / Vienna University of Technology',
  },
  {
    id: 'tu-dresden',
    src: '/images/tu-dresden-logo.png',
    name: 'Technische Universität Dresden',
  },
  {
    id: 'itc',
    src: '/images/itc-logo.png',
    name: 'ITC / University of Twente',
  },
];

const VA_DESCRIPTION =
  'As part of the Erasmus Mundus MSc in Cartography, hosted by the Technical University of Munich (TUM), TU Wien (Vienna University of Technology), Technische Universität Dresden, and the Faculty of Geo-Information Science and Earth Observation (ITC) of the University of Twente, the master\'s thesis Developing a Visual Analytics framework for supporting insect pest populations monitoring in South Tyrol was carried out in collaboration with Eurac Research\'s Center for Sensing Solutions and the Entomology department at Laimburg Research Centre. This work delivers a reproducible pipeline for a map-based dashboard that standardizes heterogeneous insect monitoring, climate, and phenological datasets into an integrative data model. The dashboard supports spatial visualization and exploration of pest populations that threaten apple production in South Tyrol. The project follows the FAIR principles and was built in Power BI. A central challenge was managing large, diverse data volumes within an institutional setting so that patterns could be detected and used to inform Integrated Pest Management strategies across the region.';

const VA_PANEL = {
  kind: 'visual-analytics',
  title: 'Visual Analytics to support insect pest populations in South Tyrol',
  date: '2026',
  description: VA_DESCRIPTION,
  logos: VA_LOGOS,
  slides: VA_EURAC_IMAGES.map((img) => ({
    id: img.id,
    src: img.src,
  })),
  afterImages: VA_DASHBOARD_IMAGES,
  footerLogo: {
    src: '/images/cartomaster-logo.png',
    name: 'Cartography MSc',
  },
  cover: '/images/VA1.png',
  pdfReveal: {
    src: '/pdfs/poster-m-solano.pdf',
    title: 'Visual Analytics thesis poster',
    buttonLabel: 'View thesis poster in PDF',
  },
};

/** Shared across visual + info chapters so the slideshow does not reset */
export const WYMNS_SLIDESHOW = {
  images: WYMNS_IMAGES.map((img) => img.src),
  intervalMs: 5000,
};

export const ATLAS_LOGOS = [
  { id: 'igg', src: '/images/IGGgris.png', name: 'Institute of Geography, UNAM' },
  { id: 'unam', src: '/images/unam.png', name: 'National Autonomous University of Mexico' },
  { id: 'ucr', src: '/images/cr.png', name: 'University of Costa Rica' },
];

export const MIGRATION_LOGOS = [
  { id: 'igg', src: '/images/IGGgris.png', name: 'Institute of Geography, UNAM' },
  { id: 'unam', src: '/images/unam.png', name: 'National Autonomous University of Mexico' },
];

export const CUXTAL_LOGOS = [
  { id: 'igg', src: '/images/IGGgris.png', name: 'Institute of Geography, UNAM' },
  { id: 'unam', src: '/images/unam.png', name: 'National Autonomous University of Mexico' },
  { id: 'conacyt', src: '/images/conacyt.png', name: 'CONAHCYT' },
  { id: 'uaslp', src: '/images/uaslp.png', name: 'UASLP' },
];

export const ELECTORAL_LOGOS = [
  { id: 'igg', src: '/images/IGGgris.png', name: 'Institute of Geography, UNAM' },
  { id: 'unam', src: '/images/unam.png', name: 'National Autonomous University of Mexico' },
  { id: 'ine', src: '/images/ine.svg.png', name: 'National Electoral Institute' },
];

export const TOURISM_LOGOS = [
  { id: 'gob', src: '/images/gob.png', name: 'Government of Mexico' },
  { id: 'sectur', src: '/images/sectur.png', name: 'SECTUR' },
];

export const TOURISM_PLAN_LOGOS = [
  { id: 'igg', src: '/images/IGGgris.png', name: 'Institute of Geography, UNAM' },
  { id: 'unam', src: '/images/unam.png', name: 'National Autonomous University of Mexico' },
  { id: 'giz', src: '/images/GIZ.png', name: 'GIZ' },
  { id: 'sectur', src: '/images/sectur.png', name: 'SECTUR' },
];

export const SIERRA_LOGOS = [
  { id: 'corena', src: '/images/corena.png', name: 'CORENADR' },
  { id: 'sedema', src: '/images/sedema.png', name: 'SEDEMA' },
];

/** Custom Mapbox style for Sierra de Guadalupe chapter */
export const SIERRA_MAP_STYLE =
  'mapbox://styles/miguelsolano8555/cmvjpev4x00mk01s5chtf32jn';

export { CARTO_MAP_STYLE };

const atlasAll = CA_IDS;
const atlasGt = ['guatemala'];

export const CHAPTERS = [
  {
    id: 'y2018',
    category: 'education',
    tags: [],
    year: 2018,
    title: 'Mexico City',
    subtitle: 'Where the mapping journey begins',
    camera: {
      // Wide CDMX view; left padding pushes geography right of the cover copy
      center: [-99.13, 19.4],
      zoom: 9.7,
      pitch: 0,
      bearing: 0,
    },
    // Keep the metro readable on the right; free left for portrait + title
    mapPadding: { top: 48, bottom: 64, left: 480, right: 48 },
  },
  {
    id: 'y2021',
    category: 'research',
    tags: ['ArcMap', 'Statistics', 'Geography Institute', 'UNAM'],
    year: 2021,
    title: 'First steps... Maps for Atlas of Central America',
    subtitle: 'Research cartography across the isthmus',
    projectId: 'atlas-ca',
    bounds: [
      [-93.8, 6.5],
      [-76.5, 18.9],
    ],
    boundsPadding: { top: 56, bottom: 56, left: 40, right: 40 },
    panel: {
      kind: 'atlas-central-america',
      title: 'First steps... Maps for Atlas of Central America',
      date: '2021',
      description:
        'Representation of Central America’s geographic characteristics across political, economic, natural, and environmental topics using historical data, World Bank datasets, imagery, and field work.',
      logos: ATLAS_LOGOS,
      slides: [
        { id: 'central1', src: '/images/central1.jpg', blinkIds: atlasAll },
        { id: 'central6', src: '/images/central6.jpeg', blinkIds: atlasAll },
        { id: 'central2', src: '/images/central2.jpeg', blinkIds: atlasAll },
        { id: 'central5', src: '/images/central5.png', blinkIds: atlasAll },
        { id: 'central4', src: '/images/central4.png', blinkIds: atlasGt },
        { id: 'central3', src: '/images/central3.png', blinkIds: atlasGt },
      ],
    },
  },
  {
    id: 'y2022',
    category: 'research',
    tags: ['ArcGIS Pro', 'QGIS', 'Migration', 'Geography Institute'],
    year: 2022,
    title: 'Migration across the Mexican territory during COVID-19',
    subtitle: 'Research Assistant',
    projectId: 'migration',
    bounds: [
      [-118.5, 14.0],
      [-86.0, 33.5],
    ],
    boundsPadding: { top: 48, bottom: 48, left: 36, right: 36 },
    panel: {
      kind: 'migration-covid',
      title: 'Migration across the Mexican territory during COVID-19. Research Assistant',
      date: '2022',
      description:
        'The project summarizes migration statistics at Mexico’s borders during the COVID-19 period as part of “Central American Migration in Transit through Mexico and Reconfigurations of the Southern Border,” led by Dr. Guillermo Castillo Ramírez at UNAM’s Institute of Geography.',
      logos: MIGRATION_LOGOS,
      slides: [
        { id: 'mig1', src: '/images/mig1.jpg', blinkIds: ['tijuana'] },
        { id: 'mig2', src: '/images/mig2.jpg', blinkIds: ['tijuana'] },
        { id: 'mig3', src: '/images/mig3.jpg', blinkIds: ['tijuana'] },
        { id: 'mig4', src: '/images/mig4.jpg', blinkIds: ['tijuana'] },
        { id: 'mig5', src: '/images/mig5.jpg', blinkIds: ['tijuana'] },
        { id: 'mig6', src: '/images/mig6.jpg', blinkIds: ['tijuana'] },
      ],
    },
  },
  {
    id: 'y2023-cuxtal',
    category: 'research',
    tags: ['ArcMap', 'Atlas', 'Geography Institute', 'GEOMAPSA', 'CONAHCYT', 'UASLP', 'ENES León'],
    year: 2023,
    title: 'Atlas of the Cuxtal Natural Protected Area (Yucatán)',
    subtitle: 'Protected-area atlas for Mérida',
    projectId: 'cuxtal',
    projectNumber: 1,
    camera: {
      center: [-89.5926, 20.9674],
      zoom: 8.2,
      pitch: 0,
      bearing: 0,
    },
    panel: {
      kind: 'cuxtal-atlas',
      title: 'Atlas of the Cuxtal Natural Protected Area (Yucatán)',
      date: '2023',
      description:
        'Atlas highlighting the relevance of the Cuxtal NPA for Mérida’s metropolitan area and its environmental services. Five demographic maps based on INEGI 2020 census.',
      logos: CUXTAL_LOGOS,
      slides: [
        { id: 'cuxtal1', src: '/images/cuxtal1.jpg', blinkIds: ['merida-cuxtal'] },
        { id: 'cuxtal2', src: '/images/cuxtal2.jpg', blinkIds: ['merida-cuxtal'] },
        { id: 'cuxtal3', src: '/images/cuxtal3.jpg', blinkIds: ['merida-cuxtal'] },
        { id: 'cuxtal4', src: '/images/cuxtal4.jpg', blinkIds: ['merida-cuxtal'] },
        { id: 'cuxtal5', src: '/images/cuxtal5.jpg', blinkIds: ['merida-cuxtal'] },
      ],
    },
  },
  {
    id: 'y2023-electoral',
    category: 'research',
    tags: ['ArcGIS Pro', 'INE', 'National Electoral Institute', 'Geography Institute', 'UNAM'],
    year: 2023,
    title: 'Electoral Redistricting Consultation',
    subtitle: 'Indigenous and Afro-Mexican demographics',
    projectId: 'electoral',
    projectNumber: 2,
    camera: {
      center: [-99.1332, 22.5],
      zoom: 5.2,
      pitch: 0,
      bearing: 0,
    },
    panel: {
      kind: 'electoral-redistricting',
      title: 'Electoral Redistricting Consultation',
      date: '2023',
      description:
        '71 demographic maps on Indigenous and Afro-Mexican populations supporting legal reports and recommendations to strengthen consultation mechanisms at the state level led by the INE.',
      logos: ELECTORAL_LOGOS,
      slides: [
        { id: 'ine1', src: '/images/ine1.jpg', blinkIds: ['mexico-electoral'] },
        { id: 'ine2', src: '/images/ine2.jpg', blinkIds: ['mexico-electoral'] },
        { id: 'ine3', src: '/images/ine3.jpg', blinkIds: ['mexico-electoral'] },
        { id: 'ine4', src: '/images/ine4.jpg', blinkIds: ['mexico-electoral'] },
        { id: 'ine5', src: '/images/ine5.jpg', blinkIds: ['mexico-electoral'] },
        { id: 'ine6', src: '/images/ine6.jpg', blinkIds: ['mexico-electoral'] },
        { id: 'ine7', src: '/images/ine7.jpg', blinkIds: ['mexico-electoral'] },
        { id: 'ine8', src: '/images/ine8.jpg', blinkIds: ['mexico-electoral'] },
        { id: 'ine9', src: '/images/ine9.jpg', blinkIds: ['mexico-electoral'] },
      ],
    },
  },
  {
    id: 'y2023-tourism',
    category: 'research',
    tags: ['Tourism', 'SECTUR', 'Tren Maya', 'Archeological Sites', 'Infrastructure'],
    year: 2023,
    title: 'Tourism and Cultural Heritage. Government of Mexico',
    subtitle: 'Southeast Mexico heritage map',
    projectId: 'tourism',
    projectNumber: 3,
    bounds: [
      [-94.2, 14.8],
      [-86.5, 22.0],
    ],
    boundsPadding: { top: 48, bottom: 48, left: 36, right: 36 },
    panel: {
      kind: 'tourism-heritage',
      title: 'Tourism and Cultural Heritage. Government of Mexico',
      date: '2023',
      description:
        'Mexico’s cultural and natural heritage visualized through an integrated tourism map. Accessible, data-rich, and designed for sustainable tourism.',
      logos: TOURISM_LOGOS,
      slides: [
        { id: 'tur1', src: '/images/tur1.jpg', blinkIds: ['chiapas-tourism', 'tabasco-tourism', 'campeche-tourism', 'yucatan-tourism', 'qroo-tourism'] },
        { id: 'tur2', src: '/images/tur2.jpg', blinkIds: ['chiapas-tourism', 'tabasco-tourism', 'campeche-tourism', 'yucatan-tourism', 'qroo-tourism'] },
        { id: 'tur3', src: '/images/tur3.jpg', blinkIds: ['chiapas-tourism', 'tabasco-tourism', 'campeche-tourism', 'yucatan-tourism', 'qroo-tourism'] },
        { id: 'tur4', src: '/images/tur4.png', blinkIds: ['chiapas-tourism', 'tabasco-tourism', 'campeche-tourism', 'yucatan-tourism', 'qroo-tourism'] },
        { id: 'tur5', src: '/images/tur5.jpg', blinkIds: ['chiapas-tourism', 'tabasco-tourism', 'campeche-tourism', 'yucatan-tourism', 'qroo-tourism'] },
        { id: 'tur6', src: '/images/tur6.jpg', blinkIds: ['chiapas-tourism', 'tabasco-tourism', 'campeche-tourism', 'yucatan-tourism', 'qroo-tourism'] },
      ],
    },
  },
  {
    id: 'y2024-tourism-plan',
    category: 'research',
    tags: ['Tourism', 'QGIS', 'GIZ', 'Geography Institute'],
    year: 2024,
    title: 'Update for the Touristic Development Plan. Government of Mexico',
    subtitle: 'Spatial suitability for tourism',
    projectId: 'tourism-plan',
    panel: {
      kind: 'tourism-development-plan',
      title: 'Update for the Touristic Development Plan. Government of Mexico',
      date: 'May 2024',
      description:
        'Technical diagnosis of the suitability of a tourist site through spatial and socio-economic analysis. Collaboration among SECTUR, UNAM’s Institute of Geography, and GIZ. Includes 26 thematic maps and multi-criteria evaluations.',
      logos: TOURISM_PLAN_LOGOS,
      slides: [
        { id: 'giz1', src: '/images/giz1.png', blinkIds: ['mexico-tourism-plan'] },
        { id: 'giz2', src: '/images/giz2.png', blinkIds: ['mexico-tourism-plan'] },
        { id: 'giz3', src: '/images/giz3.png', blinkIds: ['mexico-tourism-plan'] },
        { id: 'giz4', src: '/images/giz4.png', blinkIds: ['mexico-tourism-plan'] },
      ],
    },
  },
  {
    id: 'y2024-sierra',
    category: 'print',
    tags: ['Protected Areas', 'Environmental Education', 'Planning'],
    year: 2024,
    title: 'Maps for the Natural Protected Area: Sierra de Guadalupe. Government of Mexico',
    subtitle: 'Protected-area cartography, Mexico City',
    projectId: 'sierra',
    mapStyle: SIERRA_MAP_STYLE,
    orbit: true,
    hidePoints: true,
    lockCamera: true,
    camera: {
      center: [-99.095, 19.575],
      zoom: 12.2,
      pitch: 58,
      bearing: 0,
    },
    panel: {
      kind: 'sierra-guadalupe',
      title: 'Maps for the Natural Protected Area: Sierra de Guadalupe. Government of Mexico',
      date: 'January 2024',
      description:
        'A set of maps produced for education, official documents, activity planning, and exhibitions. The same territory, tailored into different visual solutions depending on audience and goals.',
      logos: SIERRA_LOGOS,
      pdf: {
        src: '/pdfs/sierradeguadalupe.pdf',
        title: 'Map for exhibition at Metro La Raza',
      },
      slides: [
        {
          id: 'sierra-pdf',
          type: 'pdf',
          src: '/images/sierra-pdf-preview.jpg',
          pdfSrc: '/pdfs/sierradeguadalupe.pdf#zoom=page-width',
          blinkIds: ['sierra-guadalupe'],
        },
        { id: 'se1', src: '/images/se1.jpeg', blinkIds: ['sierra-guadalupe'] },
        { id: 'se2', src: '/images/se2.jpeg', blinkIds: ['sierra-guadalupe'] },
        { id: 'se3', src: '/images/se3.jpeg', blinkIds: ['sierra-guadalupe'] },
        { id: 'se4', src: '/images/se4.jpeg', blinkIds: ['sierra-guadalupe'] },
        { id: 'sierr1', src: '/images/sierr1.jpg', blinkIds: ['sierra-guadalupe'] },
        { id: 'sierr2', src: '/images/sierr2.jpg', blinkIds: ['sierra-guadalupe'] },
        { id: 'sierr3', src: '/images/sierr3.png', blinkIds: ['sierra-guadalupe'] },
      ],
    },
  },
  {
    id: 'y2025-cartohome',
    category: 'print',
    tags: ['InDesign', 'Illustrator', 'Atlas', 'Cartography MSc', 'Illustration'],
    year: 2025,
    title: 'CARTOHome',
    subtitle: 'Cultural maps of home at TU München',
    projectId: 'cartohome',
    mapStyle: CARTO_MAP_STYLE,
    globe: true,
    flows: true,
    orbit: true,
    hidePoints: true,
    lockCamera: true,
    camera: {
      center: [MUNICH.lng, MUNICH.lat],
      zoom: 1.35,
      pitch: 12,
      bearing: -20,
    },
    panel: {
      kind: 'cartohome',
      title: 'CARTOHome',
      date: 'February 2025',
      description:
        'CartoHome explores cultural diversity and the idea of “home” through map-making. With 23 maps and 254+ icons, it highlights personal and cultural stories rather than tourist landmarks.',
      logos: [],
      pdfReveal: {
        src: '/pdfs/cartohome.pdf',
        title: 'CARTOHome full collection',
        buttonLabel: 'View full collection in PDF',
      },
      slides: CARTO_PAGES.map((page) => ({
        id: `carto-p${page}`,
        src: `/images/cartohome/page-${String(page).padStart(2, '0')}.jpg`,
        blinkIds: ['tu-munich'],
      })),
    },
  },
  {
    id: 'y2025-chernoff',
    category: 'print',
    tags: ['Chernoff Faces', 'Inequality', 'Life Satisfaction', 'Atlas of Sustainability', 'Map Design Challenge', 'TU WIEN'],
    year: 2025,
    title: 'Where is life better in the EU? Chernoff Faces Map',
    subtitle: 'Inequality & life satisfaction across Europe',
    projectId: 'chernoff',
    hidePoints: false,
    lockCamera: true,
    camera: {
      center: [16.3738, 48.2082],
      zoom: 11.2,
      pitch: 0,
      bearing: 0,
    },
    panel: {
      kind: 'chernoff',
      title: 'Where is life better in the EU? Chernoff Faces Map',
      date: 'June 2025',
      description:
        'An alternative view on inequality and life satisfaction across the EU. Chernoff faces merge multiple variables into a familiar icon, enabling rapid, intuitive comparison of territorial patterns. Created for the Map Design Challenge (TU Wien + University of Wisconsin Madison) and included in the Atlas of Sustainability under SDG 10 (Reduced Inequalities).',
      logos: [],
      pdfReveal: {
        src: '/pdfs/atlas.pdf',
        title: 'Atlas of Sustainability',
        buttonLabel: 'View full atlas in PDF',
      },
      slides: [
        { id: 'chernoff-map', src: '/images/chernoff.jpg', blinkIds: ['eu-chernoff'] },
      ],
    },
  },
  {
    id: 'y2025-popo',
    category: 'print',
    tags: ['Volcanic Hazard', 'Mexico', 'Journalistic Cartography'],
    year: 2025,
    title: 'Journalistic map: Hazard by Popocatépetl Volcano',
    subtitle: 'Volcanic hazard, central Mexico',
    projectId: 'popo',
    mapStyle: POPO_MAP_STYLE,
    terrain: true,
    orbit: true,
    hidePoints: true,
    lockCamera: true,
    camera: {
      center: [-98.622, 19.023],
      zoom: 12.1,
      pitch: 68,
      bearing: -30,
    },
    panel: {
      kind: 'popo-hazard',
      title: 'Journalistic map: Hazard by Popocatépetl Volcano',
      date: 'June 2025',
      description:
        'Clear delineation of high-risk areas around Popocatépetl. A warm palette serves as a visual alert, guiding attention to what matters most: understanding the threat to improve prevention and response.',
      logos: [],
      slides: [
        { id: 'popo-map', src: '/images/popo.jpg', blinkIds: ['popocatepetl'] },
      ],
    },
  },
  {
    id: 'y2025-wymns-visual',
    category: 'print',
    tags: ['Adobe Illustrator', 'Adobe Fresco', 'Adobe Photoshop', 'ArcGIS Pro', 'Print', 'Interactive'],
    year: 2025,
    title: 'WHAT YOU MUST [NOT] SEE',
    subtitle: 'Violence and enforced disappearances in Mexico',
    projectId: 'wymns',
    hideMap: true,
    hidePoints: true,
    backgroundSlideshow: WYMNS_SLIDESHOW,
  },
  {
    id: 'y2025-wymns-info',
    category: 'print',
    tags: ['Adobe Illustrator', 'Adobe Fresco', 'Adobe Photoshop', 'ArcGIS Pro', 'Print', 'Interactive'],
    year: 2025,
    title: 'WHAT YOU MUST [NOT] SEE',
    subtitle: 'Violence and enforced disappearances in Mexico',
    projectId: 'wymns',
    hideMap: true,
    hidePoints: true,
    backgroundSlideshow: WYMNS_SLIDESHOW,
    panel: {
      kind: 'wymns',
      title: 'WHAT YOU MUST [NOT] SEE',
      date: 'July 2025',
      description:
        'A thematic map about violence and enforced disappearances in Mexico. A bold, journalistic visual language with interchangeable layers connects memory, data, and territory in a powerful narrative.',
      logos: [],
      pdfReveal: {
        src: '/pdfs/wymns.pdf',
        title: 'WHAT YOU MUST [NOT] SEE full PDF',
        buttonLabel: 'View full map in PDF',
      },
      slides: WYMNS_IMAGES.map((img) => ({
        id: img.id,
        src: img.src,
        blinkIds: ['wymns-mexico'],
      })),
      cover: '/images/wymns/wymns-08.jpg',
    },
  },
  {
    id: 'y2025-lithium',
    category: 'web',
    tags: ['ArcGIS Online', 'Storymap', 'Javascript', 'TUM', 'React'],
    year: 2025,
    title: 'Is Lithium the new Oil? The cost of the green transition',
    subtitle: 'Lithium Triangle interactive story map',
    projectId: 'lithium',
    hideMap: true,
    hidePoints: true,
    webEmbed: {
      src: 'https://govtech-website.vercel.app',
      externalUrl: 'https://govtech-website.vercel.app',
      poster: '/images/web-lithium.jpg',
      title: 'Is Lithium the new Oil?',
    },
  },
  {
    id: 'y2025-salzpark',
    category: 'web',
    tags: ['Mapbox', 'Open Street Maps', 'QGIS', 'Javascript'],
    year: 2025,
    title: 'Salzpark',
    subtitle: 'On-street parking in Salzburg',
    projectId: 'salzpark',
    hideMap: true,
    hidePoints: true,
    webEmbed: {
      src: 'https://parking-ecru-iota.vercel.app',
      externalUrl: 'https://parking-ecru-iota.vercel.app',
      poster: '/images/web-salzpark.jpg',
      title: 'Salzpark',
    },
  },
  {
    id: 'y2025-polarized',
    category: 'web',
    tags: ['Javascript', 'Mapbox', 'Politics', 'Europe'],
    year: 2025,
    title: 'Is Europe getting polarized',
    subtitle: 'Political ideologies in Central Europe',
    projectId: 'polarized',
    hideMap: true,
    hidePoints: true,
    webEmbed: {
      src: 'https://switching-sides-five.vercel.app',
      externalUrl: 'https://switching-sides-five.vercel.app',
      poster: '/images/web-polarized.jpg',
      title: 'Is Europe getting polarized',
    },
  },
  {
    id: 'y2025-fear',
    category: 'web',
    tags: ['Mapbox', 'Story Map', 'Violence'],
    year: 2025,
    title: 'Fear at home',
    subtitle: 'Violence and political narratives in Mexico',
    projectId: 'fear',
    hideMap: true,
    hidePoints: true,
    webEmbed: {
      src: 'https://mapping-steps.vercel.app',
      externalUrl: 'https://mapping-steps.vercel.app',
      poster: '/images/web-fear.jpg',
      title: 'Fear at home',
    },
  },
  {
    id: 'y2026-panorama',
    category: 'print',
    tags: [
      'Blender GIS',
      'QGIS',
      'Open Street Maps',
      'Open Topography',
      'Affinity',
    ],
    authors: [
      'Miguel Solano',
      'Anna Shelegina',
      'Artur Kislitsyn',
      'Pedro Bonilla',
    ],
    year: 2026,
    title:
      'Panorama map in the Alps, Schladming and Planai “Tourism of the Future”',
    subtitle: 'A futuristic alpine viewpoint map',
    projectId: 'panorama-alps',
    mapStyle: POPO_MAP_STYLE,
    terrain: true,
    orbit: true,
    hidePoints: true,
    lockCamera: true,
    camera: {
      center: [13.694, 47.386],
      zoom: 12.4,
      pitch: 68,
      bearing: -40,
    },
    panel: {
      kind: 'panorama-alps',
      title:
        'Panorama map in the Alps, Schladming and Planai “Tourism of the Future”',
      date: '2026',
      description:
        'We began with fieldwork in Schladming and Planai: Anna Shelegina, Artur Kislitsyn, and I exploring the site to locate and document the viewpoint. Pedro Bonilla Artigas then proposed a dark, futuristic aesthetic inspired by Tron: unexpected, striking, and a natural fit for “tourism of the future.” Together we shaped the concept and carried it through to a finished panorama map. Terrain and place data came from OpenStreetMap and OpenTopography via BlenderGIS; the final layout and graphic design were completed in Affinity.',
      logos: [],
      slides: [
        {
          id: 'pano-map',
          src: '/images/panorama-map.jpg',
          blinkIds: ['schladming-planai'],
        },
        {
          id: 'pano-field1',
          src: '/images/pano_field1.jpeg',
          blinkIds: ['schladming-planai'],
        },
        {
          id: 'pano-field2',
          src: '/images/pano_field2.jpeg',
          blinkIds: ['schladming-planai'],
        },
        {
          id: 'pano-field3',
          src: '/images/pano_field3.jpeg',
          blinkIds: ['schladming-planai'],
        },
      ],
    },
  },
  {
    id: 'y2026-tharandt',
    category: 'print',
    tags: ['QGIS', 'Open Street Maps', 'Topography', 'Hiking map', 'Affinity'],
    year: 2026,
    title: 'Tharand Hiking map',
    subtitle: 'Topographic hiking map · Tharandt',
    projectId: 'tharandt-hiking',
    mapStyle: POPO_MAP_STYLE,
    terrain: true,
    orbit: true,
    hidePoints: true,
    lockCamera: true,
    camera: {
      center: [13.581, 50.985],
      zoom: 12.6,
      pitch: 62,
      bearing: 25,
    },
    panel: {
      kind: 'tharandt-hiking',
      title: 'Tharand Hiking map',
      date: '2026',
      description:
        'Developed for the Cartography MSc course Topographic Map Production. Base data came from Geofabrik; the map style was built in QGIS and the cover design in Affinity. The palette draws on historic Dresden city maps, paired with the editorial language of alpine topographic sheets. The map is currently presented at the Geoinformation Department of TU Dresden.',
      logos: [],
      pdfReveal: {
        src: '/pdfs/tharandt-hiking.pdf',
        title: 'Tharand Hiking map full PDF',
        buttonLabel: 'View full map in PDF',
      },
      slides: [
        {
          id: 'tharandt-map',
          type: 'pdf',
          src: '/images/tharandt-hiking.jpg',
          pdfSrc: '/pdfs/tharandt-hiking.pdf#zoom=page-width',
          blinkIds: ['tharandt'],
        },
        {
          id: 'topo-1',
          src: '/images/topo_1.jpg',
          blinkIds: ['tharandt'],
        },
        {
          id: 'topo-2',
          src: '/images/topo_2.jpg',
          blinkIds: ['tharandt'],
        },
        {
          id: 'topo-3',
          src: '/images/topo_3.jpg',
          blinkIds: ['tharandt'],
        },
        {
          id: 'topo-4',
          src: '/images/tharandt-topo-4.jpg',
          blinkIds: ['tharandt'],
        },
        {
          id: 'topo-5',
          src: '/images/tharandt-topo-5.jpg',
          blinkIds: ['tharandt'],
        },
      ],
    },
  },
  {
    id: 'y2026-va-visual',
    category: 'research',
    tags: [
      'PowerBI',
      'PostgreSQL',
      'FAIR principles',
      'South Tyrol',
      'Bolzano',
    ],
    year: 2026,
    title: 'Visual Analytics to support insect pest populations in South Tyrol',
    subtitle: 'Master thesis / Power BI dashboard, South Tyrol',
    projectId: 'visual-analytics',
    hideMap: true,
    hidePoints: true,
    backgroundVideos: VA_VIDEO_BG,
  },
  {
    id: 'y2026-va-info',
    category: 'research',
    tags: [
      'PowerBI',
      'PostgreSQL',
      'FAIR principles',
      'South Tyrol',
      'Bolzano',
    ],
    year: 2026,
    title: 'Visual Analytics to support insect pest populations in South Tyrol',
    subtitle: 'Master thesis / Power BI dashboard, South Tyrol',
    projectId: 'visual-analytics',
    hideMap: true,
    hidePoints: true,
    backgroundVideos: VA_VIDEO_BG,
    panel: VA_PANEL,
  },
  {
    id: 'about',
    category: 'education',
    year: 2026,
    title: 'About me',
    subtitle: '',
    aboutMe: true,
    hideMap: true,
    hidePoints: true,
  },
];

export const TIMELINE_START = 2018;
export const TIMELINE_END = new Date().getFullYear();

/**
 * Visible map points for a story year.
 * Education (UNAM) only in 2018. From 2021 onward, project points accumulate; CU never returns.
 */
export function pointsForStoryYear(year) {
  if (year <= 2018) {
    return POINTS.filter((p) => p.kind === 'education');
  }
  return POINTS.filter((p) => p.year >= 2021 && p.year <= year);
}

export function getPointById(id) {
  return POINTS.find((p) => p.id === id) ?? null;
}

/**
 * Lon/lat bounds that grow with every visible project point.
 * Returns null for empty / single-point sets (use camera instead).
 */
export function boundsForPoints(points, pad = 2.8) {
  if (!points?.length) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const p of points) {
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
  }

  // Single point: caller should easeTo camera
  if (Math.abs(maxLng - minLng) < 0.05 && Math.abs(maxLat - minLat) < 0.05) {
    return null;
  }

  // Extra west pad so Baja California clears title/veil and stays in frame
  const westPad = Math.max(pad, 6.5);
  const eastPad = pad;
  const latPad = pad;

  return [
    [minLng - westPad, minLat - latPad],
    [maxLng + eastPad, maxLat + latPad],
  ];
}

/** Color for a timeline year (projects use YEAR_COLORS; others muted ink). */
export function colorForYear(year) {
  return YEAR_COLORS[year] ?? '#9a9590';
}

export function pointsToGeoJSON(points, { activeYear, blinkIds = [] } = {}) {
  const blink = new Set(blinkIds);
  return {
    type: 'FeatureCollection',
    features: points.map((p) => {
      const isActiveYear = p.year === activeYear;
      const vivid = YEAR_COLORS[p.year] ?? ACCENT;
      const muted = YEAR_COLORS_MUTED[p.year] ?? '#cbb';
      return {
        type: 'Feature',
        properties: {
          id: p.id,
          label: p.label,
          year: p.year,
          projectId: p.projectId ?? '',
          projectNumber: p.projectNumber ?? 0,
          numberLabel: p.projectNumber ? String(p.projectNumber) : '',
          hasCard: Boolean(p.card),
          isActiveYear: isActiveYear ? 1 : 0,
          blink: blink.has(p.id) ? 1 : 0,
          color: isActiveYear ? vivid : muted,
        },
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat],
        },
      };
    }),
  };
}

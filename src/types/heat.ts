export type RiskCategory = 'Lower' | 'Moderate' | 'Elevated' | 'High';
export type DataQuality = 'High' | 'Medium' | 'Sensor Gap / Flagged';

export interface ContributingFactor {
  factor: string;
  impact: 'High' | 'Moderate' | 'Low';
  description: string;
  relativeWeight: number;
}

export interface NeighborhoodRecord {
  id: string;
  name: string;
  code: string;
  studyArea: 'Demo Metro Core' | 'Valley Regional Basin';
  // Central coordinates for pins/flyTo
  lat: number;
  lng: number;
  // Boundary polygon [lat, lng][]
  polygon: [number, number][];
  // Environmental indicators
  airTemperature: number; // Celsius (e.g. 33.5 - 41.2)
  relativeHumidity: number; // Percentage (e.g. 38 - 72%)
  landSurfaceTemperature: number; // Celsius satellite reading (e.g. 38.0 - 52.4)
  vegetationIndex: number; // NDVI 0.00 - 1.00 (e.g. 0.08 concrete to 0.65 parks)
  builtEnvironmentRatio: number; // % Impervious surface 0-100
  vulnerabilityIndex: number; // SVI index 0-100
  wetBulbGlobeTemp: number; // Heat stress index in Celsius
  // Computed risk metrics
  estimatedScore: number; // 0 - 100
  estimatedCategory: RiskCategory;
  dataQuality: DataQuality;
  timestamp: string;
  populationEstimate: number;
  seniorPopRatio: number; // % 65+
  treeCanopyGapPercent: number; // 100 - (vegetationIndex * 100)
  contributingFactors: ContributingFactor[];
  suggestedActionHeadline: string;
}

export interface RiskWeights {
  airTemp: number;
  humidity: number;
  surfaceTemp: number;
  builtEnvironment: number;
  vegetationGap: number;
  vulnerability: number;
}

export interface DataSourceInfo {
  id: string;
  name: string;
  provider: string;
  cadence: string;
  resolution: string;
  status: 'Connected' | 'Sample data' | 'Not connected';
  description: string;
  referenceUrl: string;
  metrics: string[];
  coveragePercent: number;
  lastSync: string;
}

export interface ReviewTask {
  id: string;
  neighborhoodId: string;
  neighborhoodName: string;
  category: RiskCategory;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTeam: string;
}

export interface HeatAlertNotification {
  id: string;
  title: string;
  neighborhood: string;
  category: RiskCategory;
  timeAgo: string;
  read: boolean;
  message: string;
}

export interface RealWeatherData {
  temperature: number; // in Celsius
  relativeHumidity: number; // %
  timestamp: string; // ISO string from API
  retrievedAt: string; // local time string
  latitude: number; // actual API request coordinate
  longitude: number; // actual API request coordinate
  elevation?: number;
  provider: string; // "Open-Meteo Free Weather API"
  attribution: string; // "Weather data by Open-Meteo.com"
}

export interface RealWeatherState {
  data: RealWeatherData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface RealAirQualityData {
  pm2_5: number | null; // PM2.5 in μg/m³; null means unavailable
  pm10: number | null; // PM10 in μg/m³; null means unavailable
  ozone: number | null; // Ozone O3 in μg/m³
  europeanAqi: number | null; // EAQI scale
  usAqi: number | null; // US AQI scale
  timestamp: string; // ISO string from API
  retrievedAt: string; // local time string
  latitude: number; // API request coordinate
  longitude: number; // API request coordinate
  provider: string; // "Open-Meteo Air Quality API"
  attribution: string; // "Air quality data by Open-Meteo.com"
}

export interface GeocodedLocation {
  id: string;
  displayName: string;
  lat: number;
  lng: number;
  source: 'OpenStreetMap Nominatim';
}

export interface RealAirQualityState {
  data: RealAirQualityData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface RealLSTData {
  temperatureCelsius: number;
  rawLSTDigitalNumber?: number;
  scaleFactor?: number;
  diagnostics?: {
    imageCount: number;
    selectedImageDate: string;
    validPixelCountBeforeQualityMask: number;
    validPixelCountAfterQualityMask: number;
    sampledPixelValue: number;
    sampledRawLSTValue: number;
    sampledQualityValue: number;
  };
  observationStart: string;
  observationEnd: string;
  source: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  spatial?: {
    ndvi: number | null;
    builtEnvironmentRatio: number | null;
    population: number | null;
    ndviObservationDate: string | null;
    builtObservationDate: string | null;
    populationObservationDate: string | null;
    sources: {
      ndvi: string;
      builtEnvironment: string;
      population: string;
    };
  };
}

export interface OsmGeographicFeature {
  id: string | number;
  name: string;
  category: 'park' | 'water' | 'cooling_amenity' | 'transit_hub';
  lat: number;
  lng: number;
  tags?: Record<string, string>;
  source: string;
}

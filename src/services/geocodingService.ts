import { GeocodedLocation } from '../types/heat';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<GeocodedLocation[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: 'jsonv2',
    limit: '5',
    addressdetails: '1',
  });
  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`OpenStreetMap Nominatim returned HTTP status ${response.status}.`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid geocoding response received from OpenStreetMap Nominatim.');
  }

  return data
    .filter((item) => typeof item.lat === 'string' && typeof item.lon === 'string' && item.display_name)
    .map((item) => ({
      id: String(item.place_id),
      displayName: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      source: 'OpenStreetMap Nominatim' as const,
    }));
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedLocation> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'jsonv2',
    addressdetails: '1',
  });
  const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`OpenStreetMap reverse geocoding returned HTTP status ${response.status}.`);
  }
  const data = await response.json();
  return {
    id: `current-${lat.toFixed(6)}-${lng.toFixed(6)}`,
    displayName: typeof data.display_name === 'string' ? data.display_name : `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    lat,
    lng,
    source: 'OpenStreetMap Nominatim',
  };
}

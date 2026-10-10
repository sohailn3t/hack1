import { RealLSTData } from '../types/heat';

export async function fetchRealLST(lat: number, lng: number): Promise<RealLSTData> {
  const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL as string | undefined;
  const endpoint = convexSiteUrl ? `${convexSiteUrl}/api/lst` : '/api/lst';
  const response = await fetch(`${endpoint}?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || `Satellite LST request failed (${response.status}).`);
  }
  if (
    typeof payload.temperatureCelsius !== 'number' ||
    !Number.isFinite(payload.temperatureCelsius) ||
    typeof payload.observationStart !== 'string' ||
    typeof payload.observationEnd !== 'string'
  ) {
    throw new Error('Satellite LST response was incomplete or invalid.');
  }
  return payload as RealLSTData;
}

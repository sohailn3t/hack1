import { RealAirQualityData } from '../types/heat';

/**
 * Service to fetch real, free air quality data from Open-Meteo Air Quality API.
 * Docs: https://open-meteo.com/en/docs/air-quality-api
 * 
 * Ingests: PM2.5, PM10, Ozone (O3), European AQI, and US AQI.
 * Free non-commercial access with attribution.
 */
export async function fetchRealAirQuality(lat: number, lng: number): Promise<RealAirQualityData> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=pm10,pm2_5,ozone,european_aqi,us_aqi`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo Air Quality API returned HTTP status ${response.status} (${response.statusText})`);
    }

    const data = await response.json();

    if (!data.current) {
      throw new Error('Invalid or incomplete air quality data received from Open-Meteo.');
    }

    const current = data.current;

    return {
      pm2_5: typeof current.pm2_5 === 'number' ? current.pm2_5 : null,
      pm10: typeof current.pm10 === 'number' ? current.pm10 : null,
      ozone: typeof current.ozone === 'number' ? current.ozone : null,
      europeanAqi: typeof current.european_aqi === 'number' ? current.european_aqi : null,
      usAqi: typeof current.us_aqi === 'number' ? current.us_aqi : null,
      timestamp: current.time || new Date().toISOString(),
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      latitude: data.latitude,
      longitude: data.longitude,
      provider: 'Open-Meteo Air Quality API',
      attribution: 'Air quality data by Open-Meteo.com',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request to Open-Meteo Air Quality API timed out after 10 seconds.');
    }
    throw new Error(err.message || 'Failed to fetch air quality data from Open-Meteo.');
  }
}

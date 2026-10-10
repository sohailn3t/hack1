import { RealWeatherData } from '../types/heat';

/**
 * Service to fetch real, free weather data from the Open-Meteo API.
 * Docs: https://open-meteo.com/en/docs
 * 
 * Free for non-commercial use with attribution.
 * No API key or authentication required.
 */
export async function fetchRealWeather(lat: number, lng: number): Promise<RealWeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m`;

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
      throw new Error(`Open-Meteo API returned HTTP status ${response.status} (${response.statusText})`);
    }

    const data = await response.json();

    if (!data.current || typeof data.current.temperature_2m !== 'number') {
      throw new Error('Invalid or incomplete weather data received from Open-Meteo.');
    }

    return {
      temperature: data.current.temperature_2m,
      relativeHumidity: data.current.relative_humidity_2m,
      timestamp: data.current.time,
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      latitude: data.latitude,
      longitude: data.longitude,
      elevation: data.elevation,
      provider: 'Open-Meteo Free Weather API',
      attribution: 'Weather data by Open-Meteo.com',
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request to Open-Meteo API timed out after 10 seconds. Please check your network connection.');
    }
    throw new Error(err.message || 'Failed to fetch weather data from Open-Meteo.');
  }
}

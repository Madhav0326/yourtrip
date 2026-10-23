import { WeatherProvider, WeatherData } from '@/lib/providers/types';
import { ProvenanceValue } from '@/types/trip';

/**
 * Open-Meteo Weather Provider
 * Free API (non-commercial <10k/day), no API key needed.
 * Global hourly forecast, precipitation probability, and sunrise/sunset.
 */
export class OpenMeteoProvider implements WeatherProvider {
  name = 'OpenMeteoProvider';
  private timeoutMs: number;

  constructor(timeoutMs = 3500) {
    this.timeoutMs = timeoutMs;
  }

  private mapWmoCodeToCondition(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 57) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Cloudy';
  }

  async getForecast(lat: number, lng: number, date?: string): Promise<ProvenanceValue<WeatherData>> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', lat.toFixed(4));
      url.searchParams.set('longitude', lng.toFixed(4));
      url.searchParams.set('current', 'temperature_2m,apparent_temperature,precipitation,weather_code');
      url.searchParams.set('hourly', 'temperature_2m,precipitation_probability,uv_index');
      url.searchParams.set('daily', 'sunrise,sunset');
      url.searchParams.set('timezone', 'auto');
      if (date) {
        url.searchParams.set('start_date', date);
        url.searchParams.set('end_date', date);
      }

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'YourTrip-TripOS/2.0',
        },
      });

      if (!res.ok) {
        throw new Error(`Open-Meteo upstream error: HTTP ${res.status}`);
      }

      const json = await res.json();
      const current = json.current || {};
      const daily = json.daily || {};
      const hourly = json.hourly || {};

      const weatherCode = current.weather_code ?? (hourly.weather_code?.[0] ?? 0);
      const condition = this.mapWmoCodeToCondition(weatherCode);

      // Extract sunrise and sunset times (format "YYYY-MM-DDTHH:MM")
      const sunriseIso = daily.sunrise?.[0] || '';
      const sunsetIso = daily.sunset?.[0] || '';
      const sunriseTime = sunriseIso.includes('T') ? sunriseIso.split('T')[1].substring(0, 5) : '06:00';
      const sunsetTime = sunsetIso.includes('T') ? sunsetIso.split('T')[1].substring(0, 5) : '18:15';

      // Average precipitation probability from hourly
      const hourlyPrecip: number[] = hourly.precipitation_probability || [];
      const avgPrecip = hourlyPrecip.length > 0
        ? Math.round(hourlyPrecip.slice(0, 24).reduce((a, b) => a + b, 0) / Math.min(24, hourlyPrecip.length))
        : Math.round((current.precipitation || 0) * 10);

      const maxUv: number[] = hourly.uv_index || [];
      const peakUv = maxUv.length > 0 ? Math.max(...maxUv.slice(0, 24)) : 5;

      const weatherData: WeatherData = {
        temperatureC: Math.round(current.temperature_2m ?? 28),
        apparentTemperatureC: Math.round(current.apparent_temperature ?? current.temperature_2m ?? 29),
        condition,
        weatherCode,
        precipitationProbability: Math.min(100, Math.max(0, avgPrecip)),
        uvIndex: peakUv,
        sunriseTime,
        sunsetTime,
        recordedAt: new Date().toISOString(),
      };

      return {
        value: weatherData,
        provenance: 'LIVE',
        lastUpdated: new Date().toISOString(),
        note: 'Live forecast from Open-Meteo',
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async getSunTimings(lat: number, lng: number, date?: string): Promise<ProvenanceValue<{ sunrise: string; sunset: string }>> {
    const forecast = await this.getForecast(lat, lng, date);
    return {
      value: {
        sunrise: forecast.value.sunriseTime,
        sunset: forecast.value.sunsetTime,
      },
      provenance: forecast.provenance,
      lastUpdated: forecast.lastUpdated,
      note: forecast.note,
    };
  }
}

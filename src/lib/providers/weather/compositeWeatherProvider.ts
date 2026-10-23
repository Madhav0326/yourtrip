import { WeatherProvider, WeatherData, CacheProvider } from '@/lib/providers/types';
import { ProvenanceValue } from '@/types/trip';
import { OpenMeteoProvider } from './openMeteoProvider';
import { HistoricalClimateProvider } from './historicalClimateProvider';

/**
 * CompositeWeatherProvider
 * Implements the mandatory fallback chain:
 * Cache -> Open-Meteo (Primary) -> Historical Climate (Secondary) -> UNAVAILABLE.
 */
export class CompositeWeatherProvider implements WeatherProvider {
  name = 'CompositeWeatherProvider';
  private primary: WeatherProvider;
  private fallback: WeatherProvider;
  private cache?: CacheProvider;

  // Freshness TTL: 3 hours, Retention: 24 hours
  private freshnessTtlMs = 3 * 60 * 60 * 1000;
  private retentionMs = 24 * 60 * 60 * 1000;

  constructor(
    primary: WeatherProvider = new OpenMeteoProvider(),
    fallback: WeatherProvider = new HistoricalClimateProvider(),
    cache?: CacheProvider
  ) {
    this.primary = primary;
    this.fallback = fallback;
    this.cache = cache;
  }

  private isBeyondForecastWindow(dateStr?: string): boolean {
    if (!dateStr) return false;
    const target = new Date(dateStr);
    if (isNaN(target.getTime())) return false;
    const diffDays = (target.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays > 14;
  }

  async getForecast(lat: number, lng: number, date?: string): Promise<ProvenanceValue<WeatherData>> {
    const cacheKey = `wx:${lat.toFixed(2)},${lng.toFixed(2)}:${date || 'today'}`;

    // 1. Check Cache
    if (this.cache) {
      const cached = await this.cache.get<WeatherData>(cacheKey);
      if (cached) {
        const isFresh = Date.now() < cached.freshUntil;
        return {
          value: cached.data,
          provenance: cached.provenance,
          lastUpdated: new Date(cached.cachedAt).toISOString(),
          note: isFresh
            ? (cached.sourceNote || 'Served from fresh cache')
            : `Cached ${Math.round((Date.now() - cached.cachedAt) / (60 * 60 * 1000))}h ago (stale)`,
        };
      }
    }

    // 2. If date is >14 days out, go directly to Historical Climate Norms (ESTIMATED)
    if (this.isBeyondForecastWindow(date)) {
      const climateNorm = await this.fallback.getForecast(lat, lng, date);
      if (this.cache) {
        await this.cache.set(
          cacheKey,
          climateNorm.value,
          this.freshnessTtlMs * 8, // 24h freshness for norms
          this.retentionMs * 7,
          climateNorm.provenance,
          climateNorm.note
        );
      }
      return climateNorm;
    }

    // 3. Try Primary Provider (Open-Meteo LIVE)
    try {
      const liveForecast = await this.primary.getForecast(lat, lng, date);
      if (this.cache) {
        await this.cache.set(
          cacheKey,
          liveForecast.value,
          this.freshnessTtlMs,
          this.retentionMs,
          liveForecast.provenance,
          liveForecast.note
        );
      }
      return liveForecast;
    } catch (primaryErr) {
      console.warn('[Weather] Primary provider failed, falling back to historical norms:', primaryErr);
    }

    // 4. Fallback to Secondary Provider (Historical Climate Norms ESTIMATED)
    try {
      const fallbackResult = await this.fallback.getForecast(lat, lng, date);
      if (this.cache) {
        await this.cache.set(
          cacheKey,
          fallbackResult.value,
          this.freshnessTtlMs,
          this.retentionMs,
          fallbackResult.provenance,
          fallbackResult.note
        );
      }
      return fallbackResult;
    } catch (fallbackErr) {
      console.error('[Weather] Both primary and fallback providers failed:', fallbackErr);
    }

    // 5. UNAVAILABLE (Truth in labeling: never fabricate missing data)
    return {
      value: {
        temperatureC: 0,
        apparentTemperatureC: 0,
        condition: 'Weather unavailable',
        weatherCode: -1,
        precipitationProbability: 0,
        uvIndex: 0,
        sunriseTime: '06:00',
        sunsetTime: '18:00',
        recordedAt: new Date().toISOString(),
      },
      provenance: 'UNAVAILABLE',
      lastUpdated: new Date().toISOString(),
      note: 'Live forecast and historical norms unreachable',
    };
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

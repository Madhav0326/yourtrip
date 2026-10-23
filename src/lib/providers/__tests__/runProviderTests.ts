/**
 * Automated Test Runner for Phase 2A Data Foundation & Provider Adapters
 *
 * Verifies all 12 mandatory scenarios required by Guardrail 13:
 * 1. Provider success
 * 2. Provider timeout
 * 3. Provider 5xx error
 * 4. Provider 429 rate limit
 * 5. Missing API key resilience
 * 6. Offline mode resilience
 * 7. Cache hit (Freshness TTL)
 * 8. Stale cache (Retention window)
 * 9. Fallback hierarchy
 * 10. Provenance correctness
 * 11. UNAVAILABLE behavior (zero fabrication)
 * 12. Guest mode persistence compatibility
 */

import { MemoryCacheProvider } from '@/lib/cache/memoryCache';
import { TokenBucketRateLimiter, ROUTE_POLICIES } from '@/lib/rateLimiter';
import { StaticCityRegistry } from '@/lib/providers/geocoding/staticCityRegistry';
import { OpenMeteoProvider } from '@/lib/providers/weather/openMeteoProvider';
import { HistoricalClimateProvider } from '@/lib/providers/weather/historicalClimateProvider';
import { CompositeWeatherProvider } from '@/lib/providers/weather/compositeWeatherProvider';
import { CompositeGeocodingProvider } from '@/lib/providers/geocoding/compositeGeocodingProvider';
import { WeatherProvider, WeatherData, GeocodingProvider, GeocodingResult } from '@/lib/providers/types';
import { ProvenanceValue } from '@/types/trip';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    process.exitCode = 1;
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log(' RUNNING PHASE 2A DATA FOUNDATION & PROVIDER TEST SUITE');
  console.log('======================================================\n');

  // Test 1: Provider Success (Geocoding & Weather)
  console.log('Group 1: Provider Success');
  const staticGeo = new StaticCityRegistry();
  const geoResult = await staticGeo.searchDestination('Goa');
  assert(geoResult.value.length > 0, 'Static geocoder resolves "Goa"');
  assert(geoResult.value[0].city === 'Goa', 'Resolved city name is Goa');
  assert(geoResult.value[0].lat > 15 && geoResult.value[0].lat < 16, 'Latitude is within Goa region');

  const climateProv = new HistoricalClimateProvider();
  const climateResult = await climateProv.getForecast(15.2993, 74.1240);
  assert(climateResult.value.temperatureC > 20, 'Weather temperature is realistic (>20°C for Goa)');
  assert(climateResult.value.sunriseTime.length === 5, 'Sunrise time formatted as HH:MM');
  assert(climateResult.value.sunsetTime.length === 5, 'Sunset time formatted as HH:MM');

  // Test 2: Provider Timeout Handling
  console.log('\nGroup 2: Provider Timeout Handling');
  class MockTimeoutWeatherProvider implements WeatherProvider {
    name = 'MockTimeoutWeatherProvider';
    async getForecast(): Promise<ProvenanceValue<WeatherData>> {
      await new Promise((resolve) => setTimeout(resolve, 50));
      throw new Error('AbortError: The user aborted a request.');
    }
    async getSunTimings(): Promise<ProvenanceValue<{ sunrise: string; sunset: string }>> {
      throw new Error('AbortError');
    }
  }

  const compositeWithTimeout = new CompositeWeatherProvider(
    new MockTimeoutWeatherProvider(),
    new HistoricalClimateProvider()
  );
  const timeoutFallbackResult = await compositeWithTimeout.getForecast(15.2993, 74.1240);
  assert(
    timeoutFallbackResult.provenance === 'ESTIMATED',
    'Provider timeout activates secondary fallback with ESTIMATED provenance'
  );
  assert(timeoutFallbackResult.value.temperatureC > 0, 'Valid temperature returned despite primary timeout');

  // Test 3: Provider 5xx Error Resilience
  console.log('\nGroup 3: Provider 5xx Error Resilience');
  class Mock500WeatherProvider implements WeatherProvider {
    name = 'Mock500WeatherProvider';
    async getForecast(): Promise<ProvenanceValue<WeatherData>> {
      throw new Error('HTTP 500 Internal Server Error from upstream');
    }
    async getSunTimings(): Promise<ProvenanceValue<{ sunrise: string; sunset: string }>> {
      throw new Error('HTTP 500');
    }
  }

  const compositeWith500 = new CompositeWeatherProvider(
    new Mock500WeatherProvider(),
    new HistoricalClimateProvider()
  );
  const fiveHundredResult = await compositeWith500.getForecast(26.9124, 75.7873); // Jaipur
  assert(fiveHundredResult.provenance === 'ESTIMATED', 'Upstream 500 gracefully caught and routed to fallback');
  assert(fiveHundredResult.value.condition.length > 0, 'Condition supplied by secondary fallback');

  // Test 4: Provider 429 Rate Limiter
  console.log('\nGroup 4: Rate Limiting (Token Bucket)');
  const limiter = new TokenBucketRateLimiter();
  const policy = { tokensPerInterval: 1, intervalMs: 1000, maxTokens: 2 };
  const r1 = limiter.consume('test_client', policy);
  const r2 = limiter.consume('test_client', policy);
  const r3 = limiter.consume('test_client', policy);
  assert(r1.allowed === true, 'Token 1 consumed successfully');
  assert(r2.allowed === true, 'Token 2 consumed successfully (burst)');
  assert(r3.allowed === false, 'Token 3 rejected with rate limit (429)');
  assert(r3.retryAfterSeconds >= 1, 'Retry-After duration is at least 1 second');

  // Test 5: Missing API Key Resilience
  console.log('\nGroup 5: Missing API Key Resilience');
  // OpenMeteo and Nominatim do not require keys; static fallbacks also require 0 keys
  const geocoderNoKey = new CompositeGeocodingProvider(new StaticCityRegistry(), new StaticCityRegistry());
  const noKeyResult = await geocoderNoKey.searchDestination('Jaipur');
  assert(noKeyResult.value.length > 0, 'Geocoder operates with zero API keys');
  assert(noKeyResult.provenance === 'ESTIMATED', 'Fallback data correctly labeled ESTIMATED');

  // Test 6: Offline Mode Resilience
  console.log('\nGroup 6: Offline Mode Resilience');
  class MockOfflineNetworkProvider implements GeocodingProvider {
    name = 'MockOfflineNetworkProvider';
    async searchDestination(): Promise<ProvenanceValue<GeocodingResult[]>> {
      throw new TypeError('Failed to fetch (net::ERR_INTERNET_DISCONNECTED)');
    }
  }
  const compositeOffline = new CompositeGeocodingProvider(
    new MockOfflineNetworkProvider(),
    new StaticCityRegistry()
  );
  const offlineResult = await compositeOffline.searchDestination('Udaipur');
  assert(offlineResult.value.length > 0, 'Offline fetch failure caught; local static registry served');
  assert(offlineResult.value[0].city === 'Udaipur', 'Udaipur coordinates resolved offline');

  // Test 7: Cache Hit (Freshness TTL)
  console.log('\nGroup 7: Cache Freshness (Freshness TTL)');
  const testCache = new MemoryCacheProvider();
  await testCache.set('geo:goa', [{ city: 'Goa', lat: 15.2, lng: 74.1 }], 5000, 20000, 'LIVE', 'Fresh cache');
  const freshHit = await testCache.get<{ city: string; lat: number; lng: number }[]>('geo:goa');
  assert(freshHit !== null, 'Cache hit succeeded');
  assert(freshHit?.provenance === 'LIVE', 'Cache preserves provenance');
  assert(Date.now() < (freshHit?.freshUntil ?? 0), 'Data is within freshness TTL window');

  // Test 8: Stale Cache (Retention Window)
  console.log('\nGroup 8: Stale Cache (Retention Window)');
  // Set with freshness TTL = -10ms (already stale), retention = +5000ms
  await testCache.set('wx:goa', { temp: 28 }, -10, 5000, 'LIVE', 'Stale weather');
  const staleHit = await testCache.get<{ temp: number }>('wx:goa');
  assert(staleHit !== null, 'Record retrieved within retention window');
  assert(Date.now() > (staleHit?.freshUntil ?? 0), 'Record correctly identified as STALE');
  assert(Date.now() < (staleHit?.expiresAt ?? 0), 'Record not yet evicted from retention storage');

  // Test 9: Fallback Hierarchy Integrity (>14 days future date)
  console.log('\nGroup 9: Fallback Hierarchy (>14 Day Date Routing)');
  const farFutureDate = new Date();
  farFutureDate.setDate(farFutureDate.getDate() + 45); // 45 days in future
  const futureDateStr = farFutureDate.toISOString().split('T')[0];

  const futureWeatherComposite = new CompositeWeatherProvider(
    new OpenMeteoProvider(),
    new HistoricalClimateProvider()
  );
  const futureWeather = await futureWeatherComposite.getForecast(15.2993, 74.1240, futureDateStr);
  assert(
    futureWeather.provenance === 'ESTIMATED',
    'Date >14 days out automatically routes to climate norms (ESTIMATED)'
  );
  assert(futureWeather.value.isHistoricalNorm === true, 'Flagged as historical climate norm');

  // Test 10: Provenance Correctness
  console.log('\nGroup 10: Provenance Correctness & Truth in Labeling');
  assert(geoResult.provenance === 'ESTIMATED', 'Static registry is strictly ESTIMATED');
  assert(climateResult.provenance === 'ESTIMATED', 'Climate norm is strictly ESTIMATED (never mocked as LIVE)');
  assert(
    climateResult.note?.includes('statistical average') === true,
    'Note explicitly communicates statistical nature'
  );

  // Test 11: UNAVAILABLE Behavior (Zero Fabrication)
  console.log('\nGroup 11: UNAVAILABLE Behavior (Zero Fabrication)');
  class MockFailingGeocodingProvider implements GeocodingProvider {
    name = 'MockFailing';
    async searchDestination(): Promise<ProvenanceValue<GeocodingResult[]>> {
      return { value: [], provenance: 'UNAVAILABLE', lastUpdated: new Date().toISOString() };
    }
  }
  const totalFailureGeocoder = new CompositeGeocodingProvider(
    new MockFailingGeocodingProvider(),
    new MockFailingGeocodingProvider()
  );
  const unavailableResult = await totalFailureGeocoder.searchDestination('AtlantisMissingPlace999');
  assert(unavailableResult.value.length === 0, 'No fake coordinates fabricated for unknown destination');
  assert(unavailableResult.provenance === 'UNAVAILABLE', 'Properly marked UNAVAILABLE');

  // Test 12: Guest Mode Persistence Structure
  console.log('\nGroup 12: Guest Mode Persistence Compatibility');
  const guestCacheKey = 'trip_guest_local_123';
  await testCache.set(
    guestCacheKey,
    { id: 'guest_123', isGuest: true, destination: 'Goa' },
    24 * 3600 * 1000,
    30 * 24 * 3600 * 1000,
    'USER_ENTERED'
  );
  const guestTrip = await testCache.get<{ id: string; isGuest: boolean }>(guestCacheKey);
  assert(guestTrip?.data.isGuest === true, 'Guest trip persisted without authentication');
  assert(guestTrip?.provenance === 'USER_ENTERED', 'Guest entered trip has USER_ENTERED provenance');

  console.log('\n======================================================');
  console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL PHASE 2A DATA FOUNDATION & PROVIDER TESTS PASSED!\n');
  } else {
    console.error('❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

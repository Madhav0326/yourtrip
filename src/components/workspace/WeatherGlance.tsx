'use client';

import React, { useEffect, useState } from 'react';
import { ProvenanceValue } from '@/types/trip';
import { WeatherData } from '@/lib/providers/types';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { formatWeatherFreshness } from '@/lib/weatherFreshness';
import { Sun, CloudSun, CloudRain, CloudLightning, Sunset, Compass } from 'lucide-react';

interface WeatherGlanceProps {
  destination: string;
  startDate?: string;
  className?: string;
}

export const WeatherGlance: React.FC<WeatherGlanceProps> = ({
  destination,
  startDate,
  className = '',
}) => {
  const [weather, setWeather] = useState<ProvenanceValue<WeatherData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadWeather() {
      setLoading(true);
      try {
        // 1. Resolve coordinates via geocoding proxy
        let lat = 15.2993; // Default Goa coordinates
        let lng = 74.1240;

        const geoRes = await fetch(`/api/geocoding?q=${encodeURIComponent(destination)}`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.value && geoData.value.length > 0) {
            lat = geoData.value[0].lat;
            lng = geoData.value[0].lng;
          }
        }

        // 2. Resolve weather via weather proxy
        const wxUrl = `/api/weather?lat=${lat}&lng=${lng}${startDate ? `&date=${startDate}` : ''}`;
        const wxRes = await fetch(wxUrl);
        if (wxRes.ok) {
          const wxData: ProvenanceValue<WeatherData> = await wxRes.json();
          if (!isCancelled) {
            setWeather(wxData);
          }
        }
      } catch (err) {
        console.warn('[WeatherGlance] Could not load live weather:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    if (destination) {
      loadWeather();
    }

    return () => {
      isCancelled = true;
    };
  }, [destination, startDate]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-canvas-100 border border-canvas-200 text-xs text-slate-400 animate-pulse">
        <Compass className="w-3.5 h-3.5 animate-spin-slow text-slate-400" />
        <span>Checking weather...</span>
      </div>
    );
  }

  if (!weather || !weather.value) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-canvas-100 text-slate-500 text-xs border border-canvas-200">
        <ProvenanceBadge provenance="UNAVAILABLE" label="Weather Unavailable" />
      </div>
    );
  }

  const { temperatureC, condition, sunsetTime, isHistoricalNorm, recordedAt } = weather.value;
  const isStale = weather.note?.includes('stale') || false;
  const freshnessText = isHistoricalNorm
    ? 'Statistical Climate Norm'
    : formatWeatherFreshness(recordedAt, isStale);

  // Weather Icon selector
  const renderIcon = () => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) {
      return <CloudRain className="w-3.5 h-3.5 text-blue-500" />;
    }
    if (c.includes('thunder')) {
      return <CloudLightning className="w-3.5 h-3.5 text-amber-500" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <CloudSun className="w-3.5 h-3.5 text-amber-500" />;
    }
    return <Sun className="w-3.5 h-3.5 text-amber-500" />;
  };

  return (
    <div
      title={`${weather.note || ''} • ${freshnessText}`}
      className={`inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-canvas-200 shadow-2xs text-xs ${className}`}
    >
      {/* Icon & Temp */}
      <div className="flex items-center gap-1.5 font-bold text-slate-800">
        {renderIcon()}
        <span>{temperatureC}°C</span>
        <span className="text-slate-400 font-normal hidden sm:inline">•</span>
        <span className="text-slate-600 font-medium hidden sm:inline">{condition}</span>
      </div>

      {/* Sunset pill */}
      {sunsetTime && (
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          <Sunset className="w-3 h-3 text-amber-600" />
          <span>Sunset {sunsetTime}</span>
        </span>
      )}

      {/* Provenance Badge */}
      <ProvenanceBadge
        provenance={weather.provenance}
        label={weather.provenance === 'LIVE' ? 'Live Weather' : 'Climate Norm'}
      />

      {/* Freshness hint */}
      <span className="text-[10px] text-slate-400 font-medium hidden lg:inline">
        {freshnessText}
      </span>
    </div>
  );
};

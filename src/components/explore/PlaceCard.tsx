'use client';

import React from 'react';
import { AttractionOption } from '@/types/explore';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import {
  MapPin,
  Clock,
  Sparkles,
  Ticket,
  Star,
  Plus,
  Compass,
  Palmtree,
  Landmark,
  Trees,
} from 'lucide-react';

interface PlaceCardProps {
  place: AttractionOption;
  onAddToTrip: (place: AttractionOption) => void;
  onViewOnMap?: (lat: number, lng: number, title: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onAddToTrip,
  onViewOnMap,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BEACH':
        return <Palmtree className="w-3.5 h-3.5 text-cyan-400" />;
      case 'CULTURE':
        return <Landmark className="w-3.5 h-3.5 text-amber-400" />;
      case 'NATURE':
        return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'BEACH':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60';
      case 'CULTURE':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      case 'NATURE':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      default:
        return 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60';
    }
  };

  const hasRating =
    place.rating &&
    place.rating.provenance !== 'UNAVAILABLE' &&
    place.rating.value > 0;

  const hasFee =
    place.entryFeeEstimated &&
    place.entryFeeEstimated.provenance !== 'UNAVAILABLE';

  return (
    <div className="group relative bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between gap-4">
      {/* Top Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
              place.category
            )}`}
          >
            {getCategoryIcon(place.category)}
            <span>{place.category}</span>
          </span>

          <ProvenanceBadge
            provenance={place.provenance}
            label={place.provenance === 'LIVE' ? 'Live Provider' : 'Curated Seed'}
            className="text-[9px]"
          />
        </div>

        <h3 className="font-semibold text-slate-100 text-lg group-hover:text-emerald-400 transition-colors leading-snug">
          {place.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate" title={place.address}>
            {place.address}
          </span>
        </div>

        {place.description && (
          <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed pt-1">
            {place.description}
          </p>
        )}
      </div>

      {/* Structured Travel Details */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Duration */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>~{place.recommendedDurationMinutes || 60} mins</span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <Ticket className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {hasFee
                ? place.entryFeeEstimated!.value === 0
                  ? 'Free entry'
                  : `₹${place.entryFeeEstimated!.value}`
                : 'Fee not reported'}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-slate-300 col-span-2">
            <Star className={`w-3.5 h-3.5 shrink-0 ${hasRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
            {hasRating ? (
              <span className="font-medium text-amber-300">
                {place.rating!.value.toFixed(1)}{' '}
                <span className="text-[10px] text-slate-400 font-normal">
                  ({place.rating!.note || 'traveler consensus'})
                </span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 italic">Rating unavailable</span>
            )}
          </div>
        </div>

        {/* Why Recommended Explanation (Deterministic, Truthful) */}
        {place.whyRecommended && (
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-2.5 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-200/90 leading-tight">
              {place.whyRecommended}
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
        {onViewOnMap && (
          <button
            type="button"
            onClick={() => onViewOnMap(place.lat, place.lng, place.name)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Locate</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onAddToTrip(place)}
          className="ml-auto inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-950/40 active:scale-95 touch-manipulation min-h-[38px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Trip</span>
        </button>
      </div>
    </div>
  );
};

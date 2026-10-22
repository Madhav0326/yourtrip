import React from 'react';
import { TravelLeg } from '@/types/trip';
import { Car, Footprints, Bike, Bus, Navigation } from 'lucide-react';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { formatCurrency } from '@/lib/utils';

interface TravelRouteLegProps {
  leg: TravelLeg;
}

export const TravelRouteLeg: React.FC<TravelRouteLegProps> = ({ leg }) => {
  const modeIcons = {
    WALK: <Footprints className="w-3.5 h-3.5" />,
    CAB: <Car className="w-3.5 h-3.5" />,
    SCOOTER: <Bike className="w-3.5 h-3.5" />,
    BUS: <Bus className="w-3.5 h-3.5" />,
    METRO: <Navigation className="w-3.5 h-3.5" />,
    CAR: <Car className="w-3.5 h-3.5" />,
    FERRY: <Navigation className="w-3.5 h-3.5" />,
  };

  return (
    <div className="relative pl-8 my-2 flex items-center gap-3 select-none">
      {/* Route connector line with kinetic dash */}
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-dashed border-l-2 border-dashed border-canvas-300" />

      {/* Mode icon indicator */}
      <div className="relative z-10 w-7 h-7 rounded-full bg-canvas-200 border border-canvas-300 text-slate-700 flex items-center justify-center shadow-2xs">
        {modeIcons[leg.mode] || <Car className="w-3.5 h-3.5" />}
      </div>

      {/* Transit metrics chip */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-xl border border-canvas-200 shadow-2xs">
        <span className="font-semibold text-slate-800">
          {leg.durationMinutes} min {leg.mode.toLowerCase()}
        </span>
        <span className="text-slate-300">•</span>
        <span>{leg.distanceKm} km</span>
        {leg.estimatedCost.value > 0 && (
          <>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-700">
              ~{formatCurrency(leg.estimatedCost.value)}
            </span>
          </>
        )}
        <ProvenanceBadge provenance={leg.trafficCondition.provenance} label={`${leg.trafficCondition.value} traffic`} />
      </div>
    </div>
  );
};

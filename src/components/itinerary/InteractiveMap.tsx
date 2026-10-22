import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Compass, Layers, Maximize2 } from 'lucide-react';
import { ItineraryItem } from '@/types/trip';
import { Badge } from '@/components/ui/Badge';
import { formatTimeDisplay } from '@/lib/utils';

interface InteractiveMapProps {
  items: ItineraryItem[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
  destination: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  items,
  selectedActivityId,
  onSelectActivity,
  destination,
}) => {
  const selectedItem = items.find((i) => i.id === selectedActivityId) || items[0];

  return (
    <div className="relative w-full h-full min-h-[380px] md:min-h-[500px] rounded-3xl bg-slate-900 border border-canvas-200 overflow-hidden shadow-warm flex flex-col justify-between p-4 select-none">
      {/* Stylized Spatial Background Canvas */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FAF8F5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Map Header / Location Indicator */}
      <div className="relative z-10 flex items-center justify-between bg-slate-800/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/60 text-white text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-terracotta-400 animate-spin-slow" />
          <span className="font-bold tracking-wide">{destination} Spatial Map</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium">Synchronized</span>
        </div>
      </div>

      {/* Simulated Spatial Coordinate Grid & Waypoint Markers */}
      <div className="relative z-10 my-auto flex items-center justify-around py-8 px-4">
        {items.map((item, index) => {
          const isSelected = item.id === (selectedActivityId || items[0]?.id);
          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectActivity(item.id)}
              className="relative flex flex-col items-center cursor-pointer group"
            >
              {/* Animated Glowing Ring for Selected */}
              {isSelected && (
                <motion.div
                  layoutId="map-glow"
                  className="absolute -inset-2.5 rounded-full bg-terracotta-500/30 blur-xs animate-pulse"
                />
              )}

              {/* Waypoint Marker Pin */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-colors ${
                  isSelected
                    ? 'bg-terracotta-500 text-white ring-2 ring-white'
                    : 'bg-white text-slate-800 hover:bg-canvas-100'
                }`}
              >
                {index + 1}
              </div>

              {/* Tooltip on marker */}
              <div className="absolute top-10 whitespace-nowrap bg-slate-800/90 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-1 rounded-md shadow-md border border-slate-700 opacity-90 group-hover:opacity-100 transition-opacity">
                {item.title}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Floating Focus Card */}
      {selectedItem && (
        <motion.div
          key={selectedItem.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-canvas-200 shadow-xl text-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Badge variant="category" category={selectedItem.category}>
                  {selectedItem.category}
                </Badge>
                <span className="text-[11px] font-semibold text-slate-500">
                  {formatTimeDisplay(selectedItem.timeSlot.plannedStart)}
                </span>
              </div>
              <h5 className="font-bold text-sm text-slate-900">{selectedItem.title}</h5>
              <p className="text-xs text-slate-500 truncate max-w-[280px]">
                {selectedItem.location.address || selectedItem.location.name}
              </p>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${selectedItem.title} ${destination}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-canvas-100 hover:bg-terracotta-50 hover:text-terracotta-600 text-slate-600 border border-canvas-200 transition-colors shrink-0"
              title="Open directions in Google Maps"
            >
              <Navigation className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
};

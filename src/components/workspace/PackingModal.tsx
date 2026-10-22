import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Trip, PackingItem } from '@/types/trip';
import { useTripStore } from '@/store/tripStore';
import { CheckSquare, Square, Luggage, Sun, Shirt } from 'lucide-react';

interface PackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const PackingModal: React.FC<PackingModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const togglePackingItem = useTripStore((state) => state.togglePackingItem);

  const packedCount = trip.packingList.filter((i) => i.packed).length;
  const totalCount = trip.packingList.length;
  const progressPercent = Math.round((packedCount / Math.max(1, totalCount)) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Packing & Wardrobe Assistant"
      description={`Practical packing recommendations tailored for ${trip.destination}'s climate and scheduled activities.`}
      className="max-w-xl"
    >
      <div className="space-y-5">
        {/* Progress Bar */}
        <div className="bg-canvas-50 border border-canvas-200 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span className="flex items-center gap-1.5">
              <Luggage className="w-4 h-4 text-terracotta-500" />
              <span>Packed Status</span>
            </span>
            <span>
              {packedCount} of {totalCount} items ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-canvas-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Clothing & Climate Guidance */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <Sun className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Clothing Advice for {trip.destination}:</span>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              Warm coastal daytime temperatures (~29°C) with pleasant sea breezes. Light breathable cottons, comfortable walking footwear for fort visits, and quick-dry swimwear are recommended.
            </p>
          </div>
        </div>

        {/* Packing Checklist */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {trip.packingList.map((item) => (
            <div
              key={item.id}
              onClick={() => togglePackingItem(item.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                item.packed
                  ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                  : 'bg-white border-canvas-200 hover:border-canvas-300 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <button type="button" className="text-terracotta-500 shrink-0">
                  {item.packed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <div>
                  <span className={`font-semibold block ${item.packed ? 'line-through text-slate-400' : ''}`}>
                    {item.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''}
                  </span>
                  {item.recommendedReason && (
                    <span className="text-[11px] text-slate-400 block">{item.recommendedReason}</span>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-canvas-100 text-slate-600 uppercase">
                {item.category}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-canvas-200 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

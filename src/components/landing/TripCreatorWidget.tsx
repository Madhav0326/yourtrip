import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, IndianRupee, Sparkles, ArrowRight, SlidersHorizontal, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTripStore } from '@/store/tripStore';
import { TripStyle } from '@/types/trip';
import { formatCurrency } from '@/lib/utils';
import confetti from 'canvas-confetti';

const POPULAR_DESTINATIONS = ['Goa', 'Jaipur', 'Manali', 'Kerala', 'Udaipur', 'Varkala'];

const TRIP_STYLES: TripStyle[] = [
  'Relaxed',
  'Beach',
  'Food',
  'Adventure',
  'Culture',
  'Photography',
  'Romantic',
  'Backpacking',
  'Nightlife',
];

export const TripCreatorWidget: React.FC = () => {
  const router = useRouter();
  const createNewTrip = useTripStore((state) => state.createNewTrip);

  // Core 4 inputs
  const [destination, setDestination] = useState('Goa');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 18);
    return d.toISOString().split('T')[0];
  });
  const [travelers, setTravelers] = useState(4);
  const [budgetPerPerson, setBudgetPerPerson] = useState(15000);

  // Progressive refinement state
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<TripStyle[]>(['Relaxed', 'Beach', 'Food']);
  const [isCreating, setIsCreating] = useState(false);

  const toggleStyle = (style: TripStyle) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsCreating(true);

    // Fire subtle celebratory confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D95D39', '#E58B24', '#2E6F56'],
      });
    } catch {
      // ignore
    }

    // Instantiate in local-first Zustand + IndexedDB
    const newTrip = createNewTrip(
      destination.trim(),
      startDate,
      endDate,
      travelers,
      budgetPerPerson,
      selectedStyles
    );

    setTimeout(() => {
      router.push(`/trip/${newTrip.id}`);
    }, 600);
  };

  const totalCalculatedBudget = travelers * budgetPerPerson;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-4xl p-6 sm:p-8 shadow-elevated border border-canvas-200"
    >
      <form onSubmit={handleCreate}>
        {/* Core 4 Input Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Destination */}
          <div className="bg-canvas-50 hover:bg-canvas-100/80 p-3.5 rounded-2xl border border-canvas-200 transition-colors">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Destination</span>
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Goa, Jaipur..."
              className="w-full bg-transparent text-slate-900 font-semibold text-base focus:outline-none placeholder:text-slate-400"
            />
          </div>

          {/* 2. Travel Dates */}
          <div className="bg-canvas-50 hover:bg-canvas-100/80 p-3.5 rounded-2xl border border-canvas-200 transition-colors">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Dates</span>
            </label>
            <div className="flex items-center gap-1 text-slate-900 font-medium text-xs sm:text-sm">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer max-w-[105px]"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer max-w-[105px]"
              />
            </div>
          </div>

          {/* 3. Number of Travelers */}
          <div className="bg-canvas-50 hover:bg-canvas-100/80 p-3.5 rounded-2xl border border-canvas-200 transition-colors">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <Users className="w-3.5 h-3.5 text-forest-500" />
              <span>Travelers</span>
            </label>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 text-base">
                {travelers} {travelers === 1 ? 'person' : 'people'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-lg bg-canvas-200 text-slate-700 flex items-center justify-center font-bold hover:bg-canvas-300"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setTravelers((prev) => Math.min(20, prev + 1))}
                  className="w-7 h-7 rounded-lg bg-canvas-200 text-slate-700 flex items-center justify-center font-bold hover:bg-canvas-300"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 4. Budget per Person */}
          <div className="bg-canvas-50 hover:bg-canvas-100/80 p-3.5 rounded-2xl border border-canvas-200 transition-colors">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Budget / Person</span>
            </label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                step="1000"
                min="2000"
                value={budgetPerPerson}
                onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
                className="w-24 bg-transparent text-slate-900 font-semibold text-base focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 font-medium">
                Total: {formatCurrency(totalCalculatedBudget)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Destination Pill Suggestions */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-2">
          <span className="text-xs text-slate-400 font-medium">Try:</span>
          {POPULAR_DESTINATIONS.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setDestination(city)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all ${
                destination.toLowerCase() === city.toLowerCase()
                  ? 'bg-terracotta-50 text-terracotta-700 border border-terracotta-300 font-semibold'
                  : 'bg-canvas-100 text-slate-600 hover:bg-canvas-200 border border-canvas-200'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Progressive Refinement Toggle */}
        <div className="mt-4 pt-4 border-t border-canvas-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowPersonalize(!showPersonalize)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-terracotta-600 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showPersonalize ? 'Hide extra preferences' : 'Want to personalize trip style?'}</span>
            <span className="text-[10px] bg-canvas-200 px-1.5 py-0.5 rounded-md text-slate-600">Optional</span>
          </button>

          {/* Action Trigger */}
          <Button
            type="submit"
            size="lg"
            isLoading={isCreating}
            className="w-full sm:w-auto px-8"
          >
            <span>Create Trip Workspace</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Expandable Optional Preferences */}
        <AnimatePresence>
          {showPersonalize && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4 pt-3 border-t border-canvas-100"
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Trip Vibe & Styles:
              </p>
              <div className="flex flex-wrap gap-2">
                {TRIP_STYLES.map((style) => {
                  const isSelected = selectedStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-terracotta-500 text-white border-terracotta-500 shadow-xs'
                          : 'bg-white text-slate-700 border-canvas-300 hover:bg-canvas-100'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                      <span>{style}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

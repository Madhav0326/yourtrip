'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AttractionOption, ExploreCategoryFilter, ExploreSortOption } from '@/types/explore';
import { ProvenanceValue } from '@/types/trip';
import { PlaceCard } from './PlaceCard';
import { AddToTripModal } from './AddToTripModal';
import { useTripStore } from '@/store/tripStore';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  Compass,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Palmtree,
  Landmark,
  Trees,
  CheckCircle,
} from 'lucide-react';

interface ExploreHubProps {
  onViewOnMap?: (lat: number, lng: number, title: string) => void;
}

export const ExploreHub: React.FC<ExploreHubProps> = ({ onViewOnMap }) => {
  const currentTrip = useTripStore((state) => state.currentTrip);
  const addItineraryItem = useTripStore((state) => state.addItineraryItem);
  const activeDayIndex = useTripStore((state) => state.activeDayIndex);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExploreCategoryFilter>('ALL');
  const [sortBy, setSortBy] = useState<ExploreSortOption>('RECOMMENDED');

  // Network & Results state
  const [results, setResults] = useState<AttractionOption[]>([]);
  const [provenanceInfo, setProvenanceInfo] = useState<ProvenanceValue<AttractionOption[]> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal selection state
  const [selectedPlaceForTrip, setSelectedPlaceForTrip] = useState<AttractionOption | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Destination coordinates resolution
  const destinationCoords = useMemo(() => {
    if (!currentTrip) return { lat: 0, lng: 0 };
    for (const day of currentTrip.days) {
      for (const item of day.items) {
        if (item.location.lat && item.location.lng) {
          return { lat: item.location.lat, lng: item.location.lng };
        }
      }
    }
    return { lat: 0, lng: 0 };
  }, [currentTrip]);

  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      if (destinationCoords.lat && destinationCoords.lng) {
        params.set('lat', destinationCoords.lat.toString());
        params.set('lng', destinationCoords.lng.toString());
      }
      if (searchQuery.trim()) {
        params.set('q', searchQuery.trim());
      }
      if (selectedCategory !== 'ALL') {
        params.set('category', selectedCategory);
      }

      const res = await fetch(`/api/places?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Places rate limit reached. Please wait a moment before searching again.');
        }
        throw new Error(`Failed to load places (HTTP ${res.status})`);
      }

      const data: ProvenanceValue<AttractionOption[]> = await res.json();
      setProvenanceInfo(data);
      setResults(data.value || []);
    } catch (err: unknown) {
      console.error('Error fetching places:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to connect to discovery provider. Please check network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [destinationCoords.lat, destinationCoords.lng, searchQuery, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlaces();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPlaces]);

  // Client-side sorting
  const sortedResults = useMemo(() => {
    const list = [...results];
    if (sortBy === 'RATING') {
      return list.sort((a, b) => {
        const rA = a.rating?.value || 0;
        const rB = b.rating?.value || 0;
        return rB - rA;
      });
    }
    if (sortBy === 'DURATION') {
      return list.sort(
        (a, b) =>
          (a.recommendedDurationMinutes || 60) -
          (b.recommendedDurationMinutes || 60)
      );
    }
    // Default 'RECOMMENDED': Keep provider order
    return list;
  }, [results, sortBy]);

  const handleOpenAddToTrip = (place: AttractionOption) => {
    setSelectedPlaceForTrip(place);
    setIsModalOpen(true);
  };

  const handleConfirmAddToTrip = (
    dayId: string,
    timeSlot: { plannedStart: string; plannedEnd: string }
  ) => {
    if (!selectedPlaceForTrip) return;
    addItineraryItem(dayId, selectedPlaceForTrip, timeSlot);

    setSuccessToast(`Added "${selectedPlaceForTrip.name}" to itinerary!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const activeDay = currentTrip?.days[activeDayIndex] || currentTrip?.days[0];

  const categories: { key: ExploreCategoryFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'ALL', label: 'All Places', icon: <Compass className="w-3.5 h-3.5" /> },
    { key: 'ATTRACTION', label: 'Attractions', icon: <Compass className="w-3.5 h-3.5 text-indigo-400" /> },
    { key: 'BEACH', label: 'Beaches', icon: <Palmtree className="w-3.5 h-3.5 text-cyan-400" /> },
    { key: 'CULTURE', label: 'Culture & Heritage', icon: <Landmark className="w-3.5 h-3.5 text-amber-400" /> },
    { key: 'NATURE', label: 'Nature & Parks', icon: <Trees className="w-3.5 h-3.5 text-emerald-400" /> },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Toast notification */}
      {successToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Explore Header & Principles */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Explore {currentTrip?.destination || 'Destination'}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Discover attractions and points of interest. <span className="text-emerald-400 font-medium">AI assists. You decide.</span> Adding places requires your confirmation.
          </p>
        </div>

        {/* Provenance Indicator */}
        {provenanceInfo && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <ProvenanceBadge
              provenance={provenanceInfo.provenance}
              label={
                provenanceInfo.provenance === 'LIVE'
                  ? 'Live Directory'
                  : 'Curated Seeds'
              }
            />
            {provenanceInfo.note && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {provenanceInfo.note}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search attractions, beaches, forts in ${currentTrip?.destination || 'destination'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ExploreSortOption)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              aria-label="Sort places"
            >
              <option value="RECOMMENDED">Sort: Recommended</option>
              <option value="RATING">Sort: Traveler Rating</option>
              <option value="DURATION">Sort: Duration (Shortest)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll for Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all touch-manipulation min-h-[36px] ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 border border-emerald-500'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Content / States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4 animate-pulse min-h-[220px]"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-800 rounded-md w-24" />
                <div className="h-4 bg-slate-800 rounded-md w-16" />
              </div>
              <div className="h-5 bg-slate-800 rounded-md w-3/4" />
              <div className="h-3 bg-slate-800 rounded-md w-1/2" />
              <div className="h-8 bg-slate-800/50 rounded-xl" />
              <div className="flex justify-between pt-2">
                <div className="h-4 bg-slate-800 rounded-md w-20" />
                <div className="h-8 bg-slate-800 rounded-xl w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : errorMessage ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
          <h3 className="font-semibold text-slate-200 text-base">
            Unable to Load Places
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={fetchPlaces}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl transition-colors mt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Search</span>
          </button>
        </div>
      ) : sortedResults.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="font-semibold text-slate-300 text-base">
            No places match your search criteria
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching for a different keyword or select &ldquo;All Places&rdquo; to view all available regional attractions.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
            }}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedResults.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onAddToTrip={handleOpenAddToTrip}
              onViewOnMap={onViewOnMap}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <AddToTripModal
        place={selectedPlaceForTrip}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlaceForTrip(null);
        }}
        onConfirm={handleConfirmAddToTrip}
        days={currentTrip?.days || []}
        initialDayId={activeDay?.id}
      />
    </div>
  );
};

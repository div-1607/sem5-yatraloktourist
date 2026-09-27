import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Loader2,
  Compass,
  Users,
} from 'lucide-react';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';

const CATEGORY_OPTIONS = [
  'All',
  'Tourist Places',
  'Temples',
  'Historical Places',
  'Shopping Areas',
  'Old Towns',
  'Beaches',
  'Airports',
  'Cafes & Restaurants',
];

const CROWD_OPTIONS = [
  { label: 'All Densities', value: 'All' },
  { label: 'Low Crowd (Green)', value: 'low' },
  { label: 'Moderate Rush (Yellow)', value: 'moderate' },
  { label: 'Heavy Rush (Red)', value: 'high' },
];

const DestinationsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All');
  const [selectedCrowd, setSelectedCrowd] = useState(searchParams.get('crowd') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating-desc');

  // Hierarchy Data
  const [hierarchy, setHierarchy] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Results
  const [destinations, setDestinations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Hierarchy (States & Cities)
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await api.get('/destinations/hierarchy');
        if (res.data.success) {
          setHierarchy(res.data.data);
        }
      } catch (err) {
        console.error('Error loading hierarchy:', err);
      }
    };
    fetchHierarchy();
  }, []);

  // Update available cities when selectedState changes
  useEffect(() => {
    if (selectedState === 'All') {
      setAvailableCities([]);
      setSelectedCity('All');
    } else {
      const found = hierarchy.find((h) => h.state === selectedState);
      if (found) {
        setAvailableCities(found.cities || []);
      } else {
        setAvailableCities([]);
      }
    }
  }, [selectedState, hierarchy]);

  // Sync URL params and Fetch Destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
        if (selectedState && selectedState !== 'All') params.set('state', selectedState);
        if (selectedCity && selectedCity !== 'All') params.set('city', selectedCity);
        if (selectedCrowd && selectedCrowd !== 'All') params.set('crowdStatus', selectedCrowd);
        if (sortBy) params.set('sort', sortBy);

        setSearchParams(params, { replace: true });

        const res = await api.get(`/destinations?${params.toString()}`);
        if (res.data.success) {
          setDestinations(res.data.data);
          setTotalCount(res.data.total);
        }
      } catch (err) {
        console.error('Error fetching destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [search, selectedCategory, selectedState, selectedCity, selectedCrowd, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedState('All');
    setSelectedCity('All');
    setSelectedCrowd('All');
    setSortBy('rating-desc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Destination Explorer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Explore Destinations & Crowd Indicators
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Filter through India's spiritual, royal, coastal, and urban gems with live density telemetry.
        </p>
      </div>

      {/* Glass Search & Filter Control Bar */}
      <div className="glass-card p-6 space-y-6">
        {/* Search input + Sort Selector */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by monument name, state, city, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label className="text-xs text-slate-300 whitespace-nowrap font-semibold">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glass-input text-xs"
            >
              <option value="rating-desc" className="bg-navy-950 text-white">Highest Rated</option>
              <option value="rating-asc" className="bg-navy-950 text-white">Lowest Rated</option>
              <option value="crowd-asc" className="bg-navy-950 text-white">Least Crowded (Low to High)</option>
              <option value="crowd-desc" className="bg-navy-950 text-white">Most Crowded (High to Low)</option>
              <option value="title-asc" className="bg-navy-950 text-white">Alphabetical (A - Z)</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-400 border border-white/10 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* State -> City Cascaded Hierarchy Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Filter by State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="glass-input w-full text-xs"
            >
              <option value="All" className="bg-navy-950 text-white">All States</option>
              {hierarchy.map((item) => (
                <option key={item.state} value={item.state} className="bg-navy-950 text-white">
                  {item.state} ({item.count})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Filter by City
            </label>
            <select
              value={selectedCity}
              disabled={selectedState === 'All'}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="glass-input w-full text-xs disabled:opacity-50"
            >
              <option value="All" className="bg-navy-950 text-white">
                {selectedState === 'All' ? 'Select a State First' : 'All Cities'}
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city} className="bg-navy-950 text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Crowd Density Status
            </label>
            <select
              value={selectedCrowd}
              onChange={(e) => setSelectedCrowd(e.target.value)}
              className="glass-input w-full text-xs"
            >
              {CROWD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-navy-950 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="block text-[11px] font-semibold text-slate-300">
            Browse by Theme / Category:
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-md'
                    : 'bg-navy-950/60 text-slate-300 border-white/10 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <strong className="text-white">{destinations.length}</strong> of{' '}
          <strong className="text-white">{totalCount}</strong> verified destinations
        </span>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-9 h-9 text-amber-500 animate-spin" />
          <p className="text-xs text-slate-400">Loading verified tourism destinations...</p>
        </div>
      ) : destinations.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-slate-400 mx-auto flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Matching Destinations Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try resetting your filters or adjusting your search term to find more places.
          </p>
          <button
            onClick={handleResetFilters}
            className="glass-button-primary text-xs uppercase tracking-wider py-2.5 px-6 mt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest._id} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DestinationsListPage;

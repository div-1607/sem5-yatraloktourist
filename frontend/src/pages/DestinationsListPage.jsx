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
  Sparkles,
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
  { label: 'Safe • Low Crowd (Green)', value: 'low' },
  { label: 'Warning • Moderate Crowd (Yellow)', value: 'moderate' },
  { label: 'Critical • High Congestion (Red)', value: 'high' },
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

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

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

  // Fetch Destinations when filters change
  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const params = {
          limit: 1000,
          search: search.trim() || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          state: selectedState !== 'All' ? selectedState : undefined,
          city: selectedCity !== 'All' ? selectedCity : undefined,
          crowd: selectedCrowd !== 'All' ? selectedCrowd : undefined,
          sort: sortBy,
        };

        const res = await api.get('/destinations', { params });
        if (res.data.success) {
          setDestinations(res.data.destinations || res.data.data || []);
          setTotalCount(res.data.total || 0);
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
    <div className="min-h-screen bg-black-deep text-slate-100 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-blue-royal/40 to-navy-950 border border-blue-electric/30 backdrop-blur-2xl shadow-glass-panel relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-electric/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-royal/40 border border-blue-electric/30 text-blue-neon text-[11px] font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5 text-blue-electric" />
              <span>Destination Explorer & Crowd Sensor</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Explore Destinations & Live Crowd Indicators
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Filter through India's spiritual, royal, coastal, and urban gems with live density telemetry and safety indices.
            </p>
          </div>
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
              <label className="text-xs text-slate-300 whitespace-nowrap font-bold">
                Sort By:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass-input text-xs"
              >
                <option value="rating-desc" className="bg-black-midnight text-white">Highest Rated</option>
                <option value="rating-asc" className="bg-black-midnight text-white">Lowest Rated</option>
                <option value="crowd-asc" className="bg-black-midnight text-white">Least Crowded (Low to High)</option>
                <option value="crowd-desc" className="bg-black-midnight text-white">Most Crowded (High to Low)</option>
                <option value="title-asc" className="bg-black-midnight text-white">Alphabetical (A - Z)</option>
              </select>

              <button
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl bg-navy-950/70 hover:bg-blue-royal/40 text-slate-400 hover:text-white border border-blue-electric/25 transition-colors shadow-glass cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* State -> City Cascaded Hierarchy Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Filter by State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="glass-input w-full text-xs"
              >
                <option value="All" className="bg-black-midnight text-white">All States</option>
                {hierarchy.map((item) => (
                  <option key={item.state} value={item.state} className="bg-black-midnight text-white">
                    {item.state} ({item.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Filter by City
              </label>
              <select
                value={selectedCity}
                disabled={selectedState === 'All'}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="glass-input w-full text-xs disabled:opacity-50"
              >
                <option value="All" className="bg-black-midnight text-white">
                  {selectedState === 'All' ? 'Select a State First' : 'All Cities'}
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city} className="bg-black-midnight text-white">
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Crowd Density Level
              </label>
              <select
                value={selectedCrowd}
                onChange={(e) => setSelectedCrowd(e.target.value)}
                className="glass-input w-full text-xs"
              >
                {CROWD_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value} className="bg-black-midnight text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Horizontal Filter Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                    : 'bg-navy-950/60 border border-blue-electric/25 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing <span className="font-bold text-white">{destinations.length}</span> of{' '}
            <span className="font-bold text-white">{totalCount}</span> verified travel destinations across India
          </p>
        </div>

        {/* Destination Cards Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 text-blue-electric animate-spin" />
            <p className="text-xs text-slate-400">Scanning destinations & crowd sensors...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="glass-card p-12 text-center space-y-4">
            <h3 className="text-lg font-bold text-white">No Destinations Match Filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try resetting your state, city, or crowd density filters to discover more places.
            </p>
            <button
              onClick={handleResetFilters}
              className="glass-button-primary text-xs uppercase px-5 py-2.5"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((dest) => (
              <DestinationCard key={dest._id} destination={dest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationsListPage;

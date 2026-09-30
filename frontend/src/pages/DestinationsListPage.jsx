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
  Mountain,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import DestinationCard from '../components/DestinationCard';

const CATEGORY_OPTIONS = [
  'All',
  'Hill Stations',
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
  { label: '🟢 Low Crowd (Peaceful & Open)', value: 'low' },
  { label: '🟡 Moderate Crowd (Normal Flow)', value: 'moderate' },
  { label: '🔴 High Crowd (Peak Congestion)', value: 'high' },
];

const POPULAR_HILL_STATIONS = [
  { label: 'Shimla', query: 'Shimla' },
  { label: 'Manali', query: 'Manali' },
  { label: 'Mussoorie', query: 'Mussoorie' },
  { label: 'Nainital', query: 'Nainital' },
  { label: 'Rishikesh', query: 'Rishikesh' },
  { label: 'Ooty', query: 'Ooty' },
  { label: 'Darjeeling', query: 'Darjeeling' },
  { label: 'Kashmir / Gulmarg', query: 'Kashmir' },
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
        if (res.data?.success) {
          setHierarchy(res.data.data || []);
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
        if (res.data?.success) {
          setDestinations(res.data.destinations || res.data.data || []);
          setTotalCount(res.data.total || (res.data.destinations || res.data.data || []).length);
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

  const handleHillStationClick = (hillStationQuery) => {
    setSearch(hillStationQuery);
    setSelectedState('All');
    setSelectedCity('All');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-sky-50/70 border border-blue-100 shadow-xs relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Destination Explorer & Crowd Sensor</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Explore Destinations & Live Crowd Indicators
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Discover verified hill stations, heritage monuments, sacred temples, and coastal getaways across India with real-time density telemetry and geofencing safety ratings.
            </p>
          </div>
        </div>

        {/* Search & Filter Control Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          {/* Search input + Sort Selector */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by hill station, monument name, state, city, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
                Sort By:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
              >
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="crowd-asc">Least Crowded (Low to High)</option>
                <option value="crowd-desc">Most Crowded (High to Low)</option>
                <option value="title-asc">Alphabetical (A - Z)</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Hill Station Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 mr-1">
              <Mountain className="w-3.5 h-3.5" />
              <span>Hill Stations:</span>
            </span>
            {POPULAR_HILL_STATIONS.map((station) => (
              <button
                key={station.label}
                type="button"
                onClick={() => handleHillStationClick(station.query)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  search.toLowerCase() === station.query.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70'
                }`}
              >
                {station.label}
              </button>
            ))}
          </div>

          {/* State -> City Cascaded Hierarchy Filter + Crowd Density */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Filter by State
              </label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
              >
                <option value="All">All States ({hierarchy.reduce((acc, h) => acc + (h.count || 0), 0)})</option>
                {hierarchy.map((item) => (
                  <option key={item.state} value={item.state}>
                    {item.state} ({item.count})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Filter by City
              </label>
              <select
                value={selectedCity}
                disabled={selectedState === 'All'}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer shadow-inner"
              >
                <option value="All">
                  {selectedState === 'All' ? 'Select a State First' : 'All Cities'}
                </option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Crowd Density Level
              </label>
              <select
                value={selectedCrowd}
                onChange={(e) => setSelectedCrowd(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-inner"
              >
                {CROWD_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Horizontal Filter Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-3 border-t border-slate-100">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Meta */}
        <div className="flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-slate-600">
            Showing <span className="font-extrabold text-slate-900">{destinations.length}</span> of{' '}
            <span className="font-extrabold text-slate-900">{totalCount}</span> verified travel destinations across India
          </p>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Geofenced Safety Sensor Active</span>
          </div>
        </div>

        {/* Destination Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Scanning destinations & live crowd sensors...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <Mountain className="w-12 h-12 text-blue-500 mx-auto opacity-70" />
            <h3 className="text-xl font-extrabold text-slate-900">No Destinations Match Filters</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Try resetting your state, city, category, or crowd density filters to discover more places across India.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Reset All Filters
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
    </div>
  );
};

export default DestinationsListPage;
